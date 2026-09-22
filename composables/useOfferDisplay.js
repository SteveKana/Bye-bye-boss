// An ats_potential at or above this is shown as "very strong fit" rather
// than just "strong fit" -- an editorial threshold, easy to tune later.
// Based on ats_potential rather than career_score: a high career_score alone
// doesn't mean much if the CV, as it stands, has little chance of getting
// past the recruiter's ATS software for this offer. Shared between the
// dashboard list and the opportunity detail page so the same match is never
// labelled "strong" on one view and merely "good" on the other.
export const STRONG_FIT_THRESHOLD = 75

// Shared display helpers for rendering an offer/company consistently
// wherever it appears -- currently the dashboard's opportunity list and the
// "Opportunité" detail page (pages/opportunity/[id].vue). Extracted from
// dashboard.vue so the same company always gets the same avatar color/
// initials and the same contract-type tag/published-date wording on both
// views, instead of two copies of this logic silently drifting apart.
export function useOfferDisplay() {
  const { t } = useI18n()

  // Small fixed palette for the company-initials avatar -- picked
  // deterministically from the company name so the same company always gets
  // the same color (not randomized on every render).
  const avatarPalette = ['#5B3FE8', '#0F0B2E', '#10B981', '#F59E0B', '#2D9CDB', '#DC2626']
  function avatarColor(name) {
    let hash = 0
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
    return avatarPalette[hash % avatarPalette.length]
  }

  function initials(name) {
    const words = (name || '').trim().split(/\s+/).filter(Boolean)
    if (!words.length) return '?'
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase()
  }

  // The offer's contract_type is free text and source-dependent -- France
  // Travail gives French labels ("CDI", "CDD", "Mission intérimaire"...),
  // Adzuna gives English ones joined from two separate fields ("permanent,
  // full_time" / "contract, part_time") -- see the backend offers module's
  // provider normalizers. This maps both onto a short, consistent French tag;
  // an unrecognized label is shown as-is rather than hidden, and no label at
  // all shows no tag.
  function contractTag(rawLabel) {
    if (!rawLabel) return ''
    const text = rawLabel.toLowerCase()
    if (text.includes('cdi') || text.includes('permanent')) return 'CDI'
    if (text.includes('cdd')) return 'CDD'
    if (text.includes('intérim') || text.includes('interim')) return 'Intérim'
    if (
      text.includes('alternance') ||
      text.includes('apprentissage') ||
      text.includes('professionnalisation')
    ) {
      return 'Alternance'
    }
    if (text.includes('stage') || text.includes('internship')) return 'Stage'
    if (
      text.includes('freelance') ||
      text.includes('indépendant') ||
      text.includes('portage') ||
      // France Travail's "Profession libérale" is a self-employed/liberal-
      // profession status -- closest existing tag is Freelance.
      text.includes('libérale')
    ) {
      return 'Freelance'
    }
    // Adzuna's "contract" (vs. "permanent") has no exact French equivalent --
    // freelance/portage is the closest fit for the kind of missions this
    // platform's search keywords target.
    if (text.includes('contract')) return 'Freelance'
    return rawLabel
  }

  // Relative for the first week (same idiom as pages/profile/index.vue's
  // `updatedAgo`), then an absolute date beyond that -- "publiée il y a 111
  // jours" reads as stale/dead even for an offer France Travail itself just
  // refreshed (see the offers module's dateActualisation fix), so relative
  // phrasing is capped at a week.
  function publishedLabel(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const days = Math.floor((Date.now() - date) / 86400000)
    if (days <= 0) return t('dashboard.published_today')
    if (days === 1) return t('dashboard.published_yesterday')
    if (days <= 7) return t('dashboard.published_days', { days })
    return t('dashboard.published_on', { date: date.toLocaleDateString('fr-FR') })
  }

  // Takes a plain offer object (not a ref) so it works both wrapped in a
  // computed (single-offer pages) and called per-row in a v-for (list
  // pages) -- was previously duplicated as a local computed on the
  // "Opportunité" detail page; now shared with the "Opportunités" list.
  function salaryLabel(offer) {
    if (!offer) return ''
    if (offer.salary_label) return offer.salary_label
    const { salary_min: min, salary_max: max } = offer
    if (min && max) return `${min.toLocaleString('fr-FR')} € – ${max.toLocaleString('fr-FR')} €`
    if (min || max) return `${(min || max).toLocaleString('fr-FR')} €`
    return ''
  }

  // Same shape as salaryLabel above, for the separate daily_rate_min/max
  // pair (see the backend's core/daily_rate.py) -- best-effort text
  // extraction, present only for the freelance offers that stated a TJM in
  // a recognized pattern, never guessed when absent.
  function dailyRateLabel(offer) {
    if (!offer) return ''
    const { daily_rate_min: min, daily_rate_max: max } = offer
    if (min && max && min !== max) {
      return `${min.toLocaleString('fr-FR')} – ${max.toLocaleString('fr-FR')} €/jour`
    }
    if (min || max) return `${(min || max).toLocaleString('fr-FR')} €/jour`
    return ''
  }

  return {
    avatarColor,
    initials,
    contractTag,
    publishedLabel,
    salaryLabel,
    dailyRateLabel,
  }
}
