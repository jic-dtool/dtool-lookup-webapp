<template>
  <div class="readme-section">
    <!-- Header with Edit button -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-body-2 text-medium-emphasis">Dataset README (YAML)</div>
      <!-- Edit button - shows inline editor if valid YAML, otherwise shows dtool command -->
      <v-btn
        v-if="isValidYaml && getReadmeContent"
        size="small"
        variant="tonal"
        :color="isEditing ? 'grey' : 'primary'"
        :prepend-icon="isEditing ? 'mdi-close' : 'mdi-pencil'"
        @click="toggleEdit"
      >
        {{ isEditing ? "Cancel" : "Edit" }}
      </v-btn>
      <v-menu
        v-else-if="getReadmeContent"
        location="bottom end"
        :close-on-content-click="false"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-pencil"
          >
            Edit
          </v-btn>
        </template>
        <v-card min-width="440" rounded="lg">
          <v-card-text class="text-body-2 pb-2">
            Edit the README and update it in the dataset:
          </v-card-text>
          <v-card-text class="pt-0">
            <v-text-field
              :model-value="edit_command"
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
                  @click="copyToClipboard(edit_command)"
                />
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <!-- Editor view -->
    <div v-if="isEditing" class="readme-editor">
      <v-textarea
        v-model="editedContent"
        variant="outlined"
        density="compact"
        rows="16"
        hide-details="auto"
        :error="!!yamlError"
        :error-messages="yamlError"
        class="yaml-editor-textarea"
        @update:model-value="validateYaml"
      />
      <div class="d-flex justify-end mt-2 gap-2">
        <v-btn size="small" variant="tonal" color="grey" @click="cancelEdit">
          Cancel
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="primary"
          :loading="isSaving"
          :disabled="!!yamlError"
          @click="saveReadme"
        >
          Save
        </v-btn>
      </div>
    </div>

    <!-- Read-only view -->
    <div v-else-if="getReadmeContent" class="readme-content">
      <pre class="readme-pre"><code v-html="formattedReadme"></code></pre>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8 text-medium-emphasis">
      <v-icon size="48" color="grey-lighten-1" class="mb-2"
        >mdi-file-document-outline</v-icon
      >
      <p class="text-body-2">No README content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStore } from "@/store";
import { useNotificationStore } from "@/stores/notifications";
import { dserverApi } from "@/services/dserverApi";
import * as yaml from "yaml";

const store = useStore();
const notifications = useNotificationStore();
const isEditing = ref(false);
const editedContent = ref("");
const yamlError = ref<string | null>(null);
const isSaving = ref(false);

const getReadmeContent = computed<string | null>(() => {
  if (!store.current_dataset_readme || !store.current_dataset_readme.readme) {
    return null;
  }
  return store.current_dataset_readme.readme.trim();
});

const isValidYaml = computed(() => {
  if (!getReadmeContent.value) return false;
  try {
    yaml.parse(getReadmeContent.value);
    return true;
  } catch {
    return false;
  }
});

const formattedReadme = computed(() => {
  if (!getReadmeContent.value) return "";
  // Color-code YAML-like key: value pairs
  return getReadmeContent.value
    .split("\n")
    .map((line) => formatLine(line))
    .join("\n");
});

const edit_command = computed(() => {
  if (!store.current_dataset) return "";
  return "dtool readme edit " + store.current_dataset.uri;
});

// Reset editing state when dataset changes
watch(
  () => store.current_dataset?.uri,
  () => {
    isEditing.value = false;
    editedContent.value = "";
    yamlError.value = null;
  },
);

function toggleEdit(): void {
  if (isEditing.value) {
    cancelEdit();
  } else {
    startEdit();
  }
}

function startEdit(): void {
  editedContent.value = getReadmeContent.value || "";
  yamlError.value = null;
  isEditing.value = true;
}

function cancelEdit(): void {
  isEditing.value = false;
  editedContent.value = "";
  yamlError.value = null;
}

function validateYaml(): void {
  try {
    yaml.parse(editedContent.value);
    yamlError.value = null;
  } catch (e) {
    yamlError.value = e instanceof Error ? e.message : "Invalid YAML";
  }
}

async function saveReadme(): Promise<void> {
  const uri = store.current_dataset?.uri;
  if (!uri || yamlError.value) return;

  isSaving.value = true;
  try {
    const response = await dserverApi.setReadme(uri, editedContent.value);
    // Ignore the response if the user has switched datasets in the meantime
    if (store.current_dataset?.uri !== uri) return;
    // Update store with new readme
    store.updateCurrentDatasetReadme(response);
    isEditing.value = false;
  } catch (err) {
    console.error("Failed to save README:", err);
    yamlError.value = "Failed to save README. Please try again.";
  } finally {
    isSaving.value = false;
  }
}

function formatLine(line: string): string {
  // Escape HTML first
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Match YAML-like patterns: "key: value" or "  key: value"
  const yamlMatch = escaped.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
  if (yamlMatch) {
    const [, indent, key, value] = yamlMatch;
    if (value) {
      return `${indent}<span class="yaml-key">${key}:</span> <span class="yaml-value">${value}</span>`;
    } else {
      return `${indent}<span class="yaml-key">${key}:</span>`;
    }
  }

  // Match list items: "- item" or "  - item"
  const listMatch = escaped.match(/^(\s*)-\s+(.*)$/);
  if (listMatch) {
    const [, indent, content] = listMatch;
    return `${indent}<span class="yaml-bullet">-</span> ${content}`;
  }

  // Match comments: "# comment"
  const commentMatch = escaped.match(/^(\s*)(#.*)$/);
  if (commentMatch) {
    const [, indent, comment] = commentMatch;
    return `${indent}<span class="yaml-comment">${comment}</span>`;
  }

  return escaped;
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
</script>

<style scoped>
.readme-section {
  /* Parent container handles spacing */
}

.readme-content {
  max-height: calc(100vh - 400px);
  min-height: 200px;
  overflow-y: auto;
  overflow-x: auto;
  background-color: #f6f8fa;
  border-radius: 8px;
}

.readme-pre {
  font-family: "Roboto Mono", "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: rgba(0, 0, 0, 0.87);
}

.readme-pre code {
  font-family: inherit;
  background: none;
  padding: 0;
}

/* YAML syntax highlighting */
.readme-pre :deep(.yaml-key) {
  color: #6f42c1;
  font-weight: 500;
}

.readme-pre :deep(.yaml-value) {
  color: #032f62;
}

.readme-pre :deep(.yaml-bullet) {
  color: #d73a49;
  font-weight: 600;
}

.readme-pre :deep(.yaml-comment) {
  color: #6a737d;
  font-style: italic;
}

/* Editor styling */
.readme-editor {
  background-color: #f6f8fa;
  border-radius: 8px;
  padding: 12px;
}

.yaml-editor-textarea :deep(textarea) {
  font-family: "Roboto Mono", "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
}

.gap-2 {
  gap: 8px;
}
</style>
