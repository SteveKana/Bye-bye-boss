<script setup>
// Waitlist capture. Posts to the public leads endpoint; the backend stores the
// email and queues the acknowledgement mail.
defineProps({
  noteKey: { type: String, default: 'landing.waitlist.note' },
  inputId: { type: String, default: '' },
})

const { t, locale } = useI18n()
const api = useApi()

const email = ref('')
const loading = ref(false)
const status = ref('') // '' | 'ok' | 'err'
const message = ref('')

async function onSubmit() {
  loading.value = true
  status.value = ''
  message.value = ''
  try {
    await api(
      'leads',
      {
        method: 'POST',
        body: { email: email.value, locale: locale.value, source: 'landing' },
      },
      false
    )
    message.value = t('landing.waitlist.success')
    status.value = 'ok'
    email.value = ''
  } catch (err) {
    message.value = err?.message || t('landing.waitlist.error')
    status.value = 'err'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <form class="flex flex-col gap-2.5 sm:flex-row" novalidate @submit.prevent="onSubmit">
      <div
        class="flex flex-1 items-center gap-2 rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 focus-within:border-brand"
      >
        <span class="text-sm text-gray-400" aria-hidden="true">✉</span>
        <input
          :id="inputId || undefined"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :placeholder="$t('landing.waitlist.placeholder')"
          class="w-full bg-transparent py-3 text-base text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
      <UiButton type="submit" variant="primary" :loading="loading">
        {{ $t('landing.waitlist.submit') }}
      </UiButton>
    </form>

    <p
      v-if="message"
      class="mt-2 text-sm"
      :class="status === 'ok' ? 'text-success-text' : 'text-danger'"
      aria-live="polite"
    >
      {{ message }}
    </p>
    <p class="mt-2 text-[12.5px] text-gray-400">
      <span aria-hidden="true">🔒</span> {{ $t(noteKey) }}
    </p>
  </div>
</template>
