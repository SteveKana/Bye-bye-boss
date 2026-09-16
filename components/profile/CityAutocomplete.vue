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
const { t } = useI18n()

const query = ref(props.modelValue)
const suggestions = ref([])
const open = ref(false)
let debounceTimer = null

watch(
  () => props.modelValue,
  (v) => (query.value = v)
)

// Paris, Lyon and Marseille are the only French cities split into
// arrondissements. Fuzzy-searching arrondissements by name (as originally
// tried) only surfaces whichever ones the API's relevance ranking deems
// closest -- an incomplete, inconsistent list. Fetching the full,
// deterministic set for the matching department (each department contains
// only that city's arrondissements once filtered by type) and then
// filtering by any number the user typed is both complete and reliable.
// Cached per department so retyping doesn't refetch the same ~20 rows.
const ARRONDISSEMENT_CITIES = { paris: '75', lyon: '69', marseille: '13' }
const arrondissementCache = {}

function matchArrondissementCity(term) {
  const leading = term
    .trim()
    .toLowerCase()
    .match(/^[a-zàâäéèêëïîôöùûüç-]+/)?.[0]
  if (!leading) return null
  return Object.keys(ARRONDISSEMENT_CITIES).find(
    (city) => city.startsWith(leading) || leading.startsWith(city)
  )
}

async function fetchArrondissements(cityKey) {
  if (arrondissementCache[cityKey]) return arrondissementCache[cityKey]
  const dept = ARRONDISSEMENT_CITIES[cityKey]
  const res = await fetch(
    `https://geo.api.gouv.fr/communes?type=arrondissement-municipal&codeDepartement=${dept}&fields=nom,codesPostaux`
  )
  const data = res.ok ? await res.json() : []
  arrondissementCache[cityKey] = data
  return data
}

async function search(term) {
  if (term.trim().length < 2) {
    suggestions.value = []
    return
  }
  try {
    const cityKey = matchArrondissementCity(term)

    if (cityKey) {
      // Once it's clear the person means Paris/Lyon/Marseille, drop the
      // fuzzy substring noise (e.g. "Parisot", "Cormeilles-en-Parisis")
      // entirely and show only the city itself, followed by its
      // arrondissements in numeric order -- anything else here is noise,
      // not a real option worth scrolling past.
      const number = term.match(/(\d+)/)?.[1]
      const [communesRes, all] = await Promise.all([
        fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityKey)}&fields=nom,codesPostaux&limit=1`
        ),
        fetchArrondissements(cityKey),
      ])
      const parentData = communesRes.ok ? await communesRes.json() : []
      // Showing the first of Paris's 20 postal codes (75001) next to the
      // generic "Paris" entry made it look like a duplicate of "Paris 1er
      // Arrondissement 75001" -- they read as the same thing at a glance.
      // Labelling this one explicitly as covering every arrondissement
      // removes that ambiguity instead of just hiding the postal code.
      const parent = parentData.map((c) => ({
        label: `${c.nom} (${t('location.all_districts')})`,
        value: c.nom,
        postal: '',
      }))
      const arrondissementNumber = (nom) => parseInt(nom.match(/(\d+)/)?.[1] || '999', 10)
      const arrondissements = (number ? all.filter((c) => c.nom.includes(number)) : all)
        .slice()
        .sort((a, b) => arrondissementNumber(a.nom) - arrondissementNumber(b.nom))
        .map((c) => ({ label: c.nom, value: c.nom, postal: c.codesPostaux?.[0] || '' }))

      suggestions.value = [...parent, ...arrondissements]
      return
    }

    const communesRes = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(term)}&fields=nom,codesPostaux&boost=population&limit=8`
    )
    if (!communesRes.ok) throw new Error('geo api error')
    const results = await communesRes.json()

    const seen = new Set()
    suggestions.value = results
      .filter((c) => (seen.has(c.nom) ? false : seen.add(c.nom)))
      .slice(0, 20)
      .map((c) => ({ label: c.nom, value: c.nom, postal: c.codesPostaux?.[0] || '' }))
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
  query.value = s.value
  emit('update:modelValue', s.value)
  emit('commit', s.value)
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
      class="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-card"
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
