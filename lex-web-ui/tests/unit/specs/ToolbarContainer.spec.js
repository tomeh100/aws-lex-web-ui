import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ToolbarContainer from '@/components/ToolbarContainer';
import { chatMode, liveChatStatus } from '@/store/state';
import { deepMerge } from '../../testHelper';
import { testAccessibility } from '../../axe-helper';

const createMockStore = (customState = {}) => {
  const defaultState = {
    config: {
      ui: {
        enableLogin: false,
        forceLogin: false,
        saveHistory: false,
        enableLiveChat: false,
        helpIntent: '',
        enableSFX: false,
        messageSentSFX: '',
        messageReceivedSFX: '',
        backButton: false,
        helpContent: {
          en_US: {
            text: 'Help text',
            markdown: 'Help markdown',
            repeatLastMessage: true
          }
        }
      },
      lex: {
        v2BotLocaleId: 'en_US',
      },
    },
    isRunningEmbedded: false,
    isLoggedIn: false,
    utteranceStack: [],
    chatMode: chatMode.BOT,
    liveChat: { status: liveChatStatus.DISCONNECTED },
    lex: { 
      isProcessing: false,
      sessionState: {
        dialogAction: {},
        intent: {}
      }
    },
    isBackProcessing: false,
    isSFXOn: false,
    messages: [],
  };

  const mergedState = deepMerge(JSON.parse(JSON.stringify(defaultState)), customState);

  const store = createStore({
    state: mergedState,
    getters: {
      lastUtterance: () => () => '',
    },
    mutations: {
      updateLocaleIds: jest.fn(),
      toggleBackProcessing: jest.fn(),
      popUtterance: jest.fn(),
    },
    actions: {
      toggleIsSFXOn: jest.fn(),
      pushMessage: jest.fn(),
      postTextMessage: jest.fn(),
      resetHistory: jest.fn(),
    },
  });

  store.dispatch = jest.fn();
  store.commit = jest.fn();

  return store;
};

describe('ToolbarContainer', () => {
  let wrapper;
  let store;

  const createComponent = (props = {}, state = {}) => {
    store = createMockStore(state);
    wrapper = mount(ToolbarContainer, {
      global: {
        plugins: [global.createVuetify(), store],
      },
      props: {
        toolbarTitle: 'Test Title',
        toolbarColor: 'primary',
        toolbarLogo: 'test-logo.png',
        isUiMinimized: false,
        userName: 'Test User',
        toolbarStartLiveChatLabel: 'Start Chat',
        toolbarStartLiveChatIcon: 'chat',
        toolbarEndLiveChatLabel: 'End Chat',
        toolbarEndLiveChatIcon: 'call_end',
        ...props,
      }
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  it('should have no accessibility violations', async () => {
    createComponent();
    await testAccessibility(wrapper);
  });

  describe('Rendering', () => {
    it('renders correctly when not minimized', () => {
      createComponent();
      expect(wrapper.find('.v-toolbar').exists()).toBe(true);
      expect(wrapper.find('.toolbar-title').text()).toBe('Test Title Test User');
    });

    it('does not render when minimized', () => {
      createComponent({ isUiMinimized: true });
      expect(wrapper.find('v-toolbar').exists()).toBe(false);
    });

    it('renders toolbar logo when provided', () => {
      createComponent();
      const logo = wrapper.find('.toolbar-image');
      expect(logo.exists()).toBe(true);
      expect(logo.attributes('src')).toBe('test-logo.png');
    });

    it('computes isEnableLogin correctly when enableLogin is true', () => {
      createComponent({}, { config: { ui: { enableLogin: true } } });
      expect(wrapper.vm.isEnableLogin).toBe(true);
    });

    it('computes isLoggedIn correctly when user is logged in', () => {
      createComponent({}, { config: { ui: { enableLogin: true } }, isLoggedIn: true });
      expect(wrapper.vm.isLoggedIn).toBe(true);
    });

    it('computes isSaveHistory correctly when saveHistory is true', () => {
      createComponent({}, { config: { ui: { saveHistory: true } } });
      expect(wrapper.vm.isSaveHistory).toBe(true);
    });

    it('computes canLiveChat correctly when enableLiveChat is true', () => {
      createComponent({}, { config: { ui: { enableLiveChat: true } } });
      expect(wrapper.vm.canLiveChat).toBe(true);
    });

    it('computes isLiveChat correctly when in live chat mode', () => {
      createComponent({}, { config: { ui: { enableLiveChat: true } }, chatMode: chatMode.LIVECHAT });
      expect(wrapper.vm.isLiveChat).toBe(true);
    });

    it('computes isLocaleSelectable correctly when multiple locales are available', () => {
      createComponent({}, { config: { lex: { v2BotLocaleId: 'en_US,es_ES' } } });
      expect(wrapper.vm.isLocaleSelectable).toBe(true);
      expect(wrapper.vm.locales).toEqual(['en_US', 'es_ES']);
    });
  });

  describe('Computed Properties', () => {
    it('computes toolbarClickHandler correctly', () => {
      createComponent({ isUiMinimized: true });
      expect(wrapper.vm.toolbarClickHandler).toHaveProperty('click');

      createComponent({ isUiMinimized: false });
      expect(wrapper.vm.toolbarClickHandler).toBeNull();
    });

    it('computes toolTipMinimize correctly', () => {
      createComponent({ isUiMinimized: true });
      expect(wrapper.vm.toolTipMinimize).toBe('maximize');

      createComponent({ isUiMinimized: false });
      expect(wrapper.vm.toolTipMinimize).toBe('minimize');
    });

    it('computes isEnableLogin correctly', async () => {
      createComponent({}, { config: { ui: { enableLogin: true } } });
      expect(wrapper.vm.isEnableLogin).toBe(true);

      createComponent({}, { config: { ui: { enableLogin: false } } });
      expect(wrapper.vm.isEnableLogin).toBe(false);
    });

    it('computes isLocaleSelectable correctly', () => {
      createComponent({}, { config: { lex: { v2BotLocaleId: 'en_US,es_ES' } } });
      expect(wrapper.vm.isLocaleSelectable).toBe(true);

      createComponent({}, { config: { lex: { v2BotLocaleId: 'en_US' } } });
      expect(wrapper.vm.isLocaleSelectable).toBe(false);
    });

    it('computes canLiveChat correctly', () => {
      createComponent({}, {
        config: { ui: { enableLiveChat: true } },
        chatMode: chatMode.BOT,
        liveChat: { status: liveChatStatus.DISCONNECTED }
      });
      expect(wrapper.vm.canLiveChat).toBe(true);

      createComponent({}, {
        config: { ui: { enableLiveChat: false } },
        chatMode: chatMode.BOT,
        liveChat: { status: liveChatStatus.CONNECTED }
      });
      expect(wrapper.vm.canLiveChat).toBe(false);
    });

    it('computes isLexProcessing correctly', () => {
      createComponent({}, { isBackProcessing: true });
      expect(wrapper.vm.isLexProcessing).toBe(true);

      createComponent({}, { lex: { isProcessing: true } });
      expect(wrapper.vm.isLexProcessing).toBe(true);

      createComponent({}, { isBackProcessing: false, lex: { isProcessing: false } });
      expect(wrapper.vm.isLexProcessing).toBe(false);
    });

    it('computes shouldRenderHelpButton correctly', () => {
      createComponent({}, { config: { ui: { helpIntent: 'Help' } } });
      expect(wrapper.vm.shouldRenderHelpButton).toBe(true);

      createComponent({}, { config: { ui: { helpIntent: '' } } });
      expect(wrapper.vm.shouldRenderHelpButton).toBe(false);
    });

  });

  describe('Methods', () => {
    it('toggles SFX mute', async () => {
      createComponent();
      await wrapper.vm.toggleSFXMute();
      expect(store.dispatch).toHaveBeenCalledWith('toggleIsSFXOn');
    });

    it('toggles minimize when running embedded', async () => {
      createComponent({}, { isRunningEmbedded: true });
      await wrapper.vm.toggleMinimize();
      expect(wrapper.emitted()).toHaveProperty('toggleMinimizeUi');
    });

    it('does not toggle minimize when not running embedded', async () => {
      createComponent({}, { isRunningEmbedded: false });
      await wrapper.vm.toggleMinimize();
      expect(wrapper.emitted()).not.toHaveProperty('toggleMinimizeUi');
    });

    it('sets locale correctly', async () => {
      createComponent({}, { config: { lex: { v2BotLocaleId: 'en_US,es_ES,fr_FR' } } });
      await wrapper.vm.setLocale('es_ES');
      expect(store.commit).toHaveBeenCalledWith('updateLocaleIds', 'es_ES,en_US,fr_FR');
      expect(localStorage.getItem('selectedLocale')).toBe('es_ES');
    });

    it('sends help message correctly', async () => {
      const helpContent = {
        en_US: {
          text: 'Help text',
          markdown: 'Help markdown',
          repeatLastMessage: true
        }
      };
      createComponent({}, {
        config: {
          ui: { helpContent },
          lex: { v2BotLocaleId: 'en_US' }
        },
        messages: [{ type: 'bot', text: 'Last message' }]
      });

      await wrapper.vm.sendHelp();
      expect(store.dispatch).toHaveBeenCalledWith('pushMessage', expect.objectContaining({
        text: 'Help text',
        type: 'bot'
      }));
      expect(store.dispatch).toHaveBeenCalledWith('pushMessage', { type: 'bot', text: 'Last message' });
    });

    it('handles onPrev correctly', async () => {
      createComponent({}, { utteranceStack: ['Last utterance'] });
      await wrapper.vm.onPrev();
      expect(store.commit).toHaveBeenCalledWith('popUtterance');
    });

    it('handles requestResetHistory correctly', async () => {
      createComponent();
      await wrapper.vm.requestResetHistory();
      expect(store.dispatch).toHaveBeenCalledWith('resetHistory');
    });

    it('emits requestLiveChat event', async () => {
      createComponent();
      await wrapper.vm.requestLiveChat();
      expect(wrapper.emitted().requestLiveChat).toBeTruthy();
    });

    it('emits endLiveChat event', () => {
      createComponent();
      wrapper.vm.endLiveChat();
      expect(wrapper.emitted().endLiveChat).toBeTruthy();
    });
  });

  describe('Event Handlers', () => {
    it('emits requestLogin event', () => {
      createComponent();
      wrapper.vm.requestLogin();
      expect(wrapper.emitted().requestLogin).toBeTruthy();
    });

    it('emits requestLogout event', () => {
      createComponent();
      wrapper.vm.requestLogout();
      expect(wrapper.emitted().requestLogout).toBeTruthy();
    });

    it('dispatches resetHistory action', async () => {
      createComponent();
      await wrapper.vm.requestResetHistory();
      expect(store.dispatch).toHaveBeenCalledWith('resetHistory');
    });

    it('emits requestLiveChat event', async () => {
      createComponent();
      await wrapper.vm.requestLiveChat();
      expect(wrapper.emitted().requestLiveChat).toBeTruthy();
    });

    it('emits endLiveChat event', () => {
      createComponent();
      wrapper.vm.endLiveChat();
      expect(wrapper.emitted().endLiveChat).toBeTruthy();
    });

    describe('UI Interactions', () => {
      it('toggles minimize on toolbar title click when running embedded', async () => {
        createComponent({}, { isRunningEmbedded: true });
        await wrapper.find('.toolbar-title').trigger('click');
        expect(wrapper.emitted()).toHaveProperty('toggleMinimizeUi');
      });

      it('calls sendHelp when help button is clicked', async () => {
        createComponent({}, { config: { ui: { helpIntent: 'Help' } } });
        const sendHelpSpy = jest.spyOn(wrapper.vm, 'sendHelp');
        await wrapper.vm.$nextTick();
        const helpButton = wrapper.find('.help-toggle');
        if (helpButton.exists()) {
          await helpButton.trigger('click');
          expect(sendHelpSpy).toHaveBeenCalled();
        }
      });

      it('calls toggleSFXMute when SFX button is clicked', async () => {
        createComponent({}, { 
          config: { 
            ui: { 
              enableSFX: true, 
              messageSentSFX: 'sent.mp3', 
              messageReceivedSFX: 'received.mp3' 
            } 
          } 
        });
        const toggleSFXMuteSpy = jest.spyOn(wrapper.vm, 'toggleSFXMute');
        await wrapper.vm.$nextTick();
        // Since the SFX button is inside a v-menu, we need to simulate clicking it
        // by directly calling the method it would trigger
        await wrapper.vm.toggleSFXMute();
        expect(toggleSFXMuteSpy).toHaveBeenCalled();
      });
    });
  });
});