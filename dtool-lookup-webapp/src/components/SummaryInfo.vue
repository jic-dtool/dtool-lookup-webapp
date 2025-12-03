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
            {{ summary_info.number_of_datasets }}
          </v-chip>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2 text-grey-darken-1">Filtered</span>
          <v-chip size="small" color="secondary" variant="flat">
            {{ this.$store.state.num_filtered }}
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
        <v-expansion-panel v-if="summary_info.tags && summary_info.tags.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-tag-multiple</v-icon>
            Tags
            <template #actions="{ expanded }">
              <v-badge
                v-if="$store.state.tags.length > 0"
                :content="$store.state.tags.length"
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
                    :model-value="$store.state.tags.includes(tag)"
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
        <v-expansion-panel v-if="summary_info.base_uris && summary_info.base_uris.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-folder-marker</v-icon>
            Locations
            <template #actions="{ expanded }">
              <v-badge
                v-if="$store.state.base_uris.length > 0"
                :content="$store.state.base_uris.length"
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
                    :model-value="$store.state.base_uris.includes(base_uri)"
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
        <v-expansion-panel v-if="summary_info.creator_usernames && summary_info.creator_usernames.length > 0">
          <v-expansion-panel-title class="text-body-2 font-weight-medium">
            <v-icon start size="small">mdi-account-multiple</v-icon>
            Creators
            <template #actions="{ expanded }">
              <v-badge
                v-if="$store.state.creator_usernames.length > 0"
                :content="$store.state.creator_usernames.length"
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
                    :model-value="$store.state.creator_usernames.includes(creator)"
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

<script>
import { getUsernameFromJwt } from "@/utils/jwtUtils";

export default {
  name: "SummaryInfo",
  props: {
    lookup_url: String,
    auth_str: String,
    token: String,
  },
  data: function () {
    return {
      summary_info: null,
      loading: true,
      errored: false,
      username: "",
      selectedTags: [],
      selectedBaseUris: [],
      selectedCreators: [],
    };
  },
  computed: {
    source: function () {
      return this.lookup_url + "/users/" + this.username + "/summary";
    },
  },
  methods: {
    load_summary: function () {
      console.log("Loading summary info");
      this.errored = false;
      this.loading = true;
      this.$http
        .get(this.source, { headers: { Authorization: this.auth_str } })
        .then((response) => (this.summary_info = response.data))
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },
    searchDatasets: function () {
      this.$store.state.current_pageNumber = 1;
      this.$emit("start-search");
    },
    clearFilters() {
      this.selectedTags = [];
      this.selectedBaseUris = [];
      this.selectedCreators = [];
      this.$store.commit("clear_all");
      this.$emit("start-search");
    },
    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
      } else {
        this.selectedTags.push(tag);
      }
      this.$store.commit("update_tags", this.selectedTags);
      this.searchDatasets();
    },
    toggleBaseUri(base_uri) {
      if (this.selectedBaseUris.includes(base_uri)) {
        this.selectedBaseUris.splice(this.selectedBaseUris.indexOf(base_uri), 1);
      } else {
        this.selectedBaseUris.push(base_uri);
      }
      this.$store.commit("update_base_uris", this.selectedBaseUris);
      this.searchDatasets();
    },
    toggleCreator(creator) {
      if (this.selectedCreators.includes(creator)) {
        this.selectedCreators.splice(this.selectedCreators.indexOf(creator), 1);
      } else {
        this.selectedCreators.push(creator);
      }
      this.$store.commit("update_creator_usernames", this.selectedCreators);
      this.searchDatasets();
    },
  },
  mounted() {
    if (this.token) {
      const username = getUsernameFromJwt(this.token);
      this.username = username;
      this.$store.commit("updateUsername", username);
    }
    this.load_summary();
  },
};
</script>

<style scoped>
.summary-sidebar {
  height: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
