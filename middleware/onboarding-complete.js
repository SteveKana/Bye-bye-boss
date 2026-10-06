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
// A profile with status "complete" is always let through.
export default defineNuxtRouteMiddleware(async () => {
  const onboarding = useOnboardingStore()
  let profile = onboarding.profile

  if (!profile) {
    try {
      profile = await onboarding.fetchProfile()
    } catch (err) {
      // No CV imported at all.
      if (isNoProfileError(err)) return navigateTo('/onboarding/upload')
      // Server unreachable / erroring (e.g. mid-restart): that says nothing
      // about whether a CV exists, so don't bounce the visitor to the
      // importer. Let the page load; the profile is simply fetched again on
      // the next navigation.
      return
    }
  }

  if (profile.status === 'complete') return
  // Not finished yet: the verification step is now the last one (it
  // completes the profile), so that is always where an unfinished profile
  // goes -- including one re-imported before ever being verified.
  return navigateTo('/onboarding/verification')
})
