<script setup>
defineProps({
  tkey: { type: String, required: true },
})
</script>

<template>
  <div class="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
    <span
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[11px]"
      aria-hidden="true"
    >
      🛡
    </span>
    {{ $t(tkey) }}
  </div>
</template>
