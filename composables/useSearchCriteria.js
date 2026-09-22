// Shared "your search" criteria loading -- reused by the Dashboard and
// Opportunités pages, both of which show matches for the same saved
// preferences. Read-only here; editing always happens on the dedicated
// /preferences page (see components/app/CriteriaBar.vue's edit link).
export function useSearchCriteria() {
  const onboarding = useOnboardingStore()
  const criteria = ref([])

  async function load() {
    try {
      const profile = onboarding.profile || (await onboarding.fetchProfile())
      const salary = profile.salary_target
        ? `${profile.salary_target.toLocaleString('fr-FR')} € brut / an`
        : null
      // "Région uniquement" alone is the same raw internal value the user
      // never actually chose to see -- show the région they picked instead
      // (see PreferencesForm.vue's mobility_region field).
      const mobility =
        profile.mobility === 'Région uniquement'
          ? profile.mobility_region || profile.mobility
          : profile.mobility
      criteria.value = [
        ...(profile.contract_types || []),
        ...(profile.remote_preferences || []),
        mobility,
        salary,
      ].filter(Boolean)
    } catch {
      // No profile yet (onboarding not completed) -- leave the criteria bar
      // empty rather than showing anything misleading.
    }
  }

  return { criteria, load }
}
