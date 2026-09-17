<script setup>
// Base button. Token-based styling only — never hardcode colors here.
// Variants map to the brand/semantic tokens defined in tailwind.config.js.
defineProps({
  // primary | secondary | ghost | danger
  variant: { type: String, default: 'primary' },
  // sm | md | lg
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

defineEmits(['click'])

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-soft',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-danger text-white hover:brightness-95',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded',
  md: 'text-base px-4 py-2.5 rounded-md',
  lg: 'text-md px-5 py-3 rounded-md',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    :class="[variants[variant], sizes[size], block && 'w-full']"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
