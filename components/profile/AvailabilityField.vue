<script setup>
// 4-state availability picker (immediate / a specific date / serving notice
// / unavailable), matching the reference design. Embedded inline in a card
// rather than as a standalone modal, since both places that use it
// (Profil page, onboarding verification) already provide their own
// container and save flow.
//
// "immediate" and "unavailable" need no further input, so picking either
// saves right away. "date" and "notice" need a value first -- picking the
// radio only changes which row is highlighted; the actual save (commit)
// only fires once a date or a notice length is chosen, so nothing gets
// persisted with an empty date/notice.
const props = defineProps({
  status: { type: String, default: 'immediate' },
  date: { type: String, default: null },
  noticeMonths: { type: Number, default: null },
})
const emit = defineEmits(['update:status', 'update:date', 'update:noticeMonths', 'commit'])

const NOTICE_OPTIONS = [1, 2, 3]

const OPTIONS = [
  { value: 'immediate', labelKey: 'availability.opt_immediate', tone: 'success' },
  { value: 'date', labelKey: 'availability.opt_date', tone: 'danger' },
  { value: 'notice', labelKey: 'availability.opt_notice', tone: 'danger' },
  { value: 'unavailable', labelKey: 'availability.opt_unavailable', tone: 'danger' },
]

// Visual selection, separate from the last *saved* status -- lets picking
// "date" or "notice" highlight that row immediately without saving
// anything until a value is actually provided.
const localStatus = ref(props.status)
watch(
  () => props.status,
  (v) => (localStatus.value = v)
)

const infoKey = computed(() => {
  switch (localStatus.value) {
    case 'immediate':
      return 'availability.info_immediate'
    case 'date':
      return props.date ? 'availability.info_date' : 'availability.info_date_pending'
    case 'notice':
      return props.noticeMonths ? 'availability.info_notice' : 'availability.info_notice_pending'
    default:
      return 'availability.info_unavailable'
  }
})

const formattedDate = computed(() =>
  props.date ? new Date(props.date).toLocaleDateString('fr-FR') : ''
)

function select(value) {
  localStatus.value = value
  if (value !== 'immediate' && value !== 'unavailable') return
  emit('update:status', value)
  emit('commit', { status: value, date: null, noticeMonths: null })
}

function onDateChange(value) {
  localStatus.value = 'date'
  emit('update:status', 'date')
  emit('update:date', value)
  emit('commit', { status: 'date', date: value, noticeMonths: null })
}

function onNoticeChange(value) {
  const months = Number(value)
  localStatus.value = 'notice'
  emit('update:status', 'notice')
  emit('update:noticeMonths', months)
  emit('commit', { status: 'notice', date: null, noticeMonths: months })
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-2.5">
      <div v-for="opt in OPTIONS" :key="opt.value" class="flex items-center gap-3 py-1.5">
        <button
          type="button"
          role="radio"
          :aria-checked="localStatus === opt.value"
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          :class="localStatus === opt.value ? 'border-brand' : 'border-gray-300'"
          @click="select(opt.value)"
        >
          <span v-if="localStatus === opt.value" class="h-2.5 w-2.5 rounded-full bg-brand" />
        </button>

        <span
          class="cursor-pointer rounded-full px-3 py-1 text-[13px] font-semibold"
          :class="
            opt.tone === 'success'
              ? 'bg-success-light text-success-text'
              : 'bg-danger-light text-danger'
          "
          @click="select(opt.value)"
        >
          {{ $t(opt.labelKey) }}
        </span>

        <input
          v-if="opt.value === 'date'"
          type="date"
          class="rounded-md border-[1.5px] border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-900 outline-none focus:border-brand"
          :value="date || ''"
          @focus="localStatus = 'date'"
          @change="onDateChange($event.target.value)"
        />

        <select
          v-if="opt.value === 'notice'"
          class="rounded-md border-[1.5px] border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-900 outline-none focus:border-brand"
          :value="noticeMonths || ''"
          @focus="localStatus = 'notice'"
          @change="onNoticeChange($event.target.value)"
        >
          <option value="" disabled>{{ $t('availability.months_placeholder') }}</option>
          <option v-for="m in NOTICE_OPTIONS" :key="m" :value="m">
            {{ $t('availability.months', { count: m }) }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-[12.5px] text-gray-600">
      <span aria-hidden="true">ⓘ</span>
      <span>{{ $t(infoKey, { date: formattedDate, months: noticeMonths }) }}</span>
    </div>
  </div>
</template>
