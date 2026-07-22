<script setup>
// Faithful reproduction of the landing hero (see docs/mockups/byebyeboss-landing.html).
// The right column is a static product shot: its colours are the mockup's own
// illustration/company colours, not design-system tokens.
const offers = [
  {
    rank: 1,
    gold: true,
    logo: 'D.',
    logoBg: '#10123E',
    title: 'Product Owner',
    company: 'Doctolib',
    loc: 'Paris · Hybride',
    high: true,
    scores: { ats: 92, career: 95, potential: 97, regret: 18 },
  },
  {
    rank: 2,
    gold: false,
    logo: 'alan',
    logoBg: '#2352E8',
    title: 'Product Owner',
    company: 'Alan',
    loc: 'Paris · Hybride',
    high: true,
    scores: { ats: 90, career: 91, potential: 94, regret: 22 },
  },
  {
    rank: 3,
    gold: false,
    logo: 'M',
    logoBg: '#0FB77A',
    title: 'Senior Product Owner',
    company: 'ManoMano',
    loc: 'Nantes · Hybride',
    high: false,
    scores: { ats: 88, career: 89, potential: 92, regret: 25 },
  },
]

const sideNav = [
  { label: 'Dashboard', icon: '⌂', active: true },
  { label: 'Opportunités', icon: '▦', active: false },
  { label: 'Candidatures', icon: '✉', active: false },
  { label: 'Entreprises', icon: '🏢', active: false },
  { label: 'Améliorer mon CV', icon: '✎', active: false },
  { label: 'Alertes', icon: '🔔', active: false },
]

const avatars = [
  { initials: 'JD', bg: '#7C5CFF' },
  { initials: 'ML', bg: '#00A87A' },
  { initials: 'TP', bg: '#E8833A' },
]

const scoreLabels = { ats: 'ATS', career: 'Career', potential: 'Potential', regret: 'Regret' }

// Full class names on purpose: Tailwind only generates classes it can find
// literally in the source, so `text-preview-${key}` would produce nothing.
const scoreColors = {
  ats: 'text-preview-ats',
  career: 'text-preview-career',
  potential: 'text-preview-potential',
  regret: 'text-preview-regret',
}
</script>

<template>
  <section
    id="apercu"
    class="mx-auto grid max-w-[1180px] items-start gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:px-10"
  >
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
        {{ $t('landing.hero.title') }}<br />
        <span class="text-brand">{{ $t('landing.hero.title_accent') }}</span>
      </h1>

      <p class="mb-[30px] max-w-[440px] text-base leading-[1.7] text-gray-600">
        {{ $t('landing.hero.sub') }}
      </p>

      <div class="max-w-[440px]">
        <LandingWaitlistForm input-id="waitlist-email" />
      </div>

      <!-- Social proof -->
      <div class="mb-[30px] mt-6 flex items-center gap-3">
        <div class="flex">
          <span
            v-for="a in avatars"
            :key="a.initials"
            class="-mr-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full border-[2.5px] border-white text-[13px] font-bold text-white"
            :style="{ background: a.bg }"
          >
            {{ a.initials }}
          </span>
        </div>
        <div class="text-[13px] text-gray-600">
          <span class="block tracking-[1px] text-preview-regret" aria-hidden="true">★★★★★</span>
          {{ $t('landing.hero.social_proof') }}
        </div>
      </div>

      <!-- Press -->
      <div v-if="false" class="border-t border-gray-100 pt-[18px]">
        <div class="mb-3 text-xs text-gray-400">{{ $t('landing.hero.press_label') }}</div>
        <div class="flex flex-wrap items-center gap-7 opacity-55 grayscale">
          <span class="text-base font-medium italic text-navy">Maddyness</span>
          <span class="font-serif text-base font-bold text-navy">Les Echos</span>
          <span class="text-base font-extrabold leading-none text-navy">
            BFM
            <span class="block text-[9px] font-semibold leading-[0.5]">BUSINESS</span>
          </span>
          <span class="text-base font-medium text-navy">france·tv</span>
        </div>
      </div>
    </div>

    <!-- Right: product preview -->
    <div class="relative">
      <div
        class="mb-2.5 inline-block rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.6px] text-brand"
      >
        {{ $t('landing.hero.preview_badge') }}
      </div>

      <div
        class="grid overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_14px_44px_rgba(26,26,62,.10)] sm:grid-cols-[168px_1fr]"
      >
        <!-- Sidebar -->
        <aside
          class="hidden flex-col border-r border-gray-100 px-3 py-[18px] text-[12.5px] sm:flex"
        >
          <div class="flex items-center gap-[7px] px-1.5 pb-4 text-sm font-extrabold text-navy">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-[7px] bg-brand text-[11px] font-black text-white"
            >
              BB
            </span>
            Bye Bye Boss
          </div>

          <div
            v-for="item in sideNav"
            :key="item.label"
            class="mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-2"
            :class="
              item.active
                ? 'border-l-[3px] border-brand bg-brand-light font-semibold text-brand'
                : 'text-gray-400'
            "
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </div>

          <div class="mt-auto flex items-center gap-2 border-t border-gray-100 px-1.5 pt-2.5">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style="background: #5a8dee"
            >
              TD
            </span>
            <div>
              <div class="text-[11.5px] font-bold leading-tight text-navy">Thomas D.</div>
              <div class="text-[10px] text-gray-400">Product Owner</div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <div class="p-[18px]">
          <div class="mb-3.5">
            <div class="text-[15px] font-extrabold text-navy">
              {{ $t('landing.hero.dash_greeting') }}
            </div>
            <div class="text-[11px] text-gray-400">{{ $t('landing.hero.dash_meta') }}</div>
          </div>

          <div
            v-for="o in offers"
            :key="o.rank"
            class="mb-2.5 flex gap-2.5 rounded-xl border border-gray-100 p-3"
          >
            <span
              class="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center self-start rounded-full text-[10px] font-extrabold"
              :class="o.gold ? 'text-[#B8860B]' : 'bg-gray-100 text-gray-600'"
              :style="o.gold ? 'background:#FFF3D6' : ''"
            >
              {{ o.rank }}
            </span>

            <span
              class="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] text-[13px] font-extrabold text-white"
              :style="{ background: o.logoBg }"
            >
              {{ o.logo }}
            </span>

            <div class="min-w-0 flex-1">
              <div class="truncate text-[13px] font-bold text-navy">{{ o.title }}</div>
              <div class="text-[11.5px] text-gray-600">{{ o.company }}</div>
              <div class="mb-1.5 text-[10.5px] text-gray-400">{{ o.loc }}</div>
              <span
                class="mt-1 inline-block rounded-full px-2.5 py-[2.5px] text-[9px] font-bold"
                :class="o.high ? 'bg-success-light text-[#00996E]' : 'bg-gray-100 text-gray-600'"
              >
                {{ o.high ? $t('landing.hero.compat_high') : $t('landing.hero.compat_good') }}
              </span>
            </div>

            <div class="mt-0.5 hidden shrink-0 gap-2.5 self-start md:flex">
              <div v-for="(value, key) in o.scores" :key="key" class="text-center">
                <span class="block text-[8.5px] font-semibold text-gray-400">
                  {{ scoreLabels[key] }}
                </span>
                <span class="text-sm font-black" :class="scoreColors[key]">{{ value }}</span>
              </div>
            </div>
          </div>

          <div class="cursor-pointer pt-1 text-center text-xs font-semibold text-brand">
            {{ $t('landing.hero.dash_link') }}
          </div>
        </div>
      </div>

      <p
        class="relative ml-auto mt-[18px] max-w-[240px] pl-9 font-cursive text-[21px] leading-[1.25] text-brand"
      >
        <span class="absolute -top-1.5 left-1.5 -rotate-[20deg] text-[26px]" aria-hidden="true">
          ⤹
        </span>
        {{ $t('landing.hero.annotation') }}
      </p>
    </div>
  </section>
</template>
