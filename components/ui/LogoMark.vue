<script setup>
// The Bye Bye Boss mark, used everywhere the old "BB" square badge was
// (header, sidebar, footer, auth screens) plus the site favicon
// (public/logo.svg + PNG fallbacks, wired in nuxt.config.js). Transparent PNG so it
// reads correctly on both light and dark surfaces.
defineProps({
  size: { type: Number, default: 32 },
})
</script>

<template>
  <img
    src="/logo.png"
    alt="Bye Bye Boss"
    class="shrink-0 object-contain"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>
