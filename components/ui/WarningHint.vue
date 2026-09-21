<script setup>
// Small gray warning icon that reveals a short message on hover or click/tap
// (mouseenter/mouseleave for desktop, click toggling `open` so it also works
// on touch devices where hover doesn't apply). Used next to a published date
// pulled from a third-party source we can't fully vouch for (see dashboard.vue
// and pages/opportunity/[id].vue's use next to Adzuna-sourced dates).
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
      class="flex h-4 w-4 items-center justify-center text-gray-400 transition hover:text-gray-600"
      :aria-label="message"
      @click.stop="toggle"
      @blur="hide"
    >
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
        <path
          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
    <div
      v-if="open"
      role="tooltip"
      class="absolute bottom-full left-1/2 z-20 mb-1.5 w-44 -translate-x-1/2 rounded-md bg-gray-800 px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-white shadow-lg"
    >
      {{ message }}
      <span
        class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-800"
        aria-hidden="true"
      />
    </div>
  </span>
</template>
