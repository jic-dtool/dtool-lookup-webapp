import { mount } from '@vue/test-utils';
import Pagination from '@/App.vue';
import { createStore } from "vuex";


describe("Pagination", () => {
  it("renders the pagination component when shouldShowPagination is true", () => {
    const store = createStore({
      state: {
        update_current_Per_Page: 10,
      },
    });
    const wrapper = mount(Pagination, {
      propsData: {
        shouldShowPagination: false,
        pagination: {
          total: 30,
        },
      },
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('.pagination-component').exists()).toBe(false)
  });
});

