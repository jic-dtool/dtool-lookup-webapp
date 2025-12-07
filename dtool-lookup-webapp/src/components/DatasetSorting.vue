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

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStore } from "@/store";

interface PerPageOption {
  text: string;
  value: number;
}

interface SortOption {
  text: string;
  value: string;
}

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();

// Initialize selectedSortOption and sortDirection based on store state
const getInitialSortOption = (): string => {
  const option = store.state.selected_sort_option;
  return option.startsWith("-") ? option.substring(1) : option;
};

const getInitialSortDirection = (): "asc" | "desc" => {
  return store.state.selected_sort_option.startsWith("-") ? "desc" : "asc";
};

const selectedSortOption = ref(getInitialSortOption());
const sortDirection = ref<"asc" | "desc">(getInitialSortDirection());
const selectedContentsPerPage = ref(store.state.update_current_Per_Page);

const sortOptions = [
  "frozen_at",
  "created_at",
  "name",
  "uuid",
  "creator_username",
  "uri",
  "base_uri",
];

const perPageOptions: PerPageOption[] = [
  { text: "10", value: 10 },
  { text: "20", value: 20 },
  { text: "50", value: 50 },
  { text: "100", value: 100 },
];

// Format sortOptions for display in the dropdown
const formattedOptions = computed<SortOption[]>(() => {
  return sortOptions.map((option) => ({
    text: option
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: option,
  }));
});

// Get the selectedSortValue with the correct prefix based on sortDirection
const selectedSortValue = computed(() => {
  return sortDirection.value === "asc"
    ? selectedSortOption.value
    : `-${selectedSortOption.value}`;
});

// Watch for changes to selectedSortOption
watch(selectedSortOption, () => {
  store.commit("update_selected_sort_option", selectedSortValue.value);
  emit("start-search");
});

// Toggle the sortDirection and update the store and emit an event
function toggleSortDirection(): void {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  store.commit("update_selected_sort_option", selectedSortValue.value);
  emit("start-search");
}

function updatePerPage(perpage: number): void {
  store.commit("update_current_Per_Page", perpage);
  emit("start-search");
}
</script>
