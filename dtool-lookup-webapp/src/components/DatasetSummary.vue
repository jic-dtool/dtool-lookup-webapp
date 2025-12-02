<template>
  <div>
    <div class="d-flex justify-content-between flex-row">
      <h3 class="p-1">{{ dataset.name }}</h3>
      <small class="p-1">
        Created by <em>{{ dataset.creator_username }}</em> on
        <em>{{ moment(dataset.created_at * 1000).format("YYYY-MM-DD") }}</em
        >, frozen on
        <em>{{ moment(dataset.frozen_at * 1000).format("YYYY-MM-DD") }}</em
        >&nbsp;
        <span class="badge badge-pill badge-info bg-primary"
          >{{ numItems }} items</span
        >&nbsp;
        <span class="badge badge-pill badge-info bg-primary">{{
          filesize(total_size_in_bytes)
        }}</span>
      </small>
    </div>
    <div class="d-flex align-items-start justify-content-between flex-row">
      <small class="p-1">{{ dataset.uri }}</small>
      <BDropdown end size="sm" class="p-0">
        <template #button-content> Copy </template>

        <template #default>
          <div class="container centered-content">
            <!-- Dropdown text for descriptive content -->
            <BDropdownText>
              The command below copies the dataset to the working directory.
            </BDropdownText>
          </div>

          <!-- Dropdown form containing input group, form input, and button -->
          <BDropdownForm style="width: 300px">
            <template #default>
              <BInputGroup>
                <BFormInput
                  readonly
                  v-model="copy_command"
                  size="sm"
                />
                <BButton
                  size="sm"
                  variant="outline-secondary"
                  v-clipboard:copy="copy_command"
                >
                  <span class="octicon octicon-clippy"></span>
                </BButton>
              </BInputGroup>
            </template>
          </BDropdownForm>
        </template>
      </BDropdown>
    </div>
    <div class="d-flex flex-sm-row align-items-start justify-content-between">
      <div v-if="currentTags.length > 0" class="p-0">
        <template v-for="(tag, index) in currentTags" :key="index">
          <h5>
            <span class="badge badge-pill badge-info bg-primary">{{ tag }}</span
            >{{ "&nbsp;" }}
          </h5>
        </template>
      </div>

      <div v-else class="alert alert-info p-1" role="alert">
        Use tags to organise your datasets!
      </div>

      <BDropdown end size="sm" class="pt-1" no-caret auto-close="outside">
        <template #button-content>
          Tag <span class="dropdown-toggle"></span>
        </template>

        <template #default>
          <div class="container centered-content">
            <!-- Dropdown text for descriptive content -->
            <BDropdownText>
              The command below adds a tag to the dataset.
            </BDropdownText>
          </div>

          <!-- Dropdown form containing input group for tag name and command -->
          <BDropdownForm style="width: 400px">
            <template #default>
              <!-- Input group for entering a tag name -->
              <BInputGroup size="sm">
                <template #prepend>
                  <span class="input-group-text">Tag</span>
                </template>
                <BFormInput v-model="tag_name" size="sm" />
              </BInputGroup>

              <!-- Input group for displaying the tag command -->
              <BInputGroup class="mt-2">
                <BFormInput
                  readonly
                  v-model="tag_command"
                  size="sm"
                />
                <BButton
                  size="sm"
                  variant="outline-secondary"
                  v-clipboard:copy="tag_command"
                >
                  <span class="octicon octicon-clippy"></span>
                </BButton>
              </BInputGroup>
            </template>
          </BDropdownForm>
        </template>
      </BDropdown>
    </div>
  </div>
</template>

<script>
import {
  BDropdown,
  BDropdownText,
  BDropdownForm,
  BInputGroup,
  BFormInput,
  BButton,
} from "bootstrap-vue-next";

var filesize = require("filesize");
var moment = require("moment");

export default {
  name: "DatasetSummary",
  data: function () {
    return {
      filesize: filesize,
      moment: moment,
      tag_name: null,
    };
  },
  computed: {
    dataset: function () {
      return this.$store.state.current_dataset;
    },
    numItems: function () {
      return this.$store.state.current_dataset_manifest &&
        this.$store.state.current_dataset_manifest.items
        ? Object.values(this.$store.state.current_dataset_manifest.items).length
        : 0;
    },
    total_size_in_bytes: function () {
      var total = 0;
      Object.values(this.$store.state.current_dataset_manifest.items).forEach(
        (item) => {
          total = total + item.size_in_bytes;
        }
      );
      return total;
    },
    copy_command: function () {
      return "dtool cp " + this.dataset.uri + " .";
    },
    tag_command: function () {
      return "dtool tag set " + this.dataset.uri + " " + this.tag_name;
    },
    currentTags() {
      // Check if `current_dataset_tags` exists and has a `tags` property
      if (
        this.$store.state.current_dataset_tags &&
        this.$store.state.current_dataset_tags.tags
      ) {
        return this.$store.state.current_dataset_tags.tags;
      }
      // Return an empty array if `current_dataset_tags` is null or doesn't have a `tags` property
      return [];
    },
  },

  components: {
    BDropdown,
    BDropdownText,
    BDropdownForm,
    BInputGroup,
    BFormInput,
    BButton,
  },
};
</script>

<style></style>
