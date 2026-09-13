<script setup>
// Inline "click the pencil to edit" field, matching the pattern used across
// matchcareer-verification.html / profil.html. v-model is the current value;
// the parent decides what to do with it on @commit (e.g. call the API).
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  textClass: { type: String, default: 'text-[13.5px] font-semibold text-gray-900' },
})
const emit = defineEmits(['update:modelValue', 'commit'])

const editing = ref(false)
const draft = ref('')
const justSaved = ref(false)
const input = ref(null)

function startEdit() {
  draft.value = props.modelValue
  editing.value = true
  nextTick(() => input.value?.focus())
}

function commit() {
  const value = draft.value.trim()
  editing.value = false
  if (value && value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('commit', value)
    justSaved.value = true
    setTimeout(() => (justSaved.value = false), 900)
  }
}

function cancel() {
  editing.value = false
}
</script>

<template>
  <div>
    <div v-if="label" class="mb-1 text-[11px] text-gray-400">{{ label }}</div>
    <span class="inline-flex max-w-full items-center gap-1.5">
      <span
        v-if="!editing"
        :class="textClass"
        class="cursor-text"
        tabindex="0"
        @click="startEdit"
        @keydown.enter="startEdit"
      >
        {{ modelValue }}
      </span>
      <input
        v-else
        ref="input"
        v-model="draft"
        type="text"
        class="min-w-[60px] max-w-full rounded-md border-[1.5px] border-brand bg-brand-light px-1.5 py-0.5 font-semibold text-gray-900 outline-none"
        :class="textClass"
        @keydown.enter="commit"
        @keydown.escape="cancel"
        @blur="commit"
      />
      <button
        v-if="!editing"
        type="button"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-300 hover:bg-brand-light hover:text-brand"
        :class="justSaved && 'text-success'"
        aria-label="Modifier"
        @click="startEdit"
      >
        {{ justSaved ? '✓' : '✎' }}
      </button>
    </span>
  </div>
</template>
