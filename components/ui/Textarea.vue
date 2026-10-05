<script setup>
// Multi-line text input with label, optional character counter and error state.
// v-model compatible.
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  maxlength: { type: Number, default: null },
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
</script>

<template>
  <div class="w-full">
    <div class="mb-1.5 flex items-baseline justify-between">
      <label v-if="label" :for="inputId" class="block text-sm font-extrabold text-ink">
        {{ label }}
        <span v-if="required" class="text-danger" aria-hidden="true">*</span>
      </label>
      <span v-if="maxlength" class="text-xs text-ink/60">
        {{ modelValue.length }}/{{ maxlength }}
      </span>
    </div>

    <textarea
      :id="inputId"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      class="w-full resize-y rounded-2xl border-2 bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-ink/40 focus:shadow-focus-ring disabled:cursor-not-allowed disabled:bg-lav/40"
      :class="error ? 'border-danger focus:border-danger' : 'border-ink focus:border-brand'"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p v-if="error" :id="`${inputId}-error`" class="mt-1.5 text-sm text-danger">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="mt-1.5 text-sm text-ink/60">
      {{ hint }}
    </p>
  </div>
</template>
