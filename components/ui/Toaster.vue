<script setup>
// Global toast host. Mount exactly once (see app.vue). Renders the active
// toast stack bottom-right and wires the reusable dismiss / undo actions.
const { toasts, dismiss, runUndo } = useToast()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <TransitionGroup name="toast">
          <UiToast
            v-for="toast in toasts"
            :key="toast.id"
            :toast="toast"
            class="pointer-events-auto"
            @dismiss="dismiss(toast.id)"
            @undo="runUndo(toast.id)"
          />
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
