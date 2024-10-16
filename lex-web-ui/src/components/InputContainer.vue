<template>
  <div>
    <div v-if="!showLanguagePage">
      <v-toolbar
        elevation="3"
        color="white"
        :dense="this.$store.state.isRunningEmbedded"
        class="toolbar-content"
      >
        <!-- Existing toolbar content -->
        <v-text-field
          :label="textInputPlaceholder"
          v-show="shouldShowTextInput"
          :disabled="isLexProcessing"
          v-model="textInput"
          @keyup.enter.stop="postTextMessage"
          @focus="onTextFieldFocus"
          @blur="onTextFieldBlur"
          @update:model-value="onKeyUp"
          ref="textInput"
          id="text-input"
          name="text-input"
          single-line
          hide-details
          density="compact"
          variant="underlined"
          class="toolbar-text"
        >
        </v-text-field>

        <recorder-status v-show="!shouldShowTextInput"></recorder-status>

        <!-- Existing buttons -->
        <v-btn
          v-if="shouldShowSendButton"
          @click="postTextMessage"
          :disabled="isLexProcessing || isSendButtonDisabled"
          ref="send"
          class="icon-color input-button"
          aria-label="Send Message"
        >
          <v-tooltip activator="parent" location="start">
            <span id="input-button-tooltip">{{ inputButtonTooltip }}</span>
          </v-tooltip>
          <v-icon size="x-large">send</v-icon>
        </v-btn>
        <v-btn
          v-if="!shouldShowSendButton && !isModeLiveChat"
          @click="onMicClick"
          v-on="tooltipEventHandlers"
          :disabled="isMicButtonDisabled"
          ref="mic"
          class="icon-color input-button"
          icon
          :aria-label="micButtonAriaLabel"
        >
          <v-tooltip
            activator="parent"
            v-model="shouldShowTooltip"
            location="start"
          >
            <span id="input-button-tooltip">{{ inputButtonTooltip }}</span>
          </v-tooltip>
          <v-icon size="x-large">{{ micButtonIcon }}</v-icon>
        </v-btn>
        <v-btn
          v-if="shouldShowUpload"
          v-on:click="onPickFile"
          v-bind:disabled="isLexProcessing"
          ref="upload"
          class="icon-color input-button"
          icon
          aria-label="Upload File"
        >
          <v-icon size="x-large">attach_file</v-icon>
          <input
            type="file"
            style="display: none"
            ref="fileInput"
            @change="onFilePicked"
          />
        </v-btn>
        <v-btn
          v-if="shouldShowAttachmentClear"
          v-on:click="onRemoveAttachments"
          v-bind:disabled="isLexProcessing"
          ref="removeAttachments"
          class="icon-color input-button"
          icon
          aria-label="Remove Attachments"
        >
          <v-icon size="x-large">clear</v-icon>
        </v-btn>
      </v-toolbar>

      <v-toolbar
        v-if="shouldShowBottomToolbar"
        elevation="3"
        color="white"
        class="bottom-toolbar"
      >
        <v-spacer></v-spacer>
        <v-btn
          @click="onSaveChatClick"
          class="bottom-button"
          rounded
          :aria-label="saveChatAriaLabel"
        >
          <v-tooltip
            activator="parent"
            location="top"
            :aria-label="saveChatAriaLabel"
          >
            {{ saveChatTooltip }}
          </v-tooltip>
          {{ saveChatLabel }}
        </v-btn>
        <v-btn
          @click="onLanguageClick"
          class="bottom-button"
          :aria-label="languageAriaLabel"
          rounded
        >
          <v-tooltip
            activator="parent"
            location="top"
            :aria-label="languageAriaLabel"
          >
            {{ languageTooltip }}
          </v-tooltip>
          {{ languageLabel }}
        </v-btn>
        <v-btn
          @click="onEndChatClick"
          class="bottom-button"
          rounded
          :aria-label="endChatAriaLabel"
        >
          <v-tooltip
            activator="parent"
            location="top"
            :aria-label="endChatAriaLabel"
          >
            {{ endChatTooltip }}
          </v-tooltip>
          {{ endChatLabel }}
        </v-btn>
        <v-spacer></v-spacer>
      </v-toolbar>
    </div>

    <!-- Add LanguagePage component -->
    <language-page
      v-if="showLanguagePage"
      @back="onLanguageClose"
      @language-changed="onLanguageChanged"
    />
  </div>
</template>

<script>
  /*
Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */

  import RecorderStatus from '@/components/RecorderStatus'
  import LanguagePage from '@/components/LanguagePage'

  export default {
    name: 'input-container',
    data() {
      return {
        textInput: '',
        isTextFieldFocused: false,
        shouldShowTooltip: false,
        shouldShowAttachmentClear: false,
        showLanguagePage: false,
        // workaround: vuetify tooltips doesn't seem to support touch events
        tooltipEventHandlers: {
          mouseenter: this.onInputButtonHoverEnter,
          mouseleave: this.onInputButtonHoverLeave,
          touchstart: this.onInputButtonHoverEnter,
          touchend: this.onInputButtonHoverLeave,
          touchcancel: this.onInputButtonHoverLeave,
        },
      }
    },
    props: ['textInputPlaceholder', 'initialSpeechInstruction'],
    components: {
      RecorderStatus,
      LanguagePage,
    },
    computed: {
      isBotSpeaking() {
        return this.$store.state.botAudio.isSpeaking
      },
      isLexProcessing() {
        return this.$store.state.lex.isProcessing
      },
      isSpeechConversationGoing() {
        return this.$store.state.recState.isConversationGoing
      },
      isMicButtonDisabled() {
        return this.isMicMuted
      },
      isMicMuted() {
        return this.$store.state.recState.isMicMuted
      },
      isRecorderSupported() {
        return this.$store.state.recState.isRecorderSupported
      },
      isRecorderEnabled() {
        return this.$store.state.recState.isRecorderEnabled
      },
      isSendButtonDisabled() {
        return this.textInput.length < 1
      },
      isModeLiveChat() {
        return this.$store.state.chatMode === 'livechat'
      },
      micButtonIcon() {
        if (this.isMicMuted) {
          return 'mic_off'
        }
        if (this.isBotSpeaking || this.isSpeechConversationGoing) {
          return 'stop'
        }
        return 'mic'
      },
      micButtonAriaLabel() {
        if (this.isMicMuted) {
          return 'Microphone is muted'
        }
        if (this.isBotSpeaking || this.isSpeechConversationGoing) {
          return 'Stop voice input'
        }
        return 'Start voice input'
      },
      inputButtonTooltip() {
        if (this.shouldShowSendButton) {
          return 'send'
        }
        if (this.isMicMuted) {
          return 'mic seems to be muted'
        }
        if (this.isBotSpeaking || this.isSpeechConversationGoing) {
          return 'interrupt'
        }
        return 'click to use voice'
      },
      shouldShowSendButton() {
        return (
          (this.textInput.length && this.isTextFieldFocused) ||
          !this.isRecorderSupported ||
          !this.isRecorderEnabled ||
          this.isModeLiveChat
        )
      },
      shouldShowTextInput() {
        return !(this.isBotSpeaking || this.isSpeechConversationGoing)
      },
      shouldShowUpload() {
        return (
          (this.$store.state.isLoggedIn &&
            this.$store.state.config.ui.uploadRequireLogin &&
            this.$store.state.config.ui.enableUpload) ||
          (!this.$store.state.config.ui.uploadRequireLogin &&
            this.$store.state.config.ui.enableUpload)
        )
      },
      shouldShowEndChatButton() {
        return (
          !(this.isBotSpeaking && this.isSpeechConversationGoing) &&
          this.$store.state.messages.length > 0
        )
      },
      currentLanguage() {
        return this.$store.state.currentLanguage || 'English'
      },
      translations() {
        return this.$store.state.config.translations || {}
      },
      saveChatLabel() {
        return (
          this.translations[this.currentLanguage]?.saveChat?.label ||
          'Save Chat'
        )
      },
      saveChatTooltip() {
        return (
          this.translations[this.currentLanguage]?.saveChat?.tooltip ||
          'Save the current conversation'
        )
      },
      saveChatAriaLabel() {
        return (
          this.translations[this.currentLanguage]?.saveChat?.ariaLabel ||
          'Save chat'
        )
      },
      languageLabel() {
        return (
          this.translations[this.currentLanguage]?.language?.label || 'Language'
        )
      },
      languageTooltip() {
        return (
          this.translations[this.currentLanguage]?.language?.tooltip ||
          'Change the language'
        )
      },
      languageAriaLabel() {
        return (
          this.translations[this.currentLanguage]?.language?.ariaLabel ||
          'Language'
        )
      },
      endChatLabel() {
        return (
          this.translations[this.currentLanguage]?.endChat?.label || 'End Chat'
        )
      },
      endChatTooltip() {
        return (
          this.translations[this.currentLanguage]?.endChat?.tooltip ||
          'End the current conversation'
        )
      },
      endChatAriaLabel() {
        return (
          this.translations[this.currentLanguage]?.endChat?.ariaLabel ||
          'End chat'
        )
      },
      shouldShowBottomToolbar() {
        return this.$store.state.config.ui.bottomToolbarEnabled || false
      },
    },
    methods: {
      onInputButtonHoverEnter() {
        this.shouldShowTooltip = true
      },
      onInputButtonHoverLeave() {
        this.shouldShowTooltip = false
      },
      onMicClick() {
        this.onInputButtonHoverLeave()
        if (this.isBotSpeaking || this.isSpeechConversationGoing) {
          return this.$store.dispatch('interruptSpeechConversation')
        }
        if (!this.isSpeechConversationGoing) {
          return this.startSpeechConversation()
        }

        return Promise.resolve()
      },
      onTextFieldFocus() {
        this.isTextFieldFocused = true
      },
      onTextFieldBlur() {
        if (!this.textInput.length && this.isTextFieldFocused) {
          this.isTextFieldFocused = false
        }
      },
      onKeyUp() {
        this.$store.dispatch('sendTypingEvent')
      },
      setInputTextFieldFocus() {
        // focus() needs to be wrapped in setTimeout for IE11
        setTimeout(() => {
          if (this.$refs && this.$refs.textInput && this.shouldShowTextInput) {
            this.$refs.textInput.focus()
          }
        }, 10)
      },
      playInitialInstruction() {
        const isInitialState = ['', 'Fulfilled', 'Failed'].some(
          (initialState) => this.$store.state.lex.dialogState === initialState
        )

        return isInitialState && this.initialSpeechInstruction.length > 0
          ? this.$store.dispatch('pollySynthesizeInitialSpeech')
          : Promise.resolve()
      },
      postTextMessage() {
        this.onInputButtonHoverLeave()
        this.textInput = this.textInput.trim()
        // empty string
        if (!this.textInput.length) {
          return Promise.resolve()
        }

        const message = {
          type: 'human',
          text: this.textInput,
        }

        // Add attachment filename to message
        if (this.$store.state.lex.sessionAttributes.userFilesUploaded) {
          const documents = JSON.parse(
            this.$store.state.lex.sessionAttributes.userFilesUploaded
          )

          message.attachements = documents
            .map(function (att) {
              return att.fileName
            })
            .toString()
        }

        // If streaming, send session attributes for streaming
        if (this.$store.state.config.lex.allowStreamingResponses) {
          // Replace with an HTTP endpoint for the fullfilment Lambda
          const streamingEndpoint =
            this.$store.state.config.lex.streamingWebSocketEndpoint.replace(
              'wss://',
              'https://'
            )
          this.$store.dispatch('setSessionAttribute', {
            key: 'streamingEndpoint',
            value: streamingEndpoint,
          })
          this.$store.dispatch('setSessionAttribute', {
            key: 'streamingDynamoDbTable',
            value: this.$store.state.config.lex.streamingDynamoDbTable,
          })
        }

        return this.$store.dispatch('postTextMessage', message).then(() => {
          this.textInput = ''
          if (this.shouldShowTextInput) {
            this.setInputTextFieldFocus()
          }
        })
      },
      startSpeechConversation() {
        if (this.isMicMuted) {
          return Promise.resolve()
        }
        return this.setAutoPlay()
          .then(() => this.playInitialInstruction())
          .then(() => {
            return new Promise(function (resolve, reject) {
              setTimeout(() => {
                resolve()
              }, 100)
            })
          })
          .then(() => this.$store.dispatch('startConversation'))
          .catch((error) => {
            console.error('error in startSpeechConversation', error)
            const errorMessage = this.$store.state.config.ui.showErrorDetails
              ? ` ${error}`
              : ''

            this.$store.dispatch(
              'pushErrorMessage',
              "Sorry, I couldn't start the conversation. Please try again." +
                `${errorMessage}`
            )
          })
      },
      /**
       * Set auto-play attribute on audio element
       * On mobile, Audio nodes do not autoplay without user interaction.
       * To workaround that requirement, this plays a short silent audio mp3/ogg
       * as a reponse to a click. This silent audio is initialized as the src
       * of the audio node. Subsequent play on the same audio now
       * don't require interaction so this is only done once.
       */
      setAutoPlay() {
        if (this.$store.state.botAudio.autoPlay) {
          return Promise.resolve()
        }
        return this.$store.dispatch('setAudioAutoPlay')
      },
      onPickFile() {
        this.$refs.fileInput.click()
      },
      onFilePicked(event) {
        const files = event.target.files
        if (files[0] !== undefined) {
          this.fileName = files[0].name
          // Check validity of file
          if (this.fileName.lastIndexOf('.') <= 0) {
            return
          }
          // If valid, continue
          const fr = new FileReader()
          fr.readAsDataURL(files[0])
          fr.addEventListener('load', () => {
            this.fileObject = files[0] // this is an file that can be sent to server...
            this.$store.dispatch('uploadFile', this.fileObject)
            this.shouldShowAttachmentClear = true
          })
        } else {
          this.fileName = ''
          this.fileObject = null
        }
      },
      onRemoveAttachments() {
        delete this.$store.state.lex.sessionAttributes.userFilesUploaded
        this.shouldShowAttachmentClear = false
      },
      messageForEndChatContent() {
        return {
          text: 'End Chat',
          type: 'human',
        }
      },
      onEndChatClick() {
        this.$store.dispatch('postTextMessage', this.messageForEndChatContent())
      },
      onSaveChatClick() {
        // Implement save chat functionality
        console.log('Save Chat clicked')
      },
      onLanguageClick() {
        this.showLanguagePage = true
      },
      onLanguageClose() {
        this.showLanguagePage = false
      },
      onLanguageChanged() {
        console.log('Language changed to:', this.currentLanguage)
        this.$store.dispatch(
          'postTextMessage',
          this.messageForChangeLanguage(this.currentLanguage)
        )
      },
      messageForChangeLanguage(language) {
        return {
          text: language,
          type: 'human',
        }
      },
    },
  }
</script>

<style>
  .input-container {
    /* make footer same height as dense toolbar */
    min-height: 48px;
    position: fixed;
    bottom: 0;
    bottom: env(safe-area-inset-bottom);
    left: 0;
    left: env(safe-area-inset-left);
    right: 0;
    right: env(safe-area-inset-right);
  }

  .toolbar-content {
    padding-left: 16px;
    font-size: 16px !important;
  }

  .v-input {
    margin-bottom: 10px;
  }

  .bottom-toolbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 0;
  }

  .bottom-button {
    margin: 0 8px;
  }
</style>
