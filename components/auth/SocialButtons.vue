<script setup>
// Fictive social sign-in for now: the backend has no OAuth yet, so these just
// notify that it is coming. Kept visually faithful to the mockups.
const { t } = useI18n()
const toast = useToast()

function soon(provider) {
  toast.info(t('social.soon', { provider }))
}
</script>

<template>
  <div>
    <div class="my-4 flex items-center gap-3 text-sm text-gray-400">
      <span class="h-px flex-1 bg-gray-200" />
      {{ $t('common.or') }}
      <span class="h-px flex-1 bg-gray-200" />
    </div>

    <button
      type="button"
      class="mb-2.5 flex w-full items-center justify-center gap-2.5 rounded-md border-[1.5px] border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
      @click="soon('Google')"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.017 17.64 11.71 17.64 9.2z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
        />
      </svg>
      {{ $t('social.google') }}
    </button>

    <button
      type="button"
      class="flex w-full items-center justify-center gap-2.5 rounded-md border-[1.5px] border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
      @click="soon('LinkedIn')"
    >
      <span
        class="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2] text-[11px] font-black text-white"
        aria-hidden="true"
      >
        in
      </span>
      {{ $t('social.linkedin') }}
    </button>
  </div>
</template>
