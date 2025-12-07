<template>
  <div class="search-container" :class="{ 'search-expanded': isFocused }">
    <v-tooltip
      v-if="textQuery !== ''"
      location="bottom"
    >
      <template #activator="{ props }">
        <span v-bind="props" class="text-caption text-primary mr-2 search-label" style="white-space: nowrap;">
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
      placeholder="Search datasets..."
      prepend-inner-icon="mdi-magnify"
      density="compact"
      variant="outlined"
      hide-details
      single-line
      rounded
      clearable
      class="search-field"
      @keyup.enter="startSearch"
      @click:clear="clearSearch"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "@/store";

const props = defineProps<{
  mongoplugin: string;
}>();

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();
const textQuery = ref("");
const isFocused = ref(false);

const isJson = computed(() => {
  if (textQuery.value === "") {
    return false;
  }
  try {
    JSON.parse(textQuery.value);
    return true;
  } catch {
    return false;
  }
});

const isJsonEnabled = computed(() => props.mongoplugin !== "N/A");

function startSearch(): void {
  if (isJsonEnabled.value && isJson.value) {
    store.updateMongoText(textQuery.value);
  } else {
    store.updateFreeText(textQuery.value);
  }
  emit("start-search");
}

function clearSearch(): void {
  textQuery.value = "";
  store.updateFreeText(null);
  store.updateMongoText(null);
  emit("start-search");
}
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  width: 280px;
  transition: width 0.3s ease;
}

.search-container.search-expanded {
  width: 480px;
}

.search-field {
  flex: 1;
}

.search-label {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .search-container {
    width: 200px;
  }

  .search-container.search-expanded {
    width: 320px;
  }
}

@media (max-width: 600px) {
  .search-container {
    width: 150px;
  }

  .search-container.search-expanded {
    width: 220px;
  }

  .search-label {
    display: none;
  }
}
</style>
