# RMR Website — Claude Instructions

## Project Context

Roll My Retirement website rebuild. The advisor page design is the visual source of truth and becomes the brand system for the full site.

## Reference Screenshots

See `docs/reference/README.md` for the full screenshot index.

## Key Docs

- `README.md` — project map, source pages, build flow
- `DESIGN.md` — canonical company, design, content, assets, and motion system
- `docs/project/brand.md` — colors, typography, tokens
- `docs/project/site-map.md` — pages and routing
- `docs/project/deployment.md` — Netlify domain and deploy workflow
- `docs/project/animation-system.md` — motion principles and patterns
- `docs/project/content.md` — copy and content decisions
- `tasks/todo.md` — current task list
- `tasks/lessons.md` — durable project lessons

## Active Pages

Source pages live under `website/`. Root `rmr-*.html` filenames are generated compatibility outputs only.

| File | Page |
|------|------|
| `website/pages/home.html` | Home |
| `website/pages/contact.html` | Contact |
| `website/pages/advisors.html` | Advisor network |
| `website/pages/insights.html` | Blog index / insights |
| `website/pages/article.html` | Blog post detail renderer |
| `website/pages/styleguide.html` | Design system reference |
| `website/scripts/footer.js` | Shared footer component |

## Design System Decisions

### Footer
- `website/scripts/footer.js` is the **single source of truth** for the site footer. Edit it once; it updates every page.
- All pages use `<div id="site-footer"></div>` + `<script src="footer.js"></script>` — never write per-page `<footer>` HTML.
- Footer is documented in the styleguide at `website/pages/styleguide.html#footer`.
- Copyright year is dynamic (`new Date().getFullYear()`) — never hard-code it.

### Color / Theme
- **All footers and footer CTAs are light** (`var(--bg)` / `#fafaf8`). Dark sections (`var(--bg-dark)`) are for process/interior content sections only — not footer, not footer CTA.
- Always use CSS custom property tokens from `brand.md`. Never use raw hex values.

### Trust / Value Strip
- Uses a 4-column CSS grid (`value-strip-inner` / `value-item` classes) matching the home page pattern.
- No dot indicators. No flexbox centering. The home page pattern is the canonical one.

### Logos & Nav
- Primary footer/nav logo is `rmr-logo-new.png`; keep `rmr-logo.png` as the original design-system variant. Footer logo and nav logo are both `40px` height. Production links normalize to `/`; local generated output may use `rmr-home.html`.
- Nav link style: `13px`, `font-weight: 500`, `color: var(--text-muted)`, `letter-spacing: -0.01em`, `transition: color 0.35s ease`.
- Footer links must match nav link styles exactly.

### GSAP + Transforms
- Never use `transform: translateX(-50%)` for centering elements that GSAP also animates — GSAP overwrites the CSS transform on re-render, causing layout drift on resize. Use `left: 0; right: 0; width: 100%; text-align: center` instead.

## Deployment

- GitHub repo: `https://github.com/wwwhatevertyler/rmr-website`
- Netlify app domain: `https://rollmyretirement.netlify.app`
- Production host: Netlify, publishing the generated `dist/` folder.
- Build command: `npm run build`
- Public domain target: `rollmyretirement.com` / `www.rollmyretirement.com`
- Do not publish the repo root directly. The root contains project docs, tasks, stale Framer exports, and local experiments.
