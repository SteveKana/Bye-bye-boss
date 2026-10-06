<script setup>
// 'regret' card removed 2026-10-03 (Steve: masquer toute mention à
// l'indice de regret côté front).
const cards = [
  { key: 'profile', icon: '🦸', tone: 'bg-sun' },
  { key: 'ats', icon: '🤖', tone: 'bg-lav' },
  { key: 'targeting', icon: '🎯', tone: 'bg-blush' },
]
</script>

<template>
  <section id="pourquoi" class="px-6 py-16 lg:px-12">
    <div class="mx-auto max-w-6xl text-center">
      <div
        class="mb-3 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink"
      >
        {{ $t('landing.why.eyebrow') }}
      </div>
      <h2 class="mb-10 text-3xl font-black text-ink sm:text-4xl">{{ $t('landing.why.title') }}</h2>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="c in cards"
          :key="c.key"
          class="rounded-[24px] border-[4px] border-ink bg-white p-6 text-left shadow-[6px_6px_0_#16122E]"
        >
          <div
            class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-ink text-2xl"
            :class="c.tone"
            aria-hidden="true"
          >
            {{ c.icon }}
          </div>
          <h3 class="mb-1.5 text-lg font-black text-ink">
            {{ $t(`landing.why.cards.${c.key}.title`) }}
          </h3>
          <p class="text-sm font-medium leading-relaxed text-ink/80">
            {{ $t(`landing.why.cards.${c.key}.text`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
