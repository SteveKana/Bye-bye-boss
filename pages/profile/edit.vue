<script setup>
// Dedicated CV-edit page, reached from /profile's "Modifier mon CV en ligne"
// link. Deliberately NOT part of the onboarding wizard: it uses the plain
// authenticated ('app') layout, not the wizard's step-indicator layout, and
// both its "Précédent" and "Sauvegarder" actions return to /profile -- there
// is no dead end into an unrelated CV-import screen like the old
// /onboarding/verification redirect produced.
definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('profileCv.edit_title')} · Bye Bye Boss`) })

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
    // No profile to edit -- send back to the importer rather than showing
    // an empty form with nothing to save onto.
    await navigateTo('/onboarding/upload')
  }
})

async function onSave() {
  saving.value = true
  try {
    await onboarding.updateProfile({ ...formRef.value.form })
    toast.success(t('profileCv.edit_saved'))
    await navigateTo('/profile')
  } catch (err) {
    toast.error(err?.message || t('profileCv.save_error'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('profileCv.edit_title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('profileCv.edit_subtitle') }}</p>
    </div>

    <!-- Always mounted (not gated behind v-if) so the template ref exists as
         soon as onMounted runs and can be populated via applyProfile(). -->
    <ProfileCvFieldsForm v-show="ready" ref="formRef" />

    <div v-if="ready" class="mt-6 flex items-center gap-3">
      <UiButton
        variant="secondary"
        type="button"
        :disabled="saving"
        @click="navigateTo('/profile')"
      >
        {{ $t('common.previous') }}
      </UiButton>
      <UiButton variant="primary" type="button" :loading="saving" @click="onSave">
        {{ $t('common.save') }}
      </UiButton>
    </div>
  </div>
</template>
