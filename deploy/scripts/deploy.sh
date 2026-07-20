#!/usr/bin/env bash
# deploy.sh — pull the latest main and publish a new release.
#
# Installed once (by server-setup.sh) to /opt/primaries-fit/bin/deploy.sh —
# deliberately OUTSIDE the git-managed repo/ checkout, so a `git reset --hard`
# mid-run can never rewrite the very script that's executing (the classic
# self-modifying-script footgun). Invoked over SSH by the GitHub Actions
# deploy workflow as the unprivileged 'deploy' user; no sudo anywhere in here,
# because there's no service to restart — Caddy just reads static files
# through a symlink that this script flips atomically.
#
# Usage: /opt/primaries-fit/bin/deploy.sh   (no arguments)
set -euo pipefail

APP_DIR="/opt/primaries-fit"
REPO_DIR="${APP_DIR}/repo"
RELEASES_DIR="${APP_DIR}/releases"
KEEP_RELEASES=3

echo "==> Fetching latest main"
cd "${REPO_DIR}"
git fetch origin main -q
git reset --hard origin/main -q
REV="$(git rev-parse --short HEAD)"
STAMP="$(date -u +%Y%m%d%H%M%S)-${REV}"

echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Building"
rm -rf dist
npm run build

echo "==> Publishing release ${STAMP}"
mkdir -p "${RELEASES_DIR}"
RELEASE_DIR="${RELEASES_DIR}/${STAMP}"
cp -r dist "${RELEASE_DIR}"

# Atomic swap: point a temp symlink at the new release, then rename it over
# 'current'. rename(2) on the same filesystem is a single atomic syscall, so
# Caddy never serves a half-updated tree — every request sees either the old
# release in full or the new one in full, never a mix.
ln -sfn "${RELEASE_DIR}" "${APP_DIR}/current.tmp"
mv -T "${APP_DIR}/current.tmp" "${APP_DIR}/current"

echo "==> Pruning old releases (keeping last ${KEEP_RELEASES})"
ls -1t "${RELEASES_DIR}" | tail -n +$((KEEP_RELEASES + 1)) | while read -r old; do
    rm -rf "${RELEASES_DIR:?}/${old}"
done

echo "==> Deployed ${STAMP}"
