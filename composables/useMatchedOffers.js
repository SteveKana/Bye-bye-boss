// Shared reshaping + client-side reject for the scored match pool returned
// by GET /matching/top -- used by both the "Dashboard" page (a 5-row
// preview, no filters) and the "Opportunités" page (the same pool, shown in
// full with real filters/sort), per the mockups' split: dashboard.html shows
// only the top 5, opportunites.html is the exhaustive list. Reject has no
// backend endpoint yet (see the original dashboard.vue comment this was
// extracted from) -- it's a purely client-side hide that doesn't survive a
// reload, so each page keeps its own rejectedIds rather than sharing state
// that wouldn't persist any better shared than not.
export function useMatchedOffers(rawMatches) {
  const { avatarColor, initials, contractTag, publishedLabel, salaryLabel, dailyRateLabel } =
    useOfferDisplay()
  const toast = useToast()
  const { t } = useI18n()

  const rejectedIds = ref(new Set())

  const matchedOffers = computed(() =>
    rawMatches.value
      .filter((match) => !rejectedIds.value.has(match.id))
      .map((match) => ({
        id: match.id,
        logo: initials(match.company_name || match.offer.company_name),
        bg: avatarColor(match.company_name || match.offer.company_name || match.offer.title),
        title: match.offer.title,
        company: match.company_name || match.offer.company_name || '',
        loc: match.offer.location || '',
        source: match.offer.source,
        strong: match.ats_potential >= STRONG_FIT_THRESHOLD,
        blockingMessage: match.blocking_message || '',
        contractTag: contractTag(match.offer.contract_type),
        isFullRemote: !!match.offer.is_full_remote,
        salaryLabel: salaryLabel(match.offer),
        // Purely for sorting -- salary_max falls back to salary_min so a
        // "50k only" offer still sorts sensibly against a "40k-60k" one.
        salaryValue: match.offer.salary_max || match.offer.salary_min || null,
        // Same pair, for the separate freelance daily-rate (TJM) field --
        // see the backend's core/daily_rate.py. An annual salary_min/max
        // threshold doesn't mean anything for a freelance mission (wrong
        // unit, and usually just absent), so the Opportunités page's
        // filter/sort switch to this field instead while Freelance is
        // selected, rather than misapplying salaryValue to it.
        dailyRateLabel: dailyRateLabel(match.offer),
        dailyRateValue: match.offer.daily_rate_max || match.offer.daily_rate_min || null,
        publishedAgo: publishedLabel(match.offer.published_at),
        publishedAt: match.offer.published_at ? new Date(match.offer.published_at) : null,
        computedAt: match.computed_at ? new Date(match.computed_at) : null,
        url: match.offer.url,
        scores: {
          career: match.career_score,
          ats: match.ats_score,
          potential: match.ats_potential,
        },
        // Full LLM analysis (job_skills/matches/ats_gaps/...) -- GET
        // /matching/top returns the same shape as GET /matching/{id}, not a
        // lighter list shape, so this is free to carry along. Only the
        // Opportunités page's tag list and "pourquoi cette offre" reasons
        // use it today; the dashboard's 5-row preview ignores it.
        analysis: match.analysis || {},
      }))
  )

  // Reject with a short undo window — mirrors the spec (a real reject is permanent).
  function reject(offer) {
    rejectedIds.value.add(offer.id)
    toast.show({
      message: t('dashboard.offer_hidden'),
      variant: 'info',
      duration: 5000,
      undo: () => rejectedIds.value.delete(offer.id),
      undoLabel: t('common.undo'),
    })
  }

  return { matchedOffers, reject }
}
