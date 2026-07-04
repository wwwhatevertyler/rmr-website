/**
 * RMR shared footer component.
 * Include before </body> on every page:
 *   <div id="site-footer"></div>
 *   <script src="footer.js"></script>
 */
(function () {
  const A = 'anchor';   // in-page jump link  → 13px var(--text-muted)
  const X = 'external'; // cross-page link    → 12px var(--text-light)
  const S = 'sep';      // · dot separator

  const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
  const localHosts = ['localhost', '127.0.0.1', '::1'];
  const isLocalHost = localHosts.includes(window.location.hostname);
  const routes = {
    home: isLocalHost ? 'rmr-home.html' : '/',
    advisors: isLocalHost ? 'rmr-advisors-page.html' : '/advisors',
    contact: isLocalHost ? 'rmr-contact.html' : '/contact',
    insights: isLocalHost ? 'rmr-blog.html' : '/insights',
  };

  const cleanPageMap = {
    '/': 'rmr-home.html',
    '/advisors': 'rmr-advisors-page.html',
    '/contact': 'rmr-contact.html',
    '/insights': 'rmr-blog.html',
  };
  const page = cleanPath.startsWith('/insights/')
    ? 'rmr-blog-post.html'
    : cleanPageMap[cleanPath] || window.location.pathname.split('/').pop() || 'rmr-home.html';

  const linkSets = {
    'rmr-home.html': [
      { label: 'About',          href: '#about',                 type: A },
      { label: 'Process',        href: '#process',               type: A },
      { label: 'Network',        href: '#network',               type: A },
      { label: 'FAQs',           href: '#faq',                   type: A },
      { type: S },
      { label: 'Insights →',     href: routes.insights,          type: X },
      { label: 'For Advisors →', href: routes.advisors,          type: X },
    ],
    'rmr-advisors-page.html': [
      { label: 'Why RMR',        href: '#why-rmr',               type: A },
      { label: 'How It Works',   href: '#how-it-works',          type: A },
      { label: 'Standards',      href: '#standards',             type: A },
      { label: 'FAQ',            href: '#faq',                   type: A },
      { type: S },
      { label: 'Insights →',     href: routes.insights,          type: X },
    ],
    'rmr-contact.html': [
      { label: 'Insights →',     href: routes.insights,          type: X },
      { label: 'For Advisors →', href: routes.advisors,          type: X },
    ],
    'rmr-blog.html': [
      { label: '← Insights',     href: routes.insights,          type: X },
      { label: 'For Advisors →', href: routes.advisors,          type: X },
    ],
    'rmr-blog-post.html': [
      { label: '← Insights',     href: routes.insights,          type: X },
      { label: 'For Advisors →', href: routes.advisors,          type: X },
    ],
  };

  const nav = linkSets[page] || linkSets['rmr-home.html'];

  const css = `
    #site-footer {
      background: var(--bg);
      border-top: 1px solid var(--border);
      padding: 32px var(--pad-x, 24px);
    }
    .sf-inner {
      max-width: var(--max-w, 1200px);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }
    .sf-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-light);
      font-family: 'Instrument Serif', Georgia, serif;
      font-size: 15px;
    }
    .sf-logo img {
      height: 40px;
      width: auto;
      display: block;
    }
    .sf-nav {
      display: flex;
      align-items: center;
      gap: 24px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .sf-nav a {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: -0.01em;
      text-decoration: none;
      transition: color 0.35s ease;
    }
    .sf-nav a:hover { color: var(--text); }
    .sf-nav a.sf-external {
      font-size: 12px;
      color: var(--text-light);
    }
    .sf-nav a.sf-external:hover { color: var(--text-muted); }
    .sf-nav-sep {
      font-size: 12px;
      color: var(--border-strong);
      pointer-events: none;
      user-select: none;
    }
    .sf-copy {
      font-size: 12px;
      color: var(--text-light);
    }
    @media (max-width: 560px) {
      .sf-inner { flex-direction: column; text-align: center; }
      .sf-nav { flex-wrap: wrap; justify-content: center; gap: 16px; }
    }
  `;

  const styleEl = document.getElementById('rmr-footer-style') || document.createElement('style');
  styleEl.id = 'rmr-footer-style';
  styleEl.textContent = css;
  if (!styleEl.parentNode) document.head.appendChild(styleEl);

  const navItems = nav.map(item => {
    if (item.type === 'sep') return `<li class="sf-nav-sep" aria-hidden="true">·</li>`;
    const cls = item.type === 'external' ? ' class="sf-external"' : '';
    return `<li><a href="${item.href}"${cls}>${item.label}</a></li>`;
  }).join('\n      ');

  const html = `
    <div class="sf-inner">
      <a href="${routes.home}" class="sf-logo">
        <img src="rmr-logo-new.png" alt="Roll My Retirement">
      </a>
      <ul class="sf-nav">
        ${navItems}
      </ul>
      <span class="sf-copy">© ${new Date().getFullYear()} Roll My Retirement. All rights reserved.</span>
    </div>
  `;

  const el = document.getElementById('site-footer');
  if (el) el.innerHTML = html;
})();
