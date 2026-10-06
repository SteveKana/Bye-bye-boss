import { defineStore } from 'pinia'

// Notification preferences (email/Discord/WhatsApp) for the current
// candidate -- GET/PUT/POST .../notifications/preferences, backed by
// NotificationPreferenceService and DailyBriefService on the API.
//
// GET creates a default row server-side (email on, everything else off) the
// first time a candidate opens the settings page, so `fetchPreferences()`
// always returns something usable rather than null/404.
export const useNotificationsStore = defineStore('notifications', () => {
  const preferences = ref(null)

  async function fetchPreferences() {
    preferences.value = await useApi()('notifications/preferences')
    return preferences.value
  }

  async function savePreferences(patch) {
    preferences.value = await useApi()('notifications/preferences', {
      method: 'PUT',
      body: patch,
    })
    return preferences.value
  }

  // "Tester l'envoi" -- sends one real brief right now on whatever channels
  // are currently enabled/valid, instead of waiting for the scheduled daily
  // job. Returns { channels_sent: [...] } so the caller can report which
  // ones actually went out.
  function testSend() {
    return useApi()('notifications/preferences/test-send', { method: 'POST' })
  }

  return { preferences, fetchPreferences, savePreferences, testSend }
})
