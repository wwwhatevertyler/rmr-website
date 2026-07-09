/**
 * RMR soft-navigation router.
 *
 * Internal links are fetched and swapped into the current document so the
 * background Audio instance in audio.js can continue playing across pages.
 */
(function () {
  'use strict';

  if (window.RMRRouter) {
    window.RMRRouter.bind();
    return;
  }

  const SHARED_SCRIPT_NAMES = new Set([
    'footer.js',
    'cursor.js',
    'audio.js',
    'router.js',
    'gsap.min.js',
    'ScrollTrigger.min.js',
    'lenis.min.js'
  ]);

  const state = {
    navigating: false,
    capture: false,
    cleanups: [],
    bound: false
  };
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
  const PRODUCTION_ROUTE_MAP = {
    '/rmr-home': '/',
    '/rmr-home.html': '/',
    '/rmr-contact': '/contact',
    '/rmr-contact.html': '/contact',
    '/rmr-advisors-page': '/advisors',
    '/rmr-advisors-page.html': '/advisors',
    '/rmr-blog': '/insights',
    '/rmr-blog.html': '/insights'
  };

  function safeCleanup(fn) {
    try { fn(); } catch (_) { /* cleanup should never block navigation */ }
  }

  function registerCleanup(fn) {
    if (typeof fn === 'function') state.cleanups.push(fn);
  }

  function startCapture() {
    state.capture = true;
  }

  function stopCapture() {
    state.capture = false;
  }

  function patchEventTarget(target) {
    if (!target || target.__rmrPagePatched) return;
    const add = target.addEventListener;
    target.addEventListener = function (type, listener, options) {
      if (state.capture && listener) {
        const cleanupTarget = this;
        registerCleanup(() => cleanupTarget.removeEventListener(type, listener, options));
      }
      return add.call(this, type, listener, options);
    };
    target.__rmrPagePatched = true;
  }

  function patchGsapTicker() {
    if (!window.gsap || !gsap.ticker || gsap.ticker.__rmrPagePatched) return;
    const add = gsap.ticker.add.bind(gsap.ticker);
    gsap.ticker.add = function (fn) {
      if (state.capture && typeof fn === 'function') {
        registerCleanup(() => gsap.ticker.remove(fn));
      }
      return add.apply(gsap.ticker, arguments);
    };
    gsap.ticker.__rmrPagePatched = true;
  }

  function teardownPage() {
    stopCapture();

    if (window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function') {
      ScrollTrigger.getAll().forEach(trigger => safeCleanup(() => trigger.kill()));
    }

    const cleanups = state.cleanups.splice(0);
    cleanups.reverse().forEach(safeCleanup);
  }

  window.RMRPage = window.RMRPage || {};
  Object.assign(window.RMRPage, {
    registerCleanup,
    startCapture,
    stopCapture,
    teardown: teardownPage
  });

  function scriptName(src) {
    try {
      const url = new URL(src, document.baseURI);
      return url.pathname.split('/').pop();
    } catch (_) {
      return '';
    }
  }

  function shouldSkipScript(script) {
    const src = script.getAttribute('src');
    if (!src) return false;
    const name = scriptName(src);
    return name === 'audio.js' || name === 'router.js';
  }

  function isAlreadyLoadedLibrary(script) {
    const src = script.getAttribute('src');
    if (!src) return false;
    const name = scriptName(src);
    if (!SHARED_SCRIPT_NAMES.has(name)) return false;
    if (name === 'footer.js' || name === 'cursor.js') return false;
    return true;
  }

  function loadExternalScript(script) {
    return new Promise((resolve, reject) => {
      const next = document.createElement('script');
      Array.from(script.attributes).forEach(attr => {
        next.setAttribute(attr.name, attr.value);
      });
      next.async = false;
      next.onload = () => {
        next.remove();
        patchGsapTicker();
        resolve();
      };
      next.onerror = () => reject(new Error(`Failed to load ${script.getAttribute('src')}`));
      document.body.appendChild(next);
    });
  }

  function runInlineScript(script) {
    const code = script.textContent || '';
    if (!code.trim()) return;
    const run = new Function(code);
    run.call(window);
  }

  async function hydrateScripts() {
    const scripts = Array.from(document.body.querySelectorAll('script'));

    for (const script of scripts) {
      script.remove();

      if (shouldSkipScript(script)) continue;
      if (isAlreadyLoadedLibrary(script)) continue;

      if (script.src || script.getAttribute('src')) {
        await loadExternalScript(script);
        continue;
      }

      startCapture();
      try {
        runInlineScript(script);
      } finally {
        stopCapture();
      }
    }
  }

  function updateDocument(nextDoc) {
    const nextHtml = nextDoc.documentElement;
    document.documentElement.lang = nextHtml.lang || 'en';
    document.documentElement.removeAttribute('data-home-loader');

    document.head.replaceChildren(
      ...Array.from(nextDoc.head.childNodes).map(node => document.importNode(node, true))
    );
    document.body.replaceWith(document.importNode(nextDoc.body, true));
  }

  function samePageHashOnly(url) {
    return (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    );
  }

  function normalizeInternalRoute(url) {
    const normalized = new URL(url.href);
    const mappedPath = PRODUCTION_ROUTE_MAP[normalized.pathname];
    if (mappedPath && !LOCAL_HOSTS.has(window.location.hostname)) {
      normalized.pathname = mappedPath;
    } else if (/\/rmr-home(?:\.html)?$/.test(normalized.pathname)) {
      normalized.pathname = '/';
    }
    return normalized;
  }

  function isSoftNavLink(event, link) {
    if (!link || event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (event.button !== 0) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;

    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return false;

    const url = normalizeInternalRoute(new URL(raw, window.location.href));
    if (url.origin !== window.location.origin) return false;
    if (samePageHashOnly(url)) return false;
    if (!/\/$|\.html$|^\/(advisors|contact|insights)(\/|$)?/.test(url.pathname)) return false;

    return true;
  }

  function animateCurtainIn() {
    const curtain = document.getElementById('page-curtain');
    if (!curtain || !window.gsap) return Promise.resolve();

    return new Promise(resolve => {
      gsap.set(curtain, { scaleY: 0, transformOrigin: 'bottom center' });
      gsap.to(curtain, {
        scaleY: 1,
        duration: 0.42,
        ease: 'power3.in',
        onComplete: resolve
      });
    });
  }

  function shouldReduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const LOGO_SPIN_DURATION = 640;
  const LOGO_SPIN_PRESS_OFFSET = 105 / LOGO_SPIN_DURATION;
  const LOGO_PRESS_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const LOGO_SPIN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const LOGO_SPRING_EASE = 'cubic-bezier(0.34, 1.24, 0.64, 1)';

  function playLogoTransition(link) {
    if (!link || shouldReduceMotion()) return Promise.resolve();

    const logo = link.querySelector('.nav-logo-img, img');
    if (!logo || typeof logo.animate !== 'function') return Promise.resolve();

    return new Promise(resolve => {
      let settled = false;
      let fallbackId = 0;
      let animation = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackId);
        if (animation) {
          animation.onfinish = null;
          animation.oncancel = null;
          animation.cancel();
        }
        link.classList.remove('is-logo-transitioning');
        logo.__rmrLogoAnimation = null;
        resolve();
      };

      if (logo.__rmrLogoAnimation) {
        logo.__rmrLogoAnimation.cancel();
      }

      link.classList.remove('is-logo-transitioning');
      void logo.offsetWidth;
      link.classList.add('is-logo-transitioning');

      animation = logo.animate([
        {
          transform: 'scale(1) rotate(0deg)',
          offset: 0,
          easing: LOGO_PRESS_EASE
        },
        {
          transform: 'scale(0.965) rotate(0deg)',
          offset: LOGO_SPIN_PRESS_OFFSET,
          easing: LOGO_SPIN_EASE
        },
        {
          transform: 'scale(1.006) rotate(363.8deg)',
          offset: 0.82,
          easing: LOGO_SPRING_EASE
        },
        {
          transform: 'scale(0.997) rotate(358.7deg)',
          offset: 0.925,
          easing: LOGO_SPIN_EASE
        },
        {
          transform: 'scale(1) rotate(360deg)',
          offset: 1
        }
      ], {
        duration: LOGO_SPIN_DURATION,
        fill: 'both'
      });

      logo.__rmrLogoAnimation = animation;
      animation.onfinish = finish;
      animation.oncancel = finish;
      fallbackId = window.setTimeout(finish, LOGO_SPIN_DURATION + 80);
    });
  }

  function getPreTransition(link) {
    if (link && link.matches('[data-rmr-logo-transition="spin"]')) {
      return () => playLogoTransition(link);
    }
    return null;
  }

  async function runPreTransition(preTransition) {
    if (typeof preTransition !== 'function') return;
    try {
      await preTransition();
    } catch (_) {
      /* Decorative transition should never block navigation. */
    }
  }

  function finalUrlFromResponse(response, fallbackUrl) {
    const responseUrl = response && response.url ? new URL(response.url) : fallbackUrl;
    return responseUrl.pathname + responseUrl.search + responseUrl.hash;
  }

  async function fetchPage(url) {
    const response = await fetch(url.href, {
      headers: { 'X-RMR-Soft-Nav': '1' }
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('text/html')) {
      throw new Error(`Soft navigation failed for ${url.href}`);
    }
    const html = await response.text();
    return { response, html };
  }

  async function navigate(to, options = {}) {
    const url = normalizeInternalRoute(new URL(to, window.location.href));
    if (url.origin !== window.location.origin) {
      window.location.href = url.href;
      return;
    }
    if (state.navigating) return;

    state.navigating = true;

    try {
      const fetchPromise = fetchPage(url);
      await runPreTransition(options.preTransition);
      await animateCurtainIn();
      const { response, html } = await fetchPromise;
      const nextDoc = new DOMParser().parseFromString(html, 'text/html');
      const finalUrl = finalUrlFromResponse(response, url);

      teardownPage();
      updateDocument(nextDoc);

      if (!options.fromPop) {
        const method = options.replace ? 'replaceState' : 'pushState';
        history[method]({ rmr: true }, '', finalUrl);
      }

      window.scrollTo(0, 0);
      patchGsapTicker();
      await hydrateScripts();
      window.RMRAudio && window.RMRAudio.ensureMounted && window.RMRAudio.ensureMounted();
      window.RMRCursor && window.RMRCursor.refresh && window.RMRCursor.refresh();
      document.dispatchEvent(new CustomEvent('rmr:page-load', { detail: { url: finalUrl } }));
    } catch (err) {
      console.error(err);
      window.location.href = url.href;
    } finally {
      state.navigating = false;
    }
  }

  function onDocumentClick(event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!isSoftNavLink(event, link)) return;
    event.preventDefault();
    navigate(link.href, { preTransition: getPreTransition(link) });
  }

  function bind() {
    if (state.bound) return;
    state.bound = true;

    patchEventTarget(window);
    patchEventTarget(document);
    patchGsapTicker();

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', () => {
      navigate(window.location.href, { fromPop: true });
    });

    startCapture();
    setTimeout(stopCapture, 0);
  }

  window.RMRRouter = { bind, navigate };
  bind();
})();
