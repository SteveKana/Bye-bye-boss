<script setup>
// A piece of text that reads like plain text on the CV and edits in place:
// click, type. Auto-grows with its content (a textarea underneath). With
// `single`, Enter does not add a line break (names, titles, dates...).
const props = defineProps({
  modelValue: { type: String, default: '' },
  single: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'edit'])

const el = ref(null)

function fit() {
  const node = el.value
  if (!node) return
  node.style.height = 'auto'
  node.style.height = `${node.scrollHeight}px`
}

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('edit')
  fit()
}

onMounted(() => {
  fit()
  // Fonts load after the first paint: measure again once they are in.
  document.fonts?.ready?.then(fit)
})
watch(
  () => props.modelValue,
  () => nextTick(fit)
)
</script>

<template>
  <textarea
    ref="el"
    :value="modelValue"
    rows="1"
    :placeholder="placeholder"
    :aria-label="ariaLabel || placeholder || undefined"
    class="block w-full resize-none overflow-hidden rounded-md border-0 bg-transparent px-2 py-0.5 text-inherit outline-none transition-colors placeholder:text-ink/35 hover:bg-ink/[0.04] focus:bg-white focus:ring-2 focus:ring-brand/50"
    style="font: inherit; letter-spacing: inherit; line-height: inherit"
    @input="onInput"
    @keydown.enter="single && $event.preventDefault()"
  />
</template>
