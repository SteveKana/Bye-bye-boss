// Cookie consent (CNIL/RGPD): the visitor's choice lives in a first-party
// cookie for 6 months. "Essential" cookies (session, language, this choice)
// never need consent; anything third-party (today: the Google sign-in
// script) must wait for an explicit "accepted".
const CONSENT_MAX_AGE = 60 * 60 * 24 * 183 // ~6 months

export function useCookieConsent() {
  const consent = useCookie('mc_consent', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: CONSENT_MAX_AGE,
  })
  // Lets the footer / cookie policy page reopen the banner after a choice.
  const reopened = useState('cookie-banner-reopened', () => false)

  const decided = computed(() => consent.value === 'accepted' || consent.value === 'refused')
  const thirdPartyAllowed = computed(() => consent.value === 'accepted')
  const bannerVisible = computed(() => !decided.value || reopened.value)

  function accept() {
    consent.value = 'accepted'
    reopened.value = false
  }
  function refuse() {
    consent.value = 'refused'
    reopened.value = false
  }
  function reopen() {
    reopened.value = true
  }

  return { thirdPartyAllowed, bannerVisible, accept, refuse, reopen }
}
