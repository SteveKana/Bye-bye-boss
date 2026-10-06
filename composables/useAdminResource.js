// Loads one admin resource, keeps the previous data on screen while it is
// being refreshed, and re-fetches every `interval` ms while the tab is visible.
//
//   const { data, error, loading, updatedAt, refresh } =
//     useAdminResource(() => api('monitoring/overview', { query: { days: days.value } }),
//                      { watch: [days] })
export function useAdminResource(fetcher, { watch: sources = [], interval = 60_000 } = {}) {
  const data = ref(null)
  const error = ref('')
  const loading = ref(false)
  const updatedAt = ref(null)
  let seq = 0

  async function refresh() {
    const id = ++seq
    loading.value = true
    try {
      const res = await fetcher()
      if (id !== seq) return
      data.value = res
      error.value = ''
      updatedAt.value = Date.now()
    } catch (err) {
      if (id !== seq) return
      error.value = err?.message || 'Impossible de charger les données pour le moment.'
    } finally {
      if (id === seq) loading.value = false
    }
  }

  onMounted(refresh)
  if (sources.length) watch(sources, refresh)
  useIntervalFn(() => {
    if (!document.hidden) refresh()
  }, interval)

  return { data, error, loading, updatedAt, refresh }
}

// Period selector state, shared by the tabs so the choice follows the admin.
export function useAdminDays() {
  return useState('admin-days', () => 7)
}
