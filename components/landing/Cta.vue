<template>
  <section id="faq" class="px-6 py-16 lg:px-12">
    <div
      class="mx-auto grid max-w-6xl items-center gap-8 rounded-2xl bg-gradient-to-br from-navy-light to-navy px-8 py-10 text-white lg:grid-cols-[auto_1fr_1fr]"
    >
      <div class="text-4xl" aria-hidden="true">🚀</div>

      <div>
        <span
          class="mb-3 inline-block rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
        >
          {{ $t('landing.cta.badge') }}
        </span>
        <h2 class="text-2xl font-extrabold leading-snug">
          {{ $t('landing.cta.title') }}
          <strong class="text-brand-light">{{ $t('landing.cta.title_strong') }}</strong>
          <br />
          {{ $t('landing.cta.title_end') }}
        </h2>
      </div>

      <LandingWaitlistForm note-key="landing.waitlist.note_cta" />
    </div>
  </section>
</template>
