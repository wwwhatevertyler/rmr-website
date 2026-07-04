# Animation System

`DESIGN.md` is the canonical design reference. This file documents the current motion implementation.

## Libraries

Loaded from CDN on pages:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
```

## Principles

- Animate only `transform` and `opacity` where possible.
- Set hidden entrance states before timelines to prevent FOUC.
- Section reveals are one-time ScrollTrigger entrances.
- Sequencing matters: eyebrow, heading, lead/body, then cards or controls.
- Respect `prefers-reduced-motion`.
- Avoid broad cursor-following effects and custom cursors.

## Timings

- Major entrances: 0.7-0.85s.
- Hero/card presence moments: up to 1.05s.
- Staggered siblings: 0.55-0.65s with 0.06-0.10s stagger.
- FAQ height transitions: about 0.35-0.38s.
- Button arrow feedback: about 0.2s.

## Easing

- `power3.out` - entrances.
- `power2.inOut` - FAQ/state changes.
- `back.out(1.7)` - icon rotation/pop moments.
- `none` - scrubbed progress/parallax.

## Homepage Hero Floating Images

- Two decorative figures only.
- 144px x 180px on desktop.
- Slightly tilted via data attributes and GSAP entrance.
- Gentle CSS keyframe float on the inner `.hero-float-drift`.
- Subtle ScrollTrigger parallax while leaving the hero.
- Subtle shared cursor magnet on fine-pointer desktop devices only.
- Hidden under 700px.

## Network Particle System

The homepage `#network` visual uses a lightweight SVG particle field:

- 200 dots inside a circular boundary.
- One `requestAnimationFrame` loop.
- Mouse attraction only on fine-pointer hover devices.
- Click scatters the dots.
- The "You" pill follows the cursor only inside the network visual.

Keep this isolated from page layout; do not animate layout properties.

## Audio And Soft Navigation

- `website/scripts/audio.js` owns background music and sampled click sounds.
- `website/scripts/router.js` intercepts internal navigation and swaps page HTML so audio keeps playing.
- Page scripts must remain idempotent and register cleanup hooks where they add long-lived listeners.
