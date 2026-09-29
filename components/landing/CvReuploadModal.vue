<script setup>
// One single modal for all 3 "Importer mon CV" buttons on the homepage
// (Hero, Nav, Cta) -- they all write to the same onboarding store state
// (see reuploadFromHomepage), so a single instance here avoids 3 competing
// modals mounted at once. Replaces the old in-button spinner: Steve wants a
// modal, not a button animation, while the analysis is running.
const onboarding = useOnboardingStore()
</script>

<template>
  <UiModal :model-value="onboarding.homepageReuploadProcessing" persistent size="sm">
    <CvAnalyzingProgress :filename="onboarding.homepageReuploadFilename" />
  </UiModal>
</template>
