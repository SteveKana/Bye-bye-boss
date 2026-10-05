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
const { criteria, load: loadCriteria } = useSearchCriteria()

const loadingOpportunities = ref(true)

const TOP_COUNT = 5
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.dashboardOpportunities))

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
    if (topOffers.value.length > 0) loadingOpportunities.value = false
    // Keep going while offers are shown without their scores yet -- the
    // scores land when the nightly OpenAI batch finishes (usually within
    // minutes to a few hours, see the loading copy); the 4-minute cap then
    // just stops the polling, the next visit shows them.
    if (!hasPending.value && topOffers.value.length > 0) stopPolling()
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
const topOffers = computed(() =>
  matchedOffers.value.slice(0, TOP_COUNT).map((offer, index) => ({ ...offer, rank: index + 1 }))
)

const hasPending = computed(() => topOffers.value.some((offer) => offer.isPending))

// The candidate already has offers in their history (/opportunites).
const hasHistory = computed(() => matching.topOpportunities.length > 0)

onMounted(async () => {
  await loadCriteria()
  try {
    await matching.fetchDashboard()
  } catch {
    // No profile yet, profile not "complete", or nothing scored yet -- all
    // read as "no opportunities yet", same honest empty state as before,
    // not an alarming error toast.
  } finally {
    if (topOffers.value.length > 0) {
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
        <h1 class="text-2xl font-extrabold text-navy">
          {{ $t('dashboard.greeting', { name: firstName }) }} 👋
        </h1>
      </div>
      <UiButton variant="secondary" size="sm" @click="navigateTo('/settings')"
        >🔔 {{ $t('dashboard.alerts') }}</UiButton
      >
    </div>

    <AppCriteriaBar :criteria="criteria" />

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
          <h2 class="text-lg font-bold text-navy">
            {{ $t('dashboard.top_title', { date: todayLabel }) }}
          </h2>
        </div>
        <p class="mt-1 text-[13px] text-gray-500">{{ $t('dashboard.top_sub') }}</p>
      </template>

      <ul class="divide-y divide-gray-100">
        <li
          v-for="offer in topOffers"
          :key="offer.id"
          class="group -mx-2 flex cursor-pointer items-start gap-4 rounded-lg px-2 py-3.5 transition hover:bg-gray-50"
          role="button"
          tabindex="0"
          @click="openOffer(offer)"
          @keydown.enter="openOffer(offer)"
          @keydown.space.prevent="openOffer(offer)"
        >
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
            <!-- Mobile list rows in both Apple's and Google's own guidance
            top out around 3 lines (88dp/pt) before a row stops reading as a
            compact list and the rest belongs on a detail screen instead --
            https://ixdf.org/literature/article/responsive-design-let-the-device-do-the-work
            (deferred/secondary content) and
            https://www.designyourway.net/blog/the-simple-yet-complicated-mobile-ui-list-design-43-examples/
            (row-height budgets, leading icon aligned with the primary text).
            The previous pass fixed the truncation that was cutting the
            title and hiding the location, but then let every field
            (2-line title + company/location/date + badges + a full LLM
            sentence) stack on top of each other -- the row ballooned past
            any list-row budget instead of actually using that guidance.
            Rebalanced now: publishedAgo moves next to the other short
            badges instead of padding out the metadata line, and
            blockingMessage -- a full free-form sentence, not the kind of
            atomic label a badge or a metadata line is for -- comes off this
            preview row entirely; it was being mangled into a meaningless
            "Aucun critère bloquant id..." fragment by the one-line clamp
            anyway. It's still shown in full on the opportunity detail page
            (pages/opportunity/[id]/index.vue), one tap away. -->
            <div class="line-clamp-2 text-sm font-bold text-navy">{{ offer.title }}</div>
            <div class="text-[12.5px] text-gray-500">{{ offer.company }} · {{ offer.loc }}</div>
            <div class="mt-1 flex flex-wrap items-center gap-1.5">
              <AppFitBadge :fit="offer.fit" />
              <span
                v-if="offer.isPending"
                class="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500"
              >
                {{ $t('dashboard.analysis_pending') }}
              </span>
              <span
                v-if="offer.contractTag"
                class="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold text-brand-text"
              >
                {{ offer.contractTag }}
              </span>
              <span
                v-if="offer.publishedAgo"
                class="inline-flex items-center gap-0.5 text-[11px] text-gray-400"
              >
                {{ offer.publishedAgo }}
                <!-- Adzuna's published date is the date its crawler last (re-)
                     indexed the listing, not necessarily the true original
                     posting date on the source job board -- see the backend
                     provider's published_at comment. France Travail's own
                     dateActualisation doesn't have this issue, so the hint is
                     Adzuna-only. -->
                <UiWarningHint
                  v-if="offer.source === 'adzuna'"
                  :message="$t('common.stale_source_warning')"
                />
              </span>
            </div>
          </div>

          <div v-if="!offer.isPending" class="hidden shrink-0 gap-5 sm:flex">
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">Career</div>
              <div class="text-sm font-extrabold text-blue-600">{{ offer.scores.career }}</div>
            </div>
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">ATS</div>
              <div class="text-sm font-extrabold text-green-600">{{ offer.scores.ats }}</div>
            </div>
            <div class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">ATS Potential</div>
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

          <!-- Affordance that the row opens the offer detail -->
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

      <div v-if="loadingOpportunities">
        <!-- role="status"/aria-live: the only part of this loading state a
             screen reader needs to hear -- the skeleton rows below are pure
             visual filler (aria-hidden), not real content. -->
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

        <!-- Skeleton rows: same shape as a real offer row (avatar, two text
             lines, tag pill, score column) so the layout doesn't jump once
             real offers arrive, and so it's obvious something is actively
             loading rather than the section just being empty/broken. -->
        <ul class="mt-2 divide-y divide-gray-100" aria-hidden="true">
          <li
            v-for="n in TOP_COUNT"
            :key="n"
            class="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5"
          >
            <span class="w-4 shrink-0"></span>
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
      <p v-else-if="!topOffers.length" class="py-6 text-center text-sm text-gray-400">
        {{ hasHistory ? $t('dashboard.empty_today') : $t('dashboard.empty') }}
      </p>

      <template #footer>
        <NuxtLink
          to="/opportunites"
          class="block w-full text-center text-sm font-semibold text-brand hover:underline"
        >
          {{ $t('dashboard.see_all') }} →
        </NuxtLink>
      </template>
    </UiCard>
  </div>
</template>
