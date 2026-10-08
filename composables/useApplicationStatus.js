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
    not_applied: 'border-2 border-ink bg-white text-ink',
    applied: 'border-2 border-ink bg-lav text-ink',
    interview: 'border-2 border-ink bg-sun text-ink',
    offer: 'border-2 border-ink bg-success-light text-ink',
    rejected: 'border-2 border-ink bg-blush text-ink',
    withdrawn: 'border-2 border-ink/30 bg-white text-ink/50',
  }

  function label(status) {
    return t(`applicationStatus.${status}`)
  }

  function badgeClass(status) {
    return STYLES[status] || STYLES.not_applied
  }

  const options = computed(() => STATUS_ORDER.map((value) => ({ value, label: label(value) })))

  // dd/mm/yyyy, matching the fixed fr-FR date formatting already used
  // elsewhere (dashboard.vue's salaryLabel, useOfferDisplay's
  // publishedLabel's absolute-date branch) regardless of the interface
  // language -- there's no per-language date style anywhere else in the app.
  function dateLabel(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  // What actually happened and when, e.g. "Tu as cliqué sur « Voir
  // l'offre » le 22/09/2026" for the auto-tracked "applied" status, or
  // "Entretien obtenu le 22/09/2026" for a manual correction -- more
  // concrete than the bare status label alone. Falls back to the label if
  // there's no date yet (shouldn't happen in practice: the backend always
  // sets application_status_updated_at in the same write as the status).
  function message(status, dateStr) {
    const date = dateLabel(dateStr)
    return date ? t(`applicationStatus.messages.${status}`, { date }) : label(status)
  }

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

  return { STATUS_ORDER, label, badgeClass, options, message, markApplied, updateStatus }
}
