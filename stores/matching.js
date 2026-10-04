import { defineStore } from 'pinia'

// Pre-computed CV/offer matches for the current candidate (GET /matching/top).
// Nothing is computed on the frontend's behalf here -- the backend's
// `matching` module scores everything in the background on its own schedule;
// this store just caches the last response. A profile that isn't "complete"
// yet, or hasn't been matched yet, simply gets an empty list (or a 404 from
// the backend if there's no profile at all) -- both are treated as "nothing
// yet" by the dashboard, not as errors.
export const useMatchingStore = defineStore('matching', () => {
  // /opportunites: the 25 most recent offers (history).
  const topOpportunities = ref([])
  // /dashboard: today's new top 5 only (see the backend's /matching/dashboard).
  const dashboardOpportunities = ref([])

  async function fetchTop() {
    topOpportunities.value = await useApi()('matching/top')
    return topOpportunities.value
  }

  async function fetchDashboard() {
    dashboardOpportunities.value = await useApi()('matching/dashboard')
    return dashboardOpportunities.value
  }

  return { topOpportunities, dashboardOpportunities, fetchTop, fetchDashboard }
})
