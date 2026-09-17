<template>
  <footer class="border-t border-gray-200 bg-white px-6 py-8 lg:px-12">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center gap-2.5 font-bold text-navy">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-black text-white"
        >
          BB
        </span>
        Bye Bye Boss
      </div>

      <div class="text-sm text-gray-400">{{ $t('landing.footer.copy') }}</div>

      <div class="flex gap-5 text-sm text-gray-500">
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.legal') }}</a>
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.privacy') }}</a>
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.contact') }}</a>
      </div>
    </div>
  </footer>
</template>
