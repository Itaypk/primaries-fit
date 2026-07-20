#!/usr/bin/env bash
# server-setup.sh — one-time provisioning for a fresh Ubuntu LTS VPS to serve
# primaries.fit as a static site behind Caddy.
#
# Run as root: sudo bash server-setup.sh --admin-user=NAME [options]
# Run with --help for the full flag list.
#
# Unlike a JVM/container app, this is a pure Vite build: no runtime process,
# no secrets, no systemd unit for the app itself. Caddy serves static files
# straight off disk through a symlink ('current') that deploy.sh flips on
# every release. The only always-on daemon this installs is Caddy.
#
# The script creates a non-root admin user with your SSH key before disabling
# root login, then pauses so you can verify access first — same as the
# Florsheim VPS playbook this is adapted from.
#
# Safe to re-run (e.g. after a failed run): package installs, user creation,
# and config files are all idempotent. Two exceptions to know about if you're
# rerunning against a box that's had manual changes since the last run:
#   - `ufw --force reset` (step 3) wipes any firewall rules added outside
#     this script before reapplying the base set.
#   - the admin user's authorized_keys is overwritten from root's each run,
#     which would drop any key added directly to the admin account (not to
#     root) in between.
set -euo pipefail

# ── 0. Prerequisites ──────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    echo "Run as root: sudo bash $0" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ADMIN_USER=""
# Optional: public key for the GitHub Actions deploy workflow to log in as
# 'deploy' with. If omitted, add it to /home/deploy/.ssh/authorized_keys by
# hand later (instructions are printed at the end either way).
CI_PUBKEY_FILE=""
# Assumes the whole deploy/ folder (not just scripts/server-setup.sh) was
# copied to the server, so the Caddyfile sits one directory up from here.
# Override with --caddyfile= if you copied only this script.
CADDYFILE="${SCRIPT_DIR}/../Caddyfile"

usage() {
    cat <<EOF
Usage: sudo bash $0 --admin-user=NAME [--ci-pubkey=PATH] [--caddyfile=PATH]

  --admin-user=NAME  Admin username to create (replaces root for SSH).
                      Prompted interactively if omitted.
  --ci-pubkey=PATH    Public key to pre-authorize for the GitHub Actions
                      deploy login (deploy@). Optional — can be added by
                      hand later; see deploy/README.md.
  --caddyfile=PATH    Caddyfile to install to /etc/caddy/Caddyfile.
                      Defaults to '${CADDYFILE}'. Pass this explicitly if
                      you copied only scripts/server-setup.sh rather than
                      the whole deploy/ folder.
EOF
}

for arg in "$@"; do
    case "${arg}" in
        --admin-user=*) ADMIN_USER="${arg#*=}" ;;
        --ci-pubkey=*) CI_PUBKEY_FILE="${arg#*=}" ;;
        --caddyfile=*) CADDYFILE="${arg#*=}" ;;
        -h|--help) usage; exit 0 ;;
        *)
            echo "ERROR: unrecognized argument '${arg}'" >&2
            usage >&2
            exit 1
            ;;
    esac
done

if [[ -z "${ADMIN_USER}" ]]; then
    read -rp "Admin username to create (will replace root for SSH): " ADMIN_USER
fi

# Fail fast on bad input paths, before any system changes are made — this is
# exactly the check that would have caught the Caddyfile-not-found failure
# up front instead of mid-script.
if [[ ! -f "${CADDYFILE}" ]]; then
    echo "ERROR: Caddyfile not found at '${CADDYFILE}'." >&2
    echo "Pass --caddyfile=/path/to/Caddyfile if you copied only this" >&2
    echo "script rather than the whole deploy/ folder. Aborting before" >&2
    echo "making any changes." >&2
    exit 1
fi
if [[ -n "${CI_PUBKEY_FILE}" && ! -f "${CI_PUBKEY_FILE}" ]]; then
    echo "ERROR: --ci-pubkey path '${CI_PUBKEY_FILE}' not found. Aborting" >&2
    echo "before making any changes." >&2
    exit 1
fi

DEPLOY_USER="deploy"
APP_DIR="/opt/primaries-fit"
REPO_URL="git@github.com:Itaypk/primaries-fit.git"

echo "==> Updating system packages"
apt-get update -q
apt-get upgrade -y -q

# ── 1. Essential packages ─────────────────────────────────────────────────────
echo "==> Installing base packages"
apt-get install -y -q \
    ufw fail2ban \
    unattended-upgrades apt-listchanges \
    curl gnupg debian-keyring debian-archive-keyring apt-transport-https \
    git

# ── 2. Admin user (must happen before SSH hardening) ─────────────────────────
echo "==> Creating admin user '${ADMIN_USER}'"
if ! id "${ADMIN_USER}" &>/dev/null; then
    useradd -m -s /bin/bash "${ADMIN_USER}"
fi
usermod -aG sudo "${ADMIN_USER}"

# The account has no password (login is key-only), so a normal sudo prompt
# could never be satisfied. Grant passwordless sudo via a sudoers.d drop-in —
# the SSH key is the single auth factor, same model cloud images use.
SUDOERS_TMP="$(mktemp)"
printf '%s ALL=(ALL) NOPASSWD:ALL\n' "${ADMIN_USER}" > "${SUDOERS_TMP}"
if visudo -cf "${SUDOERS_TMP}"; then
    install -m 0440 -o root -g root "${SUDOERS_TMP}" /etc/sudoers.d/10-admin
    rm -f "${SUDOERS_TMP}"
else
    rm -f "${SUDOERS_TMP}"
    echo "ERROR: generated sudoers rule failed validation. Aborting." >&2
    exit 1
fi

# Copy root's authorised key so the same certificate works for the new user.
# Bail early if root has no key — otherwise we'd disable password+root login
# below and lock ourselves out of the box entirely.
if [[ ! -s /root/.ssh/authorized_keys ]]; then
    echo "ERROR: /root/.ssh/authorized_keys is missing or empty." >&2
    echo "Add an SSH public key for root before running this script," >&2
    echo "or SSH hardening would lock you out. Aborting." >&2
    exit 1
fi
mkdir -p /home/${ADMIN_USER}/.ssh
cp /root/.ssh/authorized_keys /home/${ADMIN_USER}/.ssh/authorized_keys
chown -R ${ADMIN_USER}:${ADMIN_USER} /home/${ADMIN_USER}/.ssh
chmod 700 /home/${ADMIN_USER}/.ssh
chmod 600 /home/${ADMIN_USER}/.ssh/authorized_keys

echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  PAUSE — verify SSH access before continuing            │"
echo "│                                                         │"
echo "│  Open a new terminal and confirm you can log in:        │"
echo "│    ssh ${ADMIN_USER}@<server-ip>                            │"
echo "│                                                         │"
echo "│  If it works, come back here and press Enter.           │"
echo "│  If it doesn't, press Ctrl+C — root login is still on.  │"
echo "└─────────────────────────────────────────────────────────┘"
read -rp ""

# ── 3. UFW firewall ───────────────────────────────────────────────────────────
echo "==> Configuring UFW"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
ufw status verbose

# ── 4. fail2ban (SSH brute-force protection) ──────────────────────────────────
echo "==> Enabling fail2ban"
systemctl enable --now fail2ban

# ── 5. Unattended security upgrades with auto-reboot at 03:00 ────────────────
echo "==> Configuring unattended-upgrades"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

sed -i \
    -e 's|//Unattended-Upgrade::Automatic-Reboot "false"|Unattended-Upgrade::Automatic-Reboot "true"|' \
    -e 's|//Unattended-Upgrade::Automatic-Reboot-Time "02:00"|Unattended-Upgrade::Automatic-Reboot-Time "03:00"|' \
    /etc/apt/apt.conf.d/50unattended-upgrades

# ── 6. SSH hardening (safe now — admin user verified above) ───────────────────
echo "==> Hardening SSH"
cat > /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
sshd -t
systemctl restart ssh

# ── 7. Caddy reverse proxy / static file server ───────────────────────────────
echo "==> Installing Caddy"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -q
apt-get install -y -q caddy

echo "==> Deploying Caddyfile"
cp "${CADDYFILE}" /etc/caddy/Caddyfile
systemctl enable --now caddy
echo "    Caddy status: $(systemctl is-active caddy)"

# ── 8. Node.js (build toolchain — matches the Node 20 CI uses) ───────────────
echo "==> Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -q nodejs

# ── 9. Deploy user (service account: owns the app, builds releases) ──────────
echo "==> Creating '${DEPLOY_USER}' service account"
if ! id "${DEPLOY_USER}" &>/dev/null; then
    # No sudo, no password, no systemd rights — unlike the Florsheim playbook
    # this account needs no elevated privilege at all: there's no service to
    # restart, so it can't be granted one even narrowly.
    useradd -m -s /bin/bash "${DEPLOY_USER}"
fi

mkdir -p /home/${DEPLOY_USER}/.ssh
touch /home/${DEPLOY_USER}/.ssh/authorized_keys
if [[ -n "${CI_PUBKEY_FILE}" ]]; then
    # grep -qxF guards against appending the same key twice on a rerun.
    if ! grep -qxF -- "$(cat "${CI_PUBKEY_FILE}")" /home/${DEPLOY_USER}/.ssh/authorized_keys 2>/dev/null; then
        cat "${CI_PUBKEY_FILE}" >> /home/${DEPLOY_USER}/.ssh/authorized_keys
    fi
    echo "    Authorized CI key from ${CI_PUBKEY_FILE} for deploy@"
else
    echo "    No CI pubkey supplied — add the GitHub Actions deploy key to"
    echo "    /home/${DEPLOY_USER}/.ssh/authorized_keys by hand (see README)."
fi
chown -R ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh
chmod 700 /home/${DEPLOY_USER}/.ssh
chmod 600 /home/${DEPLOY_USER}/.ssh/authorized_keys

# A second, distinct keypair: this one lets the VPS authenticate itself OUT to
# GitHub to clone/pull the private repo (a "deploy key" in GitHub's sense —
# not to be confused with the CI login key above, which lets GitHub Actions
# SSH IN to this box). Read-only by convention; never add write access.
echo "==> Generating a GitHub deploy key for 'deploy' to pull the private repo"
if [[ ! -f /home/${DEPLOY_USER}/.ssh/id_ed25519_github ]]; then
    sudo -u ${DEPLOY_USER} ssh-keygen -t ed25519 -N "" -C "${DEPLOY_USER}@primaries.fit" \
        -f /home/${DEPLOY_USER}/.ssh/id_ed25519_github
fi
cat > /home/${DEPLOY_USER}/.ssh/config <<EOF
Host github.com
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
EOF
chown ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh/config
chmod 600 /home/${DEPLOY_USER}/.ssh/config
touch /home/${DEPLOY_USER}/.ssh/known_hosts
if ! grep -q '^github\.com ' /home/${DEPLOY_USER}/.ssh/known_hosts 2>/dev/null; then
    ssh-keyscan -t ed25519 github.com >> /home/${DEPLOY_USER}/.ssh/known_hosts 2>/dev/null
fi
chown ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh/known_hosts

# ── 10. App directory + static deploy tooling ─────────────────────────────────
echo "==> Setting up ${APP_DIR}"
mkdir -p "${APP_DIR}" "${APP_DIR}/releases"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

echo "==> Installing bin/deploy.sh (static — lives outside the git checkout)"
sudo -u ${DEPLOY_USER} mkdir -p "${APP_DIR}/bin"
install -m 0755 -o ${DEPLOY_USER} -g ${DEPLOY_USER} \
    "${SCRIPT_DIR}/deploy.sh" "${APP_DIR}/bin/deploy.sh"

DEPLOY_PUBKEY="$(cat /home/${DEPLOY_USER}/.ssh/id_ed25519_github.pub)"

cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Server setup complete.

  Root login is now disabled. Use '${ADMIN_USER}' with sudo for
  system administration going forward.

  Next steps:

  1. Add this box's GitHub deploy key (read-only) to the repo:
     https://github.com/Itaypk/primaries-fit/settings/keys → Add deploy key
     ────────────────────────────────────────────────────────────
     ${DEPLOY_PUBKEY}
     ────────────────────────────────────────────────────────────

  2. Clone the repo as 'deploy' (only works after step 1):
       sudo -u ${DEPLOY_USER} git clone ${REPO_URL} ${APP_DIR}/repo

  3. Run the first release by hand:
       sudo -u ${DEPLOY_USER} ${APP_DIR}/bin/deploy.sh

  4. Point the primaries.fit DNS A record at this server's IP.
     Caddy will obtain a Let's Encrypt certificate automatically
     on first request.

  5. Wire up GitHub Actions auto-deploy — see deploy/README.md for
     the full secrets list (DEPLOY_SSH_KEY, DEPLOY_HOST,
     DEPLOY_KNOWN_HOSTS). If you passed --ci-pubkey to this script,
     that key is already authorized for deploy@; otherwise append
     it to /home/${DEPLOY_USER}/.ssh/authorized_keys now.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
