<script setup>
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.preferences.title')} · Bye Bye Boss`) })

const route = useRoute()
const onboarding = useOnboardingStore()
const toast = useToast()

// Set by middleware/onboarding-complete.js when it redirects here because a
// CV re-import reset the profile's status away from "complete" -- without
// this, landing here out of nowhere (instead of on the page the visitor
// actually clicked toward) looks like a bug rather than an explained step.
const showUpdatedBanner = computed(() => route.query.updated === '1')

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
    toast.error(t('onboarding.preferences.error_required'))
    return
  }
  saving.value = true
  try {
    await onboarding.updatePreferences({ ...formRef.value.form })
    // This route is only ever reached from the onboarding wizard (upload ->
    // verification -> here) -- a later preferences edit goes through
    // /preferences instead, never here. So this is always the very end of
    // first-time onboarding, which now triggers an immediate matching run
    // (see the backend's ProfileOnboardingCompleted event) -- send the
    // candidate straight to /dashboard so they land on the product's own
    // value proposition (their scored opportunities) at the moment they're
    // most engaged, instead of /profile, which has nothing new to show.
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

      <div
        v-if="showUpdatedBanner"
        class="mb-5 flex items-start gap-2.5 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-text"
      >
        <span class="mt-0.5 shrink-0" aria-hidden="true">ℹ️</span>
        <span>{{ $t('onboarding.preferences.updated_banner') }}</span>
      </div>

      <!-- Always mounted (not gated behind v-if) so the template ref exists
           as soon as onMounted runs and can be populated via applyProfile(). -->
      <div v-show="ready" class="overflow-hidden rounded-[22px] border-[2.5px] border-ink bg-white">
        <OnboardingPreferencesForm ref="formRef" :location="location" padded />
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
