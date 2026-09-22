<script setup>
// Navy navigation column, shared by the desktop shell and the mobile drawer.
const auth = useAuthStore()
const route = useRoute()
const { fullName, initials } = useUserDisplay()
const displayName = computed(() => fullName.value || auth.user?.email || '')

const items = [
  { key: 'app.nav.dashboard', to: '/dashboard', icon: 'home' },
  { key: 'app.nav.opportunities', icon: 'grid', disabled: true },
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
  <aside class="flex h-full w-64 shrink-0 flex-col bg-navy-light p-3 text-white">
    <div class="mb-6 flex items-center gap-2.5 px-2 py-2">
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-black"
      >
        BB
      </span>
      <span class="font-bold">Bye Bye Boss</span>
    </div>

    <nav class="flex flex-1 flex-col gap-0.5">
      <template v-for="(item, i) in items" :key="i">
        <div v-if="item.divider" class="my-3.5 h-px bg-white/10" />
        <NuxtLink
          v-else-if="!item.disabled"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="
            route.path === item.to
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          "
        >
          <AppNavIcon :name="item.icon" />
          {{ $t(item.key) }}
        </NuxtLink>
        <span
          v-else
          class="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/30"
          :title="$t('app.soon')"
        >
          <AppNavIcon :name="item.icon" />
          {{ $t(item.key) }}
          <span class="ml-auto text-[10px] uppercase tracking-wide text-white/25">
            {{ $t('app.soon') }}
          </span>
        </span>
      </template>
    </nav>

    <div class="mt-2 border-t border-white/10 pt-2">
      <div class="px-2 pb-2">
        <UiLangSwitcher dark />
      </div>
      <div class="flex items-center gap-2.5 px-2 py-2">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold"
        >
          {{ initials }}
        </span>
        <div class="min-w-0">
          <div class="truncate text-[13px] font-semibold">{{ displayName }}</div>
          <div class="truncate text-[11px] text-white/40">{{ auth.user?.email }}</div>
        </div>
      </div>
      <button
        class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
        @click="logout"
      >
        <AppNavIcon name="logout" />
        {{ $t('app.logout') }}
      </button>
    </div>
  </aside>
</template>
