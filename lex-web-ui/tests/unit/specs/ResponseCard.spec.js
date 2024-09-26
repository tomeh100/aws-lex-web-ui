import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ResponseCard from '@/components/ResponseCard'
import { testAccessibility } from '../../axe-helper';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

describe('ResponseCard.vue', () => {
  let store
  let wrapper
  let mockResponseCard

  beforeEach(() => {
    mockResponseCard = {
      title: 'Test Title',
      subTitle: 'Test Subtitle',
      imageUrl: 'https://example.com/image.jpg',
      buttons: [
        { id: 1, text: 'Button 1', value: 'value1' },
        { id: 2, text: 'More', value: 'value2' },
      ],
      attachmentLinkUrl: 'https://example.com',
    }

    store = createStore({
      state: {
        config: {
          ui: {
            shouldDisplayResponseCardTitle: true,
            shouldDisableClickedResponseCardButtons: true,
            hideButtonMessageBubble: false,
          },
        },
      },
      actions: {
        postTextMessage: jest.fn(),
      },
    })

    wrapper = mount(ResponseCard, {
      props: {
        responseCard: mockResponseCard,
      },
      global: {
        plugins: [global.createVuetify(), store],
        provide: {
          getRCButtonsDisabled: () => false,
          setRCButtonsDisabled: jest.fn(),
        },
      },
    })
  })

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper);
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the title when shouldDisplayResponseCardTitle is true', () => {
    const title = wrapper.find('.text-h5')
    expect(title.text()).toBe('Test Title')
  })

  it('does not display the title when shouldDisplayResponseCardTitle is false', async () => {
    store.state.config.ui.shouldDisplayResponseCardTitle = false
    await wrapper.vm.$nextTick()
    const title = wrapper.find('.text-h5')
    expect(title.exists()).toBe(false)
  })

  it('displays the subtitle', async () => {
    const subtitle = wrapper.findAll('.v-card-text span').at(0);
    expect(subtitle.text()).toBe('Test Subtitle');
  })

  it('displays the image when imageUrl is provided', () => {
    const button = wrapper.findComponent({ name: 'v-img' });
    expect(button.props('src')).toBe('https://example.com/image.jpg');
  })

  it('renders buttons correctly', () => {
    const buttons = wrapper.findAll('.v-btn');
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('Button 1')
    expect(buttons[1].text()).toBe('More')
    expect(buttons[2].text()).toBe('Open Link')
  })

  it('applies different classes to "More" button', () => {
    const buttons = wrapper.findAll('.v-btn')
    expect(buttons[0].classes()).toContain('bg-accent')
    expect(buttons[1].classes()).not.toContain('bg-accent')
  })

  it('renders attachment link button when attachmentLinkUrl is provided', () => {
    const linkButton = wrapper.find('.v-btn[href]')
    expect(linkButton.exists()).toBe(true)
    expect(linkButton.attributes('href')).toBe('https://example.com')
    expect(linkButton.text()).toBe('Open Link')
  })

  it('disables buttons after click when shouldDisableClickedResponseCardButtons is true', async () => {
    const button = wrapper.findAll('.v-btn').at(0)
    await button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('calls onButtonClick method when a button is clicked', async () => {
    const postTextMessageSpy = jest.spyOn(store, 'dispatch')
    const button = wrapper.findAll('.v-btn').at(0)
    await button.trigger('click')
    expect(postTextMessageSpy).toHaveBeenCalledWith('postTextMessage', {
      type: 'human',
      text: 'value1',
    })
  })

  it('uses "button" message type when hideButtonMessageBubble is true', async () => {
    store.state.config.ui.hideButtonMessageBubble = true
    await wrapper.vm.$nextTick()
    const postTextMessageSpy = jest.spyOn(store, 'dispatch')
    const button = wrapper.findAll('.v-btn').at(0)
    await button.trigger('click')
    expect(postTextMessageSpy).toHaveBeenCalledWith('postTextMessage', {
      type: 'button',
      text: 'value1',
    })
  })

  it('calls setRCButtonsDisabled when a button is clicked', async () => {
    const setRCButtonsDisabledMock = jest.fn()
    wrapper = mount(ResponseCard, {
      props: {
        responseCard: mockResponseCard,
      },
      global: {
        plugins: [global.createVuetify(), store],
        provide: {
          getRCButtonsDisabled: () => false,
          setRCButtonsDisabled: setRCButtonsDisabledMock,
        },
      },
    })
    const button = wrapper.findAll('.v-btn').at(0)
    await button.trigger('click')
    expect(setRCButtonsDisabledMock).toHaveBeenCalled()
  })
})