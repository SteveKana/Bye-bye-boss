<script setup>
// The form of the free, no-account CV adaptation: the visitor's CV, then the
// offer (pasted text or link), then "Adapter mon CV". Used on the new homepage
// (variant "home") and on /adapter-mon-cv (variant "page"): same behaviour, the
// two mockups only differ in a few texts.
//
// Nothing is kept server-side. The CV file stays in the browser (see
// stores/freeCv.js); on success the visitor lands on the result page.
const props = defineProps({
  // 'page' | 'home'
  variant: { type: String, default: 'page' },
})

const { t } = useI18n()
const store = useFreeCvStore()
const turnstile = useTurnstile()

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MIN_OFFER_CHARS = 100

const isHome = computed(() => props.variant === 'home')
const fileInput = ref(null)
const file = ref(store.file)
const dragging = ref(false)
const tab = ref('text')
const text = ref(store.offerText || '')
const url = ref('')
const error = ref('')
const reading = ref(false)
const captchaBox = ref(null)

const needCaptcha = computed(() => !!store.status?.captcha_required && !!turnstile.siteKey)
const busy = computed(() => reading.value || store.generating)

onMounted(async () => {
  const status = await store.loadStatus()
  if (status?.captcha_required && turnstile.siteKey) {
    await nextTick()
    turnstile.render(captchaBox.value).catch(() => {})
  }
})

function pickFile(chosen) {
  if (!chosen) return
  const name = chosen.name.toLowerCase()
  if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
    error.value = t('freecv.form.error_unsupported')
    return
  }
  if (chosen.size > MAX_SIZE_BYTES) {
    error.value = t('freecv.form.error_too_large')
    return
  }
  error.value = ''
  file.value = chosen
}
function onFileChange(event) {
  pickFile(event.target.files?.[0])
  event.target.value = ''
}
function onDrop(event) {
  dragging.value = false
  pickFile(event.dataTransfer?.files?.[0])
}
function sizeLabel(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`
}

// Elapsed seconds while the model works, to move the step list along (a single
// blocking call has no real checkpoints, same approach as the other progress
// components of the app).
const elapsed = ref(0)
let timer = null
watch(
  () => store.generating,
  (running) => {
    clearInterval(timer)
    elapsed.value = 0
    if (running) timer = setInterval(() => (elapsed.value += 1), 1000)
  }
)
onBeforeUnmount(() => clearInterval(timer))
const STEPS = ['progress_read', 'progress_generate']
const stepIndex = computed(() => (elapsed.value >= 12 ? 1 : 0))

async function submit() {
  error.value = ''
  if (busy.value) return
  if (!file.value) {
    error.value = t('freecv.form.error_no_cv')
    return
  }

  let offer = text.value.trim()
  if (tab.value === 'link') {
    if (!url.value.trim()) {
      error.value = t('freecv.form.error_no_offer')
      return
    }
    // The page behind the link is read first. When the site refuses, the
    // visitor is asked to paste the text instead (the warning said so).
    reading.value = true
    try {
      offer = (await store.readOffer(url.value.trim())).trim()
      text.value = offer
    } catch {
      tab.value = 'text'
      error.value = t('freecv.form.link_unreadable')
      return
    } finally {
      reading.value = false
    }
  } else if (!offer) {
    error.value = t('freecv.form.error_no_offer')
    return
  }
  if (offer.length < MIN_OFFER_CHARS) {
    error.value = t('freecv.form.error_too_short')
    return
  }
  if (needCaptcha.value && !turnstile.token.value) {
    error.value = t('freecv.form.error_captcha')
    return
  }

  try {
    await store.generate({ cvFile: file.value, text: offer, captchaToken: turnstile.token.value })
    await navigateTo('/adapter-mon-cv/resultat')
  } catch (err) {
    error.value = err?.message || t('freecv.form.error_generic')
    turnstile.reset()
    store.loadStatus()
  }
}

const tabs = ['text', 'link']
</script>

<template>
  <form
    id="form"
    novalidate
    class="flex w-full flex-col gap-6 rounded-[26px] border-[3px] border-ink bg-white p-5 text-left shadow-[8px_8px_0_#16122E] sm:p-7"
    @submit.prevent="submit"
  >
    <!-- 1 · CV -->
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-sun text-[13px] font-black"
        >
          1
        </span>
        <h2 class="text-lg font-extrabold text-ink">{{ $t('freecv.form.step_cv') }}</h2>
      </div>

      <div
        role="button"
        tabindex="0"
        class="flex flex-wrap items-center gap-4 rounded-[18px] border-2 border-dashed border-ink px-5 py-[18px] transition-colors"
        :class="dragging ? 'bg-lav' : 'bg-[#F3F1FF]'"
        @click="fileInput?.click()"
        @keydown.enter.prevent="fileInput?.click()"
        @keydown.space.prevent="fileInput?.click()"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-lav text-[22px]"
          aria-hidden="true"
        >
          📄
        </span>
        <div v-if="!file" class="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span class="text-md font-extrabold text-ink">{{ $t('freecv.form.drop_title') }}</span>
          <span class="text-sm font-medium text-ink/60">{{ $t('freecv.form.drop_hint') }}</span>
        </div>
        <div v-else class="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span class="break-all text-md font-extrabold text-ink">{{ file.name }}</span>
          <span class="text-sm font-medium text-ink/60">
            {{ sizeLabel(file.size) }} · {{ $t('freecv.form.drop_hint') }}
          </span>
        </div>
        <UiButton variant="secondary" size="sm" @click.stop="fileInput?.click()">
          ⬆ {{ file ? $t('freecv.form.file_change') : $t('freecv.form.drop_button') }}
        </UiButton>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx"
          class="hidden"
          :aria-label="$t('freecv.form.step_cv')"
          @change="onFileChange"
        />
      </div>
    </div>

    <!-- 2 · Offer -->
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-sun text-[13px] font-black"
        >
          2
        </span>
        <h2 class="text-lg font-extrabold text-ink">{{ $t('freecv.form.step_offer') }}</h2>
      </div>

      <div role="tablist" class="flex w-fit gap-1.5">
        <button
          v-for="key in tabs"
          :key="key"
          type="button"
          role="tab"
          :aria-selected="tab === key"
          class="min-h-[44px] rounded-full border-2 border-ink px-[18px] py-2 text-sm font-extrabold transition-colors"
          :class="tab === key ? 'bg-brand text-white' : 'bg-white text-ink hover:bg-lav'"
          @click="tab = key"
        >
          {{ $t(`freecv.form.tab_${key}`) }}
        </button>
      </div>

      <div v-if="tab === 'text'" class="flex flex-col gap-2">
        <label v-if="!isHome" for="free-cv-offer-text" class="text-sm font-bold text-ink">
          {{ $t('freecv.form.text_label') }}
        </label>
        <textarea
          id="free-cv-offer-text"
          v-model="text"
          rows="6"
          :aria-label="$t('freecv.form.step_offer')"
          :placeholder="
            isHome
              ? $t('freecv.form.text_placeholder_home')
              : $t('freecv.form.text_placeholder_page')
          "
          class="min-h-[130px] w-full rounded-2xl border-2 border-ink bg-white px-3.5 py-3 text-sm leading-[1.55] text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:shadow-focus-ring"
        />
        <span v-if="!isHome" class="text-sm font-medium text-ink/60">
          {{ $t('freecv.form.text_hint') }}
        </span>
      </div>

      <div v-else class="flex flex-col gap-2">
        <label v-if="!isHome" for="free-cv-offer-url" class="text-sm font-bold text-ink">
          {{ $t('freecv.form.link_label') }}
        </label>
        <input
          id="free-cv-offer-url"
          v-model="url"
          type="url"
          inputmode="url"
          :aria-label="$t('freecv.form.tab_link')"
          :placeholder="$t('freecv.form.link_placeholder')"
          class="h-[50px] w-full rounded-2xl border-2 border-ink bg-white px-3.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:shadow-focus-ring"
        />
        <div
          class="rounded-[14px] border-2 border-ink bg-sun-light px-3.5 py-2.5 text-sm font-medium leading-normal text-ink/70"
        >
          {{ isHome ? $t('freecv.form.link_warning_home') : $t('freecv.form.link_warning_page') }}
        </div>
      </div>
    </div>

    <p
      v-if="error"
      role="alert"
      class="rounded-[14px] border-2 border-danger bg-danger-light px-3.5 py-2.5 text-sm font-bold text-danger"
    >
      {{ error }}
    </p>

    <!-- Anti-bot challenge: only rendered when the API asks for it -->
    <div v-show="needCaptcha" ref="captchaBox" class="flex justify-center" />

    <!-- Action / progress -->
    <div class="flex flex-col gap-2.5">
      <div
        v-if="store.generating"
        class="rounded-xl border-2 border-brand/30 bg-brand-light px-5 py-4"
        role="status"
      >
        <div class="flex items-center gap-3.5">
          <span
            class="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-brand border-t-transparent"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-brand-text">{{ $t('freecv.form.progress_title') }}</p>
            <p class="text-xs font-bold text-brand-text">{{ $t('freecv.form.progress_notice') }}</p>
          </div>
        </div>
        <ul class="mt-3.5 space-y-2 border-t border-brand/20 pt-3">
          <li
            v-for="(step, index) in STEPS"
            :key="step"
            class="flex items-center gap-2.5 text-[13px]"
            :class="
              index < stepIndex
                ? 'text-brand-text/50'
                : index === stepIndex
                  ? 'font-semibold text-brand-text'
                  : 'text-brand-text/40'
            "
          >
            <span v-if="index < stepIndex" class="text-success" aria-hidden="true">✓</span>
            <span
              v-else-if="index === stepIndex"
              class="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
              aria-hidden="true"
            />
            <span
              v-else
              class="h-2 w-2 shrink-0 rounded-full border-2 border-brand-text/25"
              aria-hidden="true"
            />
            {{ $t(`freecv.form.${step}`) }}
          </li>
        </ul>
      </div>

      <template v-else>
        <UiButton type="submit" variant="primary" size="lg" block :loading="reading">
          ⬆ {{ $t('freecv.form.submit') }}
        </UiButton>
        <span v-if="!isHome" class="text-center text-[12.5px] font-semibold text-ink/70">
          {{ $t('freecv.form.note_page') }}
        </span>
        <span v-else class="text-center text-[12.5px] font-semibold text-ink/70">
          {{ $t('freecv.form.trust_1') }} · {{ $t('freecv.form.trust_2') }} ·
          {{ $t('freecv.form.trust_3') }} ·
          {{ $t('freecv.form.trust_4', { n: store.dailyLimit }) }}
        </span>
      </template>
    </div>
  </form>
</template>
