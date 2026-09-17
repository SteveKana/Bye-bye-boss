<script setup>
// Simple closing CTA (matchcareer.html mockup's "footer-cta" section) --
// replaces the earlier 3-column waitlist-form block, since the product now
// has real signup rather than a pre-launch email list.
</script>

<template>
  <section id="faq" class="px-6 py-16 lg:px-12">
    <div
      class="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-navy-light to-navy px-8 py-14 text-center text-white"
    >
      <h2 class="mb-4 text-2xl font-extrabold leading-snug sm:text-3xl">
        {{ $t('landing.cta.title') }}<br />
        {{ $t('landing.cta.title2') }}
      </h2>
      <p class="mx-auto mb-7 max-w-xl text-[15px] leading-relaxed text-white/70">
        {{ $t('landing.cta.sub') }}
      </p>
      <UiButton variant="primary" size="lg" @click="navigateTo('/register')">
        ⬆ {{ $t('landing.cta.button') }}
      </UiButton>
      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-white/50"
      >
        <span>{{ $t('landing.cta.trust_1') }}</span>
        <span>{{ $t('landing.cta.trust_2') }}</span>
        <span>{{ $t('landing.cta.trust_3') }}</span>
      </div>
    </div>
  </section>
</template>
