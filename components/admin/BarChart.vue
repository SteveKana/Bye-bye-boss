<script setup>
// Single-series vertical bars: thin, rounded tops, light grid, direct value
// labels when there are few bars, native tooltips via <title>.
// items: [{ label, value, title? }]
const props = defineProps({
  items: { type: Array, required: true },
  color: { type: String, default: '#2a78d6' },
  height: { type: Number, default: 190 },
  ariaLabel: { type: String, default: 'Graphique en barres' },
})

const el = ref(null)
const { width } = useElementSize(el)
const w = computed(() => Math.max(width.value || 560, 240))

const PL = 34
const PR = 8
const PT = 16
const PB = 24

const geo = computed(() => {
  const n = props.items.length
  const iw = w.value - PL - PR
  const ih = props.height - PB - PT
  const max = Math.max(0, ...props.items.map((i) => i.value))
  const scale = niceScale(max, { integer: true })
  const bw = n ? iw / n : iw
  const barW = bw * 0.64
  const showValues = n <= 14 && barW >= 14
  const every = Math.max(1, Math.ceil(46 / bw))

  const grid = Array.from({ length: scale.ticks + 1 }, (_, t) => ({
    y: r1(PT + ih - (ih * t) / scale.ticks),
    label: fmtInt(scale.step * t),
  }))
  const bars = props.items.map((it, i) => {
    const x = PL + i * bw + bw * 0.18
    const h = (ih * it.value) / scale.max
    return {
      key: i,
      x: r1(x),
      cx: r1(x + barW / 2),
      top: r1(PT + ih - h),
      value: it.value,
      path: it.value > 0 ? barPath(r1(x), r1(PT + ih - h), r1(barW), PT + ih) : '',
      title: it.title || `${it.label} : ${fmtInt(it.value)}`,
      label: (n - 1 - i) % every === 0 ? it.label : '',
    }
  })
  return { grid, bars, showValues, ih }
})
</script>

<template>
  <div ref="el" class="w-full">
    <svg
      :viewBox="`0 0 ${w} ${height}`"
      :width="w"
      :height="height"
      role="img"
      :aria-label="ariaLabel"
    >
      <g v-for="g in geo.grid" :key="g.y">
        <line :x1="PL" :x2="w - PR" :y1="g.y" :y2="g.y" stroke="#e7e6e2" stroke-width="1" />
        <text :x="PL - 6" :y="g.y + 3" text-anchor="end" font-size="10" fill="#7a7975">
          {{ g.label }}
        </text>
      </g>
      <g v-for="b in geo.bars" :key="b.key">
        <path v-if="b.path" :d="b.path" :fill="color">
          <title>{{ b.title }}</title>
        </path>
        <text
          v-if="geo.showValues && b.value > 0"
          :x="b.cx"
          :y="b.top - 4"
          text-anchor="middle"
          font-size="11"
          font-weight="700"
          fill="#0b0b0b"
        >
          {{ b.value }}
        </text>
        <text
          v-if="b.label"
          :x="b.cx"
          :y="height - 8"
          text-anchor="middle"
          font-size="10"
          fill="#7a7975"
        >
          {{ b.label }}
        </text>
      </g>
    </svg>
  </div>
</template>
