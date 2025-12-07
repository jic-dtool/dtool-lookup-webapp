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
          <v-list-item-subtitle class="text-body-2 text-medium-emphasis d-flex align-center ga-2">
            <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
            {{ dataset.creator_username }}
            <span class="mx-1">·</span>
            <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
            {{ moment(dataset.created_at * 1000).format("MMM D, YYYY") }}
          </v-list-item-subtitle>

          <!-- UUID (tertiary line) -->
          <div class="text-caption text-disabled mt-1 uuid-text">
            {{ dataset.uuid }}
          </div>

          <!-- Tags -->
          <div v-if="dataset.tags && dataset.tags.length" class="mt-2 d-flex flex-wrap ga-1">
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

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import moment from "moment";
import type { Dataset, ResponseHeaders } from "@/types";

export default defineComponent({
  name: "DatasetTable",
  props: {
    datasetHits: {
      type: Array as PropType<Dataset[]>,
      required: true,
    },
    responseheaders: {
      type: Object as PropType<ResponseHeaders>,
      default: () => ({}),
    },
  },
  emits: ["update-dataset"],
  computed: {
    selected(): number {
      return this.$store.state.current_dataset_index;
    },
  },
  methods: {
    moment(timestamp: number) {
      return moment(timestamp);
    },
    updateSelectedDataset(index: number): void {
      this.$store.commit("update_current_dataset_index", index);
      this.$store.commit("update_current_dataset", this.datasetHits[index]);
      this.$emit("update-dataset");
    },
  },
});
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
