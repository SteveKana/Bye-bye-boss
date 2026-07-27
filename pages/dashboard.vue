<script setup>
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const toast = useToast()
const { firstName } = useUserDisplay()

// Static demo data (the matching engine is not built yet — Phase 1 shows the
// shell with placeholder offers). Full class names so Tailwind keeps them.
const scoreColors = {
  ats: 'text-green-600',
  career: 'text-blue-600',
  potential: 'text-brand',
  regret: 'text-amber-600',
}
const scoreLabels = { ats: 'ATS', career: 'Career', potential: 'Potential', regret: 'Regret' }

const criteria = ['CDI', 'Hybride', 'France entière', '60 000 € brut / an']

const offers = ref([
  {
    id: 1,
    rank: 1,
    logo: 'D.',
    bg: '#000000',
    title: 'Product Owner',
    company: 'Doctolib',
    loc: 'Paris · Hybride',
    strong: true,
    scores: { ats: 92, career: 95, potential: 97, regret: 18 },
  },
  {
    id: 2,
    rank: 2,
    logo: 'alan',
    bg: '#0057FF',
    title: 'Product Owner',
    company: 'Alan',
    loc: 'Paris · Hybride',
    strong: true,
    scores: { ats: 90, career: 91, potential: 94, regret: 22 },
  },
  {
    id: 3,
    rank: 3,
    logo: 'M',
    bg: '#009975',
    title: 'Senior Product Owner',
    company: 'ManoMano',
    loc: 'Nantes · Hybride',
    strong: false,
    scores: { ats: 88, career: 89, potential: 92, regret: 25 },
  },
  {
    id: 4,
    rank: 4,
    logo: 'Back',
    bg: '#111111',
    title: 'Product Owner',
    company: 'Back Market',
    loc: 'Paris · Remote',
    strong: false,
    scores: { ats: 85, career: 86, potential: 88, regret: 29 },
  },
  {
    id: 5,
    rank: 5,
    logo: 'bon',
    bg: '#FF6E14',
    title: 'Product Owner',
    company: 'Leboncoin',
    loc: 'Paris · Hybride',
    strong: false,
    scores: { ats: 83, career: 84, potential: 86, regret: 31 },
  },
])

// Reject with a short undo window — mirrors the spec (a real reject is permanent).
function reject(offer) {
  const index = offers.value.findIndex((o) => o.id === offer.id)
  if (index === -1) return
  offers.value.splice(index, 1)
  toast.show({
    message: t('dashboard.offer_hidden'),
    variant: 'info',
    duration: 5000,
    undo: () => offers.value.splice(index, 0, offer),
    undoLabel: t('common.undo'),
  })
}

const soon = () => toast.info(t('app.soon_full'))
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-navy">
          {{ $t('dashboard.greeting', { name: firstName }) }} 👋
        </h1>
        <p class="mt-1 text-sm text-gray-500">{{ $t('dashboard.greeting_sub') }}</p>
      </div>
      <UiButton variant="secondary" size="sm" @click="soon"
        >🔔 {{ $t('dashboard.alerts') }}</UiButton
      >
    </div>

    <!-- Search criteria (static) -->
    <div class="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <span class="font-semibold text-gray-500">{{ $t('dashboard.your_search') }}</span>
      <span
        v-for="c in criteria"
        :key="c"
        class="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-gray-700 shadow-soft"
      >
        {{ c }}
      </span>
      <button class="font-semibold text-brand hover:underline" @click="soon">
        {{ $t('dashboard.edit') }} →
      </button>
    </div>

    <!-- Top opportunities -->
    <UiCard>
      <template #header>
        <div class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-base"
            aria-hidden="true"
          >
            ⭐
          </span>
          <h2 class="text-lg font-bold text-navy">{{ $t('dashboard.top_title') }}</h2>
        </div>
        <p class="mt-1 text-[13px] text-gray-500">{{ $t('dashboard.top_sub') }}</p>
      </template>

      <ul class="divide-y divide-gray-100">
        <li v-for="offer in offers" :key="offer.id" class="flex items-center gap-4 py-3.5">
          <span class="w-4 shrink-0 text-center text-sm font-extrabold text-gray-400">
            {{ offer.rank }}
          </span>
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
            :style="{ background: offer.bg }"
          >
            {{ offer.logo }}
          </span>

          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-bold text-navy">{{ offer.title }}</div>
            <div class="truncate text-[12.5px] text-gray-500">
              {{ offer.company }} · {{ offer.loc }}
            </div>
            <span
              class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              :class="
                offer.strong ? 'bg-success-light text-success-text' : 'bg-amber-100 text-amber-700'
              "
            >
              {{ offer.strong ? $t('dashboard.fit_strong') : $t('dashboard.fit_good') }}
            </span>
          </div>

          <div class="hidden shrink-0 gap-5 sm:flex">
            <div v-for="(value, key) in offer.scores" :key="key" class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">{{ scoreLabels[key] }}</div>
              <div class="text-sm font-extrabold" :class="scoreColors[key]">{{ value }}</div>
            </div>
          </div>

          <button
            class="shrink-0 rounded-md p-1.5 text-gray-300 transition hover:bg-danger-light hover:text-danger"
            :aria-label="$t('dashboard.reject')"
            @click="reject(offer)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </li>
      </ul>

      <p v-if="!offers.length" class="py-6 text-center text-sm text-gray-400">
        {{ $t('dashboard.empty') }}
      </p>

      <template #footer>
        <button
          class="w-full text-center text-sm font-semibold text-brand hover:underline"
          @click="soon"
        >
          {{ $t('dashboard.see_all') }} →
        </button>
      </template>
    </UiCard>
  </div>
</template>
