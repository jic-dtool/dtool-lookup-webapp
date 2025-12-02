/**
 * Component: TemplateDownloader
 * Description: This component renders a button and a dropdown menu. The button is used for logout functionality, and the dropdown menu is used to download files and display information.
 *
 * Props:
 *   - None
 *
 * Data:
 *   - downloadReadmeYaml: A boolean indicating whether to offer the download of dtool_readme.yml file.
 *   - downloadReadmeJson: A boolean indicating whether to offer the download of dtool.json file.
 *   - showInfoMenuEntry: A boolean indicating whether to show the "Info" menu entry.
 *   - infoContent: A string containing the content to be displayed in the info modal.
 *
 * Events:
 *   - logoutAction: This event is emitted when the logout button is clicked.
 *
 * Methods:
 *   - logout: A method that emits the "logoutAction" event.
 *   - downloadFile: A method that downloads a file based on the provided file name.
 *   - showInfo: A method that shows the info modal.
 *
 */
<template>
  <!-- Simple logout button if no download options -->
  <v-btn
    v-if="!downloadReadmeYaml && !downloadReadmeJson && !showInfoMenuEntry"
    variant="outlined"
    color="error"
    @click="logout"
  >
    Logout
  </v-btn>

  <!-- Account menu with options -->
  <v-menu v-else location="bottom end">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" append-icon="mdi-menu-down">
        Account
      </v-btn>
    </template>

    <v-list density="compact">
      <v-list-item
        v-if="downloadReadmeYaml"
        prepend-icon="mdi-download"
        @click="downloadFile('dtool_readme.yml')"
      >
        <v-list-item-title>Download dtool_readme.yml</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="downloadReadmeJson"
        prepend-icon="mdi-download"
        @click="downloadFile('dtool.json')"
      >
        <v-list-item-title>Download dtool.json</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="showInfoMenuEntry"
        prepend-icon="mdi-information"
        @click="infoDialog = true"
      >
        <v-list-item-title>Info</v-list-item-title>
      </v-list-item>

      <v-divider v-if="downloadReadmeYaml || downloadReadmeJson || showInfoMenuEntry" />

      <v-list-item
        prepend-icon="mdi-logout"
        @click="logout"
      >
        <v-list-item-title class="text-error">Logout</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Info Dialog -->
  <v-dialog v-model="infoDialog" max-width="500">
    <v-card>
      <v-card-title>Info</v-card-title>
      <v-card-text v-html="infoContent"></v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="infoDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TemplateDownloader",
  data() {
    return {
      infoDialog: false,
      downloadReadmeYaml: process.env.VUE_APP_OFFER_DTOOL_README_YAML_DOWNLOAD === 'true',
      downloadReadmeJson: process.env.VUE_APP_OFFER_DTOOL_JSON_DOWNLOAD === 'true',
      showInfoMenuEntry: process.env.VUE_APP_SHOW_INFO_MENU_ENTRY === 'true',
      infoContent: process.env.VUE_APP_INFO_CONTENT || "Info Content",
    };
  },
  methods: {
    logout() {
      this.$emit("logoutAction");
    },
    async downloadFile(fileName) {
      let filePath = fileName === 'dtool.json' ?
                     (process.env.VUE_APP_DTOOL_JSON_PATH || `data/templates/${fileName}`) :
                     (process.env.VUE_APP_DTOOL_README_YAML_PATH || `data/templates/${fileName}`);

      try {
        let response = await fetch(filePath);
        if (!response.ok) throw new Error("Network response was not ok");

        let text = await response.text();
        let blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        let downloadUrl = window.URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Failed to download file:", error);
      }
    },
  }
};
</script>
