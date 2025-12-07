<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Locations
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(base_uri, index) in summary_info['base_uris']"
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
            {{ summary_info["datasets_per_base_uri"][base_uri] }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { SummaryInfo } from "@/types";

export default defineComponent({
  name: "BaseUriFilter",
  props: {
    summary_info: {
      type: Object as PropType<SummaryInfo>,
      required: true,
    },
  },
  emits: ["start-search"],
  data() {
    return {
      selectedBaseURIs: [] as string[],
    };
  },
  computed: {
    canonicalSelectedBaseURIs(): string[] {
      return this.$store.state.base_uris;
    },
  },
  methods: {
    toggleSelect(base_uri: string): void {
      if (this.selectedBaseURIs.includes(base_uri)) {
        console.log("Unset base URI");
        // Remove item from array.
        this.selectedBaseURIs.splice(
          this.selectedBaseURIs.indexOf(base_uri),
          1
        );
        this.$store.commit("update_base_uris", this.selectedBaseURIs);
        this.$emit("start-search");
      } else {
        console.log("Set base URI");
        this.selectedBaseURIs.push(base_uri);
        this.$store.commit("update_base_uris", this.selectedBaseURIs);
        this.$emit("start-search");
      }
    },
  },
});
</script>
