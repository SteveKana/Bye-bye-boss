<script setup>
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.preferences.title')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

const ready = ref(false)
const saving = ref(false)
const formRef = ref(null)
const location = ref('')

onMounted(async () => {
  try {
    const profile = onboarding.profile || (await onboarding.fetchProfile())
    location.value = profile.location || ''
    formRef.value.applyProfile(profile)
    ready.value = true
  } catch {
    await navigateTo('/onboarding/upload')
  }
})

async function onContinue() {
  if (!formRef.value.isValid()) {
    toast.error(t('onboarding.preferences.error_required'))
    return
  }
  saving.value = true
  try {
    await onboarding.updatePreferences({ ...formRef.value.form })
    // Preferences is the last onboarding step -- whether this is a first-time
    // completion or a later re-edit, /profile is where the person can see
    // what was just imported/set, so it's the landing page either way.
    await navigateTo('/profile')
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
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('onboarding.preferences.title') }}
      </h1>
      <p class="mb-7 text-gray-500">{{ $t('onboarding.preferences.subtitle') }}</p>

      <!-- Always mounted (not gated behind v-if) so the template ref exists
           as soon as onMounted runs and can be populated via applyProfile(). -->
      <div
        v-show="ready"
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft"
      >
        <OnboardingPreferencesForm ref="formRef" :location="location" padded />
      </div>

      <div v-if="ready" class="mt-4 rounded-xl bg-gray-100/70 px-4 py-3 text-sm text-gray-500">
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
