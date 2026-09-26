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
// faked, same "never fabricate" policy as elsewhere in this app (see
// pages/opportunity/[id].vue's header comment about the Regret Index):
//   - The mockup's "534 offres analysées" badge and page-2-of-54 pagination
//     scale -- this app has no such volume. GET /matching/top is the full
//     scored pool there is, so the count shown here is its real length, and
//     pagination only appears once there's actually more than one page.
//   - A 3-way "Sur site / Hybride / Full remote" filter -- the backend only
//     stores a single is_full_remote flag, nothing distinguishing "hybride"
//     from "sur site", so the filter here is the honest 2-way version.
//   - A "Localisation" (Paris / Île-de-France / France entière) filter and
//     a "Regret Index" sort option -- no normalized per-offer region data
//     and no computed regret score exist to filter/sort on. The Regret
//     column still appears in the scores cluster for the same layout, but
//     reads "—" / "Bientôt disponible", exactly like the detail page.
//   - The sidebar's "Premium" upsell card -- there's no subscription tier
//     implemented; the backend spec for this section explicitly puts
//     "Statut d'abonnement" out of MVP scope.
//
// Polish pass after the first mockup-fidelity delivery: the funnel/chevron/
// checkmark icons are now the mockup's real inline SVGs (an emoji had been
// used as a placeholder and rendered inconsistently across platforms); two
// sort options were added ("Potentiel ATS", "Score carrière" -- Regret Index
// sort still deliberately left out, same reasoning as above).
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
definePageMeta({ layout: 'app', middleware: 'auth', wide: true })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.opportunities')} · Bye Bye Boss`) })

const toast = useToast()
const matching = useMatchingStore()
const route = useRoute()
const { criteria, load: loadCriteria } = useSearchCriteria()

// TEMPORARY debug hook -- no UI control, deliberately: visiting
// /opportunites?source=adzuna (or ?source=france_travail) hides every offer
// not from that provider, to spot-check that a given source's offers really
// reach a candidate. Remove once that's no longer needed.
const debugSourceFilter = computed(() => route.query.source || null)

const loading = ref(true)
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.topOpportunities))

// The freshest computed_at among the current matches, as the spec for this
// section asks for ("L'horodatage de la dernière mise à jour du classement
// est affiché à l'utilisateur") -- real per-match timestamps, not a
// fabricated single "batch run" time we don't actually track.
const lastUpdatedLabel = computed(() => {
  const dates = matchedOffers.value.map((o) => o.computedAt).filter(Boolean)
  if (!dates.length) return ''
  const latest = new Date(Math.max(...dates.map((d) => d.getTime())))
  return latest.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const CONTRACT_OPTIONS = ['CDI', 'CDD', 'Freelance', 'Alternance']
const SALARY_OPTIONS = [30000, 40000, 50000, 60000, 70000]
// TJM scale for Freelance -- separate unit and range from the annual-salary
// options above (see the freelanceSelected-driven switch below).
const DAILY_RATE_OPTIONS = [300, 400, 500, 600, 700, 800]

const contractFilters = ref([])
const remoteFilter = ref('') // '' | 'onsite' | 'remote'
const salaryMin = ref('')
// 'relevance' | 'date_desc' | 'date_asc' | 'salary_desc' | 'ats_desc' | 'ats_potential_desc' | 'career_desc'
const sortBy = ref('relevance')
const page = ref(1)
const PAGE_SIZE = 10

// The salary_min/salary_max the backend stores is whatever a permanent-role
// salary the source reported -- an annual figure, the wrong unit for a
// freelance mission's TJM. The filter/sort below switch to the separate
// daily_rate_min/max field (extracted from offer text -- see
// core/daily_rate.py on the API side) whenever Freelance is selected, rather
// than misapplying an annual threshold to it.
const freelanceSelected = computed(() => contractFilters.value.includes('Freelance'))
// The two scales (annual salary vs. daily TJM) don't share a numeric range,
// so any selected threshold is cleared on toggle rather than silently
// reinterpreted -- e.g. "50000" as a minimum makes no sense once the field
// switches to a per-day rate.
watch(freelanceSelected, () => {
  salaryMin.value = ''
})

function toggleContractFilter(value) {
  const index = contractFilters.value.indexOf(value)
  if (index === -1) contractFilters.value.push(value)
  else contractFilters.value.splice(index, 1)
}

function toggleRemoteFilter(value) {
  remoteFilter.value = remoteFilter.value === value ? '' : value
}

function resetFilters() {
  contractFilters.value = []
  remoteFilter.value = ''
  salaryMin.value = ''
}

const hasActiveFilters = computed(
  () => contractFilters.value.length > 0 || !!remoteFilter.value || !!salaryMin.value
)

// Individually removable chips shown under the filter/sort row -- each
// knows how to clear just itself, same "Filtres actifs" pattern as the
// mockup.
const activeFilterChips = computed(() => {
  const chips = contractFilters.value.map((value) => ({
    key: `contract-${value}`,
    label: value,
    clear: () => toggleContractFilter(value),
  }))
  if (remoteFilter.value) {
    chips.push({
      key: 'remote',
      label:
        remoteFilter.value === 'remote' ? t('opportunity.full_remote') : t('opportunites.onsite'),
      clear: () => (remoteFilter.value = ''),
    })
  }
  if (salaryMin.value) {
    chips.push({
      key: 'salary',
      label: t(
        freelanceSelected.value ? 'opportunites.tjm_min_label' : 'opportunites.salary_min_label',
        {
          amount: Number(salaryMin.value).toLocaleString('fr-FR'),
        }
      ),
      clear: () => (salaryMin.value = ''),
    })
  }
  return chips
})

const salaryOptions = computed(() =>
  freelanceSelected.value
    ? [
        { value: '', label: t('opportunites.salary_any') },
        ...DAILY_RATE_OPTIONS.map((amount) => ({
          value: amount,
          label: t('opportunites.tjm_min_label', { amount: amount.toLocaleString('fr-FR') }),
        })),
      ]
    : [
        { value: '', label: t('opportunites.salary_any') },
        ...SALARY_OPTIONS.map((amount) => ({
          value: amount,
          label: t('opportunites.salary_min_label', { amount: amount.toLocaleString('fr-FR') }),
        })),
      ]
)

const SORT_OPTIONS = computed(() => [
  { value: 'relevance', label: t('dashboard.sort_relevance') },
  { value: 'date_desc', label: t('dashboard.sort_date_desc') },
  { value: 'date_asc', label: t('dashboard.sort_date_asc') },
  {
    value: 'salary_desc',
    label: t(
      freelanceSelected.value ? 'opportunites.sort_tjm_desc' : 'opportunites.sort_salary_desc'
    ),
  },
  { value: 'ats_desc', label: t('opportunites.sort_ats_desc') },
  { value: 'ats_potential_desc', label: t('opportunites.sort_potential_desc') },
  { value: 'career_desc', label: t('opportunites.sort_career_desc') },
  // Regret Index sort (croissant/décroissant) isn't here yet -- same
  // never-fabricate reasoning as the grayed Regret score below: there's no
  // computed regret value to sort by until that scoring exists.
])
const sortLabel = computed(
  () => SORT_OPTIONS.value.find((o) => o.value === sortBy.value)?.label || ''
)

const filteredOffers = computed(() =>
  matchedOffers.value.filter(
    (offer) =>
      (!contractFilters.value.length || contractFilters.value.includes(offer.contractTag)) &&
      (!remoteFilter.value ||
        (remoteFilter.value === 'remote' ? offer.isFullRemote : !offer.isFullRemote)) &&
      // No salary/TJM data at all can't be confirmed to meet a minimum, so
      // it's excluded once a threshold is set -- same reasoning as a missing
      // date/salary always sorting last below, just applied as a filter.
      // Freelance switches to dailyRateValue -- see freelanceSelected above.
      (!salaryMin.value ||
        ((freelanceSelected.value ? offer.dailyRateValue : offer.salaryValue) || 0) >=
          Number(salaryMin.value)) &&
      (!debugSourceFilter.value || offer.source === debugSourceFilter.value)
  )
)

// Missing values (date or salary) always sort last, whichever direction is
// chosen -- an offer with no known value is neither "recent"/"well-paid"
// nor its opposite.
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
    // Freelance switches to dailyRateValue -- see freelanceSelected above;
    // relabeled "TJM (décroissant)" in SORT_OPTIONS so it's clear which
    // figure is being sorted.
    const key = freelanceSelected.value ? 'dailyRateValue' : 'salaryValue'
    list.sort((a, b) => {
      if (!a[key]) return 1
      if (!b[key]) return -1
      return b[key] - a[key]
    })
  } else if (sortBy.value === 'ats_desc') {
    list.sort((a, b) => b.scores.ats - a.scores.ats)
  } else if (sortBy.value === 'ats_potential_desc') {
    list.sort((a, b) => b.scores.potential - a.scores.potential)
  } else if (sortBy.value === 'career_desc') {
    list.sort((a, b) => b.scores.career - a.scores.career)
  } else {
    // "Pertinence" -- ats_potential descending, same as the dashboard's
    // top-5 ordering: the best real odds of getting past the recruiter's
    // ATS once the CV is adapted, not just an abstract career fit.
    list.sort((a, b) => b.scores.potential - a.scores.potential)
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(offers.value.length / PAGE_SIZE)))
const pagedOffers = computed(() =>
  offers.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

watch([contractFilters, remoteFilter, salaryMin, sortBy], () => {
  page.value = 1
})
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
    ? [{ ok: false, text: t('opportunites.gap_reason', { skill: gap.skill }) }]
    : []
  return [...positives, ...negative]
}

function tagsFor(offer) {
  const names = (offer.analysis.job_skills || []).map((s) => s.skill).filter(Boolean)
  return { shown: names.slice(0, 4), extra: Math.max(0, names.length - 4) }
}

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

const soon = () => toast.info(t('app.soon_full'))

// Dropdown open/close, including click-outside -- mirrors the mockup's own
// toggleDropdown()/outside-click JS, ported to Vue refs instead of DOM
// classList toggling.
const filtersOpen = ref(false)
const sortOpen = ref(false)
const filtersRef = ref(null)
const sortRef = ref(null)

function onDocumentClick(event) {
  if (filtersOpen.value && filtersRef.value && !filtersRef.value.contains(event.target)) {
    filtersOpen.value = false
  }
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
          <h1 class="text-2xl font-extrabold text-navy">{{ $t('app.nav.opportunities') }}</h1>
          <span
            v-if="!loading"
            class="rounded-full bg-brand-light px-3 py-0.5 text-sm font-bold text-brand-text"
          >
            {{ $t('opportunites.count', { count: matchedOffers.length }) }}
          </span>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ $t('opportunites.subtitle') }}</p>
      </div>
      <div
        v-if="lastUpdatedLabel"
        class="flex items-center gap-2 rounded-xl border border-success-light bg-success-light/60 px-4 py-2.5 text-sm"
      >
        <span class="text-success" aria-hidden="true">✓</span>
        <div>
          <p class="text-xs font-semibold text-success-text">
            {{ $t('opportunites.scores_computed') }}
          </p>
          <p class="text-xs text-success-text/80">
            {{ $t('opportunites.last_updated', { date: lastUpdatedLabel }) }}
          </p>
        </div>
      </div>
    </div>

    <AppCriteriaBar :criteria="criteria" />

    <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_260px]">
      <!-- MAIN COLUMN -->
      <div class="min-w-0">
        <!-- Filters / sort row -->
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <div ref="filtersRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy shadow-soft hover:bg-gray-50"
              @click="filtersOpen = !filtersOpen"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-[15px] w-[15px]"
                aria-hidden="true"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {{ $t('opportunites.filters') }}
              <span
                v-if="hasActiveFilters"
                class="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
              >
                {{ activeFilterChips.length }}
              </span>
            </button>
            <div
              v-if="filtersOpen"
              class="absolute left-0 top-[calc(100%+6px)] z-20 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-card"
            >
              <div class="mb-3">
                <p class="mb-2 text-xs font-semibold text-gray-500">
                  {{ $t('opportunites.contract_type') }}
                </p>
                <div class="flex flex-wrap gap-2">
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
                </div>
              </div>
              <div class="mb-3">
                <p class="mb-2 text-xs font-semibold text-gray-500">
                  {{ $t('opportunites.remote_work') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition"
                    :class="
                      remoteFilter === 'onsite'
                        ? 'border-brand bg-brand-light text-brand-text'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    "
                    @click="toggleRemoteFilter('onsite')"
                  >
                    {{ $t('opportunites.onsite') }}
                  </button>
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition"
                    :class="
                      remoteFilter === 'remote'
                        ? 'border-brand bg-brand-light text-brand-text'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    "
                    @click="toggleRemoteFilter('remote')"
                  >
                    {{ $t('opportunity.full_remote') }}
                  </button>
                </div>
              </div>
              <div class="mb-4">
                <p class="mb-2 text-xs font-semibold text-gray-500">
                  {{ $t(freelanceSelected ? 'opportunites.tjm_min' : 'opportunites.salary_min') }}
                </p>
                <UiSelect v-model="salaryMin" :options="salaryOptions" />
              </div>
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  class="text-xs font-semibold text-gray-500 hover:text-gray-700"
                  @click="resetFilters"
                >
                  {{ $t('dashboard.filter_reset') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                  @click="filtersOpen = false"
                >
                  {{ $t('opportunites.apply') }}
                </button>
              </div>
            </div>
          </div>

          <div ref="sortRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy shadow-soft hover:bg-gray-50"
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
              class="absolute left-0 top-[calc(100%+6px)] z-20 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-card"
            >
              <button
                v-for="opt in SORT_OPTIONS"
                :key="opt.value"
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition hover:bg-gray-50"
                :class="opt.value === sortBy ? 'font-bold text-brand' : 'text-navy'"
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

          <p class="ml-1 text-sm text-gray-500">
            {{ $t('opportunites.results_found', { count: offers.length }) }}
          </p>
        </div>

        <!-- Active filter chips -->
        <div v-if="activeFilterChips.length" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-gray-500">{{ $t('opportunites.active') }}</span>
          <span
            v-for="chip in activeFilterChips"
            :key="chip.key"
            class="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-text"
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
            class="animate-pulse rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div class="flex gap-4">
              <div class="h-14 w-14 shrink-0 rounded-xl bg-gray-100"></div>
              <div class="flex-1 space-y-2 py-1">
                <div class="h-3.5 w-2/5 rounded bg-gray-100"></div>
                <div class="h-3 w-1/3 rounded bg-gray-100"></div>
                <div class="h-3 w-3/5 rounded bg-gray-100"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="!offers.length"
          class="rounded-2xl border border-gray-100 bg-white py-10 text-center"
        >
          <p class="text-sm text-gray-400">
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
            class="group relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:border-brand-light"
            role="button"
            tabindex="0"
            @click="openOffer(offer)"
            @keydown.enter="openOffer(offer)"
          >
            <button
              class="absolute right-3 top-3 rounded-md p-1 text-gray-300 opacity-0 transition hover:bg-danger-light hover:text-danger group-hover:opacity-100"
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

            <div class="flex flex-wrap gap-4">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white"
                :style="{ background: offer.bg }"
              >
                {{ offer.logo }}
              </span>

              <div class="min-w-0 flex-1">
                <div class="mb-1 flex flex-wrap items-center gap-1.5">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    :class="
                      offer.strong
                        ? 'bg-success-light text-success-text'
                        : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{ offer.strong ? $t('dashboard.fit_strong') : $t('dashboard.fit_good') }}
                  </span>
                  <!-- Same colored-pill treatment as dashboard.vue's contract
                  tag (not the muted "📄 label" text this page used to show
                  here) so the info reads with the same weight in both
                  places -- was easy to miss buried among location/salary. -->
                  <span
                    v-if="offer.contractTag"
                    class="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold text-brand-text"
                  >
                    {{ offer.contractTag }}
                  </span>
                </div>
                <p class="text-base font-bold text-navy">{{ offer.title }}</p>
                <p class="text-sm font-semibold text-gray-600">{{ offer.company }}</p>
                <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                  <span v-if="offer.loc">📍 {{ offer.loc }}</span>
                  <span v-if="offer.dailyRateLabel || offer.salaryLabel">{{
                    offer.dailyRateLabel || offer.salaryLabel
                  }}</span>
                </div>
                <div v-if="tagsFor(offer).shown.length" class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in tagsFor(offer).shown"
                    :key="tag"
                    class="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="tagsFor(offer).extra"
                    class="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    +{{ tagsFor(offer).extra }}
                  </span>
                </div>
              </div>

              <div v-if="reasonsFor(offer).length" class="min-w-[200px] flex-1">
                <p class="mb-2 text-xs font-semibold text-gray-500">
                  {{ $t('opportunites.reasons_title') }}
                </p>
                <ul class="space-y-1 text-xs text-gray-600">
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

              <div class="flex shrink-0 flex-col items-end gap-2">
                <div class="flex items-end gap-3.5">
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-gray-400">ATS</p>
                    <p class="text-lg font-extrabold text-green-600">{{ offer.scores.ats }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-gray-400">Career</p>
                    <p class="text-lg font-extrabold text-blue-600">{{ offer.scores.career }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-gray-400">Potential</p>
                    <p class="text-lg font-extrabold text-brand">{{ offer.scores.potential }}</p>
                  </div>
                  <!-- Regret Index: never a fabricated score -- see the
                       detail page's identical note -- so this stays a
                       grayed "coming soon" slot rather than a real number. -->
                  <div class="text-center">
                    <p class="text-[10px] font-medium text-gray-400">Regret</p>
                    <p class="text-lg font-extrabold text-gray-300">—</p>
                  </div>
                </div>
                <p v-if="offer.publishedAgo" class="text-xs text-gray-400">
                  {{ offer.publishedAgo }}
                </p>
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
          class="mt-5 flex items-center justify-between text-sm text-gray-500"
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
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page === 1"
              :aria-label="$t('opportunites.previous_page')"
              @click="page = Math.max(1, page - 1)"
            >
              ‹
            </button>
            <button
              v-for="n in totalPages"
              :key="n"
              class="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold"
              :class="
                n === page
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              "
              @click="page = n"
            >
              {{ n }}
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-brand-light bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-text hover:bg-brand-light/70"
          @click="soon"
        >
          ℹ️ {{ $t('opportunites.understand_scores') }}
        </button>

        <UiCard>
          <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-navy">
            📊 {{ $t('opportunites.how_we_rank_title') }}
          </h3>
          <ol class="space-y-2 text-xs text-gray-500">
            <li
              v-for="(step, index) in $tm('opportunites.how_we_rank_steps')"
              :key="index"
              class="flex gap-2"
            >
              <span class="font-semibold text-brand">{{ index + 1 }}.</span>{{ step }}
            </li>
          </ol>
        </UiCard>

        <div class="rounded-xl bg-amber-50 p-4">
          <div class="mb-2 flex items-center gap-2 text-amber-600">
            <span aria-hidden="true">🔔</span>
            <p class="text-xs font-bold text-navy">{{ $t('opportunites.alerts_title') }}</p>
          </div>
          <p class="text-xs leading-relaxed text-gray-500">{{ $t('opportunites.alerts_text') }}</p>
          <UiButton
            size="sm"
            variant="secondary"
            block
            class="mt-3"
            @click="navigateTo('/settings')"
          >
            {{ $t('dashboard.alerts') }}
          </UiButton>
        </div>

        <div>
          <p class="text-xs font-semibold text-navy">{{ $t('opportunites.adjust_title') }}</p>
          <NuxtLink
            to="/preferences"
            class="mt-1 flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            {{ $t('opportunites.adjust_link') }} →
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>
