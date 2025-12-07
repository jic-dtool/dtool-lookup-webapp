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
</script>
