# Project site deployment

The landing and docs (`npm run build` → `dist-site/`) are served at
https://projects.angelsirlopu.dev/live-deck/ from the owner's VPS.

- `/opt/projects/compose.yaml` and `/opt/projects/nginx.conf` on the server are
  copies of the files in this folder: one `nginx:1.28-alpine` container
  (`projects-web`) on the `visoria_default` network serving `/opt/projects/www`.
  `/` redirects to `/live-deck/`.
- The edge Caddy (`/opt/visoria/backend/Caddyfile`) proxies the subdomain:

  ```caddyfile
  projects.angelsirlopu.dev {
      encode zstd gzip
      reverse_proxy projects-web:80
  }
  ```

- DNS: A record `projects` → the VPS IP.

Deploy a new build:

```sh
npm run deploy      # build, link check, rsync to /opt/projects/www/live-deck/
```

No container restart is needed: nginx serves the new files immediately.
