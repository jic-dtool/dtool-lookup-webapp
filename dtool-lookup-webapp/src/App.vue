<template>
  <v-app>
    <!-- Authenticated view -->
    <template v-if="token">
      <!-- App Bar -->
      <v-app-bar color="grey-lighten-3" elevation="2">
        <v-app-bar-nav-icon
          class="d-md-none"
          @click="drawer = !drawer"
        />

        <v-avatar size="36" class="ml-2 mr-2">
          <v-img src="/icons/128x128/dtool_logo.png" alt="dtool Logo" />
        </v-avatar>
        <v-app-bar-title class="text-primary font-weight-bold">
          dtool
        </v-app-bar-title>

        <v-spacer />

        <TextSearch
          :mongoplugin="safeMongoPlugin"
          @start-search="searchDatasets"
          class="mr-2"
        />

        <template-downloader @logoutAction="logout" />
      </v-app-bar>

      <!-- Navigation Drawer for mobile -->
      <v-navigation-drawer
        v-model="drawer"
        temporary
        class="d-md-none"
      >
        <SummaryInfo
          :auth_str="auth_str"
          :lookup_url="lookup_url"
          :token="token"
          @start-search="searchDatasets"
        />
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="bg-grey-lighten-4">
        <div class="main-layout pa-4">
          <!-- Left Sidebar - Navigation Rail (hidden on mobile, shown on md+) -->
          <div class="nav-column d-none d-md-flex">
            <v-card class="fill-height overflow-auto" variant="flat" rounded="lg">
              <SummaryInfo
                :auth_str="auth_str"
                :lookup_url="lookup_url"
                :token="token"
                @start-search="searchDatasets"
              />
            </v-card>
          </div>

          <!-- Middle Column - Dataset List -->
          <div class="list-column">
            <v-card class="fill-height d-flex flex-column" variant="elevated" rounded="lg">
              <!-- Loading State -->
              <div v-if="searchLoading" class="d-flex justify-center align-center flex-grow-1">
                <v-progress-circular indeterminate color="primary" size="48" />
              </div>

              <!-- Error State -->
              <div v-else-if="searchErrored" class="pa-4">
                <v-alert
                  v-if="authenticationError"
                  type="error"
                  prominent
                  class="mb-4"
                >
                  <template #title>Authentication Error (401)</template>
                  <p>{{ searchErrorMessage }}</p>
                  <v-divider class="my-2" />
                  <p class="mb-0">
                    This usually means your username is not registered on the dserver.
                    Try logging in with username <strong>admin</strong> or contact an administrator
                    to register your user.
                  </p>
                </v-alert>
                <v-alert v-else type="error" class="mb-4">
                  {{ searchErrorMessage || "Unable to load datasets please try again." }}
                </v-alert>
                <v-btn color="secondary" class="mr-2" @click="searchDatasets()">
                  Try again
                </v-btn>
                <v-btn color="secondary" @click="logout()">
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
                    :responseheaders="responseheaders"
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
            <v-card class="fill-height overflow-auto" variant="elevated" rounded="lg">
                <!-- Card Header - Dataset Summary -->
                <div class="pa-4">
                  <div v-if="manifestLoading" class="d-flex justify-center">
                    <v-progress-circular indeterminate color="primary" size="24" />
                  </div>
                  <div v-else-if="manifestErrored">
                    <v-alert type="error" density="compact" class="mb-2">
                      Unable to load manifest please try again.
                    </v-alert>
                    <v-btn size="small" color="secondary" class="mr-2" @click="updateManifest()">
                      Try again
                    </v-btn>
                    <v-btn size="small" color="secondary" @click="logout()">
                      Logout
                    </v-btn>
                  </div>
                  <DatasetSummary v-else />
                </div>

                <!-- Card Body - Readme & Annotations -->
                <div class="pa-4 pt-0">
                  <!-- Readme Section -->
                  <div v-if="readmeLoading" class="d-flex justify-center py-4">
                    <v-progress-circular indeterminate color="primary" size="24" />
                  </div>
                  <div v-else-if="readmeErrored">
                    <v-alert type="error" density="compact" class="mb-2">
                      Unable to load readme please try again.
                    </v-alert>
                    <v-btn size="small" color="secondary" class="mr-2" @click="updateReadme()">
                      Try again
                    </v-btn>
                    <v-btn size="small" color="secondary" @click="logout()">
                      Logout
                    </v-btn>
                  </div>
                  <Readme v-else :getinfo="getinfo" />

                  <!-- Annotations Section -->
                  <div v-if="annotationsLoading" class="d-flex justify-center py-4">
                    <v-progress-circular indeterminate color="primary" size="24" />
                  </div>
                  <div v-else-if="annotationsErrored">
                    <v-alert type="error" density="compact" class="mb-2">
                      Unable to load annotations please try again.
                    </v-alert>
                    <v-btn size="small" color="secondary" class="mr-2" @click="updateAnnotations()">
                      Try again
                    </v-btn>
                    <v-btn size="small" color="secondary" @click="logout()">
                      Logout
                    </v-btn>
                  </div>
                  <Annotations v-else />
                </div>

                <!-- Card Footer - Manifest -->
                <div class="pa-4 pt-0">
                  <div v-if="manifestLoading" class="d-flex justify-center w-100 py-2">
                    <v-progress-circular indeterminate color="primary" size="24" />
                  </div>
                  <div v-else-if="manifestErrored" class="w-100">
                    <v-alert type="error" density="compact" class="mb-2">
                      Unable to load manifest please try again.
                    </v-alert>
                    <v-btn size="small" color="secondary" class="mr-2" @click="updateManifest()">
                      Try again
                    </v-btn>
                    <v-btn size="small" color="secondary" @click="logout()">
                      Logout
                    </v-btn>
                  </div>
                  <Manifest v-else class="w-100" />
                </div>
              </v-card>
            </div>
        </div>
      </v-main>
    </template>

    <!-- Sign In view -->
    <v-main v-else>
      <SignIn @sign-in="setTokenAndSearch" />
    </v-main>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script>
import SignIn from "./components/SignIn.vue";
import SummaryInfo from "./components/SummaryInfo.vue";
import TextSearch from "./components/TextSearch.vue";
import DatasetTable from "./components/DatasetTable.vue";
import Manifest from "./components/DatasetManifest.vue";
import Readme from "./components/DatasetReadme.vue";
import Annotations from "./components/DatasetAnnotations.vue";
import DatasetSummary from "./components/DatasetSummary.vue";
import DatasetSorting from "./components/DatasetSorting.vue";
import TemplateDownloader from "./components/TemplateDownloader.vue";

export default {
  name: "app",
  data: function () {
    return {
      drawer: false,
      datasetHits: [],
      searchLoading: true,
      searchErrored: false,
      searchErrorMessage: null,
      authenticationError: false,
      manifestLoading: false,
      manifestErrored: false,
      readmeLoading: false,
      readmeErrored: false,
      tagsLoading: false,
      tagsErrored: false,
      annotationsLoading: false,
      annotationsErrored: false,
      lookup_url: process.env.VUE_APP_DTOOL_LOOKUP_SERVER_URL,
      token: null,
      perPage: this.$store.state.update_current_Per_Page,
      responseheaders: Array,
      getinfo: {
        versions: {},
      },
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
    };
  },
  computed: {
    datasetLoaded: function () {
      return this.$store.state.current_dataset;
    },
    current_dataset: function () {
      return this.datasetHits[this.$store.state.current_dataset_index];
    },
    searchURL: function () {
      return (
        this.lookup_url +
        "/uris?page=" +
        this.$store.state.current_pageNumber +
        "&page_size=" +
        this.$store.state.update_current_Per_Page +
        "&sort=" +
        this.$store.state.selected_sort_option
      );
    },
    mongoSearchURL: function () {
      return this.lookup_url + "/mongo/query";
    },
    manifestURL: function () {
      return this.lookup_url + "/manifests";
    },
    configInfoURL: function () {
      return this.lookup_url + "/config/versions";
    },
    readmeURL: function () {
      return this.lookup_url + "/readmes";
    },
    annotationsURL: function () {
      return this.lookup_url + "/annotations";
    },
    tagsURL: function () {
      return this.lookup_url + "/tags";
    },
    auth_str: function () {
      return "Bearer ".concat(this.token);
    },

    searchQuery: function () {
      var query = {};

      if (this.$store.state.mongo_text) {
        query.query = JSON.parse(this.$store.state.mongo_text);
      } else {
        if (this.$store.state.free_text) {
          query.free_text = this.$store.state.free_text;
        }

        if (this.$store.state.creator_usernames.length > 0) {
          query.creator_usernames = this.$store.state.creator_usernames;
        }
        if (this.$store.state.base_uris.length > 0) {
          query.base_uris = this.$store.state.base_uris;
        }
        if (this.$store.state.tags.length > 0) {
          query.tags = this.$store.state.tags;
        }
      }
      return query;
    },
    uriQuery: function () {
      if (this.datasetHits.length > 0) {
        return {
          uri: this.datasetHits[this.$store.state.current_dataset_index].uri,
        };
      } else {
        return { uri: null };
      }
    },
    pagination: function () {
      return this.responseheaders["x-pagination"]
        ? JSON.parse(this.responseheaders["x-pagination"])
        : {};
    },

    totalPageContents() {
      return this.pagination.total;
    },

    totalPages() {
      if (this.pagination.total && this.$store.state.update_current_Per_Page) {
        return Math.ceil(this.pagination.total / this.$store.state.update_current_Per_Page);
      }
      return 1;
    },

    shouldShowPagination() {
      return this.pagination.total > this.$store.state.update_current_Per_Page;
    },

    safeMongoPlugin() {
      return this.getinfo.versions.dserver_direct_mongo_plugin || "N/A";
    },
    currentPage: {
      get() {
        return this.$store.state.current_pageNumber;
      },
      set(value) {
        this.$store.state.current_pageNumber = value;
      },
    },
    perPageValue() {
      return this.$store.state.update_current_Per_Page;
    },
  },
  methods: {
    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    onPageChange() {
      this.searchDatasets();
    },
    setTokenAndSearch: function (token) {
      this.token = token;
      this.searchDatasets();
    },
    searchDatasets: function () {
      this.getconfiginfo();
      console.log(this.getinfo);

      console.log("Running search");
      console.log(this.searchQuery);
      this.$store.commit("update_current_dataset_index", 0);
      this.$store.commit("update_current_dataset", null);
      this.$store.commit("update_current_dataset_manifest", null);
      this.$store.commit("update_current_dataset_readme", null);
      this.$store.commit("update_current_dataset_tags", null);
      this.updateDataset();
      this.searchLoading = true;
      this.searchErrored = false;

      let searchURL = this.searchURL;
      if (this.$store.state.mongo_text) {
        searchURL = this.mongoSearchURL;
      }

      this.$http
        .post(searchURL, this.searchQuery, {
          headers: {
            Authorization: this.auth_str,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          this.datasetHits = response.data;
          this.responseheaders = response.headers;
          this.$store.commit("update_current_dataset", this.current_dataset);
          this.$store.commit("update_num_filtered", this.pagination.total);
          this.updateDataset();
        })
        .catch((error) => {
          console.log(error);
          if (error.response && error.response.status === 401) {
            console.log("401 Unauthorized - User not authenticated or not registered");
            this.authenticationError = true;
            this.searchErrorMessage = "Authentication failed. Your user may not be registered on the server. Please contact an administrator.";
            this.searchErrored = true;
          } else if (error.response && error.response.status === 404) {
            console.log("404 Not Found - Resetting pageNumber and retrying");
            this.$store.state.current_pageNumber = 1;
            this.searchDatasets(); // Retry the search with pageNumber reset to 1
          } else {
            console.log(error.response);
            this.searchErrorMessage = "An error occurred while loading datasets.";
            this.searchErrored = true;
          }
        })
        .finally(() => {
          this.searchLoading = false;
        });
    },

    updateDataset: function () {
      this.updateManifest();
      this.updateReadme();
      this.updateAnnotations();
      this.updateTags();
    },
    updateManifest: function () {
      console.log("Loading manifest");
      this.manifestLoading = true;
      this.manifestErrored = false;

      const uri = this.uriQuery.uri;
      if (!uri) {
        // Check if uri is not null
        console.log("No URI available for manifest.");
        this.manifestErrored = true;
        this.manifestLoading = false;
        return; // Exit the method if no URI
      }

      const fullManifestURL = `${this.manifestURL}/${encodeURIComponent(uri)}`;

      this.$http
        .get(fullManifestURL, {
          headers: {
            Authorization: this.auth_str,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.$store.commit("update_current_dataset_manifest", response.data);
        })
        .catch((error) => {
          console.log(error);
          this.manifestErrored = true;
        })
        .finally(() => {
          this.manifestLoading = false;
        });
    },

    updateReadme: function () {
      console.log("Loading readme");
      this.readmeLoading = true;
      this.readmeErrored = false;

      const uri = this.uriQuery.uri;
      if (!uri) {
        // Check if uri is not null
        console.log("No URI available for readme.");
        this.readmeErrored = true;
        this.readmeLoading = false;
        return; // Exit the method if no URI
      }

      const fullReadmeURL = `${this.readmeURL}/${encodeURIComponent(uri)}`;

      this.$http
        .get(fullReadmeURL, {
          headers: {
            Authorization: this.auth_str,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.$store.commit("update_current_dataset_readme", response.data);
        })
        .catch((error) => {
          console.log(error);
          this.readmeErrored = true;
        })
        .finally(() => {
          this.readmeLoading = false;
        });
    },

    updateAnnotations: function () {
      console.log("Loading annotations");
      this.annotationsLoading = true;
      this.annotationsErrored = false;

      const uri = this.uriQuery.uri;
      if (!uri) {
        // Check if uri is not null
        console.log("No URI available for annotations.");
        this.annotationsErrored = true;
        this.annotationsLoading = false;
        return; // Exit the method if no URI
      }

      const fullAnnotationsURL = `${this.annotationsURL}/${encodeURIComponent(
        uri
      )}`;

      this.$http
        .get(fullAnnotationsURL, {
          headers: {
            Authorization: this.auth_str,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.$store.commit(
            "update_current_dataset_annotations",
            response.data
          );
        })
        .catch((error) => {
          console.log(error);
          this.annotationsErrored = true;
        })
        .finally(() => {
          this.annotationsLoading = false;
        });
    },

    updateTags: function () {
      console.log("Loading tags");
      this.tagsLoading = true;
      this.tagsErrored = false;

      const uri = this.uriQuery.uri;
      if (!uri) {
        console.log("No URI available for tags.");
        this.tagsErrored = true;
        this.tagsLoading = false;
        return; // Exit the method if no URI
      }

      const fullTagsURL = `${this.tagsURL}/${encodeURIComponent(uri)}`;

      this.$http
        .get(fullTagsURL, {
          headers: {
            Authorization: this.auth_str,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.$store.commit("update_current_dataset_tags", response.data); // Assuming you have a mutation named 'update_current_dataset_tags'
        })
        .catch((error) => {
          console.error(error);
          this.tagsErrored = true;
        })
        .finally(() => {
          this.tagsLoading = false;
        });
    },

    getconfiginfo: function () {
      console.log("Loading ConfigInfo");

      this.$http
        .get(this.configInfoURL, {
          headers: {
            Authorization: this.auth_str,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          this.getinfo = response.data;
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response);
        });
    },

    logout: function () {
      this.token = "";
      this.authenticationError = false;
      this.searchErrorMessage = null;
      this.searchErrored = false;
      this.$store.commit("clear_all");
    },
  },

  components: {
    SignIn,
    SummaryInfo,
    TextSearch,
    DatasetTable,
    Manifest,
    Readme,
    Annotations,
    DatasetSummary,
    DatasetSorting,
    TemplateDownloader,
  },
};
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
