import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import InputContainer from '@/components/InputContainer';
import { testAccessibility } from '../../axe-helper';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

const createMockStore = (state = {}) => createStore({
  state: {
    botAudio: { isSpeaking: false, autoPlay: false },
    lex: { isProcessing: false, dialogState: '', sessionAttributes: {} },
    recState: { 
      isConversationGoing: false, 
      isMicMuted: false, 
      isRecorderSupported: true, 
      isRecorderEnabled: true 
    },
    chatMode: 'default',
    isLoggedIn: false,
    config: {
      ui: {
        uploadRequireLogin: false,
        enableUpload: true,
        showErrorDetails: false
      },
      lex: {
        allowStreamingResponses: false,
        streamingWebSocketEndpoint: 'wss://example.com',
        streamingDynamoDbTable: 'exampleTable'
      }
    },
    ...state
  },
  actions: {
    sendTypingEvent: jest.fn(),
    postTextMessage: jest.fn(),
    interruptSpeechConversation: jest.fn(),
    startConversation: jest.fn(),
    pollySynthesizeInitialSpeech: jest.fn(),
    setAudioAutoPlay: jest.fn(),
    pushErrorMessage: jest.fn(),
    uploadFile: jest.fn(),
    setSessionAttribute: jest.fn()
  },
});

describe('InputContainer.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = createMockStore();
    wrapper = mount(InputContainer, {
      global: {
        plugins: [global.createVuetify(), store],
      },
      props: {
        textInputPlaceholder: 'Type a message',
        initialSpeechInstruction: 'How can I help you?'
      }
    });
  });

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper);
  });

  it('shows text input when not in speech conversation', () => {
    expect(wrapper.vm.shouldShowTextInput).toBe(true);
    expect(wrapper.find('#text-input').exists()).toBe(true);
  });

  it('hides text input during speech conversation', async () => {
    store.state.recState.isConversationGoing = true;
    expect(wrapper.vm.shouldShowTextInput).toBe(false);
  });

  it('disables input when Lex is processing', async () => {
    store.state.lex.isProcessing = true;
    await wrapper.vm.$nextTick()
    const textField = wrapper.find('#text-input');
    expect(textField.attributes('disabled')).toBe('')
  });

  it('shows send button when text is entered', async () => {
    wrapper.setData({ textInput: 'Hello', isTextFieldFocused: true });
    expect(wrapper.vm.shouldShowSendButton).toBe(true);
  });

  it('shows mic button when recorder is supported and enabled', async () => {
    expect(wrapper.vm.shouldShowSendButton).toBe(false);
    const micButton = wrapper.findComponent({ ref: 'mic' });
    expect(micButton.exists()).toBe(true);
  });

  it('disables mic button when mic is muted', async () => {
    store.state.recState.isMicMuted = true;
    expect(wrapper.vm.isMicButtonDisabled).toBe(true);
  });

  it('changes mic button icon based on state', async () => {
    expect(wrapper.vm.micButtonIcon).toBe('mic');
    
    store.state.recState.isMicMuted = true;
    expect(wrapper.vm.micButtonIcon).toBe('mic_off');
    
    store.state.recState.isMicMuted = false;
    store.state.botAudio.isSpeaking = true;
    expect(wrapper.vm.micButtonIcon).toBe('stop');
  });

  it('shows upload button when enabled', async () => {
    store.state.config.ui.enableUpload = true;
    await wrapper.vm.$nextTick()
    const uploadButton = wrapper.findComponent({ ref: 'upload' });
    expect(uploadButton.exists()).toBe(true);
  });

  it('hides upload button when disabled', async () => {
    store.state.config.ui.enableUpload = false;
    await wrapper.vm.$nextTick()
    const uploadButton = wrapper.findComponent({ ref: 'upload' });
    expect(uploadButton.exists()).toBe(false);
  });

  it('calls postTextMessage when send button is clicked', async () => {
    const postTextMessageSpy = jest.spyOn(wrapper.vm, 'postTextMessage');
    wrapper.setData({ textInput: 'Hello', isTextFieldFocused: true });
    await wrapper.vm.$nextTick();
    const sendButton = wrapper.findComponent({ ref: 'send' });
    sendButton.trigger('click');
    expect(postTextMessageSpy).toHaveBeenCalled();
  });

  it('removes attachments when clear button is clicked', async () => {
    await wrapper.setData({ shouldShowAttachmentClear: true });
    store.state.lex.sessionAttributes.userFilesUploaded = JSON.stringify([{ fileName: 'test.txt' }]);
    
    const clearButton = wrapper.findComponent({ ref :'removeAttachments' });
    clearButton.trigger('click');
    
    expect(store.state.lex.sessionAttributes.userFilesUploaded).toBeUndefined();
    expect(wrapper.vm.shouldShowAttachmentClear).toBe(false);
  });
});