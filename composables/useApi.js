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
export function toApiError(err) {
  const envelope = err?.data?.error
  if (!envelope) return err
  const error = new Error(envelope.message || 'Request failed')
  error.code = envelope.code
  error.details = envelope.details ?? null
  error.status = err?.response?.status ?? err?.status ?? null
  return error
}
