<script setup>
const links = [
  { href: '#comment', key: 'landing.nav.how' },
  { href: '#fonctionnalites', key: 'landing.nav.features' },
  { href: '#apercu', key: 'landing.nav.preview' },
  { href: '#faq', key: 'landing.nav.faq' },
]

const { scrollToElement } = useScrollTo()

function goToWaitlist() {
  scrollToElement('waitlist-email', { focus: true })
}
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
      <UiButton variant="primary" size="sm" class="hidden sm:inline-flex" @click="goToWaitlist">
        {{ $t('landing.nav.cta') }}
      </UiButton>
    </div>
  </nav>
</template>
