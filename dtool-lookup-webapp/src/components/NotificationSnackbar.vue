<template>
  <div class="notification-container">
    <v-slide-y-reverse-transition group>
      <v-alert
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :icon="getIcon(notification.type)"
        variant="elevated"
        density="comfortable"
        class="notification-alert"
        closable
        @click:close="notificationStore.remove(notification.id)"
      >
        {{ notification.message }}
      </v-alert>
    </v-slide-y-reverse-transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  useNotificationStore,
  type NotificationType,
} from "@/stores/notifications";

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);

function getIcon(type: NotificationType): string {
  switch (type) {
    case "success":
      return "mdi-check-circle";
    case "error":
      return "mdi-alert-circle";
    case "warning":
      return "mdi-alert";
    case "info":
    default:
      return "mdi-information";
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: 420px;
  pointer-events: none;
}

.notification-alert {
  pointer-events: auto;
  width: 100%;
}
</style>
