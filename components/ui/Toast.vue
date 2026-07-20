<script setup>
// Single toast card. Variant drives the accent (token-based). Exposes an
// optional undo action alongside the close button.
const props = defineProps({
  toast: { type: Object, required: true },
})

defineEmits(['dismiss', 'undo'])

const variants = {
  success: { icon: '✓', accent: 'text-success-text', border: 'border-l-success' },
  danger: { icon: '✕', accent: 'text-danger', border: 'border-l-danger' },
  warning: { icon: '!', accent: 'text-warning', border: 'border-l-warning' },
  info: { icon: 'ℹ', accent: 'text-brand', border: 'border-l-brand' },
}

const style = computed(() => variants[props.toast.variant] || variants.info)
</script>

<template>
  <div
    class="flex w-full max-w-sm items-start gap-3 rounded-md border border-gray-100 border-l-4 bg-white px-4 py-3 shadow-card"
    :class="style.border"
    role="alert"
  >
    <span class="mt-0.5 text-base font-bold" :class="style.accent" aria-hidden="true">
      {{ style.icon }}
    </span>

    <p class="flex-1 text-sm text-gray-800">{{ toast.message }}</p>

    <button
      v-if="toast.undo"
      type="button"
      class="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark"
      @click="$emit('undo')"
    >
      {{ toast.undoLabel }}
    </button>

    <button
      type="button"
      class="shrink-0 text-gray-400 hover:text-gray-600"
      aria-label="Fermer"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>
