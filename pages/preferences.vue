<script setup>
// Dedicated "Préférences" section, reachable from the sidebar like Profil or
// Paramètres -- not a page reached only through the onboarding wizard, and
// not a widget buried inside the dashboard. Same fields as the wizard's step
// 3 (via the shared OnboardingPreferencesForm), editable at any time, saved
// in place with a success toast (no redirect away).
definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('preferencesPage.title')} · Bye Bye Boss`) })

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
  } catch {
    // No profile yet (CV not imported) -- send to the importer, same as
    // every other profile-dependent page.
    await navigateTo('/onboarding/upload')
    return
  } finally {
    ready.value = true
  }
})

async function onSave() {
  if (!formRef.value.isValid()) {
    toast.error(t('preferencesPage.error_required'))
    return
  }
  saving.value = true
  try {
    await onboarding.updatePreferences({ ...formRef.value.form })
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
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('preferencesPage.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('preferencesPage.subtitle') }}</p>
    </div>

    <!-- Always mounted (not gated behind v-if) so the template ref exists as
         soon as onMounted runs and can be populated via applyProfile(). -->
    <UiCard v-show="ready">
      <OnboardingPreferencesForm ref="formRef" :location="location" />
    </UiCard>

    <div v-if="ready" class="mt-6">
      <UiButton variant="primary" type="button" :loading="saving" @click="onSave">
        {{ $t('preferencesPage.save') }}
      </UiButton>
    </div>
  </div>
</template>
