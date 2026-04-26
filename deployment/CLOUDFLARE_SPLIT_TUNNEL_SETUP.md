# Cloudflare Split-Tunnel Setup (Desktop + VM)

Use this setup to permanently avoid `502 Bad Gateway` caused by multi-machine connectors sharing `localhost` routes.

## Why split tunnels

In Cloudflare Tunnel, origin `localhost:<port>` is resolved on the connector machine that receives the request.

If one tunnel has both:

- Desktop connector
- VM connector

then route `game.xueba.us.kg -> localhost:3001` may be sent to desktop, where port `3001` is not serving `waste_wizard`, causing intermittent `502`.

## Target architecture

- Tunnel `jinj-desktop-01` (desktop-only connector)
  - `app.xueba.us.kg -> http://localhost:3000` (desktop app)
  - `survey.xueba.us.kg -> http://localhost:8501` (desktop service)
- Tunnel `jinj-vm-01` (VM-only connector: `hermes-server`)
  - `game.xueba.us.kg -> http://localhost:3001` (waste_wizard on VM)

Rule: each hostname route should live in exactly one tunnel, and that tunnel should have connectors for only the machine(s) that can serve its `localhost` origin.

## Migration from current mixed tunnel

Current state (problematic):

- Single tunnel `jinj_app_01` with both desktop + VM connectors.

### 1) Create a new VM-only tunnel

In Cloudflare Zero Trust:

- Go to `Networks -> Tunnels`
- Create tunnel: `jinj-vm-01`
- Choose connector platform `Linux`
- Copy generated install command:

```bash
sudo cloudflared service install <VM_TUNNEL_TOKEN>
```

Run that on VM (`hermes-server`).

### 1.1) If VM already has an old cloudflared service

If you see:

`cloudflared service is already installed at /etc/systemd/system/cloudflared.service`

replace the old service with the new VM tunnel token:

```bash
# stop any foreground token-run session first (Ctrl+C)
sudo systemctl stop cloudflared
sudo cloudflared service uninstall
sudo cloudflared service install <VM_TUNNEL_TOKEN>
sudo systemctl enable --now cloudflared
```

Then verify:

```bash
sudo systemctl status cloudflared -l --no-pager
sudo journalctl -u cloudflared -n 120 --no-pager
```

Notes:

- `ICMP proxy feature is disabled` warning is usually non-blocking for HTTP tunnel routes.
- `failed to sufficiently increase receive buffer size` warning is usually non-blocking.

### 2) Ensure VM connector is healthy

On VM:

```bash
sudo systemctl status cloudflared -l --no-pager
sudo journalctl -u cloudflared -n 120 --no-pager
```

In Cloudflare UI, `jinj-vm-01` should show exactly one connector (`hermes-server`) as connected.

### 3) Move `game` route to VM tunnel

In `jinj-vm-01` add published application route:

- Hostname: `game.xueba.us.kg`
- Type: `HTTP`
- URL: `localhost:3001`
- Path: empty

Important:

- Keep `Path` empty unless you intentionally match specific paths.
- `^/blog` in Path will not match `/` and can look like broken routing.

### 4) Remove `game` route from desktop tunnel

In old tunnel (`jinj_app_01`), delete or disable:

- `game.xueba.us.kg -> localhost:3001`

Keep only desktop-owned routes in desktop tunnel.

### 5) Keep desktop tunnel desktop-only

For `jinj_app_01`, keep only desktop connector(s).  
For `jinj-vm-01`, keep only VM connector(s).

This connector separation is what removes intermittent 502.

### 6) Rotate exposed tunnel token

If a tunnel token was pasted into terminal/chat history, rotate it in Cloudflare:

- Tunnel -> `Configure`/`Manage` -> `Rotate token`

After rotating, reinstall service on VM with the new token:

```bash
sudo systemctl stop cloudflared
sudo cloudflared service uninstall
sudo cloudflared service install <NEW_VM_TUNNEL_TOKEN>
sudo systemctl enable --now cloudflared
```

## VM app prerequisites

On VM, `waste_wizard` must be healthy on `3001`:

```bash
sudo systemctl status waste-wizard -l --no-pager
curl -I http://localhost:3001
```

Also ensure Vite host allow-list includes:

```ts
allowedHosts: ['app.xueba.us.kg', 'game.xueba.us.kg']
```

If `.env` values changed (for example `GEMINI_API_KEY`), rebuild and restart on VM:

```bash
cd ~/projects/waste_wizard
npm run build
sudo systemctl restart waste-wizard
```

## Validation checklist

1. `https://game.xueba.us.kg` loads from VM consistently.
2. Cloudflare tunnel `jinj-vm-01` has VM connector only.
3. Cloudflare tunnel `jinj_app_01` has desktop connector only.
4. No duplicate `game.xueba.us.kg` route across tunnels.
5. VM `cloudflared` service is running with the new VM tunnel token.

## Troubleshooting

- `502 Bad Gateway`:
  - Route points to wrong port.
  - Route has restrictive `Path` (for example `^/blog`).
  - Hostname exists in wrong tunnel or multiple tunnels.
  - Connector for selected tunnel cannot serve that `localhost` service.

- `Blocked request. This host is not allowed.`:
  - Missing host in Vite `allowedHosts`.
