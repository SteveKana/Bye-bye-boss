<script setup>
// Public landing page (marketing). Self-contained: it carries its own nav and
// footer, so it does not use the app layout.
definePageMeta({ layout: false })

const { t } = useI18n()
useHead({
  title: computed(() => `Bye Bye Boss — ${t('landing.hero.title_accent')}`),
  meta: [{ name: 'description', content: computed(() => t('landing.hero.sub')) }],
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#FBF9FF]">
    <!-- Big soft blobs, same as inside the app -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-sun" />
      <div class="absolute -left-40 top-[520px] h-[380px] w-[380px] rounded-full bg-lav" />
      <div class="absolute -right-24 top-[1100px] h-[300px] w-[300px] rounded-full bg-blush/60" />
    </div>
    <div class="relative">
      <LandingNav />
      <LandingHero />
      <LandingWhy />
      <LandingComparison />
      <LandingStats />
      <LandingSocial />
      <LandingCta />
      <LandingFooter />
      <LandingCvReuploadModal />
    </div>
  </div>
</template>
