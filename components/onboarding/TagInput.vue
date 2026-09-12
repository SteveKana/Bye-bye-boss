<script setup>
// Editable list of short text tags (skills, tools...). v-model is an array
// of strings. Enter or the "+" button appends the draft input as a new tag.
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  addLabel: { type: String, default: '+ Ajouter' },
})
const emit = defineEmits(['update:modelValue'])

const draft = ref('')

function addTag() {
  const value = draft.value.trim()
  if (!value) return
  if (!props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
  }
  draft.value = ''
}

function removeTag(index) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      v-for="(tag, i) in modelValue"
      :key="`${tag}-${i}`"
      class="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-sm font-medium text-brand-text"
    >
      {{ tag }}
      <button
        type="button"
        class="text-brand-text/60 hover:text-brand-text"
        aria-label="Supprimer"
        @click="removeTag(i)"
      >
        ✕
      </button>
    </span>

    <span class="inline-flex items-center gap-1">
      <input
        v-model="draft"
        type="text"
        class="w-28 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:border-brand"
        @keydown.enter.prevent="addTag"
      />
      <button
        type="button"
        class="text-sm font-semibold text-brand-text hover:underline"
        @click="addTag"
      >
        {{ addLabel }}
      </button>
    </span>
  </div>
</template>
