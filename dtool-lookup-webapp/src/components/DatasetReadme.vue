<template>
  <div v-if="getReadmeContent">
    <v-expansion-panels variant="accordion">
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title class="readme-panel-title">
          <template #default>
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-file-document-outline</v-icon>
              <span class="text-body-2 font-weight-medium">README</span>
            </div>
          </template>
          <template #actions="{ expanded }">
            <v-menu location="bottom end" :close-on-content-click="false" @click.stop>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  class="mr-2"
                  @click.stop
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
            <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="readme-content">
            <pre class="readme-pre"><code v-html="formattedReadme"></code></pre>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DatasetReadme",
  computed: {
    getReadmeContent(): string | null {
      if (
        !this.$store.state.current_dataset_readme ||
        !this.$store.state.current_dataset_readme.readme
      ) {
        return null;
      }
      return this.$store.state.current_dataset_readme.readme.trim();
    },
    formattedReadme(): string {
      if (!this.getReadmeContent) return "";
      // Color-code YAML-like key: value pairs
      return this.getReadmeContent
        .split("\n")
        .map((line) => this.formatLine(line))
        .join("\n");
    },
    edit_command(): string {
      if (!this.$store.state.current_dataset) return "";
      return "dtool readme edit " + this.$store.state.current_dataset.uri;
    },
  },
  methods: {
    formatLine(line: string): string {
      // Escape HTML first
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Match YAML-like patterns: "key: value" or "  key: value"
      const yamlMatch = escaped.match(
        /^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/
      );
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
.readme-panel-title {
  min-height: 48px;
}

.readme-content {
  max-height: 350px;
  overflow-y: auto;
  overflow-x: auto;
  background-color: #f6f8fa;
  border-radius: 8px;
  margin: -12px -16px;
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
</style>
