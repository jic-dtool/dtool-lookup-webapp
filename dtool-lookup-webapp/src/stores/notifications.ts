import { defineStore } from "pinia";
import { ref } from "vue";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  timeout: number;
}

export const useNotificationStore = defineStore("notifications", () => {
  const notifications = ref<Notification[]>([]);
  let nextId = 0;

  function show(
    message: string,
    type: NotificationType = "info",
    timeout: number = 5000,
  ): number {
    const id = nextId++;
    notifications.value.push({ id, message, type, timeout });

    if (timeout > 0) {
      setTimeout(() => {
        remove(id);
      }, timeout);
    }

    return id;
  }

  function success(message: string, timeout: number = 3000): number {
    return show(message, "success", timeout);
  }

  function error(message: string, timeout: number = 6000): number {
    return show(message, "error", timeout);
  }

  function warning(message: string, timeout: number = 5000): number {
    return show(message, "warning", timeout);
  }

  function info(message: string, timeout: number = 4000): number {
    return show(message, "info", timeout);
  }

  function remove(id: number): void {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clear(): void {
    notifications.value = [];
  }

  return {
    notifications,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  };
});
