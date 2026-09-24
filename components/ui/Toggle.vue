<script setup>
// Small on/off switch. "On" uses the success/green token (same color as the
// "Actif" status pill next to Discord/WhatsApp on the settings page) rather
// than the brand violet, which read as too heavy/loud for a switch that's
// flipped on by default. v-model compatible (Boolean).
//
// The knob sits in normal flow (inline-block, centered by the track's
// inline-flex) instead of being absolutely positioned. An absolutely
// positioned knob with no explicit left/right has to fall back to a
// browser-computed "static position" for its starting point, and that
// fallback did not land at the track's left edge as intended -- it landed
// far enough to the right that translating it further for the "on" state
// pushed it fully outside the track. Normal flow gives the knob a
// deterministic starting position, so only the translate-x slide is needed.
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
    class="inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    :class="modelValue ? 'bg-success' : 'bg-gray-200'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform"
      :class="modelValue ? 'translate-x-[22px]' : 'translate-x-0.5'"
      aria-hidden="true"
    />
  </button>
</template>
