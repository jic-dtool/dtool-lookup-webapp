import { defineStore } from "pinia";
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

export const useStore = defineStore("main", {
  state: (): State => ({
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
  }),

  actions: {
    updateFreeText(free_text: string | null) {
      this.free_text = free_text;
    },
    updateMongoText(mongo_text: string | null) {
      this.mongo_text = mongo_text;
    },
    updateCreatorUsernames(creator_usernames: string[]) {
      this.creator_usernames = creator_usernames;
    },
    updateBaseUris(base_uris: string[]) {
      this.base_uris = base_uris;
    },
    updateTags(tags: string[]) {
      this.tags = tags;
    },
    updateCurrentDatasetIndex(index: number) {
      this.current_dataset_index = index;
    },
    updateCurrentPageNumber(pageNumber: number) {
      this.current_pageNumber = pageNumber;
    },
    updateCurrentDataset(dataset: Dataset | null) {
      this.current_dataset = dataset;
    },
    updateCurrentDatasetManifest(manifest: Manifest | null) {
      this.current_dataset_manifest = manifest;
    },
    updateCurrentDatasetReadme(readme: Readme | null) {
      this.current_dataset_readme = readme;
    },
    updateCurrentDatasetAnnotations(annotations: Annotations | null) {
      this.current_dataset_annotations = annotations;
    },
    updateCurrentDatasetTags(tags: Tags | null) {
      this.current_dataset_tags = tags;
    },
    updateNumFiltered(num_filtered: number) {
      this.num_filtered = num_filtered;
    },
    updateCurrentPerPage(perpage: number) {
      this.update_current_Per_Page = perpage;
    },
    updateUsername(username: string | null) {
      this.username = username;
    },
    updateSelectedSortOption(selected_sort_option: string) {
      this.selected_sort_option = selected_sort_option;
    },
    updateServerVersions(versions: ServerVersions) {
      this.server_versions = versions;
    },
    updateLookupUrl(lookup_url: string | null) {
      this.lookup_url = lookup_url;
    },
    clearAll() {
      this.username = null;
      this.free_text = null;
      this.mongo_text = null;
      this.creator_usernames = [];
      this.tags = [];
      this.base_uris = [];
    },
  },
});
