# Animation System

_Motion principles and patterns for the RMR website._

---

## Libraries

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
```

**Lenis + GSAP integration** (footer of each page):
```js
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smooth: true, smoothTouch: false });
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
```

---

## Principles

- **Entrances only once** — `once: true` on all ScrollTrigger scroll animations; no reversal on scroll-up.
- **Sequence not simultaneous** — eyebrow → heading → lead → body, with `-=` overlaps (0.15–0.25s).
- **FOUC prevention** — always call `gsap.set()` initial hidden state _before_ the timeline, on page load.
- **Eases**: `power3.out` for entrances, `power2.inOut` for state changes, `back.out(1.7)` for spring pops.
- **Durations**: major entrances 0.7–0.85s; staggered siblings 0.55–0.65s, 0.06–0.1s stagger; micro-interactions 0.2–0.38s.

---

## Patterns

### Scroll Section Entrance (standard)
Every major section follows this structure:
```js
gsap.set([eyebrow, h2, lead, ...], { opacity: 0, y: 24 });

ScrollTrigger.create({
  trigger: section,
  start: 'top 80%',
  once: true,
  onEnter() {
    gsap.timeline()
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to(h2,      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.4')
      .to(lead,    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.45')
      ...
  }
});
```

### Staggered Cards / Steps
```js
gsap.set(cards, { opacity: 0, y: 20 });
// inside onEnter:
gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
```

### FAQ Accordion
- On open: measure `el.offsetHeight`, animate height `0 → h` with `power2.inOut`, 0.35s
- Icon rotates 45° with `back.out(1.7)`, 0.28s
- On close: reverse (height → 0, icon → 0°)

---

## Network Particle System (`#network`)

A 200-dot SVG particle field inside a circular boundary. All animation runs in a single `requestAnimationFrame` loop — no GSAP.

### Setup
- SVG viewBox `0 0 400 400`, circle center `(200, 200)`, hard radius `R = 193`
- Dots generated via `DocumentFragment` + `createElementNS` (no layout thrash)
- Uniform distribution inside circle: `r = 170 * Math.sqrt(Math.random())` (avoids center clustering)
- Each dot: `{ x, y, vx, vy, angle, ox, oy }` — `ox/oy` are birth coords; position applied via `transform="translate(dx, dy)"`

### Physics (per frame)
1. **Wander** — `d.angle += (Math.random() - 0.5) * 0.03` → `vx += cos(angle) * 0.007`, `vy += sin(angle) * 0.007`
2. **Boundary repulsion** — if `dist(dot, center) > WALL` (177): push inward proportional to excess, steer angle toward center
3. **Cursor attraction (Hooke's law)** — when cursor inside circle: `vx += (cursorX - x) * 0.00028`, `vy += (cursorY - y) * 0.00028`; also softly steer `d.angle` toward cursor (`diff * 0.04`)
4. **Damping** — `vx *= 0.986; vy *= 0.986` (momentum persists ~2s after cursor leaves)
5. **Hard clamp** — if `dist > R - 6`, project dot back to boundary and cancel outward velocity

### Cursor tracking
```js
window.addEventListener('mousemove', e => {
  const b = svg.getBoundingClientRect();
  msvgX = (e.clientX - b.left) / b.width  * 400;   // viewport → SVG user units
  msvgY = (e.clientY - b.top)  / b.height * 400;
  mpxX  = e.clientX - b.left;                        // pixel coords for pill
  mpxY  = e.clientY - b.top;
  inCircle = Math.hypot(msvgX - 200, msvgY - 200) < 193;
}, { passive: true });
```

### "You" pill
- Absolutely positioned over `.network-visual`, follows cursor with lerp `* 0.10`
- Offset: `translate(mpxX + 12, mpxY - 12) translate(0, -100%)` — top-right of cursor tip
- Fades in/out via `opacity` transition `180ms cubic-bezier(0.23,1,0.32,1)` on `inCircle`

### Click-scatter
```js
visual.addEventListener('click', () => {
  dots.forEach(d => {
    const a = Math.random() * Math.PI * 2;
    const spd = 2.5 + Math.random() * 3;
    d.vx = Math.cos(a) * spd;
    d.vy = Math.sin(a) * spd;
    d.angle = a;
  });
});
```

### Performance notes
- Touch/stylus devices: `window.matchMedia('(hover: hover) and (pointer: fine)')` — attraction + pill disabled on touch
- `getBoundingClientRect()` called on each `mousemove` (not cached) for accurate position after scroll/resize
- `setAttribute('transform', ...)` keeps all motion on the compositor; no style recalc per dot
