<script setup>
// Two-panel onboarding shell, siblings to the 'auth' layout: brand panel on
// the left, wizard content on the right with a step indicator up top and a
// sticky action bar (Previous/Continue) at the bottom, supplied by each page
// via the `actions` slot.
const route = useRoute()

const STEP_BY_PATH = {
  '/onboarding/upload': 1,
  '/onboarding/verification': 2,
  '/onboarding/preferences': 3,
}
const currentStep = computed(() => STEP_BY_PATH[route.path] || 1)
</script>

<template>
  <div class="flex min-h-screen bg-brand-light">
    <aside class="hidden p-4 lg:flex lg:w-[38%]">
      <AuthBrandPanel variant="onboarding" />
    </aside>

    <main class="flex flex-1 flex-col bg-white">
      <div class="flex justify-center border-b border-gray-100 px-6 py-5 sm:justify-start sm:px-10">
        <OnboardingStepIndicator :current="currentStep" />
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div class="mx-auto w-full max-w-2xl">
          <slot />
        </div>
      </div>

      <div class="border-t border-gray-100 px-6 py-4 sm:px-10">
        <div class="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <slot name="actions" />
        </div>
      </div>
    </main>
  </div>
</template>
