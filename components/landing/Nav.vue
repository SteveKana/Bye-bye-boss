<script setup>
// Only links to sections that actually exist on the page (Why, Comparison) --
// the mockup's own nav has placeholder links (Tarifs, Ressources) with no
// real destination, which we don't want to ship as dead links.
const links = [
  { href: '#pourquoi', key: 'landing.nav.why' },
  { href: '#comparatif', key: 'landing.nav.comparison' },
]

// This nav only ever renders on the homepage itself (see pages/index.vue),
// so the logo's `to="/"` never actually navigates -- Vue Router doesn't
// re-run a click to the route you're already on. Scrolled past the hero,
// that made clicking the logo look like it did nothing. Scroll back to
// the top instead, same end result a real "go home" click implies.
function goHome() {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// A logged-in visitor landing back on the marketing homepage (e.g. from a
// bookmark or a shared link) has no reason to see "Se connecter" -- they
// already are. Swap both CTAs for a single link into the app instead.
const auth = useAuthStore()
</script>

<template>
  <nav class="flex items-center justify-between gap-6 px-6 py-4 lg:px-12">
    <NuxtLink to="/" class="flex items-center gap-2.5 font-bold text-navy" @click="goHome">
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
      <UiButton
        v-if="auth.isAuthenticated"
        variant="primary"
        size="sm"
        @click="navigateTo('/dashboard')"
      >
        {{ $t('app.nav.dashboard') }}
      </UiButton>
      <template v-else>
        <NuxtLink to="/login" class="text-sm font-semibold text-gray-600 hover:text-brand">
          {{ $t('landing.nav.login') }}
        </NuxtLink>
        <!-- Only one CTA fits comfortably below `sm` -- "Se connecter" wins
        that slot since it covers both new and returning visitors, while
        "Importer mon CV" (signup) stays available on desktop and reappears
        for a mobile visitor once they tap through to /login anyway. -->
        <UiButton
          variant="primary"
          size="sm"
          class="hidden sm:inline-flex"
          @click="navigateTo('/register')"
        >
          {{ $t('landing.nav.cta') }}
        </UiButton>
      </template>
    </div>
  </nav>
</template>
