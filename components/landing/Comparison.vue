<script setup>
// Only the last column is a "yes" for everything — that is the point of the table.
// 'regret' row removed 2026-10-03 (Steve: masquer toute mention à l'indice
// de regret côté front).
const rows = [
  { key: 'search', others: true },
  { key: 'ats', others: false },
  { key: 'career', others: false },
  { key: 'potential', others: false },
  { key: 'cv', others: false },
  { key: 'advice', others: false },
]
const competitors = ['LinkedIn', 'Indeed', 'Welcome to the Jungle']
</script>

<template>
  <section id="comparatif" class="px-6 py-16 lg:px-12">
    <div class="mx-auto max-w-5xl text-center">
      <div
        class="mb-3 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink"
      >
        {{ $t('landing.comparison.eyebrow') }}
      </div>
      <h2 class="mb-10 text-3xl font-black text-ink sm:text-4xl">
        {{ $t('landing.comparison.title') }}
      </h2>

      <!-- Below `sm`, the 5-column table (feature + 3 named competitors +
      Bye Bye Boss) didn't fit -- it kept its full min-width and scrolled
      horizontally inside its own box, which silently clipped the "Bye Bye
      Boss" column (the entire point of the comparison, and the only
      all-checkmarks one) out of the initial view with no hint there was
      more to scroll to. The 3 named competitors are collapsed into one
      "Autres plateformes" column below `sm` (they already show the same
      ✓/✕ per row -- `r.others` -- so nothing is lost, just condensed) so
      "Fonctionnalité" and "Bye Bye Boss" both fit without scrolling; `sm`
      and up keeps the original per-competitor table unchanged. -->
      <div
        class="overflow-x-auto rounded-[24px] border-[3px] border-ink bg-white shadow-[6px_6px_0_#16122E]"
      >
        <table class="w-full border-collapse text-left text-sm sm:min-w-[640px]">
          <thead>
            <tr class="border-b-[3px] border-ink">
              <th class="px-4 py-3.5 font-extrabold text-ink">
                {{ $t('landing.comparison.feature') }}
              </th>
              <th class="px-4 py-3.5 text-center font-semibold text-ink/60 sm:hidden">
                {{ $t('landing.comparison.others') }}
              </th>
              <th
                v-for="c in competitors"
                :key="c"
                class="hidden px-4 py-3.5 text-center font-semibold text-ink/60 sm:table-cell"
              >
                {{ c }}
              </th>
              <th class="bg-sun px-4 py-3.5 text-center font-black text-ink">Bye Bye Boss</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.key" class="border-b border-ink/15 last:border-0">
              <td class="px-4 py-3 font-medium text-ink">
                {{ $t(`landing.comparison.rows.${r.key}`) }}
              </td>
              <td class="px-4 py-3 text-center sm:hidden">
                <span v-if="r.others" class="font-black text-success-text">✓</span>
                <span v-else class="font-bold text-ink/30">✕</span>
              </td>
              <td
                v-for="c in competitors"
                :key="c"
                class="hidden px-4 py-3 text-center sm:table-cell"
              >
                <span v-if="r.others" class="font-black text-success-text">✓</span>
                <span v-else class="font-bold text-ink/30">✕</span>
              </td>
              <td class="bg-sun-light px-4 py-3 text-center">
                <span
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-success-light font-black text-ink"
                  >✓</span
                >
                <span
                  v-if="r.exclusive"
                  class="ml-1.5 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white"
                >
                  {{ $t('landing.comparison.exclusive') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
