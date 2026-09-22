<script setup>
// "📄 Adapter mon CV pour cette offre" -- full comparison page, fidèle à la
// maquette (côte à côte, diff highlighting, impact ATS estimé, explications
// au survol). Backed by POST /matching/{id}/cv-optimization, which has
// get-or-generate semantics (the first call for a given match runs the real
// ~10-30s LLM call; every later call returns the cached result instantly)
// -- so this page always POSTs directly rather than GET-then-POST.
//
// A few things from the mockup are deliberately not reproduced, per the
// same "never show a UI element with no real backing data" policy used
// throughout this app (see pages/opportunity/[id].vue's own docstring):
//   - The mockup's view-toggle and its separate "Voir uniquement les
//     modifications" link are both dead/no-op there (a class toggle with no
//     visual effect, and a link to an unrelated page). This page builds a
//     REAL working toggle instead (see viewMode below) and drops the
//     mockup's redundant duplicate control.
//   - The "Suppressions" legend/count: this feature only rewords or adds
//     bullets, it never removes one (see the backend schema's
//     BulletStatus), so only Ajouts/Modifications are ever shown.
definePageMeta({ layout: 'app', middleware: 'auth', wide: true })

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const toast = useToast()
const onboarding = useOnboardingStore()

const loading = ref(true)
const notFound = ref(false)
const match = ref(null)
const offer = computed(() => match.value?.offer || null)
const profile = computed(() => onboarding.profile)

const optimizing = ref(false)
const generationFailed = ref(false)
const optimization = ref(null)
const confirming = ref(false)

// "sobre" (plain) or "visuelle" (Bye Bye Boss colored banner) -- see
// cv_pdf.py on the backend for what each one actually looks like. The
// candidate picks before downloading rather than the app guessing/cloning
// the style of whatever they originally uploaded (no reliable "style" to
// extract from an arbitrary PDF/DOCX anyway).
const CV_TEMPLATES = ['sobre', 'visuelle']
const selectedTemplate = ref('sobre')

async function loadMatchAndProfile() {
  try {
    const [m] = await Promise.all([
      api(`matching/${route.params.id}`),
      onboarding.profile ? Promise.resolve() : onboarding.fetchProfile(),
    ])
    match.value = m
  } catch {
    // Same anti-IDOR 404 as pages/opportunity/[id].vue -- nothing more
    // specific to show here.
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function generateOptimization() {
  optimizing.value = true
  generationFailed.value = false
  try {
    optimization.value = await api(`matching/${route.params.id}/cv-optimization`, {
      method: 'POST',
    })
  } catch {
    generationFailed.value = true
  } finally {
    optimizing.value = false
  }
}

onMounted(async () => {
  await loadMatchAndProfile()
  if (!notFound.value) await generateOptimization()
})

useHead({
  title: computed(() =>
    offer.value ? t('cvOptimize.page_title', { title: offer.value.title }) : 'Bye Bye Boss'
  ),
})

// Mirrors the backend's cv_pdf.cv_pdf_filename() slugification (NFKD
// normalize, strip accents, non-alphanumeric -> underscore) so the
// downloaded file gets a sensible name without a round-trip just to read
// the Content-Disposition header off a blob response.
function cvPdfFilename() {
  const name = [profile.value?.first_name, profile.value?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `CV_${slug || 'Candidat'}.pdf`
}

const downloadingPdf = ref(false)
async function downloadCvPdf() {
  downloadingPdf.value = true
  try {
    const blob = await api(`matching/${route.params.id}/cv-optimization/pdf`, {
      query: { template: selectedTemplate.value },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = cvPdfFilename()
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    toast.error(err?.message || t('cvOptimize.pdf_download_error'))
    return false
  } finally {
    downloadingPdf.value = false
  }
}

// "Créer cette variante de CV" -- records the confirmation AND downloads
// the PDF from the same click (see download_cv_optimization_pdf's
// docstring on the backend). If the confirm call itself fails, the PDF
// download is skipped -- no point downloading a file for a choice that
// wasn't actually saved.
async function confirmVariant() {
  confirming.value = true
  try {
    optimization.value = await api(`matching/${route.params.id}/cv-optimization/confirm`, {
      method: 'POST',
    })
    toast.success(t('cvOptimize.confirm_success'))
  } catch (err) {
    toast.error(err?.message || t('cvOptimize.confirm_error'))
    confirming.value = false
    return
  }
  confirming.value = false
  // Confirmation is saved either way at this point -- a failed download
  // here (network hiccup, etc.) gets its own toast from downloadCvPdf and
  // the "download again" button on the confirmed state below covers it.
  await downloadCvPdf()
}

// side_by_side | changes_only -- a real, working toggle (see docstring
// above), unlike the mockup's dead one.
const viewMode = ref('side_by_side')

function bulletClass(status) {
  if (status === 'added') return 'bg-success-light text-success-text'
  if (status === 'modified') return 'bg-warning-light text-warning'
  return 'text-gray-700'
}

// Pairs profile.experiences[i] with optimization.experiences[i] -- the
// backend guarantees identical count/order (see the service's
// _reconcile_experiences docstring), so a positional zip is always safe.
const experiencePairs = computed(() => {
  const originals = profile.value?.experiences || []
  const optimized = optimization.value?.experiences || []
  return optimized.map((exp, index) => ({
    original: originals[index] || null,
    optimized: exp,
    // "CV actuel" bullets are derived from the optimized side's own bullets
    // (original_text when the model reworded one, text otherwise) rather
    // than re-splitting the raw description, so the two columns always
    // line up bullet-for-bullet. "added" bullets have no original.
    originalBullets: exp.bullets
      .filter((b) => b.status !== 'added')
      .map((b) => b.original_text ?? b.text),
    changedBullets: exp.bullets.filter((b) => b.status !== 'unchanged'),
  }))
})
const experiencesHaveChanges = computed(() =>
  experiencePairs.value.some((pair) => pair.changedBullets.length)
)

const skillPairs = computed(() => optimization.value?.skills || [])
const addedSkills = computed(() => skillPairs.value.filter((s) => s.added))

const modificationCounts = computed(() => {
  let additions = 0
  let modifications = 0
  for (const exp of optimization.value?.experiences || []) {
    for (const bullet of exp.bullets) {
      if (bullet.status === 'added') additions += 1
      else if (bullet.status === 'modified') modifications += 1
    }
  }
  additions += addedSkills.value.length
  return { additions, modifications }
})

const headlineChanged = computed(
  () =>
    !!optimization.value &&
    (optimization.value.headline || '').trim() !== (profile.value?.headline || '').trim()
)
const summaryChanged = computed(
  () =>
    !!optimization.value &&
    (optimization.value.summary || '').trim() !== (profile.value?.professional_summary || '').trim()
)
const hasAnyChanges = computed(
  () =>
    headlineChanged.value ||
    summaryChanged.value ||
    experiencesHaveChanges.value ||
    addedSkills.value.length > 0
)

const atsDelta = computed(() =>
  optimization.value ? optimization.value.ats_score_after - optimization.value.ats_score_before : 0
)
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink
        :to="`/opportunity/${route.params.id}`"
        class="text-[13.5px] font-medium text-gray-500 hover:text-navy"
      >
        {{ $t('cvOptimize.back') }}
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
      <p class="text-sm font-semibold text-navy">{{ $t('cvOptimize.loading') }}</p>
    </div>

    <UiCard v-else-if="notFound">
      <div class="py-6 text-center">
        <p class="text-base font-bold text-navy">{{ $t('opportunity.not_found_title') }}</p>
        <p class="mt-1 text-sm text-gray-500">{{ $t('opportunity.not_found_text') }}</p>
        <NuxtLink
          to="/dashboard"
          class="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          {{ $t('opportunity.back_to_dashboard') }}
        </NuxtLink>
      </div>
    </UiCard>

    <div v-else class="flex flex-col gap-4">
      <UiCard>
        <h1 class="text-lg font-extrabold text-navy">{{ offer.title }}</h1>
        <p class="mt-0.5 text-[13px] font-semibold text-gray-600">
          {{ match.company_name || offer.company_name }}
        </p>
      </UiCard>

      <CvOptimizingProgress v-if="optimizing" />

      <UiCard v-else-if="generationFailed">
        <div class="py-6 text-center">
          <p class="text-base font-bold text-navy">{{ $t('cvOptimize.error_title') }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ $t('cvOptimize.error_text') }}</p>
          <UiButton class="mt-4" variant="primary" @click="generateOptimization">
            {{ $t('cvOptimize.retry_button') }}
          </UiButton>
        </div>
      </UiCard>

      <div
        v-else-if="optimization"
        class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]"
      >
        <!-- CENTER COLUMN -->
        <div class="flex min-w-0 flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-base font-bold text-navy">{{ $t('cvOptimize.comparison_title') }}</h2>
            <div
              class="flex rounded-lg border border-gray-200 bg-white p-0.5 text-[12.5px] font-semibold"
            >
              <button
                type="button"
                class="rounded-md px-3 py-1.5 transition-colors"
                :class="
                  viewMode === 'side_by_side'
                    ? 'bg-brand text-white'
                    : 'text-gray-500 hover:text-navy'
                "
                @click="viewMode = 'side_by_side'"
              >
                {{ $t('cvOptimize.view_side_by_side') }}
              </button>
              <button
                type="button"
                class="rounded-md px-3 py-1.5 transition-colors"
                :class="
                  viewMode === 'changes_only'
                    ? 'bg-brand text-white'
                    : 'text-gray-500 hover:text-navy'
                "
                @click="viewMode = 'changes_only'"
              >
                {{ $t('cvOptimize.view_changes_only') }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-4 text-[11.5px] text-gray-500">
            <span class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              {{ $t('cvOptimize.legend_added') }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              {{ $t('cvOptimize.legend_modified') }}
            </span>
          </div>

          <UiCard
            v-if="viewMode === 'side_by_side' || headlineChanged"
            :title="$t('cvOptimize.headline_title')"
          >
            <div
              class="grid grid-cols-1 gap-4"
              :class="viewMode === 'side_by_side' ? 'sm:grid-cols-2' : ''"
            >
              <div v-if="viewMode === 'side_by_side'">
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.current_cv_label') }}
                </p>
                <p class="text-[13px] text-gray-500">{{ profile?.headline || '—' }}</p>
              </div>
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.optimized_cv_label') }}
                </p>
                <p
                  class="rounded px-2 py-1 text-[13px] font-semibold"
                  :class="headlineChanged ? 'bg-success-light text-success-text' : 'text-navy'"
                >
                  {{ optimization.headline || profile?.headline || '—' }}
                </p>
              </div>
            </div>
          </UiCard>

          <UiCard
            v-if="viewMode === 'side_by_side' || summaryChanged"
            :title="$t('cvOptimize.summary_title')"
          >
            <div
              class="grid grid-cols-1 gap-4"
              :class="viewMode === 'side_by_side' ? 'sm:grid-cols-2' : ''"
            >
              <div v-if="viewMode === 'side_by_side'">
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.current_cv_label') }}
                </p>
                <p class="text-[12.5px] leading-relaxed text-gray-500">
                  {{ profile?.professional_summary || '—' }}
                </p>
              </div>
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.optimized_cv_label') }}
                </p>
                <div
                  class="flex items-start gap-1.5 rounded px-2 py-1"
                  :class="summaryChanged ? 'bg-success-light' : ''"
                >
                  <p
                    class="flex-1 text-[12.5px] leading-relaxed"
                    :class="summaryChanged ? 'text-success-text' : 'text-navy'"
                  >
                    {{ optimization.summary || profile?.professional_summary || '—' }}
                  </p>
                  <CvBulletWhyHint
                    v-if="summaryChanged && optimization.summary_why"
                    :message="optimization.summary_why"
                  />
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard
            v-if="viewMode === 'side_by_side' || experiencesHaveChanges"
            :title="$t('cvOptimize.experiences_title')"
          >
            <div class="flex flex-col divide-y divide-gray-100">
              <div
                v-for="(pair, index) in experiencePairs"
                v-show="viewMode === 'side_by_side' || pair.changedBullets.length"
                :key="index"
                class="py-4 first:pt-0 last:pb-0"
              >
                <div
                  class="grid grid-cols-1 gap-4"
                  :class="viewMode === 'side_by_side' ? 'sm:grid-cols-2' : ''"
                >
                  <div v-if="viewMode === 'side_by_side'">
                    <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      {{ $t('cvOptimize.current_cv_label') }}
                    </p>
                    <h4 class="text-[13px] font-bold text-navy">{{ pair.original?.title }}</h4>
                    <p class="text-[11.5px] text-gray-500">
                      {{ pair.original?.company }} · {{ pair.original?.period }}
                    </p>
                    <ul class="mt-2 space-y-1.5">
                      <li
                        v-for="(bullet, bulletIndex) in pair.originalBullets"
                        :key="bulletIndex"
                        class="text-[12.5px] leading-relaxed text-gray-600"
                      >
                        • {{ bullet }}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      {{ $t('cvOptimize.optimized_cv_label') }}
                    </p>
                    <h4 class="text-[13px] font-bold text-navy">{{ pair.optimized.title }}</h4>
                    <p class="text-[11.5px] text-gray-500">
                      {{ pair.optimized.company }} · {{ pair.optimized.period }}
                    </p>
                    <ul class="mt-2 space-y-1.5">
                      <li
                        v-for="(bullet, bulletIndex) in viewMode === 'side_by_side'
                          ? pair.optimized.bullets
                          : pair.changedBullets"
                        :key="bulletIndex"
                        class="flex items-start gap-1.5 rounded px-1.5 py-0.5 text-[12.5px] leading-relaxed"
                        :class="bulletClass(bullet.status)"
                      >
                        <span class="flex-1">{{ bullet.text }}</span>
                        <CvBulletWhyHint v-if="bullet.why" :message="bullet.why" />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard
            v-if="viewMode === 'side_by_side' || addedSkills.length"
            :title="$t('cvOptimize.skills_title')"
          >
            <div
              class="grid grid-cols-1 gap-4"
              :class="viewMode === 'side_by_side' ? 'sm:grid-cols-2' : ''"
            >
              <div v-if="viewMode === 'side_by_side'">
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.current_cv_label') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in profile?.skills || []"
                    :key="skill"
                    class="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {{ $t('cvOptimize.optimized_cv_label') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="item in viewMode === 'side_by_side' ? skillPairs : addedSkills"
                    :key="item.skill"
                    class="rounded-lg px-2.5 py-1 text-xs font-semibold"
                    :class="
                      item.added
                        ? 'bg-success-light text-success-text'
                        : 'bg-gray-100 text-gray-700'
                    "
                  >
                    {{ item.skill }}
                  </span>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard v-if="viewMode === 'changes_only' && !hasAnyChanges">
            <div class="py-6 text-center">
              <p class="text-base font-bold text-navy">
                {{ $t('cvOptimize.empty_changes_title') }}
              </p>
              <p class="mt-1 text-sm text-gray-500">{{ $t('cvOptimize.empty_changes_text') }}</p>
            </div>
          </UiCard>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex flex-col gap-4">
          <UiCard :title="$t('cvOptimize.impact_title')">
            <div class="flex items-center justify-center gap-4">
              <div class="text-center">
                <div class="text-[11px] font-semibold text-gray-500">
                  {{ $t('cvOptimize.impact_before') }}
                </div>
                <div class="text-2xl font-extrabold text-gray-400">
                  {{ optimization.ats_score_before }}
                </div>
              </div>
              <div class="text-xl text-brand" aria-hidden="true">→</div>
              <div class="text-center">
                <div class="text-[11px] font-semibold text-gray-500">
                  {{ $t('cvOptimize.impact_after') }}
                </div>
                <div class="text-2xl font-extrabold text-brand">
                  {{ optimization.ats_score_after }}
                </div>
              </div>
            </div>
            <p
              class="mt-3 text-center text-[12.5px] font-semibold"
              :class="atsDelta > 0 ? 'text-success-text' : 'text-gray-500'"
            >
              {{
                atsDelta > 0
                  ? $t('cvOptimize.impact_gain', { delta: atsDelta })
                  : $t('cvOptimize.impact_none')
              }}
            </p>
          </UiCard>

          <UiCard :title="$t('cvOptimize.changes_title')">
            <div class="flex flex-col gap-2 text-[13px]">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
                <span class="flex-1 text-gray-700">{{ $t('cvOptimize.changes_additions') }}</span>
                <span class="font-bold text-navy">{{ modificationCounts.additions }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" />
                <span class="flex-1 text-gray-700">{{
                  $t('cvOptimize.changes_modifications')
                }}</span>
                <span class="font-bold text-navy">{{ modificationCounts.modifications }}</span>
              </div>
            </div>
          </UiCard>

          <UiCard v-if="optimization.advice" class="bg-brand-light">
            <h3 class="mb-1.5 text-sm font-bold text-navy">
              💡 {{ $t('cvOptimize.advice_title') }}
            </h3>
            <p class="text-[12.5px] leading-relaxed text-gray-700">{{ optimization.advice }}</p>
          </UiCard>

          <UiCard :title="$t('cvOptimize.template_label')">
            <div class="flex flex-col gap-2 sm:flex-row">
              <button
                v-for="tpl in CV_TEMPLATES"
                :key="tpl"
                type="button"
                class="flex-1 rounded-lg border p-2.5 text-left transition-colors"
                :class="
                  selectedTemplate === tpl
                    ? 'border-brand bg-brand-light'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                "
                @click="selectedTemplate = tpl"
              >
                <p
                  class="text-[13px] font-bold"
                  :class="selectedTemplate === tpl ? 'text-brand' : 'text-navy'"
                >
                  {{ $t(`cvOptimize.template_${tpl}`) }}
                </p>
                <p class="mt-0.5 text-[11.5px] text-gray-500">
                  {{ $t(`cvOptimize.template_${tpl}_desc`) }}
                </p>
              </button>
            </div>
          </UiCard>

          <UiCard>
            <template v-if="optimization.confirmed_at">
              <p class="flex items-center gap-2 text-[13px] font-bold text-success-text">
                <span aria-hidden="true">✓</span> {{ $t('cvOptimize.confirmed') }}
              </p>
              <UiButton
                class="mt-3"
                variant="secondary"
                block
                :loading="downloadingPdf"
                @click="downloadCvPdf"
              >
                {{ $t('cvOptimize.download_again_button') }}
              </UiButton>
            </template>
            <template v-else>
              <UiButton
                variant="primary"
                block
                :loading="confirming || downloadingPdf"
                @click="confirmVariant"
              >
                {{ $t('cvOptimize.confirm_button') }}
              </UiButton>
              <p class="mt-2 text-[11px] leading-relaxed text-gray-400">
                {{ $t('cvOptimize.confirm_note') }}
              </p>
            </template>
          </UiCard>
        </div>
      </div>
    </div>
  </div>
</template>
