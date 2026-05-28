# RMR Brand System

Derived from `rmr-advisors-page.html`. This is the canonical design system for all RMR pages.

---

## Color Tokens

```css
:root {
  --bg: #fafaf8;          /* site background — warm off-white */
  --bg-card: #f4f3ef;     /* card & FAQ section background */
  --bg-dark: #111110;     /* dark sections, nav card, footer */
  --text: #111110;        /* primary text */
  --text-muted: #6b6b66;  /* body copy, eyebrows */
  --text-light: #9b9b94;  /* placeholder, microcopy, value-strip sub */
  --border: #e4e3de;      /* default dividers and card borders */
  --border-strong: #c8c7c0; /* stronger dividers, FAQ icon border */
  --radius-card: 18px;    /* cards, hero card, form wrap */
  --radius-sm: 10px;      /* form inputs, selects */
}
```

---

## Typography

| Role | Family | Size | Weight | Tracking | Leading |
|------|--------|------|--------|----------|---------|
| h1 | Instrument Serif | `clamp(36px, 5.5vw, 64px)` | 400 | -0.02em | 1.08 |
| h1 (homepage) | Instrument Serif | `clamp(40px, 6vw, 72px)` | 400 | -0.025em | 1.06 |
| h2 | Instrument Serif | `clamp(28px, 4vw, 48px)` | 400 | -0.02em | 1.12 |
| h3 | Inter | 16px | 600 | -0.01em | 1.3 |
| body p | Inter | 15px | 400 | — | 1.7 |
| lead | Inter | 17px | 400 | — | 1.65 |
| eyebrow | Inter | 11px | 500 | 0.12em | — |
| nav links | Inter | 13px | 500 | -0.01em | — |
| buttons | Inter | 14px | 500 | -0.01em | — |
| hero card tag | Inter | 10px | 600 | 0.1em | — |

**Fonts loaded via Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
```

Eyebrows are always `text-transform: uppercase` with `color: var(--text-muted)`.
h1/h2 italic (`<em>`) uses Instrument Serif's built-in italic — slightly lighter tone.

---

## Layout & Spacing

```css
--max-w: 1120px;
--pad-x: clamp(24px, 5vw, 64px);      /* horizontal page padding */
--section-gap: clamp(72px, 10vw, 104px); /* vertical section padding */
```

`.container` = `max-width: var(--max-w); margin: 0 auto; padding: 0 var(--pad-x);`

Section padding: `padding: var(--section-gap) 0;`

---

## Component Patterns

### Buttons
- `.btn-primary` — dark `#111110` fill, white text, 100px border-radius pill
- `.btn-secondary` — transparent, `var(--border-strong)` border
- `.btn-arrow` — add `.arrow` span for `→` with `translateX(3px)` hover
- Padding: `13px 26px` (standard) · `9px 20px` (nav)

### Nav
- Fixed, 64px height, `rgba(250,250,248,0.88)` + `backdrop-filter: blur(16px)`
- `.scrolled` class adds `border-bottom: 1px solid var(--border)` + `box-shadow`
- Logo: Instrument Serif 17px
- CTA pill right

### Cards (`.card`)
- Background `var(--bg-card)`, border `var(--border)`, radius `var(--radius-card)`
- Hover: `box-shadow: 0 12px 40px rgba(17,17,16,0.07)` + `background: #fff`
- `transform-style: preserve-3d; will-change: transform` for 3D tilt readiness

### Dark Hero Card (`.hero-card`)
- Background `var(--bg-dark)`, white text, sticky `top: 88px`
- Inner CTA button: `background: #fff; color: var(--bg-dark)` (inverted primary)

### Value Strip
- 4-column grid, `border-top/bottom: 1px solid var(--border)`
- Each item: 36px 32px padding, right border divider, hover `background: var(--bg-card)`

### FAQ Accordion
- Background `var(--bg-card)` section
- GSAP height animation: measure `offsetHeight`, animate `0 → h`
- Icon: 22px circle, `border: 1px solid var(--border-strong)`, rotates 45° on open
- Spring ease: `back.out(1.7)` on icon; `power2.inOut` on height

### Dark Sections (process / how-it-works)
- `background: var(--bg-dark)` on `<section>`
- Step grid: `gap: 1px; background: rgba(255,255,255,0.08); border-radius: var(--radius-card); overflow: hidden`
- Step bg: `var(--bg-dark)`, hover `#1a1a18`
- Step numbers: Instrument Serif 13px, `rgba(255,255,255,0.25)`

### Footer CTA (dark)
- `background: var(--bg-dark)`, centered text
- CTA button uses ghost-light variant: `background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2)`

---

## Animation System

**Libraries (CDN, end of `<body>`):**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
```

**Lenis + GSAP integration:**
```js
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smooth: true, smoothTouch: false });
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
```

**Eases:**
- Entrances: `power3.out`
- State changes: `power2.inOut`
- Spring moments (icon, scale pops): `back.out(1.7)`

**Durations:**
- Major entrances: 0.7–0.85s
- Staggered siblings: 0.55–0.65s per item, 0.06–0.1s stagger
- Interactions (FAQ, hover): 0.2–0.38s

**Pattern — every scroll section:**
1. `gsap.set()` initial state on load (prevents FOUC)
2. GSAP timeline with `scrollTrigger: { start: 'top 80%', once: true }`
3. Eyebrow → h2 → lead → body elements in sequence with `-=` overlaps

---

## Pages

| File | Purpose |
|------|---------|
| `rmr-home.html` | Consumer homepage |
| `rmr-advisors-page.html` | Advisor network recruitment page |
