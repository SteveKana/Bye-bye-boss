// Global toast manager with an optional reusable "undo" action.
// Shared reactive state via useState so any component (trigger) and the single
// <UiToaster /> host stay in sync.
//
// Usage:
//   const toast = useToast()
//   toast.success('Profil enregistré')
//   toast.error('Une erreur est survenue')
//   // Undo pattern (e.g. offer rejection, 4–5s window):
//   toast.show({
//     message: 'Offre rejetée',
//     variant: 'info',
//     duration: 5000,
//     undo: () => restoreOffer(),
//   })

let counter = 0

export function useToast() {
  const toasts = useState('ui-toasts', () => [])

  function dismiss(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index === -1) return
    const [removed] = toasts.value.splice(index, 1)
    if (removed?.timer) clearTimeout(removed.timer)
  }

  function show(options) {
    const config = typeof options === 'string' ? { message: options } : options
    const {
      message,
      variant = 'info', // success | danger | warning | info
      duration = 4000, // ms; 0 keeps the toast until dismissed
      undo = null,
      undoLabel = 'Annuler',
    } = config

    const id = ++counter
    const toast = { id, message, variant, undo, undoLabel, timer: null }

    if (duration > 0) {
      toast.timer = setTimeout(() => dismiss(id), duration)
    }

    toasts.value.push(toast)
    return id
  }

  // Runs the toast's undo callback (if any), then removes it.
  function runUndo(id) {
    const toast = toasts.value.find((t) => t.id === id)
    if (toast?.undo) toast.undo()
    dismiss(id)
  }

  const success = (message, opts = {}) => show({ message, variant: 'success', ...opts })
  const error = (message, opts = {}) => show({ message, variant: 'danger', ...opts })
  const warning = (message, opts = {}) => show({ message, variant: 'warning', ...opts })
  const info = (message, opts = {}) => show({ message, variant: 'info', ...opts })

  return { toasts, show, dismiss, runUndo, success, error, warning, info }
}
