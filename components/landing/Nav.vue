<script setup>
// Only links to sections that actually exist on the page (Why, Comparison) --
// the mockup's own nav has placeholder links (Tarifs, Ressources) with no
// real destination, which we don't want to ship as dead links.
const links = [
  { href: '/#pourquoi', key: 'landing.nav.why' },
  { href: '/#comparatif', key: 'landing.nav.comparison' },
]

// On the homepage itself the logo's `to="/"` never navigates -- Vue Router
// doesn't re-run a click to the route you're already on. Scrolled past the
// hero, that made clicking the logo look like it did nothing. Scroll back to
// the top instead, same end result a real "go home" click implies. On the
// legal/contact pages the link navigates home normally.
const route = useRoute()
function goHome() {
  if (route.path === '/' && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// A logged-in visitor landing back on the marketing homepage (e.g. from a
// bookmark or a shared link) has no reason to see "Se connecter" or
// "Importer mon CV" -- they already have an account. Swap both for an
// avatar (identity/account access, same as the app sidebar) and a real
// CV re-upload action, rather than routing either one through /register.
const auth = useAuthStore()
const { initials, fullName, pictureUrl } = useUserDisplay()

const onboarding = useOnboardingStore()
const toast = useToast()
const { t } = useI18n()

const fileInput = ref(null)

function triggerReupload() {
  fileInput.value?.click()
}

// Same endpoint and feedback as the profile page's own re-upload button
// (see pages/profile/index.vue) -- no need to navigate to the app first
// just to change your CV. Shared modal + diff, same as the hero/footer (see
// components/landing/CvReuploadModal.vue and stores/onboarding.js).
async function onReupload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    await onboarding.reuploadFromHomepage(file)
    toast.success(t('profileCv.reupload_success'))
    // Même choix que le hero/footer -- direction /profile pour voir le
    // nouveau CV tout de suite au lieu de rester sur la home.
    navigateTo('/profile')
  } catch (err) {
    toast.error(err?.message || t('profileCv.upload_error'))
  }
}
</script>

<template>
  <nav class="flex items-center justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-6 lg:px-12">
    <NuxtLink
      to="/"
      class="flex items-center gap-2.5 whitespace-nowrap text-base font-black text-ink sm:text-lg"
      @click="goHome"
    >
      <UiLogoMark :size="32" />
      Bye Bye Boss
    </NuxtLink>

    <ul class="hidden items-center gap-7 lg:flex">
      <li v-for="l in links" :key="l.href">
        <NuxtLink :to="l.href" class="text-sm font-bold text-ink transition hover:text-brand">
          {{ $t(l.key) }}
        </NuxtLink>
      </li>
    </ul>

    <div class="flex items-center gap-3">
      <UiLangSwitcher />
      <template v-if="auth.isAuthenticated">
        <UiButton
          variant="primary"
          size="sm"
          class="hidden sm:inline-flex"
          @click="triggerReupload"
        >
          {{ $t('profileCv.reupload') }}
        </UiButton>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx"
          class="hidden"
          @change="onReupload"
        />
        <NuxtLink to="/dashboard" :title="fullName || auth.user?.email" class="shrink-0">
          <UiAvatar
            :picture-url="pictureUrl"
            :initials="initials"
            circle-class="h-8 w-8 text-xs font-bold text-white"
          />
        </NuxtLink>
      </template>
      <template v-else>
        <NuxtLink
          to="/login"
          class="whitespace-nowrap text-sm font-extrabold text-ink hover:text-brand"
        >
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
