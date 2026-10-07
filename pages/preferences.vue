<script setup>
// "Préférences": zone, contract, work type and salary. They decide which
// offers are picked for the candidate in the daily analysis (applied from
// the next one), and pre-fill the filters of the Dashboard and Opportunités
// pages. Editable at any time, saved in place.
definePageMeta({ layout: 'app', middleware: ['auth', 'onboarding-complete'] })

const { t } = useI18n()
useHead({ title: computed(() => `${t('preferencesPage.title')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

const ready = ref(false)
const saving = ref(false)
const saved = ref(false)
const formRef = ref(null)

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    formRef.value.applyProfile(profile)
  } catch (err) {
    if (!isNoProfileError(err)) {
      toast.error(t('common.load_error'))
      return
    }
    await navigateTo('/onboarding/upload')
    return
  } finally {
    ready.value = true
  }
})

async function onSave() {
  if (!formRef.value.isValid()) {
    toast.error(t('preferencesForm.error_regions'))
    return
  }
  saving.value = true
  saved.value = false
  try {
    await onboarding.updatePreferences(formRef.value.payload())
    saved.value = true
    toast.success(t('preferencesPage.saved'))
  } catch (err) {
    toast.error(err?.message || t('preferencesPage.error_generic'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-black text-ink">{{ $t('preferencesPage.title') }}</h1>
      <p class="mt-1 text-sm text-ink/60">{{ $t('preferencesPage.subtitle') }}</p>
    </div>

    <UiCard v-show="ready">
      <OnboardingPreferencesForm ref="formRef" full />
    </UiCard>

    <div v-if="ready" class="mt-4 rounded-xl bg-lav/70 px-4 py-3 text-sm text-ink/60">
      ⏰ {{ $t('preferencesPage.applies_note') }}
    </div>

    <div v-if="ready" class="mt-6 flex items-center gap-3">
      <UiButton variant="primary" type="button" :loading="saving" @click="onSave">
        {{ $t('preferencesPage.save') }}
      </UiButton>
      <span v-if="saved" class="text-sm font-bold text-success-text"
        >✓ {{ $t('preferencesPage.saved') }}</span
      >
    </div>
  </div>
</template>
