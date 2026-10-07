<script setup>
// Admin > Utilisateurs: every account (e-mail masked), with a text filter and
// columns sortable by clicking their header.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · Utilisateurs — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const { data, error, loading, updatedAt, refresh } = useAdminResource(() => api('monitoring/users'))
const now = useNow({ interval: 30_000 })

const query = ref('')
const sortKey = ref('created_at')
const sortDir = ref('desc')

const PROFILE = {
  none: { state: 'info', label: 'Aucun', rank: 0 },
  draft: { state: 'warn', label: 'Brouillon', rank: 1 },
  complete: { state: 'ok', label: 'Complet', rank: 2 },
}
const MODE = { password: 'E-mail', google: 'Google' }

const columns = [
  { key: 'email', label: 'Compte' },
  { key: 'created_at', label: 'Inscrit' },
  { key: 'mode', label: 'Mode' },
  { key: 'verified', label: 'E-mail confirmé' },
  { key: 'profile_status', label: 'Profil' },
  { key: 'last_seen', label: 'Dernière activité' },
  { key: 'channels', label: 'Canaux' },
  { key: 'applications', label: 'Candidatures' },
]

function sortValue(u, key) {
  switch (key) {
    case 'email':
      return (u.email || '').toLowerCase()
    case 'profile_status':
      return PROFILE[u.profile_status]?.rank ?? -1
    case 'verified':
      return u[key] ? 1 : 0
    case 'channels':
      return (u.channels || []).length
    case 'created_at':
    case 'last_seen':
      return u[key] ? new Date(u[key]).getTime() : -1
    default:
      return u[key] ?? ''
  }
}

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = (data.value || []).filter(
    (u) => !q || `${u.email} ${u.first_name || ''}`.toLowerCase().includes(q)
  )
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const va = sortValue(a, sortKey.value)
    const vb = sortValue(b, sortKey.value)
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })
})

function sortBy(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    // dates and counters are most useful biggest/latest first
    sortDir.value = ['email', 'mode'].includes(key) ? 'asc' : 'desc'
  }
}
const ariaSort = (key) =>
  sortKey.value === key ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none'
</script>

<template>
  <div>
    <AdminHeader :updated-at="updatedAt" :loading="loading" @refresh="refresh" />

    <AdminNotice v-if="error" tone="bad" class="mb-4">
      {{ error }}
      <button type="button" class="ml-2 underline" @click="refresh">Réessayer</button>
    </AdminNotice>
    <p v-if="!data && !error" class="py-16 text-center text-sm font-semibold text-ink/60">
      Chargement…
    </p>

    <AdminCard v-if="data" title="Comptes" subtitle="Les adresses e-mail sont masquées">
      <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label class="relative block w-full sm:w-80">
          <span class="sr-only">Filtrer les comptes</span>
          <input
            v-model="query"
            type="search"
            placeholder="Filtrer par e-mail ou prénom…"
            class="w-full rounded-full border-2 border-ink bg-white px-4 py-2 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand focus:shadow-focus-ring"
          />
        </label>
        <span class="text-sm font-semibold text-ink/60">
          {{
            rows.length === data.length
              ? plural(data.length, 'compte', 'comptes')
              : `${fmtInt(rows.length)} sur ${plural(data.length, 'compte', 'comptes')}`
          }}
        </span>
      </div>

      <AdminEmpty v-if="!rows.length">Aucun compte ne correspond à ce filtre.</AdminEmpty>
      <AdminTable v-else min-width="860px">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" :aria-sort="ariaSort(c.key)">
              <button
                type="button"
                class="inline-flex items-center gap-1 font-extrabold hover:text-ink"
                :class="sortKey === c.key ? 'text-ink' : ''"
                @click="sortBy(c.key)"
              >
                {{ c.label }}
                <span aria-hidden="true" class="text-[10px]">
                  {{ sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕' }}
                </span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in rows" :key="u.user_id">
            <td>
              <div class="flex items-center gap-1.5 font-semibold">
                {{ u.email }}
                <span
                  v-if="u.is_admin"
                  class="rounded-full bg-ink px-1.5 py-px text-[10px] font-extrabold text-white"
                >
                  Admin
                </span>
              </div>
              <div class="text-xs text-ink/60">{{ u.first_name || '—' }}</div>
            </td>
            <td class="whitespace-nowrap">{{ fmtDate(u.created_at) }}</td>
            <td>{{ MODE[u.mode] || u.mode }}</td>
            <td>
              <AdminPill :state="u.verified ? 'ok' : 'warn'" :text="u.verified ? 'Oui' : 'Non'" />
            </td>
            <td>
              <AdminPill
                :state="PROFILE[u.profile_status]?.state"
                :text="PROFILE[u.profile_status]?.label || u.profile_status"
              />
            </td>
            <td class="whitespace-nowrap">
              {{ u.last_seen ? timeAgo(u.last_seen, +now) : 'Jamais' }}
            </td>
            <td>
              <span v-if="u.channels?.length" class="flex flex-wrap gap-1">
                <AdminPill
                  v-for="c in u.channels"
                  :key="c"
                  state="ok"
                  :text="CHANNEL_LABELS[c] || c"
                />
              </span>
              <AdminPill v-else state="info" text="Aucun" />
            </td>
            <td>{{ fmtInt(u.applications) }}</td>
          </tr>
        </tbody>
      </AdminTable>
    </AdminCard>
  </div>
</template>
