<script setup>
// "Tous les scores sont calculés" banner, shared by /dashboard and
// /opportunites: when the scores were last refreshed, and when the next
// refresh starts.
//
// The backend recomputes matches once a day at 08:00 Paris time (see
// sync_matches in the API's app/modules/matching/jobs.py) -- keep
// SYNC_HOUR_PARIS in line with it if that schedule ever changes.
const props = defineProps({
  // Date objects of the matches currently shown; the freshest one is "last update".
  dates: { type: Array, default: () => [] },
})

const SYNC_HOUR_PARIS = 8
const TIMEZONE = 'Europe/Paris'

const lastUpdatedLabel = computed(() => {
  const times = props.dates.filter(Boolean).map((d) => d.getTime())
  if (!times.length) return ''
  return new Date(Math.max(...times)).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Next 08:00 in Paris: today if it hasn't happened yet, tomorrow otherwise.
const nextUpdateLabel = computed(() => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, Number(p.value)])
  )
  const dayOffset = parts.hour >= SYNC_HOUR_PARIS ? 1 : 0
  const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset, 12))
  const date = day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return `${date}, ${String(SYNC_HOUR_PARIS).padStart(2, '0')}:00`
})
</script>

<template>
  <div
    v-if="lastUpdatedLabel"
    class="flex items-center gap-2 rounded-[22px] border-2 border-ink bg-success-light/60 px-4 py-2.5 text-sm"
  >
    <span class="text-success" aria-hidden="true">✓</span>
    <div>
      <p class="text-xs font-extrabold text-ink">
        {{ $t('opportunites.scores_computed') }}
      </p>
      <p class="text-xs text-ink/70">
        {{ $t('opportunites.last_updated', { date: lastUpdatedLabel }) }}
      </p>
      <p class="text-xs text-ink/70">
        {{ $t('opportunites.next_update', { date: nextUpdateLabel }) }}
      </p>
    </div>
  </div>
</template>
