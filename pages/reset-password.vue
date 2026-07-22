<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('reset.request_title')} · Bye Bye Boss`) })

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const v = useValidators()
const loading = ref(false)
const requested = ref(false)

// A token in the URL means the user followed a reset link → confirm mode.
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const isConfirm = computed(() => Boolean(token.value))

// Request mode: ask for the email to send a reset link to.
const requestSchema = computed(() => yup.object({ email: v.email() }))
const {
  defineField: defineRequestField,
  handleSubmit: handleRequest,
  errors: requestErrors,
} = useForm({ validationSchema: requestSchema })
const [email] = defineRequestField('email')

const onRequest = handleRequest(async (values) => {
  loading.value = true
  try {
    await auth.requestPasswordReset(values.email)
    requested.value = true
  } catch (err) {
    toast.error(err.message || t('reset.request_error'))
  } finally {
    loading.value = false
  }
})

// Confirm mode: set a new password using the token from the link.
const confirmSchema = computed(() =>
  yup.object({ password: v.password(), confirm: v.passwordConfirm('password') })
)
const {
  defineField: defineConfirmField,
  handleSubmit: handleConfirm,
  errors: confirmErrors,
} = useForm({ validationSchema: confirmSchema })
const [password] = defineConfirmField('password')
const [confirm] = defineConfirmField('confirm')

const onConfirm = handleConfirm(async (values) => {
  loading.value = true
  try {
    await auth.confirmPasswordReset(token.value, values.password)
    toast.success(t('reset.success'))
    await navigateTo('/login')
  } catch (err) {
    toast.error(err.message || t('reset.confirm_error'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Confirm mode: the user arrived from a reset link -->
    <template v-if="isConfirm">
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('reset.confirm_title') }}</h1>
      <p class="mb-7 text-gray-500">{{ $t('reset.confirm_subtitle') }}</p>

      <form novalidate @submit.prevent="onConfirm">
        <div class="mb-4">
          <UiInput
            v-model="password"
            :label="$t('reset.new_password')"
            type="password"
            icon="🔒"
            autocomplete="new-password"
            :hint="$t('register.password_hint')"
            :error="confirmErrors.password"
          />
        </div>
        <div class="mb-5">
          <UiInput
            v-model="confirm"
            :label="$t('reset.confirm_password')"
            type="password"
            icon="🔒"
            autocomplete="new-password"
            :error="confirmErrors.confirm"
          />
        </div>
        <UiButton type="submit" variant="primary" block :loading="loading">
          {{ $t('reset.confirm_submit') }}
        </UiButton>
      </form>
    </template>

    <!-- Request mode: ask for the account email -->
    <template v-else>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">{{ $t('reset.request_title') }}</h1>
      <p class="mb-7 text-gray-500">{{ $t('reset.request_subtitle') }}</p>

      <div v-if="requested" class="rounded-md bg-success-light px-4 py-3 text-sm text-success-text">
        {{ $t('reset.requested') }}
      </div>

      <form v-else novalidate @submit.prevent="onRequest">
        <div class="mb-5">
          <UiInput
            v-model="email"
            :label="$t('common.email')"
            type="email"
            icon="✉"
            :placeholder="$t('common.email_placeholder')"
            autocomplete="email"
            :error="requestErrors.email"
          />
        </div>
        <UiButton type="submit" variant="primary" block :loading="loading">
          {{ $t('reset.request_submit') }}
        </UiButton>
      </form>
    </template>
  </div>
</template>
