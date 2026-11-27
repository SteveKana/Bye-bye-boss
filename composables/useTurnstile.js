// Cloudflare Turnstile (anti-bot challenge), only when the API asks for it
// (GET public/cv-adapter/status -> captcha_required) and a site key is set
// (NUXT_PUBLIC_TURNSTILE_SITE_KEY). Without both, nothing is loaded.
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise = null
function loadScript() {
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const tag = document.createElement('script')
      tag.src = SCRIPT_URL
      tag.async = true
      tag.onload = resolve
      tag.onerror = () => {
        scriptPromise = null
        reject(new Error('turnstile_script'))
      }
      document.head.appendChild(tag)
    })
  }
  return scriptPromise
}

export function useTurnstile() {
  const siteKey = useRuntimeConfig().public.turnstileSiteKey
  const token = ref('')
  let widgetId = null

  async function render(element) {
    if (!siteKey || !element) return
    await loadScript()
    widgetId = window.turnstile.render(element, {
      sitekey: siteKey,
      callback: (value) => {
        token.value = value
      },
      'expired-callback': () => {
        token.value = ''
      },
      'error-callback': () => {
        token.value = ''
      },
    })
  }

  // A token is single-use: ask for a new one after each attempt.
  function reset() {
    token.value = ''
    if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId)
  }

  return { siteKey, token, render, reset }
}
