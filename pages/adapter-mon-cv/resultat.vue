<script setup>
// The free CV adaptation, step 2: the adapted CV, to read, edit and download,
// and the offer to finish signing up. The CV is in this browser only (see
// stores/freeCv.js); this page is client-rendered (routeRules in nuxt.config).
definePageMeta({ layout: false })

const { t, locale } = useI18n()
useHead({
  title: computed(
    () => `${t('freecv.result.title')} ${t('freecv.result.title_accent')} · Bye Bye Boss`
  ),
  meta: [{ name: 'robots', content: 'noindex' }],
})

const store = useFreeCvStore()
const toast = useToast()
store.restore()
// Nothing to show (opened directly, or the tab was closed): back to the form.
if (!store.result) await navigateTo('/adapter-mon-cv', { replace: true })

const downloading = ref(false)
async function download() {
  downloading.value = true
  try {
    await store.downloadPdf()
  } catch (err) {
    toast.error(err?.message || t('freecv.result.download_error'))
  } finally {
    downloading.value = false
  }
}

function another() {
  store.newOffer()
  navigateTo('/adapter-mon-cv')
}

const languageName = computed(() => {
  const code = store.result?.language
  if (!code) return ''
  try {
    return new Intl.DisplayNames([locale.value], { type: 'language' }).of(code) || code
  } catch {
    return code
  }
})
const offerTitle = computed(() => {
  const fromLink = store.offerTitle?.trim()
  if (fromLink) return fromLink
  const firstLine = (store.offerText || '').split('\n').find((l) => l.trim()) || ''
  return firstLine.length > 80 ? `${firstLine.slice(0, 77).trim()}…` : firstLine.trim()
})

// The advice ("Conseil") is written for the CV as generated. A few seconds
// after the visitor stops editing, it is written again from the edited CV.
const refreshingAdvice = ref(false)
let adviceFailed = false
const refreshAdvice = useDebounceFn(async () => {
  if (!store.adviceOutdated || refreshingAdvice.value || adviceFailed) return
  refreshingAdvice.value = true
  try {
    await store.refreshAdvice()
  } catch {
    // Keep the old advice; do not hammer a limit that said no.
    adviceFailed = true
  } finally {
    refreshingAdvice.value = false
  }
}, 3000)
watch(
  () => store.contentKey(),
  () => {
    if (store.adviceOutdated) refreshAdvice()
  }
)
</script>

<template>
  <div v-if="store.result" class="relative min-h-screen bg-[#FBF9FF]">
    <FreecvNav />

    <main class="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-16 pt-2 sm:px-10">
      <div class="flex flex-col gap-2">
        <h1 class="text-[30px] font-black leading-[1.1] tracking-[-0.5px] text-ink sm:text-4xl">
          {{ $t('freecv.result.title') }}
          <span class="text-brand">{{ $t('freecv.result.title_accent') }}</span>
        </h1>
        <p v-if="languageName" class="text-md font-medium text-ink/70">
          {{
            offerTitle
              ? $t('freecv.result.offer_line', { title: offerTitle, language: languageName })
              : $t('freecv.result.offer_line_no_title', { language: languageName })
          }}
        </p>
      </div>

      <div
        class="flex items-start gap-3.5 rounded-[22px] border-[3px] border-ink bg-sun px-5 py-[18px] shadow-[6px_6px_0_#16122E]"
        role="note"
      >
        <span class="text-2xl leading-none" aria-hidden="true">👀</span>
        <div class="flex flex-col gap-1">
          <span class="text-lg font-black">{{ $t('freecv.result.review_title') }}</span>
          <span class="text-base font-medium leading-[1.55]">
            {{ $t('freecv.result.review_text') }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-start gap-7">
        <div class="min-w-0 flex-[999_1_640px]">
          <FreecvCvEditor />
        </div>

        <aside
          class="flex min-w-0 flex-1 basis-[320px] flex-col gap-5 lg:sticky lg:top-3 lg:-m-2 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:p-2 [&>*]:shrink-0"
        >
          <div class="flex flex-col gap-3 rounded-[22px] border-[3px] border-ink bg-white p-5">
            <UiButton variant="primary" size="lg" block :loading="downloading" @click="download">
              ⬇ {{ $t('freecv.result.download') }}
            </UiButton>
            <UiButton variant="secondary" block @click="another">
              {{ $t('freecv.result.another') }}
            </UiButton>
          </div>

          <div class="flex flex-col gap-3 rounded-[22px] border-[3px] border-ink bg-white p-5">
            <h2 class="text-lg font-black">{{ $t('freecv.result.legend') }}</h2>
            <div class="flex items-center gap-2.5 text-sm font-medium">
              <span class="h-[18px] w-[18px] rounded border-2 border-ink bg-lav" />
              {{ $t('freecv.result.legend_modified') }}
            </div>
            <div class="flex items-center gap-2.5 text-sm font-medium">
              <span class="h-[18px] w-[18px] rounded border-2 border-ink bg-sun-light" />
              {{ $t('freecv.result.legend_added') }}
            </div>
          </div>

          <div
            v-if="store.result.advice"
            class="flex flex-col gap-2 rounded-[22px] border-[3px] border-ink bg-lav p-5"
          >
            <h2 class="text-lg font-black">{{ $t('freecv.result.advice') }}</h2>
            <p class="text-sm leading-[1.6] font-medium text-ink/80">{{ store.result.advice }}</p>
            <p v-if="refreshingAdvice" class="text-xs font-semibold text-ink/60">
              {{ $t('freecv.result.advice_updating') }}
            </p>
            <p v-else-if="store.adviceOutdated" class="text-xs font-medium text-ink/60">
              {{ $t('freecv.result.advice_follows') }}
            </p>
          </div>

          <div
            class="relative flex flex-col gap-3 overflow-hidden rounded-[26px] border-[3px] border-ink bg-brand p-[26px] text-white shadow-[8px_8px_0_#16122E]"
          >
            <div class="text-xl font-black leading-[1.3]">
              {{ $t('freecv.result.signup_title') }}
            </div>
            <p class="text-[13.5px] font-medium leading-[1.55] text-white/90">
              {{ $t('freecv.result.signup_text') }}
            </p>
            <UiButton variant="sun" @click="navigateTo('/adapter-mon-cv/inscription')">
              {{ $t('freecv.result.signup_cta') }}
            </UiButton>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
