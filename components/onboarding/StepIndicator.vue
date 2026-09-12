<script setup>
// Step indicator for the 3-step CV onboarding wizard (upload -> verification
// -> preferences). `current` is 1-indexed and drives which circles are done
// (checkmark), active (filled), or upcoming (muted).
defineProps({
  current: { type: Number, required: true },
})

const STEPS = [
  { step: 1, labelKey: 'onboarding.steps.upload' },
  { step: 2, labelKey: 'onboarding.steps.verification' },
  { step: 3, labelKey: 'onboarding.steps.preferences' },
]
</script>

<template>
  <div class="flex items-center gap-2 sm:gap-3">
    <template v-for="(item, i) in STEPS" :key="item.step">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          :class="
            item.step <= current ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'
          "
        >
          <span v-if="item.step < current" aria-hidden="true">✓</span>
          <span v-else>{{ item.step }}</span>
        </div>
        <span
          class="hidden text-sm font-medium sm:inline"
          :class="item.step <= current ? 'text-gray-900' : 'text-gray-400'"
        >
          {{ $t(item.labelKey) }}
        </span>
      </div>
      <div
        v-if="i < STEPS.length - 1"
        class="h-px w-6 shrink-0 sm:w-12"
        :class="item.step < current ? 'bg-brand' : 'bg-gray-200'"
        aria-hidden="true"
      />
    </template>
  </div>
</template>
