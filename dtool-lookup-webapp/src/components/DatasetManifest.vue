<template>
  <div v-if="manifest" class="manifest-section">
    <!-- Items per page selector and info -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-body-2 text-medium-emphasis">
        Showing {{ displayStart }}-{{ displayEnd }} of {{ numItems }} items
      </div>
      <v-select
        v-model="itemsPerPage"
        :items="perPageOptions"
        density="compact"
        variant="outlined"
        hide-details
        class="items-per-page-select"
        style="max-width: 120px;"
      />
    </div>

    <!-- Items List -->
    <v-list
      v-if="manifest.items && numItems > 0"
      class="manifest-list"
      bg-color="transparent"
    >
      <v-list-item
        v-for="[id, item] in paginatedItems"
        :key="id"
        rounded="lg"
        class="manifest-item mb-1"
        @mouseenter="update_fetch_identifier(id)"
      >
        <template #prepend>
          <v-avatar size="32" color="grey-lighten-3" rounded="lg" class="mr-3">
            <v-icon size="16" color="grey-darken-1">{{ getFileIcon(item.relpath) }}</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-body-2 font-weight-medium">
          {{ item.relpath }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption text-medium-emphasis">
          {{ filesize(item.size_in_bytes) }}
        </v-list-item-subtitle>
        <template #append>
          <!-- Direct download button when signed URL plugin is available -->
          <v-btn
            v-if="hasSignedUrlPlugin"
            size="small"
            variant="tonal"
            color="primary"
            icon="mdi-download"
            :loading="downloadingItems[id]"
            @click="downloadItem(id, item.relpath)"
          />
          <!-- Fallback to dtool command menu when plugin not available -->
          <v-menu v-else location="start" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="tonal"
                color="primary"
                icon="mdi-download"
              />
            </template>
            <v-card min-width="440" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Fetch this item to get an absolute path on disk:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  :model-value="fetch_command"
                  readonly
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  bg-color="grey-lighten-4"
                >
                  <template #append-inner>
                    <v-btn
                      icon="mdi-content-copy"
                      size="small"
                      variant="text"
                      @click="copyToClipboard(fetch_command)"
                    />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>

    <!-- Empty state -->
    <div v-if="numItems === 0" class="text-center py-8 text-medium-emphasis">
      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-file-tree</v-icon>
      <p class="text-body-2">No items in this dataset</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="5"
        density="compact"
        rounded
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import { filesize as filesizeLib } from "filesize";
import { useStore } from "@/store";
import { dserverApi } from "@/services/dserverApi";
import type { Manifest, ManifestItem } from "@/types";

interface FileIconMap {
  [key: string]: string;
}

const store = useStore();
const fetch_identifier = ref<string | null>(null);
const downloadingItems = reactive<Record<string, boolean>>({});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(20);
const perPageOptions = [10, 20, 50, 100];

const manifest = computed<Manifest | null>(() => {
  return store.current_dataset_manifest;
});

const numItems = computed(() => {
  return manifest.value && manifest.value.items
    ? Object.values(manifest.value.items).length
    : 0;
});

// Get all items as array of [id, item] tuples for easier pagination
const allItems = computed<[string, ManifestItem][]>(() => {
  if (!manifest.value || !manifest.value.items) return [];
  return Object.entries(manifest.value.items);
});

// Calculate pagination
const totalPages = computed(() => {
  return Math.ceil(numItems.value / itemsPerPage.value);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, numItems.value);
});

const displayStart = computed(() => {
  return numItems.value > 0 ? startIndex.value + 1 : 0;
});

const displayEnd = computed(() => {
  return endIndex.value;
});

const paginatedItems = computed<[string, ManifestItem][]>(() => {
  return allItems.value.slice(startIndex.value, endIndex.value);
});

// Reset page when dataset changes
watch(() => store.current_dataset?.uri, () => {
  currentPage.value = 1;
});

// Reset page when items per page changes
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

const fetch_command = computed(() => {
  if (!store.current_dataset) return "";
  return (
    "dtool item fetch " +
    store.current_dataset.uri +
    " " +
    fetch_identifier.value
  );
});

const hasSignedUrlPlugin = computed(() => {
  const versions = store.server_versions;
  return versions && "dserver_signed_url_plugin" in versions;
});

function filesize(bytes: number): string {
  return filesizeLib(bytes) as string;
}

function update_fetch_identifier(identifier: string): void {
  fetch_identifier.value = identifier;
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const iconMap: FileIconMap = {
    // Images
    png: "mdi-file-image",
    jpg: "mdi-file-image",
    jpeg: "mdi-file-image",
    gif: "mdi-file-image",
    svg: "mdi-file-image",
    webp: "mdi-file-image",
    // Documents
    pdf: "mdi-file-pdf-box",
    doc: "mdi-file-word",
    docx: "mdi-file-word",
    xls: "mdi-file-excel",
    xlsx: "mdi-file-excel",
    ppt: "mdi-file-powerpoint",
    pptx: "mdi-file-powerpoint",
    // Code
    py: "mdi-language-python",
    js: "mdi-language-javascript",
    ts: "mdi-language-typescript",
    html: "mdi-language-html5",
    css: "mdi-language-css3",
    json: "mdi-code-json",
    xml: "mdi-file-xml-box",
    yaml: "mdi-file-code",
    yml: "mdi-file-code",
    // Data
    csv: "mdi-file-delimited",
    txt: "mdi-file-document",
    md: "mdi-language-markdown",
    // Archives
    zip: "mdi-folder-zip",
    tar: "mdi-folder-zip",
    gz: "mdi-folder-zip",
    rar: "mdi-folder-zip",
    "7z": "mdi-folder-zip",
    // Scientific
    hdf5: "mdi-database",
    h5: "mdi-database",
    nc: "mdi-database",
    npy: "mdi-database",
    npz: "mdi-database",
  };
  return iconMap[ext] || "mdi-file";
}

async function downloadItem(identifier: string, relpath: string): Promise<void> {
  const uri = store.current_dataset?.uri;
  if (!uri) return;

  downloadingItems[identifier] = true;
  try {
    // Get signed URL for the item
    const response = await dserverApi.getItemSignedUrl(uri, identifier);
    const signedUrl = response.url;

    // Fetch the item content from the signed URL
    const itemResponse = await fetch(signedUrl);
    if (!itemResponse.ok) {
      throw new Error(`Failed to download item: ${itemResponse.statusText}`);
    }

    // Get the blob and create download link
    const blob = await itemResponse.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    // Extract filename from relpath
    const filename = relpath.split("/").pop() || relpath;

    // Create and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Failed to download item:", err);
  } finally {
    downloadingItems[identifier] = false;
  }
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}
</script>

<style scoped>
.manifest-section {
  /* Parent container handles spacing */
}

.manifest-list {
  max-height: calc(100vh - 450px);
  min-height: 200px;
  overflow-y: auto;
}

.manifest-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.manifest-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.items-per-page-select :deep(.v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
