<script setup>
// Google is wired for real (see below); LinkedIn stays fictive for now --
// the backend has no LinkedIn OAuth, so that one still just notifies it's
// coming. Both buttons stay visually faithful to the mockups.
const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()

// Google Identity Services' own rendered button is what reliably opens the
// account picker on click -- calling google.accounts.id.prompt() from a
// fully custom element is documented as unreliable (after a user dismisses
// the One Tap dialog once, Google enters an exponential cooldown, so a
// button wired to prompt() can silently stop responding). To keep the
// custom-styled button from the mockup working, Google's real button is
// rendered into an invisible container, and our visible button just
// forwards its click to it -- same visuals, Google's own click handling
// underneath.
const googleReady = ref(false)
const googleContainer = ref(null)
let googleScriptPromise = null

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
    await auth.loginWithGoogle(response.credential)
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/dashboard')
  } catch (err) {
    toast.error(err?.message || t('social.google_error'))
  }
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
    if (googleContainer.value) {
      window.google.accounts.id.renderButton(googleContainer.value, {
        type: 'standard',
        size: 'large',
        width: 320,
      })
    }
    googleReady.value = true
  } catch {
    // Script blocked or failed to load (network issue, ad blocker...) --
    // same graceful "coming soon" fallback as an unconfigured client id.
    googleReady.value = false
  }
})

function triggerGoogle() {
  if (!googleReady.value) {
    soon('Google')
    return
  }
  googleContainer.value?.querySelector('div[role="button"]')?.click()
}

function soon(provider) {
  toast.info(t('social.soon', { provider }))
}
</script>

<template>
  <div>
    <div class="my-4 flex items-center gap-3 text-sm text-gray-400">
      <span class="h-px flex-1 bg-gray-200" />
      {{ $t('common.or') }}
      <span class="h-px flex-1 bg-gray-200" />
    </div>

    <!-- Google's real button, rendered off-screen: it's the click target
    that actually knows how to open the account picker reliably (see the
    script setup comment above). -->
    <div
      ref="googleContainer"
      class="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
      aria-hidden="true"
    />

    <button
      type="button"
      class="mb-2.5 flex w-full items-center justify-center gap-2.5 rounded-md border-[1.5px] border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
      @click="triggerGoogle"
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

    <button
      type="button"
      class="flex w-full items-center justify-center gap-2.5 rounded-md border-[1.5px] border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
      @click="soon('LinkedIn')"
    >
      <span
        class="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2] text-[11px] font-black text-white"
        aria-hidden="true"
      >
        in
      </span>
      {{ $t('social.linkedin') }}
    </button>
  </div>
</template>
