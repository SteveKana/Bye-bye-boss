<script setup>
// Top bar of the funnel pages: logo, the language switch, and one link on the
// right ("Se connecter" by default).
defineProps({
  // i18n key of the right-hand link
  linkKey: { type: String, default: 'landing.nav.login' },
})
</script>

<template>
  <nav class="flex items-center justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-6 lg:px-12">
    <NuxtLink
      to="/"
      class="flex items-center gap-2.5 whitespace-nowrap text-base font-black text-ink sm:text-lg"
    >
      <UiLogoMark :size="32" />
      Bye Bye Boss
    </NuxtLink>
    <div class="flex items-center gap-4">
      <UiLangSwitcher />
      <NuxtLink to="/login" class="whitespace-nowrap text-sm font-bold text-ink hover:text-brand">
        {{ $t(linkKey) }}
      </NuxtLink>
    </div>
  </nav>
</template>
