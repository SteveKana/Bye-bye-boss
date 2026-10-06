<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.settings')} · Bye Bye Boss`) })

const auth = useAuthStore()

// "Tester l'envoi" is a tool for the project owner only -- other accounts never
// need it, so it stays hidden for them.
const PROJECT_OWNER_EMAIL = 'stevykana21@gmail.com'
const isProjectOwner = computed(
  () => auth.user?.email?.trim().toLowerCase() === PROJECT_OWNER_EMAIL
)
const toast = useToast()
const v = useValidators()

async function logout() {
  auth.logout()
  await navigateTo('/login')
}

const soon = () => toast.info(t('app.soon_full'))

// --- Delete account ----------------------------------------------------
const deleteModalOpen = ref(false)
const deleteConfirmEmail = ref('')
const deleting = ref(false)
const deleteEmailMatches = computed(
  () =>
    !!auth.user?.email &&
    deleteConfirmEmail.value.trim().toLowerCase() === auth.user.email.trim().toLowerCase()
)

async function confirmDeleteAccount() {
  if (!deleteEmailMatches.value || deleting.value) return
  deleting.value = true
  try {
    await auth.deleteAccount(deleteConfirmEmail.value.trim())
    // Full page load (not a client-side route change): drops everything the
    // stores still hold in memory about the deleted account.
    await navigateTo('/', { external: true })
  } catch (err) {
    toast.error(err.message || t('settings.delete_error'))
  } finally {
    deleting.value = false
  }
}

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
  // The API always stores/returns E.164 (+33...) -- shown back to the user
  // in the familiar French local format (0X XX XX XX XX) they typed it in,
  // see formatFrenchPhoneLocal below.
  whatsappPhoneNumber.value = formatFrenchPhoneLocal(prefs.whatsapp_phone_number) || ''
}

// "Activer les alertes" (dashboard, opportunités) and the links in the
// notification emails/messages land on /settings#notifications: scroll the
// Notifications card to the top of the screen and flash it, so the visitor
// isn't left at the top of the page. Runs once the preferences are loaded
// because the card's height changes while they load.
const route = useRoute()

async function scrollToNotifications() {
  if (route.hash !== '#notifications') return
  await nextTick()
  const card = document.getElementById('notifications')
  if (!card) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  card.classList.remove('highlight-pulse')
  void card.offsetWidth // restart the animation if it is already running
  card.classList.add('highlight-pulse')
  setTimeout(() => card.classList.remove('highlight-pulse'), 2400)
}

onMounted(async () => {
  try {
    applyPreferences(await notifications.fetchPreferences())
  } catch (err) {
    toast.error(err.message || t('settings.notifications_load_error'))
  } finally {
    prefsLoading.value = false
  }
  await scrollToNotifications()
})

// Already on /settings and the hash changes (e.g. a second click).
watch(() => route.hash, scrollToNotifications)

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

// Steve's call: the field should take a phone number the way every French
// person actually writes one -- "06 12 34 56 78", not "+33612345678" -- and
// the app converts to E.164 behind the scenes for WhatsApp/the API. Still
// accepts a pasted +33.../0033... value too (covers a number copied from
// somewhere else, and round-tripping an already-saved value unchanged).
const FRENCH_LOCAL_PHONE_PATTERN = /^0[1-9]\d{8}$/ // 10 digits: 0X XX XX XX XX
const E164_FRANCE_PATTERN = /^\+33[1-9]\d{8}$/

function toE164France(raw) {
  const cleaned = raw.replace(/[\s.-]/g, '')
  if (E164_FRANCE_PATTERN.test(cleaned)) return cleaned
  if (/^0033[1-9]\d{8}$/.test(cleaned)) return `+33${cleaned.slice(4)}`
  if (FRENCH_LOCAL_PHONE_PATTERN.test(cleaned)) return `+33${cleaned.slice(1)}`
  return null
}

// The reverse, for displaying an already-saved E.164 number back in the
// familiar local form -- "+33612345678" -> "06 12 34 56 78".
function formatFrenchPhoneLocal(e164) {
  if (!e164) return ''
  if (!E164_FRANCE_PATTERN.test(e164)) return e164 // not a French number -- show as-is
  const digits = `0${e164.slice(3)}`
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ')
}

async function saveWhatsapp() {
  whatsappError.value = ''
  const rawPhone = whatsappPhoneNumber.value.trim()
  if (!rawPhone) {
    whatsappError.value = t('validation.whatsapp_phone_required')
    return
  }
  const phone = toE164France(rawPhone)
  if (!phone) {
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
      <h1 class="text-2xl font-black text-ink">{{ $t('app.nav.settings') }}</h1>
      <p class="mt-1 text-sm text-ink/60">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Subscription -->
    <UiCard class="mb-4" :title="$t('settings.subscription')">
      <p class="mb-4 text-[13px] text-ink/60">{{ $t('settings.subscription_sub') }}</p>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-lav/40 p-4">
        <div>
          <span class="inline-flex items-center gap-2 font-bold text-ink">
            {{ auth.user?.subscription || $t('settings.plan_free') }}
            <span
              class="rounded-full border-2 border-ink bg-lav px-2 py-0.5 text-[10px] font-bold text-ink"
            >
              {{ $t('settings.current_plan') }}
            </span>
          </span>
          <div class="mt-1 text-[12.5px] text-ink/60">{{ $t('settings.plan_detail') }}</div>
        </div>
        <UiButton variant="primary" size="sm" @click="soon">
          ✨ {{ $t('settings.upgrade') }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Notifications -->
    <UiCard id="notifications" class="mb-4 scroll-mt-20" :title="$t('settings.notifications')">
      <p class="mb-4 text-[13px] text-ink/60">{{ $t('settings.notifications_sub') }}</p>

      <div v-if="prefsLoading" class="py-6 text-center text-sm text-ink/60">
        {{ $t('settings.loading') }}
      </div>

      <template v-else>
        <!-- Email -->
        <div class="flex items-center justify-between gap-4 border-b border-ink/15 py-3.5">
          <div>
            <div class="text-sm font-semibold text-ink">
              {{ $t('settings.channel_email') }}
            </div>
            <div class="text-[12.5px] text-ink/60">{{ $t('settings.email_sub') }}</div>
          </div>
          <UiToggle
            :model-value="emailEnabled"
            :disabled="emailSaving"
            :label="$t('settings.channel_email')"
            @update:model-value="toggleEmail"
          />
        </div>

        <!-- WhatsApp -->
        <div class="border-b border-ink/15 py-3.5">
          <div class="mb-2 flex items-center justify-between gap-4">
            <div class="text-sm font-semibold text-ink">WhatsApp</div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="whatsappEnabled ? 'bg-success-light text-success-text' : 'bg-lav text-ink/60'"
            >
              {{
                whatsappEnabled ? $t('settings.channel_active') : $t('settings.channel_inactive')
              }}
            </span>
          </div>
          <p class="mb-2 text-[12.5px] text-ink/60">{{ $t('settings.whatsapp_sub') }}</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
            <UiInput
              v-model="whatsappPhoneNumber"
              class="flex-1"
              placeholder="06 12 34 56 78"
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

        <!-- Discord -->
        <div class="border-b border-ink/15 py-3.5">
          <div class="mb-2 flex items-center justify-between gap-4">
            <div class="text-sm font-semibold text-ink">Discord</div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="discordEnabled ? 'bg-success-light text-success-text' : 'bg-lav text-ink/60'"
            >
              {{ discordEnabled ? $t('settings.channel_active') : $t('settings.channel_inactive') }}
            </span>
          </div>
          <p class="mb-2 text-[12.5px] text-ink/60">{{ $t('settings.discord_sub') }}</p>
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

        <!-- Test send -->
        <div
          v-if="isProjectOwner"
          class="flex items-center justify-between gap-4 border-b border-ink/15 py-3.5"
        >
          <div>
            <div class="text-sm font-semibold text-ink">
              {{ $t('settings.test_send_label') }}
            </div>
            <div class="text-[12.5px] text-ink/60">{{ $t('settings.test_send_sub') }}</div>
          </div>
          <UiButton variant="secondary" size="sm" :loading="testSending" @click="sendTest">
            {{ $t('settings.test_send_button') }}
          </UiButton>
        </div>

        <!-- Frequency (fixed to one daily send for now) -->
        <div class="flex items-center justify-between gap-4 pt-3.5">
          <div>
            <div class="text-sm font-semibold text-ink">
              {{ $t('settings.frequency_label') }}
            </div>
            <div class="text-[12.5px] text-ink/60">{{ $t('settings.frequency_fixed_hint') }}</div>
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
          <label class="mb-1.5 block text-sm font-semibold text-ink">
            {{ $t('common.email') }}
          </label>
          <div
            class="flex items-center rounded-xl border-2 border-ink bg-lav/40 px-3.5 py-3 text-base text-ink/60"
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

      <div class="mt-6 border-t border-ink/15 pt-5">
        <UiButton
          variant="secondary"
          class="border-danger/30 text-danger"
          @click="deleteModalOpen = true"
        >
          {{ $t('settings.delete_account') }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Delete account: irreversible, so the visitor must re-type their own
         email (Google-created accounts have no password to ask for). -->
    <UiModal
      v-model="deleteModalOpen"
      :title="$t('settings.delete_title')"
      size="sm"
      :persistent="deleting"
    >
      <p class="mb-3 text-sm text-ink/80">{{ $t('settings.delete_warning') }}</p>
      <ul class="mb-4 list-disc space-y-1 pl-5 text-[13px] text-ink/70">
        <li v-for="item in $tm('settings.delete_items')" :key="item">{{ item }}</li>
      </ul>
      <UiInput
        v-model="deleteConfirmEmail"
        :label="$t('settings.delete_confirm_label', { email: auth.user?.email })"
        type="email"
        autocomplete="off"
        @keyup.enter="confirmDeleteAccount"
      />
      <template #footer="{ close }">
        <div class="flex justify-end gap-3">
          <UiButton variant="secondary" :disabled="deleting" @click="close">
            {{ $t('settings.delete_cancel') }}
          </UiButton>
          <UiButton
            variant="primary"
            class="!bg-danger"
            :loading="deleting"
            :disabled="!deleteEmailMatches"
            @click="confirmDeleteAccount"
          >
            {{ $t('settings.delete_confirm_button') }}
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Language -->
    <UiCard :title="$t('profile.preferences')">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-ink">{{ $t('lang.label') }}</div>
          <div class="text-[13px] text-ink/60">{{ $t('profile.language_hint') }}</div>
        </div>
        <UiLangSwitcher />
      </div>
    </UiCard>

    <!-- Logout: on mobile the side menu (and its logout button) doesn't
         exist, so it lives here. -->
    <UiButton class="lg:hidden" variant="secondary" block @click="logout">
      {{ $t('app.logout') }}
    </UiButton>
  </div>
</template>
