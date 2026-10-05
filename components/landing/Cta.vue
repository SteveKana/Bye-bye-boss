<script setup>
// Simple closing CTA (matchcareer.html mockup's "footer-cta" section) --
// replaces the earlier 3-column waitlist-form block, since the product now
// has real signup rather than a pre-launch email list.

// Same fix as the hero's own CTA (components/landing/Hero.vue) and the
// header nav (components/landing/Nav.vue): a logged-in visitor already has
// an account, so "Importer mon CV" here should trigger a real CV re-upload,
// not send them back through /register or to a dashboard where nothing
// happens.
const auth = useAuthStore()
const onboarding = useOnboardingStore()
const toast = useToast()
const { t } = useI18n()

const fileInput = ref(null)

function onCtaClick() {
  if (auth.isAuthenticated) {
    fileInput.value?.click()
  } else {
    navigateTo('/register')
  }
}

// Same shared modal + diff as the hero (see
// components/landing/CvReuploadModal.vue and stores/onboarding.js).
async function onReupload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    await onboarding.reuploadFromHomepage(file)
    toast.success(t('profileCv.reupload_success'))
    // Même choix que le hero -- rester sur la home après import ne montre
    // rien de concret, direction /profile pour voir le nouveau CV.
    navigateTo('/profile')
  } catch (err) {
    toast.error(err?.message || t('profileCv.upload_error'))
  }
}
</script>

<template>
  <section id="faq" class="px-6 py-16 lg:px-12">
    <div
      class="relative mx-auto max-w-3xl overflow-hidden rounded-[32px] border-[3px] border-ink bg-brand px-8 py-14 text-center text-white shadow-[8px_8px_0_#16122E]"
    >
      <span
        class="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sun"
        aria-hidden="true"
      />
      <span
        class="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-blush"
        aria-hidden="true"
      />
      <h2 class="relative mb-4 text-2xl font-black leading-snug sm:text-3xl">
        {{ $t('landing.cta.title') }}<br />
        {{ $t('landing.cta.title2') }}
      </h2>
      <p
        class="relative mx-auto mb-7 max-w-xl text-[15px] font-medium leading-relaxed text-white/90"
      >
        {{ $t('landing.cta.sub') }}
      </p>
      <UiButton variant="sun" size="lg" class="relative" @click="onCtaClick">
        ⬆ {{ auth.isAuthenticated ? $t('profileCv.reupload') : $t('landing.cta.button') }}
      </UiButton>
      <input ref="fileInput" type="file" accept=".pdf,.docx" class="hidden" @change="onReupload" />
      <div
        class="relative mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] font-semibold text-white/85"
      >
        <span>{{ $t('landing.cta.trust_1') }}</span>
        <span>{{ $t('landing.cta.trust_2') }}</span>
        <span>{{ $t('landing.cta.trust_3') }}</span>
      </div>
    </div>
  </section>
</template>
