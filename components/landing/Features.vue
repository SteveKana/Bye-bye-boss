<script setup>
// "regret" key removed from both offers' scores 2026-10-03 (Steve: masquer
// toute mention à l'indice de regret côté front).
const mailOffers = [
  {
    logo: 'DL',
    logoBg: '#1D6FF2',
    title: 'Data Analyst',
    company: 'Doctolib',
    loc: 'Paris, France · Hybride',
    tags: ['SQL', 'Python', 'Dashboard'],
    scores: { ats: 91, career: 93, potential: 95 },
    faded: false,
  },
  {
    logo: 'IN',
    logoBg: '#5B6B7B',
    title: 'BI Consultant',
    company: 'Inetum',
    loc: 'Paris, France · Hybride',
    tags: [],
    scores: { ats: 84, career: 86, potential: 90 },
    faded: true,
  },
]

const scoreLabels = { ats: 'ATS', career: 'Career', potential: 'Potential' }

// Full class names: Tailwind cannot generate classes built at runtime.
const scoreColors = {
  ats: 'text-preview-ats',
  career: 'text-preview-career',
  potential: 'text-preview-potential',
}
</script>

<template>
  <section id="fonctionnalites" class="bg-white px-6 py-16 lg:px-12">
    <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
      <div>
        <h2 class="mb-5 text-3xl font-extrabold leading-tight text-ink">
          {{ $t('landing.features.title') }}<br />
          {{ $t('landing.features.title2') }}
        </h2>
        <p class="mb-4 text-md leading-relaxed text-ink/70">{{ $t('landing.features.p1') }}</p>
        <p class="text-md leading-relaxed text-ink/70">{{ $t('landing.features.p2') }}</p>
      </div>

      <div class="rounded-xl border border-ink/20 bg-white p-5">
        <div class="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink/50">
          {{ $t('landing.features.mail_label') }}
        </div>
        <h3 class="mb-1 text-lg font-bold text-ink">{{ $t('landing.features.mail_greeting') }}</h3>
        <div class="mb-4 text-sm text-ink/60">{{ $t('landing.features.mail_sub') }}</div>

        <div
          v-for="o in mailOffers"
          :key="o.company"
          class="mb-2.5 flex items-start gap-3 rounded-lg border border-ink/20 p-3"
          :class="o.faded && 'opacity-60'"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[11px] font-extrabold text-white"
            :style="{ background: o.logoBg }"
          >
            {{ o.logo }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-bold text-ink">{{ o.title }}</div>
            <div class="text-[11.5px] text-ink/60">{{ o.company }} · {{ o.loc }}</div>
            <div v-if="o.tags.length" class="mt-1.5 flex flex-wrap gap-1">
              <span
                v-for="tag in o.tags"
                :key="tag"
                class="rounded bg-lav px-1.5 py-0.5 text-[10px] font-medium text-ink/70"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <div class="flex gap-2.5">
              <div v-for="(v, k) in o.scores" :key="k" class="text-center">
                <span class="block text-[8.5px] font-semibold text-ink/50">
                  {{ scoreLabels[k] }}
                </span>
                <span class="text-sm font-black" :class="scoreColors[k]">{{ v }}</span>
              </div>
            </div>
            <button
              v-if="!o.faded"
              type="button"
              class="mt-2 rounded border border-ink/20 px-2 py-1 text-[11px] font-semibold text-ink/80"
            >
              {{ $t('landing.features.mail_cta') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
