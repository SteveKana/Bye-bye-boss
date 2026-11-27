import { defineStore } from 'pinia'

// Free CV adaptation for visitors without an account (see
// matching/routes/v1/public_cv_routes.py in the API). Nothing is stored on the
// server: the CV file lives only in this tab's memory, and the adapted CV (so
// a reload does not lose the edits) in this tab's sessionStorage.
const STORAGE_KEY = 'bbb_free_cv'

export const useFreeCvStore = defineStore('freeCv', () => {
  // The CV file the visitor chose. Memory only: after signing up it is sent to
  // the account (POST cv/upload) so the profile is filled without re-importing.
  const file = shallowRef(null)
  const offerText = ref('')
  // Title of the offer, when it came from a link (shown on the result page).
  const offerTitle = ref('')
  // The adapted CV, as the API returns it and the visitor edits it.
  const result = ref(null)
  // What the current advice was written for (see `contentKey`).
  const adviceBasis = ref('')
  // Passages the visitor already read and edited (headline, summary): they
  // lose their "reworded by the AI" highlight.
  const reviewed = ref({})
  // True once the PDF was downloaded (the signup page says so).
  const downloaded = ref(false)
  const status = ref(null)
  const generating = ref(false)

  const dailyLimit = computed(() => status.value?.daily_limit ?? 3)

  async function loadStatus() {
    try {
      status.value = await useApi()('public/cv-adapter/status')
    } catch {
      status.value = null
    }
    return status.value
  }

  // Reads the page behind a link. Throws when the site refuses or the page has
  // no usable offer: the caller then asks the visitor to paste the text.
  async function readOffer(url) {
    const page = await useApi()('public/cv-adapter/offer-from-url', {
      method: 'POST',
      body: { url },
    })
    offerTitle.value = page.title || ''
    return page.text
  }

  async function generate({ cvFile, text, captchaToken }) {
    generating.value = true
    try {
      const body = new FormData()
      body.append('file', cvFile)
      body.append('offer_text', text)
      if (captchaToken) body.append('captcha_token', captchaToken)
      const cv = await useApi()('public/cv-adapter/generate', { method: 'POST', body })
      file.value = cvFile
      offerText.value = text
      result.value = cv
      reviewed.value = {}
      downloaded.value = false
      adviceBasis.value = contentKey(cv)
      persist()
      return cv
    } finally {
      generating.value = false
    }
  }

  // What the advice depends on: the CV content, ignoring blank rows.
  function contentKey(cv = result.value) {
    if (!cv) return ''
    const clean = cleaned(cv)
    return JSON.stringify([
      clean.headline,
      clean.summary,
      clean.experiences.map((e) => e.bullets.map((b) => b.text)),
      clean.skills.map((s) => s.skill),
      clean.certifications,
      clean.languages,
    ])
  }
  const adviceOutdated = computed(() => !!result.value && contentKey() !== adviceBasis.value)

  // The CV without the blank rows left in the editor (an empty line, skill,
  // formation, certification or language): what is sent for the PDF and advice.
  function cleaned(cv = result.value) {
    const copy = JSON.parse(JSON.stringify(cv))
    copy.experiences.forEach((exp) => {
      exp.bullets = exp.bullets.filter((b) => b.text.trim())
    })
    copy.skills = copy.skills.filter((s) => s.skill.trim())
    copy.formations = copy.formations.filter((f) => f.title.trim())
    copy.languages = copy.languages.filter((l) => l.name.trim())
    copy.certifications = copy.certifications.filter((c) => c.title.trim())
    return copy
  }

  async function refreshAdvice() {
    const basis = contentKey()
    const out = await useApi()('public/cv-adapter/advice', {
      method: 'POST',
      body: { offer_text: offerText.value, cv: cleaned() },
    })
    result.value.advice = out.advice
    adviceBasis.value = basis
    persist()
  }

  // The PDF is rendered from the CV on screen: no new model call.
  async function downloadPdf(template = 'sobre') {
    const blob = await useApi()('public/cv-adapter/pdf', {
      method: 'POST',
      query: { template },
      body: cleaned(),
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.value.filename || 'CV.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    downloaded.value = true
    persist()
  }

  function persist() {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          offerText: offerText.value,
          offerTitle: offerTitle.value,
          result: result.value,
          adviceBasis: adviceBasis.value,
          reviewed: reviewed.value,
          downloaded: downloaded.value,
        })
      )
    } catch {
      // Private window or storage blocked: the page just does not survive a reload.
    }
  }

  // Called by the result/signup pages: after a reload the adapted CV is back
  // (the CV file itself is not: signing up then falls back to the normal import).
  function restore() {
    if (!import.meta.client || result.value) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
      if (!saved?.result) return
      offerText.value = saved.offerText || ''
      offerTitle.value = saved.offerTitle || ''
      result.value = saved.result
      adviceBasis.value = saved.adviceBasis || contentKey(saved.result)
      reviewed.value = saved.reviewed || {}
      downloaded.value = !!saved.downloaded
    } catch {
      // Unreadable: start from the form.
    }
  }

  // "Adapter pour une autre offre": the CV file stays chosen, the offer and the
  // adapted CV are dropped.
  function newOffer() {
    offerText.value = ''
    offerTitle.value = ''
    result.value = null
    adviceBasis.value = ''
    reviewed.value = {}
    downloaded.value = false
    if (import.meta.client) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // Nothing to clean.
      }
    }
  }

  // Forgets everything (the account was created).
  function clear() {
    file.value = null
    offerText.value = ''
    offerTitle.value = ''
    result.value = null
    adviceBasis.value = ''
    reviewed.value = {}
    downloaded.value = false
    if (import.meta.client) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // Nothing to clean.
      }
    }
  }

  return {
    file,
    offerText,
    offerTitle,
    result,
    reviewed,
    downloaded,
    status,
    generating,
    dailyLimit,
    adviceOutdated,
    loadStatus,
    readOffer,
    generate,
    contentKey,
    cleaned,
    refreshAdvice,
    downloadPdf,
    persist,
    restore,
    newOffer,
    clear,
  }
})
