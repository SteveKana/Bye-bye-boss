<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('register.submit')} · Bye Bye Boss`) })

const auth = useAuthStore()
const toast = useToast()
const loading = ref(false)

const schema = computed(() =>
  yup.object({
    email: yup
      .string()
      .required(t('validation.email_required'))
      .email(t('validation.email_invalid')),
    password: yup
      .string()
      .required(t('validation.password_required'))
      .min(8, t('validation.password_min')),
  })
)
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await auth.register({ email: values.email, password: values.password })
    await navigateTo('/')
  } catch (err) {
    toast.error(err.message || t('register.error'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('register.title') }}</h1>
    <p class="mb-7 text-gray-500">{{ $t('register.subtitle') }}</p>

    <form novalidate @submit.prevent="onSubmit">
      <div class="mb-4">
        <UiInput
          v-model="email"
          :label="$t('common.email')"
          type="email"
          icon="✉"
          :placeholder="$t('common.email_placeholder')"
          autocomplete="email"
          :error="errors.email"
        />
      </div>
      <div class="mb-5">
        <UiInput
          v-model="password"
          :label="$t('common.password')"
          type="password"
          icon="🔒"
          :placeholder="$t('register.password_placeholder')"
          autocomplete="new-password"
          :hint="$t('register.password_hint')"
          :error="errors.password"
        />
      </div>

      <UiButton type="submit" variant="primary" block :loading="loading">
        {{ $t('register.submit') }}
      </UiButton>
    </form>

    <AuthSocialButtons />
    <AuthSecurityNote tkey="security.register" />
  </div>
</template>
