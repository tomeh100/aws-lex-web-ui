import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import LexWeb from '@/components/LexWeb'
import { testAccessibility } from '../../axe-helper';

// Mock child components
jest.mock('@/components/MinButton', () => ({ name: 'MinButton' }))
jest.mock('@/components/ToolbarContainer', () => ({ name: 'ToolbarContainer' }))
jest.mock('@/components/MessageList', () => ({ name: 'MessageList' }))
jest.mock('@/components/InputContainer', () => ({ name: 'InputContainer' }))

// Mock AWS SDK
jest.mock('aws-sdk/clients/lexruntime', () => {
  return jest.fn().mockImplementation(() => ({}));
});
jest.mock('aws-sdk/clients/lexruntimev2', () => {
  return jest.fn().mockImplementation(() => ({}));
});
jest.mock('aws-sdk/global', () => ({
  Config: jest.fn().mockImplementation(() => ({})),
  CognitoIdentityCredentials: jest.fn().mockImplementation(() => ({})),
}));

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
describe('LexWeb.vue', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      state: {
        config: {
          lex: { initialSpeechInstruction: 'Test instruction' },
          ui: {
            textInputPlaceholder: 'Type here',
            toolbarColor: 'blue',
            toolbarTitle: 'Lex Bot',
            toolbarLogo: 'logo.png',
            toolbarStartLiveChatLabel: 'Start Chat',
            toolbarStartLiveChatIcon: 'chat',
            toolbarEndLiveChatLabel: 'End Chat',
            toolbarEndLiveChatIcon: 'close',
            enableLiveChat: true,
            pageTitle: 'Lex Web UI',
            parentOrigin: 'http://localhost',
          },
          iframe: { shouldLoadIframeMinimized: false },
          cognito: { region: 'us-east-1', poolId: 'test-pool-id' },
          urlQueryParams: { lexWebUiEmbed: 'false' },
        },
        isSFXOn: true,
        isUiMinimized: false,
        hasButtons: false,
        lex: {},
        isRunningEmbedded: false,
        version: '1.0.0',
      },
      getters: {
        userName: () => () => 'TestUser',
      },
      actions: {
        initCredentials: jest.fn(),
        initRecorder: jest.fn(),
        initBotAudio: jest.fn(),
        initMessageList: jest.fn(),
        initPollyClient: jest.fn(),
        initLexClient: jest.fn(),
        initLiveChat: jest.fn(),
        sendMessageToParentWindow: jest.fn(),
        sendInitialUtterance: jest.fn(),
        toggleIsUiMinimized: jest.fn(),
        postTextMessage: jest.fn(),
        deleteSession: jest.fn(),
        startNewSession: jest.fn(),
        setSessionAttribute: jest.fn(),
        initConfig: jest.fn(),
        getConfigFromParent: jest.fn(),
      },
      mutations: {
        setInitialUtteranceSent: jest.fn(),
        setIsLoggedIn: jest.fn(),
        setTokens: jest.fn(),
        setIsRunningEmbedded: jest.fn(),
        setAwsCredsProvider: jest.fn(),
      },
    });
    store.dispatch = jest.fn().mockResolvedValue({});
    store.commit = jest.fn().mockResolvedValue({});

    const mockLexWebUi = {
      config: {},
      awsConfig: { credentials: {} },
      lexRuntimeClient: {},
      lexRuntimeV2Client: {},
      pollyClient: {},
    };
    wrapper = mount(LexWeb, {
      global: {
        plugins: [global.createVuetify(), store],
        mocks: {
          $lexWebUi: mockLexWebUi,
        },
      },
      shallow: true
    })
  })

  it('should have no accessibility violations', async () => {
    await testAccessibility(wrapper);
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  });

  it('initializes config on created', async () => {
    await wrapper.vm.$nextTick() // Wait for the next tick to ensure created hook has run
    expect(store.dispatch).toHaveBeenCalledWith('initConfig', {})
    expect(store.dispatch).toHaveBeenCalledWith('getConfigFromParent')
  });

  it('computes properties correctly', () => {
    expect(wrapper.vm.initialSpeechInstruction).toBe('Test instruction')
    expect(wrapper.vm.textInputPlaceholder).toBe('Type here')
    expect(wrapper.vm.toolbarColor).toBe('blue')
    expect(wrapper.vm.toolbarTitle).toBe('Lex Bot')
    expect(wrapper.vm.toolbarLogo).toBe('logo.png')
    expect(wrapper.vm.isSFXOn).toBe(true)
    expect(wrapper.vm.isUiMinimized).toBe(false)
    expect(wrapper.vm.hasButtons).toBe(false)
  })

  it('toggles UI minimization', async () => {
    await wrapper.vm.toggleMinimizeUi()
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('toggleIsUiMinimized')
  });

  it('handles login confirmation', async () => {
    wrapper.vm.loginConfirmed({ detail: { data: 'testToken' } })
    await wrapper.vm.$nextTick()
    expect(store.commit).toHaveBeenCalledWith('setIsLoggedIn', true)
    expect(store.commit).toHaveBeenCalledWith('setTokens', 'testToken')
  });

  it('handles logout confirmation', async () => {
    wrapper.vm.logoutConfirmed()
    await wrapper.vm.$nextTick()
    expect(store.commit).toHaveBeenCalledWith('setIsLoggedIn', false)
    expect(store.commit).toHaveBeenCalledWith('setTokens', {
      idtokenjwt: '',
      accesstokenjwt: '',
      refreshtoken: '',
    })
  })

  it('handles request login', async () => {
    wrapper.vm.handleRequestLogin()
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('sendMessageToParentWindow', { event: 'requestLogin' })
  })

  it('handles request logout', () => {
    wrapper.vm.handleRequestLogout()
    expect(store.dispatch).toHaveBeenCalledWith('sendMessageToParentWindow', { event: 'requestLogout' })
  })

  it('handles request live chat', () => {
    wrapper.vm.handleRequestLiveChat()
    expect(store.dispatch).toHaveBeenCalledWith('requestLiveChat')
  })

  it('handles end live chat', () => {
    wrapper.vm.handleEndLiveChat()
    expect(store.dispatch).toHaveBeenCalledWith('requestLiveChatEnd')
  })

  it('handles message from parent', () => {
    const mockEvent = {
      origin: 'http://localhost',
      ports: [{ postMessage: jest.fn() }],
      data: { event: 'ping' },
    }
    wrapper.vm.messageHandler(mockEvent)
    expect(mockEvent.ports[0].postMessage).toHaveBeenCalled()
  })

  it('handles component message', () => {
    const mockEvent = { detail: { event: 'ping' } }
    wrapper.vm.componentMessageHandler(mockEvent)
    expect(store.dispatch).toHaveBeenCalledWith('sendMessageToParentWindow', { event: 'pong' })
  })

  it('handles component messages', () => {
    const mockEvents = [
      { detail: { event: 'ping' } },
      { detail: { event: 'confirmLogin', data: { token: 'testToken' } } },
      { detail: { event: 'confirmLogout' } },
      { detail: { event: 'postText', message: 'Hello' } },
      { detail: { event: 'replaceCreds', creds: { accessKeyId: 'testKey' } } },
      { detail: { event: 'unknownEvent' } },
    ]

    mockEvents.forEach(mockEvent => {
      wrapper.vm.componentMessageHandler(mockEvent)
    })

    expect(store.dispatch).toHaveBeenCalledWith('sendMessageToParentWindow', { event: 'pong' })
    expect(store.commit).toHaveBeenCalledWith('setIsLoggedIn', true)
    expect(store.commit).toHaveBeenCalledWith('setTokens', { token: 'testToken' })
    expect(store.commit).toHaveBeenCalledWith('setIsLoggedIn', false)
    expect(store.dispatch).toHaveBeenCalledWith('postTextMessage', { type: 'human', text: 'Hello' })
    expect(store.dispatch).toHaveBeenCalledWith('initCredentials', { accessKeyId: 'testKey' })
  })
})
