<template>
  <div>
    <!-- Loop through each filtered annotation that has non-empty values -->
    <div
      v-for="(details, annotationName, index) in filteredAnnotations"
      :key="index"
      class="mb-4"
    >
      <!-- Header with Create menu -->
      <div class="d-flex justify-space-between align-center mb-2">
        <h6 class="text-subtitle-1 font-weight-medium">
          {{ capitalizeFirstLetter(annotationName) }}
        </h6>
        <v-menu location="bottom end" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" size="small" variant="outlined" color="primary" append-icon="mdi-menu-down">
              Create
            </v-btn>
          </template>
          <v-card min-width="400">
            <v-card-text class="text-body-2">
              The command below creates a key-value pair for the annotation and updates it in the dataset.
            </v-card-text>
            <v-card-text class="pt-0">
              <v-text-field
                v-model="newKey"
                label="Key"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
              />
              <v-text-field
                v-model="newValue"
                label="Value"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
              />
              <v-text-field
                :model-value="computedCreateCommand"
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
                    @click="copyToClipboard(computedCreateCommand)"
                  />
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>

      <!-- Annotations table -->
      <v-table density="compact" class="rounded">
        <thead>
          <tr>
            <th class="text-left">Key</th>
            <th class="text-left">Value</th>
            <th style="width: 80px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, propertyName, subIndex) in details"
            :key="`details-${index}-${subIndex}`"
          >
            <td class="text-body-2">{{ propertyName }}</td>
            <td class="text-body-2">{{ value }}</td>
            <td class="text-right">
              <v-menu location="start" :close-on-content-click="false" @update:model-value="resetEditableValue">
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="small" variant="text" color="primary">
                    Set
                  </v-btn>
                </template>
                <v-card min-width="440">
                  <v-card-text class="text-body-2">
                    The command below helps to set the annotation.
                  </v-card-text>
                  <v-card-text class="pt-0">
                    <v-text-field
                      v-model="editableValue"
                      :label="propertyName"
                      :placeholder="String(value)"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="mb-2"
                    />
                    <v-text-field
                      :model-value="generateSetCommand(propertyName, editableValue || value)"
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
                          @click="copyToClipboard(generateSetCommand(propertyName, editableValue || value))"
                        />
                      </template>
                    </v-text-field>
                  </v-card-text>
                </v-card>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script>
export default {
  name: "DatasetAnnotations",
  data() {
    return {
      newKey: "",
      newValue: "",
      editableValue: "",
    };
  },
  computed: {
    annotations() {
      return this.$store.state.current_dataset_annotations;
    },
    filteredAnnotations() {
      let filtered = {};
      for (let annotationName in this.annotations) {
        if (this.hasNonEmptyValues(this.annotations[annotationName])) {
          filtered[annotationName] = this.annotations[annotationName];
        }
      }
      return filtered;
    },
    computedCreateCommand() {
      return `dtool annotation set ${this.$store.state.current_dataset.uri} ${this.newKey} ${this.newValue}`;
    },
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    hasNonEmptyValues(annotation) {
      for (let key in annotation) {
        if (annotation[key]) {
          return true;
        }
      }
      return false;
    },
    generateSetCommand(propertyName, value) {
      return `dtool annotation set ${this.$store.state.current_dataset.uri} ${propertyName} ${value}`;
    },
    resetEditableValue() {
      this.editableValue = "";
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
