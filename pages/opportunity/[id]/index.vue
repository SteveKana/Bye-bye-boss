<script setup>
// "Opportunité" detail page -- what a dashboard row now links to instead of
// redirecting straight to the external job listing (see dashboard.vue's
// openOffer). Backed by GET /matching/{match_id}, which returns the same
// full analysis the matching LLM produced (scores, job_skills, matches,
// ats_gaps, actions...) rather than /top's lighter list shape.
//
// A few sections from the mockup (matchcareer-opportunity.html) are left out
// on purpose because there's no real data behind them yet -- never a
// fabricated stand-in:
//   - "À propos de l'entreprise" (company facts) -- nothing beyond the
//     company name is stored anywhere in this codebase.
//   - The "1er/534" ranking block -- no pool-size/rank is computed.
//   - The mockup's separate structured offer page (company/mission/profile
//     broken out) -- the backend only stores a flat `description` string,
//     so that's rendered as-is in a plain "Description du poste" card
//     instead of reproducing a structure we don't have the data for.
//
// The Regret Index block that used to sit next to scoreBlocks (SimplyHired-
// sourced employer-sentiment score) was removed 2026-10-03 (Steve: masquer/
// désactiver tout l'indice de regret, front et back) -- the backend no
// longer sends regret_availability/regret_score at all.
definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useApi()
const {
  avatarColor,
  initials,
  contractTag,
  publishedLabel,
  salaryLabel: offerSalaryLabel,
} = useOfferDisplay()
const {
  badgeClass: applicationStatusBadgeClass,
  message: applicationStatusMessage,
  markApplied,
} = useApplicationStatus()

const loading = ref(true)
const notFound = ref(false)
const match = ref(null)

onMounted(async () => {
  try {
    match.value = await api(`matching/${route.params.id}`)
  } catch {
    // Covers both "doesn't exist" and "belongs to someone else" -- the
    // backend deliberately returns the same 404 for both (anti-IDOR, see
    // core/exceptions.py), so there's nothing more specific to show here.
    notFound.value = true
  } finally {
    loading.value = false
  }
})

useHead({
  title: computed(() =>
    match.value ? `${match.value.offer.title} · Bye Bye Boss` : 'Bye Bye Boss'
  ),
})

const offer = computed(() => match.value?.offer || null)
const analysis = computed(() => match.value?.analysis || {})

// An offer still being analysed (status placeholder/pending) has no scores or
// analysis yet -- the scores card and the "adapt my CV" buttons are replaced
// by an "analyse en cours" notice (the backend refuses a CV optimisation for
// it anyway).
const isPending = computed(() => !!match.value && match.value.status !== 'scored')
const fit = computed(() =>
  match.value && !isPending.value ? fitLevel(match.value.ats_potential) : null
)

const salaryLabel = computed(() => offerSalaryLabel(offer.value))

const scoreBlocks = computed(() => [
  {
    key: 'ats',
    label: t('opportunity.score_ats'),
    value: match.value?.ats_score,
    colorClass: 'text-ink',
    barClass: 'bg-ink',
  },
  {
    key: 'career',
    label: t('opportunity.score_career'),
    value: match.value?.career_score,
    colorClass: 'text-ink',
    barClass: 'bg-blush',
  },
  {
    key: 'potential',
    label: t('opportunity.score_potential'),
    value: match.value?.ats_potential,
    colorClass: 'text-brand',
    barClass: 'bg-brand',
  },
])

// regretAvailable/regretScore/regretColorClass/regretBarClass removed
// 2026-10-03, see the file header comment above.

// hard_blocker anywhere in the list tips the banner into "point(s) of
// attention" styling; medium/soft-only (or none at all) reads as reassuring.
// The wording itself always comes straight from blocking_message (the LLM's
// own explanation) -- this only decides the banner's color/icon/title.
const hasHardBlocker = computed(() =>
  (analysis.value.blocking_requirements || []).some((r) => r.level === 'hard_blocker')
)

const requirementGroups = computed(() => {
  const groups = new Map()
  for (const skill of analysis.value.job_skills || []) {
    const label = skill.category || t('opportunity.requirements_other_category')
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(skill)
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
})

const headerSkillTags = computed(() => {
  const names = (analysis.value.job_skills || []).map((s) => s.label || s.skill).filter(Boolean)
  return { shown: names.slice(0, 4), extra: Math.max(0, names.length - 4) }
})

const MATCH_GROUP_ORDER = ['matched', 'partially_matched', 'missing']
const matchGroups = computed(() => {
  const labels = {
    matched: t('opportunity.match_group_matched'),
    partially_matched: t('opportunity.match_group_partial'),
    missing: t('opportunity.match_group_missing'),
  }
  const styles = {
    matched: { icon: 'bg-success-light text-success-text', bar: 'bg-success' },
    partially_matched: { icon: 'bg-warning-light text-warning', bar: 'bg-warning' },
    missing: { icon: 'bg-danger-light text-danger', bar: 'bg-danger' },
  }
  const byResult = { matched: [], partially_matched: [], missing: [] }
  for (const item of analysis.value.matches || []) {
    ;(byResult[item.result] || byResult.missing).push(item)
  }
  return MATCH_GROUP_ORDER.map((key) => ({
    key,
    label: labels[key],
    style: styles[key],
    items: [...byResult[key]].sort((a, b) => b.confidence - a.confidence),
  })).filter((group) => group.items.length)
})

const gapsCount = computed(() => analysis.value.ats_gaps?.length || 0)

// The click-through itself is the signal of intent to apply -- nothing is
// asked of the candidate. See useApplicationStatus's markApplied() and the
// backend route's docstring: idempotent and one-way, so clicking again
// later never regresses a status the candidate (or a later correction on
// the Candidatures page) already moved further along.
async function openExternalOffer() {
  if (offer.value?.url) window.open(offer.value.url, '_blank', 'noopener')
  const updated = await markApplied(route.params.id)
  if (updated) match.value = updated
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/dashboard" class="text-[13.5px] font-medium text-ink/60 hover:text-ink">
        {{ $t('opportunity.back') }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex flex-col items-center gap-2 py-16 text-center">
      <svg
        class="h-5 w-5 animate-spin text-brand"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p class="text-sm font-semibold text-ink">{{ $t('opportunity.loading') }}</p>
    </div>

    <UiCard v-else-if="notFound">
      <div class="py-6 text-center">
        <p class="text-base font-bold text-ink">{{ $t('opportunity.not_found_title') }}</p>
        <p class="mt-1 text-sm text-ink/60">{{ $t('opportunity.not_found_text') }}</p>
        <NuxtLink
          to="/dashboard"
          class="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          {{ $t('opportunity.back_to_dashboard') }}
        </NuxtLink>
      </div>
    </UiCard>

    <div v-else class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]">
      <!-- CENTER COLUMN -->
      <div class="flex min-w-0 flex-col gap-4">
        <!-- Header -->
        <UiCard>
          <!-- A shrink-0 sibling ("published X days ago", top-right) used to
          share this row with the title's `min-w-0 flex-1` column. A min-w-0
          flex item can always shrink instead of wrapping the row, so the
          chip kept its reserved width no matter how narrow the row got --
          this page sits in a 2-column grid past `lg`, so "narrow" isn't
          just phones, it's also the ~390px center column right after the
          grid switches to 2 columns. Rather than chase that with more
          breakpoints, the date now lives in the metadata line below with
          location/contract/salary, so the title row is just [logo, title]
          at every width and the squeeze can't recur. -->
          <div class="flex gap-4">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] text-lg font-extrabold text-white"
              :style="{
                background: avatarColor(match.company_name || offer.company_name || offer.title),
              }"
            >
              {{ initials(match.company_name || offer.company_name) }}
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-xl font-black text-ink">{{ offer.title }}</h1>
                <AppFitBadge :fit="fit" />
              </div>
              <p class="mt-0.5 text-[14.5px] font-semibold text-ink/80">
                {{ match.company_name || offer.company_name }}
              </p>

              <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink/60">
                <span v-if="offer.location">📍 {{ offer.location }}</span>
                <span v-if="offer.is_full_remote" class="font-semibold text-brand"
                  >🏠 {{ $t('opportunity.full_remote') }}</span
                >
                <span v-if="contractTag(offer.contract_type)"
                  >🗂 {{ contractTag(offer.contract_type) }}</span
                >
                <span v-if="salaryLabel">💰 {{ salaryLabel }}</span>
                <span
                  v-if="publishedLabel(offer.published_at)"
                  class="inline-flex items-center gap-0.5"
                >
                  🕓 {{ publishedLabel(offer.published_at) }}
                  <UiWarningHint
                    v-if="offer.source === 'adzuna'"
                    :message="$t('common.stale_source_warning')"
                  />
                </span>
              </div>

              <!-- break-words: same reasoning as pages/opportunites.vue's
              tag pills -- a raw, unbroken skill key from the matching
              backend can't wrap on its own and would otherwise overflow. -->
              <div v-if="headerSkillTags.shown.length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="skill in headerSkillTags.shown"
                  :key="skill"
                  class="break-words rounded-2xl bg-lav px-2.5 py-1 text-xs font-semibold text-ink/80"
                >
                  {{ skill }}
                </span>
                <span
                  v-if="headerSkillTags.extra"
                  class="rounded-2xl bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-text"
                >
                  +{{ headerSkillTags.extra }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <UiButton variant="primary" @click="openExternalOffer">
              {{ $t('opportunity.view_offer') }}
            </UiButton>
            <!-- Passive confirmation only -- no action is ever required here,
                 see openExternalOffer(). Hidden for "not_applied" since
                 there's nothing worth confirming yet. The date makes it
                 concrete (what actually happened and when) rather than just
                 the bare status label. -->
            <span
              v-if="match.application_status !== 'not_applied'"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
              :class="applicationStatusBadgeClass(match.application_status)"
            >
              {{
                applicationStatusMessage(
                  match.application_status,
                  match.application_status_updated_at
                )
              }}
            </span>
          </div>
        </UiCard>

        <!-- Mobile-only copy of the "Prêt à candidater ?" CTA (see the
             desktop original further down, in the RIGHT COLUMN, now
             lg:hidden). On desktop the two-column grid already puts that
             card beside the top of this content, visible without
             scrolling; on mobile the columns stack, so without this copy
             the CTA landed below the whole description -- reported live
             (Steve, screenshot from a WhatsApp-alert click on mobile).
             Duplicated rather than reflowed with `order` because the two
             columns are separate DOM subtrees, not siblings in one grid. -->
        <UiCard v-if="!isPending" tone="sun" class="lg:hidden">
          <h3 class="mb-2 text-[15px] font-bold text-ink">
            📝 {{ $t('opportunity.ready_title') }}
          </h3>
          <p class="mb-3.5 text-[12.5px] leading-relaxed text-ink/80">
            {{
              gapsCount
                ? $t('opportunity.ready_text', { count: gapsCount })
                : $t('opportunity.ready_text_no_gaps')
            }}
          </p>
          <UiButton
            variant="primary"
            block
            @click="router.push(`/opportunity/${route.params.id}/cv-optimise`)"
          >
            {{ $t('opportunity.adapt_cv_button') }}
          </UiButton>
        </UiCard>

        <!-- Description -- honest flat rendering of offer.description; the
             mockup's separate structured offer page isn't built (no backend
             data broken out into company/mission/profile sections). -->
        <UiCard v-if="offer.description" :title="$t('opportunity.description_title')">
          <p class="whitespace-pre-line text-[13.5px] leading-relaxed text-ink/80">
            {{ offer.description }}
          </p>
        </UiCard>

        <!-- Scores -->
        <UiCard v-if="isPending">
          <p class="text-sm font-semibold text-ink/60">
            ⏳ {{ $t('opportunity.analysis_pending') }}
          </p>
        </UiCard>
        <UiCard v-else>
          <div class="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div v-for="block in scoreBlocks" :key="block.key">
              <div class="text-[12.5px] font-semibold text-ink/60">{{ block.label }}</div>
              <div class="mb-1.5 text-2xl font-extrabold" :class="block.colorClass">
                {{ block.value }}<span class="text-xs font-medium text-ink/50">/100</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-lav">
                <div
                  class="h-full rounded-full"
                  :class="block.barClass"
                  :style="{ width: `${block.value}%` }"
                />
              </div>
            </div>
            <!-- Regret Index block removed 2026-10-03, see file header
                 comment above. -->
          </div>
        </UiCard>

        <!-- Trust / blocking banner -->
        <div
          v-if="match.blocking_message"
          class="flex items-start gap-3 rounded-xl border px-4 py-3.5"
          :class="
            hasHardBlocker
              ? 'border-warning-light bg-warning-light/60'
              : 'border-success-light bg-success-light/60'
          "
        >
          <span
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            :class="hasHardBlocker ? 'bg-warning' : 'bg-success'"
          >
            {{ hasHardBlocker ? '!' : '✓' }}
          </span>
          <div>
            <p
              class="text-sm font-bold"
              :class="hasHardBlocker ? 'text-warning' : 'text-success-text'"
            >
              {{
                hasHardBlocker
                  ? $t('opportunity.trust_warning_title')
                  : $t('opportunity.trust_ok_title')
              }}
            </p>
            <p
              class="mt-0.5 text-[12.5px] leading-relaxed"
              :class="hasHardBlocker ? 'text-warning' : 'text-success-text'"
            >
              {{ match.blocking_message }}
            </p>
          </div>
        </div>

        <!-- What the offer requires -->
        <UiCard v-if="requirementGroups.length" :title="$t('opportunity.requirements_title')">
          <div class="flex flex-col gap-4">
            <div v-for="group in requirementGroups" :key="group.label">
              <h4 class="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-ink/60">
                {{ group.label }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(item, index) in group.items"
                  :key="`${item.skill}-${index}`"
                  class="max-w-full break-words rounded-full border-2 px-3 py-1 text-xs font-bold"
                  :class="
                    item.importance === 'preferred' || item.importance === 'nice_to_have'
                      ? 'border-ink/30 bg-white text-ink/70'
                      : 'border-ink bg-lav text-ink'
                  "
                >
                  {{ item.label || item.skill }}
                </span>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Matches -->
        <UiCard v-if="matchGroups.length" :title="$t('opportunity.matches_title')">
          <p class="mb-4 text-xs italic leading-relaxed text-ink/60">
            {{ $t('opportunity.matches_note') }}
          </p>
          <div v-for="group in matchGroups" :key="group.key" class="mb-4 last:mb-0">
            <h4 class="mb-2 text-[12.5px] font-bold text-ink">
              {{ group.label }} ({{ group.items.length }})
            </h4>
            <div class="flex flex-col gap-2">
              <div
                v-for="(item, index) in group.items"
                :key="`${item.skill}-${index}`"
                class="flex items-center gap-2.5"
              >
                <span
                  class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  :class="group.style.icon"
                >
                  {{
                    group.key === 'matched' ? '✓' : group.key === 'partially_matched' ? '~' : '✕'
                  }}
                </span>
                <span
                  class="w-0 flex-1 truncate text-[12.5px] font-medium text-ink sm:w-60 sm:flex-none"
                >
                  {{ item.label || item.skill }}
                </span>
                <div class="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-lav sm:block">
                  <div
                    class="h-full rounded-full"
                    :class="group.style.bar"
                    :style="{ width: `${item.confidence}%` }"
                  />
                </div>
                <span class="w-9 shrink-0 text-right text-[11.5px] font-bold text-ink/60">
                  {{ item.confidence }}%
                </span>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Explanations -->
        <UiCard
          v-if="analysis.career_explanation?.length || analysis.ats_explanation?.length"
          :title="$t('opportunity.explanations_title')"
        >
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div v-if="analysis.career_explanation?.length">
              <h4 class="mb-2.5 text-[13px] font-bold text-ink">
                {{ $t('opportunity.explain_career_title', { score: match.career_score }) }}
              </h4>
              <ul class="flex flex-col gap-2.5">
                <li
                  v-for="(line, index) in analysis.career_explanation"
                  :key="index"
                  class="relative pl-3.5 text-[12.5px] leading-relaxed text-ink/80"
                >
                  <span class="absolute left-0 font-bold text-brand">•</span>{{ line }}
                </li>
              </ul>
            </div>
            <div v-if="analysis.ats_explanation?.length">
              <h4 class="mb-2.5 text-[13px] font-bold text-ink">
                {{ $t('opportunity.explain_ats_title', { score: match.ats_score }) }}
              </h4>
              <ul class="flex flex-col gap-2.5">
                <li
                  v-for="(line, index) in analysis.ats_explanation"
                  :key="index"
                  class="relative pl-3.5 text-[12.5px] leading-relaxed text-ink/80"
                >
                  <span class="absolute left-0 font-bold text-brand">•</span>{{ line }}
                </li>
              </ul>
            </div>
          </div>
        </UiCard>

        <!-- ATS gaps -->
        <UiCard v-if="analysis.ats_gaps?.length" :title="$t('opportunity.gaps_title')">
          <p class="mb-4 text-[12.5px] leading-relaxed text-ink/60">
            {{ $t('opportunity.gaps_intro', { count: gapsCount }) }}
          </p>
          <div class="flex flex-col gap-3">
            <div
              v-for="(gap, index) in analysis.ats_gaps"
              :key="index"
              class="rounded-2xl bg-lav/40 p-3.5"
            >
              <div class="mb-1.5 text-[13.5px] font-bold text-ink">
                {{ gap.label || gap.skill }}
              </div>
              <p v-if="gap.why_it_matters" class="mb-1 text-[12.5px] leading-relaxed text-ink/80">
                <strong class="font-bold text-ink">{{ $t('opportunity.gap_why_label') }}</strong>
                {{ gap.why_it_matters }}
              </p>
              <p v-if="gap.cv_fix_example" class="text-[12.5px] leading-relaxed text-ink/80">
                <strong class="font-bold text-ink">{{ $t('opportunity.gap_fix_label') }}</strong>
                {{ gap.cv_fix_example }}
              </p>
            </div>
          </div>
        </UiCard>

        <!-- Actions -->
        <UiCard v-if="analysis.actions?.length" :title="$t('opportunity.actions_title')">
          <div class="flex flex-col gap-3.5">
            <div
              v-for="(action, index) in analysis.actions"
              :key="index"
              class="flex items-start gap-3"
            >
              <span
                class="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-brand-light text-[11px] font-bold text-brand-dark"
              >
                {{ index + 1 }}
              </span>
              <div>
                <div class="text-[13px] font-bold text-ink">{{ action.action }}</div>
                <div v-if="action.details" class="mt-0.5 text-[12.5px] leading-relaxed text-ink/60">
                  {{ action.details }}
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex flex-col gap-4">
        <UiCard :title="$t('opportunity.details_title')" flush>
          <div class="divide-y divide-ink/10 px-5">
            <div
              v-if="contractTag(offer.contract_type)"
              class="flex items-center gap-2 py-2.5 text-[13px]"
            >
              <span class="flex-1 text-ink/60">{{ $t('opportunity.detail_contract') }}</span>
              <span class="font-bold text-ink">{{ contractTag(offer.contract_type) }}</span>
            </div>
            <div
              v-if="offer.is_full_remote || offer.location"
              class="flex items-center gap-2 py-2.5 text-[13px]"
            >
              <span class="flex-1 text-ink/60">{{ $t('opportunity.detail_remote') }}</span>
              <span class="font-bold text-ink">
                {{ offer.is_full_remote ? $t('opportunity.full_remote') : offer.location }}
              </span>
            </div>
            <div
              v-if="publishedLabel(offer.published_at)"
              class="flex items-center gap-2 py-2.5 text-[13px]"
            >
              <span class="flex-1 text-ink/60">{{ $t('opportunity.detail_published') }}</span>
              <span class="flex items-center gap-0.5 font-bold text-ink">
                {{ publishedLabel(offer.published_at) }}
                <UiWarningHint
                  v-if="offer.source === 'adzuna'"
                  :message="$t('common.stale_source_warning')"
                />
              </span>
            </div>
          </div>
        </UiCard>

        <!-- Desktop original -- see the lg:hidden mobile copy above the
             description for why this is now hidden below lg. -->
        <UiCard v-if="!isPending" tone="sun" class="hidden lg:block">
          <h3 class="mb-2 text-[15px] font-bold text-ink">
            📝 {{ $t('opportunity.ready_title') }}
          </h3>
          <p class="mb-3.5 text-[12.5px] leading-relaxed text-ink/80">
            {{
              gapsCount
                ? $t('opportunity.ready_text', { count: gapsCount })
                : $t('opportunity.ready_text_no_gaps')
            }}
          </p>
          <UiButton
            variant="primary"
            block
            @click="router.push(`/opportunity/${route.params.id}/cv-optimise`)"
          >
            {{ $t('opportunity.adapt_cv_button') }}
          </UiButton>
        </UiCard>
      </div>
    </div>
  </div>
</template>
