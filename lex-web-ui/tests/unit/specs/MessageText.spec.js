import { mount } from '@vue/test-utils'
import MessageText from '@/components/MessageText'
import { createStore } from 'vuex'
import { testAccessibility } from '../../axe-helper';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

jest.mock('marked', () => ({
  parse: jest.fn(text => `<p>${text}</p>`),
  use: jest.fn(),
}))

describe('MessageText.vue', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      state: {
        config: {
          ui: {
            convertUrlToLinksInBotMessages: true,
            stripTagsFromBotMessages: true,
            AllowSuperDangerousHTMLInMessage: false,
          },
        },
      },
    })

    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Hello, world!', type: 'human' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
  })

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper);
  });

  it('renders human message correctly', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Hello, world!', type: 'human' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.text()).toContain('I say: Hello, world!')
    expect(wrapper.find('.message-text').exists()).toBe(true)
  })

  it('renders feedback message correctly', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Great job!', type: 'feedback' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.text()).toContain('I say: Great job!')
    expect(wrapper.find('.message-text').exists()).toBe(true)
  })

  it('renders bot message as plain text', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Bot response', type: 'bot' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.text()).toContain('bot says: Bot response')
  })

  it('renders agent message as plain text', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Agent response', type: 'agent' }
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    //expect(wrapper.text()).toContain('agent says: Agent response')
    //expect(wrapper.find('.bot-message-plain').exists()).toBe(true)
  })

  it('renders HTML message when AllowSuperDangerousHTMLInMessage is true', async () => {
    store.state.config.ui.AllowSuperDangerousHTMLInMessage = true
    wrapper = mount(MessageText, {
      props: {
        message: { 
          text: 'Ignored text',
          alts: { html: '<p>HTML content</p>' },
        },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('<p>HTML content</p>')
  })

  it('renders markdown message when available', async () => {
    store.state.config.ui.AllowSuperDangerousHTMLInMessage = true
    wrapper = mount(MessageText, {
      props: {
        message: { 
          text: 'Ignored text',
          alts: { markdown: '**Bold text**' },
        },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('<p>**Bold text**</p>')
  })

  it('converts URLs to links in bot messages', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Visit https://example.com', type: 'bot' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.html()).toContain('<a target="_blank" href="https://example.com">https://example.com</a>')
  })

  it('strips tags from bot messages when configured', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: '<p>Stripped text</p>', type: 'bot' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.text()).toContain('bot says: Stripped text')
    expect(wrapper.html()).not.toContain('<p>')
  })

  it('does not strip tags when stripTagsFromBotMessages is false', async () => {
    store.state.config.ui.stripTagsFromBotMessages = false
    wrapper = mount(MessageText, {
      props: {
        message: { text: '<p>Unstripped text</p>', type: 'bot' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('<div class=\"message-text\"><span class=\"sr-only\">bot says: </span>Unstripped text</div>')
  })

  it('encodes HTML entities in messages', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Text with <script> & "quotes"', type: 'human' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.html()).toContain('<div class=\"message-text\"><span class=\"sr-only\">I say: </span>Text with &lt;script&gt; &amp; \"quotes\"</div>')
  })

  it('prepends screen reader text for bot messages', () => {
    wrapper = mount(MessageText, {
      props: {
        message: { text: 'Bot message', type: 'bot' },
      },
      global: {
        plugins: [global.createVuetify(), store],
      },
    })
    expect(wrapper.html()).toContain('<span class="sr-only">bot says: </span>')
  })
})