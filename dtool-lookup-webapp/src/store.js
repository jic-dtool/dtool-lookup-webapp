import { createStore } from "vuex";

export const store = createStore({
  state: {
    free_text: null,
    mongo_text: null,
    creator_usernames: [],
    base_uris: [],
    tags: [],
    username: null,
    current_dataset_index: 0,
    current_dataset: null,
    current_dataset_manifest: null,
    current_dataset_readme: null,
    current_dataset_annotations: null,
    current_dataset_tags: null,
    num_filtered: 0,
    update_current_Per_Page: 10,
    current_pageNumber:1,
    selected_sort_option: "frozen_at",
    server_versions: {},
    lookup_url: null,
  },
  mutations: {
    update_free_text(state, free_text) {
      state.free_text = free_text;
    },
    update_mongo_text(state, mongo_text) {
      state.mongo_text = mongo_text;
    },
    update_creator_usernames(state, creator_usernames) {
      state.creator_usernames = creator_usernames;
    },
    update_base_uris(state, base_uris) {
      state.base_uris = base_uris;
    },
    update_tags(state, tags) {
      state.tags = tags;
    },
    update_current_dataset_index(state, index) {
      state.current_dataset_index = index;
    },
    update_current_pageNumber(state,pageNumber) {
      state.current_pageNumber = pageNumber;
    },
    update_current_dataset(state, dataset) {
      state.current_dataset = dataset;
    },
    update_current_dataset_manifest(state, manifest) {
      state.current_dataset_manifest = manifest;
    },
    update_current_dataset_readme(state, readme) {
      state.current_dataset_readme = readme;
    },
    update_current_dataset_annotations(state, annotations) {
      state.current_dataset_annotations = annotations;
    },
    update_current_dataset_tags(state, tags) {
      state.current_dataset_tags = tags;
    },
    update_num_filtered(state, num_filtered) {
      state.num_filtered = num_filtered;
    },
    update_current_Per_Page(state, perpage) {
      state.update_current_Per_Page = perpage;
    },
    updateUsername(state, username) {
      state.username = username;
    },
    update_selected_sort_option(state, selected_sort_option) {
      state.selected_sort_option = selected_sort_option;
    },
    update_server_versions(state, versions) {
      state.server_versions = versions;
    },
    update_lookup_url(state, lookup_url) {
      state.lookup_url = lookup_url;
    },

    clear_all(state) {
      state.username = null;
      state.free_text = null;
      state.mongo_text = null;
      state.creator_usernames = [];
      state.tags = [];
      state.base_uris = [];

    },
  },
  actions: {},
});


