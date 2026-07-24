<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.profile')} · Bye Bye Boss`) })

const auth = useAuthStore()
const toast = useToast()
const v = useValidators()
const { fullName, initials } = useUserDisplay()

// --- Identity (first / last name) ---
const firstName = ref('')
const lastName = ref('')
watchEffect(() => {
  firstName.value = auth.user?.first_name || ''
  lastName.value = auth.user?.last_name || ''
})
const nameChanged = computed(
  () =>
    firstName.value.trim() !== (auth.user?.first_name || '') ||
    lastName.value.trim() !== (auth.user?.last_name || '')
)
const savingName = ref(false)

async function saveName() {
  savingName.value = true
  try {
    await auth.updateProfile({
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
    })
    toast.success(t('profile.saved'))
  } catch (err) {
    toast.error(err?.message || t('profile.save_error'))
  } finally {
    savingName.value = false
  }
}

// --- Security (change password) ---
const pwdSchema = computed(() =>
  yup.object({
    current: yup.string().required(t('validation.password_required')),
    next: v.password(),
    confirm: v.passwordConfirm('next'),
  })
)
const { defineField, handleSubmit, errors, resetForm } = useForm({ validationSchema: pwdSchema })
const [current] = defineField('current')
const [next] = defineField('next')
const [confirm] = defineField('confirm')
const changingPwd = ref(false)

const changePassword = handleSubmit(async (values) => {
  changingPwd.value = true
  try {
    await auth.changePassword(values.current, values.next)
    toast.success(t('profile.password_changed'))
    resetForm()
  } catch (err) {
    toast.error(err?.status === 401 ? t('profile.wrong_password') : t('profile.save_error'))
  } finally {
    changingPwd.value = false
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('app.nav.profile') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('profile.subtitle') }}</p>
    </div>

    <!-- Identity -->
    <UiCard class="mb-5">
      <div class="mb-5 flex items-center gap-4">
        <span
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white"
        >
          {{ initials }}
        </span>
        <div class="min-w-0">
          <div class="truncate text-lg font-bold text-navy">
            {{ fullName || $t('profile.no_name') }}
          </div>
          <div class="truncate text-sm text-gray-500">{{ auth.user?.email }}</div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="firstName" :label="$t('common.first_name')" />
        <UiInput v-model="lastName" :label="$t('common.last_name')" />
      </div>

      <div class="mt-4">
        <label class="mb-1.5 block text-sm font-semibold text-gray-900">
          {{ $t('common.email') }}
        </label>
        <div
          class="flex items-center gap-2 rounded-md border-[1.5px] border-gray-200 bg-gray-50 px-3.5 py-3 text-base text-gray-500"
        >
          {{ auth.user?.email }}
          <span class="ml-auto text-[11px] uppercase tracking-wide text-gray-400">
            {{ $t('profile.readonly') }}
          </span>
        </div>
      </div>

      <div class="mt-5 flex items-center gap-3">
        <UiButton
          variant="primary"
          :disabled="!nameChanged"
          :loading="savingName"
          @click="saveName"
        >
          {{ $t('profile.save') }}
        </UiButton>
        <span class="text-sm text-gray-400">
          {{ $t('profile.plan') }} :
          <strong class="font-semibold text-gray-600">{{ auth.user?.subscription }}</strong>
        </span>
      </div>
    </UiCard>

    <!-- Security -->
    <UiCard class="mb-5" :title="$t('profile.security')">
      <form class="grid gap-4" novalidate @submit.prevent="changePassword">
        <UiInput
          v-model="current"
          :label="$t('profile.current_password')"
          type="password"
          autocomplete="current-password"
          :error="errors.current"
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput
            v-model="next"
            :label="$t('profile.new_password')"
            type="password"
            autocomplete="new-password"
            :hint="$t('register.password_hint')"
            :error="errors.next"
          />
          <UiInput
            v-model="confirm"
            :label="$t('reset.confirm_password')"
            type="password"
            autocomplete="new-password"
            :error="errors.confirm"
          />
        </div>
        <div>
          <UiButton type="submit" variant="primary" :loading="changingPwd">
            {{ $t('profile.change_password') }}
          </UiButton>
        </div>
      </form>
    </UiCard>

    <!-- Preferences -->
    <UiCard :title="$t('profile.preferences')">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-gray-900">{{ $t('lang.label') }}</div>
          <div class="text-[13px] text-gray-500">{{ $t('profile.language_hint') }}</div>
        </div>
        <UiLangSwitcher />
      </div>
    </UiCard>
  </div>
</template>
