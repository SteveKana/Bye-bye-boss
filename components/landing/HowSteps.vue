<script setup>
// "Comment ça marche": the three steps of the free CV adaptation.
const steps = [
  { key: 1, icon: '📄', color: 'bg-sun' },
  { key: 2, icon: '🤖', color: 'bg-lav' },
  { key: 3, icon: '✏️', color: 'bg-blush' },
]
</script>

<template>
  <section id="pourquoi" class="mx-auto max-w-6xl scroll-mt-6 px-6 py-16 text-center lg:px-12">
    <div
      class="mb-3 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider"
    >
      {{ $t('freecv.home.how_eyebrow') }}
    </div>
    <h2 class="mb-10 text-3xl font-black text-ink sm:text-4xl">
      {{ $t('freecv.home.how_title') }}
    </h2>
    <div class="grid gap-5 text-left md:grid-cols-3">
      <div
        v-for="s in steps"
        :key="s.key"
        class="rounded-3xl border-4 border-ink bg-white p-6 shadow-[6px_6px_0_#16122E]"
      >
        <div
          class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-ink text-2xl"
          :class="s.color"
          aria-hidden="true"
        >
          {{ s.icon }}
        </div>
        <h3 class="mb-1.5 text-lg font-black text-ink">
          {{ $t(`freecv.home.how_${s.key}_title`) }}
        </h3>
        <p class="text-sm font-medium leading-relaxed text-ink/80">
          {{ $t(`freecv.home.how_${s.key}_text`) }}
        </p>
      </div>
    </div>
  </section>
</template>
