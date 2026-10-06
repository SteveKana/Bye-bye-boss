// Formatting helpers for the admin "Monitoring" area (French only).
// Dates come from the API as ISO-8601 UTC strings and are shown in Paris time.

const TZ = 'Europe/Paris'
const numberFmt = new Intl.NumberFormat('fr-FR')

export function fmtInt(n) {
  return n == null || Number.isNaN(n) ? '—' : numberFmt.format(n)
}

export function fmtEur(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`
}

export function fmtPercent(part, total) {
  if (!total) return '0 %'
  return `${Math.round((100 * part) / total)} %`
}

// "2026-10-05" -> "05/10" (pure string work: no timezone surprise)
export function fmtShortDate(ymd) {
  if (!ymd) return ''
  const [, m, d] = String(ymd).split('-')
  return `${d}/${m}`
}

function parts(iso) {
  const out = {}
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  for (const p of fmt.formatToParts(new Date(iso))) out[p.type] = p.value
  return out
}

// "05/10 16:34"
export function fmtDateTime(iso) {
  if (!iso) return '—'
  const p = parts(iso)
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`
}

// "16:34"
export function fmtTime(iso) {
  if (!iso) return '—'
  const p = parts(iso)
  return `${p.hour}:${p.minute}`
}

// "05/10/2026"
export function fmtDate(iso) {
  if (!iso) return '—'
  const p = parts(iso)
  return `${p.day}/${p.month}/${p.year}`
}

// "il y a 6 min", "il y a 3 j"
export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '—'
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 5) return "à l'instant"
  if (s < 60) return `il y a ${s} s`
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`
  return `il y a ${Math.round(s / 86400)} j`
}

// "dans 12 min"
export function timeUntil(iso, now = Date.now()) {
  if (!iso) return '—'
  const s = Math.round((new Date(iso).getTime() - now) / 1000)
  if (s <= 0) return 'imminent'
  if (s < 60) return `dans ${s} s`
  if (s < 3600) return `dans ${Math.round(s / 60)} min`
  if (s < 86400) return `dans ${Math.round(s / 3600)} h`
  return `dans ${Math.round(s / 86400)} j`
}

// "1 min 12", "41 s", "<1 s"
export function fmtDuration(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return '<1 s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  return `${m} min ${String(s % 60).padStart(2, '0')}`
}

export function plural(n, one, many) {
  return `${fmtInt(n)} ${n > 1 ? many : one}`
}

// Period selector: ?days=1|7|30
export const ADMIN_PERIODS = [
  { days: 1, label: "Aujourd'hui" },
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
]

export function periodPhrase(days) {
  if (days === 1) return "aujourd'hui"
  if (days === 30) return 'ces 30 derniers jours'
  return 'cette semaine'
}

export const CHANNEL_LABELS = { email: 'E-mail', whatsapp: 'WhatsApp', discord: 'Discord' }

const SOURCE_LABELS = { france_travail: 'France Travail', adzuna: 'Adzuna' }
export function sourceLabel(key) {
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key]
  const s = String(key).replace(/[_-]+/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Categorical chart colours (blue / orange / aqua) then a few safe extras.
export const CHART_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#7a5ac8', '#c7921b']
export const CHART_FAIL = '#d03b3b'

// Incident vocabulary shared by the overview and the incidents tab.
export const INCIDENT_STATUS = {
  new: { state: 'bad', label: 'Nouveau' },
  in_progress: { state: 'warn', label: 'En cours' },
  resolved: { state: 'ok', label: 'Résolu' },
}
export const INCIDENT_KIND = {
  server: { state: 'bad', label: 'Serveur' },
  alert: { state: 'bad', label: 'Alertes' },
  cv: { state: 'warn', label: 'CV' },
  browser: { state: 'warn', label: 'Navigateur' },
  other: { state: 'warn', label: 'Autre' },
}
