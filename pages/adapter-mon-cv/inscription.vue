<script setup>
// The free CV adaptation, step 3: finish signing up. The email is taken from
// the CV; right after the account is created, the CV file (still in this
// browser) is imported into it, so nothing is retyped. If the file is gone
// (page reloaded), the account falls back to the usual CV import step.
import { useForm } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: false })

const { t, locale } = useI18n()
useHead({
  title: computed(() => `${t('freecv.signup.card_title')} · Bye Bye Boss`),
  meta: [{ name: 'robots', content: 'noindex' }],
})

const store = useFreeCvStore()
const auth = useAuthStore()
const onboarding = useOnboardingStore()
const toast = useToast()
const v = useValidators()
const loading = ref(false)

store.restore()
if (!store.result) await navigateTo('/adapter-mon-cv', { replace: true })

const schema = computed(() =>
  yup.object({
    email: v.email(),
    password: v.password(),
    terms: yup.boolean().oneOf([true], t('freecv.signup.terms_required')),
  })
)
const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: { email: store.result?.email || '', password: '', terms: false },
})
const [email] = defineField('email')
const [password] = defineField('password')
const [terms] = defineField('terms')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await auth.register({
      first_name: store.result?.first_name || undefined,
      last_name: store.result?.last_name || undefined,
      email: values.email,
      password: values.password,
      locale: locale.value === 'en' ? 'en' : 'fr',
    })
  } catch (err) {
    toast.error(
      err?.code === 'conflict' ? t('register.email_taken') : err?.message || t('register.error')
    )
    loading.value = false
    return
  }

  // The account exists and is signed in. Carry the CV over, then forget it.
  let next = '/onboarding/upload'
  if (store.file) {
    try {
      await onboarding.uploadCv(store.file)
      next = '/onboarding/verification'
    } catch {
      toast.error(t('freecv.signup.cv_upload_failed'))
    }
  }
  store.clear()
  loading.value = false
  await navigateTo(next)
})
</script>

<template>
  <div v-if="store.result" class="relative min-h-screen bg-[#FBF9FF]">
    <FreecvNav link-key="freecv.nav.already" />

    <main
      class="mx-auto flex w-full max-w-[1060px] flex-wrap items-center gap-12 px-6 pb-16 pt-6 sm:px-8"
    >
      <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-[22px]">
        <div
          class="inline-flex w-fit items-center gap-2.5 rounded-full border-2 border-ink bg-success-light px-4 py-[7px] text-[13px] font-extrabold"
        >
          <span aria-hidden="true">✓</span>
          {{ store.downloaded ? $t('freecv.signup.badge') : $t('freecv.signup.badge_ready') }}
        </div>
        <h1 class="text-4xl font-black leading-[1.1] tracking-[-0.8px] text-ink sm:text-[40px]">
          {{ $t('freecv.signup.title') }}
          <span class="text-brand">{{ $t('freecv.signup.title_accent') }}</span>
        </h1>
        <p class="text-lg font-medium leading-[1.7] text-ink/80">
          {{ $t('freecv.signup.sub') }}
        </p>

        <ul class="flex flex-col gap-3.5">
          <li class="flex items-center gap-3.5">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-ink bg-sun text-xl"
              aria-hidden="true"
            >
              💾
            </span>
            <span class="text-md font-medium leading-normal">
              <b class="font-extrabold">{{ $t('freecv.signup.point_1_bold') }}</b
              >{{ $t('freecv.signup.point_1') }}
            </span>
          </li>
          <li class="flex items-center gap-3.5">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-ink bg-lav text-xl"
              aria-hidden="true"
            >
              🎯
            </span>
            <span class="text-md font-medium leading-normal">
              <b class="font-extrabold">{{ $t('freecv.signup.point_2_bold') }}</b
              >{{ $t('freecv.signup.point_2') }}
            </span>
          </li>
          <li class="flex items-center gap-3.5">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-ink bg-blush text-xl"
              aria-hidden="true"
            >
              ⚡
            </span>
            <span class="text-md font-medium leading-normal">
              <b class="font-extrabold">{{ $t('freecv.signup.point_3_bold') }}</b
              >{{ $t('freecv.signup.point_3') }}
            </span>
          </li>
        </ul>
      </div>

      <form
        novalidate
        class="flex min-w-0 flex-[1_1_400px] flex-col gap-4 rounded-[26px] border-[3px] border-ink bg-white p-[30px] shadow-[8px_8px_0_#16122E]"
        @submit.prevent="onSubmit"
      >
        <h2 class="text-2xl font-black text-ink">{{ $t('freecv.signup.card_title') }}</h2>

        <UiInput
          v-model="email"
          :label="$t('freecv.signup.email')"
          type="email"
          autocomplete="email"
          :error="errors.email"
        />
        <UiInput
          v-model="password"
          :label="$t('freecv.signup.password')"
          type="password"
          :placeholder="$t('freecv.signup.password_placeholder')"
          autocomplete="new-password"
          :error="errors.password"
        />

        <UiCheckbox v-model="terms" :label="$t('freecv.signup.terms')" :error="errors.terms" />

        <UiButton type="submit" variant="primary" size="lg" block :loading="loading">
          {{ $t('freecv.signup.submit') }}
        </UiButton>

        <span class="text-center text-[12.5px] font-medium text-ink/60">
          {{ $t('freecv.signup.note') }}
        </span>
      </form>
    </main>
  </div>
</template>
