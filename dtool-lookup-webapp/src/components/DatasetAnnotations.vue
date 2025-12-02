<template>
  <div>
    <!-- Loop through each filtered annotation that has non-empty values -->
    <div
      v-for="(details, annotationName, index) in filteredAnnotations"
      :key="index"
    >
      <!-- Container for the heading and create dropdown -->
      <div class="heading-container">
        <!-- Display the annotation name outside and above the container -->
        <h5 class="annotations-heading-outside">
          {{ capitalizeFirstLetter(annotationName) }}
        </h5>
        <!-- Create dropdown button -->
        <BDropdown end size="sm" class="pt-1" no-caret auto-close="outside">
          <template #button-content>
            Create <span class="dropdown-toggle"></span>
          </template>

          <template #default>
            <div class="container centered-content">
              <!-- Dropdown text for descriptive content -->
              <BDropdownText>
                The command below creates a key-value pair for the annotation
                and updates it in the dataset.
              </BDropdownText>
            </div>

            <!-- Dropdown form containing input group for key and value -->
            <BDropdownForm style="width: 400px">
              <template #default>
                <!-- Input group for entering a key name -->
                <BInputGroup size="sm">
                  <template #prepend>
                    <span class="input-group-text">Key</span>
                  </template>
                  <BFormInput v-model="newKey" size="sm" />
                </BInputGroup>

                <!-- Input group for entering a value -->
                <BInputGroup size="sm" class="mt-2">
                  <template #prepend>
                    <span class="input-group-text">Value</span>
                  </template>
                  <BFormInput v-model="newValue" size="sm" />
                </BInputGroup>

                <!-- Input group for displaying the create command -->
                <BInputGroup class="mt-2">
                  <div class="form-control form-control-sm">
                    {{ computedCreateCommand }}
                  </div>
                  <BButton
                    size="sm"
                    variant="outline-secondary"
                    v-clipboard:copy="computedCreateCommand"
                  >
                    <span class="octicon octicon-clippy"></span>
                  </BButton>
                </BInputGroup>
              </template>
            </BDropdownForm>
          </template>
        </BDropdown>
      </div>
      <!-- Container for the annotation details -->
      <div class="annotations-container">
        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th style="width: 1%"></th>
              <!-- Blank header for the dropdown, set minimal width -->
            </tr>
          </thead>
          <tbody>
            <!-- Loop through each property of the annotation and display it -->
            <tr
              v-for="(value, propertyName, subIndex) in details"
              :key="`details-${index}-${subIndex}`"
            >
              <td>{{ propertyName }}</td>
              <td>{{ value }}</td>
              <td class="text-right">
                <!-- Align dropdown to the right -->
                <!-- Add the dropdown button here -->
                <BDropdown
                  end
                  size="sm"
                  placement="start"
                  class="p-0"
                  auto-close="outside"
                  ref="dropdown"
                  @show="resetEditableValue"
                >
                  <template #button-content> Set </template>
                  <template #default>
                    <div class="container centered-content">
                      <!-- Dropdown text for descriptive content -->
                      <BDropdownText>
                        The command below helps to set the annotation.
                      </BDropdownText>
                    </div>
                    <!-- Input group containing the property name and the input field for the value -->
                    <BDropdownForm style="width: 440px">
                      <template #default>
                        <BInputGroup size="sm">
                          <template #prepend>
                            <span class="input-group-text">{{
                              propertyName
                            }}</span>
                          </template>
                          <BFormInput
                            v-model="editableValue"
                            :placeholder="String(value)"
                            size="sm"
                          />
                        </BInputGroup>
                        <BInputGroup class="mt-2">
                          <div class="form-control form-control-sm">
                            {{
                              generateSetCommand(
                                propertyName,
                                editableValue || value
                              )
                            }}
                          </div>
                          <BButton
                            size="sm"
                            variant="outline-secondary"
                            v-clipboard:copy="
                              generateSetCommand(
                                propertyName,
                                editableValue || value
                              )
                            "
                            @click="closeDropdown"
                          >
                            <span class="octicon octicon-clippy"></span>
                          </BButton>
                        </BInputGroup>
                      </template>
                    </BDropdownForm>
                  </template>
                </BDropdown>
              </td>
            </tr>
          </tbody>
        </table>
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
  name: "DatasetAnnotations",
  components: {
    BDropdown,
    BDropdownText,
    BDropdownForm,
    BInputGroup,
    BFormInput,
    BButton,
  },
  data() {
    return {
      newKey: "", // Data property to hold the new key
      newValue: "", // Data property to hold the new value
      editableValue: this.value, // Data property to hold the editable value
    };
  },
  computed: {
    annotations() {
      return this.$store.state.current_dataset_annotations;
    },
    // Computed property to filter annotations that have non-empty values
    filteredAnnotations() {
      let filtered = {};
      for (let annotationName in this.annotations) {
        if (this.hasNonEmptyValues(this.annotations[annotationName])) {
          filtered[annotationName] = this.annotations[annotationName];
        }
      }
      return filtered;
    },
    // Computed property to generate the create command
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
    closeDropdown() {
      // Close the dropdown after copying
      if (this.$refs.dropdown) {
        this.$refs.dropdown.hide();
      }
    },
  },
};
</script>

<style>
.annotations-container {
  min-height: auto; /* Removes the default min-height */
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f8f9fa;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 1rem; /* Adds some space below the container */
}

.annotations-heading-outside {
  margin-top: 1rem; /* Adds space above the heading for separation from previous elements */
  margin-bottom: 0.5rem; /* Reduces space below the heading to bring it closer to the container */
}

.heading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
