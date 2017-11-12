/**
 * Config used when deploying the app using the pre-built dist library
 */
const mergeConfig = require('./utils/merge-config');
const baseConfig = require('./base.env');

const botConfigFileName =
  process.env.WEBAPP_CONFIG_PREBUILT || '../src/config/chatbot-ui-loader-config.json';
const botConfig = require(botConfigFileName);

const iframeConfigFileName =
  process.env.IFRAME_CONFIG_PREBUILT || '../src/config/chatbot-ui-iframe-loader-config.json';
const iframeConfig = require(iframeConfigFileName);

// iframe config has its own format so its environment
// config is constructed here
const iframeEnvConfig = {
  iframeOrigin: process.env.IFRAME_ORIGIN,
  aws: {
    cognitoPoolId: process.env.POOL_ID,
    region: process.env.AWS_DEFAULT_REGION,
  },
  iframeConfig: {
    lex: {
      botName: process.env.BOT_NAME,
      initialText: process.env.BOT_INITIAL_TEXT,
      initialSpeechInstruction: process.env.BOT_INITIAL_SPEECH,
    },
    ui: {
      toolbarTitle: process.env.UI_TOOLBAR_TITLE,
    },
  },
};

module.exports = {
  appPreBuilt: {
    file: botConfigFileName,
    conf: mergeConfig(botConfig, baseConfig),
  },
  iframe: {
    file: iframeConfigFileName,
    conf: mergeConfig(iframeConfig, iframeEnvConfig),
  },
};
