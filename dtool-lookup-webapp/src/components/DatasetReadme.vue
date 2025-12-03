<template>
  <div v-if="getReadmeContent" class="readme-section">
    <v-card variant="outlined" rounded="lg">
      <v-card-item density="compact">
        <template #prepend>
          <v-icon size="small" color="primary">mdi-file-document-outline</v-icon>
        </template>
        <v-card-title class="text-body-2 font-weight-medium">README</v-card-title>
        <template #append>
          <v-menu location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="small" variant="tonal" color="primary" prepend-icon="mdi-pencil">
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
        </template>
      </v-card-item>
      <v-divider />
      <v-card-text class="readme-content pa-4">
        <div class="markdown-body" v-html="renderedMarkdown"></div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { marked } from "marked";
import hljs from "highlight.js";

// Configure marked with highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error(err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

export default {
  name: "DatasetReadme",
  computed: {
    getReadmeContent() {
      if (!this.$store.state.current_dataset_readme ||
          !this.$store.state.current_dataset_readme.readme) {
        return null;
      }
      return this.$store.state.current_dataset_readme.readme.trim();
    },
    renderedMarkdown() {
      if (!this.getReadmeContent) return "";
      return marked(this.getReadmeContent);
    },
    edit_command: function () {
      if (!this.$store.state.current_dataset) return "";
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
.readme-section {
  margin-top: 16px;
}

.readme-content {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
}

/* Markdown styling */
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.25em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h3) {
  font-size: 1.1em;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  font-family: "Roboto Mono", monospace;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  border-radius: 6px;
}

.markdown-body :deep(pre) {
  font-family: "Roboto Mono", monospace;
  font-size: 0.875em;
  padding: 16px;
  overflow: auto;
  background-color: #f6f8fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: rgba(0, 0, 0, 0.6);
  border-left: 4px solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.markdown-body :deep(th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600;
}

.markdown-body :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 24px 0;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Syntax highlighting (GitHub-like theme) */
.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote) {
  color: #6a737d;
}

.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-addition) {
  color: #d73a49;
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-meta .hljs-meta-string),
.markdown-body :deep(.hljs-literal),
.markdown-body :deep(.hljs-doctag),
.markdown-body :deep(.hljs-regexp) {
  color: #032f62;
}

.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-section),
.markdown-body :deep(.hljs-name),
.markdown-body :deep(.hljs-selector-id),
.markdown-body :deep(.hljs-selector-class) {
  color: #6f42c1;
}

.markdown-body :deep(.hljs-attribute),
.markdown-body :deep(.hljs-attr),
.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-template-variable),
.markdown-body :deep(.hljs-class .hljs-title),
.markdown-body :deep(.hljs-type) {
  color: #005cc5;
}

.markdown-body :deep(.hljs-symbol),
.markdown-body :deep(.hljs-bullet),
.markdown-body :deep(.hljs-subst),
.markdown-body :deep(.hljs-meta),
.markdown-body :deep(.hljs-meta .hljs-keyword),
.markdown-body :deep(.hljs-selector-attr),
.markdown-body :deep(.hljs-selector-pseudo),
.markdown-body :deep(.hljs-link) {
  color: #e36209;
}

.markdown-body :deep(.hljs-built_in),
.markdown-body :deep(.hljs-deletion) {
  color: #22863a;
}
</style>
