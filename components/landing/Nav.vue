<script setup>
// Only links to sections that actually exist on the page (Why, Comparison) --
// the mockup's own nav has placeholder links (Tarifs, Ressources) with no
// real destination, which we don't want to ship as dead links.
const links = [
  { href: '#pourquoi', key: 'landing.nav.why' },
  { href: '#comparatif', key: 'landing.nav.comparison' },
]
</script>

<template>
  <nav class="flex items-center justify-between gap-6 px-6 py-4 lg:px-12">
    <NuxtLink to="/" class="flex items-center gap-2.5 font-bold text-navy">
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-black text-white"
      >
        BB
      </span>
      Bye Bye Boss
    </NuxtLink>

    <ul class="hidden items-center gap-7 lg:flex">
      <li v-for="l in links" :key="l.href">
        <a :href="l.href" class="text-sm text-gray-600 transition hover:text-brand">
          {{ $t(l.key) }}
        </a>
      </li>
    </ul>

    <div class="flex items-center gap-3">
      <UiLangSwitcher />
      <NuxtLink
        to="/login"
        class="hidden text-sm font-semibold text-gray-600 hover:text-brand sm:inline"
      >
        {{ $t('landing.nav.login') }}
      </NuxtLink>
      <UiButton variant="primary" size="sm" @click="navigateTo('/register')">
        {{ $t('landing.nav.cta') }}
      </UiButton>
    </div>
  </nav>
</template>
