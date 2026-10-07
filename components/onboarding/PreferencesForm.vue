<script setup>
// Search preferences form, shared by the onboarding step 3 ("Zone & contrat",
// `full` off) and the Préférences page (`full` on: adds work type and
// salary). Same idea as ProfileCvFieldsForm: it owns its state and exposes
// { payload, applyProfile, isValid } -- `payload()` is already the body of
// PUT /cv/profile/preferences.
//
// Nothing ticked means "no restriction" for contract and work type; the zone
// is either "France entière" or a list of régions.
defineProps({
  // The Préférences page also asks for work type and salary.
  full: { type: Boolean, default: false },
  // Horizontal padding, for the onboarding's plain bordered box.
  padded: { type: Boolean, default: false },
})

const { t } = useI18n()

const ZONE_OPTIONS = computed(() => [
  { value: 'all', label: t('preferencesForm.zone_all') },
  { value: 'some', label: t('preferencesForm.zone_some') },
])
const REGION_OPTIONS = computed(() =>
  REGION_CHOICES.map((value) => ({
    value,
    label: value === OVERSEAS_CHOICE ? t('searchFilters.overseas') : value,
  }))
)
const CONTRACT_OPTIONS = computed(() =>
  CONTRACT_CHOICES.map((value) => ({ value, label: t(`searchFilters.contracts.${value}`) }))
)
const REMOTE_OPTIONS = computed(() =>
  REMOTE_CHOICES.map((value) => ({ value, label: t(`searchFilters.remotes.${value}`) }))
)

const zone = ref('all')
const regionChoices = ref([])
const includeUnknownRegion = ref(true)
const contractTypes = ref([])
const remotePreferences = ref([])
const salaryTarget = ref(null)
const dailyRate = ref(null)

// The TJM only makes sense for freelance work.
const showDailyRate = computed(() => contractTypes.value.includes('Freelance'))

function applyProfile(profile) {
  const regions = choicesFromRegions(profile.mobility_regions)
  zone.value = regions.length ? 'some' : 'all'
  regionChoices.value = regions
  includeUnknownRegion.value = profile.include_unknown_region !== false
  contractTypes.value = [...(profile.contract_types || [])]
  remotePreferences.value = [...(profile.remote_preferences || [])]
  salaryTarget.value = profile.salary_target ?? null
  dailyRate.value = profile.daily_rate ?? null
}

function isValid() {
  return zone.value === 'all' || regionChoices.value.length > 0
}

function payload() {
  const some = zone.value === 'some'
  const toNumber = (v) => (v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
  return {
    mobility_regions: some ? regionsFromChoices(regionChoices.value) : [],
    include_unknown_region: includeUnknownRegion.value,
    contract_types: [...contractTypes.value],
    remote_preferences: [...remotePreferences.value],
    salary_target: toNumber(salaryTarget.value),
    daily_rate: showDailyRate.value ? toNumber(dailyRate.value) : null,
  }
}

defineExpose({ payload, applyProfile, isValid })

const inputClass =
  'w-full rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink/80 outline-none placeholder:text-ink/50 focus:border-brand focus:shadow-focus-ring'
</script>

<template>
  <div>
    <!-- Zone -->
    <section :class="['border-b border-ink/15 pb-6', padded ? 'px-6 pt-6' : '']">
      <h3 class="text-base font-bold text-ink">{{ $t('preferencesForm.zone_title') }}</h3>
      <p class="mt-0.5 text-sm text-ink/60">{{ $t('preferencesForm.zone_subtitle') }}</p>
      <div class="mt-4">
        <OnboardingChoiceGroup v-model="zone" :options="ZONE_OPTIONS" :columns="2" />
      </div>

      <div v-if="zone === 'some'" class="mt-5">
        <div class="mb-2 flex items-center justify-between gap-3">
          <h4 class="text-sm font-bold text-ink">{{ $t('preferencesForm.regions_title') }}</h4>
          <span class="text-xs font-semibold text-ink/50">
            {{ $t('preferencesForm.regions_count', { count: regionChoices.length }) }}
          </span>
        </div>
        <OnboardingChoiceGroup
          v-model="regionChoices"
          :options="REGION_OPTIONS"
          multiple
          :columns="3"
          :mobile-columns="1"
        />
        <p class="mt-3 text-xs text-ink/50">{{ $t('preferencesForm.regions_hint') }}</p>

        <div class="mt-4 rounded-2xl border-2 border-ink/20 bg-lav/40 px-4 py-3">
          <UiCheckbox
            v-model="includeUnknownRegion"
            :label="$t('preferencesForm.unknown_region')"
          />
          <p class="mt-1 pl-7 text-xs text-ink/55">
            {{ $t('preferencesForm.unknown_region_hint') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Contract -->
    <section :class="['py-6', full ? 'border-b border-ink/15' : '', padded ? 'px-6' : '']">
      <h3 class="text-base font-bold text-ink">{{ $t('preferencesForm.contract_title') }}</h3>
      <p class="mt-0.5 text-sm text-ink/60">{{ $t('preferencesForm.contract_subtitle') }}</p>
      <div class="mt-4">
        <OnboardingChoiceGroup
          v-model="contractTypes"
          :options="CONTRACT_OPTIONS"
          multiple
          :columns="3"
          :mobile-columns="2"
        />
      </div>
      <p v-if="full" class="mt-3 text-xs text-ink/50">
        {{ $t('preferencesForm.contract_hint') }}
      </p>
    </section>

    <template v-if="full">
      <!-- Work type -->
      <section :class="['border-b border-ink/15 py-6', padded ? 'px-6' : '']">
        <h3 class="text-base font-bold text-ink">{{ $t('preferencesForm.remote_title') }}</h3>
        <p class="mt-0.5 text-sm text-ink/60">{{ $t('preferencesForm.remote_subtitle') }}</p>
        <div class="mt-4">
          <OnboardingChoiceGroup
            v-model="remotePreferences"
            :options="REMOTE_OPTIONS"
            multiple
            :columns="3"
            :mobile-columns="1"
          />
        </div>
        <p class="mt-3 text-xs text-ink/50">{{ $t('preferencesForm.remote_hint') }}</p>
      </section>

      <!-- Salary -->
      <section :class="['py-6', padded ? 'px-6' : '']">
        <h3 class="text-base font-bold text-ink">{{ $t('preferencesForm.salary_title') }}</h3>
        <p class="mt-0.5 text-sm text-ink/60">{{ $t('preferencesForm.salary_subtitle') }}</p>
        <div class="mt-4 flex flex-wrap gap-4">
          <div class="relative w-full max-w-xs">
            <input
              v-model.number="salaryTarget"
              type="number"
              min="0"
              step="1000"
              :placeholder="$t('preferencesForm.salary_placeholder')"
              :class="[inputClass, 'pr-24']"
            />
            <span
              class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/50"
            >
              {{ $t('preferencesForm.salary_suffix') }}
            </span>
          </div>
          <div v-if="showDailyRate" class="relative w-full max-w-xs">
            <input
              v-model.number="dailyRate"
              type="number"
              min="0"
              step="50"
              :placeholder="$t('preferencesForm.daily_rate_placeholder')"
              :class="[inputClass, 'pr-28']"
            />
            <span
              class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/50"
            >
              {{ $t('preferencesForm.daily_rate_suffix') }}
            </span>
          </div>
        </div>
        <p v-if="showDailyRate" class="mt-2 text-xs text-ink/50">
          {{ $t('preferencesForm.daily_rate_hint') }}
        </p>
        <p class="mt-3 text-xs text-ink/50">{{ $t('preferencesForm.salary_hint') }}</p>
      </section>
    </template>
  </div>
</template>
