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

  it("does not render when readme is null", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useStore();
    store.updateCurrentDatasetReadme(null);

    const wrapper = mount(DatasetReadme, {
      global: {
        plugins: [vuetify, pinia],
      },
    });

    // Component should not render anything when readme is null
    expect(wrapper.find(".v-expansion-panels").exists()).toBe(false);
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

    // Component should render the expansion panels wrapper
    expect(wrapper.find(".v-expansion-panels").exists()).toBe(true);
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
