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

  // idToken is the credential Google Identity Services hands back in the
  // browser (see AuthSocialButtons.vue) -- the backend verifies it, then
  // either logs into or creates the matching account by email. Returns
  // isNewUser so the caller can send a brand-new signup into onboarding
  // (CV upload) instead of the dashboard.
  async function loginWithGoogle(idToken) {
    const result = await useApi()(
      'auth/google',
      { method: 'POST', body: { id_token: idToken } },
      false
    )
    setTokens(result)
    await fetchMe()
    return { isNewUser: result.is_new_user }
  }

  // Registering signs the user straight in, same as login/loginWithGoogle --
  // email verification is informational only, not a gate (Steve's call), so
  // there's nothing to wait on before the account is fully usable.
  async function register(payload) {
    const tokens = await useApi()('auth/register', { method: 'POST', body: payload }, false)
    setTokens(tokens)
    await fetchMe()
  }

  function verifyEmail(token) {
    return useApi()('auth/verify-email', { method: 'POST', body: { token } }, false)
  }

  function resendVerification(email, locale) {
    return useApi()('auth/resend-verification', { method: 'POST', body: { email, locale } }, false)
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

  function requestPasswordReset(email, locale) {
    return useApi()(
      'auth/reset-password/request',
      { method: 'POST', body: { email, locale } },
      false
    )
  }

  function confirmPasswordReset(token, newPassword) {
    return useApi()(
      'auth/reset-password/confirm',
      { method: 'POST', body: { token, new_password: newPassword } },
      false
    )
  }

  async function updateProfile(payload) {
    user.value = await useApi()('auth/me', { method: 'PATCH', body: payload })
    return user.value
  }

  function changePassword(currentPassword, newPassword) {
    return useApi()('auth/change-password', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    })
  }

  function logout() {
    clear()
  }

  // Permanently deletes the account and all its data (DELETE /auth/me). The
  // caller re-types their own email as the explicit confirmation. On
  // success the local session is cleared too -- the old tokens are dead
  // anyway.
  async function deleteAccount(email) {
    await useApi()('auth/me', { method: 'DELETE', body: { email } })
    clear()
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    refresh,
    fetchMe,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    resendVerification,
    updateProfile,
    changePassword,
    setTokens,
    clear,
    deleteAccount,
  }
})
