<script setup>
// Hero of the new homepage: the free CV adaptation itself, no sign-up (see
// components/freecv/AdaptForm.vue).
</script>

<template>
  <section
    class="mx-auto flex w-full max-w-[820px] flex-col items-center gap-[30px] px-6 pb-20 pt-12"
  >
    <div class="flex flex-col items-center gap-[22px] text-center">
      <div
        class="inline-flex items-center gap-[7px] rounded-full border-2 border-ink bg-sun px-3.5 py-1.5 text-[12.5px] font-extrabold text-ink"
      >
        <span class="text-[11px]" aria-hidden="true">✦</span>
        {{ $t('freecv.form.badge') }}
      </div>
      <h1 class="text-[36px] font-black leading-[1.1] tracking-[-0.8px] text-ink sm:text-[50px]">
        {{ $t('freecv.form.title') }}
        <span class="text-brand">{{ $t('freecv.form.title_accent') }}</span>
      </h1>
      <p class="max-w-[540px] text-lg font-medium leading-[1.7] text-ink/80">
        {{ $t('freecv.form.sub_home') }}
      </p>
    </div>

    <FreecvAdaptForm variant="home" />
  </section>
</template>
