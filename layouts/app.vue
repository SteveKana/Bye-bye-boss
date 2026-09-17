<script setup>
// Authenticated app shell: navy sidebar on large screens, a top bar + slide-in
// drawer on mobile. Used by the dashboard and profile pages.
const route = useRoute()
const mobileOpen = ref(false)

// Close the drawer after navigating.
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Desktop sidebar -->
    <div class="hidden lg:flex">
      <AppSidebar />
    </div>

    <!-- Mobile top bar -->
    <header
      class="fixed inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-navy-light px-4 py-3 text-white lg:hidden"
    >
      <button
        class="-ml-1 rounded-md p-1 text-white/80 hover:text-white"
        :aria-label="$t('app.menu')"
        aria-haspopup="menu"
        :aria-expanded="mobileOpen"
        @click="mobileOpen = true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          class="h-6 w-6"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <NuxtLink to="/dashboard" class="flex items-center gap-2 font-bold">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[11px] font-black"
        >
          BB
        </span>
        Bye Bye Boss
      </NuxtLink>
    </header>

    <!-- Mobile drawer -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="mobileOpen = false" />
        <Transition
          enter-active-class="transition-transform duration-200"
          enter-from-class="-translate-x-full"
          leave-active-class="transition-transform duration-200"
          leave-to-class="-translate-x-full"
          appear
        >
          <div v-if="mobileOpen" class="absolute inset-y-0 left-0 shadow-xl">
            <AppSidebar />
            <button
              class="absolute right-3 top-3 rounded-md p-1 text-white/70 hover:text-white"
              :aria-label="$t('app.close')"
              @click="mobileOpen = false"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <main class="flex-1 overflow-x-hidden pt-14 lg:pt-0">
      <div class="mx-auto max-w-5xl px-5 py-8 lg:px-10">
        <slot />
      </div>
    </main>
  </div>
</template>
