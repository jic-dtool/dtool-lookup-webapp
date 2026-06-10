import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import DatasetReadme from "@/components/DatasetReadme.vue";
import { useStore } from "@/store";

const vuetify = createVuetify({
  components,
  directives,
});

describe("DatasetReadme", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows the empty state when readme is null", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useStore();
    store.updateCurrentDatasetReadme(null);

    const wrapper = mount(DatasetReadme, {
      global: {
        plugins: [vuetify, pinia],
      },
    });

    // Component should show the empty state instead of readme content
    expect(wrapper.find(".readme-content").exists()).toBe(false);
    expect(wrapper.text()).toContain("No README content");
  });

  it("renders expansion panel when readme is available", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useStore();
    store.updateCurrentDatasetReadme({ readme: "Test README content" });

    const wrapper = mount(DatasetReadme, {
      global: {
        plugins: [vuetify, pinia],
      },
    });

    // Component should render the readme content
    expect(wrapper.find(".readme-content").exists()).toBe(true);
  });

  it("shows README label in panel title", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useStore();
    store.updateCurrentDatasetReadme({ readme: "Test content" });

    const wrapper = mount(DatasetReadme, {
      global: {
        plugins: [vuetify, pinia],
      },
    });

    expect(wrapper.text()).toContain("README");
  });
});
