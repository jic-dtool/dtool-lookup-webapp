<template>
  <div class="w-100">
    <!-- Row 1: Name and metadata -->
    <div class="d-flex justify-space-between align-center flex-wrap">
      <h5 class="text-h6 font-weight-bold">{{ dataset.name }}</h5>
      <div class="text-caption text-grey-darken-1">
        Created by <em>{{ dataset.creator_username }}</em> on
        <em>{{ moment(dataset.created_at * 1000).format("YYYY-MM-DD") }}</em>,
        frozen on
        <em>{{ moment(dataset.frozen_at * 1000).format("YYYY-MM-DD") }}</em>
        <v-chip size="x-small" color="primary" class="ml-2">
          {{ numItems }} items
        </v-chip>
        <v-chip size="x-small" color="primary" class="ml-1">
          {{ filesize(total_size_in_bytes) }}
        </v-chip>
      </div>
    </div>

    <!-- Row 2: URI and Copy menu -->
    <div class="d-flex justify-space-between align-center mt-2">
      <span class="text-caption text-grey" style="font-family: monospace;">{{ dataset.uri }}</span>
      <v-menu location="bottom end" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn v-bind="props" size="small" variant="outlined" color="primary">
            Copy
          </v-btn>
        </template>
        <v-card min-width="320">
          <v-card-text class="text-body-2">
            The command below copies the dataset to the working directory.
          </v-card-text>
          <v-card-text class="pt-0">
            <v-text-field
              :model-value="copy_command"
              readonly
              density="compact"
              variant="outlined"
              hide-details
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-content-copy"
                  size="small"
                  variant="text"
                  @click="copyToClipboard(copy_command)"
                />
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <!-- Row 3: Tags and Tag menu -->
    <div class="d-flex justify-space-between align-center mt-2">
      <div v-if="currentTags.length > 0">
        <v-chip
          v-for="(tag, index) in currentTags"
          :key="index"
          size="small"
          color="primary"
          class="mr-1"
        >
          {{ tag }}
        </v-chip>
      </div>
      <v-alert v-else type="info" density="compact" variant="tonal" class="py-1">
        Use tags to organise your datasets!
      </v-alert>

      <v-menu location="bottom end" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn v-bind="props" size="small" variant="outlined" color="primary" append-icon="mdi-menu-down">
            Tag
          </v-btn>
        </template>
        <v-card min-width="400">
          <v-card-text class="text-body-2">
            The command below adds a tag to the dataset.
          </v-card-text>
          <v-card-text class="pt-0">
            <v-text-field
              v-model="tag_name"
              label="Tag"
              density="compact"
              variant="outlined"
              hide-details
              class="mb-2"
            />
            <v-text-field
              :model-value="tag_command"
              readonly
              density="compact"
              variant="outlined"
              hide-details
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-content-copy"
                  size="small"
                  variant="text"
                  @click="copyToClipboard(tag_command)"
                />
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script>
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
  methods: {
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
  },
};
</script>
