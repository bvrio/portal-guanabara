# Local DEV Routing (optional)

The local browser experience can use **Product Identity hostnames** instead of application ports.

```text
DEV    http://<product>.<persona>.dev.com.br/<journey>
CONST  https://<product>.<persona>.cons.com.br/<journey>
PROD   https://<product>.<persona>.com.br/<journey>
```

For Portal Guanabara:

```text
http://portalguanabara.dev.com.br             → clients-webapp     (127.0.0.1:3000)
http://portalguanabara.parceiros.dev.com.br   → partners-webapp    (planned, :3001)
http://portalguanabara.operacao.dev.com.br    → backoffice-webapp  (planned, :3002)
```

Ports are implementation details. They must not appear in the canonical Product Identity URL or in tracking identity.

> Nginx is **not required** to run the project. `http://127.0.0.1:3000` works without it.

## One-time macOS setup

Assumes Homebrew (see `docs/setup/macos.md`).

### 1. Install Nginx

```bash
brew install nginx
```

### 2. Install the project DEV configuration

```bash
sudo cp dev/nginx/nginx.dev.conf "$(brew --prefix)/etc/nginx/nginx.conf"
```

### 3. Register the local hostnames once

```bash
sudo nano /etc/hosts
```

Add:

```text
127.0.0.1 portalguanabara.dev.com.br
```

(Add the `parceiros` / `operacao` hostnames when those Apps exist.)

### 4. Validate Nginx

```bash
sudo nginx -t -c "$(brew --prefix)/etc/nginx/nginx.conf"
```

Expected: `syntax is ok` / `test is successful`.

### 5. Start Nginx

If Homebrew's Nginx service is running, stop it first so it does not hold port 80/8080:

```bash
brew services stop nginx
sudo nginx -c "$(brew --prefix)/etc/nginx/nginx.conf"
```

Reload after a config change / stop:

```bash
sudo nginx -t -c "$(brew --prefix)/etc/nginx/nginx.conf" && sudo nginx -s reload
sudo nginx -s stop
```

The configuration listens on port 80, so the URL needs no `:port` suffix (port 80 requires `sudo`).

### 6. Start the App and open the Product Identity URL

```bash
pnpm dev:clients
open http://portalguanabara.dev.com.br/authentication/login
```

## Nuxt / Vite notes

- Every Product Identity hostname must be listed in `vite.server.allowedHosts` in the App's `nuxt.config.ts`; otherwise Vite answers **403 Blocked request**.
- The config forwards WebSocket upgrade headers so Vite HMR keeps working through the hostname. If HMR misbehaves, first check the App directly on its port, then the Nginx config.

## HTTPS later

Start with HTTP. When local HTTPS becomes necessary, use a trusted local certificate tool such as `mkcert` and add the certificates to the DEV config.
