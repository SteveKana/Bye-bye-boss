<script setup>
// Google is wired for real (see below). LinkedIn used to sit here as a
// fictive "coming soon" button (no backend OAuth for it) -- removed on
// Steve's call rather than left as a dead-end click.
const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()

// Google Identity Services' own rendered button is what reliably opens the
// account picker on click -- calling google.accounts.id.prompt() from a
// fully custom element is documented as unreliable (after a user dismisses
// the One Tap dialog once, Google enters an exponential cooldown, so a
// button wired to prompt() can silently stop responding).
//
// To keep the custom-styled button from the mockup, Google's real button is
// rendered *transparent and positioned exactly on top of* our visible one
// (see the template): with modern Chrome, that real button is a cross-origin
// <iframe> (accounts.google.com/gsi/button), not a plain clickable div in our
// own DOM. That means a synthetic `.click()` fired from our JS can never
// reach it -- cross-origin content is opaque to scripts on the parent page,
// even for dispatching events, not just for reading. Only a genuine mouse
// click physically landing on that iframe works, hence the transparent
// overlay: same visuals, the real click goes straight to Google's own iframe.
const googleReady = ref(false)
const googleContainer = ref(null)
let googleScriptPromise = null
let googleResizeObserver = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

async function onGoogleCredential(response) {
  try {
    const { isNewUser } = await auth.loginWithGoogle(response.credential)
    // A brand-new account has no CV/profile yet -- send it into onboarding,
    // same destination a fresh email/password signup gets. An existing
    // account signing in goes to its intended page as before.
    if (isNewUser) {
      await navigateTo('/onboarding/upload')
      return
    }
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/dashboard')
  } catch (err) {
    toast.error(err?.message || t('social.google_error'))
  }
}

// Google caps renderButton's own width option at 400px; anything above that
// is simply ignored/clamped by their widget.
function renderGoogleButton() {
  if (!googleContainer.value) return
  // Re-renders (from the resize observer) need a clean slate: renderButton
  // appends rather than replacing.
  googleContainer.value.innerHTML = ''
  const width = Math.round(googleContainer.value.getBoundingClientRect().width) || 320
  window.google.accounts.id.renderButton(googleContainer.value, {
    type: 'standard',
    size: 'large',
    width: Math.min(width, 400),
  })
}

onMounted(async () => {
  // No client id configured (e.g. a fresh environment before Steve sets
  // NUXT_PUBLIC_GOOGLE_CLIENT_ID) -- fall back to the old "coming soon"
  // behavior rather than rendering a button that can never work.
  if (!config.public.googleClientId) return
  try {
    await loadGoogleScript()
    window.google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: onGoogleCredential,
    })
    // Flip to ready (making the overlay visible, see template) *before*
    // rendering into it: Google's widget needs a container with real,
    // laid-out dimensions to size its iframe against, not a display:none one.
    googleReady.value = true
    await nextTick()
    renderGoogleButton()
    // The overlay must track the visible button's width (full-width on
    // mobile, a fixed form width on desktop) or the invisible click target
    // stops lining up with what the user sees.
    googleResizeObserver = new ResizeObserver(() => renderGoogleButton())
    googleResizeObserver.observe(googleContainer.value)
  } catch {
    // Script blocked or failed to load (network issue, ad blocker...) --
    // same graceful "coming soon" fallback as an unconfigured client id.
    googleReady.value = false
  }
})

onBeforeUnmount(() => googleResizeObserver?.disconnect())

function soon(provider) {
  toast.info(t('social.soon', { provider }))
}
</script>

<template>
  <div>
    <div class="my-4 flex items-center gap-3 text-sm text-ink/50">
      <span class="h-px flex-1 bg-lav" />
      {{ $t('common.or') }}
      <span class="h-px flex-1 bg-lav" />
    </div>

    <!-- Wraps the visible button and Google's real one so the latter can be
    positioned exactly over the former (relative/absolute pair). -->
    <div class="relative">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-ink bg-white py-3 text-sm font-extrabold text-ink transition hover:bg-lav"
        :class="{ 'pointer-events-none': googleReady }"
        @click="!googleReady && soon('Google')"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.017 17.64 11.71 17.64 9.2z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
          />
        </svg>
        {{ $t('social.google') }}
      </button>

      <!-- Google's real button, made invisible and stacked exactly on top of
      the styled one above: with FedCM-capable browsers this renders as a
      cross-origin iframe, so a real click has to land on it directly (see
      the script setup comment). Hidden while not ready so the fallback
      button above stays the actual click target until then. -->
      <div
        v-show="googleReady"
        ref="googleContainer"
        class="absolute inset-0 overflow-hidden opacity-0"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
