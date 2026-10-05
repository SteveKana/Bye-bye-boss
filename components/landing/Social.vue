<script setup>
const stats = [
  { numKey: 'landing.social.stat1_num', labelKey: 'landing.social.stat1_label' },
  { numKey: 'landing.social.stat2_num', labelKey: 'landing.social.stat2_label' },
  { numKey: 'landing.social.stat3_num', labelKey: 'landing.social.stat3_label' },
  { numKey: 'landing.social.stat4_num', labelKey: 'landing.social.stat4_label' },
]
</script>

<template>
  <section class="px-6 py-14 lg:px-12">
    <div class="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.numKey"
        class="rounded-[24px] border-[3px] border-ink bg-white px-4 py-5"
      >
        <div class="text-3xl font-black text-brand">{{ $t(s.numKey) }}</div>
        <div class="mt-1.5 text-[13px] font-medium leading-snug text-ink/80">
          {{ $t(s.labelKey) }}
        </div>
      </div>
    </div>
  </section>
</template>
