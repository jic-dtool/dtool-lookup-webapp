<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-title class="text-body-1 py-2 bg-grey-lighten-4">
      Creators
    </v-card-title>
    <v-list density="compact" class="py-0" max-height="200" style="overflow-y: auto;">
      <v-list-item
        v-for="(creator, index) in summary_info['creator_usernames']"
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
            {{ summary_info["datasets_per_creator"][creator] }}
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
  name: "CreatorUsernameFilter",
  props: {
    summary_info: {
      type: Object as PropType<SummaryInfo>,
      required: true,
    },
  },
  emits: ["start-search"],
  data() {
    return {
      selectedCreators: [] as string[],
    };
  },
  computed: {
    canonicalSelectedCreators(): string[] {
      return this.$store.state.creator_usernames;
    },
  },
  methods: {
    toggleSelect(creator: string): void {
      if (this.selectedCreators.includes(creator)) {
        console.log("Unset creator username");
        // Remove item from array.
        this.selectedCreators.splice(
          this.selectedCreators.indexOf(creator),
          1
        );
        this.$store.commit("update_creator_usernames", this.selectedCreators);
        this.$emit("start-search");
      } else {
        console.log("Set base URI");
        this.selectedCreators.push(creator);
        this.$store.commit("update_creator_usernames", this.selectedCreators);
        this.$emit("start-search");
      }
    },
  },
});
</script>
