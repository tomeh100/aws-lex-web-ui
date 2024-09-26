import { shallowMount, mount } from '@vue/test-utils'
import MessageLoading from '@/components/MessageLoading'
import { createStore } from 'vuex'
import { testAccessibility } from '../../axe-helper';

describe('MessageLoading.vue', () => {
  let store
  let wrapper
  
  beforeEach(() => {
    store = createStore({
      state: {
        config: {
          lex: {
            allowStreamingResponses: false
          }
        },
        streaming: {
          wsMessagesString: ''
        }
      },
      getters: {
        isStartingTypingWsMessages: () => jest.fn().mockReturnValue(false)
      }
    })

    wrapper = shallowMount(MessageLoading, {
        global: {
          plugins: [global.createVuetify(), store]
        }
      })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should have no accessibility violations', async () => {
    const wrapper = mount(MessageLoading, {
      global: {
        plugins: [global.createVuetify(), store]
      }
    })
    await testAccessibility(wrapper);
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays streaming messages when streaming is allowed', async () => {
    store.state.config.lex.allowStreamingResponses = true
    store.state.streaming.wsMessagesString = 'Streaming message'
    wrapper = mount(MessageLoading, {
      global: {
        plugins: [global.createVuetify(), store]
      }
    });

    expect(wrapper.find('.message-bubble').text()).toBe('Streaming message')
  })

  it('clears interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    wrapper = shallowMount(MessageLoading, {
      global: {
        plugins: [global.createVuetify(), store]
      }
    })
    
    wrapper.unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
