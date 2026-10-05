<script setup>
// Consent banner. Accept and Refuse carry the same weight on purpose (a
// refusal must be as easy as an acceptance).
const { bannerVisible, accept, refuse } = useCookieConsent()
</script>

<template>
  <div
    v-if="bannerVisible"
    role="dialog"
    aria-live="polite"
    :aria-label="$t('cookies.banner_title')"
    class="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#16122E] sm:bottom-5 sm:p-6"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div class="flex-1">
        <p class="text-base font-black text-ink">🍪 {{ $t('cookies.banner_title') }}</p>
        <p class="mt-1 text-sm font-medium leading-relaxed text-ink/70">
          {{ $t('cookies.banner_text') }}
          <NuxtLink to="/cookies" class="font-extrabold text-brand underline">
            {{ $t('cookies.learn_more') }}
          </NuxtLink>
        </p>
      </div>
      <div class="flex gap-3 md:shrink-0">
        <UiButton variant="secondary" class="flex-1 md:flex-none" @click="refuse">
          {{ $t('cookies.refuse') }}
        </UiButton>
        <UiButton variant="primary" class="flex-1 md:flex-none" @click="accept">
          {{ $t('cookies.accept') }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
