(function () {
  // Skip on touch-only devices (no hover capability)
  if (window.matchMedia('(hover: none)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    #rmr-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 8px; height: 8px;
      background: #111110;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      will-change: transform;
    }
  `;
  document.head.appendChild(style);

  const dot = document.createElement('div');
  dot.id = 'rmr-cursor';
  document.body.appendChild(dot);

  function init() {
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.65, ease: 'power3.out' });
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.65, ease: 'power3.out' });

    document.addEventListener('mousemove', e => {
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    });

    document.addEventListener('mouseleave', () => {
      gsap.to(dot, { opacity: 0, duration: 0.3 });
    });

    document.addEventListener('mouseenter', () => {
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    });

    // Absorb into buttons on hover
    document.addEventListener('mouseover', e => {
      if (e.target.closest('.btn, .nav-logo, .sf-logo')) {
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
      }
    });

    document.addEventListener('mouseout', e => {
      if (e.target.closest('.btn, .nav-logo, .sf-logo')) {
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    });

    // Invert dot color on dark sections
    function bindDarkSections() {
      document.querySelectorAll('[data-cursor-invert]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(dot, { backgroundColor: '#fafaf8', duration: 0.3, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(dot, { backgroundColor: '#111110', duration: 0.3, ease: 'power2.out' });
        });
      });
    }
    bindDarkSections();
  }

  if (typeof gsap !== 'undefined') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
