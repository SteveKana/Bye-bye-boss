<script setup>
// Status pill. Always icon + text: the colour never carries the meaning alone.
const props = defineProps({
  // ok | warn | bad | info
  state: { type: String, default: 'info' },
  text: { type: String, default: '' },
})

const icons = { ok: '✓', warn: '!', bad: '✕', info: '•' }
const classes = {
  ok: 'bg-[#e1f3e1] text-[#006300]',
  warn: 'bg-[#fff0cc] text-[#7a5200]',
  bad: 'bg-[#fbe0e0] text-[#a32525]',
  info: 'bg-[#e6eefb] text-[#184f95]',
}
const icon = computed(() => icons[props.state] || icons.info)
</script>

<template>
  <span
    class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-extrabold"
    :class="classes[state] || classes.info"
  >
    <span aria-hidden="true">{{ icon }}</span>
    <slot>{{ text }}</slot>
  </span>
</template>
