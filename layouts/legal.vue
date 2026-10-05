<template>
  <div class="relative min-h-screen overflow-hidden bg-[#FBF9FF]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-sun" />
      <div class="absolute -left-40 top-[520px] h-[320px] w-[320px] rounded-full bg-lav" />
    </div>
    <div class="relative flex min-h-screen flex-col">
      <LandingNav />
      <main class="flex-1">
        <slot />
      </main>
      <LandingFooter />
      <LandingCvReuploadModal />
    </div>
  </div>
</template>
