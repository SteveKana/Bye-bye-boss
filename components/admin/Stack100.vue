<script setup>
// One 100 % bar split in coloured parts, with an HTML legend (label + share)
// underneath so it wraps properly on a phone.
// parts: [{ label, value, color }]
const props = defineProps({
  parts: { type: Array, required: true },
  ariaLabel: { type: String, default: 'Répartition' },
})

const el = ref(null)
const { width } = useElementSize(el)
const w = computed(() => Math.max(width.value || 560, 240))

const geo = computed(() => {
  const total = props.parts.reduce((a, p) => a + p.value, 0)
  let x = 0
  const rows = props.parts
    .filter((p) => p.value > 0)
    .map((p) => {
      const ww = ((w.value - 4) * p.value) / (total || 1)
      const row = {
        label: p.label,
        color: p.color,
        x: r1(x),
        w: r1(Math.max(ww - 2, 2)),
        value: p.value,
        share: Math.round((100 * p.value) / (total || 1)),
        showValue: ww >= 34,
      }
      x += ww
      return row
    })
  return { total, rows }
})
</script>

<template>
  <div ref="el" class="w-full">
    <svg :viewBox="`0 0 ${w} 40`" :width="w" height="40" role="img" :aria-label="ariaLabel">
      <g v-for="r in geo.rows" :key="r.label">
        <rect :x="r.x" y="4" :width="r.w" height="32" rx="6" :fill="r.color">
          <title>{{ r.label }} : {{ r.value }} ({{ r.share }} %)</title>
        </rect>
        <text v-if="r.showValue" :x="r.x + 10" y="25" font-size="13" font-weight="700" fill="#fff">
          {{ fmtInt(r.value) }}
        </text>
      </g>
    </svg>
    <ul class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-ink/75">
      <li v-for="r in geo.rows" :key="r.label" class="flex items-center">
        <i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px]" :style="{ background: r.color }" />
        {{ r.label }} ({{ r.share }} %)
      </li>
    </ul>
  </div>
</template>
