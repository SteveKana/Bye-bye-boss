<script setup>
// Step 3 of the onboarding: zone and contract. Finishing it completes the
// profile and launches the first matching run, which already uses the zone
// and contracts chosen here. Work type and salary are optional and set later
// in the Préférences page.
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.preferences.title')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

const ready = ref(false)
const saving = ref(false)
const formRef = ref(null)

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    formRef.value.applyProfile(profile)
    ready.value = true
  } catch (err) {
    if (!isNoProfileError(err)) {
      toast.error(t('common.load_error'))
      return
    }
    await navigateTo('/onboarding/upload')
  }
})

async function onContinue() {
  if (!formRef.value.isValid()) {
    toast.error(t('preferencesForm.error_regions'))
    return
  }
  saving.value = true
  try {
    await onboarding.updatePreferences(formRef.value.payload())
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
    <div>
      <h1 class="mb-1.5 text-2xl font-black text-ink">
        {{ $t('onboarding.preferences.title') }}
      </h1>
      <p class="mb-7 text-ink/60">{{ $t('onboarding.preferences.subtitle') }}</p>

      <!-- Always mounted so the template ref exists when onMounted runs. -->
      <div v-show="ready" class="overflow-hidden rounded-[22px] border-[2.5px] border-ink bg-white">
        <OnboardingPreferencesForm ref="formRef" padded />
      </div>

      <div v-if="ready" class="mt-4 rounded-xl bg-lav/70 px-4 py-3 text-sm text-ink/60">
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
