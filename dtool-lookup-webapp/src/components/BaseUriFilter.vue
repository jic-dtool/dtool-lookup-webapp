<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Locations
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(base_uri, index) in summary_info.base_uris"
        :key="index"
        @click="toggleSelect(base_uri)"
        class="cursor-pointer"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="canonicalSelectedBaseURIs.includes(base_uri)"
            density="compact"
            hide-details
            @click.stop="toggleSelect(base_uri)"
          />
        </template>
        <v-list-item-title class="text-body-2">{{ base_uri }}</v-list-item-title>
        <template #append>
          <v-chip size="x-small" color="secondary" variant="flat">
            {{ summary_info.datasets_per_base_uri[base_uri] }}
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
const selectedBaseURIs = ref<string[]>([]);

const canonicalSelectedBaseURIs = computed(() => store.state.base_uris);

function toggleSelect(base_uri: string): void {
  if (selectedBaseURIs.value.includes(base_uri)) {
    console.log("Unset base URI");
    selectedBaseURIs.value.splice(selectedBaseURIs.value.indexOf(base_uri), 1);
  } else {
    console.log("Set base URI");
    selectedBaseURIs.value.push(base_uri);
  }
  store.commit("update_base_uris", selectedBaseURIs.value);
  emit("start-search");
}
</script>
