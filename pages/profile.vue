<script setup>
definePageMeta({ layout: 'app', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.profile')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

const loading = ref(true)
const reuploading = ref(false)
const reuploadFilename = ref('')
const fileInput = ref(null)
const editingAvailability = ref(false)
const availabilityJustSaved = ref(false)

const profile = computed(() => onboarding.profile)

const initials = computed(() => {
  const f = profile.value?.first_name?.[0] || ''
  const l = profile.value?.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
})

const updatedAgo = computed(() => {
  if (!profile.value?.updated_at) return ''
  const days = Math.floor((Date.now() - new Date(profile.value.updated_at)) / 86400000)
  if (days <= 0) return t('profileCv.updated_today')
  if (days === 1) return t('profileCv.updated_yesterday')
  return t('profileCv.updated_days', { days })
})

const availabilityLabel = computed(() => {
  if (!profile.value) return ''
  const status = profile.value.availability_status || 'immediate'
  if (status === 'date' && profile.value.availability_date) {
    const formatted = new Date(profile.value.availability_date).toLocaleDateString('fr-FR')
    return t('availability.display.date', { date: formatted })
  }
  if (status === 'notice') {
    return t('availability.display.notice', { months: profile.value.notice_period_months })
  }
  return t(`availability.display.${status}`)
})

onMounted(async () => {
  try {
    await onboarding.fetchProfile()
  } catch {
    // No CV imported yet -- send the user to the importer instead of
    // showing an empty profile page.
    await navigateTo('/onboarding/upload')
    return
  } finally {
    loading.value = false
  }
})

async function saveField(field, value) {
  try {
    await onboarding.updateProfile({ [field]: value })
    // No success toast here on purpose: ProfileEditableField already gives
    // its own inline pencil→checkmark confirmation right at the field
    // itself. Stacking a toast on top of that was reported as confusing --
    // two confirmations firing for one action.
  } catch (err) {
    toast.error(err?.message || t('profileCv.save_error'))
  }
}

async function saveAvailability({ status, date, noticeMonths }) {
  try {
    await onboarding.updateProfile({
      availability_status: status,
      availability_date: date,
      notice_period_months: noticeMonths,
    })
    // No toast here either, same reasoning as saveField -- the inline
    // "✓ Enregistré" badge next to the field is the confirmation.
    availabilityJustSaved.value = true
    setTimeout(() => (availabilityJustSaved.value = false), 2000)
    // Collapse back to the compact pencil view, like every other editable
    // field does after a save -- safe now that commit only fires once the
    // choice is actually complete (immediate/unavailable picked directly,
    // or a date/notice length chosen), never on a bare radio click.
    editingAvailability.value = false
  } catch (err) {
    toast.error(err?.message || t('profileCv.save_error'))
  }
}

function triggerReupload() {
  fileInput.value?.click()
}

async function onReupload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  reuploadFilename.value = file.name
  reuploading.value = true
  try {
    await onboarding.uploadCv(file)
    await navigateTo('/onboarding/verification')
  } catch (err) {
    reuploading.value = false
    toast.error(err?.message || t('profileCv.upload_error'))
  }
}

// The original CV file isn't stored server-side (only the text extracted
// from it), so there is nothing to download yet -- honest placeholder
// rather than a broken download.
const downloading = ref(false)
async function downloadCv() {
  downloading.value = true
  try {
    const blob = await useApi()('cv/download', { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = profile.value?.cv_filename || 'cv.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    toast.error(err?.message || t('profileCv.download_error'))
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div v-if="!loading && profile">
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('profileCv.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('profileCv.subtitle') }}</p>
    </div>

    <!-- Identity -->
    <UiCard class="mb-4">
      <div class="mb-1 flex items-center gap-3.5">
        <span
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white"
        >
          {{ initials }}
        </span>
        <div>
          <ProfileEditableField
            :model-value="`${profile.first_name || ''} ${profile.last_name || ''}`.trim()"
            text-class="text-[17px] font-extrabold text-navy"
            @commit="
              (v) => {
                const [first, ...rest] = v.split(' ')
                saveField('first_name', first)
                if (rest.length) saveField('last_name', rest.join(' '))
              }
            "
          />
          <ProfileEditableField
            :model-value="profile.headline || ''"
            text-class="text-[13px] text-gray-500"
            class="mt-0.5"
            @commit="(v) => saveField('headline', v)"
          />
        </div>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <ProfileEditableField
          :label="$t('profileCv.email')"
          :model-value="profile.email || ''"
          @commit="(v) => saveField('email', v)"
        />
        <div>
          <div class="mb-1 text-[11px] text-gray-400">{{ $t('profileCv.location') }}</div>
          <ProfileCityAutocomplete
            :model-value="profile.location || ''"
            @commit="(v) => saveField('location', v)"
          />
        </div>
      </div>

      <div class="mt-4">
        <div class="mb-1 flex items-center gap-2 text-[11px] text-gray-400">
          {{ $t('profileCv.availability') }}
          <Transition name="fade">
            <span
              v-if="availabilityJustSaved"
              class="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-bold text-success-text"
            >
              ✓ {{ $t('profileCv.saved') }}
            </span>
          </Transition>
        </div>
        <ProfileAvailabilityField
          v-if="editingAvailability"
          :status="profile.availability_status"
          :date="profile.availability_date"
          :notice-months="profile.notice_period_months"
          @commit="saveAvailability"
        />
        <span
          v-else
          class="inline-flex cursor-pointer items-center gap-1.5 text-[13.5px] font-semibold text-gray-900"
          @click="editingAvailability = true"
        >
          {{ availabilityLabel }}
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center rounded text-gray-300 hover:bg-brand-light hover:text-brand"
            :aria-label="$t('profileCv.edit_fields')"
          >
            ✎
          </button>
        </span>
      </div>
    </UiCard>

    <!-- CV summary -->
    <UiCard>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-bold text-navy">{{ $t('profileCv.your_cv') }}</h2>
        <div class="flex gap-2.5">
          <UiButton variant="secondary" size="sm" :loading="downloading" @click="downloadCv">
            ⬇ {{ $t('profileCv.download_full') }}
          </UiButton>
          <UiButton variant="primary" size="sm" :loading="reuploading" @click="triggerReupload">
            ⬆ {{ $t('profileCv.reupload') }}
          </UiButton>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.docx"
            class="hidden"
            @change="onReupload"
          />
        </div>
      </div>

      <div
        v-if="reuploading"
        class="mb-4 flex items-center gap-3 rounded-lg border-2 border-brand/30 bg-brand-light px-4 py-3"
      >
        <span
          class="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
          aria-hidden="true"
        />
        <p class="text-sm font-semibold text-brand-text">
          {{ $t('profileCv.analyzing', { filename: reuploadFilename }) }}
        </p>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <div class="text-[11.5px] text-gray-500">{{ $t('profileCv.last_update') }}</div>
          <div class="text-lg font-extrabold text-navy">{{ updatedAgo }}</div>
        </div>
        <div>
          <div class="text-[11.5px] text-gray-500">{{ $t('profileCv.total_experience') }}</div>
          <div class="text-lg font-extrabold text-navy">{{ profile.total_experience || '—' }}</div>
        </div>
      </div>

      <div v-if="profile.skills?.length" class="flex flex-wrap gap-2">
        <span
          v-for="s in profile.skills"
          :key="s"
          class="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-text"
        >
          {{ s }}
        </span>
      </div>

      <NuxtLink
        to="/onboarding/verification"
        class="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
      >
        {{ $t('profileCv.edit_fields') }} →
      </NuxtLink>
    </UiCard>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
