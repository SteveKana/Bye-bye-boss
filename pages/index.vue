<script setup>
// Public homepage. Its main action is the free CV adaptation (no account): the
// visitor drops a CV and an offer right here (see components/freecv/AdaptForm.vue).
// Self-contained: it carries its own nav and footer, so it does not use the
// app layout.
definePageMeta({ layout: false })

const { t } = useI18n()
useHead({
  title: computed(
    () => `Bye Bye Boss — ${t('freecv.form.title')} ${t('freecv.form.title_accent')}`
  ),
  meta: [{ name: 'description', content: computed(() => t('freecv.form.sub')) }],
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#FBF9FF]">
    <LandingNav />
    <LandingFreeHero />
    <LandingHowSteps />
    <LandingAccountPitch />
    <LandingCta />
    <LandingFooter />
    <LandingCvReuploadModal />
  </div>
</template>
