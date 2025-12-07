<template>
  <div v-if="dataset" class="dataset-summary">
    <!-- Header Card -->
    <v-card variant="flat" class="mb-4">
      <v-card-item>
        <template #prepend>
          <v-avatar color="primary" variant="tonal" size="48" rounded="lg">
            <v-icon size="24">mdi-database</v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-h6 font-weight-medium">
          {{ dataset.name }}
        </v-card-title>
        <v-card-subtitle class="text-body-2">
          <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
          {{ dataset.creator_username }}
        </v-card-subtitle>
      </v-card-item>
    </v-card>

    <!-- Metadata Chips -->
    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-chip variant="tonal" color="primary" size="small" prepend-icon="mdi-file-multiple">
        {{ numItems }} items
      </v-chip>
      <v-chip variant="tonal" color="secondary" size="small" prepend-icon="mdi-harddisk">
        {{ filesize(total_size_in_bytes) }}
      </v-chip>
      <v-chip variant="tonal" size="small" prepend-icon="mdi-calendar-plus">
        Created {{ moment(dataset.created_at * 1000).format("MMM D, YYYY") }}
      </v-chip>
      <v-chip variant="tonal" size="small" prepend-icon="mdi-calendar-check">
        Frozen {{ moment(dataset.frozen_at * 1000).format("MMM D, YYYY") }}
      </v-chip>
    </div>

    <!-- URI Section -->
    <v-card variant="outlined" class="mb-4" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-link-variant</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium">URI</v-card-title>
        <template #append>
          <v-menu location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="small" variant="tonal" color="primary" prepend-icon="mdi-content-copy">
                Copy
              </v-btn>
            </template>
            <v-card min-width="360" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Copy this dataset to your working directory:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  :model-value="copy_command"
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
                      @click="copyToClipboard(copy_command)"
                    />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-card-item>
      <v-card-text class="pt-0">
        <code class="uri-text text-body-2">{{ displayUri }}</code>
      </v-card-text>
    </v-card>

    <!-- Tags Section -->
    <v-card variant="outlined" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-tag-multiple</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium">Tags</v-card-title>
        <template #append>
          <v-menu location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="small" variant="tonal" color="primary" prepend-icon="mdi-tag-plus">
                Add Tag
              </v-btn>
            </template>
            <v-card min-width="400" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Add a tag to this dataset:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  v-model="tag_name"
                  label="Tag name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  class="mb-3"
                />
                <v-text-field
                  :model-value="tag_command"
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
                      @click="copyToClipboard(tag_command)"
                    />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-card-item>
      <v-card-text class="pt-0">
        <div v-if="currentTags.length > 0" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="(tag, index) in currentTags"
            :key="index"
            variant="tonal"
            color="primary"
            size="small"
            label
          >
            {{ tag }}
          </v-chip>
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          No tags yet. Add tags to organize your datasets.
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { filesize as filesizeLib } from "filesize";
import moment from "moment";
import { useStore } from "@/store";
import type { Dataset, ManifestItem } from "@/types";

const store = useStore();
const tag_name = ref<string | null>(null);

const dataset = computed<Dataset | null>(() => {
  return store.state.current_dataset;
});

const hasSignedUrlPlugin = computed(() => {
  // Check if dserver-signed-url-plugin is installed
  const versions = store.state.server_versions;
  return !!(versions && versions.dserver_signed_url_plugin);
});

const displayUri = computed(() => {
  // Show dserver:// URI if signed-url-plugin is present, otherwise show backend URI
  if (!dataset.value) return "";
  if (hasSignedUrlPlugin.value) {
    // Construct dserver:// URI using the server URL and dataset UUID
    const lookupUrl = store.state.lookup_url;
    if (lookupUrl) {
      // Extract hostname from the lookup URL
      try {
        const url = new URL(lookupUrl);
        return `dserver://${url.host}/${dataset.value.uuid}`;
      } catch {
        // Fallback to backend URI if URL parsing fails
        return dataset.value.uri;
      }
    }
  }
  return dataset.value.uri;
});

const numItems = computed(() => {
  return store.state.current_dataset_manifest &&
    store.state.current_dataset_manifest.items
    ? Object.values(store.state.current_dataset_manifest.items).length
    : 0;
});

const total_size_in_bytes = computed(() => {
  if (
    !store.state.current_dataset_manifest ||
    !store.state.current_dataset_manifest.items
  ) {
    return 0;
  }
  let total = 0;
  Object.values(
    store.state.current_dataset_manifest.items as Record<
      string,
      ManifestItem
    >
  ).forEach((item: ManifestItem) => {
    total = total + item.size_in_bytes;
  });
  return total;
});

const copy_command = computed(() => {
  if (!dataset.value) return "";
  return "dtool cp " + displayUri.value + " .";
});

const tag_command = computed(() => {
  if (!dataset.value) return "";
  return "dtool tag set " + displayUri.value + " " + tag_name.value;
});

const currentTags = computed<string[]>(() => {
  if (
    store.state.current_dataset_tags &&
    store.state.current_dataset_tags.tags
  ) {
    return store.state.current_dataset_tags.tags;
  }
  return [];
});

function filesize(bytes: number): string {
  return filesizeLib(bytes) as string;
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
.dataset-summary {
  /* Parent container handles padding */
}

.uri-text {
  font-family: "Roboto Mono", monospace;
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  padding: 8px 12px;
  border-radius: 8px;
  display: block;
  word-break: break-all;
}

.ga-2 {
  gap: 8px;
}
</style>
