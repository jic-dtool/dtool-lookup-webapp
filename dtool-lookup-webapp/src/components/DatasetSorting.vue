<template>
  <v-row align="center" dense>
    <!-- Left side: Contents per page -->
    <v-col cols="auto" class="d-flex align-center">
      <span class="text-body-2 mr-2">Contents per page:</span>
      <v-select
        v-model="selectedContentsPerPage"
        :items="perPageOptions"
        item-title="text"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="width: 90px;"
        @update:model-value="updatePerPage"
      />
    </v-col>

    <v-spacer />

    <!-- Right side: Sorting options -->
    <v-col cols="auto" class="d-flex align-center">
      <v-select
        v-model="selectedSortOption"
        :items="formattedOptions"
        item-title="text"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="width: 160px;"
        class="mr-2"
      />
      <v-btn
        color="primary"
        size="small"
        :icon="sortDirection === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
        @click="toggleSortDirection"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "DatasetSorting",
  data() {
    // Initialize selectedSortOption and sortDirection based on store state
    let initialSortOption = this.$store.state.selected_sort_option;
    let initialcontentsPerPage = this.$store.state.update_current_Per_Page;

    let initialSortDirection = "asc";
    if (initialSortOption.startsWith("-")) {
      initialSortDirection = "desc";
      initialSortOption = initialSortOption.substring(1);
    }
    return {
      selectedSortOption: initialSortOption,
      sortOptions: [
        "uri",
        "base_uri",
        "created_at",
        "creator_username",
        "frozen_at",
        "name",
        "uuid",
      ],
      sortDirection: initialSortDirection,
      selectedContentsPerPage: initialcontentsPerPage,
      perPageOptions: [
        { text: "10", value: 10 },
        { text: "20", value: 20 },
        { text: "50", value: 50 },
        { text: "100", value: 100 },
      ],
    };
  },
  computed: {
    // Format sortOptions for display in the dropdown
    formattedOptions() {
      return this.sortOptions.map((option) => ({
        text: option
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: option,
      }));
    },
    // Get the selectedSortValue with the correct prefix based on sortDirection
    selectedSortValue() {
      return this.sortDirection === "asc"
        ? this.selectedSortOption
        : `-${this.selectedSortOption}`;
    },
  },
  methods: {
    // Toggle the sortDirection and update the store and emit an event
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      this.$store.commit("update_selected_sort_option", this.selectedSortValue);
      this.$emit("start-search");
    },
    updatePerPage(perpage) {
      this.$store.commit("update_current_Per_Page", perpage);
      this.$emit("start-search");
    },
  },
  watch: {
    // Update the store and emit an event when selectedSortOption changes
    selectedSortOption() {
      this.$store.commit("update_selected_sort_option", this.selectedSortValue);
      this.$emit("start-search");
    },
  },
};
</script>
