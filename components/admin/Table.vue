<script setup>
// Table wrapper: scrolls horizontally inside its card on narrow screens.
defineProps({
  minWidth: { type: String, default: '520px' },
})
</script>

<template>
  <div class="admin-table-wrap overflow-x-auto">
    <table class="admin-table w-full border-collapse text-sm" :style="{ minWidth }">
      <slot />
    </table>
  </div>
</template>

<style scoped>
.admin-table :deep(th) {
  text-align: left;
  font-size: 12px;
  font-weight: 800;
  color: rgb(22 18 46 / 0.6);
  padding: 4px 8px 8px;
  border-bottom: 2px solid rgb(22 18 46 / 0.1);
  white-space: nowrap;
}
.admin-table :deep(td) {
  padding: 9px 8px;
  border-bottom: 1px solid rgb(22 18 46 / 0.1);
  vertical-align: middle;
}
.admin-table :deep(tbody th) {
  padding: 9px 8px;
  font-size: inherit;
  color: #16122e;
  border-bottom: 1px solid rgb(22 18 46 / 0.1);
  vertical-align: top;
  white-space: normal;
}
.admin-table :deep(tbody tr:last-child td),
.admin-table :deep(tbody tr:last-child th) {
  border-bottom: 0;
}
</style>
