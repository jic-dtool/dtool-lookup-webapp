/**
 * Authentication Store
 *
 * Manages JWT token, user state, and authentication flow.
 * Persisted to localStorage for session continuity.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { dserverApi } from "@/services/dserverApi";
import { decodeJwt } from "@/utils/jwtUtils";
import { useNotificationStore } from "@/stores/notifications";

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
    const lastVerifiedAt = ref<number | null>(null);

    // Computed
    const isAuthenticated = computed(() => status.value === "authenticated");
    const isLoading = computed(() => status.value === "idle");
    const hasError = computed(() => status.value === "error" || status.value === "unauthorized");

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
        displayName.value = (payload.display_name as string) || (payload.name as string) || null;
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
        searchPermissions.value = userInfo.search_permissions_on_base_uris || [];
        registerPermissions.value = userInfo.register_permissions_on_base_uris || [];

        status.value = "authenticated";
        lastVerifiedAt.value = Date.now();
        return true;
      } catch (e) {
        const err = e as { status?: number; name?: string; message?: string };
        const statusCode = err.status;
        const isAuthError = statusCode === 401 || err.name === "AuthenticationError";
        const isAuthzError = statusCode === 403 || err.name === "AuthorizationError";

        if (isAuthError || isAuthzError) {
          // User authenticated via OAuth2 but not authorized in dserver
          // Show this as an error on the login page
          status.value = "unauthorized";
          error.value = {
            code: "USER_NOT_REGISTERED",
            message: "User not registered",
            details: `Your account (${username.value}) authenticated successfully via ${provider.value || "OAuth2"}, but is not registered in the dserver database. Please contact an administrator to register your account.`,
          };
        } else {
          // For other errors, use the notification system
          status.value = "unauthenticated";

          // Get a user-friendly error message
          const errorMessage = getReadableErrorMessage(err);
          const notifications = useNotificationStore();
          notifications.error(errorMessage, 8000);
        }

        // Clear token on auth failure
        clearAuth();
        return false;
      }
    }

    /**
     * Convert technical error messages to user-friendly ones
     */
    function getReadableErrorMessage(err: { status?: number; name?: string; message?: string }): string {
      const message = err.message || "";

      // Handle common technical errors
      if (message.includes("body stream already read")) {
        return "Unable to verify authentication. Please try logging in again.";
      }
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
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
     * Logout and clear all auth state
     */
    function logout(): void {
      clearAuth();
      status.value = "unauthenticated";
      error.value = null;
    }

    /**
     * Clear auth state without changing status
     */
    function clearAuth(): void {
      token.value = null;
      username.value = null;
      displayName.value = null;
      provider.value = null;
      isAdmin.value = false;
      searchPermissions.value = [];
      registerPermissions.value = [];
      lastVerifiedAt.value = null;
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
     * Initialize the store - check for existing token from URL or cookies
     */
    async function initialize(): Promise<void> {
      // Check for token in URL (OAuth2 callback)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get("token");

      if (tokenParam) {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        await login(tokenParam);
        return;
      }

      // Check for token in cookie
      const cookieToken = getCookie("dserver_token");
      if (cookieToken) {
        await login(cookieToken);
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
      lastVerifiedAt,
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
      paths: ["token", "username", "displayName", "provider", "isAdmin", "searchPermissions", "registerPermissions", "lastVerifiedAt"],
    },
  }
);

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}
