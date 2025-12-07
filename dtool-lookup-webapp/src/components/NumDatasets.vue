<template>
  <v-card variant="outlined" class="mb-2">
    <v-list density="compact" class="py-0">
      <v-list-item @click="clearFilters()" class="cursor-pointer">
        <template #default>
          <div class="d-flex justify-space-between align-center w-100">
            <span class="text-body-2">All</span>
            <v-chip size="small" color="primary" variant="flat">
              {{ summary_info.number_of_datasets }}
            </v-chip>
          </div>
        </template>
      </v-list-item>

      <v-divider />

      <v-list-item>
        <template #default>
          <div class="d-flex justify-space-between align-center w-100">
            <span class="text-body-2">Filtered</span>
            <v-chip size="small" color="secondary" variant="flat">
              {{ numFiltered }}
            </v-chip>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import type { SummaryInfo } from "@/types";

defineProps<{
  summary_info: SummaryInfo;
}>();

const emit = defineEmits<{
  (e: "start-search"): void;
}>();

const store = useStore();

const numFiltered = computed(() => store.num_filtered);

function clearFilters(): void {
  store.clearAll();
  emit("start-search");
}
</script>
