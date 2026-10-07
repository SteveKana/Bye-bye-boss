// Search criteria shared by the onboarding step 3, the Préférences page and
// the Contrat / Télétravail / Localisation / Salaire filters of the Dashboard
// and Opportunités pages. The values here must match the API (contract
// types, remote modes and the 18 régions of app/modules/cv/schemas.py).

export const CONTRACT_CHOICES = ['CDI', 'CDD', 'Freelance', 'Intérim', 'Stage', 'Alternance']
export const REMOTE_CHOICES = ['Sur site', 'Hybride', 'Full remote']

// The five overseas régions are one single choice in the interface
// ("Outre-mer"); the API receives the five names.
export const OVERSEAS_REGIONS = ['Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte']
export const OVERSEAS_CHOICE = 'Outre-mer'
export const REGION_CHOICES = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
  OVERSEAS_CHOICE,
]

// Choices as shown (with "Outre-mer") -> régions as the API stores them.
export function regionsFromChoices(choices) {
  return (choices || []).flatMap((c) => (c === OVERSEAS_CHOICE ? OVERSEAS_REGIONS : [c]))
}

// Régions stored by the API -> choices as shown.
export function choicesFromRegions(regions) {
  const list = regions || []
  const choices = list.filter((r) => !OVERSEAS_REGIONS.includes(r))
  if (list.some((r) => OVERSEAS_REGIONS.includes(r))) choices.push(OVERSEAS_CHOICE)
  return choices
}

// Each offer is exactly one of: Full remote (flagged by the backend), Hybride
// (its text spells out a split of days or says "hybride") or Sur site
// (everything else, including offers that say nothing about remote work).
export function remoteModeOf(offer) {
  if (offer.isFullRemote) return 'Full remote'
  if (offer.isHybrid) return 'Hybride'
  return 'Sur site'
}

// True when the saved preferences restrict at least one thing -- used to
// know whether there is anything to pre-fill into the filters.
export function profileHasPreferences(profile) {
  return !!profile?.preferences_saved_at
}

// Region test shared by the Dashboard and Opportunités: no régions chosen =
// no restriction; otherwise the offer's région must be one of them, or be
// unknown while the "unknown région" switch is on.
export function regionMatches(offer, choices, includeUnknown) {
  if (!choices.length) return true
  if (!offer.region) return includeUnknown
  return regionsFromChoices(choices).includes(offer.region)
}

// Salary test: the amount an offer states is compared with the minimum, but
// an offer that states nothing is never hidden (most offers state no salary).
// Freelance offers are compared with the daily rate (TJM), the others with
// the annual salary.
export function salaryMatches(offer, salaryMin, tjmMin) {
  const isFreelance = offer.contractTag === 'Freelance'
  const value = isFreelance ? offer.dailyRateValue : offer.salaryValue
  const threshold = isFreelance ? tjmMin : salaryMin
  return !(threshold > 0 && value !== null && value < threshold)
}

// Filters of the Dashboard (the Opportunités page keeps its own richer
// controls but uses the helpers above). Pre-filled from the saved
// preferences, removable one by one without touching those preferences.
export function useDashboardFilters() {
  const { t } = useI18n()
  const onboarding = useOnboardingStore()

  const contracts = ref([])
  const remotes = ref([])
  const regions = ref([])
  const includeUnknownRegion = ref(true)
  const salaryMin = ref(0)
  const tjmMin = ref(0)

  function applyProfile(profile) {
    if (!profileHasPreferences(profile)) return
    contracts.value = [...(profile.contract_types || [])]
    remotes.value = [...(profile.remote_preferences || [])]
    regions.value = choicesFromRegions(profile.mobility_regions)
    includeUnknownRegion.value = profile.include_unknown_region !== false
    salaryMin.value = profile.salary_target || 0
    tjmMin.value = profile.daily_rate || 0
  }

  // The profile is already loaded by the onboarding-complete middleware; the
  // watcher also covers a late arrival.
  let applied = false
  watch(
    () => onboarding.profile,
    (profile) => {
      if (applied || !profile) return
      applied = true
      applyProfile(profile)
    },
    { immediate: true }
  )

  function toggle(listRef, value) {
    listRef.value = listRef.value.includes(value)
      ? listRef.value.filter((v) => v !== value)
      : [...listRef.value, value]
  }

  // For components that receive this object as a prop (they may not assign
  // to its refs directly).
  function setValue(target, value) {
    target.value = value
  }

  function reset() {
    contracts.value = []
    remotes.value = []
    regions.value = []
    salaryMin.value = 0
    tjmMin.value = 0
  }

  function matches(offer) {
    if (contracts.value.length && !contracts.value.includes(offer.contractTag)) return false
    if (remotes.value.length && !remotes.value.includes(remoteModeOf(offer))) return false
    if (!regionMatches(offer, regions.value, includeUnknownRegion.value)) return false
    return salaryMatches(offer, salaryMin.value, tjmMin.value)
  }

  const chips = computed(() => {
    const list = []
    contracts.value.forEach((c) =>
      list.push({ key: `c-${c}`, label: c, clear: () => toggle(contracts, c) })
    )
    remotes.value.forEach((r) =>
      list.push({ key: `r-${r}`, label: r, clear: () => toggle(remotes, r) })
    )
    regions.value.forEach((r) =>
      list.push({
        key: `g-${r}`,
        label: r === OVERSEAS_CHOICE ? t('searchFilters.overseas') : r,
        clear: () => toggle(regions, r),
      })
    )
    if (salaryMin.value > 0) {
      list.push({
        key: 'salary',
        label: t('opportunites.salary_min_label', {
          amount: salaryMin.value.toLocaleString('fr-FR'),
        }),
        clear: () => (salaryMin.value = 0),
      })
    }
    if (tjmMin.value > 0) {
      list.push({
        key: 'tjm',
        label: t('opportunites.tjm_min_label', { amount: tjmMin.value.toLocaleString('fr-FR') }),
        clear: () => (tjmMin.value = 0),
      })
    }
    return list
  })

  return {
    contracts,
    remotes,
    regions,
    includeUnknownRegion,
    salaryMin,
    tjmMin,
    chips,
    toggle,
    setValue,
    reset,
    matches,
  }
}
