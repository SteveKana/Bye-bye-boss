// Browser-side monitoring (client only):
//  1. page views of logged-in users, after every route change;
//  2. uncaught browser errors (Vue, window.onerror, unhandled promise rejections).
//
// Everything here is fire-and-forget: a tracking problem must never slow down
// navigation, break the page, or report itself in a loop.

const SKIPPED_PREFIXES = ['/admin', '/annonces/desinscription']
const ERROR_DEDUPE_MS = 30_000
const MAX_ERRORS_PER_MINUTE = 10
const IGNORED_MESSAGES = [
  /ResizeObserver loop/i, // harmless browser notice
  /^Script error\.?$/i, // cross-origin noise without any detail
  /monitoring\/track\//i, // our own tracking calls
]

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const auth = useAuthStore()
  const { trackPage, trackClientError } = useTracking()

  // ---- 1. Page views -----------------------------------------------------------
  let lastKey = null
  function onPage(fullPath) {
    if (!auth.isAuthenticated) return
    const key = fullPath.split('#')[0].split('?')[0]
    // Query-only changes and the initial double notification are not new views.
    if (key === lastKey) return
    lastKey = key
    const path = normalizePath(key)
    if (SKIPPED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return
    trackPage(path)
  }

  nuxtApp.hook('app:mounted', () => onPage(router.currentRoute.value.fullPath))
  router.afterEach((to, _from, failure) => {
    if (failure) return
    onPage(to.fullPath)
  })

  // ---- 2. Browser errors -------------------------------------------------------
  const recent = new Map() // message -> timestamp
  const sentAt = []

  function report(error, fallbackMessage = 'Unknown error') {
    try {
      const message = String(error?.message || error || fallbackMessage).slice(0, 500)
      if (!message || IGNORED_MESSAGES.some((re) => re.test(message))) return

      const now = Date.now()
      if (recent.has(message) && now - recent.get(message) < ERROR_DEDUPE_MS) return
      recent.set(message, now)
      if (recent.size > 50) recent.delete(recent.keys().next().value)

      while (sentAt.length && now - sentAt[0] > 60_000) sentAt.shift()
      if (sentAt.length >= MAX_ERRORS_PER_MINUTE) return
      sentAt.push(now)

      trackClientError({
        message,
        path: normalizePath(router.currentRoute.value.path),
        user_agent: navigator.userAgent,
        stack: error?.stack ? String(error.stack).slice(0, 2000) : null,
      })
    } catch {
      // reporting must never throw
    }
  }

  // Vue render/lifecycle errors: chain to Nuxt's own handler so its behaviour
  // (error page, vue:error hook) is unchanged.
  const previousHandler = nuxtApp.vueApp.config.errorHandler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    report(err)
    if (previousHandler) previousHandler(err, instance, info)
    else console.error(err)
  }

  window.addEventListener('error', (event) => {
    const file = event.filename || ''
    if (/^(chrome|moz|safari|safari-web)-extension:/.test(file)) return
    report(event.error || event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    report(event.reason, 'Unhandled promise rejection')
  })
})
