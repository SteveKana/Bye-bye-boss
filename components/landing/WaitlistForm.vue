<script setup>
// Waitlist capture. Posts to the public leads endpoint; the backend stores the
// email and queues the acknowledgement mail. Validation happens client-side so
// the visitor gets a friendly message, never the API's technical error.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const value = email.value.trim()
  if (!value) return t('validation.email_required')
  if (!EMAIL_RE.test(value)) return t('validation.email_invalid')
  return ''
}

// Clear the error as soon as the visitor edits the field.
watch(email, () => {
  if (status.value === 'err') {
    status.value = ''
    message.value = ''
  }
})

async function onSubmit() {
  const error = validate()
  if (error) {
    message.value = error
    status.value = 'err'
    return
  }

  loading.value = true
  status.value = ''
  message.value = ''
  try {
    await api(
      'leads',
      {
        method: 'POST',
        body: { email: email.value.trim(), locale: locale.value, source: 'landing' },
      },
      false
    )
    message.value = t('landing.waitlist.success')
    status.value = 'ok'
    email.value = ''
  } catch (err) {
    // A 422 that slips through is still an email problem — keep it friendly.
    message.value =
      err?.status === 422 ? t('validation.email_invalid') : t('landing.waitlist.error')
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
        data-highlight
        class="flex flex-1 items-center gap-2 rounded-md border-[1.5px] bg-white px-3.5 transition-colors"
        :class="status === 'err' ? 'border-danger' : 'border-gray-200 focus-within:border-brand'"
      >
        <span class="text-sm text-gray-400" aria-hidden="true">✉</span>
        <input
          :id="inputId || undefined"
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-invalid="status === 'err'"
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
