<template>
  <div v-if="manifest" class="manifest-section">
    <v-expansion-panels variant="accordion">
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title class="manifest-panel-title">
          <template #default>
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-file-tree</v-icon>
              <span class="text-body-2 font-weight-medium">Items</span>
              <v-chip size="x-small" variant="tonal" color="primary" class="ml-2">
                {{ numItems }}
              </v-chip>
            </div>
          </template>
          <template #actions="{ expanded }">
            <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list
            v-if="manifest.items"
            class="manifest-list"
            bg-color="transparent"
          >
            <v-list-item
              v-for="(item, id) in manifest.items"
              :key="id"
              rounded="lg"
              class="manifest-item mb-1"
              @mouseenter="update_fetch_identifier(id as string)"
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
                <v-menu location="start" :close-on-content-click="false">
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
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { filesize as filesizeLib } from "filesize";
import { useStore } from "@/store";
import type { Manifest } from "@/types";

interface FileIconMap {
  [key: string]: string;
}

const store = useStore();
const fetch_identifier = ref<string | null>(null);

const manifest = computed<Manifest | null>(() => {
  return store.current_dataset_manifest;
});

const numItems = computed(() => {
  return manifest.value && manifest.value.items
    ? Object.values(manifest.value.items).length
    : 0;
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

.manifest-panel-title {
  min-height: 48px;
}

.manifest-list {
  max-height: 350px;
  overflow-y: auto;
  margin: -12px -16px;
  padding: 8px;
}

.manifest-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.manifest-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
