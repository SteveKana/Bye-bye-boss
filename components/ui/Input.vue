<script setup>
// Text input with label, optional leading icon, password toggle and error state.
// v-model compatible. Accessibility: label/for, aria-invalid, aria-describedby.
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  // Leading icon (emoji or short glyph)
  icon: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
const uid = useId()
const inputId = computed(() => props.id || uid)
const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() =>
  isPassword.value ? (showPassword.value ? 'text' : 'password') : props.type,
)
const describedBy = computed(() => {
  if (props.error) return `${inputId.value}-error`
  if (props.hint) return `${inputId.value}-hint`
  return undefined
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="mb-1.5 block text-sm font-semibold text-gray-900">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <span
        v-if="icon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
        aria-hidden="true"
      >
        {{ icon }}
      </span>

      <input
        :id="inputId"
        :type="resolvedType"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        class="w-full rounded-md border-[1.5px] bg-white py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:shadow-focus-ring disabled:cursor-not-allowed disabled:bg-gray-50"
        :class="[
          error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand',
          icon ? 'pl-10' : 'pl-3.5',
          isPassword ? 'pr-10' : 'pr-3.5',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <button
        v-if="isPassword"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        {{ showPassword ? '🙈' : '👁' }}
      </button>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="mt-1.5 text-sm text-danger">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="mt-1.5 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>
