<template>
  <div v-if="Object.keys(filteredAnnotations).length > 0" class="annotations-section">
    <div
      v-for="(details, annotationName, index) in filteredAnnotations"
      :key="String(annotationName) || index"
      class="mb-4"
    >
      <v-card variant="outlined" rounded="lg">
        <v-card-item density="compact">
          <template #prepend>
            <v-icon size="small" color="primary">mdi-tag-text</v-icon>
          </template>
          <v-card-title class="text-body-2 font-weight-medium">
            {{ capitalizeFirstLetter(String(annotationName)) }}
          </v-card-title>
          <template #append>
            <v-menu location="bottom end" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn v-bind="props" size="small" variant="tonal" color="primary" prepend-icon="mdi-plus">
                  Add
                </v-btn>
              </template>
              <v-card min-width="400" rounded="lg">
                <v-card-text class="text-body-2 pb-2">
                  Add a new key-value pair to this annotation:
                </v-card-text>
                <v-card-text class="pt-0">
                  <v-text-field
                    v-model="newKey"
                    label="Key"
                    density="compact"
                    variant="outlined"
                    hide-details
                    rounded="lg"
                    class="mb-3"
                  />
                  <v-text-field
                    v-model="newValue"
                    label="Value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    rounded="lg"
                    class="mb-3"
                  />
                  <v-text-field
                    :model-value="computedCreateCommand"
                    readonly
                    density="compact"
                    variant="outlined"
                    hide-details
                    rounded="lg"
                    bg-color="grey-lighten-4"
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
          </template>
        </v-card-item>
        <v-divider />
        <v-list class="annotation-list pa-2" bg-color="transparent">
          <v-list-item
            v-for="(value, propertyName, subIndex) in details"
            :key="`details-${index}-${subIndex}`"
            rounded="lg"
            class="annotation-item mb-1"
          >
            <template #prepend>
              <v-avatar size="32" color="grey-lighten-3" rounded="lg" class="mr-3">
                <v-icon size="14" color="grey-darken-1">mdi-key</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ propertyName }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
              {{ value }}
            </v-list-item-subtitle>
            <template #append>
              <v-menu location="start" :close-on-content-click="false" @update:model-value="resetEditableValue">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="small"
                    variant="tonal"
                    color="primary"
                    icon="mdi-pencil"
                  />
                </template>
                <v-card min-width="440" rounded="lg">
                  <v-card-text class="text-body-2 pb-2">
                    Update the value for <strong>{{ propertyName }}</strong>:
                  </v-card-text>
                  <v-card-text class="pt-0">
                    <v-text-field
                      v-model="editableValue"
                      :label="String(propertyName)"
                      :placeholder="String(value)"
                      density="compact"
                      variant="outlined"
                      hide-details
                      rounded="lg"
                      class="mb-3"
                    />
                    <v-text-field
                      :model-value="generateSetCommand(String(propertyName), editableValue || String(value))"
                      readonly
                      density="compact"
                      variant="outlined"
                      hide-details
                      rounded="lg"
                      bg-color="grey-lighten-4"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-content-copy"
                          size="small"
                          variant="text"
                          @click="copyToClipboard(generateSetCommand(String(propertyName), editableValue || String(value)))"
                        />
                      </template>
                    </v-text-field>
                  </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { Annotations } from "@/types";

export default defineComponent({
  name: "DatasetAnnotations",
  data() {
    return {
      newKey: "",
      newValue: "",
      editableValue: "",
    };
  },
  computed: {
    annotations(): Annotations {
      return this.$store.state.current_dataset_annotations || {};
    },
    filteredAnnotations(): Annotations {
      const filtered: Annotations = {};
      for (const annotationName in this.annotations) {
        if (this.hasNonEmptyValues(this.annotations[annotationName])) {
          filtered[annotationName] = this.annotations[annotationName];
        }
      }
      return filtered;
    },
    computedCreateCommand(): string {
      if (!this.$store.state.current_dataset) return "";
      return `dtool annotation set ${this.$store.state.current_dataset.uri} ${this.newKey} ${this.newValue}`;
    },
  },
  methods: {
    capitalizeFirstLetter(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    hasNonEmptyValues(annotation: Record<string, unknown>): boolean {
      for (const key in annotation) {
        if (annotation[key]) {
          return true;
        }
      }
      return false;
    },
    generateSetCommand(propertyName: string, value: string): string {
      if (!this.$store.state.current_dataset) return "";
      return `dtool annotation set ${this.$store.state.current_dataset.uri} ${propertyName} ${value}`;
    },
    resetEditableValue(): void {
      this.editableValue = "";
    },
    async copyToClipboard(text: string): Promise<void> {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
  },
});
</script>

<style scoped>
.annotations-section {
  /* Parent container handles spacing */
}

.annotation-list {
  max-height: 250px;
  overflow-y: auto;
}

.annotation-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.annotation-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
