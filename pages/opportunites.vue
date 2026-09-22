<script setup>
// "Opportunités" -- the exhaustive counterpart to the Dashboard's 5-row
// preview: every scored match (not just the top 5), with real filters and
// sort. See dashboard.vue's header comment and the mockups (dashboard.html
// vs opportunites.html) for why these are two separate pages rather than a
// single page with a "show more" toggle.
//
// A few things from opportunites.html are deliberately left out rather than
// faked, same "never fabricate" policy as elsewhere in this app (see
// pages/opportunity/[id].vue's header comment about the Regret Index):
//   - The mockup's "534 offres analysées" badge and page-2-of-54 pagination
//     -- this app has no such volume. GET /matching/top is the full scored
//     pool there is (today capped well under 100 -- see the backend
//     matching module's settings), so the count shown here is just its real
//     length, and there's nothing to paginate.
//   - A 3-way "Sur site / Hybride / Full remote" filter -- the backend only
//     stores a single is_full_remote flag, nothing distinguishing "hybride"
//     from "sur site", so the filter here is the honest 2-way version.
//   - A "Localisation" (Paris / Île-de-France / France entière) filter and
//     a "Regret Index" sort option -- no normalized per-offer region data
//     and no computed regret score exist to filter/sort on (see the
//     Regret Index's own "never fabricated" note on the detail page).
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.opportunities')} · Bye Bye Boss`) })

const matching = useMatchingStore()
const route = useRoute()
const { criteria, load: loadCriteria } = useSearchCriteria()

// TEMPORARY debug hook -- no UI control, deliberately: visiting
// /opportunites?source=adzuna (or ?source=france_travail) hides every offer
// not from that provider, to spot-check that a given source's offers really
// reach a candidate. Moved here from the dashboard (which only ever shows a
// 5-row preview, not useful for exhaustively checking a source) when that
// page was split from this one. Remove once that's no longer needed.
const debugSourceFilter = computed(() => route.query.source || null)

const loading = ref(true)
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.topOpportunities))

const CONTRACT_OPTIONS = ['CDI', 'CDD', 'Freelance', 'Alternance']
const contractFilters = ref([])
const remoteOnly = ref(false)
const sortBy = ref('relevance') // 'relevance' | 'date_desc' | 'date_asc' | 'salary_desc' | 'ats_desc'

function toggleContractFilter(value) {
  const index = contractFilters.value.indexOf(value)
  if (index === -1) contractFilters.value.push(value)
  else contractFilters.value.splice(index, 1)
}

function resetFilters() {
  contractFilters.value = []
  remoteOnly.value = false
}

const hasActiveFilters = computed(() => contractFilters.value.length > 0 || remoteOnly.value)

const sortOptions = computed(() => [
  { value: 'relevance', label: t('dashboard.sort_relevance') },
  { value: 'date_desc', label: t('dashboard.sort_date_desc') },
  { value: 'date_asc', label: t('dashboard.sort_date_asc') },
  { value: 'salary_desc', label: t('opportunites.sort_salary_desc') },
  { value: 'ats_desc', label: t('opportunites.sort_ats_desc') },
])

const filteredOffers = computed(() =>
  matchedOffers.value.filter(
    (offer) =>
      (!contractFilters.value.length || contractFilters.value.includes(offer.contractTag)) &&
      (!remoteOnly.value || offer.isFullRemote) &&
      (!debugSourceFilter.value || offer.source === debugSourceFilter.value)
  )
)

// Missing values (date or salary) always sort last, whichever direction is
// chosen -- an offer with no known value is neither "recent"/"well-paid"
// nor its opposite, same convention as the dashboard's original date sort.
const offers = computed(() => {
  const list = [...filteredOffers.value]
  if (sortBy.value === 'date_desc' || sortBy.value === 'date_asc') {
    const sign = sortBy.value === 'date_desc' ? -1 : 1
    list.sort((a, b) => {
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return sign * (a.publishedAt - b.publishedAt)
    })
  } else if (sortBy.value === 'salary_desc') {
    list.sort((a, b) => {
      if (!a.salaryValue) return 1
      if (!b.salaryValue) return -1
      return b.salaryValue - a.salaryValue
    })
  } else if (sortBy.value === 'ats_desc') {
    list.sort((a, b) => b.scores.ats - a.scores.ats)
  } else {
    // "Pertinence" -- ats_potential descending, same as the dashboard's
    // top-5 ordering (see its comment): the best real odds of getting past
    // the recruiter's ATS once the CV is adapted, not just an abstract
    // career fit.
    list.sort((a, b) => b.scores.potential - a.scores.potential)
  }
  return list
})

onMounted(async () => {
  await loadCriteria()
  try {
    await matching.fetchTop()
  } catch {
    // Same honest empty state as the dashboard -- no profile yet, profile
    // not "complete", or nothing scored yet.
  } finally {
    loading.value = false
  }
})

function openOffer(offer) {
  navigateTo(`/opportunity/${offer.id}`)
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-extrabold text-navy">{{ $t('app.nav.opportunities') }}</h1>
        <span
          v-if="!loading"
          class="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-text"
        >
          {{ $t('opportunites.count', { count: matchedOffers.length }) }}
        </span>
      </div>
      <p class="mt-1 text-sm text-gray-500">{{ $t('opportunites.subtitle') }}</p>
    </div>

    <AppCriteriaBar :criteria="criteria" />

    <UiCard>
      <!-- Filters/sort -->
      <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 pb-3">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="opt in CONTRACT_OPTIONS"
            :key="opt"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition"
            :class="
              contractFilters.includes(opt)
                ? 'border-brand bg-brand-light text-brand-text'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            "
            @click="toggleContractFilter(opt)"
          >
            {{ opt }}
          </button>
          <button
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition"
            :class="
              remoteOnly
                ? 'border-brand bg-brand-light text-brand-text'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            "
            @click="remoteOnly = !remoteOnly"
          >
            🏠 {{ $t('opportunity.full_remote') }}
          </button>
        </div>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="text-[12px] font-semibold text-gray-400 hover:text-gray-600 hover:underline"
          @click="resetFilters"
        >
          {{ $t('dashboard.filter_reset') }}
        </button>

        <div class="ml-auto w-full max-w-[220px]">
          <UiSelect v-model="sortBy" :options="sortOptions" />
        </div>
      </div>

      <ul class="divide-y divide-gray-100">
        <li
          v-for="offer in offers"
          :key="offer.id"
          class="group -mx-2 flex cursor-pointer items-center gap-4 rounded-lg px-2 py-3.5 transition hover:bg-gray-50"
          role="button"
          tabindex="0"
          @click="openOffer(offer)"
          @keydown.enter="openOffer(offer)"
          @keydown.space.prevent="openOffer(offer)"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
            :style="{ background: offer.bg }"
          >
            {{ offer.logo }}
          </span>

          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-bold text-navy">{{ offer.title }}</div>
            <div class="flex min-w-0 items-center gap-0.5">
              <span class="truncate text-[12.5px] text-gray-500">
                {{ offer.company }} · {{ offer.loc }}
                <template v-if="offer.salaryLabel"> · {{ offer.salaryLabel }}</template>
                <template v-if="offer.publishedAgo"> · {{ offer.publishedAgo }}</template>
              </span>
              <UiWarningHint
                v-if="offer.publishedAgo && offer.source === 'adzuna'"
                :message="$t('common.stale_source_warning')"
                class="shrink-0"
              />
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                :class="
                  offer.strong
                    ? 'bg-success-light text-success-text'
                    : 'bg-amber-100 text-amber-700'
                "
              >
                {{ offer.strong ? $t('dashboard.fit_strong') : $t('dashboard.fit_good') }}
              </span>
              <span
                v-if="offer.contractTag"
                class="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold text-brand-text"
              >
                {{ offer.contractTag }}
              </span>
              <span
                v-if="offer.isFullRemote"
                class="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600"
              >
                🏠 {{ $t('opportunity.full_remote') }}
              </span>
            </div>
            <p v-if="offer.blockingMessage" class="mt-1 text-[11.5px] text-amber-700">
              {{ offer.blockingMessage }}
            </p>
          </div>

          <div class="hidden shrink-0 gap-5 sm:flex">
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">ATS</div>
              <div class="text-sm font-extrabold text-green-600">{{ offer.scores.ats }}</div>
            </div>
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">Career</div>
              <div class="text-sm font-extrabold text-blue-600">{{ offer.scores.career }}</div>
            </div>
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">Potential</div>
              <div class="text-sm font-extrabold text-brand">{{ offer.scores.potential }}</div>
            </div>
          </div>

          <button
            class="shrink-0 rounded-md p-1.5 text-gray-300 transition hover:bg-danger-light hover:text-danger"
            :aria-label="$t('dashboard.reject')"
            @click.stop="reject(offer)"
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

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-brand"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </li>
      </ul>

      <div v-if="loading">
        <div
          role="status"
          aria-live="polite"
          class="flex flex-col items-center gap-2 py-6 text-center"
        >
          <svg
            class="h-5 w-5 animate-spin text-brand"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p class="text-sm font-semibold text-navy">{{ $t('dashboard.loading') }}</p>
          <p class="max-w-sm text-[12.5px] text-gray-400">{{ $t('dashboard.loading_sub') }}</p>
        </div>

        <ul class="mt-2 divide-y divide-gray-100" aria-hidden="true">
          <li v-for="n in 5" :key="n" class="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5">
            <span class="h-10 w-10 shrink-0 animate-pulse rounded-[10px] bg-gray-100"></span>
            <div class="min-w-0 flex-1 space-y-2 py-0.5">
              <div class="h-3.5 w-2/5 animate-pulse rounded bg-gray-100"></div>
              <div class="h-3 w-3/5 animate-pulse rounded bg-gray-100"></div>
              <div class="h-4 w-24 animate-pulse rounded-full bg-gray-100"></div>
            </div>
            <div class="hidden shrink-0 gap-5 sm:flex">
              <div v-for="i in 3" :key="i" class="h-8 w-8 animate-pulse rounded bg-gray-100"></div>
            </div>
          </li>
        </ul>
      </div>
      <div
        v-else-if="!offers.length && matchedOffers.length"
        class="py-6 text-center text-sm text-gray-400"
      >
        <p>{{ $t('dashboard.empty_filtered') }}</p>
        <button class="mt-1 font-semibold text-brand hover:underline" @click="resetFilters">
          {{ $t('dashboard.filter_reset') }}
        </button>
      </div>
      <p v-else-if="!offers.length" class="py-6 text-center text-sm text-gray-400">
        {{ $t('dashboard.empty') }}
      </p>
    </UiCard>
  </div>
</template>
