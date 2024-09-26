import { shallowMount, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import MinButton from '@/components/MinButton';
import { testAccessibility } from '../../axe-helper';

/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

describe('MinButton.vue', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      state: {
        isRunningEmbedded: false,
        config: {
          ui: {
            minButtonContent: 'Chat'
          }
        }
      }
    });
  });

  const createWrapper = (props = {}, mountingMethod = mount) => {
    return mountingMethod(MinButton, {
      props: {
        toolbarColor: 'primary',
        isUiMinimized: true,
        ...props
      },
      global: {
        plugins: [global.createVuetify(), store]
      }
    });
  };

  it('should have no accessibility violations', async () => {
    const wrapper = createWrapper();
    await testAccessibility(wrapper);
  });

  it('renders correctly when isUiMinimized is true', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.min-button').exists()).toBe(true);
    expect(wrapper.find('.min-button').isVisible()).toBe(true);
  });

  it('does not render when isUiMinimized is false', () => {
    const wrapper = createWrapper({ isUiMinimized: false });
    expect(wrapper.find('.min-button').exists()).toBe(true);
    expect(wrapper.find('.min-button').isVisible()).toBe(false);
  });

  it('renders button with text when minButtonContent is set', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.min-button-content').exists()).toBe(true);
    expect(wrapper.find('.min-button-content').text()).toBe('Chat');
  });

  it('renders button without text when minButtonContent is not set', async () => {
    store.state.config.ui.minButtonContent = '';
    const wrapper = createWrapper();
    expect(wrapper.find('.min-button-content').exists()).toBeFalsy();
  });

  it('applies the correct color to the button', async () => {
    const wrapper = createWrapper({ toolbarColor: 'secondary' });
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.$props.toolbarColor).toBe('secondary');
    const button = wrapper.findComponent({ name: 'v-btn' });
    expect(button.props('color')).toBe('secondary');
  });
  

  describe('computed properties', () => {
    it('computes toolTipMinimize correctly', async () => {
      const wrapper = createWrapper({ isUiMinimized: true });
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.toolTipMinimize).toBe('maximize');

      wrapper.setProps({ isUiMinimized: false });
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.toolTipMinimize).toBe('minimize');
    });

    it('computes minButtonContent correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.minButtonContent).toBe('Chat');

      store.state.config.ui.minButtonContent = '';
      expect(wrapper.vm.minButtonContent).toBe(false);
    });
  });

  describe('methods', () => {
    it('toggles tooltip visibility on hover events', async () => {
      const wrapper = createWrapper();
      
      await wrapper.find('.min-button').trigger('mouseenter');
      expect(wrapper.vm.shouldShowTooltip).toBe(true);

      await wrapper.find('.min-button').trigger('mouseleave');
      expect(wrapper.vm.shouldShowTooltip).toBe(false);
    });

    it('emits toggleMinimizeUi event when toggleMinimize is called and isRunningEmbedded is true', async () => {
      store.state.isRunningEmbedded = true;
      const wrapper = createWrapper();
      
      wrapper.vm.toggleMinimize();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('toggleMinimizeUi')).toBeTruthy();
      expect(wrapper.vm.shouldShowTooltip).toBe(false);
    });

    it('does not emit toggleMinimizeUi event when isRunningEmbedded is false', () => {
      const wrapper = createWrapper();
      
      wrapper.vm.toggleMinimize();
      expect(wrapper.emitted('toggleMinimizeUi')).toBeFalsy();
    });
  });
});