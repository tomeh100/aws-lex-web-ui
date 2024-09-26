import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Message from '@/components/Message'
import ResponseCard from '@/components/ResponseCard'
import { testAccessibility } from '../../axe-helper'

// Mock child components
jest.mock('@/components/MessageText.vue', () => ({
  name: 'MessageText',
  template: '<div class="message-text"></div>'
}))

jest.mock('@/components/ResponseCard.vue', () => ({
  name: 'ResponseCard',
  template: '<div class="response-card"></div>'
}))

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

describe('Message.vue', () => {
  let store
  let wrapper
  let actions

  beforeEach(() => {
    actions = {
      postTextMessage: jest.fn(),
      toggleHasButtons: jest.fn()
    }
    store = createStore({
      state: {
        messages: [{
          id: 10,
          type: 'bot',
          text: 'Hello, how can I help you?',
          date: new Date()
        }],
        config: {
          ui: {
            avatarImageUrl: 'bot-avatar.png',
            agentAvatarImageUrl: 'agent-avatar.png',
            showDialogStateIcon: true,
            showCopyIcon: true,
            messageMenu: true,
            positiveFeedbackIntent: 'positive',
            negativeFeedbackIntent: 'negative',
            showMessageDate: true,
            hideInputFieldsForButtonResponse: false
          },
          lex: {
            v2BotLocaleId: 'en_US'
          }
        }
      },
      actions: actions
    })

    wrapper = mount(Message, {
      global: {
        plugins: [store],
        stubs: ['v-icon', 'v-btn', 'v-menu', 'v-list', 'v-list-item', 'v-list-item-title', 'v-tooltip', 'v-window', 'v-window-item']
      },
      props: {
        message: {
          id: 1,
          type: 'bot',
          text: 'Hello, how can I help you?',
          date: new Date()
        }
      }
    })
  })

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper)
  })

  it('renders correctly', async () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.message-bubble').exists()).toBe(true)
  })

  it('displays bot avatar when message type is bot', () => {
    const avatarElement = wrapper.find('.avatar')
    expect(avatarElement.exists()).toBe(true)
  })

  it('does not display avatar when message type is human', async () => {
    await wrapper.setProps({
      message: {
        id: 2,
        type: 'human',
        text: 'Hello, I need help',
        date: new Date()
      }
    })
    const avatarElement = wrapper.find('.avatar')
    expect(avatarElement.exists()).toBe(false)
  })

  it('displays agent avatar when message type is agent', async () => {
    await wrapper.setProps({
      message: {
        id: 3,
        type: 'agent',
        text: 'Hello, I am an agent',
        date: new Date()
      }
    })
    const avatarElement = wrapper.find('.avatar')
    expect(avatarElement.exists()).toBe(true)
  })

  it('shows copy icon for bot messages', () => {
    const copyIconElement = wrapper.find('.copy-icon')
    expect(copyIconElement.exists()).toBe(true)
  })

  it('copies message text to clipboard when copy icon is clicked', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    }
    Object.assign(navigator, {
      clipboard: mockClipboard
    })

    await wrapper.find('.copy-icon').trigger('click')
    await wrapper.vm.$nextTick()
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello, how can I help you?')
  })

  it('displays response card when present', async () => {
    await wrapper.setProps({
      message: {
        type: 'bot',
        text: 'Message with response card',
        responseCard: {
          version: 1,
          contentType: 'application/vnd.amazonaws.card.generic',
          genericAttachments: [{ title: 'Card Title' }]
        }
      }
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(ResponseCard).exists()).toBe(true)
  })

  it('handles QuickReply interactive messages', async () => {
    const interactiveMessage = {
      type: 'bot',
      text: JSON.stringify({
        templateType: 'QuickReply',
        data: {
          content: {
            title: 'Quick Reply Title',
            elements: [{ title: 'Option 1' }, { title: 'Option 2' }]
          }
        }
      })
    }

    await wrapper.setProps({ message: interactiveMessage })
    expect(wrapper.find('.response-card').exists()).toBe(true)
  })

  it('handles ListPicker interactive messages', async () => {
    const listPickerMessage = {
      type: 'bot',
      text: JSON.stringify({
        templateType: 'ListPicker',
        data: {
          content: {
            title: 'List Picker Title',
            subtitle: 'List Picker Subtitle',
            elements: [
              { title: 'Item 1', subtitle: 'Description 1' },
              { title: 'Item 2', subtitle: 'Description 2' }
            ]
          }
        }
      })
    }

    await wrapper.setProps({ message: listPickerMessage })
    expect(wrapper.find('.message-bubble.interactive-row').exists()).toBe(true)
  })

  it('handles Carousel interactive messages', async () => {
    const carouselMessage = {
      type: 'bot',
      text: JSON.stringify({
        templateType: 'Carousel',
        data: {
          content: {
            elements: [
              {
                title: 'Carousel Item 1',
                subtitle: 'Subtitle 1',
                data: {
                  content: {
                    elements: [
                      { title: 'Option 1', subtitle: 'Description 1' },
                      { title: 'Option 2', subtitle: 'Description 2' }
                    ]
                  }
                }
              }
            ]
          }
        }
      })
    }

    await wrapper.setProps({ message: carouselMessage })
    expect(wrapper.vm.shouldDisplayInteractiveMessage).toBe(true)
    expect(wrapper.vm.interactiveMessage.templateType).toBe('Carousel')
  })

  it('resends message when resendMessage is called', async () => {
    await wrapper.vm.resendMessage('Resend this message')
    await wrapper.vm.$nextTick()
    
    expect(actions.postTextMessage).toHaveBeenCalled()
  })

  it('handles different dialog states', async () => {
    const dialogStates = ['Failed', 'Fulfilled', 'ReadyForFulfillment']
    
    for (const state of dialogStates) {
      await wrapper.setProps({
        message: {
          type: 'bot',
          text: `Message with ${state} state`,
          dialogState: state
        }
      })

      const stateIcon = wrapper.find('.dialog-state')
      expect(stateIcon.exists()).toBe(true)
      expect(stateIcon.classes()).toContain(`dialog-state-${state === 'Failed' ? 'fail' : 'ok'}`)
    }
  })

  it('handles different locales for TimePicker', async () => {
    store.state.config.lex.v2BotLocaleId = 'fr_FR,fr_CA'
    
    const timePickerMessage = {
      type: 'bot',
      text: JSON.stringify({
        templateType: 'TimePicker',
        data: {
          content: {
            timeslots: [
              { date: '2023-05-01T10:00:00Z' },
              { date: '2023-05-01T11:00:00Z' },
              { date: '2023-05-02T10:00:00Z' }
            ]
          }
        }
      })
    }

    await wrapper.setProps({ message: timePickerMessage })
    expect(wrapper.vm.sortedTimeslots[0].date).toMatch(/lundi|Lundi/)
  })

  it('displays feedback buttons for bot messages', async () => {
    store.state.messages = [
      { id: 1, type: 'bot', text: 'First message', date: new Date() },
      { id: 2, type: 'bot', text: 'How can I help you?', date: new Date() }
    ]
    await wrapper.setProps({
      message: store.state.messages[store.state.messages.length - 1]
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showDialogFeedback).toBe(true)
  })

  it('handles feedback button clicks', async () => {
    store.state.messages = [
      { id: 1, type: 'bot', text: 'First message', date: new Date() },
      { id: 2, type: 'bot', text: 'How can I help you?', date: new Date() }
    ]
    await wrapper.setProps({
      message: store.state.messages[store.state.messages.length - 1]
    })
    await wrapper.vm.$nextTick()

    await wrapper.vm.onButtonClick('positive')

    expect(actions.postTextMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'feedback',
        text: 'positive'
      })
    )
    expect(wrapper.vm.positiveClick).toBe(true)
  })

  it('displays message date when focused', async () => {
    const messageBubble = wrapper.find('.message-bubble')
    await messageBubble.trigger('focus')

    expect(wrapper.find('.message-date-bot').exists()).toBe(true)
    expect(wrapper.find('.message-date-bot').text()).toMatch(/Now|min ago|\d{1,2}:\d{2}/)
  })

  it('plays audio when playAudio is called', async () => {
    const playMock = jest.fn()
    HTMLAudioElement.prototype.play = playMock

    await wrapper.setProps({
      message: {
        type: 'human',
        text: 'Audio message',
        audio: 'audio-url'
      }
    })

    await wrapper.vm.playAudio()
    expect(playMock).toHaveBeenCalled()
  })

  it('displays attachments tooltip when hovering over attachment icon', async () => {
    await wrapper.setProps({
      message: {
        type: 'human',
        text: 'Message with attachment',
        attachements: 'file.txt'
      }
    })

    wrapper.vm.mouseOverAttachment()
    expect(wrapper.vm.showAttachmentsTooltip).toBe(true)
  })

  it('displays message menu for human messages', async () => {
    await wrapper.setProps({
      message: {
        type: 'human',
        text: 'Hello, I need help',
        date: new Date()
      }
    })

    expect(wrapper.vm.showMessageMenu).toBe(true)
  })

  it('calls onMessageFocus when message bubble is focused', async () => {
    const spy = jest.spyOn(wrapper.vm, 'onMessageFocus')
    const messageBubble = wrapper.find('.message-bubble')
    await messageBubble.trigger('focus')

    expect(spy).toHaveBeenCalled()
  })

  it('updates messageHumanDate when onMessageFocus is called', async () => {
    await wrapper.vm.onMessageFocus()
    expect(wrapper.vm.messageHumanDate).toMatch(/Now|min ago|\d{1,2}:\d{2}/)
  })

  it('handles onMessageBlur', async () => {
    await wrapper.vm.onMessageBlur()
    expect(wrapper.vm.isMessageFocused).toBe(false)
  })

  it('correctly formats message date', () => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneHourAgo = new Date(now.getTime() - 3600000)
    const oneDayAgo = new Date(now.getTime() - 86400000)

    wrapper.vm.message.date = now
    expect(wrapper.vm.getMessageHumanDate()).toBe('Now')

    wrapper.vm.message.date = oneMinuteAgo
    expect(wrapper.vm.getMessageHumanDate()).toBe('1 min ago')

    wrapper.vm.message.date = oneHourAgo
    expect(wrapper.vm.getMessageHumanDate()).toMatch(/\d{1,2}:\d{2}/)

    wrapper.vm.message.date = oneDayAgo
    expect(wrapper.vm.getMessageHumanDate()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('handles setRCButtonsDisabled and getRCButtonsDisabled', () => {
    wrapper.vm.setRCButtonsDisabled()
    expect(wrapper.vm.getRCButtonsDisabled()).toBe(true)
  })

  it('computes shouldShowAvatarImage correctly', async () => {
    expect(wrapper.vm.shouldShowAvatarImage).toBe('bot-avatar.png')

    await wrapper.setProps({
      message: {
        type: 'human',
        text: 'Human message',
        date: new Date()
      }
    })
    expect(wrapper.vm.shouldShowAvatarImage).toBe(false)

    await wrapper.setProps({
      message: {
        type: 'agent',
        text: 'Agent message',
        date: new Date()
      }
    })
    expect(wrapper.vm.shouldShowAvatarImage).toBe('agent-avatar.png')
  })

  it('computes avatarBackground correctly', () => {
    expect(wrapper.vm.avatarBackground.background).toContain('bot-avatar.png')
  })

  it('computes shouldShowMessageDate correctly', () => {
    expect(wrapper.vm.shouldShowMessageDate).toBe(true)
    store.state.config.ui.showMessageDate = false
    expect(wrapper.vm.shouldShowMessageDate).toBe(false)
  })

  it('computes shouldShowAttachments correctly', async () => {
    expect(wrapper.vm.shouldShowAttachments).toBe(false)

    await wrapper.setProps({
      message: {
        type: 'human',
        text: 'Message with attachment',
        attachements: 'file.txt'
      }
    })
    expect(wrapper.vm.shouldShowAttachments).toBe(true)
  })
})