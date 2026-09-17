// Guards authenticated pages. Redirects to /login when there is no session,
// keeping the target as ?redirect for post-login return.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
