<script setup>
// "Comprendre nos scores" button + "Nos niveaux de compatibilité" card, with
// the modal the button opens. Shared by /dashboard and /opportunites so the
// two pages can never explain the scores differently (it used to live only
// in pages/opportunites.vue).
//
// The three score blocks (Career, ATS, ATS Potentiel) use the same labels /
// short codes as the score cluster on each offer card and on the detail page
// (opportunity/[id]/index.vue's scoreBlocks) -- kept in sync with those, not
// a separate vocabulary. The "regret" entry was removed 2026-10-03 (Steve:
// masquer toute mention à l'indice de regret côté front).
//
// The button and the card are stacked with a small gap (Steve, 2026-10-07:
// "toujours collées") -- the parent decides where the whole block sits.
const { t } = useI18n()

const modalOpen = ref(false)
const SCORE_EXPLANATIONS = computed(() => [
  {
    key: 'career',
    short: 'CAR',
    title: t('opportunites.score_career_title'),
    text: t('opportunites.score_career_text'),
    badgeClass: 'border-2 border-ink bg-white text-ink',
  },
  {
    key: 'ats',
    short: 'ATS',
    title: t('opportunites.score_ats_title'),
    text: t('opportunites.score_ats_text'),
    badgeClass: 'border-2 border-ink bg-sun text-ink',
  },
  {
    key: 'potential',
    short: 'POT',
    title: t('opportunites.score_potential_title'),
    text: t('opportunites.score_potential_text'),
    badgeClass: 'border-2 border-ink bg-lav text-ink',
  },
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border-2 border-ink bg-lav px-4 py-2.5 text-sm font-extrabold text-ink hover:bg-brand-light/70"
      @click="modalOpen = true"
    >
      ℹ️ {{ $t('opportunites.understand_scores') }}
    </button>

    <UiCard>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        🏷️ {{ $t('opportunites.fit_tags_title') }}
      </h3>
      <ul class="space-y-3 text-xs text-ink/60">
        <li>
          <AppFitBadge fit="very_strong" />
          <p class="mt-1">{{ $t('opportunites.fit_very_strong_text') }}</p>
        </li>
        <li>
          <AppFitBadge fit="strong" />
          <p class="mt-1">{{ $t('opportunites.fit_strong_text') }}</p>
        </li>
      </ul>
    </UiCard>

    <UiModal v-model="modalOpen" :title="$t('opportunites.understand_scores')" size="lg">
      <div class="space-y-4">
        <div
          v-for="score in SCORE_EXPLANATIONS"
          :key="score.key"
          class="flex gap-3 rounded-xl bg-lav/40 p-3.5"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold"
            :class="score.badgeClass"
          >
            {{ score.short }}
          </span>
          <div>
            <p class="text-sm font-bold text-ink">{{ score.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-ink/60">{{ score.text }}</p>
          </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>
