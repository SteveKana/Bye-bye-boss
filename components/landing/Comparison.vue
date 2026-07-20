<script setup>
// Only the last column is a "yes" for everything — that is the point of the table.
const rows = [
  { key: 'search', others: true },
  { key: 'ats', others: false },
  { key: 'career', others: false },
  { key: 'potential', others: false },
  { key: 'cv', others: false },
  { key: 'regret', others: false, exclusive: true },
  { key: 'advice', others: false },
]
const competitors = ['LinkedIn', 'Indeed', 'Welcome to the Jungle']
</script>

<template>
  <section id="comparatif" class="px-6 py-16 lg:px-12">
    <div class="mx-auto max-w-5xl text-center">
      <div class="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand">
        {{ $t('landing.comparison.eyebrow') }}
      </div>
      <h2 class="mb-10 text-3xl font-extrabold text-navy">{{ $t('landing.comparison.title') }}</h2>

      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
        <table class="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="px-4 py-3.5 font-semibold text-gray-600">
                {{ $t('landing.comparison.feature') }}
              </th>
              <th
                v-for="c in competitors"
                :key="c"
                class="px-4 py-3.5 text-center font-semibold text-gray-500"
              >
                {{ c }}
              </th>
              <th class="bg-brand-light px-4 py-3.5 text-center font-bold text-brand">
                Bye Bye Boss
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.key" class="border-b border-gray-100 last:border-0">
              <td class="px-4 py-3 text-gray-700">{{ $t(`landing.comparison.rows.${r.key}`) }}</td>
              <td v-for="c in competitors" :key="c" class="px-4 py-3 text-center">
                <span v-if="r.others" class="font-bold text-success-text">✓</span>
                <span v-else class="font-bold text-gray-300">✕</span>
              </td>
              <td class="bg-brand-light px-4 py-3 text-center">
                <span class="font-bold text-success-text">✓</span>
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
