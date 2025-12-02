<template>
  <div v-if="getReadmeContent">
    <!-- Header with Edit menu -->
    <div class="d-flex justify-space-between align-center mb-2">
      <h6 class="text-subtitle-1 font-weight-medium">Readme</h6>
      <v-menu location="bottom end" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn v-bind="props" size="small" variant="outlined" color="primary">
            Edit
          </v-btn>
        </template>
        <v-card min-width="440">
          <v-card-text class="text-body-2">
            The command below helps to edit the README and update it in the dataset.
          </v-card-text>
          <v-card-text class="pt-0">
            <v-text-field
              :model-value="edit_command"
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
                  @click="copyToClipboard(edit_command)"
                />
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <!-- Readme content -->
    <v-sheet
      class="readme-container pa-3"
      color="grey-lighten-4"
      rounded
    >
      <pre class="text-body-2 ma-0">{{ getReadmeContent }}</pre>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "DatasetReadme",
  computed: {
    getReadmeContent() {
      // Accessing the string content of the 'readme' key directly
      // Ensure the content is trimmed to check for non-blank content
      return this.$store.state.current_dataset_readme.readme.trim();
    },
    edit_command: function () {
      return "dtool readme edit " + this.$store.state.current_dataset.uri;
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

<style scoped>
.readme-container {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: auto;
}

.readme-container pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
