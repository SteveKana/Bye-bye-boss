import * as yup from 'yup'

// Reusable, localized field validators built on Yup — the single source of truth
// for form rules across the app (auth screens, waitlist, future forms).
//
// Call the builders inside `computed(() => yup.object({...}))` so the messages
// follow locale changes:
//
//   const v = useValidators()
//   const schema = computed(() => yup.object({ email: v.email(), password: v.password() }))
export function useValidators() {
  const { t } = useI18n()

  const email = () =>
    yup.string().required(t('validation.email_required')).email(t('validation.email_invalid'))

  // New passwords: enforce the minimum length.
  const password = () =>
    yup.string().required(t('validation.password_required')).min(8, t('validation.password_min'))

  // Sign-in: the password just has to be present (rules are the backend's job).
  const passwordRequired = () => yup.string().required(t('validation.password_required'))

  const passwordConfirm = (field = 'password') =>
    yup
      .string()
      .required(t('validation.confirm_required'))
      .oneOf([yup.ref(field)], t('validation.password_mismatch'))

  return { email, password, passwordRequired, passwordConfirm }
}
