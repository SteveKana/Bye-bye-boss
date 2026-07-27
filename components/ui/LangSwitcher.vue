<script setup>
// Segmented locale toggle (e.g. FR | EN). Persists via the i18n cookie.
// `dark` adapts it to a dark background (the app sidebar).
defineProps({
  dark: { type: Boolean, default: false },
})

const { locale, locales, setLocale } = useI18n()

const options = computed(() =>
  locales.value.map((l) => (typeof l === 'string' ? { code: l, name: l } : l))
)
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-full p-0.5"
    :class="dark ? 'bg-white/10' : 'bg-gray-100'"
    role="group"
    :aria-label="$t('lang.label')"
  >
    <button
      v-for="o in options"
      :key="o.code"
      type="button"
      class="rounded-full px-2.5 py-1 text-xs font-bold uppercase leading-none transition"
      :class="
        o.code === locale
          ? dark
            ? 'bg-white text-navy shadow-soft'
            : 'bg-white text-brand shadow-soft'
          : dark
            ? 'text-white/55 hover:text-white'
            : 'text-gray-500 hover:text-gray-800'
      "
      :title="o.name"
      :aria-label="o.name"
      :aria-pressed="o.code === locale"
      @click="setLocale(o.code)"
    >
      {{ o.code }}
    </button>
  </div>
</template>
