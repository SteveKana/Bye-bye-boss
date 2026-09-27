// Guards pages that assume a fully-onboarded candidate (Dashboard,
// Opportunités, Préférences, Profil): sends a visitor who hasn't finished
// the CV onboarding wizard back to whichever step they're actually
// missing, instead of letting them land on a page with nothing to show
// (the bug this closes: a visitor with no CV at all used to just see an
// empty dashboard, or worse, sat through a couple of minutes of a loading
// skeleton for a match that could never come -- see dashboard.vue's
// canEverMatch check, now redundant with this middleware in place but left
// as a defensive fallback).
//
// Order matters: a profile with status "complete" is always let through
// FIRST, regardless of verification_completed_at -- that field is new
// (only backfilled for profiles that were already complete, see the
// migration) and must never bounce an already-finished profile into the
// wizard by mistake.
export default defineNuxtRouteMiddleware(async () => {
  const onboarding = useOnboardingStore()
  let profile = onboarding.profile

  if (!profile) {
    try {
      profile = await onboarding.fetchProfile()
    } catch {
      // No CV imported at all.
      return navigateTo('/onboarding/upload')
    }
  }

  if (profile.status === 'complete') return
  if (!profile.verification_completed_at) return navigateTo('/onboarding/verification')
  return navigateTo('/onboarding/preferences')
})
