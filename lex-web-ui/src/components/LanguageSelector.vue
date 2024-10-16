<template>
  <div>
    <v-dialog v-model="dialog" max-width="100%" fullscreen>
      <v-card>
        <v-toolbar :color="toolbarColor">
          <v-btn icon @click="close">
            <v-icon>arrow_back_bold</v-icon>
          </v-btn>
          <v-toolbar-title>Choose Your Language</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="lang in formattedLanguages"
              :key="lang.name"
              @click="changeLanguage(lang.name)"
            >
              <v-list-item-title v-if="lang.name == 'English'">{{
                lang.name
              }}</v-list-item-title>
              <v-list-item-title v-else>{{
                `${lang.name} - ${lang.translatedName}`
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-card-text>
          {{ languageDisclaimer }}
          <a class="view-disclaimer"
            href="#"
            @click.prevent="openFullDisclaimer"
            >View disclaimer
          </a>
        </v-card-text>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="fullDisclaimerDialog" max-width="100%" fullscreen>
      <v-card>
        <v-toolbar :color="toolbarColor">
          <v-btn icon @click="closeFullDisclaimer">
            <v-icon>arrow_back_bold</v-icon>
          </v-btn>
          <v-toolbar-title>Translation Disclaimer</v-toolbar-title>
        </v-toolbar>
        <v-card-text v-html="fullDisclaimer"></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeFullDisclaimer()"
            >I Understand</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'LanguageSelector',
    props: [
      'modelValue',
      'toolbarColor'
    ],
    emits: ['update:modelValue', 'language-changed'],
    data() {
      return {
        selectedLanguage: this.$store.state.currentLanguage,
        fullDisclaimerDialog: false,
      }
    },
    computed: {
      dialog: {
        get() {
          return this.modelValue
        },
        set(value) {
          this.$emit('update:modelValue', value)
        },
      },
      formattedLanguages() {
        const translations = this.$store.state.config.translations || {}
        return Object.entries(translations).map(([key, value]) => ({
          name: key,
          translatedName: value.translatedName,
        }))
      },
      languageDisclaimer() {
        return this.$store.state.config.ui.languageDisclaimer?.content || ''
      },
      fullDisclaimer() {
        return this.$store.state.config.ui.languageDisclaimer?.fullContent || ''
      },
    },
    methods: {
      close() {
        this.dialog = false
      },
      changeLanguage(language) {
        this.selectedLanguage = language
        this.$emit('language-changed', language)
        this.close()
      },
      openFullDisclaimer() {
        this.fullDisclaimerDialog = true
      },
      closeFullDisclaimer() {
        this.fullDisclaimerDialog = false
      },
    },
  }
</script>
