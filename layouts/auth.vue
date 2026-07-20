<script setup>
// Two-panel auth shell: brand panel on the left (hidden on small screens), form
// on the right. The brand variant and the top-right nav follow the route.
const route = useRoute()

const variant = computed(() => (route.path.startsWith('/register') ? 'signup' : 'login'))

const nav = computed(() => {
  if (route.path.startsWith('/register')) {
    return { text: 'nav.have_account', to: '/login', label: 'nav.sign_in' }
  }
  if (route.path.startsWith('/reset-password')) {
    return { text: '', to: '/login', label: 'common.back_to_login' }
  }
  return { text: 'nav.no_account', to: '/register', label: 'nav.create_account' }
})
</script>

<template>
  <div class="flex min-h-screen bg-brand-light">
    <aside class="hidden p-4 lg:flex lg:w-[46%]">
      <AuthBrandPanel :variant="variant" />
    </aside>

    <main class="flex flex-1 flex-col overflow-y-auto bg-white">
      <div class="flex items-center justify-end gap-4 px-6 py-5 sm:px-10">
        <p class="text-sm text-gray-500">
          <span v-if="nav.text">{{ $t(nav.text) }} </span>
          <NuxtLink :to="nav.to" class="font-semibold text-brand hover:underline">
            {{ $t(nav.label) }}
          </NuxtLink>
        </p>
        <UiLangSwitcher />
      </div>

      <div class="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
