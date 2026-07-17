// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],

  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'MatchCareer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: '/api/v1/',
    },
  },

  nitro: {
    devProxy: {
      // Dev only: forward API calls to the backend. In prod, set
      // NUXT_PUBLIC_API_BASE to the API host (or front both with a gateway).
      '/api': { target: 'http://localhost:8000/api', changeOrigin: true },
    },
  },
})
