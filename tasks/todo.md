# RMR Website — To Do

## Current

- [ ] Configure Netlify form-submission email notifications in the Netlify dashboard
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
- [x] Add production launch handoff documentation
- [x] Polish mobile menu CTA styling and advisor arrows
- [x] Raise page transition curtain above persistent audio and cursor overlays
- [x] Point Netlify AJAX form submissions at their owning page routes

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
- 2026-07-06: Verified the deployed article route through Netlify and the custom domain: `/insights/when-to-roll-over-your-401k` returns `200` with static title/canonical/Open Graph/JSON-LD/H1 in the first HTML response, while the trailing-slash variant returns `301` back to the canonical no-slash URL.
- 2026-07-06: Added `docs/project/launch-2026-07-06.md` to package the launch, DNS cutover, Search Console, SEO improvements, verification, commits, and follow-up production checklist for future context.
- 2026-07-07: Fixed mobile menu CTA inheritance so mobile `Let's Talk` and `Apply to Join` buttons render as centered black pill CTAs with white text and arrows; added mobile `For Advisors →` decorative arrow spans. Ran `npm run build`, `node --check website/scripts/router.js`, `node --check website/scripts/audio.js`, inspected generated output, and verified mobile screenshots/computed styles for home/advisors/contact/insights/article routes.
- 2026-07-07: Raised `#page-curtain` to `z-index: 1000000` across production page templates so the black route-transition sweep covers persistent fixed overlays. Ran `npm run build`, inspected generated `dist` output for the updated curtain layer, and used headless Brave against a local `dist` server to verify soft-navigation transitions through home, advisors, contact, insights, and one article route keep the visible sweep above audio (`z-index: 9990`) and cursor (`z-index: 99999`).
- 2026-07-07: Verified live contact/advisor pages contain Netlify form markup, but live POST tests returned Netlify `404` before dashboard form detection was enabled/confirmed. Updated contact, advisor, and newsletter forms to include explicit `action` routes (`/contact`, `/advisors`, `/insights`) and changed AJAX submits to post to each form's own action. Ran `npm run build` and inspected generated `dist` output for the corrected form actions and submit targets.
- 2026-07-07: Pushed the corrected form action routes to production and verified the live HTML includes `action="/contact"` and `action="/advisors"`. Follow-up live POST tests still returned Netlify `404`, so Netlify Forms detection/capture must be enabled or confirmed in the Netlify dashboard before submissions will be stored.
- 2026-07-07: After Netlify Forms detection was enabled, pushed empty commit `288854d` to trigger a fresh Netlify form scan. Live POST tests to `/contact` (`consumer-contact`) and `/advisors` (`advisor-application`) returned `200`, confirming Netlify Forms capture is active for both lead forms. Email notification setup remains a dashboard configuration step.

## Backlog

_Add items here as they come up._
