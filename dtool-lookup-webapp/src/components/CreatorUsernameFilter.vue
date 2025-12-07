<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Creators
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(creator, index) in summary_info.creator_usernames"
        :key="index"
        @click="toggleSelect(creator)"
        class="cursor-pointer"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="canonicalSelectedCreators.includes(creator)"
            density="compact"
            hide-details
            @click.stop="toggleSelect(creator)"
          />
        </template>
        <v-list-item-title class="text-body-2">{{ creator }}</v-list-item-title>
        <template #append>
          <v-chip size="x-small" color="secondary" variant="flat">
            {{ summary_info.datasets_per_creator[creator] }}
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

const props = defineProps<{
  summary_info: SummaryInfo;
}>();

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();
const selectedCreators = ref<string[]>([]);

const canonicalSelectedCreators = computed(() => store.creator_usernames);

function toggleSelect(creator: string): void {
  if (selectedCreators.value.includes(creator)) {
    console.log("Unset creator username");
    selectedCreators.value.splice(selectedCreators.value.indexOf(creator), 1);
  } else {
    console.log("Set creator username");
    selectedCreators.value.push(creator);
  }
  store.updateCreatorUsernames(selectedCreators.value);
  emit("start-search");
}
</script>
