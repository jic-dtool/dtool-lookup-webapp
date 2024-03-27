<template>
  <div class="textSearch">
    <form class="form-inline" @submit.prevent>
      <div class="searchContainer d-flex align-items-center">
        <!-- Span for the JSON Checker label with tooltip -->
        <span
          class="jsonChecker"
          v-if="textQuery !== ''"
          v-b-tooltip.hover.top="
            'Enclose a JSON query in braces {} to have it interpreted as a direct MongoDB query.'
          "
        >
          {{ isJson ? "MongoDB query (MQL):" : "free text search:" }}
        </span>
        <!-- Input for the text query -->
        <input
          class="form-control"
          type="text"
          v-model="textQuery"
          @keyup.enter.prevent="startSearch"
          placeholder="Search..."
        />
      </div>
    </form>
  </div>
</template>

<script>
import { BTooltip } from "bootstrap-vue-next";
export default {
  name: "TextSearch",
  BTooltip,
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
  },
  methods: {
    startSearch() {
      if (this.isJson) {
        this.$store.commit("update_mongo_text", this.textQuery);
      } else {
        this.$store.commit("update_free_text", this.textQuery);
      }
      this.$emit("start-search");
    },
  },
};
</script>

<style>
.searchContainer {
  display: flex;
  align-items: center;
  gap: 8px; /* Spacing between elements */
  width: 100%; /* Ensure container takes full width */
}

.jsonChecker {
  color: #6f42c1; /* Soft purple for label text */
  flex-shrink: 0; /* Prevent the label from shrinking */
}

.form-control {
  border: 2px solid #6f42c1; /* A lighter shade of purple for border */
  flex-grow: 1; /* Allow the input to grow and fill the space */
  margin-right: auto; /* Push all subsequent elements to the right */
}

.jsonChecker {
  max-width: calc(50% - 4px); /* Adjust accordingly */
  white-space: nowrap; /* Keep the label text on a single line */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Add an ellipsis to truncated text */
}

.form-control {
  padding: 0.375rem 0.75rem;
}
</style>
