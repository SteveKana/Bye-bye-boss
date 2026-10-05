<script setup>
// Base button. Token-based styling only — never hardcode colors here.
// Variants map to the brand/semantic tokens defined in tailwind.config.js.
defineProps({
  // primary | secondary | sun | ghost | danger
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
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-white text-ink hover:bg-lav',
  sun: 'bg-sun text-ink hover:brightness-95',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-lav',
  danger: 'bg-danger text-white hover:brightness-95',
}

const sizes = {
  sm: 'text-sm px-4 py-1.5',
  md: 'text-base px-5 py-2.5',
  lg: 'text-md px-6 py-3',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
