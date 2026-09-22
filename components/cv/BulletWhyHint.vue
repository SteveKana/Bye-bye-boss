<script setup>
// Small info icon that reveals, on hover or click/tap, why one specific
// bullet/skill was reworded or added -- the mockup's "hover explanations".
// Deliberately a separate component from UiWarningHint rather than reusing
// it: that one is a warning triangle for "this date/source can't be fully
// vouched for", a different meaning from "here's why this change helps",
// and its message is short/centered while `why` text runs longer and reads
// better left-aligned. Same hover+click/tap mechanics, copied rather than
// generalized -- same reasoning as the app's other small per-purpose UI
// duplication (AnalyzingProgress vs OptimizingProgress).
defineProps({
  message: { type: String, required: true },
})

const open = ref(false)
function show() {
  open.value = true
}
function hide() {
  open.value = false
}
function toggle() {
  open.value = !open.value
}
</script>

<template>
  <span class="relative inline-flex" @mouseenter="show" @mouseleave="hide">
    <button
      type="button"
      class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-brand transition hover:text-brand-dark"
      :aria-label="message"
      @click.stop="toggle"
      @blur="hide"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15h-1.5v-6h1.5v6zm0-8h-1.5V7.5h1.5V9z" />
      </svg>
    </button>
    <div
      v-if="open"
      role="tooltip"
      class="absolute bottom-full left-0 z-20 mb-1.5 w-56 rounded-md bg-gray-800 px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug text-white shadow-lg"
    >
      {{ message }}
      <span
        class="absolute left-1.5 top-full h-0 w-0 border-4 border-transparent border-t-gray-800"
        aria-hidden="true"
      />
    </div>
  </span>
</template>
