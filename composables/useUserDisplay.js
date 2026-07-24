// Derived display helpers for the current user (name is stored as first_name +
// last_name). Single source of truth for the greeting, the avatar initials and
// the full display name across the app shell and the profile.
export function useUserDisplay() {
  const auth = useAuthStore()

  const firstName = computed(() => auth.user?.first_name?.trim() || '')

  const fullName = computed(() =>
    [auth.user?.first_name, auth.user?.last_name]
      .map((p) => p?.trim())
      .filter(Boolean)
      .join(' ')
  )

  const initials = computed(() => {
    const f = auth.user?.first_name?.trim()
    const l = auth.user?.last_name?.trim()
    if (f || l) return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase()
    return (auth.user?.email || '?').slice(0, 2).toUpperCase()
  })

  return { firstName, fullName, initials }
}
