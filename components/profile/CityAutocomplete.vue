<script setup>
// Free, no-key French government API for commune lookup -- a good fit since
// the product targets the French market exclusively. Debounced client-side
// fetch; no backend involvement needed.
//
// Only a value picked from the suggestion list can be committed -- typing
// free text that doesn't match a real commune (e.g. a typo) reverts to the
// last valid value on blur, rather than silently saving a place that
// doesn't exist.
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'commit'])

const query = ref(props.modelValue)
const suggestions = ref([])
const open = ref(false)
let debounceTimer = null

watch(
  () => props.modelValue,
  (v) => (query.value = v)
)

async function search(term) {
  if (term.trim().length < 2) {
    suggestions.value = []
    return
  }
  try {
    const params = `nom=${encodeURIComponent(term)}&fields=nom,codesPostaux&boost=population&limit=8`
    // Paris, Lyon and Marseille are split into arrondissements, which the
    // API treats as a separate type -- fetched alongside the regular
    // commune search so e.g. "Paris 15" resolves to a real match instead
    // of just falling back to plain "Paris".
    const [communes, arrondissements] = await Promise.all([
      fetch(`https://geo.api.gouv.fr/communes?${params}`),
      fetch(`https://geo.api.gouv.fr/communes?${params}&type=arrondissement-municipal`),
    ])
    if (!communes.ok) throw new Error('geo api error')
    const communesData = await communes.json()
    const arrondissementsData = arrondissements.ok ? await arrondissements.json() : []

    const seen = new Set()
    suggestions.value = [...communesData, ...arrondissementsData]
      .filter((c) => (seen.has(c.nom) ? false : seen.add(c.nom)))
      .slice(0, 8)
      .map((c) => ({ label: c.nom, postal: c.codesPostaux?.[0] || '' }))
  } catch {
    // Network hiccup or the public API being down -- suggestions stay
    // empty, and the blur-revert rule below still protects against saving
    // an unverified place name.
    suggestions.value = []
  }
}

function onInput(event) {
  const value = event.target.value
  query.value = value
  open.value = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(value), 250)
}

function select(s) {
  query.value = s.label
  emit('update:modelValue', s.label)
  emit('commit', s.label)
  open.value = false
  suggestions.value = []
}

function onBlur() {
  // Slight delay so a click on a suggestion registers before the list closes.
  setTimeout(() => {
    open.value = false
    // Anything other than clearing the field or the value already saved
    // isn't a real, chosen commune -- discard it instead of persisting a
    // typo like "Pari".
    if (query.value !== props.modelValue && query.value.trim() !== '') {
      query.value = props.modelValue
    } else if (query.value.trim() === '' && props.modelValue) {
      emit('update:modelValue', '')
      emit('commit', '')
    }
  }, 150)
}
</script>

<template>
  <div class="relative max-w-xs">
    <input
      type="text"
      :value="query"
      :placeholder="placeholder"
      class="w-full rounded-md border-[1.5px] border-gray-200 px-3 py-2 text-[13.5px] text-gray-900 outline-none focus:border-brand focus:shadow-focus-ring"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
    />
    <ul
      v-if="open && suggestions.length"
      class="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-card"
    >
      <li
        v-for="s in suggestions"
        :key="s.label + s.postal"
        class="cursor-pointer px-3 py-2 text-[13.5px] hover:bg-brand-light"
        @mousedown.prevent="select(s)"
      >
        {{ s.label }} <span class="text-gray-400">{{ s.postal }}</span>
      </li>
    </ul>
  </div>
</template>
