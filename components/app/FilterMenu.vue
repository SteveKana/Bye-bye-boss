<script setup>
// A pill button that opens a small panel (slot) under it -- one per filter on
// the Opportunités page (Contrat, Télétravail, Localisation). Closes on an
// outside click or Escape. `count` is the number of active choices inside,
// shown as a small badge on the pill.
defineProps({
  label: { type: String, required: true },
  count: { type: Number, default: 0 },
})

const open = ref(false)
const root = ref(null)

function onDocumentClick(event) {
  if (open.value && root.value && !root.value.contains(event.target)) open.value = false
}
function onKey(event) {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold text-ink hover:bg-lav"
      :class="count ? 'bg-lav' : 'bg-white'"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ label }}
      <span
        v-if="count"
        class="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
      >
        {{ count }}
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div
      v-if="open"
      class="absolute left-0 top-[calc(100%+6px)] z-20 w-72 rounded-2xl border-2 border-ink bg-white p-4"
    >
      <slot />
    </div>
  </div>
</template>
