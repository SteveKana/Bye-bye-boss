<script setup>
// Toggle-button group for preference pickers. `multiple` controls whether
// v-model is a single string (radio-like) or an array of strings (checkbox-like).
const props = defineProps({
  modelValue: { type: [String, Array], default: () => '' },
  options: { type: Array, required: true }, // [{ value, label }]
  multiple: { type: Boolean, default: false },
  columns: { type: Number, default: 3 },
})
const emit = defineEmits(['update:modelValue'])

function isSelected(value) {
  return props.multiple ? props.modelValue.includes(value) : props.modelValue === value
}

function toggle(value) {
  if (!props.multiple) {
    emit('update:modelValue', value)
    return
  }
  const current = props.modelValue
  emit(
    'update:modelValue',
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  )
}
</script>

<template>
  <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="flex items-center justify-center gap-2 rounded-full border-2 border-ink px-4 py-3 text-sm font-extrabold transition-colors"
      :class="isSelected(opt.value) ? 'bg-sun text-ink' : 'bg-white text-ink hover:bg-lav'"
      @click="toggle(opt.value)"
    >
      <span
        v-if="isSelected(opt.value)"
        class="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
        aria-hidden="true"
      >
        ✓
      </span>
      {{ opt.label }}
    </button>
  </div>
</template>
