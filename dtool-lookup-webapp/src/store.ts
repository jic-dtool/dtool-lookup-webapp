import { createStore } from "vuex";
import type {
  Dataset,
  Manifest,
  Readme,
  Annotations,
  Tags,
  ServerVersions,
} from "./types";

export interface State {
  free_text: string | null;
  mongo_text: string | null;
  creator_usernames: string[];
  base_uris: string[];
  tags: string[];
  username: string | null;
  current_dataset_index: number;
  current_dataset: Dataset | null;
  current_dataset_manifest: Manifest | null;
  current_dataset_readme: Readme | null;
  current_dataset_annotations: Annotations | null;
  current_dataset_tags: Tags | null;
  num_filtered: number;
  update_current_Per_Page: number;
  current_pageNumber: number;
  selected_sort_option: string;
  server_versions: ServerVersions;
  lookup_url: string | null;
}

export const store = createStore<State>({
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
    current_pageNumber: 1,
    selected_sort_option: "frozen_at",
    server_versions: {},
    lookup_url: null,
  },
  mutations: {
    update_free_text(state: State, free_text: string | null) {
      state.free_text = free_text;
    },
    update_mongo_text(state: State, mongo_text: string | null) {
      state.mongo_text = mongo_text;
    },
    update_creator_usernames(state: State, creator_usernames: string[]) {
      state.creator_usernames = creator_usernames;
    },
    update_base_uris(state: State, base_uris: string[]) {
      state.base_uris = base_uris;
    },
    update_tags(state: State, tags: string[]) {
      state.tags = tags;
    },
    update_current_dataset_index(state: State, index: number) {
      state.current_dataset_index = index;
    },
    update_current_pageNumber(state: State, pageNumber: number) {
      state.current_pageNumber = pageNumber;
    },
    update_current_dataset(state: State, dataset: Dataset | null) {
      state.current_dataset = dataset;
    },
    update_current_dataset_manifest(state: State, manifest: Manifest | null) {
      state.current_dataset_manifest = manifest;
    },
    update_current_dataset_readme(state: State, readme: Readme | null) {
      state.current_dataset_readme = readme;
    },
    update_current_dataset_annotations(
      state: State,
      annotations: Annotations | null
    ) {
      state.current_dataset_annotations = annotations;
    },
    update_current_dataset_tags(state: State, tags: Tags | null) {
      state.current_dataset_tags = tags;
    },
    update_num_filtered(state: State, num_filtered: number) {
      state.num_filtered = num_filtered;
    },
    update_current_Per_Page(state: State, perpage: number) {
      state.update_current_Per_Page = perpage;
    },
    updateUsername(state: State, username: string | null) {
      state.username = username;
    },
    update_selected_sort_option(state: State, selected_sort_option: string) {
      state.selected_sort_option = selected_sort_option;
    },
    update_server_versions(state: State, versions: ServerVersions) {
      state.server_versions = versions;
    },
    update_lookup_url(state: State, lookup_url: string | null) {
      state.lookup_url = lookup_url;
    },

    clear_all(state: State) {
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

export type Store = typeof store;
