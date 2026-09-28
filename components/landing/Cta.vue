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
const reuploading = ref(false)

function onCtaClick() {
  if (auth.isAuthenticated) {
    fileInput.value?.click()
  } else {
    navigateTo('/register')
  }
}

async function onReupload(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  reuploading.value = true
  try {
    await onboarding.uploadCv(file)
    toast.success(t('profileCv.reupload_success'))
  } catch (err) {
    toast.error(err?.message || t('profileCv.upload_error'))
  } finally {
    reuploading.value = false
  }
}
</script>

<template>
  <section id="faq" class="px-6 py-16 lg:px-12">
    <div
      class="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-navy-light to-navy px-8 py-14 text-center text-white"
    >
      <h2 class="mb-4 text-2xl font-extrabold leading-snug sm:text-3xl">
        {{ $t('landing.cta.title') }}<br />
        {{ $t('landing.cta.title2') }}
      </h2>
      <p class="mx-auto mb-7 max-w-xl text-[15px] leading-relaxed text-white/70">
        {{ $t('landing.cta.sub') }}
      </p>
      <UiButton variant="primary" size="lg" :loading="reuploading" @click="onCtaClick">
        ⬆ {{ auth.isAuthenticated ? $t('profileCv.reupload') : $t('landing.cta.button') }}
      </UiButton>
      <input ref="fileInput" type="file" accept=".pdf,.docx" class="hidden" @change="onReupload" />
      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-white/50"
      >
        <span>{{ $t('landing.cta.trust_1') }}</span>
        <span>{{ $t('landing.cta.trust_2') }}</span>
        <span>{{ $t('landing.cta.trust_3') }}</span>
      </div>
    </div>
  </section>
</template>
