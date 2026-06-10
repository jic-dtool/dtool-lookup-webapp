<template>
  <v-app>
    <!-- Loading State - Checking server health and auth -->
    <template v-if="isInitializing">
      <v-main class="d-flex align-center justify-center bg-grey-lighten-4">
        <v-card class="pa-8 text-center" max-width="400">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          />
          <p class="text-body-1 text-grey-darken-1">Connecting to server...</p>
        </v-card>
      </v-main>
    </template>

    <!-- Server Unhealthy Guard -->
    <template v-else-if="serverHealth.isUnhealthy">
      <v-main class="d-flex align-center justify-center bg-grey-lighten-4">
        <v-card class="pa-8" max-width="500">
          <div class="text-center mb-6">
            <v-icon icon="mdi-server-off" size="80" color="error" />
          </div>
          <h1 class="text-h5 font-weight-bold text-center mb-4 text-error">
            Server Unavailable
          </h1>
          <v-alert type="error" variant="tonal" class="mb-4">
            {{
              serverHealth.errorMessage || "Unable to connect to the dserver."
            }}
          </v-alert>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            The dtool lookup server is not responding. This could be due to:
          </p>
          <ul class="text-body-2 text-grey-darken-1 mb-6 ml-4">
            <li>Server maintenance or downtime</li>
            <li>Network connectivity issues</li>
            <li>Server configuration problems</li>
          </ul>
          <v-btn
            color="primary"
            block
            :loading="serverHealth.isChecking"
            @click="retryServerConnection"
          >
            <v-icon icon="mdi-refresh" class="mr-2" />
            Retry Connection
          </v-btn>
          <p class="text-caption text-grey mt-4 text-center">
            Server URL: {{ serverHealth.serverUrl }}
          </p>
        </v-card>
      </v-main>
    </template>

    <!-- Authentication Guard - Show Sign In -->
    <template v-else-if="!auth.isAuthenticated">
      <v-main>
        <SignIn />
      </v-main>
    </template>

    <!-- Authenticated View - Main Application -->
    <template v-else>
      <!-- App Bar -->
      <v-app-bar color="grey-lighten-3" elevation="2">
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

        <v-avatar size="36" class="ml-2 mr-2">
          <v-img src="/icons/128x128/dtool_logo.png" alt="dtool Logo" />
        </v-avatar>
        <v-app-bar-title class="text-primary font-weight-bold flex-grow-0">
          dtool
        </v-app-bar-title>

        <v-spacer />

        <TextSearch
          v-if="currentView === 'datasets'"
          :mongoplugin="safeMongoPlugin"
          @start-search="searchDatasets"
        />

        <v-spacer />

        <!-- Admin: User Management Toggle -->
        <v-btn
          v-if="auth.isAdmin"
          :variant="currentView === 'users' ? 'tonal' : 'text'"
          :color="currentView === 'users' ? 'primary' : undefined"
          class="mr-2"
          @click="currentView = currentView === 'users' ? 'datasets' : 'users'"
        >
          <v-icon class="mr-1">mdi-account-cog</v-icon>
          <span class="d-none d-sm-inline">Users</span>
        </v-btn>

        <UserMenu @logoutAction="handleLogout" />
      </v-app-bar>

      <!-- Navigation Drawer for mobile -->
      <v-navigation-drawer v-model="drawer" temporary class="d-md-none">
        <SummaryInfo @start-search="searchDatasets" />
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="bg-grey-lighten-4">
        <!-- User Management View (Admin Only) -->
        <div
          v-if="currentView === 'users' && auth.isAdmin"
          class="pa-4 fill-height"
        >
          <UserManagement />
        </div>

        <!-- Dataset Browser View -->
        <div v-else class="main-layout pa-4">
          <!-- Left Sidebar - Navigation Rail (hidden on mobile, shown on md+) -->
          <div class="nav-column d-none d-md-flex">
            <v-card
              class="fill-height overflow-auto"
              variant="flat"
              rounded="lg"
            >
              <SummaryInfo @start-search="searchDatasets" />
            </v-card>
          </div>

          <!-- Middle Column - Dataset List -->
          <div class="list-column">
            <v-card
              class="fill-height d-flex flex-column"
              variant="elevated"
              rounded="lg"
            >
              <!-- Loading State -->
              <div
                v-if="searchLoading"
                class="d-flex justify-center align-center flex-grow-1"
              >
                <v-progress-circular indeterminate color="primary" size="48" />
              </div>

              <!-- Error State -->
              <div v-else-if="searchErrored" class="pa-4">
                <v-alert type="error" class="mb-4">
                  {{
                    searchErrorMessage ||
                    "Unable to load datasets please try again."
                  }}
                </v-alert>
                <v-btn color="secondary" class="mr-2" @click="searchDatasets()">
                  Try again
                </v-btn>
                <v-btn color="secondary" @click="handleLogout()">
                  Logout
                </v-btn>
              </div>

              <!-- Dataset List -->
              <template v-else>
                <div class="pa-3 border-b">
                  <dataset-sorting @start-search="searchDatasets" />
                </div>

                <div class="flex-grow-1 overflow-auto">
                  <DatasetTable
                    :datasetHits="datasetHits"
                    @update-dataset="updateDataset"
                  />
                </div>

                <div v-if="shouldShowPagination" class="pa-3 border-t">
                  <v-pagination
                    v-model="currentPage"
                    :length="totalPages"
                    :total-visible="5"
                    density="compact"
                    rounded
                    @update:model-value="onPageChange"
                  />
                </div>
              </template>
            </v-card>
          </div>

          <!-- Right Column - Dataset Details -->
          <div v-if="datasetLoaded" class="detail-column">
            <v-card
              class="fill-height d-flex flex-column"
              variant="elevated"
              rounded="lg"
            >
              <!-- Card Header - Dataset Title and Metadata (always visible) -->
              <div class="pa-4 border-b">
                <div v-if="manifestLoading" class="d-flex justify-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                  />
                </div>
                <div v-else-if="manifestErrored">
                  <v-alert type="error" density="compact" class="mb-2">
                    Unable to load manifest please try again.
                  </v-alert>
                  <v-btn
                    size="small"
                    color="secondary"
                    class="mr-2"
                    @click="updateManifest()"
                  >
                    Try again
                  </v-btn>
                  <v-btn size="small" color="secondary" @click="handleLogout()">
                    Logout
                  </v-btn>
                </div>
                <DatasetHeader v-else />
              </div>

              <!-- Tabs for Dataset, README and Items -->
              <v-tabs v-model="detailTab" color="primary" class="border-b">
                <v-tab value="dataset">
                  <v-icon size="small" class="mr-2">mdi-database</v-icon>
                  Dataset
                </v-tab>
                <v-tab value="readme">
                  <v-icon size="small" class="mr-2"
                    >mdi-file-document-outline</v-icon
                  >
                  README
                </v-tab>
                <v-tab value="items">
                  <v-icon size="small" class="mr-2">mdi-file-tree</v-icon>
                  Items
                  <v-chip
                    v-if="itemCount > 0"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    class="ml-2"
                  >
                    {{ itemCount }}
                  </v-chip>
                </v-tab>
                <v-tab v-if="hasDependencyGraphPlugin" value="dependencies">
                  <v-icon size="small" class="mr-2">mdi-graph-outline</v-icon>
                  Dependencies
                </v-tab>
              </v-tabs>

              <!-- Tab Content -->
              <v-tabs-window
                v-model="detailTab"
                class="flex-grow-1 overflow-auto"
              >
                <!-- Dataset Tab (URI, Tags, Annotations) -->
                <v-tabs-window-item value="dataset" class="fill-height">
                  <div class="pa-4">
                    <DatasetSummary />
                  </div>
                </v-tabs-window-item>

                <!-- README Tab -->
                <v-tabs-window-item value="readme" class="fill-height">
                  <div class="pa-4">
                    <div
                      v-if="readmeLoading"
                      class="d-flex justify-center py-4"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="24"
                      />
                    </div>
                    <div v-else-if="readmeErrored">
                      <v-alert type="error" density="compact" class="mb-2">
                        Unable to load readme please try again.
                      </v-alert>
                      <v-btn
                        size="small"
                        color="secondary"
                        class="mr-2"
                        @click="updateReadme()"
                      >
                        Try again
                      </v-btn>
                      <v-btn
                        size="small"
                        color="secondary"
                        @click="handleLogout()"
                      >
                        Logout
                      </v-btn>
                    </div>
                    <Readme v-else :getinfo="getinfo" />
                  </div>
                </v-tabs-window-item>

                <!-- Items Tab -->
                <v-tabs-window-item value="items" class="fill-height">
                  <div class="pa-4">
                    <div
                      v-if="manifestLoading"
                      class="d-flex justify-center w-100 py-2"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="24"
                      />
                    </div>
                    <div v-else-if="manifestErrored" class="w-100">
                      <v-alert type="error" density="compact" class="mb-2">
                        Unable to load manifest please try again.
                      </v-alert>
                      <v-btn
                        size="small"
                        color="secondary"
                        class="mr-2"
                        @click="updateManifest()"
                      >
                        Try again
                      </v-btn>
                      <v-btn
                        size="small"
                        color="secondary"
                        @click="handleLogout()"
                      >
                        Logout
                      </v-btn>
                    </div>
                    <Manifest v-else class="w-100" />
                  </div>
                </v-tabs-window-item>

                <!-- Dependencies Tab -->
                <v-tabs-window-item
                  v-if="hasDependencyGraphPlugin"
                  value="dependencies"
                  class="fill-height"
                >
                  <div class="pa-4 fill-height">
                    <DatasetDependencies
                      @select-dataset="handleDependencyNavigation"
                    />
                  </div>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card>
          </div>
        </div>
      </v-main>
    </template>

    <!-- Global notifications -->
    <NotificationSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import SignIn from "./components/SignIn.vue";
import SummaryInfo from "./components/SummaryInfo.vue";
import TextSearch from "./components/TextSearch.vue";
import DatasetTable from "./components/DatasetTable.vue";
import Manifest from "./components/DatasetManifest.vue";
import Readme from "./components/DatasetReadme.vue";
import DatasetSummary from "./components/DatasetSummary.vue";
import DatasetHeader from "./components/DatasetHeader.vue";
import DatasetSorting from "./components/DatasetSorting.vue";
import UserMenu from "./components/UserMenu.vue";
import NotificationSnackbar from "./components/NotificationSnackbar.vue";
import UserManagement from "./components/UserManagement.vue";
import DatasetDependencies from "./components/DatasetDependencies.vue";
import { useStore } from "./store";
import { useAuthStore } from "./stores/auth";
import { useServerHealthStore } from "./stores/serverHealth";
import { dserverApi } from "./services/dserverApi";
import type { SearchQuery as DServerSearchQuery } from "./services/dserverApi";
import type { Dataset, ConfigInfo } from "./types";

// Stores
const store = useStore();
const auth = useAuthStore();
const serverHealth = useServerHealthStore();

// App initialization state
const isInitializing = ref(true);

// Reactive state
const drawer = ref(false);
const datasetHits = ref<Dataset[]>([]);
const searchLoading = ref(true);
const searchErrored = ref(false);
const searchErrorMessage = ref<string | null>(null);
const manifestLoading = ref(false);
const manifestErrored = ref(false);
const readmeLoading = ref(false);
const readmeErrored = ref(false);
const tagsLoading = ref(false);
const tagsErrored = ref(false);
const annotationsLoading = ref(false);
const annotationsErrored = ref(false);
const lookup_url = dserverApi.getBaseUrl();
const getinfo = ref<ConfigInfo>({ versions: {} });
const detailTab = ref<string>("dataset");
const currentView = ref<"datasets" | "users">("datasets");

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const paginationInfo = ref<PaginationInfo>({
  total: 0,
  page: 1,
  per_page: 10,
  pages: 1,
});

// Computed properties
const datasetLoaded = computed<Dataset | null>(() => {
  return store.current_dataset;
});

const current_dataset = computed<Dataset | undefined>(() => {
  return datasetHits.value[store.current_dataset_index];
});

// For backward compatibility with mongo search (still uses axios)
const mongoSearchURL = computed(() => {
  return lookup_url + "/mongo/query";
});

const searchQuery = computed<DServerSearchQuery>(() => {
  const query: DServerSearchQuery = {};

  if (store.free_text) {
    query.free_text = store.free_text;
  }

  if (store.creator_usernames.length > 0) {
    query.creator_usernames = store.creator_usernames;
  }
  if (store.base_uris.length > 0) {
    query.base_uris = store.base_uris;
  }
  if (store.tags.length > 0) {
    query.tags = store.tags;
  }

  return query;
});

const uriQuery = computed<{ uri: string | null }>(() => {
  if (datasetHits.value.length > 0) {
    return {
      uri: datasetHits.value[store.current_dataset_index]?.uri ?? null,
    };
  } else {
    return { uri: null };
  }
});

const totalPages = computed(() => {
  // Prefer the page count reported by the server.
  if (paginationInfo.value.pages) {
    return paginationInfo.value.pages;
  }
  if (paginationInfo.value.total && paginationInfo.value.per_page) {
    return Math.ceil(
      paginationInfo.value.total / paginationInfo.value.per_page,
    );
  }
  return 1;
});

const shouldShowPagination = computed(() => {
  return paginationInfo.value.total > paginationInfo.value.per_page;
});

const safeMongoPlugin = computed(() => {
  return getinfo.value.versions.dserver_direct_mongo_plugin || "N/A";
});

const hasDependencyGraphPlugin = computed(() => {
  return !!getinfo.value.versions.dserver_dependency_graph_plugin;
});

const itemCount = computed(() => {
  const manifest = store.current_dataset_manifest;
  if (manifest && manifest.items) {
    return Object.keys(manifest.items).length;
  }
  return 0;
});

const currentPage = computed({
  get(): number {
    return store.current_pageNumber;
  },
  set(value: number) {
    store.current_pageNumber = value;
  },
});

// Monotonically increasing id used to discard stale search responses when
// several searches are in flight (there is no request cancellation).
let searchSequence = 0;

// Methods
function onPageChange(): void {
  searchDatasets();
}

function isAuthenticationError(error: unknown): boolean {
  const err = error as {
    status?: number;
    response?: { status?: number };
    name?: string;
  };
  const status = err.status || err.response?.status;
  return status === 401 || err.name === "AuthenticationError";
}

async function searchDatasets(): Promise<void> {
  getconfiginfo();

  const sequence = ++searchSequence;

  store.updateCurrentDatasetIndex(0);
  store.updateCurrentDataset(null);
  store.updateCurrentDatasetManifest(null);
  store.updateCurrentDatasetReadme(null);
  store.updateCurrentDatasetTags(null);
  store.updateCurrentDatasetAnnotations(null);
  searchLoading.value = true;
  searchErrored.value = false;

  // Handle mongo query separately (legacy)
  if (store.mongo_text) {
    try {
      const response = await axios.post(
        mongoSearchURL.value,
        { query: JSON.parse(store.mongo_text) },
        {
          params: {
            page: store.current_pageNumber,
            page_size: store.update_current_Per_Page,
          },
          headers: {
            Authorization: `Bearer ${auth.token || ""}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (sequence !== searchSequence) return;
      datasetHits.value = response.data;
      const paginationHeader = response.headers["x-pagination"];
      paginationInfo.value = paginationHeader
        ? JSON.parse(paginationHeader)
        : {
            total: response.data.length,
            page: 1,
            per_page: response.data.length,
            pages: 1,
          };
      store.updateCurrentDataset(current_dataset.value ?? null);
      store.updateNumFiltered(paginationInfo.value.total);
      updateDataset();
    } catch (error) {
      if (sequence !== searchSequence) return;
      handleSearchError(error);
    } finally {
      if (sequence === searchSequence) {
        searchLoading.value = false;
      }
    }
    return;
  }

  // Use dserverApi for standard search
  try {
    const result = await dserverApi.searchDatasets(searchQuery.value, {
      page: store.current_pageNumber,
      page_size: store.update_current_Per_Page,
      sort: store.selected_sort_option,
    });

    if (sequence !== searchSequence) return;
    datasetHits.value = result.data as Dataset[];
    paginationInfo.value = result.pagination;
    store.updateCurrentDataset(current_dataset.value ?? null);
    store.updateNumFiltered(result.pagination.total);
    updateDataset();
  } catch (error) {
    if (sequence !== searchSequence) return;
    handleSearchError(error);
  } finally {
    if (sequence === searchSequence) {
      searchLoading.value = false;
    }
  }
}

function handleSearchError(error: unknown): void {
  const err = error as { status?: number; response?: { status?: number } };
  const status = err.status || err.response?.status;

  if (isAuthenticationError(error)) {
    // Auth store will handle this - logout the user
    auth.logout();
  } else if (status === 404 && store.current_pageNumber > 1) {
    // Out-of-range page (e.g. after changing the page size): retry once
    // from the first page. Only when not already there, to avoid a loop.
    store.current_pageNumber = 1;
    searchDatasets();
  } else {
    searchErrorMessage.value = "An error occurred while loading datasets.";
    searchErrored.value = true;
  }
}

function updateDataset(): void {
  updateManifest();
  updateReadme();
  updateAnnotations();
  updateTags();
}

async function handleDependencyNavigation(uuid: string): Promise<void> {
  // Navigate to a dataset from the dependency graph
  // Keep the Dependencies tab open so user can continue exploring the graph
  const sequence = ++searchSequence;
  try {
    // Search using free text with the UUID to find the dataset
    const result = await dserverApi.searchDatasets({ free_text: uuid });
    if (sequence !== searchSequence) return;
    if (result.data.length > 0) {
      // Find the exact match by UUID
      const exactMatch = result.data.find((d) => d.uuid === uuid);
      const dataset = exactMatch || result.data[0];

      datasetHits.value = result.data as Dataset[];
      paginationInfo.value = result.pagination;

      const datasetIndex = result.data.findIndex((d) => d.uuid === uuid);
      store.updateCurrentDatasetIndex(datasetIndex >= 0 ? datasetIndex : 0);
      store.updateCurrentDataset(dataset as Dataset);
      store.updateNumFiltered(result.pagination.total);
      updateDataset();
      // Keep the dependencies tab open (don't switch tabs)
    }
  } catch (error) {
    console.error("Failed to navigate to dataset:", error);
  }
}

/**
 * True while the response for `uri` is still the one the UI is waiting for.
 * Late responses for a previously selected dataset are discarded.
 */
function isCurrentUri(uri: string): boolean {
  return store.current_dataset?.uri === uri || uriQuery.value.uri === uri;
}

async function updateManifest(): Promise<void> {
  manifestLoading.value = true;
  manifestErrored.value = false;

  const uri = uriQuery.value.uri;
  if (!uri) {
    manifestErrored.value = true;
    manifestLoading.value = false;
    return;
  }

  try {
    const manifest = await dserverApi.getManifest(uri);
    if (!isCurrentUri(uri)) return;
    store.updateCurrentDatasetManifest(manifest);
  } catch (error) {
    if (!isCurrentUri(uri)) return;
    if (isAuthenticationError(error)) {
      auth.logout();
      return;
    }
    manifestErrored.value = true;
  } finally {
    if (isCurrentUri(uri)) {
      manifestLoading.value = false;
    }
  }
}

async function updateReadme(): Promise<void> {
  readmeLoading.value = true;
  readmeErrored.value = false;

  const uri = uriQuery.value.uri;
  if (!uri) {
    readmeErrored.value = true;
    readmeLoading.value = false;
    return;
  }

  try {
    const readme = await dserverApi.getReadme(uri);
    if (!isCurrentUri(uri)) return;
    store.updateCurrentDatasetReadme(readme);
  } catch (error) {
    if (!isCurrentUri(uri)) return;
    if (isAuthenticationError(error)) {
      auth.logout();
      return;
    }
    readmeErrored.value = true;
  } finally {
    if (isCurrentUri(uri)) {
      readmeLoading.value = false;
    }
  }
}

async function updateAnnotations(): Promise<void> {
  annotationsLoading.value = true;
  annotationsErrored.value = false;

  const uri = uriQuery.value.uri;
  if (!uri) {
    annotationsErrored.value = true;
    annotationsLoading.value = false;
    return;
  }

  try {
    const annotations = await dserverApi.getAnnotations(uri);
    if (!isCurrentUri(uri)) return;
    store.updateCurrentDatasetAnnotations(annotations);
  } catch (error) {
    if (!isCurrentUri(uri)) return;
    if (isAuthenticationError(error)) {
      auth.logout();
      return;
    }
    annotationsErrored.value = true;
  } finally {
    if (isCurrentUri(uri)) {
      annotationsLoading.value = false;
    }
  }
}

async function updateTags(): Promise<void> {
  tagsLoading.value = true;
  tagsErrored.value = false;

  const uri = uriQuery.value.uri;
  if (!uri) {
    tagsErrored.value = true;
    tagsLoading.value = false;
    return;
  }

  try {
    const tags = await dserverApi.getTags(uri);
    if (!isCurrentUri(uri)) return;
    store.updateCurrentDatasetTags(tags);
  } catch (error) {
    if (!isCurrentUri(uri)) return;
    if (isAuthenticationError(error)) {
      auth.logout();
      return;
    }
    tagsErrored.value = true;
  } finally {
    if (isCurrentUri(uri)) {
      tagsLoading.value = false;
    }
  }
}

async function getconfiginfo(): Promise<void> {
  // Store the lookup URL in the store for components to use
  store.updateLookupUrl(lookup_url);

  try {
    const versions = await dserverApi.getServerVersions();
    getinfo.value = { versions };
    store.updateServerVersions(versions);
  } catch (error) {
    console.error("Failed to load server versions:", error);
  }
}

function handleLogout(): void {
  auth.logout();
  searchErrorMessage.value = null;
  searchErrored.value = false;
  store.clearAll();
}

async function retryServerConnection(): Promise<void> {
  const healthy = await serverHealth.checkHealth();
  if (healthy) {
    // Re-initialize auth only if the session was not restored already;
    // re-running login on an intact session is unnecessary.
    if (!auth.isAuthenticated) {
      await auth.initialize();
    }
    isInitializing.value = false;
  }
}

// Watch for authentication state changes
watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // User just logged in, start search
      searchDatasets();
    }
  },
);

// Initialize the app
onMounted(async () => {
  // First check server health
  const serverHealthy = await serverHealth.initialize();

  if (!serverHealthy) {
    isInitializing.value = false;
    return;
  }

  // Then initialize auth (will check for existing token or OAuth2 callback).
  // The isAuthenticated watcher above triggers the initial search.
  await auth.initialize();

  isInitializing.value = false;
});
</script>

<style>
.v-application {
  font-family: "Roboto", "Avenir", Helvetica, Arial, sans-serif;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Main layout using flexbox for full-width columns */
.main-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 64px);
  width: 100%;
}

.nav-column {
  flex: 0 0 260px;
  min-width: 220px;
  max-width: 300px;
  height: 100%;
}

.list-column {
  flex: 0 0 380px;
  min-width: 320px;
  height: 100%;
}

.detail-column {
  flex: 1 1 auto;
  min-width: 400px;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }

  .nav-column,
  .list-column,
  .detail-column {
    flex: none;
    width: 100%;
    min-width: unset;
    max-width: unset;
    height: auto;
    min-height: 400px;
  }
}
</style>
