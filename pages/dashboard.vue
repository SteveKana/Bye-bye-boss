<script setup>
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const toast = useToast()
const { firstName } = useUserDisplay()
const onboarding = useOnboardingStore()
const matching = useMatchingStore()

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

// Small fixed palette for the company-initials avatar -- picked
// deterministically from the company name so the same company always gets
// the same color (not randomized on every render).
const avatarPalette = ['#5B3FE8', '#0F0B2E', '#10B981', '#F59E0B', '#2D9CDB', '#DC2626']
function avatarColor(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return avatarPalette[hash % avatarPalette.length]
}
function initials(name) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase()
}

// A career_score at or above this is shown as "very strong fit" rather than
// just "strong fit" -- an editorial threshold, easy to tune later.
const STRONG_FIT_THRESHOLD = 75

// The offer's contract_type is free text and source-dependent -- France
// Travail gives French labels ("CDI", "CDD", "Mission intérimaire"...),
// Adzuna gives English ones joined from two separate fields ("permanent,
// full_time" / "contract, part_time") -- see the backend offers module's
// provider normalizers. This maps both onto a short, consistent French tag;
// an unrecognized label is shown as-is rather than hidden, and no label at
// all shows no tag.
function contractTag(rawLabel) {
  if (!rawLabel) return ''
  const text = rawLabel.toLowerCase()
  if (text.includes('cdi') || text.includes('permanent')) return 'CDI'
  if (text.includes('cdd')) return 'CDD'
  if (text.includes('intérim') || text.includes('interim')) return 'Intérim'
  if (
    text.includes('alternance') ||
    text.includes('apprentissage') ||
    text.includes('professionnalisation')
  ) {
    return 'Alternance'
  }
  if (text.includes('stage') || text.includes('internship')) return 'Stage'
  if (text.includes('freelance') || text.includes('indépendant') || text.includes('portage')) {
    return 'Freelance'
  }
  // Adzuna's "contract" (vs. "permanent") has no exact French equivalent --
  // freelance/portage is the closest fit for the kind of missions this
  // platform's search keywords target.
  if (text.includes('contract')) return 'Freelance'
  return rawLabel
}

// Same relative-date idiom as pages/profile/index.vue's `updatedAgo`.
function publishedAgo(dateStr) {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (days <= 0) return t('dashboard.published_today')
  if (days === 1) return t('dashboard.published_yesterday')
  return t('dashboard.published_days', { days })
}

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
    criteria.value = [
      ...(profile.contract_types || []),
      ...(profile.remote_preferences || []),
      profile.mobility,
      salary,
    ].filter(Boolean)
  } catch {
    // No profile yet (onboarding not completed) — leave the criteria bar empty
    // rather than showing anything misleading.
  }
})

const loadingOpportunities = ref(true)

// Real matches from the background scoring job, reshaped for the template.
// Locally rejected offers are filtered out below (see `reject`) without
// touching the backend -- there's no "reject" endpoint yet, this is purely a
// client-side hide, same as before this was wired to real data.
const rejectedIds = ref(new Set())
const offers = computed(() =>
  matching.topOpportunities
    .filter((match) => !rejectedIds.value.has(match.id))
    .map((match, index) => ({
      id: match.id,
      rank: index + 1,
      logo: initials(match.company_name || match.offer.company_name),
      bg: avatarColor(match.company_name || match.offer.company_name || match.offer.title),
      title: match.offer.title,
      company: match.company_name || match.offer.company_name || '',
      loc: match.offer.location || '',
      strong: match.career_score >= STRONG_FIT_THRESHOLD,
      blockingMessage: match.blocking_message || '',
      contractTag: contractTag(match.offer.contract_type),
      publishedAgo: publishedAgo(match.offer.published_at),
      url: match.offer.url,
      scores: {
        career: match.career_score,
        ats: match.ats_score,
        potential: match.ats_potential,
      },
    }))
)

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

// Opens the real job listing (France Travail / Adzuna) in a new tab.
function openOffer(offer) {
  window.open(offer.url, '_blank', 'noopener')
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
            <div class="truncate text-[12.5px] text-gray-500">
              {{ offer.company }} · {{ offer.loc }}
              <template v-if="offer.publishedAgo"> · {{ offer.publishedAgo }}</template>
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

      <p v-if="loadingOpportunities" class="py-6 text-center text-sm text-gray-400">
        {{ $t('dashboard.loading') }}
      </p>
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
