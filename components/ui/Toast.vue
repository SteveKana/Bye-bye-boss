<script setup>
// Single toast card. Variant drives the accent (token-based). Exposes an
// optional undo action alongside the close button.
const props = defineProps({
  toast: { type: Object, required: true },
})

defineEmits(['dismiss', 'undo'])

const variants = {
  success: {
    icon: '✓',
    badge: 'bg-success text-white',
    bg: 'bg-success-light border-success/30',
    text: 'text-success-text',
  },
  danger: {
    icon: '✕',
    badge: 'bg-danger text-white',
    bg: 'bg-danger-light border-danger/30',
    text: 'text-danger',
  },
  warning: {
    icon: '!',
    badge: 'bg-warning text-white',
    bg: 'bg-warning-light border-warning/30',
    text: 'text-warning',
  },
  info: {
    icon: 'ℹ',
    badge: 'bg-brand text-white',
    bg: 'bg-brand-light border-brand/30',
    text: 'text-brand-text',
  },
}

const style = computed(() => variants[props.toast.variant] || variants.info)
</script>

<template>
  <div
    class="flex w-full max-w-sm items-start gap-3 rounded-lg border-2 px-4 py-3.5 shadow-lg"
    :class="style.bg"
    role="alert"
  >
    <span
      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      :class="style.badge"
      aria-hidden="true"
    >
      {{ style.icon }}
    </span>

    <p class="flex-1 pt-0.5 text-sm font-semibold" :class="style.text">{{ toast.message }}</p>

    <button
      v-if="toast.undo"
      type="button"
      class="shrink-0 text-sm font-bold underline"
      :class="style.text"
      @click="$emit('undo')"
    >
      {{ toast.undoLabel }}
    </button>

    <button
      type="button"
      class="shrink-0 opacity-50 hover:opacity-100"
      :class="style.text"
      aria-label="Fermer"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>
