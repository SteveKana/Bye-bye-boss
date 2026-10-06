<script setup>
// Inline message box (success / error / info). Announced to screen readers.
defineProps({
  // ok | bad | info
  tone: { type: String, default: 'info' },
})
const classes = {
  ok: 'border-[#9fd49f] bg-[#e1f3e1] text-[#006300]',
  bad: 'border-[#efb0b0] bg-[#fbe0e0] text-[#a32525]',
  info: 'border-[#b7d3f6] bg-[#eef4fd] text-[#184f95]',
  warn: 'border-[#ecd08a] bg-[#fff0cc] text-[#7a5200]',
}
</script>

<template>
  <div
    class="rounded-xl border px-3 py-2.5 text-sm font-semibold"
    :class="classes[tone] || classes.info"
    :role="tone === 'bad' ? 'alert' : 'status'"
  >
    <slot />
  </div>
</template>
