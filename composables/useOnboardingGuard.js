// The backend answers 404 when a candidate has no CV/profile yet -- that is
// the ONLY failure that should send them to the CV importer. Any other
// failure (server mid-restart or unreachable, 5xx, dropped connection) says
// nothing about whether a CV exists: redirecting on it bounced users to
// "Importez votre CV" at every deployment (Steve, 2026-10-04).
export function isNoProfileError(err) {
  return err?.status === 404
}
