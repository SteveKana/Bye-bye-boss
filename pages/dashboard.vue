<script setup>
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.dashboard')} · Bye Bye Boss`) })

const toast = useToast()
const { firstName } = useUserDisplay()
const onboarding = useOnboardingStore()

const CONTRACT_OPTIONS = ['CDI', 'Freelance', 'CDD', 'Intérim'].map((v) => ({
  value: v,
  label: t(`onboarding.contract_types.${v}`),
}))
const REMOTE_OPTIONS = ['Sur site', 'Hybride', 'Full remote'].map((v) => ({
  value: v,
  label: t(`onboarding.remote_options.${v}`),
}))
const MOBILITY_OPTIONS = ['France entière', 'Région uniquement', 'Ville uniquement'].map((v) => ({
  value: v,
  label: t(`onboarding.mobility_options.${v}`),
}))

// Static demo data (the matching engine is not built yet — Phase 1 shows the
// shell with placeholder offers). Full class names so Tailwind keeps them.
const scoreColors = {
  ats: 'text-green-600',
  career: 'text-blue-600',
  potential: 'text-brand',
  regret: 'text-amber-600',
}
const scoreLabels = { ats: 'ATS', career: 'Career', potential: 'Potential', regret: 'Regret' }

// Real search criteria, pulled from the profile saved at the end of
// onboarding. Empty until the profile has loaded.
const criteria = ref([])

function refreshCriteria(profile) {
  const salary = profile.salary_target
    ? `${profile.salary_target.toLocaleString('fr-FR')} € brut / an`
    : null
  criteria.value = [
    ...(profile.contract_types || []),
    ...(profile.remote_preferences || []),
    profile.mobility,
    salary,
  ].filter(Boolean)
}

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    refreshCriteria(profile)
  } catch {
    // No profile yet (onboarding not completed) — leave the criteria bar empty
    // rather than showing anything misleading.
  }
})

// Inline preferences editor -- replaces the old "coming soon" placeholder.
// Editing happens right here in the dashboard rather than by leaving to a
// separate /preferences page: same fields as the onboarding wizard's step 3,
// reused via the same OnboardingChoiceGroup + salary input, wired to
// onboarding.updatePreferences().
const editingPreferences = ref(false)
const savingPreferences = ref(false)
const editContractTypes = ref([])
const editRemotePreferences = ref([])
const editMobility = ref('France entière')
const editSalaryTarget = ref(null)

function openPreferencesEditor() {
  const profile = onboarding.profile
  editContractTypes.value = profile?.contract_types?.length ? [...profile.contract_types] : []
  editRemotePreferences.value = profile?.remote_preferences?.length
    ? [...profile.remote_preferences]
    : []
  editMobility.value = profile?.mobility || 'France entière'
  editSalaryTarget.value = profile?.salary_target ?? null
  editingPreferences.value = true
}

function cancelPreferencesEditor() {
  editingPreferences.value = false
}

async function savePreferences() {
  if (
    !editContractTypes.value.length ||
    !editRemotePreferences.value.length ||
    !editMobility.value
  ) {
    toast.error(t('dashboard.error_required'))
    return
  }
  savingPreferences.value = true
  try {
    const profile = await onboarding.updatePreferences({
      contract_types: editContractTypes.value,
      remote_preferences: editRemotePreferences.value,
      mobility: editMobility.value,
      salary_target: editSalaryTarget.value || null,
    })
    refreshCriteria(profile)
    toast.success(t('dashboard.saved'))
    editingPreferences.value = false
  } catch (err) {
    toast.error(err?.message || t('dashboard.error_generic'))
  } finally {
    savingPreferences.value = false
  }
}

// The matching engine isn't wired in yet, so there are no real offers to
// show — an honest empty state beats fabricated placeholder listings.
const offers = ref([])

// Reject with a short undo window — mirrors the spec (a real reject is permanent).
function reject(offer) {
  const index = offers.value.findIndex((o) => o.id === offer.id)
  if (index === -1) return
  offers.value.splice(index, 1)
  toast.show({
    message: t('dashboard.offer_hidden'),
    variant: 'info',
    duration: 5000,
    undo: () => offers.value.splice(index, 0, offer),
    undoLabel: t('common.undo'),
  })
}

const soon = () => toast.info(t('app.soon_full'))

// Each offer row links to the opportunity detail — a later phase, so for now
// clicking (or activating with the keyboard) shows a generic "coming soon".
const openOffer = () => toast.info(t('app.soon_full'))
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

    <!-- Search criteria, from the saved preferences -->
    <div
      v-if="criteria.length && !editingPreferences"
      class="mb-6 flex flex-wrap items-center gap-2 text-sm"
    >
      <span class="font-semibold text-gray-500">{{ $t('dashboard.your_search') }}</span>
      <span
        v-for="c in criteria"
        :key="c"
        class="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-gray-700 shadow-soft"
      >
        {{ c }}
      </span>
      <button class="font-semibold text-brand hover:underline" @click="openPreferencesEditor">
        {{ $t('dashboard.edit') }} →
      </button>
    </div>

    <!-- Inline "Préférences" editor -- same fields as onboarding's step 3,
         edited in place instead of navigating away to /preferences. -->
    <UiCard v-if="editingPreferences" class="mb-6" :title="$t('dashboard.edit_preferences_title')">
      <div class="mb-5">
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ $t('onboarding.preferences.contract_type_title') }}
        </h3>
        <OnboardingChoiceGroup
          v-model="editContractTypes"
          :options="CONTRACT_OPTIONS"
          multiple
          :columns="4"
        />
        <p class="mt-2 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
      </div>

      <div class="mb-5">
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ $t('onboarding.preferences.remote_title') }}
        </h3>
        <OnboardingChoiceGroup
          v-model="editRemotePreferences"
          :options="REMOTE_OPTIONS"
          multiple
          :columns="3"
        />
        <p class="mt-2 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
      </div>

      <div class="mb-5">
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ $t('onboarding.preferences.mobility_title') }}
        </h3>
        <OnboardingChoiceGroup v-model="editMobility" :options="MOBILITY_OPTIONS" :columns="3" />
        <p class="mt-2 text-xs text-gray-400">{{ $t('onboarding.preferences.single_choice') }}</p>
      </div>

      <div class="mb-6">
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ $t('onboarding.preferences.salary_title') }}
        </h3>
        <div class="relative max-w-xs">
          <input
            v-model.number="editSalaryTarget"
            type="number"
            min="0"
            step="1000"
            :placeholder="$t('onboarding.preferences.salary_placeholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-28 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand focus:shadow-focus-ring"
          />
          <span
            class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
          >
            {{ $t('onboarding.preferences.salary_suffix') }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UiButton
          variant="secondary"
          type="button"
          :disabled="savingPreferences"
          @click="cancelPreferencesEditor"
        >
          {{ $t('dashboard.cancel') }}
        </UiButton>
        <UiButton
          variant="primary"
          type="button"
          :loading="savingPreferences"
          @click="savePreferences"
        >
          {{ $t('dashboard.save') }}
        </UiButton>
      </div>
    </UiCard>

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
            </div>
            <span
              class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              :class="
                offer.strong ? 'bg-success-light text-success-text' : 'bg-amber-100 text-amber-700'
              "
            >
              {{ offer.strong ? $t('dashboard.fit_strong') : $t('dashboard.fit_good') }}
            </span>
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

      <p v-if="!offers.length" class="py-6 text-center text-sm text-gray-400">
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
