<script setup>
// Native select styled with the mockup chevron. Accepts either an array of
// strings or an array of { label, value } objects. v-model compatible.
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const uid = useId()
const inputId = computed(() => props.id || uid)
const describedBy = computed(() => {
  if (props.error) return `${inputId.value}-error`
  if (props.hint) return `${inputId.value}-hint`
  return undefined
})

// Normalize both shapes into { label, value }.
const normalized = computed(() =>
  props.options.map((opt) =>
    typeof opt === 'object' && opt !== null
      ? { label: opt.label ?? String(opt.value), value: opt.value }
      : { label: String(opt), value: opt },
  ),
)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="mb-1.5 block text-sm font-semibold text-gray-900">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <select
      :id="inputId"
      :name="name"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      class="ui-select w-full appearance-none rounded-md border-[1.5px] bg-white py-3 pl-3.5 pr-9 text-base text-gray-900 outline-none transition focus:shadow-focus-ring disabled:cursor-not-allowed disabled:bg-gray-50"
      :class="error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand'"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in normalized" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <p v-if="error" :id="`${inputId}-error`" class="mt-1.5 text-sm text-danger">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="mt-1.5 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
/* Chevron drawn as an inline SVG data URI (gray-500), matching the mockups. */
.ui-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B7280'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
</style>
