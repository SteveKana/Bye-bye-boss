<script setup>
// "Candidatures" page -- lists every match the candidate has a declared
// application status for. Rows normally land here on their own: clicking
// "Voir l'offre →" on the "Opportunité" detail page silently marks a match
// as "applied" (see useApplicationStatus's markApplied(), called from
// pages/opportunity/[id].vue's openExternalOffer()) -- nothing is required
// from the candidate for the common case. The status select on each row
// below is the optional manual-correction path: advancing to
// interview/offer/rejected/withdrawn, or resetting a wrong auto-mark back to
// "not_applied" (which drops the row out of this list, same as the backend
// route's docstring).
definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('app.nav.applications')} · Bye Bye Boss`) })

const api = useApi()
const toast = useToast()
const { avatarColor, initials } = useOfferDisplay()
const {
  options: statusOptions,
  badgeClass: applicationStatusBadgeClass,
  message: applicationStatusMessage,
  updateStatus,
} = useApplicationStatus()

const loading = ref(true)
const applications = ref([])

onMounted(async () => {
  try {
    applications.value = await api('matching/applications')
  } catch {
    // No profile yet, or nothing declared -- same honest empty state as a
    // real empty list, not an alarming error toast.
  } finally {
    loading.value = false
  }
})

function openMatch(item) {
  navigateTo(`/opportunity/${item.id}`)
}

// Fully controlled: the <select> below is bound to item.application_status
// directly, never a separate local ref, so a failed save leaves it showing
// exactly what's still true instead of needing a manual revert.
async function changeStatus(item, newStatus) {
  if (newStatus === item.application_status) return
  try {
    const updated = await updateStatus(item.id, newStatus)
    if (newStatus === 'not_applied') {
      // No longer a "declared" match -- the backend drops it from
      // GET /matching/applications, so it drops from this list too.
      applications.value = applications.value.filter((m) => m.id !== item.id)
      toast.info(t('candidatures.removed'))
    } else {
      item.application_status = updated.application_status
      item.application_status_updated_at = updated.application_status_updated_at
      toast.success(t('candidatures.updated'))
    }
  } catch {
    toast.error(t('candidatures.update_error'))
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-navy">{{ $t('candidatures.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('candidatures.subtitle') }}</p>
    </div>

    <UiCard>
      <div
        v-if="loading"
        role="status"
        aria-live="polite"
        class="flex flex-col items-center gap-2 py-10 text-center"
      >
        <svg
          class="h-5 w-5 animate-spin text-brand"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p class="text-sm font-semibold text-navy">{{ $t('candidatures.loading') }}</p>
      </div>

      <p v-else-if="!applications.length" class="py-10 text-center text-sm text-gray-400">
        {{ $t('candidatures.empty') }}
      </p>

      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="item in applications"
          :key="item.id"
          class="flex flex-wrap items-center gap-4 py-3.5 sm:flex-nowrap"
        >
          <span
            class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
            :style="{
              background: avatarColor(
                item.company_name || item.offer.company_name || item.offer.title
              ),
            }"
            @click="openMatch(item)"
          >
            {{ initials(item.company_name || item.offer.company_name) }}
          </span>

          <div
            class="min-w-0 flex-1 cursor-pointer"
            role="button"
            tabindex="0"
            @click="openMatch(item)"
            @keydown.enter="openMatch(item)"
          >
            <div class="truncate text-sm font-bold text-navy hover:text-brand">
              {{ item.offer.title }}
            </div>
            <div class="truncate text-[12.5px] text-gray-500">
              {{ item.company_name || item.offer.company_name }}
              <template v-if="item.offer.location"> · {{ item.offer.location }}</template>
            </div>
            <div v-if="item.application_status_updated_at" class="mt-1 text-[11px] text-gray-400">
              {{
                applicationStatusMessage(
                  item.application_status,
                  item.application_status_updated_at
                )
              }}
            </div>
          </div>

          <span
            class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
            :class="applicationStatusBadgeClass(item.application_status)"
          >
            {{ $t(`applicationStatus.${item.application_status}`) }}
          </span>

          <div class="w-full shrink-0 sm:w-44" @click.stop>
            <UiSelect
              :model-value="item.application_status"
              :options="statusOptions"
              @update:model-value="(value) => changeStatus(item, value)"
            />
          </div>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
