<script setup>
// Admin > CV adapté: paste an offer as plain text, get YOUR own CV rewritten
// for it (same engine as "Adapter mon CV"), preview it, download it as PDF.
// Nothing is stored: leaving the page loses the result.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · CV adapté — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const api = useApi()
const toast = useToast()

const MIN_CHARS = 100
const offerText = ref('')
const result = ref(null)
const generating = ref(false)
const downloading = ref(false)
const error = ref('')
const template = ref('sobre')
const TEMPLATES = [
  { key: 'sobre', label: 'Sobre' },
  { key: 'visuelle', label: 'Visuelle' },
]

const canGenerate = computed(() => offerText.value.trim().length >= MIN_CHARS)
const missing = computed(() => Math.max(0, MIN_CHARS - offerText.value.trim().length))

async function generate() {
  generating.value = true
  error.value = ''
  result.value = null
  try {
    result.value = await api('matching/admin/cv-from-offer-text', {
      method: 'POST',
      body: { offer_text: offerText.value },
    })
  } catch (err) {
    error.value = err?.message || 'La génération a échoué, réessaie dans un instant.'
  } finally {
    generating.value = false
  }
}

// The PDF is rendered from the result already on screen: no new model call.
async function download() {
  downloading.value = true
  try {
    const blob = await api('matching/admin/cv-from-offer-text/pdf', {
      method: 'POST',
      query: { template: template.value },
      body: result.value,
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'CV_adapte.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    toast.error(err?.message || 'Le téléchargement du PDF a échoué.')
  } finally {
    downloading.value = false
  }
}

function bulletClass(status) {
  if (status === 'added') return 'bg-success-light text-success-text'
  if (status === 'modified') return 'bg-warning-light text-warning'
  return 'text-ink/80'
}
</script>

<template>
  <div>
    <AdminHeader />

    <div class="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
      <AdminCard title="Offre" subtitle="Colle ici le texte complet de l'annonce">
        <UiTextarea
          id="offer-text"
          v-model="offerText"
          label="Texte de l'offre"
          :rows="16"
          :hint="
            canGenerate
              ? 'Prêt. Compte environ 10 à 30 secondes.'
              : `Encore ${missing} caractères au minimum.`
          "
        />
        <p class="mt-2 text-xs font-medium text-ink/60">
          Le CV adapté est le tien (le compte admin connecté). Rien n'est enregistré.
        </p>
        <AdminNotice v-if="error" tone="bad" class="mt-3">{{ error }}</AdminNotice>
        <div class="mt-4">
          <UiButton
            variant="primary"
            :loading="generating"
            :disabled="!canGenerate"
            @click="generate"
          >
            Adapter mon CV
          </UiButton>
        </div>
      </AdminCard>

      <AdminCard title="CV adapté" subtitle="Vert : ajouté · Orange : reformulé">
        <AdminEmpty v-if="!result && !generating">
          Colle une offre puis clique sur « Adapter mon CV ».
        </AdminEmpty>
        <p v-else-if="generating" class="py-10 text-center text-sm font-semibold text-ink/70">
          Génération en cours…
        </p>

        <div v-else class="space-y-5">
          <div>
            <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink/50">Titre</p>
            <p class="text-sm font-black text-ink">{{ result.headline }}</p>
          </div>

          <div>
            <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink/50">Résumé</p>
            <p class="text-[13px] leading-relaxed text-ink/80">{{ result.summary }}</p>
            <p v-if="result.summary_why" class="mt-1 text-xs italic text-ink/55">
              Pourquoi : {{ result.summary_why }}
            </p>
          </div>

          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Expériences
            </p>
            <div class="divide-y divide-ink/10">
              <div v-for="(exp, i) in result.experiences" :key="i" class="py-3 first:pt-0">
                <h4 class="text-[13px] font-bold text-ink">{{ exp.title }}</h4>
                <p class="text-[11.5px] text-ink/60">{{ exp.company }} · {{ exp.period }}</p>
                <ul class="mt-2 space-y-1.5">
                  <li
                    v-for="(bullet, j) in exp.bullets"
                    :key="j"
                    class="rounded px-1.5 py-0.5 text-[12.5px] leading-relaxed"
                    :class="bulletClass(bullet.status)"
                  >
                    • {{ bullet.text }}
                    <span v-if="bullet.why" class="block text-[11px] italic opacity-70">
                      {{ bullet.why }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink/50">
              Compétences
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="s in result.skills"
                :key="s.skill"
                class="rounded-2xl px-2.5 py-1 text-xs font-semibold"
                :class="s.added ? 'bg-success-light text-success-text' : 'bg-lav text-ink/80'"
              >
                {{ s.skill }}
              </span>
            </div>
          </div>

          <AdminNotice v-if="result.advice" tone="info">💡 {{ result.advice }}</AdminNotice>

          <div class="flex flex-wrap items-center gap-2.5 border-t border-ink/10 pt-4">
            <div class="flex rounded-full border-2 border-ink bg-white p-0.5 text-xs font-semibold">
              <button
                v-for="t in TEMPLATES"
                :key="t.key"
                type="button"
                class="rounded-full px-3 py-1 transition-colors"
                :class="template === t.key ? 'bg-brand text-white' : 'text-ink/60 hover:text-ink'"
                @click="template = t.key"
              >
                {{ t.label }}
              </button>
            </div>
            <UiButton variant="primary" :loading="downloading" @click="download">
              Télécharger le PDF
            </UiButton>
          </div>
        </div>
      </AdminCard>
    </div>
  </div>
</template>
