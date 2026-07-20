<script setup>
// Accessible modal dialog. v-model:modelValue controls visibility.
// Closes on backdrop click and Escape unless `persistent`. Teleported to body
// and wrapped in <ClientOnly> to stay SSR-safe.
import { onKeyStroke } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  // sm | md | lg
  size: { type: String, default: 'md' },
  // When true, backdrop click / Escape do not close the modal.
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const titleId = useId()

function close() {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('close')
}

onKeyStroke('Escape', () => {
  if (props.modelValue) close()
})

// Lock body scroll while the modal is open (client-only).
watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
)

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modelValue"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
        >
          <div class="absolute inset-0 bg-navy/50 backdrop-blur-sm" @click="close" />

          <div
            class="relative z-10 w-full overflow-hidden rounded-lg bg-white shadow-card"
            :class="sizes[size]"
          >
            <header
              v-if="title || $slots.header"
              class="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4"
            >
              <slot name="header">
                <h2 :id="titleId" class="text-lg font-bold text-gray-900">{{ title }}</h2>
              </slot>
              <button
                v-if="!persistent"
                type="button"
                class="shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
                @click="close"
              >
                ✕
              </button>
            </header>

            <div class="px-5 py-4">
              <slot />
            </div>

            <footer v-if="$slots.footer" class="border-t border-gray-100 px-5 py-4">
              <slot name="footer" :close="close" />
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
