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
        <v-expansion-panel
          v-if="summary_info?.tags && summary_info.tags.length > 0"
        >
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
              <v-icon
                :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              density="compact"
              class="py-0"
              max-height="200"
              style="overflow-y: auto"
            >
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
                <v-list-item-title class="text-body-2">{{
                  tag
                }}</v-list-item-title>
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
        <v-expansion-panel
          v-if="summary_info?.base_uris && summary_info.base_uris.length > 0"
        >
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
              <v-icon
                :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              density="compact"
              class="py-0"
              max-height="200"
              style="overflow-y: auto"
            >
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
                <v-list-item-title
                  class="text-body-2 text-truncate"
                  style="max-width: 140px"
                >
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
        <v-expansion-panel
          v-if="
            summary_info?.creator_usernames &&
            summary_info.creator_usernames.length > 0
          "
        >
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
              <v-icon
                :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              density="compact"
              class="py-0"
              max-height="200"
              style="overflow-y: auto"
            >
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
                <v-list-item-title class="text-body-2">{{
                  creator
                }}</v-list-item-title>
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
import { ref, onMounted } from "vue";
import { useStore } from "@/store";
import { useAuthStore } from "@/stores/auth";
import { dserverApi } from "@/services/dserverApi";
import type { SummaryInfo } from "@/services/dserverApi";

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();
const auth = useAuthStore();

const summary_info = ref<SummaryInfo | null>(null);
const loading = ref(true);
const errored = ref(false);

async function load_summary(): Promise<void> {
  errored.value = false;
  loading.value = true;

  const username = auth.username;
  if (!username) {
    errored.value = true;
    loading.value = false;
    return;
  }

  try {
    summary_info.value = await dserverApi.getUserSummary(username);
  } catch (error) {
    console.log(error);
    errored.value = true;
  } finally {
    loading.value = false;
  }
}

function searchDatasets(): void {
  store.current_pageNumber = 1;
  emit("start-search");
}

function clearFilters(): void {
  store.clearAll();
  store.current_pageNumber = 1;
  emit("start-search");
}

function toggleTag(tag: string): void {
  store.updateTags(
    store.tags.includes(tag)
      ? store.tags.filter((t) => t !== tag)
      : [...store.tags, tag],
  );
  searchDatasets();
}

function toggleBaseUri(base_uri: string): void {
  store.updateBaseUris(
    store.base_uris.includes(base_uri)
      ? store.base_uris.filter((u) => u !== base_uri)
      : [...store.base_uris, base_uri],
  );
  searchDatasets();
}

function toggleCreator(creator: string): void {
  store.updateCreatorUsernames(
    store.creator_usernames.includes(creator)
      ? store.creator_usernames.filter((c) => c !== creator)
      : [...store.creator_usernames, creator],
  );
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
