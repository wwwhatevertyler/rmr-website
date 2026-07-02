/**
 * RMR audio system — background music + synthesized UI click sounds.
 * Include before </body> on every page:
 *   <script src="audio.js"></script>
 *
 * Background music: drop your audio file at  audio/background-audio-trimmed.mp3
 * Click sounds are synthesized via Web Audio API (no files needed).
 */
(function () {
  'use strict';

  const BG_SRC       = 'audio/background-audio-trimmed.mp3';
  const BG_START_AT  = 0;       // skip to this timestamp in the song (seconds)
  const FADE_IN_MS   = 3000;    // atmospheric auto-start fade
  const TOGGLE_IN_MS = 500;     // re-enable via toggle
  const TOGGLE_OUT_MS = 600;    // disable via toggle

  let bgMaxVol  = 0.22;         // mutable — slider can update this
  let active    = false;
  let bgAudio   = null;
  let audioCtx  = null;
  let toggleEl  = null;
  let volInput  = null;
  let fadeRaf   = null;
  let bgPlayPending = false;

  // ── Audio Context ──────────────────────────────────────────────────────────
  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // ── Synthesized Click Sound (Nier / Ex Machina style) ─────────────────────
  function playClickSound() {
    if (!active) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const g1   = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1600, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.09);
      g1.gain.setValueAtTime(0.09, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc1.connect(g1);
      g1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      const osc2 = ctx.createOscillator();
      const g2   = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.exponentialRampToValueAtTime(400, now + 0.06);
      g2.gain.setValueAtTime(0.04, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.09);
    } catch (_) { /* silent fail */ }
  }

  // ── Background Music ───────────────────────────────────────────────────────
  function fadeBg(targetVol, ms) {
    if (!bgAudio) return;
    if (fadeRaf) cancelAnimationFrame(fadeRaf);
    const startVol = bgAudio.volume;
    const diff     = targetVol - startVol;
    const t0       = performance.now();

    function step(now) {
      const p     = Math.min((now - t0) / ms, 1);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      bgAudio.volume = Math.max(0, Math.min(1, startVol + diff * eased));
      if (p < 1) fadeRaf = requestAnimationFrame(step);
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function startBg(fadeDuration) {
    if (!bgAudio) {
      bgAudio        = new Audio();
      bgAudio.loop   = true;
      bgAudio.volume = 0;
      // Honor the configured start point once metadata is ready.
      bgAudio.addEventListener('loadedmetadata', () => {
        bgAudio.currentTime = BG_START_AT;
      }, { once: true });
      bgAudio.src = BG_SRC;
    }

    if (bgPlayPending) return;
    bgPlayPending = true;

    bgAudio.play()
      .then(() => {
        bgPlayPending = false;
        fadeBg(bgMaxVol, fadeDuration);
      })
      .catch(() => {
        bgPlayPending = false;
        // Autoplay blocked — start on first user interaction
        const onInteract = () => {
          if (bgPlayPending) return;
          bgPlayPending = true;
          bgAudio.play()
            .then(() => {
              bgPlayPending = false;
              fadeBg(bgMaxVol, fadeDuration);
            })
            .catch(() => { bgPlayPending = false; });
          document.removeEventListener('click', onInteract);
        };
        document.addEventListener('click', onInteract);
      });
  }

  function stopBg() {
    fadeBg(0, TOGGLE_OUT_MS);
    setTimeout(() => {
      if (bgAudio && !active) bgAudio.pause();
    }, TOGGLE_OUT_MS + 50);
  }

  // ── Toggle State ───────────────────────────────────────────────────────────
  function setActive(state, isAutoStart) {
    active = state;
    if (state) {
      startBg(isAutoStart ? FADE_IN_MS : TOGGLE_IN_MS);
    } else {
      stopBg();
    }
    updateToggleUI();
  }

  function activateFromVolumeControl() {
    if (!active) {
      setActive(true);
      return;
    }
    if (bgAudio && bgAudio.paused) {
      startBg(TOGGLE_IN_MS);
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const CSS = `
    /* ── Wrapper — fixed anchor ── */
    #audio-wrap {
      position: fixed;
      bottom: 28px;
      left: 28px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      z-index: 9990;

      /* Panel reveal tokens — scoped so they don't collide with global --panel-* */
      --panel-open-dur:    200ms;
      --panel-close-dur:   160ms;
      --panel-translate-x: 6px;
      --panel-blur:        2px;
      --panel-ease:        cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ── Toggle button ── */
    #audio-toggle {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: 50%;
      border: 1px solid var(--border, #e4e3de);
      background: rgba(250, 250, 248, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--text-muted, #6b6b66);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      outline: none;
      opacity: 0;
      transform: translateY(6px);
      transition: border-color 0.25s ease, color 0.25s ease,
                  opacity 0.4s ease, transform 0.4s ease;
    }
    #audio-toggle.visible {
      opacity: 1;
      transform: translateY(0);
    }
    #audio-toggle:hover {
      border-color: var(--border-strong, #c8c7c0);
      color: var(--text, #111110);
    }
    #audio-toggle[data-active="1"] {
      border-color: var(--text, #111110);
      color: var(--text, #111110);
    }

    /* ── Waveform bars ── */
    .rmr-audio-bar {
      display: inline-block;
      width: 2px;
      border-radius: 2px;
      background: currentColor;
      margin: 0 1px;
      height: 5px;
      transform-origin: center;
      transition: opacity 0.3s ease;
    }
    #audio-toggle[data-active="1"] .rmr-audio-bar {
      animation: rmrBarBounce var(--dur, 0.6s) ease-in-out infinite alternate;
    }
    #audio-toggle:not([data-active="1"]) .rmr-audio-bar {
      animation: none;
      height: 5px !important;
      opacity: 0.35;
    }
    .rmr-audio-bar:nth-child(1) { --dur: 0.52s; animation-delay: 0s;    }
    .rmr-audio-bar:nth-child(2) { --dur: 0.68s; animation-delay: 0.12s; }
    .rmr-audio-bar:nth-child(3) { --dur: 0.48s; animation-delay: 0.06s; }
    .rmr-audio-bar:nth-child(4) { --dur: 0.63s; animation-delay: 0.18s; }
    @keyframes rmrBarBounce {
      0%   { height: 3px;  }
      100% { height: 13px; }
    }

    /* ── Volume panel — panel-reveal 07, adapted to X-axis ── */
    #audio-vol-panel {
      transform: translateX(calc(-1 * var(--panel-translate-x)));
      opacity: 0;
      filter: blur(var(--panel-blur));
      pointer-events: none;
      transition:
        transform var(--panel-close-dur) var(--panel-ease),
        opacity   var(--panel-close-dur) var(--panel-ease),
        filter    var(--panel-close-dur) var(--panel-ease);
      will-change: transform, opacity, filter;

      height: 36px;
      border-radius: 18px;
      border: 1px solid var(--border, #e4e3de);
      background: rgba(250, 250, 248, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      padding: 0 14px;
    }
    #audio-vol-panel[data-open="true"] {
      transform: translateX(0);
      opacity: 1;
      filter: blur(0);
      pointer-events: auto;
      transition:
        transform var(--panel-open-dur) var(--panel-ease),
        opacity   var(--panel-open-dur) var(--panel-ease),
        filter    var(--panel-open-dur) var(--panel-ease);
    }

    /* ── Range input ── */
    #audio-vol {
      -webkit-appearance: none;
      appearance: none;
      width: 80px;
      height: 2px;
      background: var(--border, #e4e3de);
      border-radius: 1px;
      outline: none;
      cursor: pointer;
    }
    #audio-vol::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text, #111110);
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    #audio-vol::-webkit-slider-thumb:hover {
      transform: scale(1.35);
    }
    #audio-vol::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border: none;
      border-radius: 50%;
      background: var(--text, #111110);
      cursor: pointer;
    }
    #audio-vol::-moz-range-track {
      background: var(--border, #e4e3de);
      height: 2px;
      border-radius: 1px;
    }

    @media (prefers-reduced-motion: reduce) {
      #audio-vol-panel { transition: none !important; }
    }
  `;

  // ── Build UI ───────────────────────────────────────────────────────────────
  function buildUI() {
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // Wrapper
    const wrap = document.createElement('div');
    wrap.id = 'audio-wrap';

    // Toggle button
    const btn = document.createElement('button');
    btn.id = 'audio-toggle';
    btn.setAttribute('aria-label', 'Enable audio');
    btn.setAttribute('data-active', '0');
    btn.setAttribute('title', 'Toggle music');
    btn.innerHTML = `
      <span style="display:flex;align-items:center;height:16px;">
        <span class="rmr-audio-bar"></span>
        <span class="rmr-audio-bar"></span>
        <span class="rmr-audio-bar"></span>
        <span class="rmr-audio-bar"></span>
      </span>`;

    // Volume panel
    const panel = document.createElement('div');
    panel.id = 'audio-vol-panel';
    panel.setAttribute('data-open', 'false');

    const slider = document.createElement('input');
    slider.type  = 'range';
    slider.id    = 'audio-vol';
    slider.min   = '0';
    slider.max   = '100';
    slider.value = String(Math.round(bgMaxVol * 100));
    slider.setAttribute('aria-label', 'Volume');

    panel.appendChild(slider);
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    // Slide in toggle after settle
    setTimeout(() => btn.classList.add('visible'), 700);

    // Toggle click
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setActive(!active);
    });

    // Volume slider hover reveal — mouseenter/leave on wrapper
    wrap.addEventListener('mouseenter', () => panel.setAttribute('data-open', 'true'));
    wrap.addEventListener('mouseleave', () => panel.setAttribute('data-open', 'false'));

    // Volume interaction should start audio just like the main toggle.
    const sliderStartEvents = window.PointerEvent ? ['pointerdown'] : ['mousedown', 'touchstart'];
    sliderStartEvents.forEach(eventName => {
      slider.addEventListener(eventName, () => {
        activateFromVolumeControl();
      }, { passive: true });
    });

    slider.addEventListener('keydown', (e) => {
      const volumeKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
      if (volumeKeys.includes(e.key)) activateFromVolumeControl();
    });

    // Volume scrubbing
    slider.addEventListener('input', () => {
      bgMaxVol = slider.value / 100;
      activateFromVolumeControl();
      if (bgAudio && active) {
        if (fadeRaf) { cancelAnimationFrame(fadeRaf); fadeRaf = null; }
        bgAudio.volume = bgMaxVol;
      }
    });

    volInput = slider;
    return btn;
  }

  function updateToggleUI() {
    if (!toggleEl) return;
    toggleEl.setAttribute('data-active', active ? '1' : '0');
    toggleEl.setAttribute('aria-label', active ? 'Mute audio' : 'Enable audio');
  }

  // ── Click Sound Listeners ──────────────────────────────────────────────────
  function attachInteractionListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#audio-wrap')) return;
      if (e.target.closest('a[href], button, [role="button"], input[type="submit"], input[type="button"], label')) {
        playClickSound();
      }
    }, true);
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    toggleEl = buildUI();
    attachInteractionListeners();

    // Attempt auto-start; only flip active AFTER play() confirms success.
    // Browsers block autoplay until a user gesture — if blocked the UI stays
    // inactive (correct) and the user can use the toggle or volume slider to start.
    bgAudio           = new Audio();
    bgAudio.loop      = true;
    bgAudio.volume    = 0;
    bgAudio.addEventListener('loadedmetadata', () => {
      bgAudio.currentTime = BG_START_AT;
    }, { once: true });
    bgAudio.src = BG_SRC;

    bgAudio.play()
      .then(() => {
        active = true;
        updateToggleUI();
        fadeBg(bgMaxVol, FADE_IN_MS);
      })
      .catch(() => {
        // Autoplay blocked — UI stays off; user uses the toggle or volume slider to start.
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
