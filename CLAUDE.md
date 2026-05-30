# RMR Website — Claude Instructions

## Project Context

Roll My Retirement website rebuild. The advisor page design is the visual source of truth and becomes the brand system for the full site.

## Reference Screenshots

See `docs/reference/README.md` for the full screenshot index.

## Key Docs

- `docs/project/brand.md` — colors, typography, tokens
- `docs/project/site-map.md` — pages and routing
- `docs/project/animation-system.md` — motion principles and patterns
- `docs/project/content.md` — copy and content decisions
- `tasks/todo.md` — current task list
- `tasks/lessons.md` — durable project lessons

## Active Pages

Do not confuse these with draft files in the root:

| File | Page |
|------|------|
| `rmr-home.html` | Home |
| `rmr-contact.html` | Contact (**not** `rmr-contact-page.html` — that is a stale draft) |
| `rmr-advisors-page.html` | Advisor network |
| `rmr-styleguide.html` | Design system reference |
| `footer.js` | Shared footer component |

## Design System Decisions

### Footer
- `footer.js` is the **single source of truth** for the site footer. Edit it once; it updates every page.
- All pages use `<div id="site-footer"></div>` + `<script src="footer.js"></script>` — never write per-page `<footer>` HTML.
- Footer is documented in the styleguide at `rmr-styleguide.html#footer`.
- Copyright year is dynamic (`new Date().getFullYear()`) — never hard-code it.

### Color / Theme
- **All footers and footer CTAs are light** (`var(--bg)` / `#fafaf8`). Dark sections (`var(--bg-dark)`) are for process/interior content sections only — not footer, not footer CTA.
- Always use CSS custom property tokens from `brand.md`. Never use raw hex values.

### Trust / Value Strip
- Uses a 4-column CSS grid (`value-strip-inner` / `value-item` classes) matching the home page pattern.
- No dot indicators. No flexbox centering. The home page pattern is the canonical one.

### Logos & Nav
- Footer logo and nav logo are both `40px` height, both link to `rmr-home.html`.
- Nav link style: `13px`, `font-weight: 500`, `color: var(--text-muted)`, `letter-spacing: -0.01em`, `transition: color 0.35s ease`.
- Footer links must match nav link styles exactly.

### GSAP + Transforms
- Never use `transform: translateX(-50%)` for centering elements that GSAP also animates — GSAP overwrites the CSS transform on re-render, causing layout drift on resize. Use `left: 0; right: 0; width: 100%; text-align: center` instead.

## Deployment

- GitHub repo: `https://github.com/wwwhatevertyler/rmr-website`
- Public URL: `https://wwwhatevertyler.github.io/rmr-website/`
- Pushing to `main` deploys automatically via GitHub Pages — no separate step needed.
