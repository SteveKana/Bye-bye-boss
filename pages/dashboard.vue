<script setup>
// Dashboard -- today's "Top 5 des opportunités": only the offers of the day
// (the backend's GET /matching/dashboard returns offers never shown, or first
// shown today -- from the next day on they live in /opportunites), never one
// they already applied to. The history (25 most recent offers, with an ATS filter) lives on the
// separate "Opportunités" page (pages/opportunites.vue), linked via
// "Voir toutes les opportunités" below -- see the mockups (dashboard.html
// vs opportunites.html): they're deliberately two different views over the
// same scored pool, not one page with a "show more" toggle.
definePageMeta({ layout: 'app', middleware: ['auth', 'onboarding-complete'] })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const { firstName } = useUserDisplay()
const matching = useMatchingStore()

const loadingOpportunities = ref(true)

const TOP_COUNT = 5
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.dashboardOpportunities))

// Contrat / Télétravail / Localisation / Salaire, pre-filled from the saved
// preferences. The backend already picked today's offers with those
// preferences, so these filters rarely hide anything -- but when the
// candidate tightens one, the page says how many offers it hides instead of
// looking empty without explanation.
const filters = useDashboardFilters()

// "Top 5 des opportunités pour vous au jj/mm/aaaa" -- today's date.
const todayLabel = new Date().toLocaleDateString('fr-FR')

// A brand-new profile's very first matching run fires in the background
// right after onboarding completes (see the backend's
// ProfileOnboardingCompleted event) -- without this, an empty dashboard
// looked identical whether that run was still in progress or had
// genuinely found nothing, and the only way to see freshly finished
// matches was a manual reload. So: if the first fetch comes back empty,
// keep showing the loading skeleton (not the "empty" message) and poll
// before giving up and showing it for real.
//
// 4 minutes, not the "1-2 minutes" this used to say: the backend scores up
// to MATCHING_MAX_OFFERS_PER_CANDIDATE offers, MATCHING_CONCURRENCY at a
// time, each with its own MATCHING_OPENAI_TIMEOUT_SECONDS (180s) -- a real
// run can legitimately take longer than "1-2 minutes" (confirmed live: a
// run finished only a few seconds after the old 2-minute window gave up
// and showed the "no opportunities" message). The loading copy
// (dashboard.loading_sub) is upfront about this ceiling and tells the
// candidate they'll get an email regardless, so there's little cost to
// erring generous here over making them sit through a falsely negative
// "no opportunities" message.
const POLL_INTERVAL_MS = 8000
const MAX_POLL_ATTEMPTS = 30 // 4 minutes at 8s
let pollAttempts = 0

const { pause: stopPolling, resume: startPolling } = useIntervalFn(
  async () => {
    pollAttempts += 1
    try {
      await matching.fetchDashboard()
    } catch {
      // Same as the initial fetch below -- keep retrying silently rather
      // than surfacing an error toast for what reads as "no offers yet".
    }
    if (todaysOffers.value.length > 0) loadingOpportunities.value = false
    // Keep going while offers are shown without their scores yet -- the
    // scores land when the nightly OpenAI batch finishes (usually within
    // minutes to a few hours, see the loading copy); the 4-minute cap then
    // just stops the polling, the next visit shows them.
    if (!hasPending.value && todaysOffers.value.length > 0) stopPolling()
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      stopPolling()
      loadingOpportunities.value = false
    }
  },
  POLL_INTERVAL_MS,
  { immediate: false }
)

// Same order as the backend's answer (best first, offers still being
// analysed after the scored ones) -- the 5-offer cap is applied by the
// backend too, this slice is only a safety net.
const todaysOffers = computed(() => matchedOffers.value.slice(0, TOP_COUNT))
const topOffers = computed(() =>
  todaysOffers.value
    .filter((offer) => filters.matches(offer))
    .map((offer, index) => ({ ...offer, rank: index + 1 }))
)
const hiddenCount = computed(() => todaysOffers.value.length - topOffers.value.length)

const hasPending = computed(() => todaysOffers.value.some((offer) => offer.isPending))

// The candidate already has offers in their history (/opportunites).
const hasHistory = computed(() => matching.topOpportunities.length > 0)

// Freshest score time across today's offers and the history, so the banner
// also shows on a day with no new offer.
const scoreDates = computed(() =>
  [...matching.dashboardOpportunities, ...matching.topOpportunities].map((m) =>
    m.computed_at ? new Date(m.computed_at) : null
  )
)

onMounted(async () => {
  try {
    await matching.fetchDashboard()
  } catch {
    // No profile yet, profile not "complete", or nothing scored yet -- all
    // read as "no opportunities yet", same honest empty state as before,
    // not an alarming error toast.
  } finally {
    if (todaysOffers.value.length > 0) {
      loadingOpportunities.value = false
      // Offers already there but some still without scores: keep refreshing.
      if (hasPending.value) startPolling()
    } else {
      // Nothing for today. A candidate who already has offers in their
      // history (/opportunites) is simply between two daily runs: say so
      // right away instead of a 4-minute loading skeleton.
      try {
        await matching.fetchTop()
      } catch {
        // No history to read -- treated as a first-time profile below.
      }
      if (hasHistory.value) {
        loadingOpportunities.value = false
      } else {
        // Could be a first-time profile whose immediate matching run
        // hasn't finished yet, so keep the skeleton up and poll for it
        // instead of assuming this is the final, honest "empty" state right
        // away -- see the comment above useIntervalFn.
        startPolling()
      }
    }
  }
})

// Opens the "Opportunité" detail page in-app -- matches the mockups, which
// never redirect straight to the external job listing from the dashboard
// list itself. The real external URL (offer.url) is only opened from the
// "Voir l'offre" button on that detail page (pages/opportunity/[id].vue).
function openOffer(offer) {
  navigateTo(`/opportunity/${offer.id}`)
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-ink">
          {{ $t('dashboard.greeting', { name: firstName }) }} 👋
        </h1>
      </div>
      <UiButton variant="secondary" size="sm" @click="navigateTo('/settings#notifications')"
        >🔔 {{ $t('dashboard.alerts') }}</UiButton
      >
    </div>

    <AppScoresStatus :dates="scoreDates" class="mb-6" />

    <!-- Top opportunities -->
    <section>
      <!-- Full-width banner; the list and the "Comprendre nos scores" block
           sit side by side underneath, so the block starts at the same
           height as the first offer (Steve, 2026-10-07). Under xl the block
           simply follows the list instead of disappearing. -->
      <div class="mb-4 rounded-[22px] border-[2.5px] border-ink bg-sun px-5 py-4">
        <div class="flex items-center gap-2">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-base"
            aria-hidden="true"
          >
            ⭐
          </span>
          <h2 class="text-lg font-black text-ink">
            {{ $t('dashboard.top_title', { date: todayLabel }) }}
          </h2>
        </div>
        <p class="mt-1 text-[13px] font-semibold text-ink/70">{{ $t('dashboard.top_sub') }}</p>
      </div>

      <AppOfferFiltersBar :filters="filters" class="mb-4" />

      <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <ul class="space-y-3">
            <li
              v-for="offer in topOffers"
              :key="offer.id"
              class="group flex cursor-pointer items-start gap-3 rounded-[22px] border-[2.5px] border-ink bg-white px-3 py-3.5 transition hover:-translate-y-0.5 hover:bg-lav/40 sm:gap-4 sm:px-4"
              role="button"
              tabindex="0"
              @click="openOffer(offer)"
              @keydown.enter="openOffer(offer)"
              @keydown.space.prevent="openOffer(offer)"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lav text-xs font-black text-ink"
              >
                {{ offer.rank }}
              </span>
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-ink text-[11px] font-extrabold text-white"
                :style="{ background: offer.bg }"
              >
                {{ offer.logo }}
              </span>

              <div class="min-w-0 flex-1">
                <!-- The row stays compact: title (2 lines max), company/location,
                then short badges. blockingMessage (a full free-form sentence) is
                not shown here, it lives on the opportunity detail page. -->
                <div class="line-clamp-2 text-sm font-extrabold text-ink">{{ offer.title }}</div>
                <div class="text-[12.5px] font-medium text-ink/60">
                  {{ offer.company }} · {{ offer.loc }}
                </div>
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <AppFitBadge :fit="offer.fit" />
                  <AppPendingTag v-if="offer.isPending">
                    {{ $t('dashboard.analysis_pending') }}
                  </AppPendingTag>
                  <span
                    v-if="offer.contractTag"
                    class="inline-block rounded-full border-2 border-ink bg-lav px-2.5 py-0.5 text-[10px] font-extrabold text-ink"
                  >
                    {{ offer.contractTag }}
                  </span>
                  <span
                    v-if="offer.publishedAgo"
                    class="inline-flex items-center gap-0.5 text-[11px] font-medium text-ink/50"
                  >
                    {{ offer.publishedAgo }}
                    <!-- Adzuna's published date is the date its crawler last (re-)
                         indexed the listing, not necessarily the true original
                         posting date on the source job board. France Travail's own
                         dateActualisation doesn't have this issue, so the hint is
                         Adzuna-only. -->
                    <UiWarningHint
                      v-if="offer.source === 'adzuna'"
                      :message="$t('common.stale_source_warning')"
                    />
                  </span>
                </div>
              </div>

              <div v-if="!offer.isPending" class="hidden shrink-0 gap-2 sm:flex">
                <div
                  class="min-w-[56px] rounded-2xl border-2 border-ink bg-white px-2 py-1 text-center"
                >
                  <div class="text-[10px] font-bold text-ink/60">Career</div>
                  <div class="text-sm font-black text-ink">{{ offer.scores.career }}</div>
                </div>
                <div
                  class="min-w-[56px] rounded-2xl border-2 border-ink bg-white px-2 py-1 text-center"
                >
                  <div class="text-[10px] font-bold text-ink/60">ATS</div>
                  <div class="text-sm font-black text-ink">{{ offer.scores.ats }}</div>
                </div>
                <div
                  class="min-w-[56px] rounded-2xl border-2 border-ink bg-lav px-2 py-1 text-center"
                >
                  <div class="text-[10px] font-bold text-ink/60">Potential</div>
                  <div class="text-sm font-black text-brand">{{ offer.scores.potential }}</div>
                </div>
              </div>
              <!-- Mobile: one pill with the potential score only -->
              <span
                v-if="!offer.isPending"
                class="shrink-0 rounded-full border-2 border-ink bg-lav px-2.5 py-1 text-sm font-black text-brand sm:hidden"
              >
                {{ offer.scores.potential }}
              </span>

              <button
                class="shrink-0 rounded-full p-1.5 text-ink/40 transition hover:bg-danger-light hover:text-danger"
                :aria-label="$t('dashboard.reject')"
                @click.stop="reject(offer)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
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

          <div v-if="loadingOpportunities">
            <!-- role="status"/aria-live: the only part of this loading state a
                 screen reader needs to hear -- the skeleton rows below are pure
                 visual filler (aria-hidden). -->
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
              <p class="text-sm font-bold text-ink">{{ $t('dashboard.loading') }}</p>
              <p class="max-w-sm text-[12.5px] text-ink/50">{{ $t('dashboard.loading_sub') }}</p>
            </div>

            <!-- Skeleton rows: same shape as a real offer row so the layout
                 doesn't jump once real offers arrive. -->
            <ul class="mt-2 space-y-3" aria-hidden="true">
              <li
                v-for="n in TOP_COUNT"
                :key="n"
                class="flex items-center gap-4 rounded-[22px] border-[2.5px] border-ink/20 bg-white px-4 py-3.5"
              >
                <span class="h-7 w-7 shrink-0 animate-pulse rounded-full bg-lav"></span>
                <span class="h-11 w-11 shrink-0 animate-pulse rounded-[14px] bg-lav"></span>
                <div class="min-w-0 flex-1 space-y-2 py-0.5">
                  <div class="h-3.5 w-2/5 animate-pulse rounded bg-lav"></div>
                  <div class="h-3 w-3/5 animate-pulse rounded bg-lav"></div>
                  <div class="h-4 w-24 animate-pulse rounded-full bg-lav"></div>
                </div>
              </li>
            </ul>
          </div>
          <p
            v-else-if="!todaysOffers.length"
            class="rounded-[22px] border-[2.5px] border-dashed border-ink/40 bg-white/70 py-8 text-center text-sm font-semibold text-ink/60"
          >
            {{ hasHistory ? $t('dashboard.empty_today') : $t('dashboard.empty') }}
          </p>

          <div
            v-if="!loadingOpportunities && hiddenCount > 0"
            class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[22px] border-[2.5px] border-dashed border-ink/40 bg-white/70 px-4 py-3 text-sm font-semibold text-ink/70"
          >
            <span aria-hidden="true">🙈</span>
            <span>{{
              $t('dashboard.hidden_by_filters', { count: hiddenCount }, hiddenCount)
            }}</span>
            <button
              type="button"
              class="font-extrabold text-brand hover:underline"
              @click="filters.reset()"
            >
              {{ $t('dashboard.show_all') }}
            </button>
          </div>

          <NuxtLink
            to="/opportunites"
            class="mt-5 block w-full text-center text-sm font-extrabold text-brand hover:underline"
          >
            {{ $t('dashboard.see_all') }} →
          </NuxtLink>
        </div>

        <AppScoresHelp />
      </div>
    </section>
  </div>
</template>
