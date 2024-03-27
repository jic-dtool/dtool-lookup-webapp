<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">Locations</h5>
    </div>
    <div class="card-body p-0">
      <div class="list-group">
        <li
          href=""
          class="list-group-item list-group-item-action"
          v-for="(base_uri, index) in summary_info['base_uris']"
          v-bind:key="index"
          @click="toggleSelect(base_uri)"
        >
          <div class="d-flex justify-content-between">
            <small>
              <input
                type="checkbox"
                v-bind:id="index + '-baseURI-checkbox'"
                v-model="canonicalSelectedBaseURIs"
                v-bind:value="base_uri"
              />
              <label v-bind:for="index + '-baseURI-checkbox'" @click.prevent>{{
                base_uri
              }}</label>
            </small>

            <small>
              <span class="badge badge-pill badge-secondary">{{
                summary_info["datasets_per_base_uri"][base_uri]
              }}</span>
            </small>
          </div>
        </li>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseUriFilter",
  props: {
    summary_info: Object,
  },
  data: function () {
    return {
      selectedBaseURIs: [],
    };
  },
  computed: {
    canonicalSelectedBaseURIs: function () {
      return this.$store.state.base_uris;
    },
  },
  methods: {
    toggleSelect: function (base_uri) {
      if (this.selectedBaseURIs.includes(base_uri)) {
        console.log("Unset base URI");
        // Remove item from array.
        this.selectedBaseURIs.splice(
          this.selectedBaseURIs.indexOf(base_uri),
          1
        );
        this.$store.commit("update_base_uris", this.selectedBaseURIs);
        this.$emit("start-search");
      } else {
        console.log("Set base URI");
        this.selectedBaseURIs.push(base_uri);
        this.$store.commit("update_base_uris", this.selectedBaseURIs);
        this.$emit("start-search");
      }
    },
  },
};
</script>

<style></style>
