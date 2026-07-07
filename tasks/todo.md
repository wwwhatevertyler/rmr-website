# RMR Website — To Do

## Current

- [x] Polish hero floating image interaction and unify click audio behavior
- [x] Add Netlify build output and clean route configuration
- [x] Wire advisor, contact, and newsletter forms to Netlify Forms
- [x] Keep blog static with clean `/insights/:slug` production routes
- [x] Exclude docs, tasks, stale exports, sandbox files, and audio experiments from production output
- [x] Connect Netlify project to GitHub and verify preview deployment
- [x] Add seamless same-tab navigation so background audio continues across internal pages
- [x] Add root README/DESIGN.md and archive unused source assets outside production paths
- [x] Refresh styleguide to match current homepage, blog, forms, metadata, footer, and motion rules
- [x] Move active website source into organized `website/` folders while preserving Netlify output paths
- [x] Update homepage social metadata and verify generated output before production push
- [x] Integrate `rmr-logo-new.png` as the primary site logo while preserving the original logo variant
- [x] Add homepage-only logo press/spin before the soft-navigation curtain sweep
- [x] Fix sampled click audio after logo-triggered soft navigation
- [x] Point GoDaddy DNS from Framer to Netlify after preview approval
- [x] Add production sitemap and robots file for Search Console
- [x] Generate static article pages with first-response SEO metadata

## Recent Verification

- 2026-07-04: Ran `npm run build`; `dist/` includes both `rmr-logo-new.png` and `rmr-logo.png`, and generated nav/footer references use `rmr-logo-new.png`.
- 2026-07-05: Ran `npm run build`; served `dist/` locally and verified via Brave headless CDP that the home logo press/spin finishes before the curtain starts, reduced motion skips the spin, normal home nav links transition immediately, and non-home logos do not get the spin hook.
- 2026-07-05: Rebuilt after switching the homepage logo experiment to `rmr-logo.png` and refining the spin easing; Brave headless CDP verified the revised animation ends before the curtain starts and reduced motion still skips the spin.
- 2026-07-05: Rebuilt after moving the homepage logo spin to WAAPI and increasing the opt-in logo to 44px; Brave headless CDP verified the logo stays inside the 68px nav, the 540ms animation finishes before the curtain, reduced motion skips it, and non-home logos remain unchanged.
- 2026-07-05: Rebuilt after rolling the 44px `rmr-logo.png` WAAPI click transition to all nav/footer logos; Brave headless CDP verified every active page nav/footer logo has the hook, representative nav/footer clicks finish animation before the curtain, and reduced motion skips the spin.
- 2026-07-06: Ran `node --check website/scripts/audio.js website/scripts/router.js` and `npm run build`; Brave headless CDP verified sampled click audio fires once before/after home and contact logo soft-navigation, repeated `RMRAudio.ensureMounted()` calls do not duplicate click sounds, the logo spring still precedes the curtain, and reduced motion skips the logo animation.
- 2026-07-06: Updated public SEO/social URLs to `https://www.rollmyretirement.com`; ran `node --check website/scripts/audio.js website/scripts/router.js`, `npm run build`, static headless Brave checks for home/advisors/contact/insights, and an in-process Netlify-style route check for `/insights/the-quiet-power-of-moving-your-401k`.
- 2026-07-06: Cut over GoDaddy DNS from Framer to Netlify. Public DNS checks via Cloudflare and Google resolve `www.rollmyretirement.com` to `rollmyretirement.netlify.app` and `rollmyretirement.com` to `75.2.60.5`; forced Netlify edge checks return `200` for home/advisors/contact/insights/article routes and `301` from the apex to `https://www.rollmyretirement.com/`.
- 2026-07-06: Added generated `sitemap.xml` and `robots.txt`; ran `node --check scripts/build-static.mjs` and `npm run build`, then verified the sitemap contains the homepage, advisors, contact, insights, and all eight article URLs on `https://www.rollmyretirement.com`.
- 2026-07-06: Added generated static article pages served at `/insights/<slug>` via generated `.html` files, with server-rendered title, description, canonical, Open Graph, Twitter, Article JSON-LD, embedded post data, and visible article body HTML. Verified `node --check scripts/build-static.mjs`, `npm run build`, `xmllint --noout dist/sitemap.xml`, Netlify article routing rules, and representative generated article metadata for `/insights/when-to-roll-over-your-401k`.

## Backlog

_Add items here as they come up._
