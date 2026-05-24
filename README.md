# Void Client - Eaglercraft 1.8.8 Launcher Site

Void Client is a complete static web launcher package for an Eaglercraft 1.8.8 browser client, ready for GitHub Pages deployment.

## Included

- Branded landing page (`index.html`)
- Full launcher page with offline username and server tools (`launcher.html`)
- Setup docs + FAQ (`docs.html`)
- Public status + changelog (`status.html`)
- Legal/compliance page (`legal.html`)
- Support/contact page (`support.html`)
- 404 fallback (`404.html`)
- PWA basics (`manifest.webmanifest`, `sw.js`)
- SEO basics (`robots.txt`, `sitemap.xml`)
- Config-driven theming + branding (`site-config.js`)
- GitHub Pages auto-deploy workflow (`.github/workflows/deploy-pages.yml`)

## Quick Start

1. Edit `site-config.js` (brand, colors, links, featured server).
2. Replace placeholder assets in `assets/images/`.
3. Replace `assets/client/eaglercraft-1.8.8.html` with your authorized client entry file.
4. Update URLs in `robots.txt` and `sitemap.xml`.
5. Push to `main` (Pages deploy workflow runs automatically).

## Launcher Query Params

- `username`: prefill username
- `autoconnect=1`: auto-launch connect
- `server=host:port`: override selected server

Example:

`launcher.html?username=VoidPlayer&autoconnect=1&server=play.example.com:25565`

## Compliance

Read `LEGAL.md` before public release. This project is distributed as placeholders/template content only.