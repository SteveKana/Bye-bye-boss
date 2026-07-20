<script setup>
// Left brand panel for the auth screens, faithful to the mockups.
// variant 'login'  -> features + a scores preview card (mini scores + sparkline)
// variant 'signup' -> features + social proof (avatars + count)
const props = defineProps({
  variant: { type: String, default: 'login' }, // login | signup
})

const featureKeys = {
  login: ['scores', 'reco', 'tracking', 'secure'],
  signup: ['cv', 'reco', 'time', 'secure'],
}
const icons = {
  scores: '📊',
  reco: '🎯',
  tracking: '📈',
  secure: '🛡',
  cv: '✦',
  time: '📈',
}
const keys = computed(() => featureKeys[props.variant] || featureKeys.login)

// Static preview data (mockup values).
const scores = [
  { label: 'ATS Score', value: 74, bar: 'bg-score-ats', width: '74%' },
  { label: 'Career Score', value: 89, bar: 'bg-score-career', width: '89%' },
  { label: 'ATS Potential', value: 92, bar: 'bg-score-potential', width: '92%' },
  { label: 'Regret Index™', value: 72, bar: 'bg-score-regret', width: '72%' },
]
const avatars = ['🧑🏾', '👨🏻', '👩🏼', '👨🏽', '👩🏾']
</script>

<template>
  <div
    class="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-gradient-to-br from-navy-light to-navy px-10 py-9 text-white"
  >
    <!-- Decorative arcs -->
    <span
      class="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full border border-white/10"
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute -right-16 top-28 h-52 w-52 rounded-full border border-white/10"
      aria-hidden="true"
    />

    <div class="relative z-10 mb-8 flex items-center gap-2.5">
      <div
        class="flex h-9 w-9 items-center justify-center rounded-[9px] bg-brand text-[15px] font-black"
      >
        M
      </div>
      <span class="text-[17px] font-bold">MatchCareer</span>
    </div>

    <h1 class="relative z-10 mb-3.5 text-3xl font-extrabold leading-tight">
      {{ $t(`brand.${variant}.headline`) }}
      <span class="text-brand-light">{{ $t(`brand.${variant}.headline_accent`) }}</span>
    </h1>
    <p class="relative z-10 mb-8 max-w-sm text-[13px] leading-relaxed text-white/50">
      {{ $t(`brand.${variant}.subtitle`) }}
    </p>

    <ul class="relative z-10 flex flex-col gap-4">
      <li v-for="key in keys" :key="key" class="flex items-start gap-3">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/10 bg-white/[0.07] text-[15px]"
          aria-hidden="true"
        >
          {{ icons[key] }}
        </span>
        <div>
          <h4 class="text-[13px] font-bold">{{ $t(`brand.${variant}.features.${key}.title`) }}</h4>
          <p class="text-[11.5px] leading-snug text-white/40">
            {{ $t(`brand.${variant}.features.${key}.text`) }}
          </p>
        </div>
      </li>
    </ul>

    <!-- Login widget: scores preview -->
    <div v-if="variant === 'login'" class="relative z-10 mt-auto pt-6">
      <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
        <div class="mb-3 text-[11px] font-semibold text-white/50">
          {{ $t('brand.login.preview_label') }}
        </div>
        <div class="mb-3 grid grid-cols-4 gap-2.5">
          <div v-for="s in scores" :key="s.label" class="rounded-lg bg-white/[0.06] px-2 py-2.5">
            <div class="mb-1 whitespace-nowrap text-[9px] font-semibold text-white/40">
              {{ s.label }}
            </div>
            <div class="text-xl font-extrabold leading-none">
              {{ s.value }}<span class="text-[10px] font-medium text-white/40"> /100</span>
            </div>
            <div class="mt-1.5 h-[3px] overflow-hidden rounded-sm bg-white/10">
              <div class="h-full rounded-sm" :class="s.bar" :style="{ width: s.width }" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3.5 py-3">
          <div class="shrink-0 text-[10px] leading-tight text-white/45">
            {{ $t('brand.login.spark_label') }}
          </div>
          <svg viewBox="0 0 160 40" class="h-10 flex-1" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mc-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8B6FFF" stop-opacity=".3" />
                <stop offset="100%" stop-color="#8B6FFF" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 32 C10 30 15 28 25 26 C35 24 38 29 48 25 C58 21 62 27 72 22 C82 17 85 23 95 18 C105 13 110 20 120 14 C130 8 135 15 145 10 C152 6 156 8 160 6"
              fill="none"
              stroke="#8B6FFF"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M0 32 C10 30 15 28 25 26 C35 24 38 29 48 25 C58 21 62 27 72 22 C82 17 85 23 95 18 C105 13 110 20 120 14 C130 8 135 15 145 10 C152 6 156 8 160 6 L160 40 L0 40 Z"
              fill="url(#mc-spark)"
            />
          </svg>
          <div class="shrink-0 text-right">
            <div class="text-lg font-extrabold leading-none">+47%</div>
            <div class="mt-0.5 text-[9px] text-white/40">{{ $t('brand.login.spark_sub') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Signup widget: social proof -->
    <div v-else class="relative z-10 mt-auto pt-6">
      <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
        <h4 class="text-[13px] font-bold">{{ $t('brand.signup.proof_title') }}</h4>
        <p class="mt-0.5 text-[11.5px] text-white/40">{{ $t('brand.signup.proof_sub') }}</p>
        <div class="mt-3 flex items-center">
          <span
            v-for="(a, i) in avatars"
            :key="i"
            class="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy bg-white/10 text-sm first:ml-0"
            aria-hidden="true"
          >
            {{ a }}
          </span>
          <span
            class="-ml-2 flex h-8 items-center rounded-full border-2 border-navy bg-brand px-2.5 text-[11px] font-bold"
          >
            +25k
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
