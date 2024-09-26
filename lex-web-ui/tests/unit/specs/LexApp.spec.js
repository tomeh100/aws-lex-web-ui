import { shallowMount, mount } from '@vue/test-utils';
import { testAccessibility } from '../../axe-helper';
import LexApp from '@/LexApp';

describe('LexApp.vue', () => {
    it('should have no accessibility violation', async () => {
        const wrapper = mount(LexApp);
        await testAccessibility(wrapper);
    });
    
    it('renders without errors', () => {
        const wrapper = shallowMount(LexApp);
        expect(wrapper.exists()).toBe(true);
    });

    it('contains a router-view component', () => {
        const wrapper = shallowMount(LexApp, {
            global: {
                stubs: ['router-view']
              }
        });
        expect(wrapper.find('router-view-stub').exists()).toBe(true);
    });
});