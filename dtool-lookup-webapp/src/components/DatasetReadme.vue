<template>
  <div>
    <h3>Readme</h3>
    <div class="readme-container">
      <pre>{{ getReadmeContent }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: "DatasetReadme",
  computed: {
    getReadmeContent() {
      // Accessing the string content of the 'readme' key directly.
      return this.$store.state.current_dataset_readme.readme;
    },
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
