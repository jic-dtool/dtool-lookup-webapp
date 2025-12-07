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

<script lang="ts">
import { defineComponent } from "vue";

interface PerPageOption {
  text: string;
  value: number;
}

interface SortOption {
  text: string;
  value: string;
}

export default defineComponent({
  name: "DatasetSorting",
  emits: ["start-search"],
  data() {
    // Initialize selectedSortOption and sortDirection based on store state
    let initialSortOption = this.$store.state.selected_sort_option;
    const initialcontentsPerPage = this.$store.state.update_current_Per_Page;

    let initialSortDirection: "asc" | "desc" = "asc";
    if (initialSortOption.startsWith("-")) {
      initialSortDirection = "desc";
      initialSortOption = initialSortOption.substring(1);
    }
    return {
      selectedSortOption: initialSortOption,
      sortOptions: [
        "frozen_at",
        "created_at",
        "name",
        "uuid",
        "creator_username",
        "uri",
        "base_uri",
      ] as string[],
      sortDirection: initialSortDirection,
      selectedContentsPerPage: initialcontentsPerPage,
      perPageOptions: [
        { text: "10", value: 10 },
        { text: "20", value: 20 },
        { text: "50", value: 50 },
        { text: "100", value: 100 },
      ] as PerPageOption[],
    };
  },
  computed: {
    // Format sortOptions for display in the dropdown
    formattedOptions(): SortOption[] {
      return this.sortOptions.map((option) => ({
        text: option
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: option,
      }));
    },
    // Get the selectedSortValue with the correct prefix based on sortDirection
    selectedSortValue(): string {
      return this.sortDirection === "asc"
        ? this.selectedSortOption
        : `-${this.selectedSortOption}`;
    },
  },
  watch: {
    // Update the store and emit an event when selectedSortOption changes
    selectedSortOption(): void {
      this.$store.commit("update_selected_sort_option", this.selectedSortValue);
      this.$emit("start-search");
    },
  },
  methods: {
    // Toggle the sortDirection and update the store and emit an event
    toggleSortDirection(): void {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      this.$store.commit("update_selected_sort_option", this.selectedSortValue);
      this.$emit("start-search");
    },
    updatePerPage(perpage: number): void {
      this.$store.commit("update_current_Per_Page", perpage);
      this.$emit("start-search");
    },
  },
});
</script>
