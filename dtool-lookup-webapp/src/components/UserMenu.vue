<template>
  <v-menu location="bottom end" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        color="primary"
        class="user-menu-btn"
      >
        <v-icon start>mdi-account-circle</v-icon>
        <span class="d-none d-sm-inline">{{ username || 'User' }}</span>
        <v-icon end>mdi-menu-down</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" rounded="lg">
      <!-- User info header -->
      <div class="pa-4 pb-2">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="40">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
          <div class="ml-3">
            <div class="text-body-1 font-weight-medium">{{ auth.displayName || 'User' }}</div>
            <div class="text-caption text-medium-emphasis">{{ auth.username }}</div>
          </div>
        </div>
      </div>

      <v-divider />

      <v-list density="compact" nav>
        <!-- Copy Token to Clipboard -->
        <v-list-item
          prepend-icon="mdi-content-copy"
          @click="copyTokenToClipboard"
        >
          <v-list-item-title>Copy token to clipboard</v-list-item-title>
        </v-list-item>

        <!-- Server Configuration -->
        <v-list-item
          prepend-icon="mdi-server"
          @click="showServerConfigDialog = true"
        >
          <v-list-item-title>Server configuration</v-list-item-title>
        </v-list-item>

        <!-- Download options (if enabled) -->
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

        <v-divider class="my-1" />

        <!-- Logout -->
        <v-list-item
          prepend-icon="mdi-logout"
          base-color="error"
          @click="logout"
        >
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <!-- Server Configuration Dialog -->
  <v-dialog v-model="showServerConfigDialog" max-width="600">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon color="primary" class="mr-2">mdi-server</v-icon>
        Server Configuration
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- Server URL -->
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-1">Server URL</div>
          <div class="text-body-2 font-weight-medium">{{ lookupUrl || 'Not configured' }}</div>
        </div>

        <!-- Installed plugins -->
        <div>
          <div class="text-caption text-medium-emphasis mb-2">Installed Plugins</div>
          <v-table density="compact" class="rounded-lg">
            <thead>
              <tr>
                <th class="text-left">Plugin</th>
                <th class="text-left">Version</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(version, plugin) in serverVersions" :key="plugin">
                <td class="text-body-2">{{ formatPluginName(plugin as string) }}</td>
                <td class="text-body-2 text-medium-emphasis">{{ version || 'N/A' }}</td>
              </tr>
              <tr v-if="Object.keys(serverVersions).length === 0">
                <td colspan="2" class="text-center text-medium-emphasis">
                  No plugins detected
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="tonal"
          color="primary"
          @click="showServerConfigDialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Info Dialog (legacy) -->
  <v-dialog v-model="infoDialog" max-width="500">
    <v-card rounded="lg">
      <v-card-title>Info</v-card-title>
      <v-card-text v-html="infoContent"></v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="infoDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "@/store";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notifications";

const emit = defineEmits<{
  (e: "logoutAction"): void;
}>();

const store = useStore();
const auth = useAuthStore();
const notifications = useNotificationStore();
const showServerConfigDialog = ref(false);
const infoDialog = ref(false);

// Environment config
const downloadReadmeYaml = process.env.VUE_APP_OFFER_DTOOL_README_YAML_DOWNLOAD === "true";
const downloadReadmeJson = process.env.VUE_APP_OFFER_DTOOL_JSON_DOWNLOAD === "true";
const showInfoMenuEntry = process.env.VUE_APP_SHOW_INFO_MENU_ENTRY === "true";
const infoContent = process.env.VUE_APP_INFO_CONTENT || "Info Content";

// Computed properties - use auth store for username
const username = computed(() => auth.displayName || auth.username);
const serverVersions = computed(() => store.server_versions);
const lookupUrl = computed(() => store.lookup_url);

function formatPluginName(name: string): string {
  // Convert snake_case to Title Case with spaces
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function logout(): void {
  emit("logoutAction");
}

async function copyTokenToClipboard(): Promise<void> {
  if (!auth.token) {
    notifications.error("No token available");
    return;
  }

  try {
    await navigator.clipboard.writeText(auth.token);
    notifications.success("Token copied to clipboard");
  } catch (error) {
    console.error("Failed to copy token:", error);
    notifications.error("Failed to copy token to clipboard");
  }
}

async function downloadFile(fileName: string): Promise<void> {
  const filePath =
    fileName === "dtool.json"
      ? process.env.VUE_APP_DTOOL_JSON_PATH ||
        `data/templates/${fileName}`
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
  }
}
</script>

<style scoped>
.user-menu-btn {
  text-transform: none;
}
</style>
