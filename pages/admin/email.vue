<script setup>
// Admin > E-mail aux utilisateurs: write one message, preview it, send a test
// to yourself, then send it to an audience after an explicit confirmation.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · E-mail aux utilisateurs — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const toast = useToast()
const PLACEHOLDER = '{{prénom}}'

const subject = ref('')
const body = ref(`Bonjour ${PLACEHOLDER},\n\n\n\nÀ très vite,\nSteve — Bye Bye Boss`)
const audience = ref('verified')

// ---- Audiences + history (auto-refreshed every minute) ---------------------
const audiencesRes = useAdminResource(() => api('monitoring/announcements/audiences'))
const historyRes = useAdminResource(() => api('monitoring/announcements'))
const audiences = computed(() => audiencesRes.data.value || [])
const history = computed(() => historyRes.data.value || [])
const selected = computed(() => audiences.value.find((a) => a.key === audience.value))
const count = computed(() => selected.value?.count ?? 0)
const updatedAt = computed(() => audiencesRes.updatedAt.value)
const loading = computed(() => audiencesRes.loading.value || historyRes.loading.value)
const loadError = computed(() => audiencesRes.error.value || historyRes.error.value)
function refreshAll() {
  return Promise.all([audiencesRes.refresh(), historyRes.refresh()])
}

// ---- Live preview ------------------------------------------------------------
const preview = ref(null)
const previewError = ref('')
const previewLoading = ref(false)
let previewSeq = 0
async function loadPreview() {
  if (!subject.value.trim() && !body.value.trim()) {
    preview.value = null
    return
  }
  const id = ++previewSeq
  previewLoading.value = true
  try {
    const res = await api('monitoring/announcements/preview', {
      method: 'POST',
      body: { subject: subject.value, body: body.value },
    })
    if (id !== previewSeq) return
    preview.value = res
    previewError.value = ''
  } catch (err) {
    if (id !== previewSeq) return
    previewError.value = err?.message || "L'aperçu n'a pas pu être généré."
  } finally {
    if (id === previewSeq) previewLoading.value = false
  }
}
watchDebounced([subject, body], loadPreview, { debounce: 500 })
onMounted(loadPreview)

// The preview HTML is rendered in a script-less sandboxed iframe, sized to its
// content once loaded.
const frameHeight = ref(260)
function sizeFrame(event) {
  try {
    const body = event.target.contentDocument?.body
    const h = body ? Math.max(body.scrollHeight, body.offsetHeight) : 0
    if (h) frameHeight.value = Math.min(Math.max(h + 24, 120), 900)
  } catch {
    // keep the default height
  }
}

// ---- Test + send --------------------------------------------------------------
const feedback = ref(null) // { tone, text }
const testing = ref(false)
const canWrite = computed(() => subject.value.trim() && body.value.trim())

function failureText(err) {
  if (err?.status === 400 && /test/i.test(`${err?.code || ''} ${err?.message || ''}`)) {
    return "Envoie-toi d'abord un test"
  }
  return err?.message || "L'envoi a échoué, réessaie dans un instant."
}

async function sendTest() {
  testing.value = true
  feedback.value = null
  try {
    const res = await api('monitoring/announcements/test', {
      method: 'POST',
      body: { subject: subject.value, body: body.value },
    })
    feedback.value = { tone: 'ok', text: res?.detail || 'Test envoyé sur ton adresse.' }
  } catch (err) {
    feedback.value = { tone: 'bad', text: failureText(err) }
  } finally {
    testing.value = false
  }
}

const confirmOpen = ref(false)
const confirmCount = ref(0)
const confirmNotice = ref('')
const sending = ref(false)

function openConfirm() {
  feedback.value = null
  confirmNotice.value = ''
  confirmCount.value = count.value
  confirmOpen.value = true
}

async function confirmSend() {
  sending.value = true
  confirmNotice.value = ''
  try {
    const res = await api('monitoring/announcements', {
      method: 'POST',
      body: {
        subject: subject.value,
        body: body.value,
        audience: audience.value,
        expected_count: confirmCount.value,
      },
    })
    confirmOpen.value = false
    const skipped = res?.skipped_unsubscribed
      ? ` (${plural(res.skipped_unsubscribed, 'personne désinscrite ignorée', 'personnes désinscrites ignorées')})`
      : ''
    feedback.value = {
      tone: 'ok',
      text: `Message envoyé à ${plural(res?.sent ?? 0, 'personne', 'personnes')}${skipped}.`,
    }
    toast.success('Message envoyé')
    refreshAll()
  } catch (err) {
    if (err?.status === 409) {
      // The audience changed since the admin looked at it: show the new size
      // and ask again.
      await audiencesRes.refresh()
      confirmCount.value = count.value
      if (count.value === 0) {
        confirmOpen.value = false
        feedback.value = {
          tone: 'bad',
          text: "Plus aucun destinataire pour ce groupe : l'envoi est annulé.",
        }
      } else {
        confirmNotice.value = `La liste a changé : elle compte maintenant ${plural(count.value, 'personne', 'personnes')}. Vérifie, puis confirme à nouveau.`
      }
    } else {
      confirmOpen.value = false
      feedback.value = { tone: 'bad', text: failureText(err) }
    }
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <AdminHeader :updated-at="updatedAt" :loading="loading" @refresh="refreshAll" />

    <AdminNotice v-if="loadError" tone="bad" class="mb-4">
      {{ loadError }}
      <button type="button" class="ml-2 underline" @click="refreshAll">Réessayer</button>
    </AdminNotice>

    <div class="space-y-3">
      <div class="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <AdminCard
          title="Nouveau message"
          subtitle="Un seul envoi, à tous les destinataires choisis"
        >
          <fieldset class="mb-4">
            <legend class="mb-1.5 text-xs font-extrabold text-ink/70">Destinataires</legend>
            <p v-if="!audiences.length" class="text-sm font-medium text-ink/60">Chargement…</p>
            <label
              v-for="a in audiences"
              :key="a.key"
              class="flex cursor-pointer items-center gap-2.5 py-1 text-sm font-semibold text-ink"
            >
              <input
                v-model="audience"
                type="radio"
                name="audience"
                :value="a.key"
                class="h-4 w-4 accent-[#5B3FE8]"
              />
              <span
                >{{ a.label }} <b class="font-black">({{ fmtInt(a.count) }})</b></span
              >
            </label>
          </fieldset>

          <div class="space-y-4">
            <UiInput id="mail-subject" v-model="subject" label="Objet" />
            <UiTextarea
              id="mail-body"
              v-model="body"
              label="Message"
              :rows="10"
              :hint="`${PLACEHOLDER} est remplacé par le prénom de chaque personne.`"
            />
          </div>

          <AdminNotice v-if="feedback" :tone="feedback.tone" class="mt-4">
            {{ feedback.text }}
          </AdminNotice>

          <div class="mt-4 flex flex-wrap gap-2.5">
            <UiButton
              variant="secondary"
              :loading="testing"
              :disabled="!canWrite"
              @click="sendTest"
            >
              M'envoyer un test
            </UiButton>
            <UiButton variant="primary" :disabled="!canWrite || count === 0" @click="openConfirm">
              Envoyer à {{ plural(count, 'personne', 'personnes') }}…
            </UiButton>
          </div>
        </AdminCard>

        <AdminCard title="Aperçu" subtitle="Tel que le recevra l'utilisateur">
          <AdminNotice v-if="previewError" tone="bad" class="mb-3">{{ previewError }}</AdminNotice>
          <AdminEmpty v-if="!preview">Écris un objet et un message pour voir l'aperçu.</AdminEmpty>
          <div
            v-else
            class="overflow-hidden rounded-xl border border-ink/20 bg-white"
            :class="previewLoading ? 'opacity-70' : ''"
          >
            <div class="border-b border-ink/10 bg-lav/30 px-3.5 py-2.5 text-xs text-ink/60">
              De : Bye Bye Boss<br />
              Objet : <b class="font-extrabold text-ink">{{ preview.subject }}</b>
            </div>
            <iframe
              :srcdoc="preview.html"
              sandbox="allow-same-origin"
              title="Aperçu de l'e-mail"
              class="block w-full border-0"
              :style="{ height: `${frameHeight}px` }"
              @load="sizeFrame"
            />
          </div>
          <AdminNotice tone="info" class="mt-3 !text-xs">
            Sécurités prévues : message de test obligatoire avant l'envoi, confirmation « envoyer à
            N personnes », lien de désinscription ajouté automatiquement, personnes désinscrites
            exclues.
          </AdminNotice>
        </AdminCard>
      </div>

      <AdminCard
        title="Historique des envois"
        subtitle="Quels messages sont partis, à qui, et combien ont échoué"
      >
        <AdminEmpty v-if="!history.length">Aucun message envoyé pour le moment.</AdminEmpty>
        <AdminTable v-else min-width="640px">
          <thead>
            <tr>
              <th>Date</th>
              <th>Objet</th>
              <th>Destinataires</th>
              <th>Envoyés</th>
              <th>Échecs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in history" :key="h.id">
              <td class="whitespace-nowrap">{{ fmtDateTime(h.created_at) }}</td>
              <td class="font-semibold">{{ h.subject }}</td>
              <td>{{ h.audience_label }}</td>
              <td>{{ fmtInt(h.sent) }}</td>
              <td>
                <AdminPill :state="h.failed ? 'bad' : 'ok'" :text="fmtInt(h.failed)" />
              </td>
            </tr>
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>

    <UiModal v-model="confirmOpen" title="Confirmer l'envoi">
      <AdminNotice v-if="confirmNotice" tone="warn" class="mb-3">{{ confirmNotice }}</AdminNotice>
      <p class="text-base font-medium text-ink">
        Tu vas envoyer ce message à
        <b class="font-black">{{ plural(confirmCount, 'personne', 'personnes') }}</b>
        <template v-if="selected"> ({{ selected.label.toLowerCase() }})</template>.
      </p>
      <p class="mt-3 text-sm font-semibold text-ink/60">Objet</p>
      <p class="rounded-xl bg-lav/40 px-3 py-2 text-base font-extrabold text-ink">{{ subject }}</p>
      <p class="mt-3 text-sm font-medium text-ink/60">Cet envoi ne peut pas être annulé.</p>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2.5">
          <UiButton variant="secondary" :disabled="sending" @click="confirmOpen = false">
            Annuler
          </UiButton>
          <UiButton variant="primary" :loading="sending" @click="confirmSend">
            Confirmer l'envoi
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
