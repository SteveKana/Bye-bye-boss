<script setup>
// A piece of text that reads like plain text on the CV and edits in place:
// click, type. Auto-grows with its content (a textarea underneath). With
// `single`, Enter does not add a line break (names, titles, dates...).
// With `fitWidth`, the field is only as wide as its text (like on the printed
// CV, where "Steve Kana" sits together); with `shrink` too, the font gets
// smaller instead of wrapping, down to `minSize` px, so a title stays on one
// line. The available width is the closest `[data-fit-box]` ancestor.
const props = defineProps({
  modelValue: { type: String, default: '' },
  single: { type: Boolean, default: false },
  fitWidth: { type: Boolean, default: false },
  shrink: { type: Boolean, default: false },
  minSize: { type: Number, default: 13 },
  placeholder: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'edit'])

const el = ref(null)

let canvas = null
function textWidth(node, text, size) {
  canvas ||= document.createElement('canvas').getContext('2d')
  const cs = getComputedStyle(node)
  canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`
  return canvas.measureText(text).width
}

// Horizontal padding (px-2) plus a little room for the caret.
const PAD = 22

function fitToText() {
  const node = el.value
  if (!node || !props.fitWidth) return
  node.style.fontSize = 'inherit'
  let size = parseFloat(getComputedStyle(node).fontSize)
  const text = node.value || props.placeholder || ' '
  let width = textWidth(node, text, size) + PAD
  const box = node.closest('[data-fit-box]')
  const available = box ? box.clientWidth : Infinity
  if (props.shrink && width > available) {
    size = Math.max(props.minSize, (size * (available - PAD)) / (width - PAD))
    node.style.fontSize = `${size}px`
    width = textWidth(node, text, size) + PAD
  }
  node.style.width = `${Math.min(width, available)}px`
}

function fit() {
  const node = el.value
  if (!node) return
  fitToText()
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
  if (props.fitWidth) window.addEventListener('resize', fit)
  // Fonts load after the first paint: measure again once they are in.
  document.fonts?.ready?.then(fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))
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
    :class="fitWidth ? '' : 'w-full'"
    class="block max-w-full resize-none overflow-hidden rounded-md border-0 bg-transparent px-2 py-0.5 text-inherit outline-none transition-colors placeholder:text-ink/35 hover:bg-ink/[0.04] focus:bg-white focus:ring-2 focus:ring-brand/50"
    style="font: inherit; letter-spacing: inherit; line-height: inherit"
    @input="onInput"
    @keydown.enter="single && $event.preventDefault()"
  />
</template>
