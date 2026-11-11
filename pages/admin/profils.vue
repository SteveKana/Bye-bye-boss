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
// Availability: immediate | date (starts in N days) | notice (N months) | unavailable
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
    ['unavailable'],
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
    ['unavailable'],
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

// One short CV-style description per profile, in the same order as FAKE.
const SUMMARIES = [
  "Product Owner de 6 ans d'expérience dans le retail, à l'aise entre métiers et équipes techniques. J'anime le backlog, rédige les user stories et pilote les livraisons en Scrum et SAFe.",
  "Chef de projet IT avec 8 ans d'expérience en pilotage de projets SI de bout en bout : cadrage, planning, suivi des risques et recette. Rigoureux, je sécurise les délais et le budget.",
  'Data Analyst spécialisée dans la valorisation de la donnée commerciale. Je construis des tableaux de bord Power BI et des analyses SQL qui aident les équipes à décider plus vite.',
  "Développeur Full Stack de 5 ans d'expérience sur Vue.js et Node.js. J'aime livrer des produits utiles, propres et bien testés, au sein d'équipes agiles.",
  'Business Analyst qui traduit les besoins métier en spécifications claires. Expérience en banque et assurance : ateliers, modélisation UML, recette et accompagnement des utilisateurs.',
  "Scrum Master certifié, 4 ans de coaching d'équipes agiles. Je fais progresser la collaboration, la prévisibilité des livraisons et la qualité des cérémonies.",
  "Responsable marketing digital orientée acquisition : SEO, campagnes Google Ads et suivi des performances. J'ai doublé le trafic organique d'un site e-commerce en un an.",
  "Ingénieur DevOps passionné d'automatisation : pipelines CI/CD, conteneurs et infrastructure as code. Je fiabilise les déploiements et réduis les temps de mise en production.",
  'UX/UI Designer attachée à des interfaces simples et accessibles. Je mène des recherches utilisateurs, conçois des maquettes Figma et maintiens un design system partagé.',
  "Directeur de projet de 12 ans d'expérience sur de grands programmes de migration. Conduite du changement, pilotage budgétaire et gestion de fournisseurs multi-sites.",
  "Chargée de recrutement spécialisée dans les profils IT et data. Je source, qualifie et accompagne les candidats jusqu'à l'intégration, avec un fort sens du relationnel.",
  "Data Engineer de 7 ans d'expérience sur des plateformes de données à grande échelle. Je conçois des pipelines fiables sur Python, Spark et BigQuery.",
  "Product Manager orientée discovery et mesure d'impact. J'aligne vision produit, priorités et feuille de route avec les équipes techniques et les parties prenantes.",
  "Développeur Back-end Java de 9 ans d'expérience, spécialisé dans les API REST et les systèmes critiques. Souci constant de performance et de maintenabilité.",
  "Chef de projet digital à l'aise en méthodes agiles. Je cadre les besoins, coordonne les équipes et m'assure d'une recette sereine jusqu'à la mise en ligne.",
  "Consultant SAP finance avec 6 ans d'expérience sur des déploiements internationaux. Paramétrage, tests de recette et formation des utilisateurs clés.",
  "Business Developer à l'écoute, forte de 5 ans de prospection BtoB dans le SaaS. J'ouvre de nouveaux comptes et construis des relations durables avec les décideurs.",
  "Testeur QA passionné par la qualité logicielle. J'automatise les parcours critiques avec Cypress et je structure les campagnes de recette avec les équipes projet.",
  "Product Owner certifiée, experte du pilotage de roadmap et de la rédaction de user stories. J'apporte de la clarté aux équipes et de la valeur aux utilisateurs.",
  "Architecte Cloud de 10 ans d'expérience sur Azure et AWS. Je conçois des architectures sécurisées, évolutives et maîtrisées en coûts.",
  'Data Scientist spécialisée en machine learning et traitement du langage. Je transforme des données brutes en modèles utiles et mesurables pour le métier.',
  "Chef de projet IT expérimenté en migration et coordination multi-équipes. Je suis les jalons, anticipe les risques et fédère autour d'un planning réaliste.",
  "Développeuse Front-end sensible à l'accessibilité et à l'expérience utilisateur. J'ai de l'expérience sur Vue.js et React, et un goût prononcé pour le code propre.",
  "Responsable des systèmes d'information : stratégie, budget, relation avec les fournisseurs et gouvernance ITIL. J'aligne le SI sur les priorités de l'entreprise.",
]

const profiles = FAKE.map(([first, last, title, skills, city, dept, region, photo, avail], i) => ({
  id: i + 1,
  trigram: trigram(first, last),
  title,
  summary: SUMMARIES[i],
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

// Availability filter: the same options as in a candidate's profile
// (Immédiatement / À partir du / En poste avec préavis de 1, 2 ou 3 mois /
// Non disponible), plus "Toutes".
const AVAILABILITY_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'immediate', label: 'Immédiatement' },
  { value: 'date', label: 'À partir du' },
  { value: 'notice-1', label: 'En poste (préavis de 1 mois)' },
  { value: 'notice-2', label: 'En poste (préavis de 2 mois)' },
  { value: 'notice-3', label: 'En poste (préavis de 3 mois)' },
  { value: 'unavailable', label: 'Non disponible' },
]

function matchesAvailability(p, filter) {
  if (filter === 'all') return true
  if (filter.startsWith('notice-')) {
    return p.availability === 'notice' && p.noticeMonths === Number(filter.slice(7))
  }
  return p.availability === filter
}

const AVAILABILITY_RANK = { immediate: 0, date: 1, notice: 2, unavailable: 3 }

// Same wording as a candidate's profile ("availability.display" in the locales).
function availabilityPill(p) {
  if (p.availability === 'immediate') return { state: 'ok', text: 'Disponible immédiatement' }
  if (p.availability === 'date') {
    const day = p.availabilityDate.toLocaleDateString('fr-FR')
    return { state: 'info', text: `Disponible à partir du ${day}` }
  }
  if (p.availability === 'notice') {
    return { state: 'warn', text: `En poste (préavis de ${p.noticeMonths} mois)` }
  }
  return { state: 'bad', text: 'Non disponible' }
}

const keywords = ref('')
const zone = ref('')
const availability = ref('all')

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
    if (!matchesAvailability(p, availability.value)) continue
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

// Nothing is listed until the user has typed or chosen something.
const filtering = computed(
  () =>
    keywordTokens.value.length > 0 || zoneTokens.value.length > 0 || availability.value !== 'all'
)
function reset() {
  keywords.value = ''
  zone.value = ''
  availability.value = 'all'
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
      <div class="flex flex-wrap items-end gap-3">
        <UiInput
          id="profile-keywords"
          v-model="keywords"
          label="Poste ou compétences"
          icon="🔍"
          placeholder="Ex. product owner scrum, SQL, chef de projet…"
          class="min-w-[16rem] flex-1"
        />
        <!-- Large screens: just wide enough for its placeholder. Mobile: full width. -->
        <div class="w-full sm:w-64">
          <UiInput
            id="profile-zone"
            v-model="zone"
            label="Zone géographique"
            icon="📍"
            placeholder="Ville, département ou région"
          />
        </div>
        <div class="w-full sm:w-48">
          <UiSelect
            id="profile-availability"
            v-model="availability"
            label="Disponibilité"
            :options="AVAILABILITY_FILTERS"
          />
        </div>
      </div>

      <!-- Results: 784px, the width of the main column of a LinkedIn profile page. -->
      <div class="max-w-[784px]">
        <div v-if="filtering" class="mt-4 flex items-center justify-between gap-3">
          <p class="text-sm font-extrabold text-ink" aria-live="polite">
            {{ results.length }} profil{{ results.length > 1 ? 's' : '' }}
            <span class="font-semibold text-ink/60"> sur {{ profiles.length }} </span>
          </p>
          <button
            type="button"
            class="text-xs font-extrabold text-ink underline underline-offset-2"
            @click="reset"
          >
            Effacer la recherche
          </button>
        </div>

        <AdminEmpty v-if="filtering && !results.length" class="mt-3">
          Aucun profil ne correspond. Essaie moins de mots, ou élargis la zone ou la disponibilité.
        </AdminEmpty>

        <ul v-else-if="filtering" class="mt-3 space-y-2">
          <li
            v-for="p in results"
            :key="p.id"
            class="flex items-start gap-4 rounded-2xl border-2 border-ink bg-white p-4"
          >
            <UiAvatar
              :picture-url="p.picture"
              :initials="p.trigram"
              circle-class="h-14 w-14 text-sm font-black text-white"
            />
            <div class="min-w-0 flex-1 space-y-1.5">
              <p class="text-[11px] font-black tracking-widest text-ink/50">{{ p.trigram }}</p>
              <p class="text-base font-black leading-snug text-ink">{{ p.title }}</p>
              <p class="text-xs font-semibold text-ink/70">📍 {{ p.place }} · {{ p.region }}</p>
              <div>
                <AdminPill :state="availabilityPill(p).state" :text="availabilityPill(p).text" />
              </div>
              <p class="line-clamp-3 text-[13px] leading-relaxed text-ink/80 sm:line-clamp-none">
                {{ p.summary }}
              </p>
              <p v-if="p.matchedSkills.length" class="text-xs font-semibold text-ink/60">
                Compétences : {{ p.matchedSkills.join(', ') }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </AdminCard>
  </div>
</template>
