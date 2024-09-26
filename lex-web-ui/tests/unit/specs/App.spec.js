import { shallowMount, mount } from '@vue/test-utils';
import { testAccessibility } from '../../axe-helper';
import App from '@/App';


/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */

describe('App.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(App, {
      global: {
        stubs: ['router-view']
      }
    });
  });

  it('should have no accessibility violations', async () => {
    const mountedWrapper = mount(App, {
      global: {
        stubs: ['router-view']
      }
    });
    await testAccessibility(mountedWrapper);
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the router-view element', () => {
    expect(wrapper.find('router-view-stub').exists()).toBe(true);
  });

  it('has the correct id on the root element', () => {
    expect(wrapper.attributes('id')).toBe('lex-app');
  });
});