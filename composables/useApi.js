// HTTP client for the backend API.
// - baseURL from runtimeConfig (/api/v1/ by default)
// - injects the access token from the auth store
// - on 401, silently refreshes once, then retries the original request
// - unwraps the backend error envelope {"error": {code, message, details}}
//
// Usage:
//   const api = useApi()
//   const me = await api('auth/me')
//   await api('auth/login', { method: 'POST', body: { email, password } }, false)
export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function api(url, opts = {}, retry = true) {
    const headers = { ...(opts.headers || {}) }
    if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`

    try {
      return await $fetch(url, { baseURL: config.public.apiBase, ...opts, headers })
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 && retry && (await auth.refresh())) {
        return api(url, opts, false)
      }
      throw toApiError(err)
    }
  }

  return api
}

// Turn an ofetch error into a plain Error carrying the backend's
// {code, message, details} when present.
//
// When there's no envelope -- a network failure with no response at all
// (dropped connection, server mid-restart: ofetch's own message for this is
// a raw, technical, English string like `[POST] "https://...": <no
// response> Load failed`), or an error response from something other than
// our own API (a proxy/gateway page, not JSON) -- that raw message must
// never reach the user. Every call site shows `err.message || t('...')`,
// so an empty message is enough to trigger each one's own localized
// generic fallback, with no per-call-site change needed. The original
// error is kept on `.cause` and logged here so it's still visible in the
// console for debugging, just not shown to the user.
export function toApiError(err) {
  const envelope = err?.data?.error
  const status = err?.response?.status ?? err?.status ?? null
  if (!envelope) {
    console.error('API request failed with no usable error envelope', err)
    const error = new Error()
    error.status = status
    error.cause = err
    return error
  }
  const error = new Error(envelope.message || 'Request failed')
  error.code = envelope.code
  error.details = envelope.details ?? null
  error.status = status
  return error
}
