<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Tags
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(tag, index) in summary_info['tags']"
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
            {{ summary_info["datasets_per_tag"][tag] }}
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
  name: "TagFilter",
  props: {
    summary_info: {
      type: Object as PropType<SummaryInfo>,
      required: true,
    },
  },
  emits: ["start-search"],
  data() {
    return {
      selectedTags: [] as string[],
    };
  },
  computed: {
    canonicalSelectedTags(): string[] {
      return this.$store.state.tags;
    },
  },
  methods: {
    startSearch(): void {
      this.$store.commit("update_tags", this.selectedTags);
      this.$emit("start-search");
    },
    toggleSelect(tag: string): void {
      if (this.selectedTags.includes(tag)) {
        console.log("Unset tag?");
        // Remove item from array.
        this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
        this.startSearch();
      } else {
        console.log("Set tag?");
        this.selectedTags.push(tag);
        this.startSearch();
      }
    },
  },
});
</script>
