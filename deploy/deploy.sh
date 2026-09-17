#!/usr/bin/env bash
#
# Deploy a Bye Bye Boss environment.
#   deploy-byebyeboss byebyeboss.fr [ref]
#   deploy-byebyeboss dev.byebyeboss.fr [ref]
#   deploy-byebyeboss byebyeboss.fr --rollback
#
# Layout per site:
#   <site>/repo              git checkout + node_modules, build workspace
#   <site>/releases/<stamp>  built .output snapshots
#   <site>/current           symlink to the live release
#
# The served release is never modified in place: the build runs in repo/, the
# result is snapshotted, and only then does current/ swing over atomically.

set -euo pipefail

readonly ROOT=/var/www/bye-bye-boss
readonly NODE_BIN=/opt/node-byebyeboss/bin
readonly RETAIN=5

SITE=${1:-}
ARG=${2:-}

case "$SITE" in
  byebyeboss.fr)     BRANCH=main    ; PORT=3000 ;;
  dev.byebyeboss.fr) BRANCH=develop ; PORT=3001 ;;
  *)
    echo "usage: $(basename "$0") {byebyeboss.fr|dev.byebyeboss.fr} [ref|--rollback]" >&2
    exit 64 ;;
esac

readonly SITE_DIR=$ROOT/$SITE
readonly REPO_DIR=$SITE_DIR/repo
readonly RELEASES=$SITE_DIR/releases
readonly CURRENT=$SITE_DIR/current
readonly LOG=/var/log/deploy-$SITE.log
readonly LOCK=/var/lock/deploy-$SITE.lock

exec {lockfd}>"$LOCK"
flock -n "$lockfd" || { echo "a deployment for $SITE is already running" >&2; exit 69; }

log()  { printf '%s  %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$LOG"; }
fail() { log "FAILED: $*"; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "must run as root (needs systemctl)"
[ -d "$REPO_DIR/.git" ] || fail "$REPO_DIR is not a git checkout"

export PATH=$NODE_BIN:$PATH
export NODE_ENV=production CI=1

point_at() {
  ln -sfn "$1" "$CURRENT.tmp"
  chown -h byebyeboss:byebyeboss "$CURRENT.tmp"
  mv -Tf "$CURRENT.tmp" "$CURRENT"
}

health() {
  local code=
  for i in $(seq 1 20); do
    sleep 1
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$PORT/" || true)
    [ "$code" = "200" ] && { log "healthy after ${i}s (HTTP 200)"; return 0; }
  done
  log "health check failed (last HTTP ${code:-none})"
  return 1
}

PREVIOUS_RELEASE=$(readlink -f "$CURRENT" 2>/dev/null || true)

if [ "$ARG" = "--rollback" ]; then
  target=$(ls -1dt "$RELEASES"/*/ 2>/dev/null | sed -n 2p)
  [ -n "$target" ] || fail "no earlier release to roll back to"
  log "=== rollback $SITE -> $(basename "$target") ==="
  point_at "${target%/}"
  systemctl restart "$SITE"
  health || fail "rollback is unhealthy, manual intervention required"
  log "rolled back to $(basename "$target")"
  exit 0
fi

TARGET=${ARG:-origin/$BRANCH}
PREVIOUS_SHA=$(git -C "$REPO_DIR" rev-parse HEAD)

log "=== deploy $SITE ($BRANCH) ==="
log "current  ${PREVIOUS_SHA:0:8}  release $(basename "${PREVIOUS_RELEASE:-none}")"

git -C "$REPO_DIR" fetch --prune --tags origin "$BRANCH"
git -C "$REPO_DIR" reset --hard "$TARGET" >/dev/null
INCOMING=$(git -C "$REPO_DIR" rev-parse HEAD)
log "incoming ${INCOMING:0:8}  $(git -C "$REPO_DIR" log -1 --format=%s)"

cd "$REPO_DIR"
pnpm install --frozen-lockfile --reporter=silent || fail "pnpm install"
pnpm build >>"$LOG" 2>&1 || fail "build"
[ -f "$REPO_DIR/.output/server/index.mjs" ] || fail "build produced no .output/server/index.mjs"

STAMP=$(date -u +%Y%m%d%H%M%S)
NEW=$RELEASES/$STAMP
mkdir -p "$RELEASES"
cp -a "$REPO_DIR/.output" "$NEW"
printf '%s\n' "$INCOMING" > "$NEW/.commit"
# repo/ stays root-owned: the service user must not be able to alter the
# build workspace, and git refuses to run as root on a foreign-owned tree.
chown -R byebyeboss:byebyeboss "$NEW"

log "switching to release $STAMP"
point_at "$NEW"
systemctl restart "$SITE"

if ! health; then
  if [ -n "$PREVIOUS_RELEASE" ] && [ -d "$PREVIOUS_RELEASE" ]; then
    log "rolling back to $(basename "$PREVIOUS_RELEASE")"
    point_at "$PREVIOUS_RELEASE"
    git -C "$REPO_DIR" reset --hard "$PREVIOUS_SHA" >/dev/null
    systemctl restart "$SITE"
    sleep 3
    log "rolled back ($(systemctl is-active "$SITE"))"
  else
    log "no previous release to roll back to"
  fi
  rm -rf "$NEW"
  exit 1
fi

ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +$((RETAIN + 1)) | xargs -r rm -rf

public=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://$SITE/" || echo "?")
log "done: ${INCOMING:0:8} live as $STAMP, https://$SITE -> $public"

if ! cmp -s "$REPO_DIR/deploy/deploy.sh" "$0"; then
  log "note: the checkout ships a different deploy.sh than the installed one"
  log "      run 'sudo $REPO_DIR/deploy/install.sh' to update it"
fi
