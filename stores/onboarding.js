import { defineStore } from 'pinia'

// Holds the candidate profile as it moves through the 3-step CV onboarding
// wizard. The API is the source of truth; this store just caches the last
// response so step 2/3 don't need to re-fetch on every render.
export const useOnboardingStore = defineStore('onboarding', () => {
  const profile = ref(null)

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

  async function updatePreferences(payload) {
    profile.value = await useApi()('cv/profile/preferences', {
      method: 'PUT',
      body: payload,
    })
    return profile.value
  }

  function reset() {
    profile.value = null
  }

  return { profile, uploadCv, fetchProfile, updateProfile, updatePreferences, reset }
})
