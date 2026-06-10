<template>
  <div v-if="dataset" class="dataset-summary">
    <!-- URI Section -->
    <v-card variant="outlined" class="mb-4" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-link-variant</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium">URI</v-card-title>
        <template #append>
          <v-menu location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-content-copy"
              >
                Copy
              </v-btn>
            </template>
            <v-card min-width="360" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Copy this dataset to your working directory:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  :model-value="copy_command"
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
                      @click="copyToClipboard(copy_command)"
                    />
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-card-item>
      <v-card-text class="pt-0">
        <code class="uri-text text-body-2">{{ displayUri }}</code>
      </v-card-text>
    </v-card>

    <!-- Tags Section -->
    <v-card variant="outlined" class="mb-4" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-tag-multiple</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium">Tags</v-card-title>
        <template #append>
          <v-menu
            v-model="addTagMenu"
            location="bottom end"
            :close-on-content-click="false"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-tag-plus"
              >
                Add Tag
              </v-btn>
            </template>
            <v-card min-width="300" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Add a tag to this dataset:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  v-model="newTagName"
                  label="Tag name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  class="mb-3"
                  :disabled="saving"
                  @keyup.enter="addTag"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn
                    size="small"
                    variant="text"
                    @click="addTagMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="primary"
                    :loading="saving"
                    :disabled="!newTagName?.trim()"
                    @click="addTag"
                  >
                    Add
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-card-item>
      <v-card-text class="pt-0">
        <div v-if="currentTags.length > 0" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="(tag, index) in currentTags"
            :key="index"
            variant="tonal"
            color="primary"
            size="small"
            label
            closable
            :disabled="saving"
            @click:close="removeTag(tag)"
          >
            {{ tag }}
          </v-chip>
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          No tags yet. Add tags to organize your datasets.
        </div>
      </v-card-text>
    </v-card>

    <!-- Annotations Section -->
    <v-card variant="outlined" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-tag-text</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium"
          >Annotations</v-card-title
        >
        <template #append>
          <v-menu
            v-model="addAnnotationMenu"
            location="bottom end"
            :close-on-content-click="false"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
              >
                Add Annotation
              </v-btn>
            </template>
            <v-card min-width="320" rounded="lg">
              <v-card-text class="text-body-2 pb-2">
                Add an annotation to this dataset:
              </v-card-text>
              <v-card-text class="pt-0">
                <v-text-field
                  v-model="newAnnotationKey"
                  label="Key"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  class="mb-3"
                  :disabled="saving"
                />
                <v-text-field
                  v-model="newAnnotationValue"
                  label="Value"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  class="mb-3"
                  :disabled="saving"
                  @keyup.enter="addAnnotation"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn
                    size="small"
                    variant="text"
                    @click="addAnnotationMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="primary"
                    :loading="saving"
                    :disabled="!newAnnotationKey?.trim()"
                    @click="addAnnotation"
                  >
                    Add
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-card-item>
      <v-card-text class="pt-0">
        <div v-if="annotationEntries.length > 0">
          <v-list
            density="compact"
            class="annotation-list pa-0"
            bg-color="transparent"
          >
            <v-list-item
              v-for="([key, value], index) in annotationEntries"
              :key="index"
              rounded="lg"
              class="annotation-item mb-1 px-2"
            >
              <template #prepend>
                <v-avatar
                  size="28"
                  color="grey-lighten-3"
                  rounded="lg"
                  class="mr-2"
                >
                  <v-icon size="12" color="grey-darken-1">mdi-key</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ key }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
                {{ formatAnnotationValue(value) }}
              </v-list-item-subtitle>
              <template #append>
                <v-menu
                  :model-value="editingAnnotationKey === key"
                  location="start"
                  :close-on-content-click="false"
                  @update:model-value="toggleEditMenu(key, $event)"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="x-small"
                      variant="text"
                      color="primary"
                      icon="mdi-pencil"
                      class="mr-1"
                      :disabled="saving"
                    />
                  </template>
                  <v-card min-width="300" rounded="lg">
                    <v-card-text class="text-body-2 pb-2">
                      Update value for <strong>{{ key }}</strong
                      >:
                    </v-card-text>
                    <v-card-text class="pt-0">
                      <v-text-field
                        v-model="editAnnotationValue"
                        :label="key"
                        :placeholder="String(value)"
                        density="compact"
                        variant="outlined"
                        hide-details
                        rounded="lg"
                        class="mb-3"
                        :disabled="saving"
                        @keyup.enter="updateAnnotation(key)"
                      />
                      <div class="d-flex justify-end ga-2">
                        <v-btn
                          size="small"
                          variant="text"
                          @click="cancelEditAnnotation"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          size="small"
                          variant="tonal"
                          color="primary"
                          :loading="saving"
                          @click="updateAnnotation(key)"
                        >
                          Update
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-menu>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="error"
                  icon="mdi-delete"
                  :disabled="saving"
                  @click="deleteAnnotation(key)"
                />
              </template>
            </v-list-item>
          </v-list>
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          No annotations yet. Add key-value annotations for metadata.
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "@/store";
import { useNotificationStore } from "@/stores/notifications";
import { dserverApi } from "@/services/dserverApi";
import type { Dataset } from "@/types";

const store = useStore();
const notifications = useNotificationStore();

// Form state
const newTagName = ref<string>("");
const addTagMenu = ref(false);
const newAnnotationKey = ref<string>("");
const newAnnotationValue = ref<string>("");
const addAnnotationMenu = ref(false);
const editingAnnotationKey = ref<string | null>(null);
const editAnnotationValue = ref<string>("");
const saving = ref(false);

// Computed properties
const dataset = computed<Dataset | null>(() => {
  return store.current_dataset;
});

const displayUri = computed(() => {
  if (!dataset.value) return "";
  if (store.hasSignedUrlPlugin) {
    const lookupUrl = store.lookup_url;
    if (lookupUrl) {
      try {
        const url = new URL(lookupUrl);
        return `dserver://${url.host}/${dataset.value.uuid}`;
      } catch {
        return dataset.value.uri;
      }
    }
  }
  return dataset.value.uri;
});

const copy_command = computed(() => {
  if (!dataset.value) return "";
  return "dtool cp " + displayUri.value + " .";
});

const currentTags = computed<string[]>(() => {
  if (store.current_dataset_tags && store.current_dataset_tags.tags) {
    return store.current_dataset_tags.tags;
  }
  return [];
});

const currentAnnotations = computed<Record<string, unknown>>(() => {
  if (
    store.current_dataset_annotations &&
    store.current_dataset_annotations.annotations
  ) {
    return store.current_dataset_annotations.annotations;
  }
  return {};
});

const annotationEntries = computed<[string, unknown][]>(() => {
  return Object.entries(currentAnnotations.value);
});

function formatAnnotationValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Annotation edit menu state (tracked per key so editors don't share text)
function toggleEditMenu(key: string, open: boolean): void {
  if (open) {
    editingAnnotationKey.value = key;
    editAnnotationValue.value = "";
  } else if (editingAnnotationKey.value === key) {
    editingAnnotationKey.value = null;
    editAnnotationValue.value = "";
  }
}

function cancelEditAnnotation(): void {
  editingAnnotationKey.value = null;
  editAnnotationValue.value = "";
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    notifications.success("Copied to clipboard");
  } catch (err) {
    console.error("Failed to copy:", err);
    notifications.error("Failed to copy to clipboard");
  }
}

// Tag operations
async function addTag(): Promise<void> {
  const tagToAdd = newTagName.value?.trim();
  if (!tagToAdd || !dataset.value) return;

  if (currentTags.value.includes(tagToAdd)) {
    notifications.warning("Tag already exists");
    return;
  }

  const uri = dataset.value.uri;
  saving.value = true;
  try {
    const result = await dserverApi.addTag(uri, tagToAdd);
    if (store.current_dataset?.uri !== uri) return;
    store.updateCurrentDatasetTags(result);
    newTagName.value = "";
    addTagMenu.value = false;
    notifications.success(`Tag "${tagToAdd}" added`);
  } catch (error) {
    console.error("Failed to add tag:", error);
    const err = error as { status?: number };
    if (err.status === 403) {
      notifications.error("Permission denied. You may not have write access.");
    } else {
      notifications.error("Failed to add tag");
    }
  } finally {
    saving.value = false;
  }
}

async function removeTag(tag: string): Promise<void> {
  if (!dataset.value) return;

  const uri = dataset.value.uri;
  saving.value = true;
  try {
    const result = await dserverApi.removeTag(uri, tag);
    if (store.current_dataset?.uri !== uri) return;
    store.updateCurrentDatasetTags(result);
    notifications.success(`Tag "${tag}" removed`);
  } catch (error) {
    console.error("Failed to remove tag:", error);
    const err = error as { status?: number };
    if (err.status === 403) {
      notifications.error("Permission denied. You may not have write access.");
    } else {
      notifications.error("Failed to remove tag");
    }
  } finally {
    saving.value = false;
  }
}

// Annotation operations
async function addAnnotation(): Promise<void> {
  const key = newAnnotationKey.value?.trim();
  if (!key || !dataset.value) return;

  // Parse value - try JSON first, then use as string
  let value: unknown = newAnnotationValue.value;
  try {
    value = JSON.parse(newAnnotationValue.value);
  } catch {
    // Keep as string
  }

  const uri = dataset.value.uri;
  saving.value = true;
  try {
    const result = await dserverApi.setAnnotation(uri, key, value);
    if (store.current_dataset?.uri !== uri) return;
    store.updateCurrentDatasetAnnotations(result);
    newAnnotationKey.value = "";
    newAnnotationValue.value = "";
    addAnnotationMenu.value = false;
    notifications.success(`Annotation "${key}" added`);
  } catch (error) {
    console.error("Failed to add annotation:", error);
    const err = error as { status?: number };
    if (err.status === 403) {
      notifications.error("Permission denied. You may not have write access.");
    } else {
      notifications.error("Failed to add annotation");
    }
  } finally {
    saving.value = false;
  }
}

async function updateAnnotation(key: string): Promise<void> {
  // Only save when this key's editor is open; an empty string is a valid value.
  if (!dataset.value || editingAnnotationKey.value !== key) return;

  // Parse value - try JSON first, then use as string
  let value: unknown = editAnnotationValue.value;
  try {
    value = JSON.parse(editAnnotationValue.value);
  } catch {
    // Keep as string
  }

  const uri = dataset.value.uri;
  saving.value = true;
  try {
    const result = await dserverApi.setAnnotation(uri, key, value);
    if (store.current_dataset?.uri !== uri) return;
    store.updateCurrentDatasetAnnotations(result);
    cancelEditAnnotation();
    notifications.success(`Annotation "${key}" updated`);
  } catch (error) {
    console.error("Failed to update annotation:", error);
    const err = error as { status?: number };
    if (err.status === 403) {
      notifications.error("Permission denied. You may not have write access.");
    } else {
      notifications.error("Failed to update annotation");
    }
  } finally {
    saving.value = false;
  }
}

async function deleteAnnotation(key: string): Promise<void> {
  if (!dataset.value) return;

  const uri = dataset.value.uri;
  saving.value = true;
  try {
    const result = await dserverApi.deleteAnnotation(uri, key);
    if (store.current_dataset?.uri !== uri) return;
    store.updateCurrentDatasetAnnotations(result);
    notifications.success(`Annotation "${key}" deleted`);
  } catch (error) {
    console.error("Failed to delete annotation:", error);
    const err = error as { status?: number };
    if (err.status === 403) {
      notifications.error("Permission denied. You may not have write access.");
    } else {
      notifications.error("Failed to delete annotation");
    }
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.dataset-summary {
  /* Parent container handles padding */
}

.uri-text {
  font-family: "Roboto Mono", monospace;
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  padding: 8px 12px;
  border-radius: 8px;
  display: block;
  word-break: break-all;
}

.ga-2 {
  gap: 8px;
}

.annotation-list {
  max-height: 200px;
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
