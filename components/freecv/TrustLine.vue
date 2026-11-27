<script setup>
const store = useFreeCvStore()
</script>

<template>
  <div
    class="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] font-semibold text-ink/70"
  >
    <span>{{ $t('freecv.form.trust_1') }}</span>
    <span>{{ $t('freecv.form.trust_2') }}</span>
    <span>{{ $t('freecv.form.trust_3') }}</span>
    <span>{{ $t('freecv.form.trust_4', { n: store.dailyLimit }) }}</span>
  </div>
</template>
