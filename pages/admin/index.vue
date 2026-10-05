<script setup>
// Admin > Vue d'ensemble: health, key figures, signups, matching funnel,
// offers by source, alerts of the day, scheduled jobs, latest incidents.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: "Monitoring · Vue d'ensemble — Bye Bye Boss",
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const days = useAdminDays()
const { data, error, loading, updatedAt, refresh } = useAdminResource(
  () => api('monitoring/overview', { query: { days: days.value } }),
  { watch: [days] }
)

const now = useNow({ interval: 30_000 })

const HEALTH_ICON = { ok: '✓', warn: '!', bad: '✕' }
const HEALTH_DOT = { ok: 'bg-[#0a8a0a]', warn: 'bg-[#b87500]', bad: 'bg-[#d03b3b]' }
const HEALTH_TEXT = { ok: 'OK', warn: 'À surveiller', bad: 'En panne' }

const tiles = computed(() => data.value?.tiles)
const failedChannels = computed(() =>
  (data.value?.alerts_today || [])
    .filter((a) => a.failed > 0)
    .map((a) => CHANNEL_LABELS[a.channel] || a.channel)
    .join(' · ')
)
const channelSplit = computed(() => {
  const c = tiles.value?.alerts_by_channel_today || {}
  return Object.keys(CHANNEL_LABELS)
    .map((k) => `${k === 'email' ? 'e-mail' : CHANNEL_LABELS[k]} ${c[k] ?? 0}`)
    .join(' · ')
})

const signupItems = computed(() =>
  (data.value?.signups || []).map((s) => ({
    label: fmtShortDate(s.date),
    value: s.count,
    title: `${fmtShortDate(s.date)} : ${plural(s.count, 'inscription', 'inscriptions')}`,
  }))
)
const signupsTotal = computed(() => (data.value?.signups || []).reduce((a, s) => a + s.count, 0))

const funnelEmpty = computed(() => !(data.value?.matching_funnel || []).some((f) => f.value > 0))

const sourceSeries = computed(() =>
  (data.value?.offers_by_source?.sources || []).map((key, i) => ({
    key,
    label: sourceLabel(key),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))
)
const sourceDays = computed(() =>
  (data.value?.offers_by_source?.days || []).map((d) => ({
    label: fmtShortDate(d.date),
    values: d.counts,
  }))
)

const alertItems = computed(() =>
  (data.value?.alerts_today || []).map((a) => ({
    label: CHANNEL_LABELS[a.channel] || a.channel,
    value: a.sent,
    failed: a.failed,
  }))
)

const JOB_STATE = {
  ok: { state: 'ok', label: 'OK' },
  error: { state: 'bad', label: 'Erreur' },
  never: { state: 'info', label: 'Jamais lancée' },
}
</script>

<template>
  <div>
    <AdminHeader :updated-at="updatedAt" :loading="loading" show-period @refresh="refresh" />

    <AdminNotice v-if="error" tone="bad" class="mb-4">
      {{ error }}
      <button type="button" class="ml-2 underline" @click="refresh">Réessayer</button>
    </AdminNotice>
    <p v-if="!data && !error" class="py-16 text-center text-sm font-semibold text-ink/60">
      Chargement…
    </p>

    <div v-if="data" class="space-y-3" :class="loading ? 'opacity-70 transition' : 'transition'">
      <!-- Health -->
      <ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <li
          v-for="h in data.health"
          :key="h.key"
          class="flex items-center gap-2.5 rounded-2xl border-2 border-ink bg-white px-3 py-2.5"
        >
          <span
            class="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-xs font-extrabold text-white"
            :class="HEALTH_DOT[h.state]"
            aria-hidden="true"
          >
            {{ HEALTH_ICON[h.state] }}
          </span>
          <div class="min-w-0">
            <b class="block text-[13px] font-extrabold text-ink">
              {{ h.label }}<span class="sr-only"> : {{ HEALTH_TEXT[h.state] }}</span>
            </b>
            <span class="block text-xs font-medium text-ink/60">{{ h.detail }}</span>
          </div>
        </li>
      </ul>

      <!-- Key figures -->
      <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <AdminTile
          label="Utilisateurs inscrits"
          :value="fmtInt(tiles.users_total)"
          :sub="`+${fmtInt(tiles.users_new)} ${periodPhrase(days)}`"
        />
        <AdminTile
          label="Profils complets"
          :value="fmtInt(tiles.profiles_complete)"
          :sub="`${fmtPercent(tiles.profiles_complete, tiles.users_total)} des inscrits`"
        />
        <AdminTile
          label="Offres en base (30 j)"
          :value="fmtInt(tiles.offers_30d)"
          :sub="`+${fmtInt(tiles.offers_today)} aujourd'hui`"
        />
        <AdminTile
          label="Analyses détaillées / jour"
          :value="fmtInt(tiles.analyses_today)"
          :sub="`${fmtInt(tiles.prefilter_today)} pré-analyses`"
        />
        <AdminTile
          label="Alertes envoyées aujourd'hui"
          :value="fmtInt(tiles.alerts_sent_today)"
          :sub="channelSplit"
        />
        <AdminTile
          label="Alertes en échec"
          :value="fmtInt(tiles.alerts_failed_today)"
          :sub="failedChannels"
          :flag="tiles.alerts_failed_today > 0 ? '▲ à vérifier' : '✓ aucun échec'"
          :flag-state="tiles.alerts_failed_today > 0 ? 'bad' : 'ok'"
        />
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard
          title="Inscriptions par jour"
          :subtitle="`30 derniers jours · ${plural(signupsTotal, 'inscription', 'inscriptions')} au total`"
        >
          <AdminBarChart :items="signupItems" aria-label="Inscriptions par jour" />
        </AdminCard>

        <AdminCard
          title="Dernier matching (24 dernières heures)"
          subtitle="Du pool d'offres jusqu'à l'analyse détaillée"
        >
          <AdminEmpty v-if="funnelEmpty">Aucun matching sur les dernières 24 heures.</AdminEmpty>
          <AdminFunnel v-else :items="data.matching_funnel" aria-label="Entonnoir du matching" />
        </AdminCard>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard title="Offres importées par source" subtitle="14 derniers jours">
          <AdminEmpty v-if="!sourceDays.length">Aucune offre importée sur la période.</AdminEmpty>
          <AdminStackedBars
            v-else
            :series="sourceSeries"
            :days="sourceDays"
            aria-label="Offres importées par source"
          />
        </AdminCard>

        <AdminCard
          title="Alertes envoyées aujourd'hui"
          subtitle="Par canal · les échecs sont en rouge"
        >
          <ul class="mb-1.5 flex gap-3.5 text-xs font-medium text-ink/70">
            <li class="flex items-center">
              <i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-[#2a78d6]" />Envoyées
            </li>
            <li class="flex items-center">
              <i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-[#d03b3b]" />Échecs
            </li>
          </ul>
          <AdminHBars
            :items="alertItems"
            :label-width="90"
            aria-label="Alertes envoyées par canal"
          />
        </AdminCard>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard title="Tâches planifiées" subtitle="Chaque tâche doit tourner à son heure">
          <AdminTable min-width="500px">
            <thead>
              <tr>
                <th>Tâche</th>
                <th>Dernier passage</th>
                <th>État</th>
                <th>Durée</th>
                <th>Prochain</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in data.jobs" :key="j.id">
                <td class="font-semibold">{{ j.label }}</td>
                <td class="whitespace-nowrap">
                  {{ j.last_run ? timeAgo(j.last_run, +now) : '—' }}
                </td>
                <td>
                  <AdminPill
                    :state="JOB_STATE[j.status]?.state"
                    :text="JOB_STATE[j.status]?.label"
                  />
                </td>
                <td class="whitespace-nowrap">{{ fmtDuration(j.duration_ms) }}</td>
                <td class="whitespace-nowrap text-ink/60">{{ timeUntil(j.next_run, +now) }}</td>
              </tr>
            </tbody>
          </AdminTable>
        </AdminCard>

        <AdminCard title="Derniers incidents" subtitle="Erreurs relevées, encore à traiter">
          <AdminEmpty v-if="!data.recent_incidents.length">
            Aucun incident ouvert. Tout va bien.
          </AdminEmpty>
          <AdminTable v-else min-width="480px">
            <thead>
              <tr>
                <th>Quand</th>
                <th>Type</th>
                <th>Détail</th>
                <th>Cause</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in data.recent_incidents" :key="i.id">
                <td class="whitespace-nowrap">{{ fmtDateTime(i.last_seen) }}</td>
                <td>
                  <AdminPill
                    :state="INCIDENT_KIND[i.kind]?.state"
                    :text="INCIDENT_KIND[i.kind]?.label || i.kind"
                  />
                </td>
                <td class="font-semibold">{{ i.title }}</td>
                <td class="text-ink/70">{{ i.context }}</td>
              </tr>
            </tbody>
          </AdminTable>
          <NuxtLink
            to="/admin/incidents"
            class="mt-3 inline-block text-sm font-extrabold text-brand hover:text-brand-dark"
          >
            Voir tous les incidents →
          </NuxtLink>
        </AdminCard>
      </div>
    </div>
  </div>
</template>
