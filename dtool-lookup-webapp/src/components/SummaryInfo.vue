<template>
  <div class="summary-sidebar">
    <!-- Header -->
    <div class="pa-4 bg-primary">
      <h6 class="text-h6 text-white font-weight-medium">
        <v-icon start>mdi-folder-search</v-icon>
        Repository
      </h6>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="errored" class="pa-4">
      <v-alert type="error" density="compact" class="mb-2">
        Unable to load summary information please try again.
      </v-alert>
      <v-btn size="small" color="secondary" @click="load_summary()">
        Try again
      </v-btn>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Dataset counts summary -->
      <div class="pa-4 border-b">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2 text-grey-darken-1">Total Datasets</span>
          <v-chip size="small" color="primary" variant="flat">
            {{ summary_info?.number_of_datasets ?? 0 }}
          </v-chip>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2 text-grey-darken-1">Filtered</span>
          <v-chip size="small" color="secondary" variant="flat">
            {{ store.num_filtered }}
          </v-chip>
        </div>
        <v-btn
          block
          variant="tonal"
          color="primary"
          size="small"
          class="mt-3"
          prepend-icon="mdi-filter-off"
          @click="clearFilters()"
        >
          Clear All Filters
        </v-btn>
      </div>

      <!-- Filters -->
      <v-expansion-panels variant="accordion" multiple>
        <!-- Tags Filter -->
        <v-expansion-panel v-if="summary_info?.tags && summary_info.tags.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-tag-multiple</v-icon>
            Tags
            <template #actions="{ expanded }">
              <v-badge
                v-if="store.tags.length > 0"
                :content="store.tags.length"
                color="primary"
                inline
                class="mr-2"
              />
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
              <v-list-item
                v-for="(tag, index) in summary_info.tags"
                :key="index"
                @click="toggleTag(tag)"
                class="px-0"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="store.tags.includes(tag)"
                    density="compact"
                    hide-details
                    @click.stop="toggleTag(tag)"
                  />
                </template>
                <v-list-item-title class="text-body-2">{{ tag }}</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="grey-lighten-1" variant="flat">
                    {{ summary_info.datasets_per_tag[tag] }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Locations Filter -->
        <v-expansion-panel v-if="summary_info?.base_uris && summary_info.base_uris.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-folder-marker</v-icon>
            Locations
            <template #actions="{ expanded }">
              <v-badge
                v-if="store.base_uris.length > 0"
                :content="store.base_uris.length"
                color="primary"
                inline
                class="mr-2"
              />
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
              <v-list-item
                v-for="(base_uri, index) in summary_info.base_uris"
                :key="index"
                @click="toggleBaseUri(base_uri)"
                class="px-0"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="store.base_uris.includes(base_uri)"
                    density="compact"
                    hide-details
                    @click.stop="toggleBaseUri(base_uri)"
                  />
                </template>
                <v-list-item-title class="text-body-2 text-truncate" style="max-width: 140px;">
                  {{ base_uri }}
                </v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="grey-lighten-1" variant="flat">
                    {{ summary_info.datasets_per_base_uri[base_uri] }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Creators Filter -->
        <v-expansion-panel v-if="summary_info?.creator_usernames && summary_info.creator_usernames.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-account-multiple</v-icon>
            Creators
            <template #actions="{ expanded }">
              <v-badge
                v-if="store.creator_usernames.length > 0"
                :content="store.creator_usernames.length"
                color="primary"
                inline
                class="mr-2"
              />
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
              <v-list-item
                v-for="(creator, index) in summary_info.creator_usernames"
                :key="index"
                @click="toggleCreator(creator)"
                class="px-0"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="store.creator_usernames.includes(creator)"
                    density="compact"
                    hide-details
                    @click.stop="toggleCreator(creator)"
                  />
                </template>
                <v-list-item-title class="text-body-2">{{ creator }}</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="grey-lighten-1" variant="flat">
                    {{ summary_info.datasets_per_creator[creator] }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import { useStore } from "@/store";
import type { SummaryInfo } from "@/types";

const props = defineProps<{
  lookup_url: string;
  auth_str: string;
}>();

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();
const instance = getCurrentInstance();
const axios = instance?.appContext.config.globalProperties.$http;

const summary_info = ref<SummaryInfo | null>(null);
const loading = ref(true);
const errored = ref(false);
const selectedTags = ref<string[]>([]);
const selectedBaseUris = ref<string[]>([]);
const selectedCreators = ref<string[]>([]);

const source = computed(() => {
  return props.lookup_url + "/me/summary";
});

function load_summary(): void {
  console.log("Loading summary info");
  errored.value = false;
  loading.value = true;
  axios
    .get(source.value, { headers: { Authorization: props.auth_str } })
    .then((response: AxiosResponse<SummaryInfo>) => {
      summary_info.value = response.data;
    })
    .catch((error: AxiosError) => {
      console.log(error);
      errored.value = true;
    })
    .finally(() => (loading.value = false));
}

function searchDatasets(): void {
  store.current_pageNumber = 1;
  emit("start-search");
}

function clearFilters(): void {
  selectedTags.value = [];
  selectedBaseUris.value = [];
  selectedCreators.value = [];
  store.clearAll();
  emit("start-search");
}

function toggleTag(tag: string): void {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value.splice(selectedTags.value.indexOf(tag), 1);
  } else {
    selectedTags.value.push(tag);
  }
  store.updateTags(selectedTags.value);
  searchDatasets();
}

function toggleBaseUri(base_uri: string): void {
  if (selectedBaseUris.value.includes(base_uri)) {
    selectedBaseUris.value.splice(selectedBaseUris.value.indexOf(base_uri), 1);
  } else {
    selectedBaseUris.value.push(base_uri);
  }
  store.updateBaseUris(selectedBaseUris.value);
  searchDatasets();
}

function toggleCreator(creator: string): void {
  if (selectedCreators.value.includes(creator)) {
    selectedCreators.value.splice(selectedCreators.value.indexOf(creator), 1);
  } else {
    selectedCreators.value.push(creator);
  }
  store.updateCreatorUsernames(selectedCreators.value);
  searchDatasets();
}

onMounted(() => {
  load_summary();
});
</script>

<style scoped>
.summary-sidebar {
  height: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
