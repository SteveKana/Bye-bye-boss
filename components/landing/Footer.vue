<template>
  <footer class="border-t-[3px] border-ink bg-white px-6 py-8 lg:px-12">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center gap-2.5 font-black text-ink">
        <UiLogoMark :size="32" />
        Bye Bye Boss
      </div>

      <div class="text-sm font-medium text-ink/60">{{ $t('landing.footer.copy') }}</div>

      <div class="flex gap-5 text-sm font-bold text-ink">
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.legal') }}</a>
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.privacy') }}</a>
        <a href="#" class="hover:text-brand">{{ $t('landing.footer.contact') }}</a>
      </div>
    </div>
  </footer>
</template>
