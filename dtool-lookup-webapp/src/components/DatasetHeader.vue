<template>
  <div v-if="dataset" class="dataset-header">
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
    <div class="d-flex flex-wrap ga-2">
      <v-chip
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-file-multiple"
      >
        {{ numItems }} items
      </v-chip>
      <v-chip
        variant="tonal"
        color="secondary"
        size="small"
        prepend-icon="mdi-harddisk"
      >
        {{ filesize(total_size_in_bytes) }}
      </v-chip>
      <v-chip variant="tonal" size="small" prepend-icon="mdi-calendar-plus">
        Created {{ formatDate(dataset.created_at) }}
      </v-chip>
      <v-chip variant="tonal" size="small" prepend-icon="mdi-calendar-check">
        Frozen {{ formatDate(dataset.frozen_at) }}
      </v-chip>
      <v-chip
        v-if="dataset.uploaded_by"
        variant="tonal"
        color="info"
        size="small"
        prepend-icon="mdi-account-arrow-up"
        :title="'Authenticated identity that registered this dataset'"
      >
        Uploaded by {{ dataset.uploaded_by
        }}<template v-if="dataset.uploaded_at">
          on {{ formatDate(dataset.uploaded_at) }}</template
        >
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { filesize as filesizeLib } from "filesize";
import { useStore } from "@/store";
import { formatDate } from "@/utils/dateUtils";
import type { Dataset, ManifestItem } from "@/types";

const store = useStore();

// Computed properties
const dataset = computed<Dataset | null>(() => {
  return store.current_dataset;
});

const numItems = computed(() => {
  return store.current_dataset_manifest && store.current_dataset_manifest.items
    ? Object.values(store.current_dataset_manifest.items).length
    : 0;
});

const total_size_in_bytes = computed(() => {
  if (
    !store.current_dataset_manifest ||
    !store.current_dataset_manifest.items
  ) {
    return 0;
  }
  let total = 0;
  Object.values(
    store.current_dataset_manifest.items as Record<string, ManifestItem>,
  ).forEach((item: ManifestItem) => {
    total = total + item.size_in_bytes;
  });
  return total;
});

// Helper functions
function filesize(bytes: number): string {
  return filesizeLib(bytes) as string;
}
</script>

<style scoped>
.dataset-header {
  /* Parent container handles padding */
}

.ga-2 {
  gap: 8px;
}
</style>
