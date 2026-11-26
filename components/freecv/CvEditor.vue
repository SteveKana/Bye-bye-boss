<script setup>
// The adapted CV as a document the visitor reads and edits in place, with no
// restriction: every text is editable, every line can be added or deleted
// (experiences, skills, education, languages, certifications). Highlights show
// what the AI changed; editing a passage means the visitor has read it, so its
// highlight goes away. The CV lives in the store: nothing is sent anywhere
// until the visitor asks for the PDF.
const store = useFreeCvStore()
const cv = computed(() => store.result)

const newSkill = ref('')

function reviewedKey(key) {
  store.reviewed[key] = true
  store.persist()
}
function editBullet(bullet) {
  if (bullet.status !== 'unchanged') bullet.status = 'unchanged'
}
function addBullet(exp) {
  exp.bullets.push({ text: '', status: 'unchanged', original_text: null, why: '', context: false })
}
function removeBullet(exp, index) {
  exp.bullets.splice(index, 1)
}
function addSkill() {
  const label = newSkill.value.trim()
  newSkill.value = ''
  if (!label) return
  if (!cv.value.skills.some((s) => s.skill.toLowerCase() === label.toLowerCase())) {
    cv.value.skills.push({ skill: label, added: false, category: '' })
  }
}

const LABEL = 'text-[12px] font-black uppercase tracking-[0.1em] text-brand'
const ROW_BUTTON =
  'shrink-0 rounded-full border-2 border-ink/20 px-2.5 py-1 text-xs font-semibold text-ink/60 hover:border-danger hover:text-danger'
const ADD_BUTTON =
  'w-fit rounded-full border-2 border-dashed border-ink/30 px-3 py-1 text-xs font-bold text-ink/60 hover:border-brand hover:text-brand'

function bulletClass(status) {
  if (status === 'added') return 'bg-sun-light'
  if (status === 'modified') return 'bg-lav'
  return ''
}

// Everything the visitor types is saved in this tab as they go.
watch(cv, () => store.persist(), { deep: true })
</script>

<template>
  <div
    v-if="cv"
    class="flex min-w-0 flex-col gap-[26px] rounded-[26px] border-[3px] border-ink bg-white p-5 shadow-[8px_8px_0_#16122E] sm:px-12 sm:py-10"
  >
    <div
      class="flex items-center gap-2.5 rounded-[14px] border-2 border-ink bg-[#F3F1FF] px-3.5 py-2.5 text-sm font-semibold text-ink/80"
    >
      <span aria-hidden="true">✏️</span>
      <span>{{ $t('freecv.result.edit_hint') }}</span>
    </div>

    <!-- Identity -->
    <div class="flex flex-col gap-1.5 border-b-[3px] border-ink pb-4">
      <div class="flex flex-wrap gap-x-1 text-[30px] font-black tracking-[-0.4px] text-ink">
        <FreecvEditableText
          v-model="cv.first_name"
          single
          class="!w-auto min-w-[3ch] flex-1"
          :aria-label="$t('common.first_name')"
          :placeholder="$t('common.first_name')"
        />
        <FreecvEditableText
          v-model="cv.last_name"
          single
          class="!w-auto min-w-[3ch] flex-1"
          :aria-label="$t('common.last_name')"
          :placeholder="$t('common.last_name')"
        />
      </div>
      <div
        class="w-fit max-w-full rounded-lg text-lg font-extrabold text-brand"
        :class="store.reviewed.headline ? '' : 'bg-lav'"
      >
        <FreecvEditableText
          v-model="cv.headline"
          single
          :aria-label="$t('freecv.result.section_profile')"
          @edit="reviewedKey('headline')"
        />
      </div>
      <div class="flex flex-wrap items-center gap-x-1 text-[13px] font-medium text-ink/70">
        <FreecvEditableText
          v-model="cv.location"
          single
          class="!w-auto min-w-[8ch] flex-1"
          :aria-label="$t('onboarding.verification.location')"
          :placeholder="$t('onboarding.verification.location')"
        />
        <span aria-hidden="true">·</span>
        <FreecvEditableText
          v-model="cv.email"
          single
          class="!w-auto min-w-[14ch] flex-[2]"
          :aria-label="$t('common.email')"
          :placeholder="$t('common.email')"
        />
        <span aria-hidden="true">·</span>
        <FreecvEditableText
          v-model="cv.phone"
          single
          class="!w-auto min-w-[10ch] flex-1"
          aria-label="Tel."
          placeholder="Tel."
        />
      </div>
    </div>

    <!-- Profile -->
    <section class="flex flex-col gap-2">
      <h3 :class="LABEL">{{ $t('freecv.result.section_profile') }}</h3>
      <div
        class="rounded-lg text-[14px] leading-[1.65]"
        :class="store.reviewed.summary ? '' : 'bg-lav'"
      >
        <FreecvEditableText
          v-model="cv.summary"
          :aria-label="$t('freecv.result.section_profile')"
          @edit="reviewedKey('summary')"
        />
      </div>
      <p v-if="cv.summary_why" class="text-[12.5px] font-medium text-ink/60">
        {{
          $t('freecv.result.why_summary', { why: cv.summary_why.replace(/^Pourquoi\s*:\s*/i, '') })
        }}
      </p>
    </section>

    <!-- Experiences -->
    <section class="flex flex-col gap-4">
      <h3 :class="LABEL">{{ $t('freecv.result.section_experiences') }}</h3>

      <div v-for="(exp, i) in cv.experiences" :key="i" class="flex flex-col gap-2">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3">
          <div class="min-w-[200px] flex-1 text-base font-extrabold">
            <FreecvEditableText v-model="exp.title" single :aria-label="exp.title" />
          </div>
          <div class="flex items-baseline gap-1 text-[13px] font-medium text-ink/60">
            <FreecvEditableText
              v-model="exp.company"
              single
              class="!w-auto min-w-[10ch]"
              :aria-label="exp.company"
            />
            <span aria-hidden="true">·</span>
            <FreecvEditableText
              v-model="exp.period"
              single
              class="!w-auto min-w-[8ch]"
              :aria-label="exp.period"
            />
          </div>
        </div>

        <ul class="flex flex-col gap-1.5 pl-1">
          <li v-for="(bullet, j) in exp.bullets" :key="j" class="group flex items-start gap-2.5">
            <span
              v-if="!bullet.context"
              class="font-black leading-[1.65] text-brand"
              aria-hidden="true"
            >
              •
            </span>
            <div
              class="min-w-0 flex-1 rounded-md text-[14px] leading-[1.65]"
              :class="bulletClass(bullet.status)"
            >
              <FreecvEditableText
                v-model="bullet.text"
                :placeholder="$t('freecv.result.placeholder_line')"
                :aria-label="`${exp.title} · ${j + 1}`"
                @edit="editBullet(bullet)"
              />
            </div>
            <span
              v-if="bullet.status === 'modified'"
              class="mt-0.5 whitespace-nowrap rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-brand-dark"
            >
              {{ $t('freecv.result.pill_modified') }}
            </span>
            <span
              v-else-if="bullet.status === 'added'"
              class="mt-0.5 whitespace-nowrap rounded-full border-2 border-ink bg-sun px-2.5 py-0.5 text-[11px] font-extrabold"
            >
              {{ $t('freecv.result.pill_added') }}
            </span>
            <button
              type="button"
              :class="ROW_BUTTON"
              :aria-label="$t('freecv.result.remove_line')"
              :title="$t('freecv.result.remove_line')"
              @click="removeBullet(exp, j)"
            >
              ×
            </button>
          </li>
        </ul>
        <button type="button" :class="ADD_BUTTON" @click="addBullet(exp)">
          + {{ $t('freecv.result.add_line') }}
        </button>
      </div>
    </section>

    <!-- Skills -->
    <section class="flex flex-col gap-2">
      <h3 :class="LABEL">{{ $t('freecv.result.section_skills') }}</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(s, i) in cv.skills"
          :key="i"
          class="inline-flex items-center gap-1 rounded-full border-2 border-ink py-0.5 pl-3 pr-1.5 text-[13px] font-semibold"
          :class="s.added ? 'bg-sun-light' : 'bg-white'"
        >
          <FreecvEditableText
            v-model="s.skill"
            single
            class="!w-auto min-w-[4ch] !px-0"
            :style="{ width: `${Math.max(s.skill.length, 4) + 1}ch` }"
            :aria-label="s.skill"
            @edit="s.added = false"
          />
          <button
            type="button"
            class="font-black text-ink/50 hover:text-danger"
            :aria-label="$t('freecv.result.remove_skill', { name: s.skill })"
            @click="cv.skills.splice(i, 1)"
          >
            ×
          </button>
        </span>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newSkill"
          type="text"
          :placeholder="$t('freecv.result.add_skill')"
          :aria-label="$t('freecv.result.add_skill')"
          class="w-full max-w-xs rounded-xl border-2 border-ink/20 bg-white px-3 py-1.5 text-[13px] text-ink outline-none focus:border-brand"
          @keydown.enter.prevent="addSkill"
        />
        <UiButton variant="secondary" size="sm" :disabled="!newSkill.trim()" @click="addSkill">
          {{ $t('freecv.result.add_row') }}
        </UiButton>
      </div>
    </section>

    <!-- Education -->
    <section class="flex flex-col gap-2">
      <h3 :class="LABEL">{{ $t('freecv.result.section_formations') }}</h3>
      <div v-for="(f, i) in cv.formations" :key="i" class="flex items-start gap-2">
        <div class="min-w-0 flex-[2] text-[14px] font-bold">
          <FreecvEditableText
            v-model="f.title"
            :placeholder="$t('freecv.result.placeholder_formation')"
          />
        </div>
        <div class="min-w-0 flex-1 text-[13px] text-ink/70">
          <FreecvEditableText
            v-model="f.school_period"
            :placeholder="$t('freecv.result.placeholder_formation_meta')"
          />
        </div>
        <button
          type="button"
          :class="ROW_BUTTON"
          :aria-label="$t('freecv.result.remove_row')"
          @click="cv.formations.splice(i, 1)"
        >
          ×
        </button>
      </div>
      <button
        type="button"
        :class="ADD_BUTTON"
        @click="cv.formations.push({ title: '', school_period: '' })"
      >
        + {{ $t('freecv.result.add_row') }}
      </button>
    </section>

    <!-- Languages -->
    <section class="flex flex-col gap-2">
      <h3 :class="LABEL">{{ $t('freecv.result.section_languages') }}</h3>
      <div v-for="(l, i) in cv.languages" :key="i" class="flex items-start gap-2">
        <div class="min-w-0 flex-1 text-[14px] font-bold">
          <FreecvEditableText
            v-model="l.name"
            single
            :placeholder="$t('freecv.result.placeholder_language')"
          />
        </div>
        <div class="min-w-0 flex-1 text-[13px] text-ink/70">
          <FreecvEditableText
            v-model="l.level"
            single
            :placeholder="$t('freecv.result.placeholder_level')"
          />
        </div>
        <button
          type="button"
          :class="ROW_BUTTON"
          :aria-label="$t('freecv.result.remove_row')"
          @click="cv.languages.splice(i, 1)"
        >
          ×
        </button>
      </div>
      <button type="button" :class="ADD_BUTTON" @click="cv.languages.push({ name: '', level: '' })">
        + {{ $t('freecv.result.add_row') }}
      </button>
    </section>

    <!-- Certifications -->
    <section class="flex flex-col gap-2">
      <h3 :class="LABEL">{{ $t('freecv.result.section_certifications') }}</h3>
      <div v-for="(c, i) in cv.certifications" :key="i" class="flex items-start gap-2">
        <div class="min-w-0 flex-[2] text-[14px] font-bold">
          <FreecvEditableText
            v-model="c.title"
            single
            :placeholder="$t('freecv.result.placeholder_cert')"
          />
        </div>
        <div class="min-w-0 flex-1 text-[13px] text-ink/70">
          <FreecvEditableText
            v-model="c.issuer_period"
            single
            :placeholder="$t('freecv.result.placeholder_cert_meta')"
          />
        </div>
        <button
          type="button"
          :class="ROW_BUTTON"
          :aria-label="$t('freecv.result.remove_row')"
          @click="cv.certifications.splice(i, 1)"
        >
          ×
        </button>
      </div>
      <button
        type="button"
        :class="ADD_BUTTON"
        @click="cv.certifications.push({ title: '', issuer_period: '' })"
      >
        + {{ $t('freecv.result.add_row') }}
      </button>
    </section>
  </div>
</template>
