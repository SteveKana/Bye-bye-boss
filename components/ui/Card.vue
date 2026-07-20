<script setup>
// Surface container with the card shadow token. Optional title/subtitle plus
// `header` and `footer` slots for richer layouts.
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // Removes the inner padding when a slot needs edge-to-edge content (tables…).
  flush: { type: Boolean, default: false },
})

const slots = useSlots()
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
    <header v-if="title || subtitle || slots.header" class="border-b border-gray-100 px-5 py-4">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-bold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-0.5 text-sm text-gray-500">{{ subtitle }}</p>
      </slot>
    </header>

    <div :class="flush ? '' : 'px-5 py-4'">
      <slot />
    </div>

    <footer v-if="slots.footer" class="border-t border-gray-100 px-5 py-4">
      <slot name="footer" />
    </footer>
  </section>
</template>
