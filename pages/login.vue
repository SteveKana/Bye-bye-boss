<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('login.submit')} · Bye Bye Boss`) })

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const loading = ref(false)

const schema = computed(() =>
  yup.object({
    email: yup
      .string()
      .required(t('validation.email_required'))
      .email(t('validation.email_invalid')),
    password: yup.string().required(t('validation.password_required')),
  })
)
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await auth.login(values.email, values.password)
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/')
  } catch (err) {
    toast.error(err.message || t('login.error'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('login.title') }}</h1>
    <p class="mb-7 text-gray-500">{{ $t('login.subtitle') }}</p>

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
      <div class="mb-2">
        <UiInput
          v-model="password"
          :label="$t('common.password')"
          type="password"
          icon="🔒"
          :placeholder="$t('login.password_placeholder')"
          autocomplete="current-password"
          :error="errors.password"
        />
      </div>
      <div class="mb-5 text-right">
        <NuxtLink to="/reset-password" class="text-sm font-semibold text-brand hover:underline">
          {{ $t('login.forgot') }}
        </NuxtLink>
      </div>

      <UiButton type="submit" variant="primary" block :loading="loading">
        {{ $t('login.submit') }}
      </UiButton>
    </form>

    <AuthSocialButtons />
    <AuthSecurityNote tkey="security.login" />
  </div>
</template>
