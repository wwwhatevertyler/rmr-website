/**
 * RMR audio system — background music + sampled UI click sounds.
 * Include before </body> on every page:
 *   <script src="audio.js"></script>
 *
 * Background music: drop your audio file at  audio/background-audio-trimmed.mp3
 * Click sounds use audio/audio-for-clicks-1.wav.
 */
(function () {
  'use strict';

  if (window.RMRAudio && window.RMRAudio.ensureMounted) {
    window.RMRAudio.ensureMounted();
    return;
  }

  const BG_SRC       = 'audio/background-audio-trimmed.mp3';
  const CLICK_SRC    = 'audio/audio-for-clicks-1.wav';
  const BG_START_AT  = 0;       // skip to this timestamp in the song (seconds)
  const FADE_IN_MS   = 3000;    // atmospheric auto-start fade
  const TOGGLE_IN_MS = 500;     // re-enable via toggle
  const TOGGLE_OUT_MS = 600;    // disable via toggle
  const CLICK_VOL    = 0.82;
  const CLICK_POOL_SIZE = 6;
  const TAP_MOVE_TOLERANCE = 10;
  const MOBILE_CLICK_SUPPRESS_MS = 450;

  let bgMaxVol  = 0.22;         // mutable — slider can update this
  let active    = false;
  let bgAudio   = null;
  let toggleEl  = null;
  let volInput  = null;
  let fadeRaf   = null;
  let bgPlayPending = false;
  let clickPool = [];
  let clickPoolIndex = 0;
  let clickAudioCtx = null;
  let clickBuffer = null;
  let clickBufferPromise = null;
  let mobilePointer = null;
  let suppressClickUntil = 0;
  let lastLabelControlId = '';
  let lastLabelClickAt = 0;
  let initialized = false;

  // ── Sampled Click Sound ───────────────────────────────────────────────────
  function buildClickPool() {
    clickPool = Array.from({ length: CLICK_POOL_SIZE }, () => {
      const audio = new Audio(CLICK_SRC);
      audio.preload = 'auto';
      audio.volume = CLICK_VOL;
      return audio;
    });
  }

  function isCoarsePointerDevice() {
    return Boolean(window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
  }

  function decodeClickBuffer(ctx, arrayBuffer) {
    return new Promise((resolve, reject) => {
      const decoded = ctx.decodeAudioData(arrayBuffer, resolve, reject);
      if (decoded && typeof decoded.then === 'function') {
        decoded.then(resolve).catch(reject);
      }
    });
  }

  function primeFastClickSound() {
    if (!isCoarsePointerDevice() || clickBuffer || clickBufferPromise) return clickBufferPromise;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !window.fetch) return null;

    try {
      if (!clickAudioCtx) clickAudioCtx = new AudioCtx();
      if (clickAudioCtx.state === 'suspended' && clickAudioCtx.resume) {
        clickAudioCtx.resume().catch(() => {});
      }

      clickBufferPromise = fetch(CLICK_SRC)
        .then(response => {
          if (!response.ok) throw new Error('Click audio fetch failed');
          return response.arrayBuffer();
        })
        .then(arrayBuffer => decodeClickBuffer(clickAudioCtx, arrayBuffer))
        .then(buffer => {
          clickBuffer = buffer;
          return clickBuffer;
        })
        .catch(() => {
          clickBufferPromise = null;
          return null;
        });
    } catch (_) {
      clickBufferPromise = null;
    }

    return clickBufferPromise;
  }

  function playFastClickSound() {
    if (!active || !clickAudioCtx || !clickBuffer) {
      primeFastClickSound();
      return false;
    }

    try {
      if (clickAudioCtx.state === 'suspended' && clickAudioCtx.resume) {
        clickAudioCtx.resume().catch(() => {});
        return false;
      }

      const source = clickAudioCtx.createBufferSource();
      const gain = clickAudioCtx.createGain();
      source.buffer = clickBuffer;
      gain.gain.value = CLICK_VOL;
      source.connect(gain);
      gain.connect(clickAudioCtx.destination);
      source.start(0);
      return true;
    } catch (_) {
      return false;
    }
  }

  function playClickSound() {
    if (!active) return;
    if (isCoarsePointerDevice()) {
      // On mobile, avoid HTMLAudio fallback so tap cues do not steal focus
      // from the persistent background track.
      playFastClickSound();
      return;
    }

    if (!clickPool.length) return;
    const click = clickPool[clickPoolIndex];
    clickPoolIndex = (clickPoolIndex + 1) % clickPool.length;
    try {
      click.pause();
      click.currentTime = 0;
      click.volume = CLICK_VOL;
      click.play().catch(() => {});
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
      primeFastClickSound();
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

    @media (hover: none), (pointer: coarse) {
      #audio-wrap {
        gap: 0;
      }

      #audio-toggle {
        width: 44px;
        height: 44px;
      }

      #audio-vol-panel {
        display: none !important;
      }
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
  function ensureStyle() {
    if (document.getElementById('rmr-audio-style')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'rmr-audio-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  function buildUI() {
    ensureStyle();

    const existing = document.getElementById('audio-wrap');
    if (existing) {
      toggleEl = document.getElementById('audio-toggle');
      volInput = document.getElementById('audio-vol');
      if (volInput) volInput.value = String(Math.round(bgMaxVol * 100));
      updateToggleUI();
      return toggleEl;
    }

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
  function isSoundableClickTarget(target) {
    if (!target || target.closest('#audio-wrap')) return false;
    if (target.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea')) return false;
    return Boolean(target.closest([
      'a[href]',
      'button',
      '[role="button"]',
      'input[type="submit"]',
      'input[type="button"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'label',
      'select',
      'summary',
      '[tabindex]:not([tabindex="-1"])',
      '.network-visual'
    ].join(',')));
  }

  function isDuplicateLabelControlClick(target) {
    const control = target && target.closest('input[type="checkbox"], input[type="radio"]');
    if (!control || !control.id) return false;
    return lastLabelControlId === control.id && performance.now() - lastLabelClickAt < 80;
  }

  function rememberLabelControlClick(target) {
    const label = target && target.closest('label[for]');
    if (!label) return;
    lastLabelControlId = label.getAttribute('for') || '';
    lastLabelClickAt = performance.now();
  }

  function isMobileLogoTransitionTarget(target) {
    return Boolean(target && target.closest('[data-rmr-logo-transition="spin"]'));
  }

  function isMobilePointerLike(e) {
    if (!isCoarsePointerDevice()) return false;
    return !e.pointerType || e.pointerType !== 'mouse';
  }

  function isPrimaryPointer(e) {
    return e.isPrimary !== false;
  }

  function mobilePointerDistanceExceeded(e) {
    if (!mobilePointer) return false;
    const dx = e.clientX - mobilePointer.x;
    const dy = e.clientY - mobilePointer.y;
    return Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE;
  }

  function startMobilePointer(target, id, x, y) {
    if (!isSoundableClickTarget(target)) return;
    mobilePointer = { id, target, x, y, cancelled: false };
  }

  function finishMobilePointer(id) {
    if (!mobilePointer || mobilePointer.id !== id) return;

    const pointer = mobilePointer;
    mobilePointer = null;

    if (pointer.cancelled || !isSoundableClickTarget(pointer.target)) return;

    if (isMobileLogoTransitionTarget(pointer.target)) {
      suppressClickUntil = performance.now() + MOBILE_CLICK_SUPPRESS_MS;
      return;
    }

    rememberLabelControlClick(pointer.target);
    playClickSound();
    suppressClickUntil = performance.now() + MOBILE_CLICK_SUPPRESS_MS;
  }

  function handleDocumentPointerDown(e) {
    if (!isPrimaryPointer(e) || !isMobilePointerLike(e)) return;
    startMobilePointer(e.target, e.pointerId, e.clientX, e.clientY);
  }

  function handleDocumentPointerMove(e) {
    if (!mobilePointer || mobilePointer.id !== e.pointerId) return;
    if (mobilePointerDistanceExceeded(e)) mobilePointer.cancelled = true;
  }

  function handleDocumentPointerUp(e) {
    if (!isPrimaryPointer(e) || !isMobilePointerLike(e)) return;
    finishMobilePointer(e.pointerId);
  }

  function handleDocumentPointerCancel(e) {
    if (mobilePointer && mobilePointer.id === e.pointerId) mobilePointer = null;
  }

  function firstChangedTouch(e) {
    return e.changedTouches && e.changedTouches[0];
  }

  function handleDocumentTouchStart(e) {
    if (!isCoarsePointerDevice() || window.PointerEvent) return;
    const touch = firstChangedTouch(e);
    if (!touch) return;
    startMobilePointer(e.target, touch.identifier, touch.clientX, touch.clientY);
  }

  function handleDocumentTouchMove(e) {
    if (!mobilePointer || window.PointerEvent) return;
    const touch = firstChangedTouch(e);
    if (!touch || mobilePointer.id !== touch.identifier) return;
    if (mobilePointerDistanceExceeded(touch)) mobilePointer.cancelled = true;
  }

  function handleDocumentTouchEnd(e) {
    if (!isCoarsePointerDevice() || window.PointerEvent) return;
    const touch = firstChangedTouch(e);
    if (!touch) return;
    finishMobilePointer(touch.identifier);
  }

  function handleDocumentTouchCancel(e) {
    if (!mobilePointer || window.PointerEvent) return;
    const touch = firstChangedTouch(e);
    if (!touch || mobilePointer.id === touch.identifier) mobilePointer = null;
  }

  function handleDocumentClick(e) {
    if (performance.now() < suppressClickUntil) return;
    if (!isSoundableClickTarget(e.target)) return;
    if (isCoarsePointerDevice() && isMobileLogoTransitionTarget(e.target)) return;
    if (isDuplicateLabelControlClick(e.target)) return;
    rememberLabelControlClick(e.target);
    playClickSound();
  }

  function attachInteractionListeners() {
    document.removeEventListener('click', handleDocumentClick, true);
    document.addEventListener('click', handleDocumentClick, true);

    document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
    document.removeEventListener('pointermove', handleDocumentPointerMove, true);
    document.removeEventListener('pointerup', handleDocumentPointerUp, true);
    document.removeEventListener('pointercancel', handleDocumentPointerCancel, true);
    document.removeEventListener('touchstart', handleDocumentTouchStart, true);
    document.removeEventListener('touchmove', handleDocumentTouchMove, true);
    document.removeEventListener('touchend', handleDocumentTouchEnd, true);
    document.removeEventListener('touchcancel', handleDocumentTouchCancel, true);

    document.addEventListener('pointerdown', handleDocumentPointerDown, { capture: true, passive: true });
    document.addEventListener('pointermove', handleDocumentPointerMove, { capture: true, passive: true });
    document.addEventListener('pointerup', handleDocumentPointerUp, { capture: true, passive: true });
    document.addEventListener('pointercancel', handleDocumentPointerCancel, { capture: true, passive: true });
    document.addEventListener('touchstart', handleDocumentTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', handleDocumentTouchMove, { capture: true, passive: true });
    document.addEventListener('touchend', handleDocumentTouchEnd, { capture: true, passive: true });
    document.addEventListener('touchcancel', handleDocumentTouchCancel, { capture: true, passive: true });
  }

  function ensureMounted() {
    if (!document.body) return;
    if (!document.getElementById('audio-wrap')) {
      toggleEl = buildUI();
    } else {
      ensureStyle();
      toggleEl = document.getElementById('audio-toggle');
      volInput = document.getElementById('audio-vol');
    }
    if (!clickPool.length && !isCoarsePointerDevice()) buildClickPool();
    attachInteractionListeners();
    if (volInput) volInput.value = String(Math.round(bgMaxVol * 100));
    updateToggleUI();
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    if (initialized) {
      ensureMounted();
      return;
    }
    initialized = true;
    ensureMounted();

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
        primeFastClickSound();
        updateToggleUI();
        fadeBg(bgMaxVol, FADE_IN_MS);
      })
      .catch(() => {
        // Autoplay blocked — UI stays off; user uses the toggle or volume slider to start.
      });
  }

  window.RMRAudio = {
    ensureMounted,
    playClickSound,
    isActive: () => active
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
