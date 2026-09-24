<script setup>
// Small on/off switch. "On" uses the success/green token (same color as the
// "Actif" status pill next to Discord/WhatsApp on the settings page) rather
// than the brand violet, which read as too heavy/loud for a switch that's
// flipped on by default. v-model compatible (Boolean).
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  // Visible label rows already show their own text next to the switch --
  // this is only for a standalone toggle with no adjacent label.
  label: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="disabled"
    class="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    :class="modelValue ? 'bg-success' : 'bg-gray-200'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform"
      :class="modelValue ? 'translate-x-[22px]' : 'translate-x-0.5'"
      aria-hidden="true"
    />
  </button>
</template>
