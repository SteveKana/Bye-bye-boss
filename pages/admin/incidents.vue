<script setup>
// Admin > Incidents: grouped errors, filter by state, click a row for the
// detail panel with the status actions.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · Incidents — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const now = useNow({ interval: 30_000 })

const FILTERS = [
  { key: 'open', label: 'Ouverts' },
  { key: 'resolved', label: 'Résolus' },
  { key: 'all', label: 'Tous' },
]
const filter = ref('open')
const { data, error, loading, updatedAt, refresh } = useAdminResource(
  () => api('monitoring/incidents', { query: { status: filter.value } }),
  { watch: [filter] }
)

const tiles = computed(() => data.value?.tiles)
const perDayItems = computed(() =>
  (data.value?.per_day || []).map((d) => ({ label: fmtShortDate(d.date), value: d.count }))
)

// ---- Detail panel ----------------------------------------------------------
const selectedId = ref(null)
const detail = ref(null)
const detailError = ref('')
const detailLoading = ref(false)
const actionBusy = ref('')
const actionError = ref('')
const detailEl = ref(null)

async function loadDetail(id, { scroll = false } = {}) {
  selectedId.value = id
  detailError.value = ''
  detailLoading.value = true
  try {
    const res = await api(`monitoring/incidents/${id}`)
    if (selectedId.value !== id) return
    detail.value = res
    if (scroll) {
      await nextTick()
      detailEl.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  } catch (err) {
    if (selectedId.value !== id) return
    detail.value = null
    detailError.value = err?.message || "Impossible de charger le détail de l'incident."
  } finally {
    if (selectedId.value === id) detailLoading.value = false
  }
}

function select(item) {
  actionError.value = ''
  loadDetail(item.id, { scroll: true })
}

async function setStatus(status) {
  if (!detail.value) return
  actionBusy.value = status
  actionError.value = ''
  try {
    const updated = await api(`monitoring/incidents/${detail.value.id}`, {
      method: 'PATCH',
      body: { status },
    })
    detail.value = { ...detail.value, ...updated }
    await refresh()
  } catch (err) {
    actionError.value = err?.message || 'La modification a échoué, réessaie dans un instant.'
  } finally {
    actionBusy.value = ''
  }
}

const MAX_OCCURRENCES = 6
const occurrences = computed(() => {
  const list = detail.value?.occurrences || []
  const shown = list.slice(0, MAX_OCCURRENCES).map(fmtDateTime).join(' · ')
  return list.length > MAX_OCCURRENCES ? `${shown} · +${list.length - MAX_OCCURRENCES}` : shown
})

function openedLabel(i) {
  return i.status === 'resolved' && i.resolved_at
    ? `corrigé le ${fmtDate(i.resolved_at).slice(0, 5)}`
    : timeAgo(i.first_seen, +now.value)
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

    <div v-if="data" class="space-y-3" :class="loading ? 'opacity-70 transition' : 'transition'">
      <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        <AdminTile
          label="Incidents ouverts"
          :value="fmtInt(tiles.open)"
          :sub="`dont ${fmtInt(tiles.new)} ${tiles.new > 1 ? 'nouveaux' : 'nouveau'}`"
        />
        <AdminTile
          label="Utilisateurs touchés"
          :value="fmtInt(tiles.affected_users)"
          sub="par un incident ouvert"
        />
        <AdminTile
          label="Erreurs serveur (7 j)"
          :value="fmtInt(tiles.server_errors)"
          :sub="tiles.server_errors === 0 ? 'aucune erreur 500' : 'erreurs 500'"
        />
        <AdminTile
          label="Erreurs d'affichage (7 j)"
          :value="fmtInt(tiles.browser_errors)"
          sub="dans le navigateur"
        />
        <AdminTile label="Résolus cette semaine" :value="fmtInt(tiles.resolved_period)" sub="" />
      </div>

      <AdminCard
        title="Incidents"
        subtitle="Les erreurs identiques sont regroupées en une seule ligne"
      >
        <div class="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filtrer par état">
          <UiButton
            v-for="f in FILTERS"
            :key="f.key"
            size="sm"
            :variant="filter === f.key ? 'primary' : 'secondary'"
            :aria-pressed="filter === f.key"
            @click="filter = f.key"
          >
            {{ f.label }}
          </UiButton>
        </div>

        <AdminEmpty v-if="!data.items.length">
          {{ filter === 'resolved' ? 'Aucun incident résolu.' : 'Aucun incident. Tout va bien.' }}
        </AdminEmpty>
        <AdminTable v-else min-width="780px">
          <thead>
            <tr>
              <th>État</th>
              <th>Problème</th>
              <th>Fois</th>
              <th>Touchés</th>
              <th>Dernière fois</th>
              <th>Ouvert</th>
              <th><span class="sr-only">Détail</span></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in data.items"
              :key="i.id"
              class="cursor-pointer transition hover:bg-lav/40"
              :class="selectedId === i.id ? 'bg-lav/60' : ''"
              @click="select(i)"
            >
              <td>
                <AdminPill
                  :state="INCIDENT_STATUS[i.status]?.state"
                  :text="INCIDENT_STATUS[i.status]?.label || i.status"
                />
              </td>
              <td>
                <b class="font-extrabold">{{ i.title }}</b>
                <br />
                <span class="text-xs text-ink/60">{{ i.context }}</span>
              </td>
              <td>{{ fmtInt(i.count) }}</td>
              <td class="whitespace-nowrap">
                {{ plural(i.affected_users, 'personne', 'personnes') }}
              </td>
              <td class="whitespace-nowrap">{{ fmtDateTime(i.last_seen) }}</td>
              <td class="whitespace-nowrap text-ink/70">{{ openedLabel(i) }}</td>
              <td class="text-right">
                <UiButton
                  size="sm"
                  variant="secondary"
                  :aria-label="`Détail : ${i.title}`"
                  @click.stop="select(i)"
                >
                  Détail
                </UiButton>
              </td>
            </tr>
          </tbody>
        </AdminTable>
      </AdminCard>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard ref="detailEl" :title="detail ? `Détail : « ${detail.title} »` : 'Détail'">
          <template v-if="!selectedId">
            <p class="text-xs font-medium text-ink/60">Ce que tu vois en cliquant sur une ligne</p>
            <AdminEmpty class="mt-3">Clique sur un incident pour voir son détail.</AdminEmpty>
          </template>
          <p v-else-if="detailLoading && !detail" class="text-sm font-semibold text-ink/60">
            Chargement…
          </p>
          <AdminNotice v-else-if="detailError" tone="bad">{{ detailError }}</AdminNotice>
          <template v-else-if="detail">
            <p class="-mt-2 mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-ink/60">
              <AdminPill
                :state="INCIDENT_STATUS[detail.status]?.state"
                :text="INCIDENT_STATUS[detail.status]?.label"
              />
              <span>{{ plural(detail.count, 'occurrence', 'occurrences') }}</span>
            </p>
            <AdminTable min-width="0px">
              <tbody>
                <tr>
                  <th scope="row" class="w-[9.5rem]">Quand</th>
                  <td>{{ occurrences || '—' }}</td>
                </tr>
                <tr>
                  <th scope="row">Qui</th>
                  <td>{{ detail.users?.length ? detail.users.join(', ') : '—' }}</td>
                </tr>
                <tr>
                  <th scope="row">Où</th>
                  <td>{{ detail.where || '—' }}</td>
                </tr>
                <tr>
                  <th scope="row">Cause technique</th>
                  <td class="break-words">{{ detail.technical_cause || '—' }}</td>
                </tr>
                <tr>
                  <th scope="row">Ce que l'utilisateur a vu</th>
                  <td>{{ detail.user_message ? `« ${detail.user_message} »` : '—' }}</td>
                </tr>
              </tbody>
            </AdminTable>

            <AdminNotice v-if="actionError" tone="bad" class="mt-3">{{ actionError }}</AdminNotice>
            <div class="mt-4 flex flex-wrap gap-2">
              <UiButton
                size="sm"
                variant="secondary"
                :loading="actionBusy === 'in_progress'"
                :disabled="detail.status === 'in_progress' || !!actionBusy"
                @click="setStatus('in_progress')"
              >
                Marquer en cours
              </UiButton>
              <UiButton
                v-if="detail.status !== 'resolved'"
                size="sm"
                variant="primary"
                :loading="actionBusy === 'resolved'"
                :disabled="!!actionBusy"
                @click="setStatus('resolved')"
              >
                Marquer résolu
              </UiButton>
              <UiButton
                v-else
                size="sm"
                variant="primary"
                :loading="actionBusy === 'new'"
                :disabled="!!actionBusy"
                @click="setStatus('new')"
              >
                Rouvrir
              </UiButton>
              <UiButton size="sm" variant="secondary" @click="navigateTo('/admin/email')">
                Écrire à l'utilisateur
              </UiButton>
            </div>
          </template>
        </AdminCard>

        <AdminCard title="Incidents par jour" subtitle="7 derniers jours">
          <AdminHBars
            :items="perDayItems"
            :label-width="60"
            color="#d03b3b"
            aria-label="Incidents par jour"
          />
        </AdminCard>
      </div>

      <p class="text-xs font-medium text-ink/55">
        Capturé automatiquement : erreurs serveur, échecs d'envoi des alertes, échecs d'import de
        CV, erreurs d'affichage dans le navigateur. Le contenu des CV n'est jamais enregistré.
      </p>
    </div>
  </div>
</template>
