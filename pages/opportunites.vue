<script setup>
// "Opportunités" -- the exhaustive counterpart to the Dashboard's 5-row
// preview: every scored match (not just the top 5), with real filters and
// sort. See dashboard.vue's header comment and the mockups (dashboard.html
// vs opportunites.html) for why these are two separate pages rather than a
// single page with a "show more" toggle.
//
// Visual structure follows opportunites.html closely (filter dropdown, sort
// dropdown, active-filter chips, full offer cards with a "why this offer"
// column, pagination, right info panel) -- an earlier version of this page
// reused the Dashboard's plain row-list style instead, which lost real
// design work; this rebuild restores it.
//
// A few things from that mockup are still deliberately left out rather than
// faked, same "never fabricate" policy as elsewhere in this app:
//   - The mockup's "534 offres analysées" badge and page-2-of-54 pagination
//     scale -- this app has no such volume. GET /matching/top is the full
//     scored pool there is, so the count shown here is its real length, and
//     pagination only appears once there's actually more than one page.
//   - A 3-way "Sur site / Hybride / Full remote" filter -- the backend only
//     stores a single is_full_remote flag, nothing distinguishing "hybride"
//     from "sur site", so the filter here is the honest 2-way version.
//   - A "Localisation" (Paris / Île-de-France / France entière) filter --
//     no normalized per-offer region data exists to filter on.
//   - The sidebar's "Premium" upsell card -- there's no subscription tier
//     implemented; the backend spec for this section explicitly puts
//     "Statut d'abonnement" out of MVP scope.
//
// The Regret Index column, its "Comprendre nos scores" entry and its sort
// option were all removed 2026-10-03 (Steve: masquer/désactiver tout
// l'indice de regret, front et back) -- the backend no longer sends
// regret_availability/regret_score at all (see the API's CandidateMatchRead
// schema), so there's nothing left to show here either.
//
// Polish pass after the first mockup-fidelity delivery: the funnel/chevron/
// checkmark icons are now the mockup's real inline SVGs (an emoji had been
// used as a placeholder and rendered inconsistently across platforms); two
// sort options were added ("Potentiel ATS", "Score carrière").
//
// Also from that feedback: the shared app layout centers most pages at a
// max-w-5xl (1024px) reading width, which is fine for a single list but
// squeezed this page's two-column grid badly -- the "Pourquoi cette offre
// est faite pour vous" column had barely enough room and wrapped onto many
// lines. This page now opts into the layout's wider max-w-7xl via
// `wide: true` (see layouts/app.vue), and the reasoning column's min-width
// was bumped to 200px to match the mockup exactly.
//
// The "Salaire minimum" filter and "Salaire (décroissant)" sort used to
// simply not apply to Freelance offers -- annual salary_min/max isn't the
// right unit for a freelance mission's TJM, and the backend didn't carry a
// TJM field at all, so the filter was disabled and the sort quietly did
// nothing for them. Now that the backend extracts a best-effort TJM from
// offer text (see core/daily_rate.py on the API side --
// match.offer.daily_rate_min/max, never fabricated when the offer's text
// doesn't state one), both switch to that field instead of salaryValue
// whenever Freelance is selected: the filter's options and label become
// TJM-denominated ("300 €/jour" etc. instead of "30 000 € brut/an"), and
// "Salaire (décroissant)" sorts by daily_rate instead of annual salary,
// relabeled "TJM (décroissant)" so it's clear which figure is being used.
definePageMeta({ layout: 'app', middleware: ['auth', 'onboarding-complete'], wide: true })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.opportunities')} · Bye Bye Boss`) })

const matching = useMatchingStore()
const route = useRoute()

// TEMPORARY debug hook -- no UI control, deliberately: visiting
// /opportunites?source=adzuna (or ?source=france_travail) hides every offer
// not from that provider, to spot-check that a given source's offers really
// reach a candidate. Remove once that's no longer needed.
const debugSourceFilter = computed(() => route.query.source || null)

const loading = ref(true)
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.topOpportunities))

// ATS filter: nothing is hidden by default (0); the candidate can raise the
// bar themselves. An offer
// still being analysed has no ATS score yet, so it is never hidden by this
// filter -- that is what a brand-new profile sees first.
const minAts = ref(DEFAULT_MIN_ATS)
// The filter only means something once at least one offer has its ATS score:
// while every offer is still "Analyse en cours" there is nothing to filter on,
// so the control is hidden (and the filter not applied -- see filteredOffers).
const hasScoredOffers = computed(() => matchedOffers.value.some((o) => !o.isPending))

// Real per-match timestamps (not a fabricated "batch run" time) -- the
// banner itself picks the freshest one.
const scoreDates = computed(() => matchedOffers.value.map((o) => o.computedAt))

// Contrat / télétravail / localisation / salaire are real filters. They start
// from the candidate's saved search preferences (Préférences page, onboarding
// step 3) and can be removed here without touching those preferences; a
// candidate with no saved preferences starts with nothing selected. An empty
// choice means "don't restrict". The choice lists and the région / salary
// tests are shared with the Dashboard (composables/useSearchFilters.js).
const selectedContracts = ref([])
// Each offer is exactly one of: Full remote (flagged by the backend), Hybride
// (the description spells out a split of days -- "2 jours de télétravail",
// "3 jours sur site"... -- or says "hybride"), or Sur site (everything else,
// including offers that say nothing about remote work).
const selectedRemote = ref([])
const selectedRegions = ref([])
const includeUnknownRegion = ref(true)
const cityQuery = ref('')
function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
function toggleChoice(kind, value) {
  const list =
    kind === 'contract' ? selectedContracts : kind === 'region' ? selectedRegions : selectedRemote
  list.value = list.value.includes(value)
    ? list.value.filter((v) => v !== value)
    : [...list.value, value]
}

// Both salary sliders are always available now that no contract type is
// pre-selected; each only ever filters offers of its own contract kind (see
// filteredOffers below). With a contract filter on, only the relevant
// slider(s) are shown.
const showsFreelanceSlider = computed(
  () => !selectedContracts.value.length || selectedContracts.value.includes('Freelance')
)
const showsSalarySlider = computed(
  () =>
    !selectedContracts.value.length || selectedContracts.value.some((type) => type !== 'Freelance')
)

const SALARY_SLIDER_MAX = 100000 // € brut/an
const SALARY_SLIDER_STEP = 1000
const TJM_SLIDER_MAX = 1000 // €/jour
const TJM_SLIDER_STEP = 10

const salaryMin = ref(0)
const tjmMin = ref(0)
const onlySalaryKnown = ref(false)
const salaryModalOpen = ref(false)
// 'relevance' | 'date_desc'
const sortBy = ref('relevance')
const page = ref(1)
const PAGE_SIZE = 10

// French legal convention for a 35h week (151.67 paid hours/month) -- matches
// the "Estimation salaire brut 35h/sem." caption in the Salaire modal.
const MONTHLY_HOURS_35 = 151.67
function monthlyFromAnnual(annual) {
  return annual / 12
}
function hourlyFromAnnual(annual) {
  return monthlyFromAnnual(annual) / MONTHLY_HOURS_35
}
function formatEuros(amount, { decimals = 0 } = {}) {
  return (amount || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function resetFilters() {
  selectedContracts.value = []
  selectedRemote.value = []
  cityQuery.value = ''
  selectedRegions.value = []
  minAts.value = DEFAULT_MIN_ATS
  salaryMin.value = 0
  tjmMin.value = 0
  onlySalaryKnown.value = false
}

// The ATS bar is not counted here: it has
// its own control next to the sort dropdown.
const salaryFilterCount = computed(
  () => Number(salaryMin.value > 0) + Number(tjmMin.value > 0) + Number(onlySalaryKnown.value)
)

// Individually removable chips shown under the filter/sort row -- each
// knows how to clear just itself, same "Filtres actifs" pattern as before.
const activeFilterChips = computed(() => {
  const chips = []
  for (const c of selectedContracts.value) {
    chips.push({ key: `contract-${c}`, label: c, clear: () => toggleChoice('contract', c) })
  }
  for (const r of selectedRemote.value) {
    chips.push({ key: `remote-${r}`, label: r, clear: () => toggleChoice('remote', r) })
  }
  for (const r of selectedRegions.value) {
    chips.push({
      key: `region-${r}`,
      label: r === OVERSEAS_CHOICE ? t('searchFilters.overseas') : r,
      clear: () => toggleChoice('region', r),
    })
  }
  if (cityQuery.value) {
    chips.push({ key: 'city', label: cityQuery.value, clear: () => (cityQuery.value = '') })
  }
  if (minAts.value > 0) {
    chips.push({
      key: 'ats',
      label: `${t('opportunites.ats_filter_label')} : ${minAts.value}`,
      clear: () => (minAts.value = DEFAULT_MIN_ATS),
    })
  }
  if (salaryMin.value > 0) {
    chips.push({
      key: 'salary',
      label: t('opportunites.salary_min_label', { amount: formatEuros(salaryMin.value) }),
      clear: () => (salaryMin.value = 0),
    })
  }
  if (tjmMin.value > 0) {
    chips.push({
      key: 'tjm',
      label: t('opportunites.tjm_min_label', { amount: formatEuros(tjmMin.value) }),
      clear: () => (tjmMin.value = 0),
    })
  }
  if (onlySalaryKnown.value) {
    chips.push({
      key: 'only-known',
      label: t('opportunites.only_salary_known'),
      clear: () => (onlySalaryKnown.value = false),
    })
  }
  return chips
})

const SORT_OPTIONS = computed(() => [
  { value: 'relevance', label: t('dashboard.sort_relevance') },
  { value: 'date_desc', label: t('dashboard.sort_date_desc') },
])
const sortLabel = computed(
  () => SORT_OPTIONS.value.find((o) => o.value === sortBy.value)?.label || ''
)

const filteredOffers = computed(() =>
  matchedOffers.value.filter((offer) => {
    if (selectedContracts.value.length && !selectedContracts.value.includes(offer.contractTag)) {
      return false
    }
    if (selectedRemote.value.length && !selectedRemote.value.includes(remoteModeOf(offer))) {
      return false
    }
    if (!regionMatches(offer, selectedRegions.value, includeUnknownRegion.value)) return false
    if (cityQuery.value && !normalizeText(offer.loc).includes(normalizeText(cityQuery.value))) {
      return false
    }
    if (debugSourceFilter.value && offer.source !== debugSourceFilter.value) return false
    if (!offer.isPending && offer.scores.ats < minAts.value) return false

    // Freelance offers are compared against the TJM slider, every other
    // contract type against the annual-salary slider -- never the other
    // scale, same split as the modal's two sliders above.
    const isFreelanceOffer = offer.contractTag === 'Freelance'
    const value = isFreelanceOffer ? offer.dailyRateValue : offer.salaryValue
    const threshold = isFreelanceOffer ? tjmMin.value : salaryMin.value

    // "Afficher uniquement les offres avec un salaire renseigné" is the ONLY
    // thing that excludes an offer for lacking salary/TJM data. Moving the
    // slider above 0 must not silently do the same thing -- most offers
    // simply never state a salary (see useMatchedOffers.js's salaryValue
    // comment), so treating "unknown" as "below threshold" meant any minimum
    // over 0 wiped out nearly the whole list (the bug Steve hit 2026-10-01:
    // "systématiquement 0 résultats"). An unknown value is neither confirmed
    // to meet the bar nor to miss it, so a threshold alone leaves it in;
    // only a *known* value below the threshold is excluded.
    if (onlySalaryKnown.value && !value) return false
    if (threshold > 0 && value !== null && value < threshold) return false

    return true
  })
)

// Missing values (date) always sort last, whichever direction is chosen --
// an offer with no known publish date is neither "recent" nor its opposite.
const offers = computed(() => {
  const list = [...filteredOffers.value]
  if (sortBy.value === 'date_desc') {
    list.sort((a, b) => {
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return b.publishedAt - a.publishedAt
    })
  } else {
    // "Pertinence" -- ats_potential descending, same as the dashboard's
    // top-5 ordering: the best real odds of getting past the recruiter's
    // ATS once the CV is adapted, not just an abstract career fit.
    // Offers still being analysed (no score yet) come after the scored ones.
    list.sort(
      (a, b) => Number(a.isPending) - Number(b.isPending) || b.scores.potential - a.scores.potential
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(offers.value.length / PAGE_SIZE)))
const pagedOffers = computed(() =>
  offers.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

watch(
  [
    minAts,
    salaryMin,
    tjmMin,
    onlySalaryKnown,
    sortBy,
    selectedContracts,
    selectedRemote,
    cityQuery,
    selectedRegions,
    includeUnknownRegion,
  ],
  () => {
    page.value = 1
  },
  { deep: true }
)
watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})

// "Pourquoi cette offre est faite pour vous" -- built entirely from the
// LLM's own already-computed analysis (the same career_explanation/
// ats_gaps used on the detail page's "Pourquoi ces scores ?" and "Écarts à
// corriger" sections), never invented prose.
function reasonsFor(offer) {
  const positives = (offer.analysis.career_explanation || [])
    .slice(0, 3)
    .map((text) => ({ ok: true, text }))
  const gap = (offer.analysis.ats_gaps || [])[0]
  const negative = gap
    ? [{ ok: false, text: t('opportunites.gap_reason', { skill: gap.label || gap.skill }) }]
    : []
  return [...positives, ...negative]
}

// Some skill values coming back from the matching backend are raw internal
// keys rather than short human labels (e.g. "product_owner_data_experience")
// -- long enough as a single unbroken word to overflow the pill regardless
// of CSS wrapping. Truncating here guarantees a clean pill no matter what
// the backend sends; the underlying "why is this a raw key" question is a
// separate backend content-quality issue, not a layout one.
const MAX_TAG_LENGTH = 22
function truncateTag(name) {
  return name.length > MAX_TAG_LENGTH ? `${name.slice(0, MAX_TAG_LENGTH - 1)}…` : name
}

function tagsFor(offer) {
  const names = (offer.analysis.job_skills || []).map((s) => s.label || s.skill).filter(Boolean)
  return { shown: names.slice(0, 4).map(truncateTag), extra: Math.max(0, names.length - 4) }
}

// regretColorClass removed 2026-10-03 (Steve: masquer toute mention à
// l'indice de regret côté front) -- was only used by the card score
// cluster below, also removed.

// Pre-fill the filters from the saved search preferences (once). The
// profile is loaded by the onboarding-complete middleware; the watcher also
// covers a late arrival. A candidate who never saved preferences keeps empty
// filters, as before.
const onboarding = useOnboardingStore()
let prefilled = false
watch(
  () => onboarding.profile,
  (profile) => {
    if (prefilled || !profile) return
    prefilled = true
    if (!profileHasPreferences(profile)) return
    selectedContracts.value = [...(profile.contract_types || [])]
    selectedRemote.value = [...(profile.remote_preferences || [])]
    selectedRegions.value = choicesFromRegions(profile.mobility_regions)
    includeUnknownRegion.value = profile.include_unknown_region !== false
    // The sliders stop at their maximum: a higher target is kept at the top.
    salaryMin.value = Math.min(profile.salary_target || 0, SALARY_SLIDER_MAX)
    tjmMin.value = Math.min(profile.daily_rate || 0, TJM_SLIDER_MAX)
  },
  { immediate: true }
)

onMounted(async () => {
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

// Dropdown open/close, including click-outside -- mirrors the mockup's own
// toggleDropdown()/outside-click JS, ported to Vue refs instead of DOM
// classList toggling.
const sortOpen = ref(false)
const sortRef = ref(null)

// The Salaire panel is now a real UiModal (backdrop click/Escape handled by
// that component itself) -- only the Trier par dropdown still needs manual
// click-outside handling.
function onDocumentClick(event) {
  if (sortOpen.value && sortRef.value && !sortRef.value.contains(event.target)) {
    sortOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

function selectSort(value) {
  sortBy.value = value
  sortOpen.value = false
}
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-black text-ink">{{ $t('app.nav.opportunities') }}</h1>
          <span
            v-if="!loading"
            class="rounded-full border-2 border-ink bg-lav px-3 py-0.5 text-sm font-bold text-ink"
          >
            {{ $t('opportunites.results_found', { count: offers.length }) }}
          </span>
        </div>
      </div>
      <AppScoresStatus :dates="scoreDates" />
    </div>

    <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_260px]">
      <!-- MAIN COLUMN -->
      <div class="min-w-0">
        <!-- Filters / sort row -->
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <AppFilterMenu
            :label="$t('opportunites.contract_filter')"
            :count="selectedContracts.length"
          >
            <div class="flex flex-col gap-2.5">
              <UiCheckbox
                v-for="c in CONTRACT_CHOICES"
                :key="c"
                :model-value="selectedContracts.includes(c)"
                :label="$t(`searchFilters.contracts.${c}`)"
                @update:model-value="toggleChoice('contract', c)"
              />
            </div>
          </AppFilterMenu>

          <AppFilterMenu :label="$t('opportunites.remote_filter')" :count="selectedRemote.length">
            <div class="flex flex-col gap-2.5">
              <UiCheckbox
                v-for="r in REMOTE_CHOICES"
                :key="r"
                :model-value="selectedRemote.includes(r)"
                :label="$t(`searchFilters.remotes.${r}`)"
                @update:model-value="toggleChoice('remote', r)"
              />
            </div>
          </AppFilterMenu>

          <AppFilterMenu
            :label="$t('opportunites.location_filter')"
            :count="Number(!!cityQuery) + selectedRegions.length"
          >
            <div class="flex flex-col gap-3">
              <label class="flex flex-col gap-1 text-xs font-bold text-ink">
                {{ $t('opportunites.location_city') }}
                <input
                  v-model="cityQuery"
                  type="text"
                  :placeholder="$t('opportunites.location_city_placeholder')"
                  class="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-medium text-ink placeholder:text-ink/40"
                />
              </label>
              <div class="flex flex-col gap-1 text-xs font-bold text-ink">
                {{ $t('opportunites.location_region') }}
                <div class="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1 pt-1">
                  <UiCheckbox
                    v-for="r in REGION_CHOICES"
                    :key="r"
                    :model-value="selectedRegions.includes(r)"
                    :label="r === OVERSEAS_CHOICE ? $t('searchFilters.overseas') : r"
                    @update:model-value="toggleChoice('region', r)"
                  />
                </div>
              </div>
              <UiCheckbox
                v-model="includeUnknownRegion"
                :label="$t('searchFilters.unknown_region')"
              />
            </div>
          </AppFilterMenu>

          <button
            type="button"
            class="flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-lav"
            @click="salaryModalOpen = true"
          >
            {{ $t('opportunites.salary_button') }}
            <span
              v-if="salaryFilterCount"
              class="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
            >
              {{ salaryFilterCount }}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div ref="sortRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-lav"
              @click="sortOpen = !sortOpen"
            >
              {{ $t('opportunites.sort_by', { label: sortLabel }) }}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              v-if="sortOpen"
              class="absolute left-0 top-[calc(100%+6px)] z-20 w-64 rounded-2xl border-2 border-ink bg-white p-2"
            >
              <button
                v-for="opt in SORT_OPTIONS"
                :key="opt.value"
                type="button"
                class="flex w-full items-center justify-between rounded-2xl px-2.5 py-2 text-left text-[13px] font-medium transition hover:bg-lav/40"
                :class="opt.value === sortBy ? 'font-bold text-brand' : 'text-ink'"
                @click="selectSort(opt.value)"
              >
                <span>{{ opt.label }}</span>
                <svg
                  v-if="opt.value === sortBy"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-[15px] w-[15px] text-brand"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>

          <label
            v-if="hasScoredOffers"
            class="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white px-4 py-2 text-sm font-medium text-ink"
          >
            <span>{{ $t('opportunites.ats_filter_label') }}</span>
            <input
              v-model.number="minAts"
              type="range"
              min="0"
              max="100"
              step="5"
              class="w-28 accent-brand"
              :aria-label="$t('opportunites.ats_filter_label')"
            />
            <span class="w-7 text-right font-extrabold text-ink">{{ minAts }}</span>
          </label>
        </div>

        <!-- Active filter chips -->
        <div v-if="activeFilterChips.length" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-ink/60">{{ $t('opportunites.active') }}</span>
          <span
            v-for="chip in activeFilterChips"
            :key="chip.key"
            class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-lav px-3 py-1 text-xs font-bold text-ink"
          >
            {{ chip.label }}
            <button
              type="button"
              class="text-brand/60 hover:text-brand"
              :aria-label="$t('opportunites.remove_filter', { label: chip.label })"
              @click="chip.clear()"
            >
              ✕
            </button>
          </span>
          <button
            type="button"
            class="text-xs font-semibold text-brand hover:underline"
            @click="resetFilters"
          >
            {{ $t('opportunites.clear_all') }}
          </button>
        </div>

        <!-- Offer cards -->
        <div v-if="loading" class="flex flex-col gap-3" aria-hidden="true">
          <div
            v-for="n in 3"
            :key="n"
            class="animate-pulse rounded-[22px] border-[2.5px] border-ink/20 bg-white p-5"
          >
            <div class="flex gap-4">
              <div class="h-14 w-14 shrink-0 rounded-xl bg-lav"></div>
              <div class="flex-1 space-y-2 py-1">
                <div class="h-3.5 w-2/5 rounded bg-lav"></div>
                <div class="h-3 w-1/3 rounded bg-lav"></div>
                <div class="h-3 w-3/5 rounded bg-lav"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="!offers.length"
          class="rounded-[22px] border-[2.5px] border-dashed border-ink/40 bg-white/70 py-10 text-center"
        >
          <p class="text-sm text-ink/50">
            {{ matchedOffers.length ? $t('dashboard.empty_filtered') : $t('dashboard.empty') }}
          </p>
          <button
            v-if="matchedOffers.length"
            class="mt-1 text-sm font-semibold text-brand hover:underline"
            @click="resetFilters"
          >
            {{ $t('dashboard.filter_reset') }}
          </button>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="offer in pagedOffers"
            :key="offer.id"
            class="group relative cursor-pointer rounded-[22px] border-[2.5px] border-ink bg-white p-5 transition hover:-translate-y-0.5 hover:bg-lav/40"
            role="button"
            tabindex="0"
            @click="openOffer(offer)"
            @keydown.enter="openOffer(offer)"
          >
            <!-- Visible by default; only fades out and reveals-on-hover from
            `sm` up, where a mouse cursor is available. Below `sm` there's no
            hover on a touchscreen, so `opacity-0` alone would have hidden
            this control on mobile permanently -- the reject action would
            have silently stopped existing on the device most people use. -->
            <button
              class="absolute right-3 top-3 rounded-xl p-1 text-ink/50 transition hover:bg-danger-light hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
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

            <!-- Below `sm`, the three sections below (identity, "why this
            offer", scores) each get their own full-width row instead of
            competing as flex siblings -- at narrow widths, a `min-w-[200px]`
            reasons column left almost no room for the title/company block,
            which flex-shrank down to a few pixels wide and had its text
            spill across the card, visually overlapping the reasons text
            next to it. Stacking below `sm` removes the squeeze entirely;
            `sm:flex-row sm:flex-wrap` keeps the original desktop layout. -->
            <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <!-- Logo shrunk ~1/3 (was h-14/56px) to give the title/company/
              location/tags row more horizontal room, and -- from `sm` up --
              the fit/contract badges now sit beside it instead of stacked
              above the title, with the rest of the identity block moved to
              its own full-width row below both (Steve's reference
              screenshot, 2026-09-30). Below `sm`, width is tight enough that
              the original stacked-beside-the-logo arrangement stays: the
              badges are duplicated (`sm:hidden` / `hidden sm:flex`), not
              moved, so each breakpoint renders exactly one copy. -->
              <div class="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-3 sm:gap-y-2">
                <div class="flex shrink-0 items-center gap-3">
                  <span
                    class="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-xl border-2 border-ink text-sm font-extrabold text-white"
                    :style="{ background: offer.bg }"
                  >
                    {{ offer.logo }}
                  </span>
                  <!-- `flex-col` here is intentional: the fit badge and the
                  contract tag always stack as two separate lines next to the
                  logo, never squeezed onto one row even when there's room --
                  Steve's reference screenshot, confirmed again 2026-09-30
                  after a wrong attempt at "fixing" this away. -->
                  <div class="hidden flex-col items-start gap-1.5 sm:flex">
                    <AppFitBadge :fit="offer.fit" />
                    <span
                      v-if="offer.contractTag"
                      class="inline-block rounded-full border-2 border-ink bg-lav px-2.5 py-0.5 text-[10px] font-extrabold text-ink"
                    >
                      {{ offer.contractTag }}
                    </span>
                  </div>
                </div>

                <div class="min-w-0 flex-1 sm:w-full sm:flex-none">
                  <div class="mb-1 flex flex-wrap items-center gap-1.5 sm:hidden">
                    <AppFitBadge :fit="offer.fit" />
                    <!-- Same colored-pill treatment as dashboard.vue's contract
                    tag (not the muted "📄 label" text this page used to show
                    here) so the info reads with the same weight in both
                    places -- was easy to miss buried among location/salary. -->
                    <span
                      v-if="offer.contractTag"
                      class="inline-block rounded-full border-2 border-ink bg-lav px-2.5 py-0.5 text-[10px] font-extrabold text-ink"
                    >
                      {{ offer.contractTag }}
                    </span>
                  </div>
                  <p class="text-base font-bold text-ink">{{ offer.title }}</p>
                  <p class="text-sm font-semibold text-ink/70">{{ offer.company }}</p>
                  <div
                    class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink/50"
                  >
                    <span v-if="offer.loc">📍 {{ offer.loc }}</span>
                    <span v-if="offer.dailyRateLabel || offer.salaryLabel">{{
                      offer.dailyRateLabel || offer.salaryLabel
                    }}</span>
                    <!-- Moved here from the scores column on the right: it's
                    metadata about the offer, same family as location/salary. -->
                    <span v-if="offer.publishedAgo" class="inline-flex items-center gap-0.5">
                      🕓 {{ offer.publishedAgo }}
                      <UiWarningHint
                        v-if="offer.source === 'adzuna'"
                        :message="$t('common.stale_source_warning')"
                      />
                    </span>
                  </div>
                  <!-- A raw, human-unreadable skill key from the matching
                  backend (e.g. "product_owner_data_experience") is one
                  unbroken word long enough to overflow the pill on its own --
                  break-words alone didn't stop that in practice (flex items
                  don't shrink below content width by default), so tagsFor()
                  truncates with an ellipsis instead. break-words stays as a
                  safety net. Key is the index, not the (possibly truncated,
                  possibly duplicate) text. -->
                  <div v-if="tagsFor(offer).shown.length" class="mt-2 flex flex-wrap gap-1.5">
                    <span
                      v-for="(tag, index) in tagsFor(offer).shown"
                      :key="index"
                      class="max-w-full break-words rounded-full border-2 border-ink/30 bg-white px-2.5 py-0.5 text-[11px] font-bold text-ink/70"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="tagsFor(offer).extra"
                      class="rounded-full border-2 border-ink/30 bg-white px-2.5 py-0.5 text-[11px] font-bold text-ink/70"
                    >
                      +{{ tagsFor(offer).extra }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="reasonsFor(offer).length" class="sm:min-w-[200px] sm:flex-1">
                <p class="mb-2 text-xs font-semibold text-ink/60">
                  {{ $t('opportunites.reasons_title') }}
                </p>
                <ul class="space-y-1 text-xs text-ink/70">
                  <li
                    v-for="(reason, index) in reasonsFor(offer)"
                    :key="index"
                    class="flex gap-1.5"
                  >
                    <span :class="reason.ok ? 'text-success' : 'text-warning'" class="mt-0.5">{{
                      reason.ok ? '✓' : '⚠'
                    }}</span>
                    <span class="line-clamp-2">{{ reason.text }}</span>
                  </li>
                </ul>
              </div>

              <!-- `sm:pt-6`: on desktop this column sits at the same
              top-right corner as the always-hoverable reject "✕" (absolute,
              top-3/right-3) -- without this, the score cluster rendered
              directly under it. Mobile stacks this column last, well below
              the button, so no offset needed there. -->
              <div
                class="flex shrink-0 flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2 sm:pt-6"
              >
                <AppPendingTag v-if="offer.isPending" size="md">
                  {{ $t('dashboard.analysis_pending') }}
                </AppPendingTag>
                <div v-else class="flex items-end gap-3.5">
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-ink/50">Career</p>
                    <p class="text-lg font-black text-ink">{{ offer.scores.career }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-ink/50">ATS</p>
                    <p class="text-lg font-black text-ink">{{ offer.scores.ats }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-ink/50">ATS Potential</p>
                    <p class="text-lg font-black text-brand">{{ offer.scores.potential }}</p>
                  </div>
                  <!-- Regret Index block removed 2026-10-03 (Steve: masquer
                       toute mention à l'indice de regret côté front). -->
                </div>
                <UiButton size="sm" variant="primary" @click.stop="openOffer(offer)">
                  {{ $t('opportunites.see_detail') }} →
                </UiButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="!loading && totalPages > 1"
          class="mt-5 flex items-center justify-between text-sm text-ink/60"
        >
          <span>{{
            $t('opportunites.pagination_range', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, offers.length),
              total: offers.length,
            })
          }}</span>
          <div class="flex items-center gap-1">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white hover:bg-lav disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page === 1"
              :aria-label="$t('opportunites.previous_page')"
              @click="page = Math.max(1, page - 1)"
            >
              ‹
            </button>
            <button
              v-for="n in totalPages"
              :key="n"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold"
              :class="n === page ? 'bg-sun text-ink' : 'bg-white text-ink hover:bg-lav'"
              @click="page = n"
            >
              {{ n }}
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white hover:bg-lav disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page === totalPages"
              :aria-label="$t('opportunites.next_page')"
              @click="page = Math.min(totalPages, page + 1)"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <aside class="hidden flex-col gap-5 xl:flex">
        <AppScoresHelp />

        <div class="rounded-[22px] border-[2.5px] border-ink bg-sun-light p-4">
          <div class="mb-2 flex items-center gap-2 text-amber-600">
            <span aria-hidden="true">🔔</span>
            <p class="text-xs font-bold text-ink">{{ $t('opportunites.alerts_title') }}</p>
          </div>
          <p class="text-xs leading-relaxed text-ink/60">{{ $t('opportunites.alerts_text') }}</p>
          <UiButton
            size="sm"
            variant="secondary"
            block
            class="mt-3"
            @click="navigateTo('/settings#notifications')"
          >
            {{ $t('dashboard.alerts') }}
          </UiButton>
        </div>
      </aside>
    </div>

    <UiModal v-model="salaryModalOpen" :title="$t('opportunites.salary_modal_title')" size="sm">
      <div v-if="showsSalarySlider" class="mb-6">
        <p class="mb-1 text-sm font-bold text-ink">{{ $t('opportunites.salary_min') }}</p>
        <p class="mb-3 text-xs text-ink/60">{{ $t('opportunites.salary_estimate_caption') }}</p>
        <div class="mb-4 grid grid-cols-3 text-center">
          <div>
            <p class="text-[11px] uppercase text-ink/50">{{ $t('opportunites.annual') }}</p>
            <p class="text-base font-black text-ink">{{ formatEuros(salaryMin) }} €</p>
          </div>
          <div>
            <p class="text-[11px] uppercase text-ink/50">{{ $t('opportunites.monthly') }}</p>
            <p class="text-base font-black text-ink">
              {{ formatEuros(monthlyFromAnnual(salaryMin)) }} €
            </p>
          </div>
          <div>
            <p class="text-[11px] uppercase text-ink/50">{{ $t('opportunites.hourly') }}</p>
            <p class="text-base font-black text-ink">
              {{ formatEuros(hourlyFromAnnual(salaryMin), { decimals: 2 }) }} €
            </p>
          </div>
        </div>
        <input
          v-model.number="salaryMin"
          type="range"
          min="0"
          :max="SALARY_SLIDER_MAX"
          :step="SALARY_SLIDER_STEP"
          class="w-full accent-brand"
          :aria-label="$t('opportunites.salary_min')"
        />
      </div>

      <div v-if="showsFreelanceSlider" class="mb-6">
        <p class="mb-3 text-sm font-bold text-ink">{{ $t('opportunites.tjm_min') }}</p>
        <p class="mb-3 text-center text-base font-black text-ink">
          {{ $t('opportunites.tjm_min_label', { amount: formatEuros(tjmMin) }) }}
        </p>
        <input
          v-model.number="tjmMin"
          type="range"
          min="0"
          :max="TJM_SLIDER_MAX"
          :step="TJM_SLIDER_STEP"
          class="w-full accent-brand"
          :aria-label="$t('opportunites.tjm_min')"
        />
      </div>

      <label class="flex items-center justify-between gap-3">
        <span class="text-sm text-ink">{{ $t('opportunites.only_salary_known') }}</span>
        <UiToggle v-model="onlySalaryKnown" />
      </label>

      <template #footer>
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="text-xs font-semibold text-ink/60 hover:text-ink/80"
            @click="resetFilters"
          >
            {{ $t('dashboard.filter_reset') }}
          </button>
          <button
            type="button"
            class="rounded-2xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
            @click="salaryModalOpen = false"
          >
            {{ $t('opportunites.show_n_offers', { count: filteredOffers.length }) }}
          </button>
        </div>
      </template>
    </UiModal>
  </div>
</template>
