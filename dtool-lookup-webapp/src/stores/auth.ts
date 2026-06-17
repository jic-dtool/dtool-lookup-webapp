/**
 * Authentication Store
 *
 * Manages JWT token, user state, and authentication flow.
 * Persisted to localStorage for session continuity.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { dserverApi } from "@/services/dserverApi";
import { decodeJwt } from "@/utils/jwtUtils";
import { useNotificationStore } from "@/stores/notifications";
import { tokenGeneratorUrl, authLogoutUrl, authEnabled } from "@/config";

export type AuthStatus =
  | "idle" // Initial state, checking for existing session
  | "authenticated" // Successfully authenticated and authorized
  | "unauthenticated" // No token or token expired
  | "unauthorized" // Token valid but user not authorized (not in dserver database)
  | "error"; // Authentication error

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    // State
    const token = ref<string | null>(null);
    const username = ref<string | null>(null);
    const displayName = ref<string | null>(null);
    const provider = ref<string | null>(null);
    const isAdmin = ref<boolean>(false);
    const searchPermissions = ref<string[]>([]);
    const registerPermissions = ref<string[]>([]);
    const status = ref<AuthStatus>("idle");
    const error = ref<AuthError | null>(null);

    // Timer that logs the user out when the token expires mid-session.
    let expiryTimerId: ReturnType<typeof setTimeout> | null = null;

    // Computed
    const isAuthenticated = computed(() => status.value === "authenticated");
    const isLoading = computed(() => status.value === "idle");
    const hasError = computed(
      () => status.value === "error" || status.value === "unauthorized",
    );

    const tokenExpiry = computed(() => {
      if (!token.value) return null;
      try {
        const payload = decodeJwt(token.value);
        return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
      } catch {
        return null;
      }
    });

    const isTokenExpired = computed(() => {
      if (!tokenExpiry.value) return true;
      return Date.now() > tokenExpiry.value;
    });

    // Actions

    /**
     * Set token and extract user info from JWT payload
     */
    function setToken(newToken: string): void {
      token.value = newToken;
      try {
        const payload = decodeJwt(newToken);
        username.value = payload.sub || null;
        displayName.value =
          (payload.display_name as string) || (payload.name as string) || null;
        provider.value = (payload.provider as string) || null;
      } catch (e) {
        console.error("Failed to decode JWT:", e);
        username.value = null;
        displayName.value = null;
        provider.value = null;
      }
    }

    /**
     * Login with a token (e.g., from OAuth2 callback)
     * Verifies the token works by making an API call
     */
    async function login(newToken: string): Promise<boolean> {
      if (!authEnabled) {
        status.value = "authenticated";
        return true;
      }
      status.value = "idle";
      error.value = null;

      try {
        setToken(newToken);
        dserverApi.setToken(newToken);

        // Verify the token works and get user info including admin status
        // This will fail with 401 if user is not registered in dserver
        const userInfo = await dserverApi.getCurrentUser();

        // Set admin status and permissions from server response
        isAdmin.value = userInfo.is_admin || false;
        searchPermissions.value =
          userInfo.search_permissions_on_base_uris || [];
        registerPermissions.value =
          userInfo.register_permissions_on_base_uris || [];

        status.value = "authenticated";
        scheduleExpiryLogout();
        return true;
      } catch (e) {
        const err = e as { status?: number; name?: string; message?: string };
        const statusCode = err.status;
        const isAuthError =
          statusCode === 401 || err.name === "AuthenticationError";
        const isAuthzError =
          statusCode === 403 || err.name === "AuthorizationError";

        if (isAuthError || isAuthzError) {
          // User authenticated via OAuth2 but not authorized in dserver
          // Show this as an error on the login page
          status.value = "unauthorized";
          error.value = {
            code: "USER_NOT_REGISTERED",
            message: "User not registered",
            details: `Your account (${username.value}) authenticated successfully via ${provider.value || "OAuth2"}, but is not registered in the dserver database. Please contact an administrator to register your account.`,
          };
          // The token was rejected by the server; discard it.
          clearAuth();
        } else {
          // Transient failure (network blip, timeout, 5xx): keep the
          // persisted token so a retry or reload can restore the session.
          status.value = "unauthenticated";

          // Get a user-friendly error message
          const errorMessage = getReadableErrorMessage(err);
          const notifications = useNotificationStore();
          notifications.error(errorMessage, 8000);
        }

        return false;
      }
    }

    /**
     * Schedule an automatic logout when the current token expires.
     */
    function scheduleExpiryLogout(): void {
      if (expiryTimerId) {
        clearTimeout(expiryTimerId);
        expiryTimerId = null;
      }
      if (!tokenExpiry.value) return;
      const msLeft = tokenExpiry.value - Date.now();
      // setTimeout overflows beyond ~24.8 days; such tokens effectively
      // never expire within a browser session.
      if (msLeft <= 0 || msLeft > 0x7fffffff) return;
      expiryTimerId = setTimeout(() => {
        const notifications = useNotificationStore();
        notifications.error(
          "Your session has expired. Please sign in again.",
          8000,
        );
        logout();
      }, msLeft);
    }

    /**
     * Convert technical error messages to user-friendly ones
     */
    function getReadableErrorMessage(err: {
      status?: number;
      name?: string;
      message?: string;
    }): string {
      const message = err.message || "";

      // Handle common technical errors
      if (message.includes("body stream already read")) {
        return "Unable to verify authentication. Please try logging in again.";
      }
      if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError")
      ) {
        return "Network error. Please check your connection and try again.";
      }
      if (message.includes("timeout") || message.includes("Timeout")) {
        return "Server took too long to respond. Please try again.";
      }
      if (err.status === 500 || message.includes("Internal Server Error")) {
        return "Server error. Please try again later or contact an administrator.";
      }
      if (err.status === 503 || message.includes("Service Unavailable")) {
        return "Server is temporarily unavailable. Please try again later.";
      }

      // For other errors, provide a generic message
      if (message && !message.includes("undefined") && message.length < 200) {
        return `Authentication error: ${message}`;
      }

      return "An unexpected error occurred during authentication. Please try again.";
    }

    /**
     * Logout and clear all auth state.
     *
     * Also terminates the server-side OAuth2 session; otherwise the next
     * page load would silently re-authenticate via GET /auth/token.
     */
    async function logout(): Promise<void> {
      if (!authEnabled) return;
      clearAuth();
      status.value = "unauthenticated";
      error.value = null;
      try {
        await axios.post(authLogoutUrl, null, {
          withCredentials: true,
          headers: { Accept: "application/json" },
        });
      } catch {
        // Best effort: the local session is already cleared.
      }
    }

    /**
     * Clear auth state without changing status
     */
    function clearAuth(): void {
      if (expiryTimerId) {
        clearTimeout(expiryTimerId);
        expiryTimerId = null;
      }
      token.value = null;
      username.value = null;
      displayName.value = null;
      provider.value = null;
      isAdmin.value = false;
      searchPermissions.value = [];
      registerPermissions.value = [];
    }

    /**
     * Clear any error state
     */
    function clearError(): void {
      error.value = null;
      if (status.value === "error" || status.value === "unauthorized") {
        status.value = "unauthenticated";
      }
    }

    /**
     * Check if existing token is still valid
     * Called on app startup to restore session
     */
    async function checkAuth(): Promise<boolean> {
      if (!authEnabled) {
        status.value = "authenticated";
        return true;
      }
      if (!token.value) {
        status.value = "unauthenticated";
        return false;
      }

      // Check if token is expired
      if (isTokenExpired.value) {
        logout();
        return false;
      }

      // Try to use the existing token
      return await login(token.value);
    }

    /**
     * Fetch the JWT for the current server-side OAuth2 session, if any.
     *
     * In cookie-only delivery mode (OAUTH2_DELIVER_TOKEN_IN_FRAGMENT=
     * false) the token never appears in any URL: the OAuth2 callback
     * stores it in the server-side session and the webapp retrieves it
     * here, authenticated by the session cookie. Requires the auth
     * endpoints to be same-origin (or CORS-enabled with credentials).
     */
    async function fetchSessionToken(): Promise<string | null> {
      try {
        const response = await axios.get<{ token?: unknown }>(
          tokenGeneratorUrl,
          {
            withCredentials: true,
            headers: { Accept: "application/json" },
          },
        );
        const fetched = response.data?.token;
        if (typeof fetched !== "string" || !fetched) return null;
        // Ignore tokens from sessions that outlived the JWT expiry.
        const payload = decodeJwt(fetched);
        if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
        return fetched;
      } catch {
        // 401 (no session), malformed token or network failure: no
        // session token available.
        return null;
      }
    }

    /**
     * Initialize the store - check for a token from the OAuth2 callback
     * or a persisted session.
     *
     * The OAuth2 plugin delivers the token either in the URL fragment
     * (default; supports cross-origin webapps, never sent to servers) or
     * server-side only (cookie-only mode, OAUTH2_DELIVER_TOKEN_IN_
     * FRAGMENT=false), where it is fetched from GET /auth/token using
     * the session cookie. Either way the token never rides in a query
     * parameter, so it cannot leak into browser history or server logs.
     */
    async function initialize(): Promise<void> {
      if (!authEnabled) {
        // No-auth mode: bring the API client up with no Authorization header
        // and report the session as authenticated so the app skips the SignIn guard.
        dserverApi.setToken("");
        status.value = "authenticated";
        return;
      }

      // Check for token in the URL fragment (OAuth2 callback, fragment
      // delivery mode).
      const fragmentParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const tokenParam = fragmentParams.get("token");

      if (tokenParam) {
        // Clean up URL (drops both fragment and any query string)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        await login(tokenParam);
        return;
      }

      // Check for a server-side OAuth2 session (cookie-only delivery
      // mode). Checked before the persisted token so that a fresh login
      // always wins over a stale persisted session.
      const sessionToken = await fetchSessionToken();
      if (sessionToken) {
        await login(sessionToken);
        return;
      }

      // Check existing persisted token
      if (token.value) {
        await checkAuth();
        return;
      }

      // No token found
      status.value = "unauthenticated";
    }

    return {
      // State
      token,
      username,
      displayName,
      provider,
      isAdmin,
      searchPermissions,
      registerPermissions,
      status,
      error,
      // Computed
      isAuthenticated,
      isLoading,
      hasError,
      tokenExpiry,
      isTokenExpired,
      // Actions
      setToken,
      login,
      logout,
      clearAuth,
      clearError,
      checkAuth,
      initialize,
    };
  },
  {
    persist: {
      key: "dtool-auth",
      paths: [
        "token",
        "username",
        "displayName",
        "provider",
        "isAdmin",
        "searchPermissions",
        "registerPermissions",
      ],
    },
  },
);
