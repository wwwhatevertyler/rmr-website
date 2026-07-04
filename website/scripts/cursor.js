(function () {
  // Only run on devices with a precise pointer (mouse/trackpad) — skips touch screens.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  if (window.RMRCursor && window.RMRCursor.refresh) {
    window.RMRCursor.refresh();
    return;
  }

  let dot = null;
  let xTo = null;
  let yTo = null;
  let listenersBound = false;

  function ensureStyle() {
    if (document.getElementById('rmr-cursor-style')) return;

    const style = document.createElement('style');
    style.id = 'rmr-cursor-style';
    style.textContent = `
      #rmr-cursor {
        position: fixed;
        top: 0; left: 0;
        width: 6px; height: 6px;
        background: #111110;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        opacity: 0;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDot() {
    ensureStyle();

    dot = document.getElementById('rmr-cursor');
    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'rmr-cursor';
      document.body.appendChild(dot);
    }

    if (typeof gsap !== 'undefined') {
      gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 1 });
      xTo = gsap.quickTo(dot, 'x', { duration: 0.65, ease: 'power3.out' });
      yTo = gsap.quickTo(dot, 'y', { duration: 0.65, ease: 'power3.out' });
    }
  }

  function bindDarkSections() {
    document.querySelectorAll('[data-cursor-invert]').forEach(el => {
      if (el.dataset.rmrCursorBound === 'true') return;
      el.dataset.rmrCursorBound = 'true';
      el.addEventListener('mouseenter', () => {
        if (dot) gsap.to(dot, { backgroundColor: '#fafaf8', duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        if (dot) gsap.to(dot, { backgroundColor: '#111110', duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  function bindGlobalListeners() {
    if (listenersBound) return;
    listenersBound = true;

    document.addEventListener('mousemove', e => {
      if (!dot || !xTo || !yTo) ensureDot();
      if (!dot || !xTo || !yTo) return;
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    });

    document.addEventListener('mouseleave', () => {
      if (dot) gsap.to(dot, { opacity: 0, duration: 0.3 });
    });

    document.addEventListener('mouseenter', () => {
      if (dot) gsap.to(dot, { opacity: 1, duration: 0.2 });
    });

    document.addEventListener('mouseover', e => {
      if (dot && e.target.closest('.btn, .nav-logo, .sf-logo')) {
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
      }
    });

    document.addEventListener('mouseout', e => {
      if (dot && e.target.closest('.btn, .nav-logo, .sf-logo')) {
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  function refresh() {
    if (typeof gsap === 'undefined' || !document.body) return;
    ensureDot();
    bindGlobalListeners();
    bindDarkSections();
  }

  window.RMRCursor = { refresh };

  if (typeof gsap !== 'undefined') {
    refresh();
  } else {
    window.addEventListener('load', refresh, { once: true });
  }
})();
