<script setup>
import fr from '~/data/legal/fr'
import en from '~/data/legal/en'

definePageMeta({ layout: 'legal' })

const { locale } = useI18n()
const table = computed(() => (locale.value === 'en' ? en : fr).cookies.table)
const { reopen } = useCookieConsent()
</script>

<template>
  <LegalPage doc-key="cookies">
    <template #section-liste>
      <div class="overflow-x-auto rounded-2xl border-2 border-ink">
        <table class="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead class="bg-lav text-ink">
            <tr>
              <th class="px-4 py-2.5 font-extrabold">{{ table.name }}</th>
              <th class="px-4 py-2.5 font-extrabold">{{ table.purpose }}</th>
              <th class="px-4 py-2.5 font-extrabold">{{ table.duration }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in table.rows" :key="row.name" class="border-t-2 border-ink/15">
              <td class="px-4 py-2.5 font-mono text-[13px] font-bold text-ink">{{ row.name }}</td>
              <td class="px-4 py-2.5">{{ row.purpose }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">{{ row.duration }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template #section-gerer>
      <div>
        <UiButton variant="sun" @click="reopen">🍪 {{ $t('cookies.manage') }}</UiButton>
      </div>
    </template>
  </LegalPage>
</template>
