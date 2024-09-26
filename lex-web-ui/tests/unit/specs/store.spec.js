import { config } from '@/config';
import storeModule from '@/store';
import { createStore } from 'vuex';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
describe('store', () => {
  let store;

  beforeEach(() => {
    store = createStore(storeModule);
  });

  it('should initialize with correct default state', () => {
    expect(store.state.config).toEqual(config);
    expect(store.state.messages).toEqual([]);
    expect(store.state.botAudio.isSpeaking).toBe(false);
    expect(store.state.isLoggedIn).toBe(false);
  });

  it('should update messages when pushMessage mutation is committed', () => {
    const message = { type: 'human', text: 'Hello' };
    store.commit('pushMessage', message);
    expect(store.state.messages).toHaveLength(1);
    expect(store.state.messages[0].text).toEqual(message.text);
    expect(store.state.messages[0].type).toEqual(message.type);
  });

  it('should update isBotSpeaking when setIsBotSpeaking mutation is committed', () => {
    store.commit('setIsBotSpeaking', true);
    expect(store.state.botAudio.isSpeaking).toBe(true);
    store.commit('setIsBotSpeaking', false);
    expect(store.state.botAudio.isSpeaking).toBe(false);
  });

  it('should update isLoggedIn when setIsLoggedIn mutation is committed', () => {
    store.commit('setIsLoggedIn', true);
    expect(store.state.isLoggedIn).toBe(true);
    store.commit('setIsLoggedIn', false);
    expect(store.state.isLoggedIn).toBe(false);
  });

  it('should update lex state when updateLexState mutation is committed', () => {
    const lexState = {
      dialogState: 'ElicitIntent',
      inputTranscript: 'Hello',
      message: 'How can I help you?',
    };
    store.commit('updateLexState', lexState);
    expect(store.state.lex.dialogState).toBe('ElicitIntent');
    expect(store.state.lex.inputTranscript).toBe('Hello');
    expect(store.state.lex.message).toBe('How can I help you?');
  });

  it('should toggle isSFXOn when toggleIsSFXOn mutation is committed', () => {
    const initialState = store.state.isSFXOn;
    store.commit('toggleIsSFXOn');
    expect(store.state.isSFXOn).toBe(!initialState);
    store.commit('toggleIsSFXOn');
    expect(store.state.isSFXOn).toBe(initialState);
  });

  it('should set chat mode when setChatMode mutation is committed', () => {
    store.commit('setChatMode', 'bot');
    expect(store.state.chatMode).toBe('bot');
    store.commit('setChatMode', 'livechat');
    expect(store.state.chatMode).toBe('livechat');
  });

  it('should return correct value for isBotSpeaking getter', () => {
    store.state.botAudio.isSpeaking = true;
    expect(store.getters.isBotSpeaking).toBe(true);
    store.state.botAudio.isSpeaking = false;
    expect(store.getters.isBotSpeaking).toBe(false);
  });

  it('should return correct value for isLexProcessing getter', () => {
    store.state.lex.isProcessing = true;
    expect(store.getters.isLexProcessing).toBe(true);
    store.state.lex.isProcessing = false;
    expect(store.getters.isLexProcessing).toBe(false);
  });

  it('should return correct value for lastUtterance getter', () => {
    store.state.utteranceStack = [{ t: 'Hello' }, { t: 'How are you?' }];
    expect(store.getters.lastUtterance()).toBe('How are you?');
    store.state.utteranceStack = [];
    expect(store.getters.lastUtterance()).toBe('');
  });
});