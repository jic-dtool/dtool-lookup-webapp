import { mount } from "@vue/test-utils";
import DatasetReadme from "@/components/DatasetReadme.vue";
import { createStore } from "vuex";
const yaml = require("js-yaml");

describe("DatasetReadme", () => {
  it("displays the current version readme when the current version is equal to the required version", () => {
    const store = createStore({
      state: {
        current_dataset_readme: "This is the current version readme",
        current_required_version: "0.18.0",
      },
    });
    const wrapper = mount(DatasetReadme, {
      propsData: {
        getinfo: { version: "0.18.0" },
      },
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find("pre").text()).toBe("This is the current version readme");
  });

  it("displays the current version readme as YAML when the current version is less than the required version", () => {
    const store = createStore({
      state: {
        current_dataset_readme: "---\nThis is the current version readme",
        current_required_version: "0.18.0",
      },
    });
    const wrapper = mount(DatasetReadme, {
      propsData: {
        getinfo: { version: "0.17.0" },
      },
      global: {
        plugins: [store],
      },
    });
    const expected = "---\nThis is the current version readme";
    const received = wrapper.find("pre").text();

    expect(received).toBe(expected);
  });
});
