<script setup>
// Shown while the backend parses a CV -- used by the initial import step and
// by the /profile reimport flow. There's no real progress to report (a
// single blocking LLM call, no checkpoints), so this shows a step list keyed
// off elapsed time rather than a fabricated percentage: honest about what's
// happening, still gives a visible sense of movement. The last step covers
// the bulk of the wait (the LLM call itself), which is why the "up to 5
// minutes" notice is shown prominently rather than tucked away -- Apache's
// proxy timeout was raised to 5 minutes to match (see deploy notes).
const props = defineProps({
  filename: { type: String, default: '' },
})

const STEPS = ['read', 'extract', 'generate']
// Rough thresholds (seconds) for when each step is considered "current" --
// not measured checkpoints, just a reasonable split of a typical import.
const STEP_THRESHOLDS = [0, 12, 30]

const elapsed = ref(0)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    elapsed.value += 1
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))

const currentStepIndex = computed(() => {
  let index = 0
  STEP_THRESHOLDS.forEach((threshold, i) => {
    if (elapsed.value >= threshold) index = i
  })
  return index
})

const elapsedLabel = computed(() => {
  const minutes = Math.floor(elapsed.value / 60)
  const seconds = elapsed.value % 60
  return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`
})
</script>

<template>
  <div class="rounded-xl border-2 border-brand/30 bg-brand-light px-5 py-4">
    <div class="flex items-center gap-3.5">
      <span
        class="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-brand border-t-transparent"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-brand-text">
          {{ $t('cvAnalyzing.title', { filename: props.filename }) }}
        </p>
        <p class="text-xs font-bold text-brand-text">{{ $t('cvAnalyzing.duration_notice') }}</p>
      </div>
    </div>

    <ul class="mt-3.5 space-y-2 border-t border-brand/20 pt-3">
      <li
        v-for="(step, index) in STEPS"
        :key="step"
        class="flex items-center gap-2.5 text-[13px]"
        :class="
          index < currentStepIndex
            ? 'text-brand-text/50'
            : index === currentStepIndex
              ? 'font-semibold text-brand-text'
              : 'text-brand-text/40'
        "
      >
        <span
          v-if="index < currentStepIndex"
          class="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-success"
          aria-hidden="true"
        >
          ✓
        </span>
        <span
          v-else-if="index === currentStepIndex"
          class="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
          aria-hidden="true"
        />
        <span
          v-else
          class="h-2 w-2 shrink-0 rounded-full border-2 border-brand-text/25"
          aria-hidden="true"
        />
        {{ $t(`cvAnalyzing.step_${step}`) }}
      </li>
    </ul>

    <p class="mt-3 text-right text-[11px] text-brand-text/60">{{ elapsedLabel }}</p>
  </div>
</template>
