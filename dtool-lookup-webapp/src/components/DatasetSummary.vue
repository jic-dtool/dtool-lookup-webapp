<template>
  <div>
    <div class="d-flex justify-content-between flex-row">
      <h3 class="p-1">{{ dataset.name }}</h3>
      <small class="p-1">
        Created by <em>{{ dataset.creator_username }}</em> on
        <em>{{ moment(dataset.created_at*1000).format("YYYY-MM-DD") }}</em>, frozen on
        <em>{{ moment(dataset.frozen_at*1000).format("YYYY-MM-DD") }}</em
        >&nbsp;
        <span class="badge badge-pill badge-info bg-primary">{{ numItems }} items</span
        >&nbsp;
        <span class="badge badge-pill badge-info bg-primary">{{
          filesize(total_size_in_bytes)
        }}</span>
      </small>
    </div>
    <div class="d-flex align-items-start justify-content-between flex-row">
      <small class="p-1">{{ dataset.uri }}</small>
      <b-dropdown right text="Copy" size="sm" class="p-0">
        <b-dropdown-text
          >The command below copies the dataset to the working
          directory</b-dropdown-text
        >
        <b-dropdown-form style="width: 300px;">
          <b-input-group>
            <b-form-input
              readonly
              v-model="copy_command"
              size="sm"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                size="sm"
                variant="outline-secondary"
                v-clipboard:copy="copy_command"
                ><span class="octicon octicon-clippy"></span
              ></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-dropdown-form>
      </b-dropdown>
    </div>
    <div class="d-flex flex-sm-row align-items-start justify-content-between">
      <div v-if="dataset.tags?.length > 0" class="p-0">
        <template v-for="(tag, index) in dataset.tags" v-bind:key="index">
          <span class="badge badge-pill badge-info bg-primary">{{
            tag
          }}</span
          >{{ "&nbsp;" }}
        </template>
      </div>
      <div v-else class="alert alert-info p-1" role="alert">
        Use tags to organise your datasets!
      </div>

      <b-dropdown right text="Tag" size="sm" class="pt-1">
        <b-dropdown-text
          >The command below adds a tag to the dataset</b-dropdown-text
        >
        <b-dropdown-form style="width: 400px;">
          <b-input-group prepend="Tag" size="sm">
            <b-form-input v-model="tag_name" size="sm"></b-form-input>
          </b-input-group>

          <b-input-group>
            <b-form-input
              readonly
              v-model="tag_command"
              size="sm"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                size="sm"
                variant="outline-secondary"
                v-clipboard:tag="tag_command"
                ><span class="octicon octicon-clippy"></span
              ></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-dropdown-form>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import { BDropdown, BInputGroup, BFormInput, BButton } from "bootstrap-vue-next";
var filesize = require("filesize");
var moment = require("moment");
export default {
  name: "DatasetSummary",
  data: function() {
    return {
      filesize: filesize,
      moment: moment,
      tag_name: null
    };
  },
  computed: {
    dataset: function() {
      return this.$store.state.current_dataset;
    },
    numItems: function() {
  return this.$store.state.current_dataset_manifest && this.$store.state.current_dataset_manifest.items ? Object.values(this.$store.state.current_dataset_manifest.items).length : 0;
}
,
    total_size_in_bytes: function() {
      var total = 0;
      Object.values(this.$store.state.current_dataset_manifest.items).forEach(
        item => {
          total = total + item.size_in_bytes;
        }
      );
      return total;
    },
    copy_command: function() {
      return "dtool cp " + this.dataset.uri + " .";
    },
    tag_command: function() {
      return "dtool tag set " + this.dataset.uri + " " + this.tag_name;
    }
  },
  
  components: {
    BDropdown,
    BInputGroup,
    BFormInput,
    BButton
  },
};
</script>

<style></style>
