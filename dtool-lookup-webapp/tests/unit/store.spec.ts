import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useStore } from "@/store";

describe("Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("updates free text", () => {
    const store = useStore();
    store.updateFreeText("test query");
    expect(store.free_text).toBe("test query");
  });

  it("updates mongo text", () => {
    const store = useStore();
    store.updateMongoText('{"key": "value"}');
    expect(store.mongo_text).toBe('{"key": "value"}');
  });

  it("updates current dataset", () => {
    const store = useStore();
    const dataset = {
      uri: "s3://test/dataset",
      uuid: "test-uuid-123",
      name: "Test Dataset",
    };
    store.updateCurrentDataset(dataset);
    expect(store.current_dataset).toEqual(dataset);
  });

  it("updates pagination settings", () => {
    const store = useStore();
    store.updateCurrentPerPage(25);
    expect(store.update_current_Per_Page).toBe(25);

    store.updateCurrentPageNumber(3);
    expect(store.current_pageNumber).toBe(3);
  });

  it("clears all filters", () => {
    const store = useStore();
    store.updateFreeText("test");
    store.updateMongoText("query");
    store.updateCreatorUsernames(["user1"]);
    store.updateTags(["tag1"]);
    store.updateBaseUris(["s3://bucket"]);

    store.clearAll();

    expect(store.free_text).toBeNull();
    expect(store.mongo_text).toBeNull();
    expect(store.creator_usernames).toEqual([]);
    expect(store.tags).toEqual([]);
    expect(store.base_uris).toEqual([]);
  });

  it("updates readme", () => {
    const store = useStore();
    const readme = { readme: "Test README content" };
    store.updateCurrentDatasetReadme(readme);
    expect(store.current_dataset_readme).toEqual(readme);
  });

  it("updates annotations", () => {
    const store = useStore();
    const annotations = { annotations: { key: "value" } };
    store.updateCurrentDatasetAnnotations(annotations);
    expect(store.current_dataset_annotations).toEqual(annotations);
  });

  it("updates tags", () => {
    const store = useStore();
    const tags = { tags: ["tag1", "tag2"] };
    store.updateCurrentDatasetTags(tags);
    expect(store.current_dataset_tags).toEqual(tags);
  });
});
