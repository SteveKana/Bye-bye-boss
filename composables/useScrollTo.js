// Smooth-scrolls to an element and flashes a ring around it.
// A CTA pointing at a form that is already on screen would otherwise look
// broken: centring the target always produces a visible movement.
export function useScrollTo() {
  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }

  function scrollToElement(id, { focus = false } = {}) {
    const element = document.getElementById(id)
    if (!element) return

    const reduced = prefersReducedMotion()
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })

    // Focus only once the glide is over, otherwise the browser jump-scrolls.
    if (focus) {
      setTimeout(() => element.focus({ preventScroll: true }), reduced ? 0 : 550)
    }

    // Highlight the whole field, not just the input.
    const target = element.closest('[data-highlight]') || element
    target.classList.remove('highlight-pulse')
    void target.offsetWidth // restart the animation if it is already running
    target.classList.add('highlight-pulse')
    setTimeout(() => target.classList.remove('highlight-pulse'), 2400)
  }

  return { scrollToElement }
}
