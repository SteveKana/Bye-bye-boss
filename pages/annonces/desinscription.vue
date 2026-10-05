<script setup>
// Public page behind the "Ne plus recevoir les annonces" link of the announcement
// e-mails: /annonces/desinscription?token=...  Never indexed, never tracked.
definePageMeta({ layout: 'legal' })

const { t } = useI18n()
useHead({
  title: computed(() => `${t('unsubscribe.meta_title')} — Bye Bye Boss`),
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const route = useRoute()
const token = computed(() => {
  const q = route.query.token
  return typeof q === 'string' ? q : ''
})

// loading | ready | already | invalid | done
const state = ref('loading')
const maskedEmail = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function load() {
  if (!token.value) {
    state.value = 'invalid'
    return
  }
  try {
    const info = await api('monitoring/unsubscribe/info', { query: { token: token.value } }, false)
    maskedEmail.value = info?.email || ''
    state.value = info?.already ? 'already' : 'ready'
  } catch {
    state.value = 'invalid'
  }
}
onMounted(load)

async function confirm() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await api('monitoring/unsubscribe', { method: 'POST', body: { token: token.value } }, false)
    state.value = 'done'
  } catch (err) {
    if (err?.status === 400) state.value = 'invalid'
    else errorMessage.value = t('unsubscribe.error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
    <h1 class="text-3xl font-black leading-tight text-ink sm:text-4xl">
      {{ $t('unsubscribe.title') }}
    </h1>
    <p class="mt-3 text-base font-medium leading-relaxed text-ink/70">
      {{ $t('unsubscribe.intro') }}
    </p>

    <div
      class="mt-8 rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#16122E] sm:p-8"
    >
      <p v-if="state === 'loading'" class="py-4 text-center font-bold text-ink/60" role="status">
        {{ $t('unsubscribe.loading') }}
      </p>

      <div v-else-if="state === 'ready'" class="flex flex-col gap-5">
        <p class="text-base font-medium text-ink/80">
          {{ $t('unsubscribe.ready') }}
          <b class="font-black text-ink">{{ maskedEmail }}</b>
        </p>
        <p v-if="errorMessage" role="alert" class="text-sm font-bold text-danger">
          {{ errorMessage }}
        </p>
        <UiButton variant="primary" size="lg" block :loading="submitting" @click="confirm">
          {{ submitting ? $t('unsubscribe.working') : $t('unsubscribe.button') }}
        </UiButton>
      </div>

      <div v-else-if="state === 'done'" class="py-4 text-center" role="status">
        <p class="text-2xl font-black text-ink">{{ $t('unsubscribe.done_title') }} ✅</p>
        <p class="mx-auto mt-3 max-w-md text-base font-medium text-ink/70">
          {{ $t('unsubscribe.done') }}
        </p>
        <UiButton class="mt-6" variant="secondary" @click="navigateTo('/')">
          {{ $t('unsubscribe.home') }}
        </UiButton>
      </div>

      <div v-else-if="state === 'already'" class="py-4 text-center" role="status">
        <p class="text-2xl font-black text-ink">{{ $t('unsubscribe.already_title') }}</p>
        <p class="mx-auto mt-3 max-w-md text-base font-medium text-ink/70">
          {{ $t('unsubscribe.already') }}
        </p>
        <UiButton class="mt-6" variant="secondary" @click="navigateTo('/')">
          {{ $t('unsubscribe.home') }}
        </UiButton>
      </div>

      <div v-else class="py-4 text-center" role="alert">
        <p class="text-2xl font-black text-ink">{{ $t('unsubscribe.invalid_title') }}</p>
        <p class="mx-auto mt-3 max-w-md text-base font-medium text-ink/70">
          {{ $t('unsubscribe.invalid') }}
        </p>
        <UiButton class="mt-6" variant="secondary" @click="navigateTo('/contact')">
          {{ $t('unsubscribe.contact') }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
