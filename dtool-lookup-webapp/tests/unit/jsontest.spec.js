import { shallowMount } from '@vue/test-utils'
import TextSearch from '@/components/TextSearch.vue'

describe('TextSearch', () => {
  it('sets the "is-invalid" class if "isJson" is false', () => {
    const wrapper = shallowMount(TextSearch, {
      data() {
        return {
          textQuery: 'not a valid JSON Query',
        }
      },
    })
    const span = wrapper.find('.jsonChecker')
    expect(span.classes()).toContain('is-invalid')
  })

  it('sets the "is-valid" class if "isJson" is true', () => {
    const wrapper = shallowMount(TextSearch, {
      data() {
        return {
          textQuery: '{"valid": "JSON Query"}',
        }
      },
    })
    const span = wrapper.find('.jsonChecker')
    expect(span.classes()).toContain('is-valid')
  })
})
