// Fire-and-forget calls to the monitoring tracking endpoints.
//
// Rules: never block the UI, never throw, never log to the console (a failing
// tracking call must not feed the browser-error reporter), and stop talking to
// the API for a few minutes after a network failure ("API not reachable").

const REACHABILITY_BACKOFF_MS = 5 * 60 * 1000
let blockedUntil = 0

// Tracking URLs, so the error reporter can recognise (and ignore) their failures.
export const TRACKING_URL_MARK = 'monitoring/track/'

// Strip query/hash and replace identifiers (UUIDs, long hex ids, numeric ids)
// with ":id" so that /opportunity/<uuid> counts as one page.
export function normalizePath(input) {
  const raw =
    String(input || '/')
      .split('#')[0]
      .split('?')[0] || '/'
  const path = raw
    .split('/')
    .map((seg) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) ||
      /^[0-9a-f]{24,}$/i.test(seg) ||
      /^\d{4,}$/.test(seg)
        ? ':id'
        : seg
    )
    .join('/')
  return path.length > 1 ? path.replace(/\/+$/, '') || '/' : path
}

export function useTracking() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function post(endpoint, body, { retry = true } = {}) {
    if (Date.now() < blockedUntil) return
    const headers = {}
    if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`
    try {
      await $fetch(`${TRACKING_URL_MARK}${endpoint}`, {
        baseURL: config.public.apiBase,
        method: 'POST',
        body,
        headers,
        keepalive: true,
        retry: 0,
      })
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 && retry && auth.isAuthenticated && (await auth.refresh())) {
        return post(endpoint, body, { retry: false })
      }
      // No HTTP response at all: the API is down or unreachable from here.
      if (!status) blockedUntil = Date.now() + REACHABILITY_BACKOFF_MS
    }
  }

  return {
    trackPage: (path) => post('page', { path }),
    trackClientError: (payload) => post('client-error', payload),
  }
}
