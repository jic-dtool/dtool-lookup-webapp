<template>
  <v-list class="dataset-list pa-2" bg-color="transparent">
    <v-list-item
      v-for="(dataset, index) in datasetHits"
      :key="dataset.uri || index"
      :active="selected === index"
      @click="updateSelectedDataset(index)"
      rounded="lg"
      class="dataset-item mb-1"
      :class="{ 'dataset-item--active': selected === index }"
    >
      <template #default>
        <div class="py-2">
          <!-- Headline (dataset name) -->
          <v-list-item-title class="text-body-1 font-weight-medium mb-1">
            {{ dataset.name }}
          </v-list-item-title>

          <!-- Supporting text -->
          <v-list-item-subtitle
            class="text-body-2 text-medium-emphasis d-flex align-center ga-2"
          >
            <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
            {{ dataset.creator_username }}
            <span class="mx-1">·</span>
            <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
            {{ formatDate(dataset.created_at) }}
          </v-list-item-subtitle>

          <!-- UUID (tertiary line) -->
          <div class="text-caption text-disabled mt-1 uuid-text">
            {{ dataset.uuid }}
          </div>

          <!-- Tags -->
          <div
            v-if="dataset.tags && dataset.tags.length"
            class="mt-2 d-flex flex-wrap ga-1"
          >
            <v-chip
              v-for="(tag, tagIndex) in dataset.tags"
              :key="tagIndex"
              size="small"
              variant="tonal"
              color="primary"
              label
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import { formatDate } from "@/utils/dateUtils";
import type { Dataset } from "@/types";

const props = defineProps<{
  datasetHits: Dataset[];
}>();

const emit = defineEmits<{
  (e: "update-dataset"): void;
}>();

const store = useStore();

const selected = computed(() => {
  return store.current_dataset_index;
});

function updateSelectedDataset(index: number): void {
  store.updateCurrentDatasetIndex(index);
  store.updateCurrentDataset(props.datasetHits[index]);
  emit("update-dataset");
}
</script>

<style scoped>
.dataset-list {
  overflow-y: auto;
}

.dataset-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.dataset-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.dataset-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.uuid-text {
  font-family: "Roboto Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
}

.ga-1 {
  gap: 4px;
}

.ga-2 {
  gap: 8px;
}
</style>
