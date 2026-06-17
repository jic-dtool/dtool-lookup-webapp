import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/services/dserverApi", () => ({
  dserverApi: {
    setToken: vi.fn(),
    searchDatasets: vi.fn(),
  },
}));

describe("Auth store — auth disabled", () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
  });

  it("initialize() reports authenticated without any network call", async () => {
    vi.doMock("@/config", () => ({ authEnabled: false }));
    const { useAuthStore } = await import("@/stores/auth");
    const { dserverApi } = await import("@/services/dserverApi");

    const auth = useAuthStore();
    await auth.initialize();

    expect(auth.status).toBe("authenticated");
    expect(auth.isAuthenticated).toBe(true);
    expect(dserverApi.setToken).toHaveBeenCalledWith("");
    expect(dserverApi.searchDatasets).not.toHaveBeenCalled();
  });

  it("logout() is a no-op when auth is disabled", async () => {
    vi.doMock("@/config", () => ({ authEnabled: false }));
    const { useAuthStore } = await import("@/stores/auth");

    const auth = useAuthStore();
    await auth.initialize();
    auth.logout();

    expect(auth.status).toBe("authenticated");
    expect(auth.isAuthenticated).toBe(true);
  });

  it("login() short-circuits to true without verifying", async () => {
    vi.doMock("@/config", () => ({ authEnabled: false }));
    const { useAuthStore } = await import("@/stores/auth");
    const { dserverApi } = await import("@/services/dserverApi");

    const auth = useAuthStore();
    const ok = await auth.login("anything");

    expect(ok).toBe(true);
    expect(auth.status).toBe("authenticated");
    expect(dserverApi.searchDatasets).not.toHaveBeenCalled();
  });
});
