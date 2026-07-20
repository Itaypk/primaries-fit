# Deployment — primaries.fit

Production host: **primaries.fit**
Stack: Caddy (static file server + TLS) serving a Vite build, released by
`deploy.sh` and triggered by GitHub Actions over SSH.

This is adapted from the Florsheim project's VPS playbook, simplified for
what this app actually is: a pure client-side SPA with no backend, no
database, and no secrets. There's nothing to run — `npm run build` produces
static files, and Caddy just serves them. So there's no systemd unit for the
app, no credentials machinery, and no service to restart on release.

---

## Architecture overview

```
Internet
  │  443 / 80
  ▼
Caddy (systemd service, runs as the 'caddy' user)
  │  serves static files from /opt/primaries-fit/current
  ▼
/opt/primaries-fit/
  ├─ repo/                  git checkout, rebuilt on every release
  ├─ releases/<stamp>/      built dist/ output, one dir per release (last 3 kept)
  ├─ current -> releases/…  symlink, flipped atomically by deploy.sh
  └─ bin/deploy.sh          static — installed once, lives outside repo/
```

`deploy.sh` lives outside `repo/` on purpose: it does a `git reset --hard`
against that checkout, and a script can't safely `git reset --hard` the very
directory it's currently executing from (the file underneath the running
interpreter could change mid-script). Keeping it in `bin/` sidesteps that
entirely.

Releases swap via a symlink rename (`mv -T`), which is a single atomic
syscall on the same filesystem — Caddy never serves a half-built tree, and
the last few releases stick around for a manual rollback (`ln -sfn` to an
older `releases/<stamp>` dir).

---

## Day 1: provision a fresh VPS

### Prerequisites
- Ubuntu LTS VPS with SSH certificate auth already configured
- DNS A record for `primaries.fit` pointing at the VPS (can be done any time
  before step 4 below — Caddy just won't get a cert until it resolves)

### 1. Run server-setup.sh
Connect:
```bash
ssh -i ~/.ssh/<your-key> root@<vps-ip>
```

Copy the `deploy/` folder:
```bash
scp -i ~/.ssh/<your-key> -r ./deploy root@<vps-ip>:/root/deploy
```

Run it:
```bash
sudo bash deploy/scripts/server-setup.sh --admin-user=yourusername
```
(Run with `--help` for the full flag list, including `--caddyfile=` if you
copied only `scripts/server-setup.sh` rather than the whole `deploy/` folder,
and `--ci-pubkey=` to pre-authorize the GitHub Actions deploy key in one go.)

Mid-script it pauses and asks you to verify admin SSH access in a second
terminal before disabling root login — same safety valve as Florsheim's
script. It installs and configures:
- UFW (allows SSH / 80 / 443 only), fail2ban, unattended security upgrades
- Root SSH login and password auth disabled
- Caddy (auto-HTTPS via Let's Encrypt) with `deploy/Caddyfile` installed
- Node.js 20 (matches CI) — the only build toolchain this needs
- The `deploy` service account: no sudo, no password, no systemd rights at
  all — there's no service for it to be granted rights over
- `/opt/primaries-fit/bin/deploy.sh` installed and ready

At the end it prints a freshly generated **GitHub deploy key** (a second,
distinct keypair from your own — this one lets the VPS itself pull the
private repo from GitHub) and the exact next steps, repeated here:

### 2. Authorize the deploy key and pull the repo
Add the printed public key to the repo as a **read-only** deploy key:
https://github.com/Itaypk/primaries-fit/settings/keys → *Add deploy key*

Then, on the VPS:
```bash
sudo -u deploy git clone git@github.com:Itaypk/primaries-fit.git /opt/primaries-fit/repo
sudo -u deploy /opt/primaries-fit/bin/deploy.sh
```

That builds and publishes the first release. Once DNS resolves, Caddy issues
the TLS certificate automatically on the first request to `primaries.fit`.

### 3. Wire up GitHub Actions auto-deploy
The `Deploy` workflow (`.github/workflows/deploy.yml`) SSHes into the VPS and
runs `bin/deploy.sh` after CI passes on `main`. It needs three repo secrets
(**Settings → Secrets and variables → Actions**):

| Secret | How to get it |
|---|---|
| `DEPLOY_SSH_KEY` | Generate a **dedicated** keypair for CI: `ssh-keygen -t ed25519 -N "" -f ci_deploy_key`. Paste the *private* key contents here. |
| `DEPLOY_HOST` | `primaries.fit` (once DNS resolves) or the raw VPS IP. |
| `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan -t ed25519 <vps-ip-or-host>`, run from your own machine. Pins the host key so the Actions runner can't be MITM'd on first connect. |

Then authorize `ci_deploy_key.pub` for the `deploy` account on the VPS:
```bash
ssh admin@<vps-ip> "sudo tee -a /home/deploy/.ssh/authorized_keys" < ci_deploy_key.pub
```
(If you passed `--ci-pubkey=` to `server-setup.sh`, this step is already done.)

This key is scoped to log in as `deploy`, which has no sudo and owns nothing
outside `/opt/primaries-fit` — a leaked CI secret can't do more than trigger
another release. It's a different key from the GitHub deploy key in step 2:
that one authenticates the VPS *to* GitHub (read-only pull); this one
authenticates GitHub Actions *to* the VPS (SSH login as `deploy`).

From here, every push to `main` that passes CI deploys automatically. Trigger
one by hand from the Actions tab (`Deploy` → *Run workflow*) any time.

---

## Routine releases

Nothing to run locally — push to `main`, let CI pass, and the `Deploy`
workflow ships it. To do it manually from the VPS instead:
```bash
sudo -u deploy /opt/primaries-fit/bin/deploy.sh
```

To roll back to a previous release:
```bash
ls -1t /opt/primaries-fit/releases          # find the stamp to roll back to
sudo -u deploy bash -c '
  ln -sfn /opt/primaries-fit/releases/<stamp> /opt/primaries-fit/current.tmp
  mv -T /opt/primaries-fit/current.tmp /opt/primaries-fit/current
'
```

---

## Analytics (optional, privacy-preserving)

There is **no analytics by default** — the build ships zero third-party
requests, which is what lets the welcome screen promise an anonymous
questionnaire. To get a unique-visitor count, set one build-time env var and
the app injects a [GoatCounter](https://www.goatcounter.com) beacon (no
cookies, no personal data, unique visits via a salted hash rotated daily —
nothing to consent to, and it only ever sees a pageview, never a
questionnaire answer):

```bash
# in the CI Deploy step, before `npm run build`
export VITE_GOATCOUNTER="https://<yourcode>.goatcounter.com/count"
```

Leave it unset and nothing loads. Implementation and alternatives (self-hosted
Umami/Plausible, or a log-based count off Caddy's access log) are documented in
`src/analytics.ts`.

---

## Adding a second app to this host

1. Give the new app its own directory under `/opt/<appname>/` (or its own
   systemd unit if it's not static), owned by its own service user
2. Add a block to `/etc/caddy/Caddyfile`:
   ```
   another.example.com {
       root * /opt/<appname>/current
       file_server
   }
   ```
3. Reload Caddy: `sudo systemctl reload caddy`

No UFW changes needed (only 80/443 are public).

---

## Useful commands on the VPS

```bash
# Caddy
sudo systemctl status caddy
sudo journalctl -u caddy -n 50 --no-pager
sudo caddy validate --config /etc/caddy/Caddyfile

# Release state
ls -1t /opt/primaries-fit/releases   # newest first
readlink /opt/primaries-fit/current  # which release is live
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| HTTPS cert not issued | DNS not yet propagated | Wait 5–10 min; check with `dig primaries.fit` |
| `deploy.sh` fails at `git fetch`/`git reset` | Deploy key not added to GitHub, or `repo/` never cloned | Confirm the key from server-setup.sh's output is added at github.com/Itaypk/primaries-fit/settings/keys, then re-run the clone from Day 1 step 2 |
| GitHub Actions `Deploy` job fails to connect | `DEPLOY_SSH_KEY`/`DEPLOY_HOST`/`DEPLOY_KNOWN_HOSTS` missing or stale, or the CI pubkey was never added to `deploy`'s `authorized_keys` | Re-check the three secrets and the `authorized_keys` step above |
| Site serves an old version after a deploy | Browser/CDN cache, not a deploy issue (the symlink swap is atomic) | Hard-refresh; check `readlink /opt/primaries-fit/current` matches the latest `releases/` stamp |
| `Unit caddy.service not found` | `server-setup.sh` not run, or failed before step 7 | Re-run setup |
| Caddy's default welcome page on `:80`, connection refused on `:443` | Caddy is running an older in-memory config and never picked up `/etc/caddy/Caddyfile` (no site block ⇒ no TLS) | `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`. Compare `systemctl show -p ActiveEnterTimestamp caddy` against the Caddyfile's mtime to confirm. |
