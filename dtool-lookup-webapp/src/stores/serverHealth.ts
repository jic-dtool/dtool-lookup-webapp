/**
 * Server Health Store
 *
 * Manages server health status with periodic polling.
 * Used to display server unavailability errors.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { serverUrl as configuredServerUrl } from "@/config";

export type ServerStatus =
  | "unknown" // Initial state
  | "healthy" // Server is responding
  | "unhealthy" // Server is not responding
  | "checking"; // Currently checking

export interface ServerHealthInfo {
  status: ServerStatus;
  lastCheckedAt: number | null;
  lastHealthyAt: number | null;
  errorMessage: string | null;
  consecutiveFailures: number;
}

const DEFAULT_POLL_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 second timeout for health checks

export const useServerHealthStore = defineStore("serverHealth", () => {
  // State
  const status = ref<ServerStatus>("unknown");
  const lastCheckedAt = ref<number | null>(null);
  const lastHealthyAt = ref<number | null>(null);
  const errorMessage = ref<string | null>(null);
  const consecutiveFailures = ref(0);
  const pollIntervalId = ref<ReturnType<typeof setInterval> | null>(null);
  const serverUrl = ref<string>(configuredServerUrl);

  // Computed
  const isHealthy = computed(() => status.value === "healthy");
  const isUnhealthy = computed(() => status.value === "unhealthy");
  const isChecking = computed(() => status.value === "checking");

  const healthCheckUrl = computed(() => `${serverUrl.value}/config/health`);

  const timeSinceLastHealthy = computed(() => {
    if (!lastHealthyAt.value) return null;
    return Date.now() - lastHealthyAt.value;
  });

  // Actions

  /**
   * Check server health by calling the health endpoint
   */
  async function checkHealth(): Promise<boolean> {
    status.value = "checking";

    try {
      const response = await axios.get(healthCheckUrl.value, {
        timeout: HEALTH_CHECK_TIMEOUT,
      });

      if (response.status === 200) {
        status.value = "healthy";
        lastHealthyAt.value = Date.now();
        errorMessage.value = null;
        consecutiveFailures.value = 0;
        lastCheckedAt.value = Date.now();
        return true;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (e) {
      const err = e as { message?: string; code?: string };
      status.value = "unhealthy";
      consecutiveFailures.value++;
      lastCheckedAt.value = Date.now();

      if (err.code === "ECONNABORTED") {
        errorMessage.value =
          "Server health check timed out. The server may be overloaded or unreachable.";
      } else if (
        err.code === "ERR_NETWORK" ||
        err.message?.includes("Network Error")
      ) {
        errorMessage.value =
          "Unable to connect to the server. Please check your network connection or try again later.";
      } else {
        errorMessage.value = `Server health check failed: ${err.message || "Unknown error"}`;
      }

      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  function startPolling(
    interval: number = DEFAULT_POLL_INTERVAL,
    immediate = true,
  ): void {
    // Stop any existing polling
    stopPolling();

    // Do an immediate check
    if (immediate) {
      checkHealth();
    }

    // Start periodic polling
    pollIntervalId.value = setInterval(() => {
      checkHealth();
    }, interval);
  }

  /**
   * Stop periodic health checks
   */
  function stopPolling(): void {
    if (pollIntervalId.value) {
      clearInterval(pollIntervalId.value);
      pollIntervalId.value = null;
    }
  }

  /**
   * Reset health state
   */
  function reset(): void {
    stopPolling();
    status.value = "unknown";
    lastCheckedAt.value = null;
    lastHealthyAt.value = null;
    errorMessage.value = null;
    consecutiveFailures.value = 0;
  }

  /**
   * Initialize the store
   */
  async function initialize(): Promise<boolean> {
    const healthy = await checkHealth();
    // Poll regardless of the first result: polling is most useful while the
    // server is unhealthy, so recovery is detected without a manual retry.
    startPolling(DEFAULT_POLL_INTERVAL, false);
    return healthy;
  }

  return {
    // State
    status,
    lastCheckedAt,
    lastHealthyAt,
    errorMessage,
    consecutiveFailures,
    serverUrl,
    // Computed
    isHealthy,
    isUnhealthy,
    isChecking,
    healthCheckUrl,
    timeSinceLastHealthy,
    // Actions
    checkHealth,
    startPolling,
    stopPolling,
    reset,
    initialize,
  };
});
