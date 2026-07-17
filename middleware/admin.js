// Guards admin-only pages. Non-admins get /404, never a 403 — mirrors the
// backend anti-IDOR policy (never reveal that a resource/route exists).
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
  if (!auth.user && import.meta.client) {
    try {
      await auth.fetchMe()
    } catch {
      return navigateTo('/login')
    }
  }
  if (auth.user && !auth.isAdmin) {
    return navigateTo('/404')
  }
})
