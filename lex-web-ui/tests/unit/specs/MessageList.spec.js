import { mount, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import MessageList from '@/components/MessageList'
import Message from '@/components/Message'
import MessageLoading from '@/components/MessageLoading'
import { testAccessibility } from '../../axe-helper'

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

const createMockStore = (messages = [], isProcessing = false) => createStore({
  state: {
    messages,
    lex: { isProcessing },
    liveChat: { isProcessing }
  }
})

describe('MessageList.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = shallowMount(MessageList, {
      global: {
        plugins: [global.createVuetify(), store]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper);
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('message-list')
  })

  it('renders Message components for each message', async () => {
    const messages = [
      { id: 1, type: 'bot', content: 'Hello' },
      { id: 2, type: 'human', content: 'Hi' }
    ]
    store.state.messages = messages

    await wrapper.vm.$nextTick()

    const messageComponents = wrapper.findAllComponents(Message)
    expect(messageComponents).toHaveLength(2)
    expect(messageComponents[0].props('message')).toEqual(messages[0])
    expect(messageComponents[1].props('message')).toEqual(messages[1])
  })

  it('applies correct classes to Message components', async () => {
    const messages = [
      { id: 1, type: 'bot', content: 'Hello' },
      { id: 2, type: 'human', content: 'Hi' }
    ]
    store.state.messages = messages

    await wrapper.vm.$nextTick()

    const messageComponents = wrapper.findAllComponents(Message)
    expect(messageComponents[0].classes()).toContain('message-bot')
    expect(messageComponents[1].classes()).toContain('message-human')
  })

  it('renders MessageLoading component when loading', async () => {
    store.state.lex.isProcessing = true
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(MessageLoading).exists()).toBe(true)

    store.state.lex.isProcessing = false
    store.state.liveChat.isProcessing = true
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(MessageLoading).exists()).toBe(true)

    store.state.liveChat.isProcessing = false
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(MessageLoading).exists()).toBe(false)
  })

  it('computes messages correctly', () => {
    const messages = [{ id: 1, content: 'Test' }]
    store.state.messages = messages
    expect(wrapper.vm.messages).toEqual(messages)
  })

  it('computes loading correctly', () => {
    expect(wrapper.vm.loading).toBe(false)

    store.state.lex.isProcessing = true
    expect(wrapper.vm.loading).toBe(true)

    store.state.lex.isProcessing = false
    store.state.liveChat.isProcessing = true
    expect(wrapper.vm.loading).toBe(true)

    store.state.liveChat.isProcessing = false
    expect(wrapper.vm.loading).toBe(false)
  })

  it('calls scrollDown when messages change', async () => {
    const scrollDownSpy = jest.spyOn(wrapper.vm, 'scrollDown')
    store.state.messages.push({ id: 1, content: 'New message' })
    await wrapper.vm.$nextTick()
    expect(scrollDownSpy).toHaveBeenCalled()
  })

  it('calls scrollDown when loading changes', async () => {
    const scrollDownSpy = jest.spyOn(wrapper.vm, 'scrollDown')
    store.state.lex.isProcessing = true
    await wrapper.vm.$nextTick()
    expect(scrollDownSpy).toHaveBeenCalled()
  })

  it('calls scrollDown on mount', () => {
    jest.useFakeTimers()
    const scrollDownSpy = jest.spyOn(MessageList.methods, 'scrollDown')
    mount(MessageList, {
      global: {
        plugins: [global.createVuetify(), createMockStore()]
      }
    })
    jest.advanceTimersByTime(1000)
    expect(scrollDownSpy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  describe('scrollDown method', () => {
    it('does nothing when there are no messages', async () => {
      wrapper.vm.$el = { lastElementChild: null }
      await expect(wrapper.vm.scrollDown()).resolves.toBeUndefined()
    })
  })
})