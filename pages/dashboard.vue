<script setup>
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const toast = useToast()
const { firstName } = useUserDisplay()
const onboarding = useOnboardingStore()
const matching = useMatchingStore()
const route = useRoute()

// TEMPORARY debug hook -- no UI control, deliberately: visiting
// /dashboard?source=adzuna (or ?source=france_travail) hides every offer
// not from that provider, to spot-check that a given source's offers really
// reach a candidate's dashboard. Remove once that's no longer needed.
const debugSourceFilter = computed(() => route.query.source || null)

// Full class names so Tailwind keeps them. No "regret" entry -- the Regret
// Index is deliberately unavailable for now (see the backend `matching`
// module's docstring): we never fabricate a score, so there's nothing to
// show a color/label for.
const scoreColors = {
  ats: 'text-green-600',
  career: 'text-blue-600',
  potential: 'text-brand',
}
const scoreLabels = { ats: 'ATS', career: 'Career', potential: 'Potential' }

// avatarColor/initials/contractTag/publishedLabel now live in
// composables/useOfferDisplay.js, shared with the "Opportunité" detail page
// (pages/opportunity/[id].vue) so the same company/offer always renders the
// same avatar color, initials, contract tag and published-date wording on
// both views.
const { avatarColor, initials, contractTag, publishedLabel } = useOfferDisplay()

// Real search criteria, pulled from the profile saved at the end of
// onboarding. Empty until the profile has loaded. Read-only here -- editing
// happens on the dedicated /preferences page (its own sidebar section), not
// inline in the dashboard.
const criteria = ref([])

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    const salary = profile.salary_target
      ? `${profile.salary_target.toLocaleString('fr-FR')} € brut / an`
      : null
    // "Région uniquement" alone is the same raw internal value the user
    // never actually chose to see -- show the région they picked instead
    // (see PreferencesForm.vue's mobility_region field).
    const mobility =
      profile.mobility === 'Région uniquement'
        ? profile.mobility_region || profile.mobility
        : profile.mobility
    criteria.value = [
      ...(profile.contract_types || []),
      ...(profile.remote_preferences || []),
      mobility,
      salary,
    ].filter(Boolean)
  } catch {
    // No profile yet (onboarding not completed) — leave the criteria bar empty
    // rather than showing anything misleading.
  }
})

const loadingOpportunities = ref(true)

// Filter/sort state, all client-side over the already-loaded top matches --
// there are at most ~20 of them (see the backend's list_top_for_profile),
// so there's no need for a dedicated filtering endpoint.
//
// Only CDI/Freelance get their own quick-filter button -- CDD/Intérim/
// Alternance/Stage still show as a tag on individual cards (contractTag()
// is unchanged), they're just not offered as a top-level filter.
const contractFilter = ref('all') // 'all' | 'CDI' | 'Freelance'
const sortBy = ref('relevance') // 'relevance' | 'date_desc' | 'date_asc'

function resetFilters() {
  contractFilter.value = 'all'
}

const hasActiveFilters = computed(() => contractFilter.value !== 'all')

const sortOptions = computed(() => [
  { value: 'relevance', label: t('dashboard.sort_relevance') },
  { value: 'date_desc', label: t('dashboard.sort_date_desc') },
  { value: 'date_asc', label: t('dashboard.sort_date_asc') },
])

// Real matches from the background scoring job, reshaped for the template.
// Locally rejected offers are filtered out below (see `reject`) without
// touching the backend -- there's no "reject" endpoint yet, this is purely a
// client-side hide, same as before this was wired to real data.
const rejectedIds = ref(new Set())
const matchedOffers = computed(() =>
  matching.topOpportunities
    .filter((match) => !rejectedIds.value.has(match.id))
    .map((match) => ({
      id: match.id,
      logo: initials(match.company_name || match.offer.company_name),
      bg: avatarColor(match.company_name || match.offer.company_name || match.offer.title),
      title: match.offer.title,
      company: match.company_name || match.offer.company_name || '',
      loc: match.offer.location || '',
      source: match.offer.source,
      strong: match.ats_potential >= STRONG_FIT_THRESHOLD,
      blockingMessage: match.blocking_message || '',
      contractTag: contractTag(match.offer.contract_type),
      publishedAgo: publishedLabel(match.offer.published_at),
      publishedAt: match.offer.published_at ? new Date(match.offer.published_at) : null,
      url: match.offer.url,
      scores: {
        career: match.career_score,
        ats: match.ats_score,
        potential: match.ats_potential,
      },
    }))
)

const filteredOffers = computed(() =>
  matchedOffers.value.filter(
    (offer) =>
      (contractFilter.value === 'all' || offer.contractTag === contractFilter.value) &&
      (!debugSourceFilter.value || offer.source === debugSourceFilter.value)
  )
)

// Missing dates always sort last, whichever direction is chosen -- an offer
// with no known publication date is neither "recent" nor "old".
const offers = computed(() => {
  const list = [...filteredOffers.value]
  if (sortBy.value === 'date_desc' || sortBy.value === 'date_asc') {
    const sign = sortBy.value === 'date_desc' ? -1 : 1
    list.sort((a, b) => {
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return sign * (a.publishedAt - b.publishedAt)
    })
  } else {
    // "Pertinence" -- ats_potential descending, not career_score: the point
    // is to surface the offers giving the best real odds of getting past
    // the recruiter's ATS once the CV is adapted, not just a good abstract
    // career fit (see STRONG_FIT_THRESHOLD's comment above).
    list.sort((a, b) => b.scores.potential - a.scores.potential)
  }
  return list.map((offer, index) => ({ ...offer, rank: index + 1 }))
})

onMounted(async () => {
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

// Reject with a short undo window — mirrors the spec (a real reject is permanent).
function reject(offer) {
  rejectedIds.value.add(offer.id)
  toast.show({
    message: t('dashboard.offer_hidden'),
    variant: 'info',
    duration: 5000,
    undo: () => rejectedIds.value.delete(offer.id),
    undoLabel: t('common.undo'),
  })
}

const soon = () => toast.info(t('app.soon_full'))

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
      <UiButton variant="secondary" size="sm" @click="soon"
        >🔔 {{ $t('dashboard.alerts') }}</UiButton
      >
    </div>

    <!-- Search criteria, read-only summary -- editing lives on the dedicated
         /preferences page/section (see the sidebar), not inline here. -->
    <div v-if="criteria.length" class="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <span class="font-semibold text-gray-500">{{ $t('dashboard.your_search') }}</span>
      <span
        v-for="c in criteria"
        :key="c"
        class="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-gray-700 shadow-soft"
      >
        {{ c }}
      </span>
      <NuxtLink to="/preferences" class="font-semibold text-brand hover:underline">
        {{ $t('dashboard.edit') }} →
      </NuxtLink>
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

      <!-- Filters/sort -- shown only once there's something to filter. -->
      <div
        v-if="matchedOffers.length"
        class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 pb-3"
      >
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="opt in [
              { value: 'all', label: $t('dashboard.filter_contract_all') },
              { value: 'CDI', label: 'CDI' },
              { value: 'Freelance', label: 'Freelance' },
            ]"
            :key="opt.value"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition"
            :class="
              contractFilter === opt.value
                ? 'border-brand bg-brand-light text-brand-text'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            "
            @click="contractFilter = opt.value"
          >
            {{ opt.label }}
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

        <div class="ml-auto w-full max-w-[200px]">
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
            <div v-for="(value, key) in offer.scores" :key="key" class="min-w-[40px] text-center">
              <div class="text-[10.5px] font-semibold text-gray-400">{{ scoreLabels[key] }}</div>
              <div class="text-sm font-extrabold" :class="scoreColors[key]">{{ value }}</div>
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
          <li v-for="n in 3" :key="n" class="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5">
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
