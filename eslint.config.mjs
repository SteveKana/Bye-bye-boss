import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(prettier, {
  files: ['nuxt.config.js'],
  languageOptions: {
    globals: { defineNuxtConfig: 'readonly' },
  },
})
