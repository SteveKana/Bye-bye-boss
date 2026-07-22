<script setup>
const steps = [
  { key: 'upload', icon: '📤' },
  { key: 'analyse', icon: '🧠' },
  { key: 'explore', icon: '🔍' },
  { key: 'receive', icon: '✉️' },
]
</script>

<template>
  <section id="comment" class="px-6 py-16 lg:px-12">
    <div class="mx-auto max-w-6xl">
      <h2 class="mb-12 text-center text-3xl font-extrabold text-navy">
        {{ $t('landing.how.title') }}
      </h2>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(s, i) in steps" :key="s.key" class="relative text-center">
          <div
            class="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white"
          >
            {{ i + 1 }}
          </div>
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-card"
            aria-hidden="true"
          >
            {{ s.icon }}
          </div>
          <h3 class="mb-2 font-bold text-navy">{{ $t(`landing.how.steps.${s.key}.title`) }}</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            {{ $t(`landing.how.steps.${s.key}.text`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
