<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth' })
const { t, locale } = useI18n()
useHead({ title: computed(() => `${t('register.submit')} · Bye Bye Boss`) })

const auth = useAuthStore()
const toast = useToast()
const v = useValidators()
const loading = ref(false)
const resending = ref(false)
// Set after a successful signup → switch to the "check your email" state.
const registeredEmail = ref('')

const schema = computed(() =>
  yup.object({
    first_name: v.firstName(),
    last_name: v.lastName(),
    email: v.email(),
    password: v.password(),
    confirm: v.passwordConfirm('password'),
  })
)
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })
const [firstName] = defineField('first_name')
const [lastName] = defineField('last_name')
const [email] = defineField('email')
const [password] = defineField('password')
const [confirm] = defineField('confirm')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await auth.register({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      password: values.password,
      locale: locale.value,
    })
    registeredEmail.value = values.email
  } catch (err) {
    toast.error(
      err?.code === 'conflict' ? t('register.email_taken') : err?.message || t('register.error')
    )
  } finally {
    loading.value = false
  }
})

async function resend() {
  resending.value = true
  try {
    await auth.resendVerification(registeredEmail.value, locale.value)
    toast.success(t('register.resent'))
  } catch (err) {
    toast.error(err?.message || t('register.error'))
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div>
    <!-- After signup: ask the user to confirm their email -->
    <template v-if="registeredEmail">
      <div class="mb-4 text-4xl" aria-hidden="true">📬</div>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('register.check_email_title') }}
      </h1>
      <i18n-t keypath="register.check_email_sub" tag="p" class="mb-6 text-gray-500" scope="global">
        <template #email>
          <strong class="text-gray-900">{{ registeredEmail }}</strong>
        </template>
      </i18n-t>

      <UiButton variant="secondary" block :loading="resending" @click="resend">
        {{ $t('register.resend') }}
      </UiButton>

      <p class="mt-6 text-center text-sm text-gray-500">
        <NuxtLink to="/login" class="font-semibold text-brand hover:underline">
          {{ $t('common.back_to_login') }}
        </NuxtLink>
      </p>
    </template>

    <!-- Signup form -->
    <template v-else>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('register.title') }}</h1>
      <p class="mb-7 text-gray-500">{{ $t('register.subtitle') }}</p>

      <form novalidate @submit.prevent="onSubmit">
        <div class="mb-4 grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="firstName"
            :label="$t('common.first_name')"
            icon="👤"
            autocomplete="given-name"
            :error="errors.first_name"
          />
          <UiInput
            v-model="lastName"
            :label="$t('common.last_name')"
            icon="👤"
            autocomplete="family-name"
            :error="errors.last_name"
          />
        </div>
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
        <div class="mb-4">
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
        <div class="mb-5">
          <UiInput
            v-model="confirm"
            :label="$t('reset.confirm_password')"
            type="password"
            icon="🔒"
            autocomplete="new-password"
            :error="errors.confirm"
          />
        </div>

        <UiButton type="submit" variant="primary" block :loading="loading">
          {{ $t('register.submit') }}
        </UiButton>
      </form>

      <AuthSocialButtons />
      <AuthSecurityNote tkey="security.register" />
    </template>
  </div>
</template>
