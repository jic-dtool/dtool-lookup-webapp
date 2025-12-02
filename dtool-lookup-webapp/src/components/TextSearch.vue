<template>
  <div class="d-flex align-center">
    <v-tooltip
      v-if="textQuery !== ''"
      location="bottom"
    >
      <template #activator="{ props }">
        <span v-bind="props" class="text-caption text-primary mr-2" style="white-space: nowrap;">
          {{
            isJsonEnabled
              ? isJson
                ? "MongoDB query (MQL):"
                : "free text search:"
              : "free text search:"
          }}
        </span>
      </template>
      <span>Enclose a JSON query in braces {} to have it interpreted as a direct MongoDB query.</span>
    </v-tooltip>

    <v-text-field
      v-model="textQuery"
      placeholder="Search..."
      prepend-inner-icon="mdi-magnify"
      density="compact"
      variant="outlined"
      hide-details
      single-line
      style="min-width: 200px; max-width: 300px;"
      @keyup.enter="startSearch"
    />
  </div>
</template>

<script>
export default {
  name: "TextSearch",
  props: {
    mongoplugin: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      textQuery: "",
    };
  },
  computed: {
    isJson() {
      if (this.textQuery === "") {
        return false;
      }
      try {
        JSON.parse(this.textQuery);
        return true;
      } catch (e) {
        return false;
      }
    },
    isJsonEnabled() {
      return this.mongoplugin !== "N/A";
    },
  },
  methods: {
    startSearch() {
      if (this.isJsonEnabled && this.isJson) {
        this.$store.commit("update_mongo_text", this.textQuery);
      } else {
        this.$store.commit("update_free_text", this.textQuery);
      }
      this.$emit("start-search");
    },
  },
};
</script>
