<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="getColor(notification.type)"
      :timeout="-1"
      location="bottom right"
      class="notification-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon :icon="getIcon(notification.type)" class="mr-2" />
        {{ notification.message }}
      </div>
      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          size="small"
          @click="notificationStore.remove(notification.id)"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotificationStore, type NotificationType } from "@/stores/notifications";

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);

function getColor(type: NotificationType): string {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
    default:
      return "info";
  }
}

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
  bottom: 0;
  right: 0;
  z-index: 9999;
}

.notification-snackbar {
  margin-bottom: 8px;
}
</style>
