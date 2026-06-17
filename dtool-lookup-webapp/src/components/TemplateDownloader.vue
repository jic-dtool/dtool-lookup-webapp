<template>
  <!-- Simple logout button if no download options -->
  <v-btn
    v-if="!downloadReadmeYaml && !downloadReadmeJson && !showInfoMenuEntry"
    variant="outlined"
    color="error"
    @click="logout"
  >
    Logout
  </v-btn>

  <!-- Account menu with options -->
  <v-menu v-else location="bottom end">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" append-icon="mdi-menu-down">
        Account
      </v-btn>
    </template>

    <v-list density="compact">
      <v-list-item
        v-if="downloadReadmeYaml"
        prepend-icon="mdi-download"
        @click="downloadFile('dtool_readme.yml')"
      >
        <v-list-item-title>Download dtool_readme.yml</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="downloadReadmeJson"
        prepend-icon="mdi-download"
        @click="downloadFile('dtool.json')"
      >
        <v-list-item-title>Download dtool.json</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="showInfoMenuEntry"
        prepend-icon="mdi-information"
        @click="infoDialog = true"
      >
        <v-list-item-title>Info</v-list-item-title>
      </v-list-item>

      <v-divider
        v-if="downloadReadmeYaml || downloadReadmeJson || showInfoMenuEntry"
      />

      <v-list-item prepend-icon="mdi-logout" @click="logout">
        <v-list-item-title class="text-error">Logout</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Info Dialog -->
  <v-dialog v-model="infoDialog" max-width="500">
    <v-card>
      <v-card-title>Info</v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html -- operator-controlled build-time content -->
        <div v-html="infoContent"></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="infoDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notifications";

const emit = defineEmits<{
  (e: "logoutAction"): void;
}>();

const notifications = useNotificationStore();

const infoDialog = ref(false);
const downloadReadmeYaml =
  process.env.VUE_APP_OFFER_DTOOL_README_YAML_DOWNLOAD === "true";
const downloadReadmeJson =
  process.env.VUE_APP_OFFER_DTOOL_JSON_DOWNLOAD === "true";
const showInfoMenuEntry = process.env.VUE_APP_SHOW_INFO_MENU_ENTRY === "true";
const infoContent = process.env.VUE_APP_INFO_CONTENT || "Info Content";

function logout(): void {
  emit("logoutAction");
}

async function downloadFile(fileName: string): Promise<void> {
  const filePath =
    fileName === "dtool.json"
      ? process.env.VUE_APP_DTOOL_JSON_PATH || `data/templates/${fileName}`
      : process.env.VUE_APP_DTOOL_README_YAML_PATH ||
        `data/templates/${fileName}`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Network response was not ok");

    const text = await response.text();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to download file:", error);
    notifications.error(
      `Failed to download template "${fileName}". Please try again.`,
    );
  }
}
</script>
