<script setup>
// Left brand panel for the auth screens (playful redesign, 2026-10-05):
// bright brand violet, thick ink outline, colourful emoji tiles.
// variant 'login'  -> features + colourful stickers
// variant 'signup' -> features
const props = defineProps({
  variant: { type: String, default: 'login' }, // login | signup
})

const featureKeys = {
  login: ['scores', 'reco', 'tracking', 'secure'],
  signup: ['cv', 'reco', 'time', 'secure'],
  onboarding: ['extract', 'verify', 'match'],
}
// Each feature gets a bright emoji on its own coloured tile.
const icons = {
  scores: { emoji: '🏆', tone: 'bg-sun' },
  reco: { emoji: '🎯', tone: 'bg-blush' },
  tracking: { emoji: '🚀', tone: 'bg-lav' },
  secure: { emoji: '🔐', tone: 'bg-sun-light' },
  cv: { emoji: '📝', tone: 'bg-sun' },
  time: { emoji: '⚡', tone: 'bg-lav' },
  extract: { emoji: '✨', tone: 'bg-sun' },
  verify: { emoji: '✅', tone: 'bg-lav' },
  match: { emoji: '💜', tone: 'bg-blush' },
}
const keys = computed(() => featureKeys[props.variant] || featureKeys.login)

const stickers = [
  { emoji: '🚀', tone: 'bg-sun', rotate: '-rotate-6' },
  { emoji: '⭐', tone: 'bg-blush', rotate: 'rotate-3' },
  { emoji: '🎉', tone: 'bg-lav', rotate: '-rotate-3' },
]
</script>

<template>
  <div
    class="relative flex flex-1 flex-col overflow-hidden rounded-[28px] border-[2.5px] border-ink bg-brand px-10 py-9 text-white"
  >
    <!-- Decorative blobs -->
    <span
      class="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sun"
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-blush"
      aria-hidden="true"
    />

    <NuxtLink to="/" class="relative z-10 mb-8 flex items-center gap-2.5">
      <UiLogoMark :size="40" />
      <span class="text-lg font-black">Bye Bye Boss</span>
    </NuxtLink>

    <h1 class="relative z-10 mb-3.5 text-3xl font-black leading-tight">
      {{ $t(`brand.${variant}.headline`) }}
      <span class="text-sun">{{ $t(`brand.${variant}.headline_accent`) }}</span>
    </h1>
    <p class="relative z-10 mb-8 max-w-sm text-sm font-medium leading-relaxed text-white/90">
      {{ $t(`brand.${variant}.subtitle`) }}
    </p>

    <ul class="relative z-10 flex flex-col gap-4">
      <li v-for="key in keys" :key="key" class="flex items-start gap-3">
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-ink text-xl"
          :class="icons[key].tone"
          aria-hidden="true"
        >
          {{ icons[key].emoji }}
        </span>
        <div>
          <h4 class="text-sm font-extrabold">{{ $t(`brand.${variant}.features.${key}.title`) }}</h4>
          <p class="text-[12.5px] font-medium leading-snug text-white/85">
            {{ $t(`brand.${variant}.features.${key}.text`) }}
          </p>
        </div>
      </li>
    </ul>

    <!-- Login: colourful stickers (decoration only) -->
    <div v-if="variant === 'login'" class="relative z-10 mt-auto flex items-end gap-4 pt-8">
      <span
        v-for="s in stickers"
        :key="s.emoji"
        class="flex h-20 w-20 items-center justify-center rounded-[26px] border-[2.5px] border-ink text-4xl shadow-[4px_4px_0_#16122E]"
        :class="[s.tone, s.rotate]"
        aria-hidden="true"
      >
        {{ s.emoji }}
      </span>
    </div>
  </div>
</template>
