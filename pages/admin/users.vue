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
// Not sortable: an action, not data.
const ACTION_COLUMN = 'Veille marché'

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

// ---- Veille marché: preview then send the market-watch e-mail to one profile ----
const toast = useToast()
const digestOpen = ref(false)
const digestUser = ref(null)
const digestLoading = ref(false)
const digestSending = ref(false)
const digestPreview = ref(null) // { ready, reason, subject, html, label, ... }
const digestError = ref('')
const ignoreThreshold = ref(false)
const frameHeight = ref(320)

async function loadDigestPreview() {
  if (!digestUser.value) return
  digestLoading.value = true
  digestError.value = ''
  try {
    digestPreview.value = await api('market/admin/digest/preview', {
      method: 'POST',
      body: { user_id: digestUser.value.user_id, ignore_threshold: ignoreThreshold.value },
    })
  } catch (err) {
    digestPreview.value = null
    digestError.value = err?.message || "L'aperçu n'a pas pu être généré."
  } finally {
    digestLoading.value = false
  }
}

function openDigest(user) {
  digestUser.value = user
  digestPreview.value = null
  digestError.value = ''
  ignoreThreshold.value = false
  digestOpen.value = true
  loadDigestPreview()
}

async function sendDigest() {
  digestSending.value = true
  digestError.value = ''
  try {
    const res = await api('market/admin/digest/send', {
      method: 'POST',
      body: { user_id: digestUser.value.user_id, ignore_threshold: ignoreThreshold.value },
    })
    toast.success(res?.detail || 'Veille marché envoyée')
    digestOpen.value = false
  } catch (err) {
    digestError.value = err?.message || "L'envoi n'a pas pu être effectué."
  } finally {
    digestSending.value = false
  }
}

function sizeFrame(event) {
  try {
    const body = event.target.contentDocument?.body
    const h = body ? Math.max(body.scrollHeight, body.offsetHeight) : 0
    if (h) frameHeight.value = Math.min(Math.max(h + 24, 200), 900)
  } catch {
    // keep the default height
  }
}
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
      <AdminTable v-else min-width="980px">
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
            <th>{{ ACTION_COLUMN }}</th>
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
            <td>
              <UiButton
                v-if="u.profile_status === 'complete'"
                size="sm"
                variant="secondary"
                @click="openDigest(u)"
              >
                📊 Envoyer
              </UiButton>
              <span v-else class="text-xs text-ink/40">Profil incomplet</span>
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </AdminCard>
    <UiModal v-model="digestOpen" title="Envoyer la veille marché" size="lg">
      <p v-if="digestUser" class="text-sm font-semibold text-ink/70">
        Destinataire : <b class="font-extrabold text-ink">{{ digestUser.email }}</b>
        <span v-if="digestUser.first_name"> ({{ digestUser.first_name }})</span>
      </p>

      <p v-if="digestLoading" class="py-8 text-center text-sm font-semibold text-ink/60">
        Préparation de l'aperçu…
      </p>

      <AdminNotice v-if="digestError" tone="bad" class="mt-3">{{ digestError }}</AdminNotice>

      <template v-if="digestPreview && !digestLoading">
        <AdminNotice v-if="!digestPreview.ready" tone="warn" class="mt-3">
          {{ digestPreview.reason }}
        </AdminNotice>

        <template v-else>
          <AdminNotice v-if="digestPreview.below_threshold" tone="warn" class="mt-3">
            Sous le seuil : {{ digestPreview.offers_analysed }} offres analysées pour «
            {{ digestPreview.label }} » (seuil {{ digestPreview.min_offers }}). Envoi possible
            uniquement parce que tu as coché « Envoyer quand même ».
          </AdminNotice>
          <div class="mt-3 overflow-hidden rounded-xl border-2 border-ink bg-white">
            <div
              class="border-b-2 border-ink bg-lav/40 px-3 py-2 text-xs font-semibold text-ink/70"
            >
              Objet : <b class="font-extrabold text-ink">{{ digestPreview.subject }}</b>
            </div>
            <iframe
              :srcdoc="digestPreview.html"
              sandbox="allow-same-origin"
              title="Aperçu de la veille marché"
              class="block w-full border-0"
              :style="{ height: `${frameHeight}px` }"
              @load="sizeFrame"
            />
          </div>
        </template>

        <label class="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            v-model="ignoreThreshold"
            type="checkbox"
            class="h-4 w-4"
            @change="loadDigestPreview"
          />
          Envoyer quand même si le métier a moins d'offres que le seuil
        </label>
      </template>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2.5">
          <UiButton variant="secondary" :disabled="digestSending" @click="digestOpen = false">
            Fermer
          </UiButton>
          <UiButton
            :disabled="!digestPreview?.ready || digestLoading"
            :loading="digestSending"
            @click="sendDigest"
          >
            Envoyer à ce profil
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
