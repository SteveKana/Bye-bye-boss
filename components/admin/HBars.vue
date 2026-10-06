<script setup>
// Horizontal bars with the value written at the end of each bar. A row can
// carry a second, red "failed" segment (alerts) and a small note.
// items: [{ label, value, failed?, note? }]
const props = defineProps({
  items: { type: Array, required: true },
  color: { type: String, default: '#2a78d6' },
  failColor: { type: String, default: '#d03b3b' },
  labelWidth: { type: Number, default: 110 },
  ariaLabel: { type: String, default: 'Graphique en barres horizontales' },
})

const el = ref(null)
const { width } = useElementSize(el)
const w = computed(() => Math.max(width.value || 560, 240))

const ROW = 34

const geo = computed(() => {
  const lw = w.value < 420 ? Math.min(props.labelWidth, 92) : props.labelWidth
  const reserve = w.value < 420 ? 96 : 130
  const max = Math.max(1, ...props.items.map((i) => i.value + (i.failed || 0)))
  const scale = Math.max(40, w.value - lw - reserve) / max
  const rows = props.items.map((it, idx) => {
    const y = idx * ROW + 2
    const failed = it.failed || 0
    const okW = it.value > 0 ? Math.max(it.value * scale, 3) : 0
    const koW = failed > 0 ? Math.max(failed * scale, 3) : 0
    const endX = lw + okW + (okW && koW ? 2 : 0) + koW
    return {
      key: idx,
      y,
      label: it.label,
      okW: r1(okW),
      koW: r1(koW),
      koX: r1(lw + okW + (okW ? 2 : 0)),
      textX: r1((endX || lw) + 8),
      value: it.value,
      failed,
      note: it.note || (failed ? `· ${failed} ✕ échec${failed > 1 ? 's' : ''}` : ''),
      title: `${it.label} : ${fmtInt(it.value)}`,
      failTitle: `${it.label} · échecs : ${fmtInt(failed)}`,
    }
  })
  return { lw, rows, h: props.items.length * ROW + 4 }
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
        <text :x="0" :y="r.y + 16" font-size="12" fill="#52514e">{{ r.label }}</text>
        <rect v-if="r.okW" :x="geo.lw" :y="r.y" :width="r.okW" :height="22" rx="4" :fill="color">
          <title>{{ r.title }}</title>
        </rect>
        <rect v-if="r.koW" :x="r.koX" :y="r.y" :width="r.koW" :height="22" rx="4" :fill="failColor">
          <title>{{ r.failTitle }}</title>
        </rect>
        <text :x="r.textX" :y="r.y + 16" font-size="13" font-weight="700" fill="#0b0b0b">
          {{ fmtInt(r.value) }}
          <tspan v-if="r.note" dx="6" font-size="11" font-weight="400" fill="#7a7975">
            {{ r.note }}
          </tspan>
        </text>
      </g>
    </svg>
  </div>
</template>
