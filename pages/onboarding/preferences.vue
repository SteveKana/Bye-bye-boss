<script setup>
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.preferences.title')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

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

const ready = ref(false)
const saving = ref(false)

const contractTypes = ref([])
const remotePreferences = ref([])
const mobility = ref('France entière')
const salaryTarget = ref(null)

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    contractTypes.value = profile.contract_types?.length ? [...profile.contract_types] : []
    remotePreferences.value = profile.remote_preferences?.length
      ? [...profile.remote_preferences]
      : []
    mobility.value = profile.mobility || 'France entière'
    salaryTarget.value = profile.salary_target ?? null
    ready.value = true
  } catch {
    await navigateTo('/onboarding/upload')
  }
})

async function onContinue() {
  if (!contractTypes.value.length || !remotePreferences.value.length || !mobility.value) {
    toast.error(t('onboarding.preferences.error_required'))
    return
  }
  saving.value = true
  try {
    await onboarding.updatePreferences({
      contract_types: contractTypes.value,
      remote_preferences: remotePreferences.value,
      mobility: mobility.value,
      salary_target: salaryTarget.value || null,
    })
    await navigateTo('/dashboard')
  } catch (err) {
    toast.error(err.message || t('onboarding.preferences.error_generic'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <NuxtLayout name="onboarding">
    <div v-if="ready">
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
      {{ $t('onboarding.preferences.title') }}
    </h1>
    <p class="mb-7 text-gray-500">{{ $t('onboarding.preferences.subtitle') }}</p>

    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
      <div class="border-b border-gray-100 px-6 py-6">
        <h3 class="text-base font-semibold text-gray-900">
          {{ $t('onboarding.preferences.contract_type_title') }}
        </h3>
        <p class="mt-0.5 text-sm text-gray-500">
          {{ $t('onboarding.preferences.contract_type_subtitle') }}
        </p>
        <div class="mt-4">
          <OnboardingChoiceGroup
            v-model="contractTypes"
            :options="CONTRACT_OPTIONS"
            multiple
            :columns="4"
          />
        </div>
        <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
      </div>

      <div class="border-b border-gray-100 px-6 py-6">
        <h3 class="text-base font-semibold text-gray-900">
          {{ $t('onboarding.preferences.remote_title') }}
        </h3>
        <p class="mt-0.5 text-sm text-gray-500">
          {{ $t('onboarding.preferences.remote_subtitle') }}
        </p>
        <div class="mt-4">
          <OnboardingChoiceGroup
            v-model="remotePreferences"
            :options="REMOTE_OPTIONS"
            multiple
            :columns="3"
          />
        </div>
        <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.multi_choice') }}</p>
      </div>

      <div class="border-b border-gray-100 px-6 py-6">
        <h3 class="text-base font-semibold text-gray-900">
          {{ $t('onboarding.preferences.mobility_title') }}
        </h3>
        <p class="mt-0.5 text-sm text-gray-500">
          {{ $t('onboarding.preferences.mobility_subtitle') }}
        </p>
        <div class="mt-4">
          <OnboardingChoiceGroup v-model="mobility" :options="MOBILITY_OPTIONS" :columns="3" />
        </div>
        <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.single_choice') }}</p>
      </div>

      <div class="px-6 py-6">
        <h3 class="text-base font-semibold text-gray-900">
          {{ $t('onboarding.preferences.salary_title') }}
        </h3>
        <p class="mt-0.5 text-sm text-gray-500">
          {{ $t('onboarding.preferences.salary_subtitle') }}
        </p>
        <div class="relative mt-4">
          <input
            v-model.number="salaryTarget"
            type="number"
            min="0"
            step="1000"
            :placeholder="$t('onboarding.preferences.salary_placeholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-28 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand focus:shadow-focus-ring"
          />
          <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {{ $t('onboarding.preferences.salary_suffix') }}
          </span>
        </div>
        <p class="mt-3 text-xs text-gray-400">{{ $t('onboarding.preferences.salary_hint') }}</p>
      </div>
    </div>

    <div class="mt-4 rounded-xl bg-gray-100/70 px-4 py-3 text-sm text-gray-500">
      {{ $t('onboarding.preferences.note') }}
    </div>
  </div>

    <template #actions>
      <UiButton
        variant="secondary"
        type="button"
        :disabled="saving"
        @click="navigateTo('/onboarding/verification')"
      >
        {{ $t('onboarding.preferences.previous') }}
      </UiButton>
      <UiButton variant="primary" type="button" :loading="saving" @click="onContinue">
        {{ $t('onboarding.preferences.continue') }}
      </UiButton>
    </template>
  </NuxtLayout>
</template>
