<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.settings')} · Bye Bye Boss`) })

const auth = useAuthStore()
const toast = useToast()
const v = useValidators()

const soon = () => toast.info(t('app.soon_full'))

// --- Security (change password) — unchanged logic, moved here from the old
// combined profile page to match the settings mockup's "Compte" card ---
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
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('app.nav.settings') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Subscription -->
    <UiCard class="mb-4" :title="$t('settings.subscription')">
      <p class="mb-4 text-[13px] text-gray-500">{{ $t('settings.subscription_sub') }}</p>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
        <div>
          <span class="inline-flex items-center gap-2 font-bold text-navy">
            {{ auth.user?.subscription || $t('settings.plan_free') }}
            <span class="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand">
              {{ $t('settings.current_plan') }}
            </span>
          </span>
          <div class="mt-1 text-[12.5px] text-gray-500">{{ $t('settings.plan_detail') }}</div>
        </div>
        <UiButton variant="primary" size="sm" @click="soon">
          ✨ {{ $t('settings.upgrade') }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Notifications (not backed yet -- interacting shows "coming soon") -->
    <UiCard class="mb-4" :title="$t('settings.notifications')">
      <p class="mb-4 text-[13px] text-gray-500">{{ $t('settings.notifications_sub') }}</p>

      <div class="flex items-center justify-between gap-4 border-b border-gray-100 py-3.5">
        <div>
          <div class="text-sm font-semibold text-gray-900">{{ $t('settings.alerts_label') }}</div>
          <div class="text-[12.5px] text-gray-500">{{ $t('settings.alerts_sub') }}</div>
        </div>
        <button
          type="button"
          class="relative h-6 w-11 shrink-0 rounded-full bg-gray-200"
          role="switch"
          aria-checked="false"
          @click="soon"
        >
          <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-4 border-b border-gray-100 py-3.5">
        <div>
          <div class="text-sm font-semibold text-gray-900">{{ $t('settings.channel_label') }}</div>
          <div class="text-[12.5px] text-gray-500">{{ $t('settings.channel_sub') }}</div>
        </div>
        <UiSelect
          class="w-44"
          :model-value="$t('settings.channel_email')"
          :options="[$t('settings.channel_email')]"
          @update:model-value="soon"
        />
      </div>

      <div class="flex items-center justify-between gap-4 pt-3.5">
        <div>
          <div class="text-sm font-semibold text-gray-900">
            {{ $t('settings.frequency_label') }}
          </div>
          <div class="text-[12.5px] text-gray-500">{{ $t('settings.frequency_sub') }}</div>
        </div>
        <UiSelect
          class="w-44"
          :model-value="$t('settings.frequency_daily')"
          :options="[$t('settings.frequency_daily')]"
          @update:model-value="soon"
        />
      </div>
    </UiCard>

    <!-- Account -->
    <UiCard class="mb-4" :title="$t('settings.account')">
      <div class="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-gray-900">
            {{ $t('common.email') }}
          </label>
          <div
            class="flex items-center rounded-md border-[1.5px] border-gray-200 bg-gray-50 px-3.5 py-3 text-base text-gray-500"
          >
            {{ auth.user?.email }}
          </div>
        </div>
      </div>

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

      <div class="mt-6 border-t border-gray-100 pt-5">
        <UiButton variant="secondary" class="border-danger/30 text-danger" @click="soon">
          {{ $t('settings.delete_account') }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Language -->
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
