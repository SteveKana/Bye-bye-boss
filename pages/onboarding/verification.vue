<script setup>
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.verification.title')} · Bye Bye Boss`) })

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
  } catch {
    // No draft profile yet (no CV imported) — send the user back to step 1.
    await navigateTo('/onboarding/upload')
  }
})

async function onContinue() {
  saving.value = true
  try {
    await onboarding.updateProfile({ ...formRef.value.form })
    await navigateTo('/onboarding/preferences')
  } catch (err) {
    toast.error(err.message || t('onboarding.verification.error_generic'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <NuxtLayout name="onboarding">
    <div>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('onboarding.verification.title') }}
      </h1>
      <p class="mb-7 text-gray-500">{{ $t('onboarding.verification.subtitle') }}</p>

      <!-- The form is always mounted (not gated behind v-if) so its template
           ref exists as soon as onMounted runs and can be populated via
           applyProfile() -- it's only made visible once that's done, to
           avoid a flash of empty fields. -->
      <ProfileCvFieldsForm v-show="ready" ref="formRef" />
    </div>

    <template #actions>
      <UiButton
        variant="secondary"
        type="button"
        :disabled="saving"
        @click="navigateTo('/onboarding/upload')"
      >
        {{ $t('onboarding.verification.previous') }}
      </UiButton>
      <UiButton variant="primary" type="button" :loading="saving" @click="onContinue">
        {{ $t('onboarding.verification.continue') }}
      </UiButton>
    </template>
  </NuxtLayout>
</template>
