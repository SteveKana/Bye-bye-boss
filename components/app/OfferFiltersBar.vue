<script setup>
// Contrat / Télétravail / Localisation / Salaire filters of the Dashboard
// (state lives in useDashboardFilters, passed as `filters`). Pre-filled from
// the saved preferences; removing a chip never changes those preferences.
defineProps({
  filters: { type: Object, required: true },
})

const inputClass =
  'w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-medium text-ink placeholder:text-ink/40'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <AppFilterMenu
        :label="$t('opportunites.contract_filter')"
        :count="filters.contracts.value.length"
      >
        <div class="flex flex-col gap-2.5">
          <UiCheckbox
            v-for="c in CONTRACT_CHOICES"
            :key="c"
            :model-value="filters.contracts.value.includes(c)"
            :label="$t(`searchFilters.contracts.${c}`)"
            @update:model-value="filters.toggle(filters.contracts, c)"
          />
        </div>
      </AppFilterMenu>

      <AppFilterMenu
        :label="$t('opportunites.remote_filter')"
        :count="filters.remotes.value.length"
      >
        <div class="flex flex-col gap-2.5">
          <UiCheckbox
            v-for="r in REMOTE_CHOICES"
            :key="r"
            :model-value="filters.remotes.value.includes(r)"
            :label="$t(`searchFilters.remotes.${r}`)"
            @update:model-value="filters.toggle(filters.remotes, r)"
          />
        </div>
      </AppFilterMenu>

      <AppFilterMenu
        :label="$t('opportunites.location_filter')"
        :count="filters.regions.value.length"
      >
        <div class="flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
          <UiCheckbox
            v-for="r in REGION_CHOICES"
            :key="r"
            :model-value="filters.regions.value.includes(r)"
            :label="r === OVERSEAS_CHOICE ? $t('searchFilters.overseas') : r"
            @update:model-value="filters.toggle(filters.regions, r)"
          />
        </div>
        <div class="mt-3 border-t border-ink/15 pt-3">
          <UiCheckbox
            :model-value="filters.includeUnknownRegion.value"
            :label="$t('searchFilters.unknown_region')"
            @update:model-value="filters.setValue(filters.includeUnknownRegion, $event)"
          />
        </div>
      </AppFilterMenu>

      <AppFilterMenu
        :label="$t('opportunites.salary_button')"
        :count="Number(filters.salaryMin.value > 0) + Number(filters.tjmMin.value > 0)"
      >
        <div class="flex flex-col gap-3">
          <label class="flex flex-col gap-1 text-xs font-bold text-ink">
            {{ $t('searchFilters.salary_min') }}
            <input
              :value="filters.salaryMin.value || ''"
              type="number"
              min="0"
              step="1000"
              :class="inputClass"
              placeholder="45000"
              @input="filters.setValue(filters.salaryMin, Number($event.target.value) || 0)"
            />
          </label>
          <label class="flex flex-col gap-1 text-xs font-bold text-ink">
            {{ $t('searchFilters.tjm_min') }}
            <input
              :value="filters.tjmMin.value || ''"
              type="number"
              min="0"
              step="50"
              :class="inputClass"
              placeholder="500"
              @input="filters.setValue(filters.tjmMin, Number($event.target.value) || 0)"
            />
          </label>
          <p class="text-[11px] leading-snug text-ink/50">{{ $t('searchFilters.salary_hint') }}</p>
        </div>
      </AppFilterMenu>
    </div>

    <div v-if="filters.chips.value.length" class="mt-3 flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-ink/60">{{ $t('opportunites.active') }}</span>
      <span
        v-for="chip in filters.chips.value"
        :key="chip.key"
        class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-lav px-3 py-1 text-xs font-bold text-ink"
      >
        {{ chip.label }}
        <button
          type="button"
          class="text-brand/60 hover:text-brand"
          :aria-label="$t('opportunites.remove_filter', { label: chip.label })"
          @click="chip.clear()"
        >
          ✕
        </button>
      </span>
      <button
        type="button"
        class="text-xs font-semibold text-brand hover:underline"
        @click="filters.reset()"
      >
        {{ $t('opportunites.clear_all') }}
      </button>
    </div>
  </div>
</template>
