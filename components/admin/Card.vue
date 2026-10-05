<script setup>
// Surface used by every block of the admin area.
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="min-w-0 rounded-2xl border-2 border-ink bg-white p-4 sm:p-5">
    <header v-if="title || subtitle || $slots.header" class="mb-3">
      <slot name="header">
        <h2 v-if="title" class="text-md font-black text-ink">{{ title }}</h2>
        <p v-if="subtitle" class="mt-0.5 text-xs font-medium text-ink/60">{{ subtitle }}</p>
      </slot>
    </header>
    <slot />
  </section>
</template>
