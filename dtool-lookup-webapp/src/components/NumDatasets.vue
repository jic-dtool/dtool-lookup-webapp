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
              {{ $store.state.num_filtered }}
            </v-chip>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { SummaryInfo } from "@/types";

export default defineComponent({
  name: "NumDatasets",
  props: {
    summary_info: {
      type: Object as PropType<SummaryInfo>,
      required: true,
    },
  },
  emits: ["start-search"],
  methods: {
    clearFilters(): void {
      this.$store.commit("clear_all");
      this.$emit("start-search");
    },
  },
});
</script>
