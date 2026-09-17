<script setup>
// Checkbox with inline label. v-model compatible (Boolean).
// The native input drives state; a styled box mirrors it via peer utilities.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const uid = useId()
const inputId = computed(() => props.id || uid)
</script>

<template>
  <div>
    <label
      :for="inputId"
      class="flex cursor-pointer items-start gap-2.5 text-sm text-gray-700"
      :class="disabled && 'cursor-not-allowed opacity-60'"
    >
      <input
        :id="inputId"
        type="checkbox"
        :name="name"
        :checked="modelValue"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error"
        class="peer sr-only"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span
        class="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] border-gray-300 bg-white text-white transition peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:shadow-focus-ring"
        aria-hidden="true"
      >
        <svg
          v-show="modelValue"
          class="h-3 w-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
      <span v-if="label" class="select-none">
        {{ label }}
        <span v-if="required" class="text-danger" aria-hidden="true">*</span>
      </span>
    </label>

    <p v-if="error" class="mt-1.5 text-sm text-danger">{{ error }}</p>
  </div>
</template>
