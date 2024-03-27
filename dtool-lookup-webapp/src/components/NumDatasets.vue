<template>
  <div class="card">
    <div class="card-body p-0">
      <div class="list-group">
        <a
          @click.prevent="clearFilters()"
          class="list-group-item list-group-item-action"
        >
          <div class="d-flex justify-content-between">
            <small> All </small>
            <small>
              <span class="badge badge-pill badge-primary dataset-count">{{
                summary_info.number_of_datasets
              }}</span>
            </small>
          </div>
        </a>

        <a class="list-group-item">
          <div class="d-flex justify-content-between">
            <small> Filtered </small>
            <small>
              <span class="badge badge-pill badge-secondary dataset-count">{{
                this.$store.state.num_filtered
              }}</span>
            </small>
          </div>
        </a>

        <div class="list-group-item">
          <div>
            <small> Contents per Page </small>
            <div class="mt-3">
              <b-button-group size="sm" class="w-100">
                <b-button
                  v-for="option in perPageOptions"
                  :key="option"
                  @click="updatePerPage(option)"
                  @dblclick.prevent="clearSelection()"
                  :variant="
                    selectedPerPage === option ? 'primary' : 'outline-info'
                  "
                  class="flex-grow-1"
                  :class="{ 'selected-button': selectedPerPage === option }"
                >
                  {{ option }}
                </b-button>
              </b-button-group>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BButton, BButtonGroup } from "bootstrap-vue-next";

export default {
  name: "NumDatasets",
  components: {
    BButton,
    BButtonGroup,
  },
  props: {
    summary_info: Object,
  },
  data() {
    return {
      selectedPerPage: 10,
      perPageOptions: [10, 20, 50, 100], // Your page size options
    };
  },
  methods: {
    clearFilters() {
      this.$store.commit("clear_all");
      this.$emit("start-search");
    },
    updatePerPage(perpage) {
      this.selectedPerPage = this.selectedPerPage === perpage ? null : perpage; // Toggle selection
      this.$store.commit("update_current_Per_Page", perpage);
      this.$emit("start-search");
    },
    clearSelection() {
      this.selectedPerPage = null; // Clear selection on double-click
    },
  },
};
</script>

<style scoped>
.dataset-count {
  color: #000; /* Change text color to black */
}
</style>
