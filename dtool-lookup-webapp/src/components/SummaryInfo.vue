<template>
  <div>
    <div v-if="loading">
        <p>Loading...</p>
    </div>
    <div v-else>
        <div v-if="errored">
            <p>Unable to load summary information please return later.</p>
        </div>
        <div v-else>
            <ul class="list-group">
                <li class="list-group-item">
                    All
                    <span class="badge badge-pill badge-primary">{{
                    summary_info["number_of_datasets"]
                    }}</span>
                </li>
                <li
                    class="list-group-item"
                    v-for="base_uri in summary_info['base_uris']"
                    v-bind:key="base_uri"
                >
                    {{ base_uri }}
                    <span class="badge badge-pill badge-secondary">{{
                    summary_info["datasets_per_base_uri"][base_uri]
                    }}</span>
                </li>
                <li
                    class="list-group-item"
                    v-for="creator in summary_info['creator_usernames']"
                    v-bind:key="creator"
                >
                    {{ creator }}
                    <span class="badge badge-pill badge-secondary">{{
                    summary_info["datasets_per_creator"][creator]
                    }}</span>
                </li>
            </ul>
        </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "SummaryInfo",
  props: {
    lookup_url: String,
    auth_str: String
  },
  data: function() {
    return {
      summary_info: null,
      loading: true,
      errored: false
    };
  },
  computed: {
    source: function() {
      return this.lookup_url + "/dataset/summary";
    }
  },
  mounted() {
    this.$http
      .get(this.source, { headers: { Authorization: this.auth_str } })
      .then(response => (this.summary_info = response.data))
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));
  }
};
</script>

<style></style>