<script setup>
// Waitlist capture. Posts to the public leads endpoint; the backend stores the
// email and queues the acknowledgement mail. Field validation uses the shared
// validators (see composables/useValidators.js), so the visitor gets a friendly
// message and no API call is made until the email is valid.
import { useForm } from 'vee-validate'
import * as yup from 'yup'

defineProps({
  noteKey: { type: String, default: 'landing.waitlist.note' },
  inputId: { type: String, default: '' },
})

const { t, locale } = useI18n()
const api = useApi()
const v = useValidators()

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: computed(() => yup.object({ email: v.email() })),
})
const [email] = defineField('email')

const loading = ref(false)
const status = ref('') // '' | 'ok' | 'err'
const message = ref('')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  status.value = ''
  message.value = ''
  try {
    await api(
      'leads',
      { method: 'POST', body: { email: values.email, locale: locale.value, source: 'landing' } },
      false
    )
    message.value = t('landing.waitlist.success')
    status.value = 'ok'
    resetForm()
  } catch (err) {
    // A 422 slipping through is still an email problem — keep it friendly.
    message.value =
      err?.status === 422 ? t('validation.email_invalid') : t('landing.waitlist.error')
    status.value = 'err'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <form class="flex flex-col gap-2.5 sm:flex-row" novalidate @submit.prevent="onSubmit">
      <div
        data-highlight
        class="flex flex-1 items-center gap-2 rounded-md border-[1.5px] bg-white px-3.5 transition-colors"
        :class="errors.email ? 'border-danger' : 'border-gray-200 focus-within:border-brand'"
      >
        <span class="text-sm text-gray-400" aria-hidden="true">✉</span>
        <input
          :id="inputId || undefined"
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(errors.email)"
          :placeholder="$t('landing.waitlist.placeholder')"
          class="w-full bg-transparent py-3 text-base text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <UiButton type="submit" variant="primary" :loading="loading">
        {{ $t('landing.waitlist.submit') }}
      </UiButton>
    </form>

    <!-- Feedback sits below the row so an error never resizes the input/button. -->
    <p v-if="errors.email" class="mt-2 text-sm text-danger" aria-live="polite">
      {{ errors.email }}
    </p>
    <p
      v-else-if="message"
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
