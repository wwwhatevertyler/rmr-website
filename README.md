# Roll My Retirement Website

Static marketing site for Roll My Retirement, a retirement rollover platform that connects people with vetted financial advisors. The site is hosted on Netlify and built from `website/` source files into `dist/`.

## Start Here

- `DESIGN.md` - canonical company, design system, content, motion, and implementation guidance.
- `CLAUDE.md` - agent-facing project notes and sharp warnings.
- `docs/project/deployment.md` - Netlify domain, build command, and deploy workflow.
- `tasks/todo.md` - current project checklist.
- `tasks/lessons.md` - durable project-specific learnings.

## Source Pages

These files are the source of truth. Do not move or rename them without also updating `scripts/build-static.mjs`, `netlify.toml`, and internal links.

| Source file | Production route | Purpose |
| --- | --- | --- |
| `website/pages/home.html` | `/` | Consumer homepage |
| `website/pages/advisors.html` | `/advisors` | Advisor network landing page |
| `website/pages/contact.html` | `/contact` | Consumer contact/get-started form |
| `website/pages/insights.html` | `/insights` | Blog index |
| `website/pages/article.html` | `/insights/:slug` | Blog post detail renderer |
| `website/pages/styleguide.html` | local/reference | Visual system reference |

Shared runtime files:

- `website/scripts/footer.js` - shared footer component.
- `website/scripts/router.js` - soft-navigation layer so audio continues across internal pages.
- `website/scripts/audio.js` - background audio and click sound system.
- `website/scripts/cursor.js` - small cursor/detail behavior.
- `website/data/blog/posts.json` - blog data and article body content.

## Build And Deploy

```bash
npm run build
```

The build copies only production files into `dist/`. Netlify publishes `dist/`, not the repo root.

- Netlify app domain: `https://rollmyretirement.netlify.app`
- Build command: `npm run build`
- Publish directory: `dist`
- Config: `netlify.toml`

Netlify is connected to GitHub, so pushing `main` should trigger deployment.

## Asset Rules

- Source images live in `website/assets/images/`; the build emits them to `dist/Website Images/` to preserve public image URLs.
- Source favicon/logo files live in `website/assets/icons/`; the build emits public metadata assets to the `dist/` root:
  - `rmr-logo.png` - primary nav/footer logo
  - `rmr-logo-new.png` - alternate design-system logo variant
  - `favicon.ico`
  - `favicon-32x32.png`
  - `favicon-192x192.png`
  - `favicon-512x512.png`
  - `apple-touch-icon.png`
  - `site.webmanifest`
- Production audio lives in `website/assets/audio/`; the build emits it to `dist/audio/`.
- `docs/source-assets/` contains non-published source/back-pocket assets.
- `docs/source-assets/_archive/` is ignored and only for old local exports, stale drafts, and temporary inbox files.

## Cleanup Guardrails

- `dist/` is generated. Do not edit it by hand.
- Root `rmr-*.html` files are generated compatibility outputs, not source files.
- Preview from a built `dist/` server rather than opening source HTML directly.
- Keep `footer.js`, `audio.js`, `cursor.js`, and `router.js` idempotent because soft navigation reruns page scripts without a full browser refresh.
