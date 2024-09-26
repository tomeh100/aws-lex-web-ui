module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.m?[j|t]s?$': 'babel-jest',
    "^.+\\.vue$": "@vue/vue3-jest",
    ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2|ogg|mp3|mp4)$": "jest-transform-stub",
  },
  moduleFileExtensions: ["js", "vue", "json"],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!vuetify)'],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^vuetify/iconsets/md$": "<rootDir>/node_modules/vuetify/lib/iconsets/md.mjs",
    '^vuetify/components$': '<rootDir>/node_modules/vuetify/lib/components/index.mjs',
    '^vuetify/directives$': '<rootDir>/node_modules/vuetify/lib/directives/index.mjs',
    '^vuetify/styles$': '<rootDir>/node_modules/vuetify/lib/styles/main.css',
    '^vuetify/lib/util/colors$': '<rootDir>/node_modules/vuetify/lib/util/colors.mjs'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/**/*.{js,vue}',
    'src/store/*.{js}',
    'src/*.vue',
    'src/lex-web-ui.js',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'html',           // Interactive HTML report
    'lcov',           // Lcov format, which also generates an HTML report
    'text-summary',   // Shows summary in the terminal
    'json'            // Export data as JSON for custom processing
  ],
  coverageThreshold: {
    global: {
      lines: 50,
    }
  },
  testMatch: [
    "<rootDir>/tests/**/*.spec.js",
  ],
  setupFiles: ['<rootDir>/tests/setupTests.js'],
};