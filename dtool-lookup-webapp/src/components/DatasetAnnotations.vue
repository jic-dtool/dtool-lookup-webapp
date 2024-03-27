<template>
  <div>
    <!-- Display the main heading only if there are annotations -->
    <div v-if="num_annotations > 0">
      <!-- Loop through each annotation -->
      <div v-for="(details, annotationName, index) in annotations" :key="index">
        <!-- Transform the first letter of each annotation name to uppercase -->
        <h3 class="annotations-heading">{{ capitalizeFirstLetter(annotationName) }}</h3>
        <!-- Only render the table if the current annotation has data -->
        <table class="table table-striped table-sm" v-if="isObjectNotEmpty(details)">
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loop through each property of the annotation and display it -->
            <tr v-for="(value, propertyName, index) in details" :key="index">
              <td>{{ propertyName }}</td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DatasetAnnotations",
  computed: {
    // Compute the annotations from the Vuex store
    annotations: function() {
      return this.$store.state.current_dataset_annotations;
    },
    // Compute the number of annotations to conditionally display the content
    num_annotations: function() {
      return this.annotations ? Object.keys(this.annotations).length : 0;
    }
  },
  methods: {
    // Method to capitalize the first letter of a string
    capitalizeFirstLetter: function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    // Method to check if an object is not empty
    isObjectNotEmpty: function(obj) {
      return obj && Object.keys(obj).length > 0;
    }
  }
};
</script>
<style>
/* Add styles specific to the annotations heading */
h3.annotations-heading {
  margin-top: 2rem; /* Adds space above the heading */
  margin-bottom: 1rem; /* Adds space below the heading */
}

/* Style for the tables to match spacing as well */
.table.table-striped.table-sm {
  margin-bottom: 1rem; /* Adds space below each table */
}
</style>
