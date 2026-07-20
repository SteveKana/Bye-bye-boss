import { defineStore } from 'pinia'

const ACCESS_MAX_AGE = 60 * 30 // 30 min
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Tokens live in cookies so the route middleware can read the session during
// SSR; the current user is fetched from /auth/me. isAdmin reads user.isadmin.
export const useAuthStore = defineStore('auth', () => {
  const cookieOpts = { sameSite: 'lax', secure: !import.meta.dev, path: '/' }
  const accessToken = useCookie('mc_access', { ...cookieOpts, maxAge: ACCESS_MAX_AGE })
  const refreshToken = useCookie('mc_refresh', { ...cookieOpts, maxAge: REFRESH_MAX_AGE })
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(refreshToken.value))
  const isAdmin = computed(() => user.value?.isadmin === true)

  function setTokens(tokens) {
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
  }

  function clear() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  async function fetchMe() {
    user.value = await useApi()('auth/me')
    return user.value
  }

  async function login(email, password) {
    const tokens = await useApi()(
      'auth/login',
      { method: 'POST', body: { email, password } },
      false
    )
    setTokens(tokens)
    await fetchMe()
  }

  async function register(payload) {
    await useApi()('auth/register', { method: 'POST', body: payload }, false)
    await login(payload.email, payload.password)
  }

  // Called by useApi on a 401. Returns whether a fresh access token was obtained.
  async function refresh() {
    if (!refreshToken.value) return false
    try {
      const tokens = await useApi()(
        'auth/refresh',
        { method: 'POST', body: { refresh_token: refreshToken.value } },
        false
      )
      setTokens(tokens)
      return true
    } catch {
      clear()
      return false
    }
  }

  function requestPasswordReset(email) {
    return useApi()('auth/reset-password/request', { method: 'POST', body: { email } }, false)
  }

  function confirmPasswordReset(token, newPassword) {
    return useApi()(
      'auth/reset-password/confirm',
      { method: 'POST', body: { token, new_password: newPassword } },
      false
    )
  }

  function logout() {
    clear()
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    refresh,
    fetchMe,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    setTokens,
    clear,
  }
})
