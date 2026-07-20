<script setup>
// Live countdown. Primary use case: the rescoring button 24h cooldown, wired on
// `dernier_rescoring_le` (from) + a `hours` window. Falls back to an explicit
// `until` end time when provided.
//
// Emits `finished` when the window elapses. Default slot is scoped, exposing
// { hours, minutes, seconds, finished, formatted } to drive custom UI.
import { useNow } from '@vueuse/core'

const props = defineProps({
  // Start reference, e.g. `dernier_rescoring_le`. Combined with `hours`.
  from: { type: [Date, String, Number], default: null },
  // Window length in hours applied to `from` (default: 24h rescoring window).
  hours: { type: Number, default: 24 },
  // Explicit end time; overrides `from` + `hours` when provided.
  until: { type: [Date, String, Number], default: null },
})

const emit = defineEmits(['finished'])

const now = useNow({ interval: 1000 })

function toMs(value) {
  if (value == null) return null
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

const target = computed(() => {
  const explicit = toMs(props.until)
  if (explicit != null) return explicit
  const start = toMs(props.from)
  if (start == null) return null
  return start + props.hours * 3600 * 1000
})

const remaining = computed(() =>
  target.value == null ? 0 : Math.max(0, target.value - now.value.getTime()),
)

const finished = computed(() => remaining.value <= 0)

const parts = computed(() => {
  const total = Math.floor(remaining.value / 1000)
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
})

const pad = (n) => String(n).padStart(2, '0')
const formatted = computed(
  () => `${pad(parts.value.hours)}:${pad(parts.value.minutes)}:${pad(parts.value.seconds)}`,
)

// Fire once when the window elapses.
watch(finished, (done) => {
  if (done) emit('finished')
})
</script>

<template>
  <ClientOnly>
    <span class="tabular-nums" :class="finished ? 'text-success-text' : 'text-gray-700'">
      <slot
        :hours="parts.hours"
        :minutes="parts.minutes"
        :seconds="parts.seconds"
        :finished="finished"
        :formatted="formatted"
      >
        {{ finished ? 'Disponible' : formatted }}
      </slot>
    </span>
    <template #fallback>
      <span class="tabular-nums text-gray-400">--:--:--</span>
    </template>
  </ClientOnly>
</template>
