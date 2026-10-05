<script setup>
// Renders a legal document from data/legal/{fr,en}.js. Static, trusted
// content: inline **bold** and [label](url) are converted after escaping.
import fr from '~/data/legal/fr'
import en from '~/data/legal/en'

const props = defineProps({
  docKey: { type: String, required: true }, // 'legal' | 'privacy' | 'cookies'
})

const { locale, t } = useI18n()
const doc = computed(() => (locale.value === 'en' ? en : fr)[props.docKey])

useHead({ title: computed(() => `${doc.value.title} — Bye Bye Boss`) })

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-extrabold text-ink">$1</strong>')
    .replace(
      /\[([^\]]+)\]\(((?:\/|https:\/\/|mailto:)[^)\s]*)\)/g,
      (_, label, url) =>
        `<a href="${url}" class="font-bold text-brand underline underline-offset-2 hover:text-brand-dark"${
          url.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>${label}</a>`
    )
}
</script>

<!-- eslint-disable vue/no-v-html -- static texts from data/legal, escaped in inline() -->
<template>
  <article class="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
    <header class="mb-8">
      <h1 class="text-3xl font-black leading-tight text-ink sm:text-4xl">{{ doc.title }}</h1>
      <p
        class="mt-3 text-base font-medium leading-relaxed text-ink/70"
        v-html="inline(doc.intro)"
      />
      <p class="mt-3 text-sm font-bold text-ink/50">{{ t('legal.updated') }} {{ doc.updated }}</p>
    </header>

    <div class="flex flex-col gap-5">
      <section
        v-for="s in doc.sections"
        :id="s.id"
        :key="s.id"
        class="rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[4px_4px_0_#16122E] sm:p-7"
      >
        <h2 class="text-xl font-black text-ink">{{ s.title }}</h2>
        <div class="mt-3 flex flex-col gap-3 text-[15px] font-medium leading-relaxed text-ink/80">
          <template v-for="(b, i) in s.blocks" :key="i">
            <ul v-if="typeof b === 'object'" class="flex list-disc flex-col gap-2 pl-5">
              <li v-for="(li, j) in b.list" :key="j" v-html="inline(li)" />
            </ul>
            <p v-else v-html="inline(b)" />
          </template>
          <slot :name="`section-${s.id}`" :doc="doc" />
        </div>
      </section>
    </div>
  </article>
</template>
