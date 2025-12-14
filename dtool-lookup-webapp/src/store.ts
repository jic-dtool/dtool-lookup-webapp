import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Dataset,
  Manifest,
  Readme,
  Annotations,
  Tags,
  ServerVersions,
} from "./types";

export const useStore = defineStore("main", () => {
  // State
  const free_text = ref<string | null>(null);
  const mongo_text = ref<string | null>(null);
  const creator_usernames = ref<string[]>([]);
  const base_uris = ref<string[]>([]);
  const tags = ref<string[]>([]);
  const username = ref<string | null>(null);
  const current_dataset_index = ref(0);
  const current_dataset = ref<Dataset | null>(null);
  const current_dataset_manifest = ref<Manifest | null>(null);
  const current_dataset_readme = ref<Readme | null>(null);
  const current_dataset_annotations = ref<Annotations | null>(null);
  const current_dataset_tags = ref<Tags | null>(null);
  const num_filtered = ref(0);
  const update_current_Per_Page = ref(10);
  const current_pageNumber = ref(1);
  const selected_sort_option = ref("-frozen_at");
  const server_versions = ref<ServerVersions>({});
  const lookup_url = ref<string | null>(null);

  // Actions
  function updateFreeText(value: string | null) {
    free_text.value = value;
  }

  function updateMongoText(value: string | null) {
    mongo_text.value = value;
  }

  function updateCreatorUsernames(value: string[]) {
    creator_usernames.value = value;
  }

  function updateBaseUris(value: string[]) {
    base_uris.value = value;
  }

  function updateTags(value: string[]) {
    tags.value = value;
  }

  function updateCurrentDatasetIndex(index: number) {
    current_dataset_index.value = index;
  }

  function updateCurrentPageNumber(pageNumber: number) {
    current_pageNumber.value = pageNumber;
  }

  function updateCurrentDataset(dataset: Dataset | null) {
    current_dataset.value = dataset;
  }

  function updateCurrentDatasetManifest(manifest: Manifest | null) {
    current_dataset_manifest.value = manifest;
  }

  function updateCurrentDatasetReadme(readme: Readme | null) {
    current_dataset_readme.value = readme;
  }

  function updateCurrentDatasetAnnotations(annotations: Annotations | null) {
    current_dataset_annotations.value = annotations;
  }

  function updateCurrentDatasetTags(value: Tags | null) {
    current_dataset_tags.value = value;
  }

  function updateNumFiltered(value: number) {
    num_filtered.value = value;
  }

  function updateCurrentPerPage(perpage: number) {
    update_current_Per_Page.value = perpage;
  }

  function updateUsername(value: string | null) {
    username.value = value;
  }

  function updateSelectedSortOption(value: string) {
    selected_sort_option.value = value;
  }

  function updateServerVersions(versions: ServerVersions) {
    server_versions.value = versions;
  }

  function updateLookupUrl(value: string | null) {
    lookup_url.value = value;
  }

  function clearAll() {
    username.value = null;
    free_text.value = null;
    mongo_text.value = null;
    creator_usernames.value = [];
    tags.value = [];
    base_uris.value = [];
  }

  return {
    // State
    free_text,
    mongo_text,
    creator_usernames,
    base_uris,
    tags,
    username,
    current_dataset_index,
    current_dataset,
    current_dataset_manifest,
    current_dataset_readme,
    current_dataset_annotations,
    current_dataset_tags,
    num_filtered,
    update_current_Per_Page,
    current_pageNumber,
    selected_sort_option,
    server_versions,
    lookup_url,
    // Actions
    updateFreeText,
    updateMongoText,
    updateCreatorUsernames,
    updateBaseUris,
    updateTags,
    updateCurrentDatasetIndex,
    updateCurrentPageNumber,
    updateCurrentDataset,
    updateCurrentDatasetManifest,
    updateCurrentDatasetReadme,
    updateCurrentDatasetAnnotations,
    updateCurrentDatasetTags,
    updateNumFiltered,
    updateCurrentPerPage,
    updateUsername,
    updateSelectedSortOption,
    updateServerVersions,
    updateLookupUrl,
    clearAll,
  };
});
