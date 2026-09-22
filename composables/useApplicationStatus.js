// Shared display + mutation helpers for CandidateMatch.application_status.
// Two very different callers need the same status→label/color mapping and
// the same two backend calls, so this keeps them from drifting apart, same
// idiom as useOfferDisplay:
//   - the "Opportunité" detail page calls markApplied() silently the instant
//     the candidate clicks "Voir l'offre" -- see that page's
//     openExternalOffer(). Nothing is shown to the candidate for this to work.
//   - the "Candidatures" list page (pages/candidatures.vue) uses label()/
//     badgeClass()/options for display and calls updateStatus() for the
//     explicit corrections (advance to interview/offer/rejected/withdrawn,
//     or reset a wrong auto-mark back to not_applied).
export function useApplicationStatus() {
  const { t } = useI18n()
  const api = useApi()

  // Order mirrors the natural progression of an application, not the
  // backend enum's declaration order -- this is what drives the "change
  // status" dropdown on the Candidatures page.
  const STATUS_ORDER = ['not_applied', 'applied', 'interview', 'offer', 'rejected', 'withdrawn']

  // Full class names so Tailwind keeps them (same convention as
  // dashboard.vue's scoreColors comment).
  const STYLES = {
    not_applied: 'bg-gray-100 text-gray-500',
    applied: 'bg-brand-light text-brand-text',
    interview: 'bg-warning-light text-warning',
    offer: 'bg-success-light text-success-text',
    rejected: 'bg-danger-light text-danger',
    withdrawn: 'bg-gray-100 text-gray-400',
  }

  function label(status) {
    return t(`applicationStatus.${status}`)
  }

  function badgeClass(status) {
    return STYLES[status] || STYLES.not_applied
  }

  const options = computed(() => STATUS_ORDER.map((value) => ({ value, label: label(value) })))

  // Idempotent, one-way (not_applied -> applied only) on the backend -- see
  // matching_routes.mark_applied's docstring. Best-effort: swallows errors
  // so a background status update never blocks the external navigation it
  // rides along with, and returns null instead of throwing so the caller
  // can tell "nothing changed" apart from "call failed" if it ever needs to.
  async function markApplied(matchId) {
    try {
      return await api(`matching/${matchId}/mark-applied`, { method: 'POST' })
    } catch {
      return null
    }
  }

  // Explicit correction -- unlike markApplied, always applies the given
  // value, including a downgrade back to not_applied. Left to throw: the
  // Candidatures page is driving a visible control here, so it needs to
  // know if the save failed.
  async function updateStatus(matchId, status) {
    return await api(`matching/${matchId}/application-status`, {
      method: 'PATCH',
      body: { application_status: status },
    })
  }

  return { STATUS_ORDER, label, badgeClass, options, markApplied, updateStatus }
}
