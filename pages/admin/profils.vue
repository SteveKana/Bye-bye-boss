<script setup>
// Admin > Recherche de profils (MAQUETTE): what a sales ("pro") user would see
// to find candidates by keywords (job title or skills) and by area. The list
// follows the typing. The profiles below are INVENTED -- nothing comes from the
// database yet -- and names are shown as trigrams (3 letters), never in full.
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({
  title: 'Monitoring · Recherche de profils — Bye Bye Boss',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const DAY = 24 * 60 * 60 * 1000
// Availability: immediate | date (starts in `inDays`) | notice (`months`) | no
const FAKE = [
  [
    'Camille',
    'Durand',
    'Product Owner',
    ['Scrum', 'Backlog', 'Jira', 'SAFe'],
    'Lille',
    '59',
    'Hauts-de-France',
    'women/44',
    ['immediate'],
  ],
  [
    'Karim',
    'Benali',
    'Chef de projet IT',
    ['Pilotage', 'Planning', 'Risques', 'MOA'],
    'Paris',
    '75',
    'Île-de-France',
    'men/32',
    ['notice', 3],
  ],
  [
    'Sophie',
    'Martin',
    'Data Analyst',
    ['SQL', 'Power BI', 'Python', 'Excel'],
    'Lyon',
    '69',
    'Auvergne-Rhône-Alpes',
    'women/68',
    ['immediate'],
  ],
  [
    'Thomas',
    'Lefèvre',
    'Développeur Full Stack',
    ['Vue.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
    'Nantes',
    '44',
    'Pays de la Loire',
    'men/75',
    ['date', 21],
  ],
  [
    'Inès',
    'Haddad',
    'Business Analyst',
    ['Recueil du besoin', 'UML', 'SQL', 'Recette'],
    'Paris',
    '75',
    'Île-de-France',
    'women/12',
    ['notice', 1],
  ],
  [
    'Julien',
    'Moreau',
    'Scrum Master',
    ['Scrum', 'Kanban', 'Coaching', 'Jira'],
    'Bordeaux',
    '33',
    'Nouvelle-Aquitaine',
    'men/41',
    ['immediate'],
  ],
  [
    'Aïcha',
    'Diallo',
    'Responsable Marketing Digital',
    ['SEO', 'Google Ads', 'CRM', 'Analytics'],
    'Saint-Ouen',
    '93',
    'Île-de-France',
    'women/90',
    ['date', 45],
  ],
  [
    'Nicolas',
    'Garnier',
    'Ingénieur DevOps',
    ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    'Toulouse',
    '31',
    'Occitanie',
    'men/18',
    ['notice', 2],
  ],
  [
    'Léa',
    'Petit',
    'UX/UI Designer',
    ['Figma', 'Design system', 'Recherche utilisateur'],
    'Marseille',
    '13',
    "Provence-Alpes-Côte d'Azur",
    'women/33',
    ['immediate'],
  ],
  [
    'Mehdi',
    'Cherif',
    'Directeur de projet',
    ['Conduite du changement', 'Budget', 'Migration', 'Pilotage'],
    'Paris',
    '75',
    'Île-de-France',
    'men/52',
    ['no'],
  ],
  [
    'Chloé',
    'Rousseau',
    'Chargée de recrutement IT',
    ['Sourcing', 'Entretiens', 'LinkedIn Recruiter'],
    'Rennes',
    '35',
    'Bretagne',
    'women/21',
    ['date', 14],
  ],
  [
    'Antoine',
    'Bernard',
    'Data Engineer',
    ['Python', 'Spark', 'Airflow', 'BigQuery'],
    'Lyon',
    '69',
    'Auvergne-Rhône-Alpes',
    'men/66',
    ['notice', 3],
  ],
  [
    'Fatou',
    'Ndiaye',
    'Product Manager',
    ['Roadmap', 'Discovery', 'Priorisation', 'Analytics'],
    'Paris',
    '75',
    'Île-de-France',
    'women/57',
    ['immediate'],
  ],
  [
    'Hugo',
    'Lambert',
    'Développeur Back-end Java',
    ['Java', 'Spring', 'API REST', 'Oracle'],
    'Strasbourg',
    '67',
    'Grand Est',
    'men/9',
    ['notice', 2],
  ],
  [
    'Marion',
    'Fontaine',
    'Chef de projet digital',
    ['Agile', 'Cadrage', 'Recette', 'Reporting'],
    'Montpellier',
    '34',
    'Occitanie',
    'women/8',
    ['date', 30],
  ],
  [
    'Yanis',
    'Mansouri',
    'Consultant SAP',
    ['SAP', 'Finance', 'Paramétrage', 'Recette'],
    'Lille',
    '59',
    'Hauts-de-France',
    'men/27',
    ['immediate'],
  ],
  [
    'Emma',
    'Girard',
    'Business Developer',
    ['Prospection', 'Négociation', 'CRM', 'Salesforce'],
    'Nice',
    '06',
    "Provence-Alpes-Côte d'Azur",
    'women/79',
    ['immediate'],
  ],
  [
    'Paul',
    'Rey',
    'Testeur / QA',
    ['Cypress', 'Tests de recette', 'Jira', 'Postman'],
    'Nantes',
    '44',
    'Pays de la Loire',
    'men/84',
    ['notice', 1],
  ],
  [
    'Sarah',
    'Cohen',
    'Product Owner',
    ['User stories', 'Scrum', 'Confluence', 'Roadmap'],
    'Paris',
    '75',
    'Île-de-France',
    'women/65',
    ['date', 10],
  ],
  [
    'Maxime',
    'Roux',
    'Architecte Cloud',
    ['Azure', 'AWS', 'Terraform', 'Sécurité'],
    'Lyon',
    '69',
    'Auvergne-Rhône-Alpes',
    'men/3',
    ['no'],
  ],
  [
    'Océane',
    'Vidal',
    'Data Scientist',
    ['Python', 'Machine learning', 'SQL', 'NLP'],
    'Toulouse',
    '31',
    'Occitanie',
    'women/26',
    ['notice', 3],
  ],
  [
    'Samir',
    'Belkacem',
    'Chef de projet IT',
    ['Migration', 'Planning', 'Jalons', 'Coordination'],
    'Saint-Denis',
    '93',
    'Île-de-France',
    'men/60',
    ['immediate'],
  ],
  [
    'Pauline',
    'Colin',
    'Développeuse Front-end',
    ['Vue.js', 'React', 'CSS', 'Accessibilité'],
    'Bordeaux',
    '33',
    'Nouvelle-Aquitaine',
    'women/15',
    ['date', 28],
  ],
  [
    'Romain',
    'Faure',
    'Responsable SI',
    ['Budget', 'Pilotage', 'ITIL', 'Fournisseurs'],
    'Rennes',
    '35',
    'Bretagne',
    'men/47',
    ['notice', 3],
  ],
]

function plain(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// Trigram: first letter of the first name + first two letters of the last name
// ("Steve Kana" -> "SKA"). Accents and spaces ignored.
function trigram(first, last) {
  const f = plain(first).replace(/[^a-z]/g, '')
  const l = plain(last).replace(/[^a-z]/g, '')
  return (f.slice(0, 1) + l.slice(0, 2)).toUpperCase()
}

const profiles = FAKE.map(([first, last, title, skills, city, dept, region, photo, avail], i) => ({
  id: i + 1,
  trigram: trigram(first, last),
  title,
  skills,
  city,
  dept,
  region,
  place: `${city} (${dept})`,
  picture: `https://randomuser.me/api/portraits/${photo}.jpg`,
  availability: avail[0],
  availabilityDate: avail[0] === 'date' ? new Date(Date.now() + avail[1] * DAY) : null,
  noticeMonths: avail[0] === 'notice' ? avail[1] : 0,
}))

const AVAILABILITY_RANK = { immediate: 0, date: 1, notice: 2, no: 3 }

function availabilityPill(p) {
  if (p.availability === 'immediate') return { state: 'ok', text: 'Disponible immédiatement' }
  if (p.availability === 'date') {
    const day = p.availabilityDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    return { state: 'info', text: `Disponible le ${day}` }
  }
  if (p.availability === 'notice') {
    return { state: 'warn', text: `Préavis de ${p.noticeMonths} mois` }
  }
  return { state: 'bad', text: 'Non disponible' }
}

const keywords = ref('')
const zone = ref('')

const keywordTokens = computed(() =>
  plain(keywords.value)
    .split(/[\s,;]+/)
    .filter(Boolean)
)
const zoneTokens = computed(() =>
  plain(zone.value)
    .split(/[\s,;]+/)
    .filter(Boolean)
)

// A profile matches when EVERY typed word is found in its job title or skills
// (so adding a word narrows the list) and every zone word in its city,
// department or region. A title match ranks above a skill-only match.
const results = computed(() => {
  const found = []
  for (const p of profiles) {
    const place = plain(`${p.city} ${p.dept} ${p.region}`)
    if (!zoneTokens.value.every((t) => place.includes(t))) continue
    const title = plain(p.title)
    const skills = p.skills.map((s) => ({ label: s, plain: plain(s) }))
    let score = 0
    const matchedSkills = new Set()
    let ok = true
    for (const t of keywordTokens.value) {
      const inTitle = title.includes(t)
      const hit = skills.filter((s) => s.plain.includes(t))
      if (!inTitle && !hit.length) {
        ok = false
        break
      }
      score += inTitle ? 2 : 1
      if (!inTitle) hit.forEach((s) => matchedSkills.add(s.label))
    }
    if (ok) found.push({ ...p, score, matchedSkills: [...matchedSkills] })
  }
  return found.sort(
    (a, b) =>
      b.score - a.score ||
      AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability] ||
      a.id - b.id
  )
})

const filtering = computed(() => keywordTokens.value.length > 0 || zoneTokens.value.length > 0)
function reset() {
  keywords.value = ''
  zone.value = ''
}
</script>

<template>
  <div>
    <AdminHeader />

    <AdminNotice tone="warn" class="mb-3">
      Maquette : les {{ profiles.length }} profils ci-dessous sont inventés, rien ne vient de la
      base de données. Les noms sont remplacés par des trigrammes.
    </AdminNotice>

    <AdminCard
      title="Recherche de profils"
      subtitle="Un poste ou des compétences, et une zone : la liste se met à jour pendant que tu tapes"
    >
      <div class="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <UiInput
          id="profile-keywords"
          v-model="keywords"
          label="Poste ou compétences"
          icon="🔍"
          placeholder="Ex. product owner scrum, SQL, chef de projet…"
        />
        <UiInput
          id="profile-zone"
          v-model="zone"
          label="Zone géographique"
          icon="📍"
          placeholder="Ville, département ou région"
        />
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="text-sm font-extrabold text-ink" aria-live="polite">
          {{ results.length }} profil{{ results.length > 1 ? 's' : '' }}
          <span v-if="filtering" class="font-semibold text-ink/60">
            sur {{ profiles.length }}
          </span>
        </p>
        <button
          v-if="filtering"
          type="button"
          class="text-xs font-extrabold text-ink underline underline-offset-2"
          @click="reset"
        >
          Effacer la recherche
        </button>
      </div>

      <AdminEmpty v-if="!results.length" class="mt-3">
        Aucun profil ne correspond. Essaie moins de mots, ou élargis la zone.
      </AdminEmpty>

      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="p in results"
          :key="p.id"
          class="flex flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <UiAvatar
              :picture-url="p.picture"
              :initials="p.trigram"
              circle-class="h-14 w-14 text-sm font-black text-white"
            />
            <div class="min-w-0">
              <p class="text-[11px] font-black tracking-widest text-ink/50">{{ p.trigram }}</p>
              <p class="text-sm font-black leading-snug text-ink">{{ p.title }}</p>
              <p v-if="p.matchedSkills.length" class="mt-0.5 text-xs font-semibold text-ink/60">
                Compétences : {{ p.matchedSkills.join(', ') }}
              </p>
            </div>
          </div>
          <p class="text-xs font-semibold text-ink/70 sm:w-64">
            📍 {{ p.place }}
            <span class="block text-ink/55">{{ p.region }}</span>
          </p>
          <div class="sm:w-56">
            <AdminPill :state="availabilityPill(p).state" :text="availabilityPill(p).text" />
          </div>
        </li>
      </ul>
    </AdminCard>
  </div>
</template>
