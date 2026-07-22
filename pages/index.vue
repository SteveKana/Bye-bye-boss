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
  <div class="min-h-screen bg-brand-light/40">
    <LandingNav />
    <LandingHero />
    <LandingWhy />
    <LandingHow />
    <LandingFeatures />
    <LandingComparison />
    <LandingStats />
    <LandingCta />
    <LandingFooter />
  </div>
</template>
