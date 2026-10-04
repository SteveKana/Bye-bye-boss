<script setup>
const funnel = [
  { num: 842, key: 'found', icon: '🔍', tone: 'bg-brand-light' },
  { num: 198, key: 'relevant', icon: '📋', tone: 'bg-score-potential/10' },
  { num: 47, key: 'strong', icon: '📊', tone: 'bg-success-light' },
  { num: 12, key: 'excellent', icon: '⭐', tone: 'bg-warning-light' },
]
</script>

<template>
  <section class="bg-white px-6 py-16 lg:px-12">
    <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
      <!-- Funnel -->
      <div class="rounded-xl border border-gray-200 p-6 shadow-soft">
        <div class="mb-5 font-bold text-navy">{{ $t('landing.stats.funnel_title') }}</div>
        <div v-for="(f, i) in funnel" :key="f.key">
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-lg text-base"
              :class="f.tone"
              aria-hidden="true"
            >
              {{ f.icon }}
            </span>
            <div>
              <div class="text-xl font-extrabold leading-none text-navy">{{ f.num }}</div>
              <div class="text-[11.5px] text-gray-500">
                {{ $t(`landing.stats.funnel.${f.key}`) }}
              </div>
            </div>
          </div>
          <div v-if="i < funnel.length - 1" class="my-1 pl-4 text-gray-300" aria-hidden="true">
            ↓
          </div>
        </div>
        <p class="mt-4 text-[11.5px] leading-relaxed text-gray-400">
          {{ $t('landing.stats.funnel_note') }}
        </p>
      </div>

      <!-- ATS improvement -->
      <div class="rounded-xl border border-gray-200 p-6 shadow-soft">
        <div class="mb-2 font-bold text-navy">{{ $t('landing.stats.ats_title') }}</div>
        <h3 class="mb-6 text-sm text-gray-600">{{ $t('landing.stats.ats_sub') }}</h3>

        <div class="flex items-end gap-4">
          <div class="flex-1">
            <div class="mb-1 text-[11px] font-semibold text-gray-400">
              {{ $t('landing.stats.ats_current') }}
            </div>
            <div>
              <span class="text-3xl font-extrabold text-danger">58</span>
              <span class="text-sm text-gray-400">/100</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div class="h-full w-[58%] rounded-full bg-danger" />
            </div>
          </div>
          <div class="pb-6 text-xl text-gray-300" aria-hidden="true">→</div>
          <div class="flex-1">
            <div class="mb-1 text-[11px] font-semibold text-gray-400">
              {{ $t('landing.stats.ats_potential') }}
            </div>
            <div>
              <span class="text-3xl font-extrabold text-success-text">84</span>
              <span class="text-sm text-gray-400">/100</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div class="h-full w-[84%] rounded-full bg-score-career" />
            </div>
          </div>
        </div>

        <div
          class="mt-6 rounded-lg bg-brand-light px-3 py-2.5 text-center text-[12.5px] font-semibold text-brand"
        >
          {{ $t('landing.stats.ats_btn') }}
        </div>
      </div>

      <!-- Regret gauge block removed 2026-10-03 (Steve: masquer toute
           mention à l'indice de regret côté front). -->
    </div>
  </section>
</template>
