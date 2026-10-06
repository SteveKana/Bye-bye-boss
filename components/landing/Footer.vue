<template>
  <footer class="border-t-[3px] border-ink bg-white px-6 py-8 lg:px-12">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center gap-2.5 font-black text-ink">
        <UiLogoMark :size="32" />
        Bye Bye Boss
      </div>

      <div class="text-sm font-medium text-ink/60">{{ $t('landing.footer.copy') }}</div>

      <div class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-ink">
        <NuxtLink to="/mentions-legales" class="hover:text-brand">
          {{ $t('landing.footer.legal') }}
        </NuxtLink>
        <NuxtLink to="/confidentialite" class="hover:text-brand">
          {{ $t('landing.footer.privacy') }}
        </NuxtLink>
        <NuxtLink to="/cookies" class="hover:text-brand">
          {{ $t('landing.footer.cookies') }}
        </NuxtLink>
        <NuxtLink to="/contact" class="hover:text-brand">
          {{ $t('landing.footer.contact') }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
