import { defineStore } from 'pinia'

// Holds the candidate profile as it moves through the 3-step CV onboarding
// wizard. The API is the source of truth; this store just caches the last
// response so step 2/3 don't need to re-fetch on every render.
export const useOnboardingStore = defineStore('onboarding', () => {
  const profile = ref(null)

  // Drives the "importing your CV" modal shown on the homepage (see
  // components/landing/CvReuploadModal.vue) -- kept here rather than as
  // local state in Hero/Cta/Nav so the 3 buttons share one single modal
  // instance instead of each rendering (and racing) their own.
  const homepageReuploadProcessing = ref(false)
  const homepageReuploadFilename = ref('')

  // Field-level diff between the profile just before and just after a
  // homepage re-import, read by pages/profile/index.vue to highlight what
  // actually changed instead of repeating the whole CV back at the
  // candidate. Plain in-memory state on purpose: it's meant to last only
  // "until the next page refresh" (Steve's own wording), which a fresh page
  // load already clears for free since nothing here is persisted.
  const recentlyUpdatedFields = ref([])

  async function uploadCv(file) {
    const body = new FormData()
    body.append('file', file)
    profile.value = await useApi()('cv/upload', { method: 'POST', body })
    return profile.value
  }

  async function fetchProfile() {
    profile.value = await useApi()('cv/profile')
    return profile.value
  }

  async function updateProfile(payload) {
    profile.value = await useApi()('cv/profile', { method: 'PUT', body: payload })
    return profile.value
  }

  function reset() {
    profile.value = null
  }

  const ARRAY_FIELDS = ['identified_roles', 'domains']
  const sameArray = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || [])

  // Which of the fields shown on the CV page actually changed between two
  // profile snapshots -- used to highlight only what's new instead of the
  // whole page. Grouped fields (name, availability, skills) count as one
  // entry each since that's how they're displayed/edited on that page.
  function diffProfileFields(before, after) {
    if (!before || !after) return []
    const changed = []
    if (
      (before.first_name || '') !== (after.first_name || '') ||
      (before.last_name || '') !== (after.last_name || '')
    ) {
      changed.push('name')
    }
    if ((before.headline || '') !== (after.headline || '')) changed.push('headline')
    if ((before.email || '') !== (after.email || '')) changed.push('email')
    if ((before.location || '') !== (after.location || '')) changed.push('location')
    if (
      (before.availability_status || '') !== (after.availability_status || '') ||
      (before.availability_date || '') !== (after.availability_date || '') ||
      (before.notice_period_months ?? null) !== (after.notice_period_months ?? null)
    ) {
      changed.push('availability')
    }
    if ((before.professional_summary || '') !== (after.professional_summary || '')) {
      changed.push('professional_summary')
    }
    ARRAY_FIELDS.forEach((key) => {
      if (!sameArray(before[key], after[key])) changed.push(key)
    })
    if (
      !sameArray(before.skill_categories, after.skill_categories) ||
      !sameArray(before.skills, after.skills)
    ) {
      changed.push('skills')
    }
    if ((before.total_experience || '') !== (after.total_experience || ''))
      changed.push('total_experience')
    return changed
  }

  // Shared by every re-import path (homepage buttons AND the CV page's own
  // "Importer un nouveau CV" button) -- Steve wants the highlight to show
  // "quelle que soit la page d'où est faite la mise à jour", so the diff
  // can't live only in the homepage-specific flow below.
  async function uploadCvWithDiff(file) {
    let before = profile.value
    if (!before) {
      try {
        before = await fetchProfile()
      } catch {
        before = null
      }
    }
    const updated = await uploadCv(file)
    recentlyUpdatedFields.value = diffProfileFields(before, updated)
    return updated
  }

  // Re-import triggered from the homepage (Hero/Cta/Nav): unlike a reimport
  // from the CV page itself, this one navigates away and back, so the
  // "before" snapshot has to be captured up front, and what changed has to
  // be carried across that navigation via this store rather than local
  // component state. The diff itself is the same for every origin page --
  // see uploadCvWithDiff above.
  async function reuploadFromHomepage(file) {
    homepageReuploadFilename.value = file.name
    homepageReuploadProcessing.value = true
    try {
      return await uploadCvWithDiff(file)
    } finally {
      homepageReuploadProcessing.value = false
    }
  }

  return {
    profile,
    homepageReuploadProcessing,
    homepageReuploadFilename,
    recentlyUpdatedFields,
    uploadCv,
    uploadCvWithDiff,
    fetchProfile,
    updateProfile,
    reuploadFromHomepage,
    reset,
  }
})
