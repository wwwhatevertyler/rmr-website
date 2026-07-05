# Roll My Retirement Design System

This is the canonical design and company reference for the RMR website. When project docs or page code disagree, update them back toward this file and the current shipped pages.

## 1. Company And Product

Roll My Retirement helps people who changed jobs, have old 401(k)s, or feel unsure about rollover decisions get connected with vetted financial professionals. The consumer-facing promise is calm control: no pressure, no obligation, no direct cost to the user.

Primary audiences:

- **Consumers in transition** - people with old 401(k)s, scattered retirement accounts, inherited assets, or uncertainty about moving retirement money.
- **Financial advisors** - growth-focused professionals who want qualified rollover conversations and can meet the network's quality bar.

Core jobs:

- Explain rollover choices in plain language.
- Help people find and evaluate local advisors.
- Give advisors a selective, trust-led acquisition channel.
- Make financial action feel less intimidating and more concrete.

Brand voice:

- Calm, precise, editorial, human.
- Confident but never loud.
- Clear enough for anxious users, refined enough for a financial category.
- Avoid startup hype, pressure language, and generic promises.

## 2. Visual Theme

RMR is a warm editorial fintech site: gallery-airy density, asymmetric restraint, tactile but quiet motion. The page should feel like a well-lit architecture studio for retirement decisions - calm surfaces, carefully chosen photography, strong whitespace, and exact typography.

Baseline:

- **Density:** 4/10 - spacious, but not empty.
- **Variance:** 7/10 - asymmetric, image-led, controlled.
- **Motion:** 5/10 - expressive entrances and soft scroll effects, no spectacle.

The interface should not look like a default fintech dashboard or a generic SaaS landing page. It should feel premium, practical, and slightly editorial.

## 3. Color Palette

Use these tokens across all pages:

```css
:root {
  --bg: #fafaf8;
  --bg-card: #f4f3ef;
  --bg-dark: #111110;
  --text: #111110;
  --text-muted: #6b6b66;
  --text-light: #9b9b94;
  --border: #e4e3de;
  --border-strong: #c8c7c0;
  --accent: #111110;
  --radius-card: 18px;
  --radius-sm: 10px;
  --max-w: 1120px;
  --pad-x: clamp(24px, 5vw, 64px);
  --section-gap: clamp(72px, 10vw, 104px);
}
```

Roles:

- **Warm Canvas** `#fafaf8` - page background and light footer/footer CTA.
- **Soft Card** `#f4f3ef` - cards, process sections, newsletter surfaces.
- **Charcoal Ink** `#111110` - primary text, dark buttons, dark sections.
- **Muted Copy** `#6b6b66` - body copy and secondary labels.
- **Quiet Metadata** `#9b9b94` - microcopy, meta, inactive links.
- **Warm Border** `#e4e3de` - default 1px dividers.
- **Strong Border** `#c8c7c0` - emphasized outlines and icon rings.

Rules:

- Use `--bg-dark` as the single accent.
- Do not introduce purple, neon blue, gradient text, or glow effects.
- Do not use pure `#000000`. Use pure `#ffffff` only for established contrast surfaces such as forms, blog/card bodies, and inverted dark-section buttons.

## 4. Typography

Fonts are loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
```

Use:

- **Display:** Instrument Serif, 400 weight, tight letter spacing.
- **Body/UI:** Inter, 300-600 weights, calm line-height.
- **Mono:** system mono only in docs/styleguide specs, not public marketing UI.

Scale:

- `h1`: `clamp(40px, 6vw, 72px)`, line-height `1.06`, letter-spacing `-0.025em`.
- Secondary page `h1`: `clamp(36px, 5.5vw, 64px)`.
- `h2`: `clamp(28px, 4vw, 48px)`, line-height `1.12`.
- `h3`: 15-18px, 600, letter-spacing `-0.01em`.
- Body: 15-16px, line-height `1.65-1.7`.
- Eyebrow: 11px, uppercase, 0.12em tracking.

Editorial `<em>` inside display headings uses Instrument Serif italic and muted color.

## 5. Layout

- Root content uses `.container` with `max-width: var(--max-w)` and `padding: 0 var(--pad-x)`.
- Major sections use `padding: var(--section-gap) 0`.
- Use CSS Grid for page-level structure.
- Keep rows calm and scannable; do not over-card every section.
- Mobile under 700-760px collapses to a single column, hides decorative hero float images, and preserves 44px+ touch targets.

Important current sections:

- Homepage hero: centered editorial headline with two decorative floating image cards.
- Homepage value strip: four-column trust/value row, collapsing to two columns then one column.
- Homepage network: text plus interactive SVG particle field.
- Blog: featured card, article grid, compact list, newsletter CTA.
- Advisors: split hero, dark advisor card, 2x2 value cards, dark process section, checklist, application form.
- Contact: large editorial watermark, centered form, selector pills.

## 6. Components

### Buttons

- Pill shape, `border-radius: 100px`.
- Primary: `--bg-dark` fill, white text.
- Secondary: transparent fill, `--border-strong` border.
- Ghost-light: only on dark backgrounds.
- Arrow spans move `translateX(3px)` on hover.
- Keep repeated click/submit sounds at the same volume through `audio.js`.

### Cards

- Default card background: `--bg-card`.
- Radius: `--radius-card` (`18px`).
- Border: `1px solid var(--border)`.
- Hover: subtle background lift to `#fff` and tinted shadow.
- Blog cards use image-led top regions and must keep image crops intentional via `object-position` or `--post-image-position`.

### Forms

- Labels sit above fields.
- Inputs/selects/textareas use `--radius-sm`, `--border`, `--bg`.
- Focus uses `border-color: var(--bg-dark)`.
- Selector pills are real radio inputs visually styled as pill choices.
- Errors are inline and use `aria-live` where present.
- Netlify Forms hidden fields must stay intact.

### Footer

`website/scripts/footer.js` is the only source of truth for the site footer. Every page should include:

```html
<div id="site-footer"></div>
<script src="footer.js"></script>
```

Footer and normal footer CTA sections are light (`--bg`). The article detail page may retain its dark CTA treatment as a deliberate contrast moment unless the site is later normalized.

## 7. Imagery And Assets

Photography is editorial and slightly quiet: real materials, people, city motion, warm light, and considered crops. Do not use generic finance stock imagery.

Source image folder: `website/assets/images/`. The build emits these files to `dist/Website Images/` so current public image URLs remain stable.

- `image 28.png` - first article cover.
- `image.png` - featured 401(k) timing article.
- `Li Hui - Photographer License image - Original.png` - hero left float and IRA/Roth card.
- `ariannalago_ari1645-047_Human_S_hero.jpg` - hero right float, fit-height in a 144px x 180px frame.
- `13d81bb8-b09e-4533-b356-24dcd240d722.webp` - job-change article image.
- `ae13e405-3520-40cb-a87e-9efe612003c8.webp` - rate-cuts article image with `center bottom` crop.
- `DSC_0366.png` - in-article image for "The Quiet Power of Moving Your 401k".
- `rmr-social-share-2.png` - current Open Graph/Twitter social share image.

Source favicon/logo assets live in `website/assets/icons/`. The build emits public logo and favicon files to the `dist/` root:

- `rmr-logo.png` - primary nav/footer brand mark.
- `rmr-logo-new.png` - alternate logo variant retained for design-system reference and fallback use.
- `favicon.ico`
- `favicon-32x32.png`
- `favicon-192x192.png`
- `favicon-512x512.png`
- `apple-touch-icon.png`
- `site.webmanifest`

Back-pocket/source assets live in `docs/source-assets/` and are not published.

## 8. Motion And Interaction

Motion stack:

- GSAP 3
- ScrollTrigger
- Lenis
- lightweight handwritten JS for network particles, audio, router, and shared footer.

Principles:

- Animate `transform` and `opacity`.
- Page/section entrances are sequenced, not simultaneous.
- Use `power3.out` for entrances and `power2.inOut` for state changes.
- ScrollTrigger reveals are one-time unless there is a deliberate reason.
- Respect `prefers-reduced-motion`.
- Avoid custom cursors and broad mouse-follow effects outside the intentionally subtle homepage hero image magnet.

Current homepage hero float behavior:

- Two decorative figures, 144px x 180px on desktop.
- Slightly tilted, entrance stagger after hero text starts.
- Gentle CSS drift loop on inner image wrapper.
- Subtle ScrollTrigger parallax as the hero scrolls away.
- Subtle shared cursor magnet on fine-pointer desktop devices only.
- Hidden on mobile under 700px.

Audio/soft navigation:

- `website/scripts/audio.js` owns background music and sampled click sounds.
- `website/scripts/router.js` swaps internal pages into the same document so audio does not restart.
- Shared scripts must remain idempotent and clean up page-level listeners during soft navigation.

## 9. Content And SEO

Homepage promise:

- "Your wealth." / "Your way."
- Help users take control of old 401(k)s by connecting them with a trusted advisor network.
- Reinforce "free to you," "no obligation," "real humans," and "nationwide network."

Advisor promise:

- Selective advisor network built around rollover opportunities.
- Quality, client service, responsiveness, and integrity matter more than volume.

Blog:

- Routes: `/insights` and `/insights/:slug`.
- Data source: `website/data/blog/posts.json`, emitted as `dist/blog/posts.json`.
- Tone: practical, plain-English retirement perspective.
- Images and image positioning are part of the editorial system.

SEO/social:

- Current canonical social image is `https://rollmyretirement.netlify.app/Website%20Images/rmr-social-share-2.png`.
- Use `summary_large_image` for Twitter cards.
- Keep alt text descriptive on content images and empty on decorative images.

## 10. Anti-Patterns

Never:

- Use generic startup copy like "elevate," "seamless," "unleash," or "next-gen."
- Add neon gradients, purple-blue glows, bokeh/orb backgrounds, or gradient text.
- Use fake generic names like John Doe or Acme.
- Add custom mouse cursors or cursor-chasing UI to the hero images.
- Move files under `website/` without updating build and redirects.
- Edit `dist/` manually.
- Publish stale Framer exports or local sandbox files.
- Break soft navigation by making page scripts non-idempotent.
