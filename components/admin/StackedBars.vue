<script setup>
// Stacked vertical bars (one bar per day, one segment per series). Segments are
// separated by a 2px gap, only the top segment has rounded corners.
// series: [{ key, label, color }]   days: [{ label, values: { [key]: number } }]
const props = defineProps({
  series: { type: Array, required: true },
  days: { type: Array, required: true },
  height: { type: Number, default: 190 },
  // formats axis ticks and tooltips
  format: { type: Function, default: fmtInt },
  // number of decimals needed on the axis (0 for counts)
  integer: { type: Boolean, default: true },
  ariaLabel: { type: String, default: 'Graphique en barres empilées' },
})

const el = ref(null)
const { width } = useElementSize(el)
const w = computed(() => Math.max(width.value || 560, 240))

const PR = 8
const PT = 16
const PB = 24
const GAP = 2

const pl = computed(() => (props.integer ? 40 : 52))

const geo = computed(() => {
  const n = props.days.length
  const left = pl.value
  const iw = w.value - left - PR
  const ih = props.height - PB - PT
  const totals = props.days.map((d) =>
    props.series.reduce((acc, s) => acc + (d.values?.[s.key] || 0), 0)
  )
  const scale = niceScale(Math.max(0, ...totals), { integer: props.integer })
  const bw = n ? iw / n : iw
  const barW = bw * 0.6
  const every = Math.max(1, Math.ceil(46 / bw))
  const showTotals = n <= 14 && barW >= 18

  const grid = Array.from({ length: scale.ticks + 1 }, (_, t) => ({
    y: r1(PT + ih - (ih * t) / scale.ticks),
    label: props.format(scale.step * t),
  }))

  const bars = props.days.map((d, i) => {
    const x = left + i * bw + bw * 0.2
    let cursor = PT + ih
    const segs = []
    const active = props.series.filter((s) => (d.values?.[s.key] || 0) > 0)
    active.forEach((s, k) => {
      const v = d.values[s.key]
      const full = (ih * v) / scale.max
      const h = Math.max(full - (k > 0 ? GAP : 0), 1)
      const bottom = cursor - (k > 0 ? GAP : 0)
      const top = bottom - h
      const isTop = k === active.length - 1
      segs.push({
        key: s.key,
        color: s.color,
        path: barPath(r1(x), r1(top), r1(barW), r1(bottom), isTop ? 4 : 0),
        title: `${d.label} · ${s.label} : ${props.format(v)}`,
      })
      cursor = top
    })
    return {
      key: i,
      segs,
      total: totals[i],
      cx: r1(x + barW / 2),
      top: r1(cursor),
      label: (n - 1 - i) % every === 0 ? d.label : '',
    }
  })
  return { grid, bars, showTotals, left }
})
</script>

<template>
  <div ref="el" class="w-full">
    <ul class="mb-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-xs font-medium text-ink/70">
      <li v-for="s in series" :key="s.key" class="flex items-center">
        <i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px]" :style="{ background: s.color }" />
        {{ s.label }}
      </li>
    </ul>
    <svg
      :viewBox="`0 0 ${w} ${height}`"
      :width="w"
      :height="height"
      role="img"
      :aria-label="ariaLabel"
    >
      <g v-for="g in geo.grid" :key="g.y">
        <line :x1="geo.left" :x2="w - PR" :y1="g.y" :y2="g.y" stroke="#e7e6e2" stroke-width="1" />
        <text :x="geo.left - 6" :y="g.y + 3" text-anchor="end" font-size="10" fill="#7a7975">
          {{ g.label }}
        </text>
      </g>
      <g v-for="b in geo.bars" :key="b.key">
        <path v-for="s in b.segs" :key="s.key" :d="s.path" :fill="s.color">
          <title>{{ s.title }}</title>
        </path>
        <text
          v-if="geo.showTotals && b.total > 0"
          :x="b.cx"
          :y="b.top - 4"
          text-anchor="middle"
          font-size="11"
          font-weight="700"
          fill="#0b0b0b"
        >
          {{ format(b.total) }}
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
