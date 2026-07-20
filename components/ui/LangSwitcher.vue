<script setup>
// Compact locale switcher. Persists via the i18n cookie (see nuxt.config).
const { locale, locales, setLocale } = useI18n()

const options = computed(() =>
  locales.value.map((l) => (typeof l === 'string' ? { code: l, name: l } : l))
)

function onChange(event) {
  setLocale(event.target.value)
}
</script>

<template>
  <select
    :value="locale"
    :aria-label="$t('lang.label')"
    class="cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-600 outline-none transition hover:border-gray-300 focus:shadow-focus-ring"
    @change="onChange"
  >
    <option v-for="l in options" :key="l.code" :value="l.code">{{ l.name }}</option>
  </select>
</template>
