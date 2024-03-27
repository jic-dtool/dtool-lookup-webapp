<template>
  <div>
    <div v-if="loading" class="spinner-border text-primary">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <div v-if="errored">
        <div class="container">
          <p>Unable to load summary information please try again.</p>
          <a href="" class="btn btn-secondary" @click.prevent="load_summary()"
            >Try again</a
          >
        </div>
      </div>
      <div v-else>
        <NumDatasets
          :summary_info="summary_info"
          @start-search="searchDatasets"
        />

        <TagFilter
          :summary_info="summary_info"
          @start-search="searchDatasets"
        />

        <BaseUriFilter
          :summary_info="summary_info"
          @start-search="searchDatasets"
        />

        <CreatorUsernameFilter
          :summary_info="summary_info"
          @start-search="searchDatasets"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NumDatasets from "./NumDatasets.vue";
import TagFilter from "./TagFilter.vue";
import BaseUriFilter from "./BaseUriFilter.vue";
import CreatorUsernameFilter from "./CreatorUsernameFilter.vue";
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
    };
  },
  computed: {
    // Dynamically constructs the API endpoint URL using the provided username.
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
      this.$emit("start-search");
    },
  },
  mounted() {
    if (this.token) {
      // Extracts username from the JWT token and initializes the component state
      const username = getUsernameFromJwt(this.token);

      this.username = username;
      this.$store.commit("updateUsername", username);
    }
    this.load_summary();
  },
  components: {
    NumDatasets,
    TagFilter,
    BaseUriFilter,
    CreatorUsernameFilter,
  },
};
</script>

<style></style>
