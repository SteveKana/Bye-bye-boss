<script setup>
// "Analyse en cours" tag: a pulsing dot + a soft breathing tag so an offer that is
// still being scored visibly looks alive. Animations switch off for visitors who
// asked their system to reduce motion.
defineProps({
  // sm: dashboard cards; md: opportunities list
  size: { type: String, default: 'sm' },
})
</script>

<template>
  <span
    role="status"
    class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white font-extrabold text-ink motion-safe:animate-pulse"
    :class="size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]'"
  >
    <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
      <span
        class="absolute inline-flex h-full w-full rounded-full bg-brand opacity-75 motion-safe:animate-ping"
      />
      <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
    </span>
    <slot />
  </span>
</template>
