<script setup>
// KPI tile: label, big value, small caption. `flag` adds a coloured note.
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  sub: { type: String, default: '' },
  flag: { type: String, default: '' },
  // bad | warn | ok
  flagState: { type: String, default: 'bad' },
})

const flagClass = {
  bad: 'text-[#a32525]',
  warn: 'text-[#7a5200]',
  ok: 'text-[#006300]',
}
</script>

<template>
  <div class="min-w-0 rounded-2xl border-2 border-ink bg-white p-3.5">
    <div class="min-h-[2rem] text-xs font-extrabold leading-snug text-ink/70">{{ label }}</div>
    <div class="my-0.5 text-[28px] font-black leading-tight text-ink">{{ value }}</div>
    <div class="text-xs font-medium text-ink/60">{{ sub }}</div>
    <div v-if="flag" class="mt-1 text-xs font-extrabold" :class="flagClass[flagState]">
      {{ flag }}
    </div>
  </div>
</template>
