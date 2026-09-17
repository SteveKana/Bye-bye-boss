<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('login.submit')} · Bye Bye Boss`) })

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const v = useValidators()
const { locale } = useI18n()
const loading = ref(false)
const resending = ref(false)
// Set when the backend refuses login because the email isn't verified yet.
const needsVerification = ref(false)

const schema = computed(() => yup.object({ email: v.email(), password: v.passwordRequired() }))
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  needsVerification.value = false
  try {
    await auth.login(values.email, values.password)
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/dashboard')
  } catch (err) {
    if (err?.code === 'email_not_verified') {
      needsVerification.value = true
    } else {
      toast.error(err.message || t('login.error'))
    }
  } finally {
    loading.value = false
  }
})

async function resend() {
  resending.value = true
  try {
    await auth.resendVerification(email.value, locale.value)
    toast.success(t('register.resent'))
  } catch (err) {
    toast.error(err?.message || t('login.error'))
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('login.title') }}</h1>
    <p class="mb-7 text-gray-500">{{ $t('login.subtitle') }}</p>

    <div
      v-if="needsVerification"
      class="mb-5 rounded-md bg-warning-light px-4 py-3 text-sm text-warning"
    >
      <p class="mb-2 font-medium">{{ $t('login.not_verified') }}</p>
      <button
        type="button"
        class="font-semibold underline disabled:opacity-60"
        :disabled="resending"
        @click="resend"
      >
        {{ $t('register.resend') }}
      </button>
    </div>

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
