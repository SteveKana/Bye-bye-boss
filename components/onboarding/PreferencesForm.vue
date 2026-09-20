<script setup>
// The preferences form (contract type, remote, mobility, salary target,
// optional TJM for freelance work) -- shared between the onboarding wizard's
// step 3 and the standalone /preferences page reached from the sidebar, so
// the two never drift the way the CV form used to before it was extracted
// into ProfileCvFieldsForm.
//
// Owns its own reactive state and exposes { form, applyProfile, isValid } --
// callers do `formRef.applyProfile(profile)` on load, check
// `formRef.isValid()` before saving, and read `formRef.form` (its keys
// already match the API payload) to build the update request.
const props = defineProps({
  // The candidate's home city (profile.location). Used only to make the
  // mobility options concrete -- e.g. "Lyon uniquement" instead of a bare
  // "Ville uniquement" that never says which city it means. Falls back to
  // the generic wording when no location is set yet.
  location: { type: String, default: '' },
  // The two pages wrap this component in visually different containers: the
  // wizard's plain bordered box has no padding of its own, while the
  // dedicated page's UiCard already pads its body. `padded` adds the
  // horizontal padding each section needs only in the former case.
  padded: { type: Boolean, default: false },
})

const { t } = useI18n()

const CONTRACT_OPTIONS = ['CDI', 'Freelance', 'CDD', 'Intérim'].map((v) => ({
  value: v,
  label: t(`onboarding.contract_types.${v}`),
}))
const REMOTE_OPTIONS = ['Sur site', 'Hybride', 'Full remote'].map((v) => ({
  value: v,
  label: t(`onboarding.remote_options.${v}`),
}))

const MOBILITY_OPTIONS = computed(() => [
  { value: 'France entière', label: t('onboarding.mobility_options.France entière') },
  // No city-based guessing here (unlike "Ville uniquement" below) -- which
  // French région this covers is picked explicitly from MOBILITY_REGIONS
  // once this option is selected (see the conditional UiSelect in the
  // template), never inferred from the free-text `location` extracted off
  // the CV, which has no guaranteed format to parse a région out of.
  { value: 'Région uniquement', label: t('onboarding.mobility_options.Région uniquement') },
  {
    value: 'Ville uniquement',
    label: props.location
      ? t('onboarding.preferences.mobility_city_named', { city: props.location })
      : t('onboarding.mobility_options.Ville uniquement'),
  },
])

// The 18 French régions (13 metropolitan + 5 overseas) -- must match the
// backend's MobilityRegion literal (app/modules/cv/schemas.py) exactly.
const MOBILITY_REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
  'Guadeloupe',
  'Martinique',
  'Guyane',
  'La Réunion',
  'Mayotte',
].map((v) => ({ value: v, label: t(`onboarding.mobility_regions.${v}`) }))

const form = reactive({
  contract_types: [],
  remote_preferences: [],
  mobility: 'France entière',
  mobility_region: null,
  salary_target: null,
  daily_rate: null,
})

// TJM only makes sense for freelance work, so it stays out of the way
// otherwise instead of sitting there unused next to the annual salary.
const showDailyRate = computed(() => form.contract_types.includes('Freelance'))

// Cleared whenever "Région uniquement" isn't the active choice, so a stale
// région from an earlier selection never lingers and gets silently
// resubmitted once the field is hidden again.
watch(
  () => form.mobility,
  (value) => {
    if (value !== 'Région uniquement') form.mobility_region = null
  }
)

function applyProfile(profile) {
  form.contract_types = profile.contract_types?.length ? [...profile.contract_types] : []
  form.remote_preferences = profile.remote_preferences?.length
    ? [...profile.remote_preferences]
    : []
  form.mobility = profile.mobility || 'France entière'
  form.mobility_region = profile.mobility_region || null
  form.salary_target = profile.salary_target ?? null
  form.daily_rate = profile.daily_rate ?? null
}

function isValid() {
  return !!(form.contract_types.length && form.remote_preferences.length && form.mobility)
}

defineExpose({ form, applyProfile, isValid })
</script>

<template>
  <div>
    <div :class="['border-b border-gray-100 pb-6', padded && 'px-6 pt-6']">
      <h3 class="text-base font-semibold text-gray-900">
        {{ $t('onboarding.preferences.contract_type_title') }}
      </h3>
      <p class="mt-0.5 text-sm text-gray-500">
        {{ $t('onboarding.preferences.contract_type_subtitle') }}
      </p>
      <div class="mt-4">
        <OnboardingChoiceGroup
          v-model="form.contract_types"
          :options="CONTRACT_OPTIONS"
          multiple
          :columns="4"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
    </div>

    <div :class="['border-b border-gray-100 py-6', padded && 'px-6']">
      <h3 class="text-base font-semibold text-gray-900">
        {{ $t('onboarding.preferences.remote_title') }}
      </h3>
      <p class="mt-0.5 text-sm text-gray-500">
        {{ $t('onboarding.preferences.remote_subtitle') }}
      </p>
      <div class="mt-4">
        <OnboardingChoiceGroup
          v-model="form.remote_preferences"
          :options="REMOTE_OPTIONS"
          multiple
          :columns="3"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
    </div>

    <div :class="['border-b border-gray-100 py-6', padded && 'px-6']">
      <h3 class="text-base font-semibold text-gray-900">
        {{ $t('onboarding.preferences.mobility_title') }}
      </h3>
      <p class="mt-0.5 text-sm text-gray-500">
        {{ $t('onboarding.preferences.mobility_subtitle') }}
      </p>
      <div class="mt-4">
        <OnboardingChoiceGroup v-model="form.mobility" :options="MOBILITY_OPTIONS" :columns="3" />
      </div>
      <div v-if="form.mobility === 'Région uniquement'" class="mt-4 max-w-xs">
        <UiSelect
          v-model="form.mobility_region"
          :options="MOBILITY_REGIONS"
          :placeholder="$t('onboarding.preferences.mobility_region_placeholder')"
        />
      </div>
      <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.single_choice') }}</p>
      <p v-if="!location" class="mt-1 text-xs text-gray-400">
        {{ $t('onboarding.preferences.mobility_hint_no_location') }}
      </p>
    </div>

    <div
      :class="[
        showDailyRate ? 'border-b border-gray-100 py-6' : 'pt-6',
        padded && 'px-6',
        !showDailyRate && padded && 'pb-6',
      ]"
    >
      <h3 class="text-base font-semibold text-gray-900">
        {{ $t('onboarding.preferences.salary_title') }}
      </h3>
      <p class="mt-0.5 text-sm text-gray-500">
        {{ $t('onboarding.preferences.salary_subtitle') }}
      </p>
      <div class="relative mt-4 max-w-xs">
        <input
          v-model.number="form.salary_target"
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
      <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.salary_hint') }}</p>
    </div>

    <div v-if="showDailyRate" :class="['pt-6', padded && 'px-6 pb-6']">
      <h3 class="text-base font-semibold text-gray-900">
        {{ $t('onboarding.preferences.daily_rate_title') }}
      </h3>
      <p class="mt-0.5 text-sm text-gray-500">
        {{ $t('onboarding.preferences.daily_rate_subtitle') }}
      </p>
      <div class="relative mt-4 max-w-xs">
        <input
          v-model.number="form.daily_rate"
          type="number"
          min="0"
          step="50"
          :placeholder="$t('onboarding.preferences.daily_rate_placeholder')"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-20 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand focus:shadow-focus-ring"
        />
        <span
          class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
        >
          {{ $t('onboarding.preferences.daily_rate_suffix') }}
        </span>
      </div>
    </div>
  </div>
</template>
