<template>
  <div class="w-100">
    <h6 class="text-subtitle-1 font-weight-medium mb-2">
      Items <span class="text-caption text-grey">({{ numItems }})</span>
    </h6>

    <v-list density="compact" class="py-0" max-height="300" style="overflow-y: auto;">
      <v-list-item
        v-for="(item, id) in manifest.items"
        :key="id"
        class="border-b px-0"
        @mouseenter="update_fetch_identifier(id)"
      >
        <template #default>
          <div class="py-1">
            <!-- Row 1: Path and Size -->
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 font-weight-medium">{{ item.relpath }}</span>
              <span class="text-caption text-grey">{{ filesize(item.size_in_bytes) }}</span>
            </div>

            <!-- Row 2: ID and Fetch menu -->
            <div class="d-flex justify-space-between align-center mt-1">
              <span class="text-caption text-grey" style="font-family: monospace;">{{ id }}</span>
              <v-menu location="start" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="x-small" variant="text" color="primary">
                    Fetch
                  </v-btn>
                </template>
                <v-card min-width="440">
                  <v-card-text class="text-body-2">
                    The command below fetches the dataset item and returns an absolute path on disk from where it can be accessed.
                  </v-card-text>
                  <v-card-text class="pt-0">
                    <v-text-field
                      :model-value="fetch_command"
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
                          @click="copyToClipboard(fetch_command)"
                        />
                      </template>
                    </v-text-field>
                  </v-card-text>
                </v-card>
              </v-menu>
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
var filesize = require("filesize");

export default {
  name: "DatasetManifest",
  data: function () {
    return {
      filesize: filesize,
      fetch_identifier: null,
    };
  },
  computed: {
    manifest: function () {
      return this.$store.state.current_dataset_manifest;
    },
    numItems: function () {
      return this.manifest && this.manifest.items
        ? Object.values(this.manifest.items).length
        : 0;
    },
    fetch_command: function () {
      return (
        "dtool item fetch " +
        this.$store.state.current_dataset.uri +
        " " +
        this.fetch_identifier
      );
    },
  },
  methods: {
    update_fetch_identifier(identifier) {
      console.log("update_fetch_identifer: " + identifier);
      this.fetch_identifier = identifier;
    },
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

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
