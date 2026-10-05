<script setup>
// Authenticated app shell (playful redesign, 2026-10-05): light sidebar on
// large screens; on mobile a top bar (logo + profile button) and a floating
// pill navigation at the bottom. Used by the dashboard and profile pages.
const route = useRoute()

// Most pages read comfortably at the narrower centered width below, but a
// page with its own two-column grid (an offer list + a right info panel,
// e.g. Opportunités) needs more room or its inner columns get squeezed --
// opt in per-page via definePageMeta({ wide: true }) rather than widening
// every page's reading column.
const wide = computed(() => !!route.meta.wide)

// A page with its own fixed bottom action bar (the CV comparison) hides the
// floating navigation: opt in via definePageMeta({ hideTabBar: true }).
const hideTabBar = computed(() => !!route.meta.hideTabBar)

// Mobile bottom bar: the profile lives in the top-right button instead.
const tabs = [
  { key: 'app.nav.dashboard', to: '/dashboard', icon: 'home' },
  { key: 'app.nav.opportunities', to: '/opportunites', icon: 'grid' },
  { key: 'app.nav.applications', to: '/candidatures', icon: 'file' },
  { key: 'app.nav.preferences', to: '/preferences', icon: 'sliders' },
  { key: 'app.nav.settings', to: '/settings', icon: 'gear' },
]
const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <div class="relative flex h-screen overflow-hidden bg-[#fbf9ff]">
    <!-- Big soft colour blobs behind everything -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -right-24 -top-32 h-[340px] w-[340px] rounded-full bg-sun" />
      <div class="absolute -bottom-28 -left-28 h-[300px] w-[300px] rounded-full bg-lav" />
      <div class="absolute right-[18%] top-[30%] h-[120px] w-[120px] rounded-full bg-blush/60" />
    </div>

    <!-- Desktop sidebar -->
    <div class="relative z-10 hidden lg:flex">
      <AppSidebar />
    </div>

    <!-- Mobile top bar -->
    <header
      class="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-[#FBF9FF]/90 px-4 py-3 backdrop-blur lg:hidden"
    >
      <NuxtLink to="/" class="flex items-center gap-2 font-black text-ink">
        <UiLogoMark :size="30" />
        Bye Bye Boss
      </NuxtLink>
      <NuxtLink
        to="/profile"
        :aria-label="$t('app.nav.profile')"
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-ink"
        :class="isActive('/profile') ? 'bg-sun' : ''"
      >
        <AppNavIcon name="user" />
      </NuxtLink>
    </header>

    <main class="relative z-10 flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">
      <div
        class="mx-auto px-5 py-6 lg:px-10 lg:py-8"
        :class="[wide ? 'max-w-7xl' : 'max-w-5xl', hideTabBar ? '' : 'pb-28 lg:pb-8']"
      >
        <slot />
      </div>
    </main>

    <!-- Mobile floating navigation -->
    <nav
      v-if="!hideTabBar"
      class="fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-full border-[2.5px] border-ink bg-brand px-2 py-2 lg:hidden"
      :aria-label="$t('app.menu')"
    >
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        :aria-label="$t(tab.key)"
        class="flex h-11 w-11 items-center justify-center rounded-full border-2 transition"
        :class="
          isActive(tab.to)
            ? 'border-ink bg-sun text-ink'
            : 'border-transparent text-white/90 hover:bg-white/15'
        "
      >
        <AppNavIcon :name="tab.icon" class="!h-[22px] !w-[22px]" />
      </NuxtLink>
    </nav>
  </div>
</template>
