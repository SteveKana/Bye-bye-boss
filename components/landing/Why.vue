<script setup>
const cards = [
  { key: 'profile', icon: '👤', tone: 'bg-success-light' },
  { key: 'ats', icon: '📄', tone: 'bg-warning-light' },
  { key: 'targeting', icon: '🎯', tone: 'bg-danger-light' },
  { key: 'regret', icon: '😟', tone: 'bg-brand-light' },
]
</script>

<template>
  <section class="bg-white px-6 py-16 lg:px-12">
    <div class="mx-auto max-w-6xl text-center">
      <div class="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand">
        {{ $t('landing.why.eyebrow') }}
      </div>
      <h2 class="mb-10 text-3xl font-extrabold text-navy">{{ $t('landing.why.title') }}</h2>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="c in cards"
          :key="c.key"
          class="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-soft"
        >
          <div
            class="mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-lg"
            :class="c.tone"
            aria-hidden="true"
          >
            {{ c.icon }}
          </div>
          <h3 class="mb-1.5 font-bold text-navy">{{ $t(`landing.why.cards.${c.key}.title`) }}</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            {{ $t(`landing.why.cards.${c.key}.text`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
