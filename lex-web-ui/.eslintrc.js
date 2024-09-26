module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    "import",
    "vue",
  ],
  extends: [
    'plugin:vue/essential',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['tests?/unit/index.js'],
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 'warn',
    'no-param-reassign': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        vue: 'never',
      },
    ],
    'vue/valid-v-for': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-side-effects-in-computed-properties': 'off',
    'vue/return-in-computed-property': 'off',
    'vue/no-deprecated-v-on-native-modifier': 'off',
    'vue/valid-next-tick': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests?__/*.{j,t}s?(x)',
        '**/tests?/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    'import/extensions': ['.js', '.vue'],
    'import/resolver': {
      "alias": {
        "map": [
          ["@", "./src"]
        ],
        "extensions": ['.js', '.vue']
      }
    }
  }
}
