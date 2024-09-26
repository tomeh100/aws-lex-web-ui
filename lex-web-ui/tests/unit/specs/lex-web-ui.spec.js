import { Loader, Plugin, AsyncComponent } from '@/lex-web-ui';
import { createStore } from 'vuex';
import { createVuetify } from 'vuetify';
import { mergeConfig } from '@/config';

// Mock Vue
jest.mock('vue', () => ({
  createApp: jest.fn(() => ({
    use: jest.fn(),
    mount: jest.fn(),
    config: {
      globalProperties: {},
    },
  })),
  defineAsyncComponent: jest.fn((options) => options),
}));

jest.mock('vue/dist/vue.esm-bundler', () => ({
  createAppDev: jest.fn()
}));

jest.mock('@/config', () => ({
  config: { cognito: { poolId: 'default-pool-id' } },
  mergeConfig: jest.fn((defaultConfig, config) => ({ ...defaultConfig, ...config })),
}));

// Mock AWS SDK
jest.mock('aws-sdk/global', () => ({
  Config: jest.fn(),
  CognitoIdentityCredentials: jest.fn(),
}));

jest.mock('aws-sdk/clients/lexruntime', () => jest.fn());
jest.mock('aws-sdk/clients/lexruntimev2', () => jest.fn());
jest.mock('aws-sdk/clients/polly', () => jest.fn());

// Mock Vuetify
jest.mock('vuetify', () => ({
  createVuetify: jest.fn(() => ({
    theme: {
      themes: {
        light: {},
        dark: {},
      },
    },
  })),
}));

// Mock Vuex
jest.mock('vuex', () => ({
  createStore: jest.fn(() => ({})),
}));

describe('lex-web-ui Loader', () => {
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new Loader();
  });

  it('should create a Loader instance', () => {
    expect(loader).toBeInstanceOf(Loader);
  });

  it('should create a Vuex store', () => {
    expect(createStore).toHaveBeenCalled();
    expect(loader.store).toBeDefined();
  });

  it('should use Vuetify', () => {
    expect(createVuetify).toHaveBeenCalled();
  });

  it('should merge provided config with default config', () => {
    const customConfig = {
      cognito: {
        poolId: 'custom-pool-id',
      },
    };
    new Loader(customConfig);
    expect(mergeConfig).toHaveBeenCalledWith(expect.any(Object), customConfig);
  });

  it('should install the Plugin', () => {
    const mockApp = {
      config: {
        globalProperties: {},
      },
      component: jest.fn(),
    };
    Plugin.install(mockApp, {});
    expect(mockApp.config.globalProperties.$lexWebUi).toBeDefined();
    expect(mockApp.component).toHaveBeenCalledWith('lex-web-ui', expect.any(Object));
  });

  it('should define AsyncComponent correctly', () => {
    expect(AsyncComponent).toBeDefined();
  });
});