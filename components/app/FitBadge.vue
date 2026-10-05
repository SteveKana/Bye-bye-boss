<script setup>
// Compatibility tag of an offer (Steve, 2026-10-04): "Très forte
// compatibilité" from an ATS potential of 95, "Forte compatibilité" from 80,
// and nothing at all below that -- `fit` comes from fitLevel() in
// composables/useOfferDisplay.js, so the dashboard, the Opportunités list
// and the detail page can never label the same match differently.
defineProps({
  fit: { type: String, default: null },
})
</script>

<template>
  <span
    v-if="fit"
    class="inline-block rounded-full border-2 border-ink px-2.5 py-0.5 text-[10px] font-extrabold text-ink"
    :class="fit === 'very_strong' ? 'bg-sun' : 'bg-blush'"
  >
    {{ fit === 'very_strong' ? $t('dashboard.fit_very_strong') : $t('dashboard.fit_strong') }}
  </span>
</template>
