<template>
  <div class="language-page">
    <h1>Change Language</h1>
    <p class="subtitle">
      SELECT YOUR PREFERRED LANGUAGE FROM THE LIST BELOW TO GET STARTED.
    </p>
    <div class="content-wrapper">
      <v-select
        v-if="isLanguageSelectable"
        :disabled="restrictLocaleChanges"
        :items="languages"
        v-model="selectedLanguage"
        label="Select Language"
        class="language-select"
      ></v-select>
      <v-btn
        @click="goBack"
        icon
        ref="back"
        class="icon-color input-button"
        color="primary"
        size="x-large"
        rounded="pill"
      >
        <v-tooltip activator="parent" location="top">
          <span>go back</span>
        </v-tooltip>
        <v-icon size="xxx-large">arrow_back_bold</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LanguagePage',
    computed: {
      isLanguageSelectable() {
        return this.languages.length > 1
      },
      restrictLocaleChanges() {
        return (
          this.$store.state.lex.isProcessing ||
          (this.$store.state.lex.sessionState &&
            this.$store.state.lex.sessionState.dialogAction &&
            this.$store.state.lex.sessionState.dialogAction.type ===
              'ElicitSlot') ||
          (this.$store.state.lex.sessionState &&
            this.$store.state.lex.sessionState.intent &&
            this.$store.state.lex.sessionState.intent.state === 'InProgress')
        )
      },
      languages() {
        const translations = this.$store.state.config.translations || {}
        return Object.keys(translations)
      },
      availableLocaleCodes() {
        return this.$store.state.config.lex.v2BotLocaleId.split(',')
      },
      selectedLanguage: {
        get() {
          return localStorage.getItem('selectedLanguage') || 'English'
        },
        set(newLanguage) {
          this.setLanguage(newLanguage)
        },
      },
    },
    methods: {
      goBack() {
        this.$store.commit('setIsLanguagePageActive', false)
        this.$emit('back')
      },
      setLanguage(language) {
        const translations = this.$store.state.config.translations
        const localeCode =
          language === 'English'
            ? 'en_US'
            : translations[language]
            ? translations[language].code
            : language

        if (this.availableLocaleCodes.includes(localeCode)) {
          const revised = [
            localeCode,
            ...this.availableLocaleCodes.filter((code) => code !== localeCode),
          ]
          this.$store.commit('updateLocaleIds', revised.toString())
          localStorage.setItem('selectedLocale', localeCode)
          this.$store.commit('setCurrentLanguage', language)
          this.$emit('languageChanged')
        } else {
          console.warn(
            `Locale code ${localeCode} not available in bot locales.`
          )
        }

        this.goBack()
      },
    },
    mounted() {
      this.$store.commit('setIsLanguagePageActive', true)
    },
    beforeUnmount() {
      this.$store.commit('setIsLanguagePageActive', false)
    },
  }
</script>

<style scoped>
  .language-page {
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  h1 {
    z-index: 500;
  }
  .subtitle {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
    z-index: 500;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin-top: 20px;
  }

  .language-select {
    width: 100%;
    margin-bottom: 20px;
  }
</style>
