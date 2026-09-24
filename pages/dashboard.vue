<script setup>
// Dashboard -- a 5-row preview of the best matches, no filters/sort. The
// exhaustive list (all scored matches, with real filters) lives on the
// separate "Opportunités" page (pages/opportunites.vue), linked via
// "Voir toutes les opportunités" below -- see the mockups (dashboard.html
// vs opportunites.html): they're deliberately two different views over the
// same scored pool, not one page with a "show more" toggle.
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const { firstName } = useUserDisplay()
const matching = useMatchingStore()
const { criteria, load: loadCriteria } = useSearchCriteria()

const loadingOpportunities = ref(true)

const TOP_COUNT = 5
const { matchedOffers, reject } = useMatchedOffers(computed(() => matching.topOpportunities))

// Best real odds of getting past the recruiter's ATS once the CV is
// adapted (ats_potential), not just a good abstract career fit -- same
// "Pertinence" ordering the full Opportunités page defaults to.
const topOffers = computed(() =>
  [...matchedOffers.value]
    .sort((a, b) => b.scores.potential - a.scores.potential)
    .slice(0, TOP_COUNT)
    .map((offer, index) => ({ ...offer, rank: index + 1 }))
)

onMounted(async () => {
  await loadCriteria()
  try {
    await matching.fetchTop()
  } catch {
    // No profile yet, profile not "complete", or nothing scored yet -- all
    // read as "no opportunities yet", same honest empty state as before,
    // not an alarming error toast.
  } finally {
    loadingOpportunities.value = false
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
        <p class="mt-1 text-sm text-gray-500">{{ $t('dashboard.greeting_sub') }}</p>
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
          <h2 class="text-lg font-bold text-navy">{{ $t('dashboard.top_title') }}</h2>
        </div>
        <p class="mt-1 text-[13px] text-gray-500">{{ $t('dashboard.top_sub') }}</p>
      </template>

      <ul class="divide-y divide-gray-100">
        <li
          v-for="offer in topOffers"
          :key="offer.id"
          class="group -mx-2 flex cursor-pointer items-center gap-4 rounded-lg px-2 py-3.5 transition hover:bg-gray-50"
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
            <div class="truncate text-sm font-bold text-navy">{{ offer.title }}</div>
            <div class="flex min-w-0 items-center gap-0.5">
              <span class="truncate text-[12.5px] text-gray-500">
                {{ offer.company }} · {{ offer.loc }}
                <template v-if="offer.publishedAgo"> · {{ offer.publishedAgo }}</template>
              </span>
              <!-- Adzuna's published date is the date its crawler last (re-)
                   indexed the listing, not necessarily the true original
                   posting date on the source job board -- see the backend
                   provider's published_at comment. France Travail's own
                   dateActualisation doesn't have this issue, so the hint is
                   Adzuna-only. -->
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
        {{ $t('dashboard.empty') }}
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
