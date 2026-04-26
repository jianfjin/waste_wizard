# Waste Wizard on GCP VM + Cloudflare Tunnel

This document captures the working settings for running `waste_wizard` on a Google Cloud VM and exposing it at `game.xueba.us.kg`.

## Current target

- VM host: `hermes-server` (`34.172.173.179`)
- App process: `waste-wizard.service`
- App port: `3001` (port `3000` is used by Hermes WhatsApp bridge)
- Public hostname: `game.xueba.us.kg`
- Tunnel service URL: `http://localhost:3001`

## 1) VM app service (`systemd`)

Use this file:

- `deployment/systemd/waste-wizard.service`

Key settings in that unit:

- `User=jianfjin`
- `Group=jianfjin`
- `WorkingDirectory=/home/jianfjin/projects/waste_wizard`
- `Environment=PORT=3001`
- `ExecStart=... vite preview --host 0.0.0.0 --port 3001 --strictPort`

Install/update:

```bash
sudo cp deployment/systemd/waste-wizard.service /etc/systemd/system/waste-wizard.service
sudo systemctl daemon-reload
sudo systemctl enable --now waste-wizard
sudo systemctl restart waste-wizard
sudo systemctl status waste-wizard -l --no-pager
```

Expected logs:

- `Local: http://localhost:3001/`
- `Network: http://<vm-internal-ip>:3001/`

## 2) Vite host allow-list

In `vite.config.ts`, keep:

```ts
allowedHosts: ['app.xueba.us.kg', 'game.xueba.us.kg']
```

Then rebuild/restart app:

```bash
npm run build
sudo systemctl restart waste-wizard
```

Important:

- For `.env` updates (for example `GEMINI_API_KEY`), always run `npm run build` first, then restart `waste-wizard`.

## 3) Cloudflare Tunnel route (temporary single-tunnel mode)

If you are still using one shared tunnel, configure in Cloudflare Zero Trust -> Tunnels -> `jinj_app_01` -> `Published application routes`:

- Hostname: `game.xueba.us.kg`
- Service type: `HTTP`
- URL: `localhost:3001`
- Path: empty (match all paths)

Important:

- Do not set path to `^/blog` unless you only want `/blog...` routed.
- Make sure the URL is `game.xueba.us.kg` (not typo `game.xuehab.us.kg`).

For the permanent split-tunnel setup, follow `deployment/CLOUDFLARE_SPLIT_TUNNEL_SETUP.md`.

## 4) Connector topology (prevents intermittent 502)

This tunnel currently has two connectors:

- Windows desktop connector
- VM connector (`hermes-server`)

If both connectors stay in one tunnel, route `localhost:3001` may hit the Windows connector (where nothing listens on 3001) and return `502`.

Recommended permanent fix:

- Use split tunnels (desktop tunnel + VM tunnel), documented in:
  - `deployment/CLOUDFLARE_SPLIT_TUNNEL_SETUP.md`

## 5) Verification checklist

On VM:

```bash
curl -I http://localhost:3001
sudo systemctl status waste-wizard -l --no-pager
sudo systemctl status cloudflared -l --no-pager
sudo journalctl -u cloudflared -n 120 --no-pager
```

In Cloudflare logs:

- Requests for `game.xueba.us.kg` should route to VM connector and service `localhost:3001`.

## 6) Replacing old cloudflared service with new VM tunnel

If VM returns:

`cloudflared service is already installed at /etc/systemd/system/cloudflared.service`

run:

```bash
# if `cloudflared tunnel run --token ...` is running in shell, stop it first (Ctrl+C)
sudo systemctl stop cloudflared
sudo cloudflared service uninstall
sudo cloudflared service install <NEW_VM_TUNNEL_TOKEN>
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared -l --no-pager
```

Important:

- `ICMP proxy feature is disabled` warning is usually non-fatal for web routing.
- `UDP receive buffer` warning is usually non-fatal.
- If token is exposed in logs/chat history, rotate it in Cloudflare and reinstall service with the rotated token.

## 7) Known failure patterns

- `Blocked request. This host is not allowed.`  
  `game.xueba.us.kg` missing from `server.allowedHosts`.

- `502 Bad Gateway` with app healthy on VM  
  Usually connector mismatch (multi-machine tunnel) or wrong route URL/Path.

- App starts on unexpected port  
  Another process owns that port; `--strictPort` now forces fast failure instead of auto-switch.
