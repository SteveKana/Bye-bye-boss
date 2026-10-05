<script setup>
// Light navigation column (desktop shell only -- on mobile the layout has a
// floating bottom bar instead).
const auth = useAuthStore()
const route = useRoute()
const { fullName, initials, pictureUrl } = useUserDisplay()
const displayName = computed(() => fullName.value || auth.user?.email || '')

const items = [
  { key: 'app.nav.dashboard', to: '/dashboard', icon: 'home' },
  { key: 'app.nav.opportunities', to: '/opportunites', icon: 'grid' },
  { key: 'app.nav.applications', to: '/candidatures', icon: 'file' },
  { divider: true },
  { key: 'app.nav.profile', to: '/profile', icon: 'user' },
  { key: 'app.nav.preferences', to: '/preferences', icon: 'sliders' },
  { key: 'app.nav.settings', to: '/settings', icon: 'gear' },
]

async function logout() {
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <aside
    class="flex h-full w-64 shrink-0 flex-col border-r-[2.5px] border-ink bg-white/80 p-3 text-ink backdrop-blur"
  >
    <NuxtLink to="/" class="mb-6 flex items-center gap-2.5 px-2 py-2">
      <UiLogoMark :size="34" />
      <span class="text-lg font-black">Bye Bye Boss</span>
    </NuxtLink>

    <nav class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
      <template v-for="(item, i) in items" :key="i">
        <div v-if="item.divider" class="my-3 h-0.5 rounded bg-ink/10" />
        <NuxtLink
          v-else
          :to="item.to"
          class="flex items-center gap-3 rounded-full border-2 px-4 py-2.5 text-sm font-extrabold transition"
          :class="
            route.path === item.to || route.path.startsWith(`${item.to}/`)
              ? 'border-ink bg-sun text-ink'
              : 'border-transparent text-gray-600 hover:bg-lav hover:text-ink'
          "
        >
          <AppNavIcon :name="item.icon" />
          {{ $t(item.key) }}
        </NuxtLink>
      </template>
    </nav>

    <div class="mt-2 border-t-2 border-ink/10 pt-2">
      <div class="px-2 pb-2">
        <UiLangSwitcher />
      </div>
      <div class="flex items-center gap-2.5 px-2 py-2">
        <UiAvatar
          :picture-url="pictureUrl"
          :initials="initials"
          circle-class="h-9 w-9 border-2 border-ink text-xs font-bold text-white"
        />
        <div class="min-w-0">
          <div class="truncate text-[13px] font-extrabold">{{ displayName }}</div>
          <div class="truncate text-[11px] text-gray-500">{{ auth.user?.email }}</div>
        </div>
      </div>
      <button
        class="mt-1 flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm font-extrabold text-gray-600 transition hover:bg-lav hover:text-ink"
        @click="logout"
      >
        <AppNavIcon name="logout" />
        {{ $t('app.logout') }}
      </button>
    </div>
  </aside>
</template>
