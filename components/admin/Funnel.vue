<script setup>
// Funnel: one horizontal bar per step, on a blue ramp, value and note at the
// end of the bar. On narrow screens the note moves under the bar.
// items: [{ label, value, note? }]
const props = defineProps({
  items: { type: Array, required: true },
  ariaLabel: { type: String, default: 'Entonnoir' },
})

const RAMP4 = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab']
const RAMP6 = ['#86b6ef', '#5598e7', '#3987e5', '#2a78d6', '#1c5cab', '#184f95']

const el = ref(null)
const { width } = useElementSize(el)
const w = computed(() => Math.max(width.value || 560, 240))

const geo = computed(() => {
  const compact = w.value < 480
  const lw = compact ? 108 : 150
  const rowH = compact ? 56 : 38
  const ramp = props.items.length <= 4 ? RAMP4 : RAMP6
  const max = Math.max(1, props.items[0]?.value || 0, ...props.items.map((i) => i.value))
  const avail = Math.max(60, w.value - lw - (compact ? 56 : 150))
  const rows = props.items.map((it, i) => {
    const y = i * rowH + 2
    const bw = Math.max((avail * it.value) / max, 4)
    const vText = fmtInt(it.value)
    return {
      key: i,
      y,
      label: it.label,
      bw: r1(bw),
      color: ramp[i] || ramp[ramp.length - 1],
      vx: r1(lw + bw + 8),
      value: vText,
      noteX: compact ? lw : r1(lw + bw + 8 + vText.length * 8 + 6),
      noteY: compact ? y + 26 + 14 : y + 17,
      note: it.note || '',
    }
  })
  return { compact, lw, rowH, rows, h: props.items.length * rowH + 4 }
})
</script>

<template>
  <div ref="el" class="w-full">
    <svg
      :viewBox="`0 0 ${w} ${geo.h}`"
      :width="w"
      :height="geo.h"
      role="img"
      :aria-label="ariaLabel"
    >
      <g v-for="r in geo.rows" :key="r.key">
        <text :x="0" :y="r.y + 17" font-size="12" fill="#52514e">{{ r.label }}</text>
        <rect :x="geo.lw" :y="r.y" :width="r.bw" :height="26" rx="4" :fill="r.color">
          <title>{{ r.label }} : {{ r.value }}</title>
        </rect>
        <text :x="r.vx" :y="r.y + 17" font-size="13" font-weight="700" fill="#0b0b0b">
          {{ r.value }}
        </text>
        <text v-if="r.note" :x="r.noteX" :y="r.noteY" font-size="11" fill="#7a7975">
          {{ r.note }}
        </text>
      </g>
    </svg>
  </div>
</template>
