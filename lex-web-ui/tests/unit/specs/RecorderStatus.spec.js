import { mount, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RecorderStatus from '@/components/RecorderStatus'
import { testAccessibility } from '../../axe-helper';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

describe('RecorderStatus.vue', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      state: {
        botAudio: {
          canInterrupt: false,
          isSpeaking: false,
          isInterrupting: false,
        },
        recState: {
          isConversationGoing: false,
          isInterrupting: false,
          isMicMuted: false,
          isRecorderSupported: true,
          isRecording: false,
        },
      },
      actions: {
        getRecorderVolume: jest.fn().mockResolvedValue({ instant: 0.5 }),
        getAudioProperties: jest.fn().mockResolvedValue({ end: 5, duration: 10 }),
      },
    })

    wrapper = mount(RecorderStatus, {
      global: {
        plugins: [global.createVuetify(), store],
      },
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
  })

  describe('computed properties', () => {
    it('isSpeechConversationGoing returns correct value', async () => {
      expect(wrapper.vm.isSpeechConversationGoing).toBe(false)
      wrapper.vm.$store.state.recState.isConversationGoing = true
      expect(wrapper.vm.isSpeechConversationGoing).toBe(true)
    })

    it('isProcessing returns correct value', async () => {
      expect(wrapper.vm.isProcessing).toBe(false)
      wrapper.vm.$store.state.recState.isConversationGoing = true
      expect(wrapper.vm.isProcessing).toBe(true)
    })

    it('statusText returns correct value for different states', async () => {
      expect(wrapper.vm.statusText).toBe('Click on the mic')

      wrapper.vm.$store.state.recState.isRecording = true
      expect(wrapper.vm.statusText).toBe('Listening...')

      wrapper.vm.$store.state.recState.isRecording = false
      wrapper.vm.$store.state.botAudio.isSpeaking = true
      expect(wrapper.vm.statusText).toBe('Playing audio...')

      wrapper.vm.$store.state.botAudio.isSpeaking = false
      wrapper.vm.$store.state.recState.isConversationGoing = true
      expect(wrapper.vm.statusText).toBe('Processing...')

      wrapper.vm.$store.state.recState.isConversationGoing = false
      wrapper.vm.$store.state.recState.isMicMuted = true
      expect(wrapper.vm.statusText).toBe('Microphone seems to be muted...')

      wrapper.vm.$store.state.recState.isMicMuted = false
      wrapper.vm.$store.state.botAudio.canInterrupt = true
      expect(wrapper.vm.statusText).toBe('Say "skip" and I\'ll listen for your answer...')

      wrapper.vm.$store.state.botAudio.canInterrupt = false
      wrapper.vm.$store.state.recState.isInterrupting = true
      expect(wrapper.vm.statusText).toBe('Interrupting...')
    })
  })

  describe('methods', () => {
    it('leaveAudioPlay clears interval and resets audioPlayPercent', async () => {
      wrapper.vm.audioIntervalId = setInterval(() => {}, 1000);
      wrapper.vm.audioPlayPercent = 50;
      await wrapper.vm.leaveAudioPlay();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.audioPlayPercent).toBe(0)
    })
  })

  describe('component rendering', () => {
    it('renders volume meter when isRecording is true', async () => {
      await wrapper.vm.$nextTick();
      wrapper.vm.$store.state.recState.isRecording = true;
      await wrapper.vm.$nextTick();
      const volumeMeter = await wrapper.find('.volume-meter');
      expect(wrapper.find('.volume-meter').exists()).toBeTruthy()
    })

    it('renders processing bar when isProcessing is true', async () => {
      wrapper.vm.$store.state.recState.isConversationGoing = true
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.processing-bar').exists()).toBe(true)
    })

    it('renders audio progress bar when isBotSpeaking is true', async () => {
      wrapper.vm.$store.state.botAudio.isSpeaking = true
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.audio-progress-bar').exists()).toBe(true)
    })
  })
})