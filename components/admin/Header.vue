<script setup>
// Page header shared by every admin tab: title, period selector, "updated X s
// ago" + refresh button, and the tab navigation.
defineProps({
  updatedAt: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  showPeriod: { type: Boolean, default: false },
})
defineEmits(['refresh'])

const route = useRoute()
const days = useAdminDays()
const now = useNow({ interval: 1000 })

const tabs = [
  { to: '/admin', label: "Vue d'ensemble" },
  { to: '/admin/behavior', label: 'Comportement & coûts' },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/incidents', label: 'Incidents' },
  { to: '/admin/email', label: 'E-mail aux utilisateurs' },
]
const isActive = (to) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h1 class="text-2xl font-black text-ink">
        Monitoring
        <small class="ml-1 block text-sm font-semibold text-ink/55 sm:ml-2 sm:inline">
          Bye Bye Boss · réservé aux administrateurs
        </small>
      </h1>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-ink/70">
        <div
          v-if="showPeriod"
          class="flex overflow-hidden rounded-full border-2 border-ink bg-white"
          role="group"
          aria-label="Période"
        >
          <button
            v-for="p in ADMIN_PERIODS"
            :key="p.days"
            type="button"
            class="px-3 py-1.5 text-sm font-extrabold transition"
            :class="days === p.days ? 'bg-ink text-white' : 'text-ink hover:bg-lav'"
            :aria-pressed="days === p.days"
            @click="days = p.days"
          >
            {{ p.label }}
          </button>
        </div>

        <span v-if="updatedAt" aria-live="off">Mis à jour {{ timeAgo(updatedAt, +now) }}</span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white text-ink transition hover:bg-lav disabled:opacity-60"
          :disabled="loading"
          aria-label="Actualiser"
          title="Actualiser"
          @click="$emit('refresh')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
            :class="loading ? 'animate-spin' : ''"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>

    <nav
      class="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      aria-label="Sections du monitoring"
    >
      <NuxtLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        class="whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-extrabold transition"
        :class="
          isActive(t.to)
            ? 'border-ink bg-sun text-ink'
            : 'border-transparent bg-white/70 text-ink/70 hover:bg-lav hover:text-ink'
        "
        :aria-current="isActive(t.to) ? 'page' : undefined"
      >
        {{ t.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
