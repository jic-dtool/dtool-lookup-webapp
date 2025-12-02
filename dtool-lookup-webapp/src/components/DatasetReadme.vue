<template>
  <div>
    <!-- Render this section only if there is readme content -->
    <div v-if="getReadmeContent">
      <!-- Flex container to align items on opposite ends -->
      <div class="d-flex justify-content-between align-items-center">
        <h5>Readme</h5>
        <BDropdown end size="sm" class="p-0">
          <template #button-content> Edit </template>

          <template #default>
            <div class="container centered-content">
              <!-- Dropdown text for descriptive content -->
              <BDropdownText>
                The command below helps to edit the README and update it in the
                dataset.
              </BDropdownText>
            </div>

            <!-- Dropdown form containing input group, form input, and button -->
            <BDropdownForm style="width: 440px">
              <template #default>
                <BInputGroup>
                  <BFormInput
                    readonly
                    v-model="edit_command"
                    size="sm"
                  />
                  <BButton
                    size="sm"
                    variant="outline-secondary"
                    v-clipboard:copy="edit_command"
                  >
                    <span class="octicon octicon-clippy"></span>
                  </BButton>
                </BInputGroup>
              </template>
            </BDropdownForm>
          </template>
        </BDropdown>
      </div>

      <div class="readme-container">
        <pre>{{ getReadmeContent }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BDropdown,
  BDropdownText,
  BDropdownForm,
  BInputGroup,
  BFormInput,
  BButton,
} from "bootstrap-vue-next";

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
  components: {
    BDropdown,
    BDropdownText,
    BDropdownForm,
    BInputGroup,
    BFormInput,
    BButton,
  },
};
</script>

<style>
.readme-container {
  max-height: 250px; /* Adjust height to fit 6-7 lines */
  overflow-y: auto; /* Vertical scrolling */
  overflow-x: auto; /* Horizontal scrolling */
  white-space: pre-wrap; /* Ensures that text will wrap and not force horizontal scroll unless needed */
  word-wrap: break-word; /* Allows long words to break and wrap onto the next line */
  border: 1px solid #ccc; /* Adds a border around the container */
  margin-top: 10px; /* Adds some space above the container */
  background-color: #f8f9fa; /* Sets a background color for the container */
  padding: 10px; /* Adds some padding inside the container */
  border-radius: 5px; /* Rounds the corners of the container */
}
</style>
