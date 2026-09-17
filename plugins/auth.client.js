// On client startup, hydrate the current user when a session cookie is present
// (a page reload keeps the tokens but loses the in-memory user).
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.clear()
    }
  }
})
