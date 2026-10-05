<script setup>
// Admin > Comportement & coûts: how people use the product, what the AI costs,
// and which accounts deserve a nudge.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · Comportement & coûts — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const days = useAdminDays()
const { data, error, loading, updatedAt, refresh } = useAdminResource(
  () => api('monitoring/behavior', { query: { days: days.value } }),
  { watch: [days] }
)
const now = useNow({ interval: 30_000 })

const tiles = computed(() => data.value?.tiles)
const periodShort = computed(() => (days.value === 1 ? "aujourd'hui" : `${days.value} j`))
const periodLong = computed(() =>
  days.value === 1 ? "aujourd'hui" : `${days.value} derniers jours`
)
const perDay = computed(() => {
  const t = tiles.value
  if (!t) return ''
  if (days.value === 1) return 'sur la journée'
  return `${fmtInt(Math.round(t.page_views / days.value))} par jour en moyenne`
})

const modeColors = { password: CHART_COLORS[0], google: CHART_COLORS[1] }
const modeParts = computed(() =>
  (data.value?.signup_modes || []).map((m, i) => ({
    label: m.label,
    value: m.count,
    color: modeColors[m.key] || CHART_COLORS[i % CHART_COLORS.length],
  }))
)

const pageItems = computed(() =>
  (data.value?.top_pages || []).map((p) => ({ label: p.label || p.path, value: p.count }))
)

const costSeries = [
  { key: 'detailed', label: 'Analyses détaillées', color: CHART_COLORS[0] },
  { key: 'prefilter', label: 'Pré-analyses', color: CHART_COLORS[1] },
]
const costDays = computed(() =>
  (data.value?.cost_daily || []).map((d) => ({
    label: fmtShortDate(d.date),
    values: { detailed: d.detailed_eur, prefilter: d.prefilter_eur },
  }))
)
const costEmpty = computed(
  () => !costDays.value.some((d) => d.values.detailed || d.values.prefilter)
)

const STAGES = {
  unverified: 'warn',
  no_cv: 'info',
  no_application: 'info',
}
const ACTION_LABELS = {
  resend_verification: 'Renvoyer le lien',
  reminder: 'Envoyer un rappel',
}
const MODE_LABELS = { password: 'E-mail', google: 'Google' }

// Nudge buttons: one request at a time per account, result shown inline.
const busy = ref(null)
const feedback = ref(null)
let feedbackTimer = null
async function runAction(account) {
  busy.value = account.user_id
  feedback.value = null
  clearTimeout(feedbackTimer)
  try {
    const res = await api(`monitoring/accounts/${account.user_id}/action`, {
      method: 'POST',
      body: { action: account.action },
    })
    feedback.value = {
      tone: 'ok',
      text: `${res?.detail || 'Action envoyée.'} (${account.email})`,
    }
  } catch (err) {
    feedback.value = {
      tone: 'bad',
      text: `${err?.message || "L'action a échoué, réessaie dans un instant."} (${account.email})`,
    }
  } finally {
    busy.value = null
    feedbackTimer = setTimeout(() => (feedback.value = null), 8000)
  }
}
onBeforeUnmount(() => clearTimeout(feedbackTimer))
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
      <AdminNotice tone="info">
        <template v-if="data.tracking_since">
          Pages vues enregistrées depuis le {{ fmtDate(data.tracking_since) }}
        </template>
        <template v-else>
          Le suivi des pages vient de démarrer : les premiers chiffres arrivent demain
        </template>
      </AdminNotice>

      <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        <AdminTile
          :label="`Utilisateurs actifs (${periodShort})`"
          :value="fmtInt(tiles.active_users)"
          :sub="`sur ${fmtInt(tiles.users_total)} inscrits`"
        />
        <AdminTile
          :label="`Pages vues (${periodShort})`"
          :value="fmtInt(tiles.page_views)"
          :sub="perDay"
        />
        <AdminTile
          label="Candidatures lancées"
          :value="fmtInt(tiles.applications)"
          sub="clics « Voir l'offre »"
        />
        <AdminTile
          label="E-mails non confirmés"
          :value="fmtInt(tiles.unverified)"
          :sub="`sur ${fmtInt(tiles.users_total)} inscrits`"
          :flag="tiles.unverified > 0 ? '▲ à relancer' : ''"
        />
        <AdminTile
          label="Coût IA aujourd'hui"
          :value="fmtEur(tiles.cost_today_eur)"
          :sub="days === 1 ? '' : `${periodShort} : ${fmtEur(tiles.cost_period_eur)}`"
        />
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard
          title="De l'inscription à la première candidature"
          subtitle="Où les utilisateurs s'arrêtent"
        >
          <AdminFunnel :items="data.funnel" aria-label="Entonnoir d'inscription" />
        </AdminCard>

        <AdminCard>
          <h2 class="text-md font-black text-ink">Mode d'inscription</h2>
          <p class="mb-3 mt-0.5 text-xs font-medium text-ink/60">Comment les comptes sont créés</p>
          <AdminEmpty v-if="!modeParts.length">Pas encore de comptes.</AdminEmpty>
          <AdminStack100 v-else :parts="modeParts" aria-label="Mode d'inscription" />

          <h2 class="mt-6 text-md font-black text-ink">Pages les plus consultées</h2>
          <p class="mb-3 mt-0.5 text-xs font-medium text-ink/60 first-letter:uppercase">
            {{ periodLong }} · utilisateurs connectés
          </p>
          <AdminEmpty v-if="!pageItems.length">Aucune page vue sur la période.</AdminEmpty>
          <AdminHBars
            v-else
            :items="pageItems"
            :label-width="130"
            aria-label="Pages les plus consultées"
          />
        </AdminCard>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <AdminCard
          title="Offres les plus candidatées"
          :subtitle="`Clics sur « Voir l'offre » · ${periodLong}`"
        >
          <AdminEmpty v-if="!data.top_applied_offers.length">
            Aucune candidature sur la période.
          </AdminEmpty>
          <AdminTable v-else min-width="400px">
            <thead>
              <tr>
                <th>Poste</th>
                <th>Entreprise</th>
                <th>Clics</th>
                <th>Score moy.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(o, i) in data.top_applied_offers" :key="i">
                <td class="font-semibold">{{ o.title }}</td>
                <td>{{ o.company }}</td>
                <td>{{ fmtInt(o.count) }}</td>
                <td>{{ o.avg_score == null ? '—' : o.avg_score }}</td>
              </tr>
            </tbody>
          </AdminTable>
        </AdminCard>

        <AdminCard title="Coût IA par jour" subtitle="7 derniers jours">
          <AdminEmpty v-if="costEmpty">Aucun coût enregistré sur les 7 derniers jours.</AdminEmpty>
          <AdminStackedBars
            v-else
            :series="costSeries"
            :days="costDays"
            :format="fmtEur"
            :integer="false"
            :height="200"
            aria-label="Coût IA par jour"
          />
          <p v-if="data.cost_note" class="mt-2 text-xs font-medium text-ink/60">
            {{ data.cost_note }}
          </p>
        </AdminCard>
      </div>

      <AdminCard title="Comptes à relancer" subtitle="Les actions partent depuis cette page">
        <AdminNotice v-if="feedback" :tone="feedback.tone" class="mb-3">
          {{ feedback.text }}
        </AdminNotice>
        <AdminEmpty v-if="!data.accounts_to_follow.length">
          Personne à relancer pour le moment.
        </AdminEmpty>
        <AdminTable v-else min-width="640px">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Inscrit</th>
              <th>Mode</th>
              <th>Où il s'est arrêté</th>
              <th><span class="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data.accounts_to_follow" :key="a.user_id">
              <td class="font-semibold">{{ a.email }}</td>
              <td class="whitespace-nowrap">{{ timeAgo(a.created_at, +now) }}</td>
              <td>{{ MODE_LABELS[a.mode] || a.mode }}</td>
              <td><AdminPill :state="STAGES[a.stage] || 'info'" :text="a.stage_label" /></td>
              <td class="text-right">
                <UiButton
                  size="sm"
                  variant="secondary"
                  :loading="busy === a.user_id"
                  :disabled="busy !== null"
                  @click="runAction(a)"
                >
                  {{ ACTION_LABELS[a.action] || a.action }}
                </UiButton>
              </td>
            </tr>
          </tbody>
        </AdminTable>
      </AdminCard>

      <p class="text-xs font-medium text-ink/55">
        Pages vues : enregistrées par nos soins sur le site, sans cookie ni outil tiers, uniquement
        pour les comptes connectés.
      </p>
    </div>
  </div>
</template>
