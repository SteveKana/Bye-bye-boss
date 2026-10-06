<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'legal' })

const { t, locale } = useI18n()
useHead({ title: computed(() => `${t('contact.title')} — Bye Bye Boss`) })

const api = useApi()
const route = useRoute()
const v = useValidators()

const TOPICS = ['question', 'personal_data', 'problem', 'partnership', 'other']
const topicOptions = computed(() =>
  TOPICS.map((k) => ({ value: k, label: t(`contact.topics.${k}`) }))
)

const schema = computed(() =>
  yup.object({
    name: yup.string().trim().required(t('contact.name_required')).max(120),
    email: v.email(),
    topic: yup.string().oneOf(TOPICS),
    message: yup
      .string()
      .trim()
      .required(t('contact.message_required'))
      .min(10, t('contact.message_short'))
      .max(5000),
  })
)

const initialTopic = TOPICS.includes(route.query.topic) ? route.query.topic : 'question'
const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', email: '', topic: initialTopic, message: '' },
})
const [name] = defineField('name')
const [email] = defineField('email')
const [topic] = defineField('topic')
const [message] = defineField('message')

// Honeypot: invisible to people, bots fill it in (the server then drops it).
const website = ref('')

const loading = ref(false)
const sent = ref(false)
const sentMessage = ref('')
const errorMessage = ref('')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api(
      'contact',
      {
        method: 'POST',
        body: { ...values, locale: locale.value, website: website.value || null },
      },
      false
    )
    sentMessage.value = res?.detail || t('contact.success')
    sent.value = true
    resetForm({ values: { name: '', email: '', topic: 'question', message: '' } })
  } catch (err) {
    errorMessage.value = err?.status === 429 ? t('contact.too_many') : t('contact.error')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
    <h1 class="text-3xl font-black leading-tight text-ink sm:text-4xl">
      {{ $t('contact.title') }}
    </h1>
    <p class="mt-3 text-base font-medium leading-relaxed text-ink/70">{{ $t('contact.intro') }}</p>

    <div
      class="mt-8 rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_#16122E] sm:p-8"
    >
      <div v-if="sent" class="py-6 text-center">
        <p class="text-2xl font-black text-ink">{{ $t('contact.success_title') }}</p>
        <p class="mx-auto mt-3 max-w-md text-base font-medium text-ink/70">{{ sentMessage }}</p>
        <UiButton class="mt-6" variant="secondary" @click="sent = false">
          {{ $t('contact.send_another') }}
        </UiButton>
      </div>

      <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <UiInput
          v-model="name"
          :label="$t('contact.name')"
          icon="👤"
          :placeholder="$t('contact.name_placeholder')"
          autocomplete="name"
          :error="errors.name"
          required
        />
        <UiInput
          v-model="email"
          :label="$t('contact.email')"
          type="email"
          icon="✉"
          :placeholder="$t('common.email_placeholder')"
          autocomplete="email"
          :error="errors.email"
          required
        />
        <UiSelect
          v-model="topic"
          :label="$t('contact.topic')"
          :options="topicOptions"
          :error="errors.topic"
        />
        <UiTextarea
          v-model="message"
          :label="$t('contact.message')"
          :placeholder="$t('contact.message_placeholder')"
          :rows="6"
          :maxlength="5000"
          :error="errors.message"
          required
        />

        <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" />
          </label>
        </div>

        <p v-if="errorMessage" role="alert" class="text-sm font-bold text-danger">
          {{ errorMessage }}
        </p>

        <UiButton type="submit" variant="primary" size="lg" block :loading="loading">
          {{ $t('contact.submit') }}
        </UiButton>
      </form>
    </div>
  </div>
</template>
