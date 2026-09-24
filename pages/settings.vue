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

// --- Notifications (email/Discord/WhatsApp) --------------------------
// See app/modules/notifications on the API. Email is a plain on/off toggle;
// Discord and WhatsApp each need a value (webhook URL / phone number)
// before they can be turned on, so those two get an "Activer" flow instead
// of a bare switch.
const notifications = useNotificationsStore()

const prefsLoading = ref(true)
const emailSaving = ref(false)
const discordSaving = ref(false)
const whatsappSaving = ref(false)
const testSending = ref(false)

const emailEnabled = ref(true)
const discordEnabled = ref(false)
const discordWebhookUrl = ref('')
const discordError = ref('')
const whatsappEnabled = ref(false)
const whatsappPhoneNumber = ref('')
const whatsappError = ref('')

function applyPreferences(prefs) {
  emailEnabled.value = prefs.email_enabled
  discordEnabled.value = prefs.discord_enabled
  discordWebhookUrl.value = prefs.discord_webhook_url || ''
  whatsappEnabled.value = prefs.whatsapp_enabled
  whatsappPhoneNumber.value = prefs.whatsapp_phone_number || ''
}

onMounted(async () => {
  try {
    applyPreferences(await notifications.fetchPreferences())
  } catch (err) {
    toast.error(err.message || t('settings.notifications_load_error'))
  } finally {
    prefsLoading.value = false
  }
})

async function toggleEmail(next) {
  emailSaving.value = true
  try {
    applyPreferences(await notifications.savePreferences({ email_enabled: next }))
  } catch (err) {
    toast.error(err.message || t('settings.notifications_save_error'))
  } finally {
    emailSaving.value = false
  }
}

const DISCORD_WEBHOOK_PREFIX = 'https://discord.com/api/webhooks/'

async function saveDiscord() {
  discordError.value = ''
  const webhook = discordWebhookUrl.value.trim()
  if (!webhook) {
    discordError.value = t('validation.discord_webhook_required')
    return
  }
  if (!webhook.startsWith(DISCORD_WEBHOOK_PREFIX)) {
    discordError.value = t('validation.discord_webhook_invalid')
    return
  }
  discordSaving.value = true
  try {
    applyPreferences(
      await notifications.savePreferences({
        discord_enabled: true,
        discord_webhook_url: webhook,
      })
    )
    toast.success(t('settings.notifications_saved'))
  } catch (err) {
    toast.error(err.message || t('settings.notifications_save_error'))
  } finally {
    discordSaving.value = false
  }
}

async function disableDiscord() {
  discordSaving.value = true
  try {
    applyPreferences(await notifications.savePreferences({ discord_enabled: false }))
  } catch (err) {
    toast.error(err.message || t('settings.notifications_save_error'))
  } finally {
    discordSaving.value = false
  }
}

// Loose international-format check (+ then 7-15 digits) -- the backend
// doesn't validate the shape beyond "non-empty", this is just to catch an
// obviously wrong value before it round-trips to the API.
const WHATSAPP_PHONE_PATTERN = /^\+[1-9]\d{6,14}$/

async function saveWhatsapp() {
  whatsappError.value = ''
  const phone = whatsappPhoneNumber.value.trim()
  if (!phone) {
    whatsappError.value = t('validation.whatsapp_phone_required')
    return
  }
  if (!WHATSAPP_PHONE_PATTERN.test(phone)) {
    whatsappError.value = t('validation.whatsapp_phone_invalid')
    return
  }
  whatsappSaving.value = true
  try {
    applyPreferences(
      await notifications.savePreferences({
        whatsapp_enabled: true,
        whatsapp_phone_number: phone,
      })
    )
    toast.success(t('settings.notifications_saved'))
  } catch (err) {
    toast.error(err.message || t('settings.notifications_save_error'))
  } finally {
    whatsappSaving.value = false
  }
}

async function disableWhatsapp() {
  whatsappSaving.value = true
  try {
    applyPreferences(await notifications.savePreferences({ whatsapp_enabled: false }))
  } catch (err) {
    toast.error(err.message || t('settings.notifications_save_error'))
  } finally {
    whatsappSaving.value = false
  }
}

async function sendTest() {
  const channelLabels = {
    email: t('settings.channel_email'),
    discord: 'Discord',
    whatsapp: 'WhatsApp',
  }
  testSending.value = true
  try {
    const result = await notifications.testSend()
    const channels = result.channels_sent.map((c) => channelLabels[c] || c).join(', ')
    toast.success(t('settings.test_send_success', { channels }))
  } catch (err) {
    toast.error(err.message || t('settings.test_send_error'))
  } finally {
    testSending.value = false
  }
}

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

    <!-- Notifications -->
    <UiCard class="mb-4" :title="$t('settings.notifications')">
      <p class="mb-4 text-[13px] text-gray-500">{{ $t('settings.notifications_sub') }}</p>

      <div v-if="prefsLoading" class="py-6 text-center text-sm text-gray-500">
        {{ $t('settings.loading') }}
      </div>

      <template v-else>
        <!-- Email -->
        <div class="flex items-center justify-between gap-4 border-b border-gray-100 py-3.5">
          <div>
            <div class="text-sm font-semibold text-gray-900">
              {{ $t('settings.channel_email') }}
            </div>
            <div class="text-[12.5px] text-gray-500">{{ $t('settings.email_sub') }}</div>
          </div>
          <UiToggle
            :model-value="emailEnabled"
            :disabled="emailSaving"
            :label="$t('settings.channel_email')"
            @update:model-value="toggleEmail"
          />
        </div>

        <!-- Discord -->
        <div class="border-b border-gray-100 py-3.5">
          <div class="mb-2 flex items-center justify-between gap-4">
            <div class="text-sm font-semibold text-gray-900">Discord</div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="
                discordEnabled ? 'bg-success-light text-success-text' : 'bg-gray-100 text-gray-500'
              "
            >
              {{ discordEnabled ? $t('settings.channel_active') : $t('settings.channel_inactive') }}
            </span>
          </div>
          <p class="mb-2 text-[12.5px] text-gray-500">{{ $t('settings.discord_sub') }}</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
            <UiInput
              v-model="discordWebhookUrl"
              class="flex-1"
              placeholder="https://discord.com/api/webhooks/…"
              :error="discordError"
              :disabled="discordSaving"
            />
            <div class="flex shrink-0 gap-2">
              <UiButton variant="secondary" size="sm" :loading="discordSaving" @click="saveDiscord">
                {{ discordEnabled ? $t('settings.update') : $t('settings.activate') }}
              </UiButton>
              <UiButton
                v-if="discordEnabled"
                variant="ghost"
                size="sm"
                :disabled="discordSaving"
                @click="disableDiscord"
              >
                {{ $t('settings.deactivate') }}
              </UiButton>
            </div>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="border-b border-gray-100 py-3.5">
          <div class="mb-2 flex items-center justify-between gap-4">
            <div class="text-sm font-semibold text-gray-900">WhatsApp</div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="
                whatsappEnabled ? 'bg-success-light text-success-text' : 'bg-gray-100 text-gray-500'
              "
            >
              {{
                whatsappEnabled ? $t('settings.channel_active') : $t('settings.channel_inactive')
              }}
            </span>
          </div>
          <p class="mb-2 text-[12.5px] text-gray-500">{{ $t('settings.whatsapp_sub') }}</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
            <UiInput
              v-model="whatsappPhoneNumber"
              class="flex-1"
              placeholder="+33612345678"
              :error="whatsappError"
              :disabled="whatsappSaving"
            />
            <div class="flex shrink-0 gap-2">
              <UiButton
                variant="secondary"
                size="sm"
                :loading="whatsappSaving"
                @click="saveWhatsapp"
              >
                {{ whatsappEnabled ? $t('settings.update') : $t('settings.activate') }}
              </UiButton>
              <UiButton
                v-if="whatsappEnabled"
                variant="ghost"
                size="sm"
                :disabled="whatsappSaving"
                @click="disableWhatsapp"
              >
                {{ $t('settings.deactivate') }}
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Test send -->
        <div class="flex items-center justify-between gap-4 border-b border-gray-100 py-3.5">
          <div>
            <div class="text-sm font-semibold text-gray-900">
              {{ $t('settings.test_send_label') }}
            </div>
            <div class="text-[12.5px] text-gray-500">{{ $t('settings.test_send_sub') }}</div>
          </div>
          <UiButton variant="secondary" size="sm" :loading="testSending" @click="sendTest">
            {{ $t('settings.test_send_button') }}
          </UiButton>
        </div>

        <!-- Frequency (fixed to one daily send for now) -->
        <div class="flex items-center justify-between gap-4 pt-3.5">
          <div>
            <div class="text-sm font-semibold text-gray-900">
              {{ $t('settings.frequency_label') }}
            </div>
            <div class="text-[12.5px] text-gray-500">{{ $t('settings.frequency_fixed_hint') }}</div>
          </div>
          <UiSelect
            class="w-44"
            disabled
            :model-value="$t('settings.frequency_daily')"
            :options="[$t('settings.frequency_daily')]"
          />
        </div>
      </template>
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
