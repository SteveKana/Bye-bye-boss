<script setup>
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('verify.title')} · Bye Bye Boss`) })

const auth = useAuthStore()
const route = useRoute()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const state = ref('verifying') // verifying | success | error

// Verify on the client so no API call happens during SSR.
onMounted(async () => {
  if (!token.value) {
    state.value = 'error'
    return
  }
  try {
    await auth.verifyEmail(token.value)
    state.value = 'success'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <div class="text-center">
    <template v-if="state === 'verifying'">
      <div
        class="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-brand"
        aria-hidden="true"
      />
      <p class="text-gray-500">{{ $t('verify.verifying') }}</p>
    </template>

    <template v-else-if="state === 'success'">
      <div class="mb-4 text-4xl" aria-hidden="true">✅</div>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('verify.success_title') }}
      </h1>
      <p class="mb-6 text-gray-500">{{ $t('verify.success_sub') }}</p>
      <UiButton variant="primary" block @click="navigateTo('/login')">
        {{ $t('nav.sign_in') }}
      </UiButton>
    </template>

    <template v-else>
      <div class="mb-4 text-4xl" aria-hidden="true">⚠️</div>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('verify.error_title') }}
      </h1>
      <p class="mb-6 text-gray-500">{{ $t('verify.error_sub') }}</p>
      <UiButton variant="primary" block @click="navigateTo('/login')">
        {{ $t('nav.sign_in') }}
      </UiButton>
    </template>
  </div>
</template>
