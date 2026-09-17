<script setup>
// The CV data-entry form (personal info, experience, skills, formation,
// languages, certifications, location, availability). Shared between the
// onboarding wizard's "Vérification" step and the standalone "Modifier mon
// CV" page reached from /profile -- same fields, same validation-free
// editable-list behaviour, only the surrounding page (title, navigation,
// where "Précédent"/"Sauvegarder" lead) differs. Owns its own form state so
// both call sites just do `formRef.applyProfile(profile)` on load and read
// `formRef.form` on save.

const LANGUAGE_LEVELS = [
  'Langue maternelle',
  'Bilingue (C2)',
  'Courant (C1)',
  'Avancé (B2)',
  'Intermédiaire (B1)',
  'Élémentaire (A2)',
  'Débutant (A1)',
  'Notions',
]

const form = reactive({
  first_name: '',
  last_name: '',
  headline: '',
  email: '',
  location: '',
  availability_status: 'immediate',
  availability_date: null,
  notice_period_months: null,
  total_experience: '',
  experiences: [],
  skills: [],
  formations: [],
  languages: [],
  certifications: [],
})

function applyProfile(profile) {
  form.first_name = profile.first_name || ''
  form.last_name = profile.last_name || ''
  form.headline = profile.headline || ''
  form.email = profile.email || ''
  form.location = profile.location || ''
  form.availability_status = profile.availability_status || 'immediate'
  form.availability_date = profile.availability_date || null
  form.notice_period_months = profile.notice_period_months || null
  form.total_experience = profile.total_experience || ''
  form.experiences = (profile.experiences || []).map((e) => ({ ...e, tools: [...(e.tools || [])] }))
  form.skills = [...(profile.skills || [])]
  form.formations = (profile.formations || []).map((f) => ({ ...f }))
  form.languages = (profile.languages || []).map((l) => ({ ...l }))
  form.certifications = (profile.certifications || []).map((c) => ({ ...c }))
}

function addExperience() {
  form.experiences.push({ title: '', company: '', period: '', description: '', tools: [] })
}
function removeExperience(index) {
  form.experiences.splice(index, 1)
}

function addFormation() {
  form.formations.push({ title: '', school_period: '' })
}
function removeFormation(index) {
  form.formations.splice(index, 1)
}

function addLanguage() {
  form.languages.push({ name: '', level: LANGUAGE_LEVELS[0] })
}
function removeLanguage(index) {
  form.languages.splice(index, 1)
}

function addCertification() {
  form.certifications.push({ title: '', issuer_period: '' })
}
function removeCertification(index) {
  form.certifications.splice(index, 1)
}

defineExpose({ form, applyProfile })
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Informations personnelles -->
    <UiCard :title="$t('onboarding.verification.personal_info')">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UiInput v-model="form.first_name" :label="$t('onboarding.verification.first_name')" />
        <UiInput v-model="form.last_name" :label="$t('onboarding.verification.last_name')" />
        <UiInput v-model="form.email" type="email" :label="$t('onboarding.verification.email')" />
        <UiInput
          v-model="form.headline"
          class="sm:col-span-3"
          :label="$t('onboarding.verification.headline')"
        />
      </div>
    </UiCard>

    <!-- Expérience -->
    <UiCard :title="$t('onboarding.verification.experience')">
      <UiInput
        v-model="form.total_experience"
        :label="$t('onboarding.verification.total_experience')"
        class="mb-5"
      />

      <div class="flex flex-col gap-4">
        <div
          v-for="(exp, i) in form.experiences"
          :key="i"
          class="relative rounded-lg border border-gray-100 bg-gray-50 p-4"
        >
          <button
            type="button"
            class="absolute right-3 top-3 text-gray-400 hover:text-danger"
            :aria-label="$t('onboarding.verification.remove')"
            @click="removeExperience(i)"
          >
            ✕
          </button>
          <div class="mb-3 grid grid-cols-1 gap-3 pr-6 sm:grid-cols-2">
            <UiInput v-model="exp.title" :label="$t('onboarding.verification.job_title')" />
            <UiInput v-model="exp.company" :label="$t('onboarding.verification.company')" />
            <UiInput
              v-model="exp.period"
              :label="$t('onboarding.verification.period')"
              class="sm:col-span-2"
            />
          </div>
          <UiTextarea
            v-model="exp.description"
            :label="$t('onboarding.verification.description')"
            :rows="3"
            class="mb-3"
          />
          <div>
            <p class="mb-1.5 text-sm font-semibold text-gray-900">
              {{ $t('onboarding.verification.tools') }}
            </p>
            <OnboardingTagInput
              v-model="exp.tools"
              :add-label="$t('onboarding.verification.add_tool')"
            />
          </div>
        </div>
      </div>

      <UiButton variant="secondary" size="sm" class="mt-4" type="button" @click="addExperience">
        {{ $t('onboarding.verification.add_experience') }}
      </UiButton>
    </UiCard>

    <!-- Compétences -->
    <UiCard :title="$t('onboarding.verification.skills')">
      <OnboardingTagInput
        v-model="form.skills"
        :add-label="$t('onboarding.verification.add_tool')"
      />
    </UiCard>

    <!-- Formation -->
    <UiCard :title="$t('onboarding.verification.formation')">
      <div class="flex flex-col gap-3">
        <div
          v-for="(f, i) in form.formations"
          :key="i"
          class="relative grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 pr-10 sm:grid-cols-2"
        >
          <button
            type="button"
            class="absolute right-3 top-3 text-gray-400 hover:text-danger"
            :aria-label="$t('onboarding.verification.remove')"
            @click="removeFormation(i)"
          >
            ✕
          </button>
          <UiInput v-model="f.title" :label="$t('onboarding.verification.formation_title')" />
          <UiInput
            v-model="f.school_period"
            :label="$t('onboarding.verification.formation_school_period')"
          />
        </div>
      </div>
      <UiButton variant="secondary" size="sm" class="mt-4" type="button" @click="addFormation">
        {{ $t('onboarding.verification.add_formation') }}
      </UiButton>
    </UiCard>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <!-- Langues -->
      <UiCard :title="$t('onboarding.verification.languages')">
        <div class="flex flex-col gap-3">
          <div
            v-for="(lang, i) in form.languages"
            :key="i"
            class="relative flex items-end gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 pr-9"
          >
            <button
              type="button"
              class="absolute right-2 top-2 text-gray-400 hover:text-danger"
              :aria-label="$t('onboarding.verification.remove')"
              @click="removeLanguage(i)"
            >
              ✕
            </button>
            <UiInput v-model="lang.name" :label="$t('onboarding.verification.language_name')" />
            <UiSelect
              v-model="lang.level"
              :label="$t('onboarding.verification.language_level')"
              :options="LANGUAGE_LEVELS"
            />
          </div>
        </div>
        <UiButton variant="secondary" size="sm" class="mt-4" type="button" @click="addLanguage">
          {{ $t('onboarding.verification.add_language') }}
        </UiButton>
      </UiCard>

      <!-- Certifications -->
      <UiCard :title="$t('onboarding.verification.certifications')">
        <div class="flex flex-col gap-3">
          <div
            v-for="(cert, i) in form.certifications"
            :key="i"
            class="relative rounded-lg border border-gray-100 bg-gray-50 p-3 pr-9"
          >
            <button
              type="button"
              class="absolute right-2 top-2 text-gray-400 hover:text-danger"
              :aria-label="$t('onboarding.verification.remove')"
              @click="removeCertification(i)"
            >
              ✕
            </button>
            <UiInput
              v-model="cert.title"
              :label="$t('onboarding.verification.certification_title')"
              class="mb-2"
            />
            <UiInput
              v-model="cert.issuer_period"
              :label="$t('onboarding.verification.certification_issuer_period')"
            />
          </div>
        </div>
        <UiButton
          variant="secondary"
          size="sm"
          class="mt-4"
          type="button"
          @click="addCertification"
        >
          {{ $t('onboarding.verification.add_certification') }}
        </UiButton>
      </UiCard>
    </div>

    <!-- Localisation -->
    <UiCard>
      <div class="mb-4">
        <label class="mb-1.5 block text-sm font-semibold text-gray-900">
          {{ $t('onboarding.verification.location') }}
        </label>
        <ProfileCityAutocomplete v-model="form.location" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-gray-900">
          {{ $t('onboarding.verification.availability') }}
        </label>
        <ProfileAvailabilityField
          v-model:status="form.availability_status"
          v-model:date="form.availability_date"
          v-model:notice-months="form.notice_period_months"
        />
      </div>
    </UiCard>
  </div>
</template>
