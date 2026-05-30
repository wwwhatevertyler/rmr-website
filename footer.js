/**
 * RMR shared footer component.
 * Include before </body> on every page:
 *   <div id="site-footer"></div>
 *   <script src="footer.js"></script>
 */
(function () {
  const nav = [
    { label: 'Home',        href: 'rmr-home.html' },
    { label: 'About',       href: 'rmr-home.html#about' },
    { label: 'Process',     href: 'rmr-home.html#process' },
    { label: 'Network',     href: 'rmr-home.html#network' },
    { label: 'FAQ',         href: 'rmr-home.html#faq' },
    { label: 'For Advisors',href: 'rmr-advisors-page.html' },
    { label: 'Contact',     href: 'rmr-contact.html' },
  ];

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
    .sf-copy {
      font-size: 12px;
      color: var(--text-light);
    }
    @media (max-width: 560px) {
      .sf-inner { flex-direction: column; text-align: center; }
      .sf-nav { flex-wrap: wrap; justify-content: center; gap: 16px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const navItems = nav.map(item =>
    `<li><a href="${item.href}">${item.label}</a></li>`
  ).join('\n      ');

  const html = `
    <div class="sf-inner">
      <a href="rmr-home.html" class="sf-logo">
        <img src="rmr-logo.png" alt="Roll My Retirement">
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
