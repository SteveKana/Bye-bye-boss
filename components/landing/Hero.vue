<script setup>
// Faithful reproduction of the new landing hero (matchcareer.html mockup):
// an "analysis card" showing one example offer scored on 4 axes (ATS,
// Career, ATS Potential, Regret), with a mini breakdown of why the regret
// score is high. Replaces the earlier dashboard-preview hero, which
// predates this design and still referenced the pre-launch waitlist.
const gauges = [
  {
    key: 'ats',
    value: 74,
    color: '#5B3FE8',
    labelKey: 'landing.hero.ats_label',
    subKey: 'landing.hero.ats_sub',
  },
  {
    key: 'career',
    value: 89,
    color: '#00C48C',
    labelKey: 'landing.hero.career_label',
    subKey: 'landing.hero.career_sub',
  },
  {
    key: 'potential',
    value: 92,
    color: '#00C48C',
    labelKey: 'landing.hero.potential_label',
    subKey: 'landing.hero.potential_sub',
  },
]

const { scrollToElement } = useScrollTo()

// Circle circumference for r=26 is ~163.36 -- used to turn a 0-100 score
// into a stroke-dashoffset (mockup's own values, kept as-is for fidelity).
const circumference = 163.36
function offsetFor(value) {
  return (circumference * (100 - value)) / 100
}

const whyRegret = [
  { key: 'landing.hero.why_regret_1', bad: true },
  { key: 'landing.hero.why_regret_2', bad: false },
  { key: 'landing.hero.why_regret_3', bad: true },
  { key: 'landing.hero.why_regret_4', bad: true },
]
</script>

<template>
  <section class="mx-auto max-w-[1180px] px-6 pb-20 pt-12 lg:px-10">
    <div class="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
      <!-- Left -->
      <div>
        <div
          class="mb-6 inline-flex items-center gap-[7px] rounded-full bg-brand-light px-3.5 py-1.5 text-[12.5px] font-semibold text-brand"
        >
          <span class="text-[11px]" aria-hidden="true">✦</span>
          {{ $t('landing.hero.badge') }}
        </div>

        <h1
          class="mb-[22px] text-[34px] font-extrabold leading-[1.14] tracking-[-0.8px] text-navy sm:text-[46px]"
        >
          {{ $t('landing.hero.title') }}
          <span class="text-brand">{{ $t('landing.hero.title_accent') }}</span>
        </h1>

        <p class="mb-[30px] max-w-[440px] text-base leading-[1.7] text-gray-600">
          {{ $t('landing.hero.sub') }}
        </p>

        <div class="mb-6 flex flex-wrap items-center gap-3">
          <UiButton variant="primary" size="lg" @click="navigateTo('/register')">
            ⬆ {{ $t('landing.hero.cta_primary') }}
            <span class="ml-1.5 text-[11px] font-medium opacity-70">
              {{ $t('landing.hero.cta_primary_note') }}
            </span>
          </UiButton>
          <UiButton variant="secondary" size="lg" @click="scrollToElement('apercu')">
            <span aria-hidden="true">▶</span> {{ $t('landing.hero.cta_secondary') }}
          </UiButton>
        </div>

        <div class="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-gray-500">
          <span>{{ $t('landing.hero.trust_1') }}</span>
          <span>{{ $t('landing.hero.trust_2') }}</span>
          <span>{{ $t('landing.hero.trust_3') }}</span>
        </div>
      </div>

      <!-- Right: analysis card -->
      <div id="apercu" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div class="mb-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {{ $t('landing.hero.preview_label') }}
        </div>

        <div class="mb-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-lg"
              aria-hidden="true"
            >
              🏢
            </span>
            <div>
              <div class="text-sm font-bold text-navy">
                {{ $t('landing.hero.preview_offer_title') }}
              </div>
              <div class="text-xs text-gray-500">{{ $t('landing.hero.preview_offer_meta') }}</div>
            </div>
          </div>
          <span
            class="shrink-0 rounded-full bg-success-light px-2.5 py-1 text-[11px] font-bold text-success-text"
          >
            {{ $t('landing.hero.preview_badge') }}
          </span>
        </div>

        <!-- Score gauges -->
        <div class="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="g in gauges" :key="g.key" class="text-center">
            <div class="mb-1.5 text-[10.5px] font-semibold text-gray-500">
              {{ $t(g.labelKey) }}
            </div>
            <div class="relative mx-auto h-16 w-16">
              <svg viewBox="0 0 64 64" class="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" stroke-width="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  :stroke="g.color"
                  stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="offsetFor(g.value)"
                />
              </svg>
              <div
                class="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-navy"
              >
                {{ g.value }}<span class="text-[9px] font-medium text-gray-400">/100</span>
              </div>
            </div>
            <div class="mt-1.5 text-[10px] leading-tight text-gray-500">{{ $t(g.subKey) }}</div>
          </div>

          <!-- Regret gauge (its own colour scheme, so kept out of the loop) -->
          <div class="text-center">
            <div class="mb-1.5 text-[10.5px] font-semibold text-gray-500">
              {{ $t('landing.hero.regret_label') }}
            </div>
            <div class="relative mx-auto h-16 w-16">
              <svg viewBox="0 0 64 64" class="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#FECDCD" stroke-width="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#FF4D4D"
                  stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="offsetFor(72)"
                />
              </svg>
              <div
                class="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-navy"
              >
                72<span class="text-[9px] font-medium text-gray-400">/100</span>
              </div>
            </div>
            <div class="mt-1.5 text-[10px] font-semibold leading-tight text-danger">
              {{ $t('landing.hero.regret_sub') }}
            </div>
          </div>
        </div>

        <!-- Why the regret score is high -->
        <div class="rounded-xl bg-gray-50 p-4">
          <div class="mb-2.5 text-[11.5px] font-bold text-navy">
            {{ $t('landing.hero.why_regret_title') }}
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="(item, i) in whyRegret"
              :key="i"
              class="flex items-start gap-2 text-[11.5px] text-gray-600"
            >
              <span
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                :class="item.bad ? 'bg-danger' : 'bg-success'"
              >
                {{ item.bad ? '✕' : '✓' }}
              </span>
              {{ $t(item.key) }}
            </div>
          </div>
        </div>

        <div class="mt-3 cursor-pointer text-center text-xs font-semibold text-brand">
          {{ $t('landing.hero.see_more') }}
        </div>
      </div>
    </div>
  </section>
</template>
