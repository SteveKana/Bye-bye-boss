<script setup>
definePageMeta({ layout: false, middleware: 'auth' })

const { t } = useI18n()
useHead({ title: computed(() => `${t('onboarding.upload.title')} · Bye Bye Boss`) })

const onboarding = useOnboardingStore()
const toast = useToast()

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const loading = ref(false)

function hasAcceptedExtension(file) {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function pickFile(file) {
  if (!file) return
  if (!hasAcceptedExtension(file)) {
    toast.error(t('onboarding.upload.error_unsupported'))
    return
  }
  if (file.size > MAX_SIZE_BYTES) {
    toast.error(t('onboarding.upload.error_too_large'))
    return
  }
  selectedFile.value = file
}

function onFileChange(event) {
  pickFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  pickFile(event.dataTransfer?.files?.[0])
}

function removeFile() {
  selectedFile.value = null
}

function formatSize(bytes) {
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`
}

async function onContinue() {
  if (!selectedFile.value) {
    toast.error(t('onboarding.upload.error_required'))
    return
  }
  loading.value = true
  try {
    await onboarding.uploadCv(selectedFile.value)
    await navigateTo('/onboarding/verification')
  } catch (err) {
    toast.error(err.message || t('onboarding.upload.error_generic'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NuxtLayout name="onboarding">
    <div>
      <h1 class="mb-1.5 text-2xl font-extrabold text-gray-900">
        {{ $t('onboarding.upload.title') }}
      </h1>
      <p class="mb-7 text-gray-500">{{ $t('onboarding.upload.subtitle') }}</p>

      <div
        class="rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors"
        :class="isDragging ? 'border-brand bg-brand-light' : 'border-gray-200 bg-gray-50'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <template v-if="!selectedFile">
          <div class="mb-4 text-3xl" aria-hidden="true">📄</div>
          <p class="mb-4 font-semibold text-gray-900">
            {{ $t('onboarding.upload.dropzone_title') }}
          </p>
          <p class="mb-4 text-sm text-gray-400">{{ $t('common.or') }}</p>
          <UiButton variant="secondary" type="button" @click="fileInput.click()">
            {{ $t('onboarding.upload.browse') }}
          </UiButton>
          <p class="mt-4 text-xs text-gray-400">{{ $t('onboarding.upload.hint') }}</p>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.docx"
            class="hidden"
            @change="onFileChange"
          />
        </template>

        <div v-else class="flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-soft">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-lg"
            aria-hidden="true"
          >
            📄
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-gray-900">{{ selectedFile.name }}</p>
            <p class="text-sm text-gray-400">{{ formatSize(selectedFile.size) }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 text-gray-400 hover:text-gray-600"
            :aria-label="$t('onboarding.upload.remove')"
            @click="removeFile"
          >
            ✕
          </button>
        </div>
      </div>

      <p v-if="loading" class="mt-4 text-sm text-gray-500">
        {{ $t('onboarding.upload.analyzing') }}
      </p>
    </div>

    <template #actions>
      <UiButton variant="secondary" type="button" :disabled="loading" @click="navigateTo('/')">
        {{ $t('onboarding.upload.cancel') }}
      </UiButton>
      <UiButton
        variant="primary"
        type="button"
        :loading="loading"
        :disabled="!selectedFile"
        @click="onContinue"
      >
        {{ $t('onboarding.upload.continue') }}
      </UiButton>
    </template>
  </NuxtLayout>
</template>
