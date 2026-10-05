<script setup>
// Surface container: thick ink outline, big rounded corners. Optional
// title/subtitle plus `header` and `footer` slots for richer layouts.
// `tone` colours the whole block (the playful sun / lavender / blush panels).
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // Removes the inner padding when a slot needs edge-to-edge content (tables…).
  flush: { type: Boolean, default: false },
  // white | sun | lav | blush
  tone: { type: String, default: 'white' },
})

const slots = useSlots()

const tones = {
  white: 'bg-white',
  sun: 'bg-sun',
  lav: 'bg-lav',
  blush: 'bg-blush',
}
</script>

<template>
  <section
    class="rounded-[22px] border-[2.5px] border-ink"
    :class="[tones[tone] || tones.white, flush ? 'overflow-hidden' : '']"
  >
    <header v-if="title || subtitle || slots.header" class="border-b-2 border-ink/10 px-5 py-4">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-black text-ink">{{ title }}</h3>
        <p v-if="subtitle" class="mt-0.5 text-sm font-medium text-ink/60">{{ subtitle }}</p>
      </slot>
    </header>

    <div :class="flush ? '' : 'px-5 py-4'">
      <slot />
    </div>

    <footer v-if="slots.footer" class="border-t-2 border-ink/10 px-5 py-4">
      <slot name="footer" />
    </footer>
  </section>
</template>
