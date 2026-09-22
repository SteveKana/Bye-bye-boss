<script setup>
// Compact read-only summary of the candidate's saved search criteria --
// shown above the match list on both the Dashboard and Opportunités pages
// (both show matches for the same preferences), so switching between them
// never loses sight of what's being searched for. Editing always happens on
// the dedicated /preferences page, never inline here.
defineProps({
  criteria: { type: Array, default: () => [] },
})
</script>

<template>
  <div v-if="criteria.length" class="mb-6 flex flex-wrap items-center gap-2 text-sm">
    <span class="font-semibold text-gray-500">{{ $t('dashboard.your_search') }}</span>
    <span
      v-for="c in criteria"
      :key="c"
      class="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-gray-700 shadow-soft"
    >
      {{ c }}
    </span>
    <NuxtLink to="/preferences" class="font-semibold text-brand hover:underline">
      {{ $t('dashboard.edit') }} →
    </NuxtLink>
  </div>
</template>
