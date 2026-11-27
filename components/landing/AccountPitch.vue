<script setup>
// "Avec un compte": what signing up adds to the free CV adaptation.
</script>

<template>
  <section
    class="mx-auto flex w-full max-w-[720px] flex-col items-center gap-5 px-6 pb-[72px] pt-8 text-center"
  >
    <div
      class="inline-flex items-center gap-[7px] rounded-full border-2 border-ink bg-sun px-3.5 py-1.5 text-[12.5px] font-extrabold text-ink"
    >
      <span class="text-[11px]" aria-hidden="true">✦</span>
      {{ $t('freecv.home.account_badge') }}
    </div>
    <h2 class="text-3xl font-black leading-[1.15] tracking-[-0.5px] text-ink sm:text-4xl">
      {{ $t('freecv.home.account_title') }}
      <span class="text-brand">{{ $t('freecv.home.account_title_accent') }}</span>
    </h2>
    <p class="max-w-[560px] text-lg font-medium leading-[1.7] text-ink/80">
      {{ $t('freecv.home.account_text') }}
    </p>
    <UiButton variant="secondary" size="lg" @click="navigateTo('/register')">
      {{ $t('freecv.home.account_cta') }}
    </UiButton>
  </section>
</template>
