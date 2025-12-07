import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import TextSearch from "@/components/TextSearch.vue";

const vuetify = createVuetify({
  components,
  directives,
});

describe("TextSearch", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders the search input field", () => {
    const wrapper = mount(TextSearch, {
      props: {
        mongoplugin: "dserver-search-plugin-mongo",
      },
      global: {
        plugins: [vuetify, createPinia()],
        stubs: {
          "v-tooltip": true,
        },
      },
    });
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("emits start-search event on enter key", async () => {
    const wrapper = mount(TextSearch, {
      props: {
        mongoplugin: "dserver-search-plugin-mongo",
      },
      global: {
        plugins: [vuetify, createPinia()],
        stubs: {
          "v-tooltip": true,
        },
      },
    });

    const input = wrapper.find("input");
    await input.setValue("test query");
    await input.trigger("keyup.enter");

    expect(wrapper.emitted("start-search")).toBeTruthy();
  });
});
