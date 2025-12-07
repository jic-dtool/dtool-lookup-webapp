<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Tags
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(tag, index) in summary_info.tags"
        :key="index"
        @click="toggleSelect(tag)"
        class="cursor-pointer"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="canonicalSelectedTags.includes(tag)"
            density="compact"
            hide-details
            @click.stop="toggleSelect(tag)"
          />
        </template>
        <v-list-item-title class="text-body-2">{{ tag }}</v-list-item-title>
        <template #append>
          <v-chip size="x-small" color="secondary" variant="flat">
            {{ summary_info.datasets_per_tag[tag] }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "@/store";
import type { SummaryInfo } from "@/types";

defineProps<{
  summary_info: SummaryInfo;
}>();

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();
const selectedTags = ref<string[]>([]);

const canonicalSelectedTags = computed(() => store.state.tags);

function toggleSelect(tag: string): void {
  if (selectedTags.value.includes(tag)) {
    console.log("Unset tag");
    selectedTags.value.splice(selectedTags.value.indexOf(tag), 1);
  } else {
    console.log("Set tag");
    selectedTags.value.push(tag);
  }
  store.commit("update_tags", selectedTags.value);
  emit("start-search");
}
</script>
