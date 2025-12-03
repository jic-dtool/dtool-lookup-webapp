<template>
  <v-list density="compact" class="py-0">
    <v-list-item
      v-for="(dataset, index) in datasetHits"
      :key="dataset.uri || index"
      :active="selected === index"
      @click="updateSelectedDataset(index)"
      class="border-b"
    >
      <template #default>
        <div class="py-1">
          <!-- Row 1: Name and Date -->
          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-2 font-weight-medium">{{ dataset.name }}</span>
            <span class="text-caption text-grey">
              {{ moment(dataset.created_at * 1000).format("YYYY-MM-DD") }}
            </span>
          </div>

          <!-- Row 2: Creator and UUID -->
          <div class="d-flex justify-space-between align-center mt-1">
            <span class="text-caption text-grey-darken-1">{{ dataset.creator_username }}</span>
            <span class="text-caption text-grey" style="font-family: monospace;">{{ dataset.uuid }}</span>
          </div>

          <!-- Row 3: Tags -->
          <div v-if="dataset.tags && dataset.tags.length" class="mt-1">
            <v-chip
              v-for="(tag, tagIndex) in dataset.tags"
              :key="tagIndex"
              size="x-small"
              color="primary"
              class="mr-1"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
import moment from "moment";

export default {
  name: "DatasetTable",
  props: {
    datasetHits: Array,
    responseheaders: {},
  },
  computed: {
    selected: function () {
      return this.$store.state.current_dataset_index;
    },
  },
  methods: {
    moment(timestamp) {
      return moment(timestamp);
    },
    updateSelectedDataset: function (index) {
      this.$store.commit("update_current_dataset_index", index);
      this.$store.commit("update_current_dataset", this.datasetHits[index]);
      this.$emit("update-dataset");
    },
  },
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
