<script setup>
const funnel = [
  { num: 842, key: 'found', icon: '🔍', tone: 'bg-lav' },
  { num: 198, key: 'relevant', icon: '📋', tone: 'bg-sun-light' },
  { num: 47, key: 'strong', icon: '🌈', tone: 'bg-blush' },
  { num: 12, key: 'excellent', icon: '⭐', tone: 'bg-sun' },
]
</script>

<template>
  <section class="px-6 py-16 lg:px-12">
    <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
      <!-- Funnel -->
      <div class="rounded-[24px] border-[3px] border-ink bg-white p-6 shadow-[6px_6px_0_#16122E]">
        <div class="mb-5 font-bold text-ink">{{ $t('landing.stats.funnel_title') }}</div>
        <div v-for="(f, i) in funnel" :key="f.key">
          <div class="flex items-center gap-3">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-ink text-lg"
              :class="f.tone"
              aria-hidden="true"
            >
              {{ f.icon }}
            </span>
            <div>
              <div class="text-xl font-black leading-none text-ink">{{ f.num }}</div>
              <div class="text-[11.5px] text-ink/60">
                {{ $t(`landing.stats.funnel.${f.key}`) }}
              </div>
            </div>
          </div>
          <div v-if="i < funnel.length - 1" class="my-1 pl-4 text-ink/50" aria-hidden="true">↓</div>
        </div>
        <p class="mt-4 text-[11.5px] leading-relaxed text-ink/50">
          {{ $t('landing.stats.funnel_note') }}
        </p>
      </div>

      <!-- ATS improvement -->
      <div class="rounded-[24px] border-[3px] border-ink bg-white p-6 shadow-[6px_6px_0_#16122E]">
        <div class="mb-2 font-bold text-ink">{{ $t('landing.stats.ats_title') }}</div>
        <h3 class="mb-6 text-sm text-ink/70">{{ $t('landing.stats.ats_sub') }}</h3>

        <div class="flex items-end gap-4">
          <div class="flex-1">
            <div class="mb-1 text-[11px] font-semibold text-ink/50">
              {{ $t('landing.stats.ats_current') }}
            </div>
            <div>
              <span class="text-3xl font-extrabold text-danger">58</span>
              <span class="text-sm text-ink/50">/100</span>
            </div>
            <div class="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
              <div class="h-full w-[58%] rounded-full bg-danger" />
            </div>
          </div>
          <div class="pb-6 text-xl text-ink/50" aria-hidden="true">→</div>
          <div class="flex-1">
            <div class="mb-1 text-[11px] font-semibold text-ink/50">
              {{ $t('landing.stats.ats_potential') }}
            </div>
            <div>
              <span class="text-3xl font-extrabold text-success-text">84</span>
              <span class="text-sm text-ink/50">/100</span>
            </div>
            <div class="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
              <div class="h-full w-[84%] rounded-full bg-brand" />
            </div>
          </div>
        </div>

        <div
          class="mt-6 rounded-2xl border-2 border-ink bg-sun px-3 py-2.5 text-center text-[12.5px] font-extrabold text-ink"
        >
          {{ $t('landing.stats.ats_btn') }}
        </div>
      </div>

      <!-- Regret gauge block removed 2026-10-03 (Steve: masquer toute
           mention à l'indice de regret côté front). -->
    </div>
  </section>
</template>
