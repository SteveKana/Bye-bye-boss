<script setup>
// Shell of the admin "Monitoring" area (French only, desktop-first but usable
// on a phone). No sidebar: a slim top bar with a way back to the app.
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-[#fbf9ff]">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -right-24 -top-32 h-[300px] w-[300px] rounded-full bg-sun/40" />
      <div class="absolute -left-32 top-[420px] h-[260px] w-[260px] rounded-full bg-lav" />
    </div>

    <div class="relative">
      <header class="border-b-[2.5px] border-ink bg-white/80 backdrop-blur">
        <div
          class="mx-auto flex max-w-[1344px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
        >
          <NuxtLink to="/dashboard" class="flex items-center gap-2 font-black text-ink">
            <UiLogoMark :size="30" />
            <span>Bye Bye Boss</span>
            <span class="rounded-full bg-ink px-2 py-0.5 text-xs font-extrabold text-white">
              Admin
            </span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-sm font-extrabold text-ink transition hover:bg-lav"
          >
            ← <span class="hidden sm:inline">Retour à l'application</span
            ><span class="sm:hidden">Application</span>
          </NuxtLink>
        </div>
      </header>

      <main class="mx-auto max-w-[1344px] px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
