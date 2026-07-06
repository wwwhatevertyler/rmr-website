import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const siteUrl = 'https://www.rollmyretirement.com';
const socialImageUrl = `${siteUrl}/Website%20Images/rmr-social-share-2.png`;

const entries = [
  ['website/pages/home.html', 'index.html'],
  ['website/pages/home.html', 'rmr-home.html'],
  ['website/pages/advisors.html', 'rmr-advisors-page.html'],
  ['website/pages/contact.html', 'rmr-contact.html'],
  ['website/pages/insights.html', 'rmr-blog.html'],
  ['website/pages/article.html', 'rmr-blog-post.html'],
  ['website/scripts/footer.js', 'footer.js'],
  ['website/scripts/cursor.js', 'cursor.js'],
  ['website/scripts/audio.js', 'audio.js'],
  ['website/scripts/router.js', 'router.js'],
  ['website/assets/audio/background-audio-trimmed.mp3', 'audio/background-audio-trimmed.mp3'],
  ['website/assets/audio/audio-for-clicks-1.wav', 'audio/audio-for-clicks-1.wav'],
  ['website/assets/icons/rmr-logo.png', 'rmr-logo.png'],
  ['website/assets/icons/rmr-logo-new.png', 'rmr-logo-new.png'],
  ['website/assets/icons/favicon.ico', 'favicon.ico'],
  ['website/assets/icons/favicon-32x32.png', 'favicon-32x32.png'],
  ['website/assets/icons/favicon-192x192.png', 'favicon-192x192.png'],
  ['website/assets/icons/favicon-512x512.png', 'favicon-512x512.png'],
  ['website/assets/icons/apple-touch-icon.png', 'apple-touch-icon.png'],
  ['website/assets/icons/site.webmanifest', 'site.webmanifest'],
  ['website/data/blog', 'blog'],
  ['website/assets/images', 'Website Images'],
];

async function copyEntry([source, target = source]) {
  const from = path.join(root, source);
  const to = path.join(dist, target);

  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeScriptJson(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

function absoluteUrl(value) {
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}/${String(value).replace(/^\/+/, '')}`;
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function sitemapUrl({ path: routePath, lastmod, changefreq, priority }) {
  const loc = routePath === '/' ? `${siteUrl}/` : `${siteUrl}${routePath}`;

  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function articleMarkup(post) {
  const coverClass = post.slug === 'when-to-roll-over-your-401k' ? ' class="cover-image-focus-lower"' : '';
  const imagePosition = post.imagePosition ? ` style="--post-image-position: ${escapeAttr(post.imagePosition)};"` : '';

  return `
  <section id="article-hero">
    <div class="container">
      <a href="rmr-blog.html" class="article-breadcrumb">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Insights
      </a>
      <div class="article-hero-inner">
        <div class="article-eyebrow-row">
          <span class="eyebrow">${escapeHtml(post.category)}</span>
          <span class="eyebrow-sep"></span>
          <span class="eyebrow">${escapeHtml(post.readTime)}</span>
        </div>
        <h1 id="article-title">${escapeHtml(post.title)}</h1>
        <div class="article-meta-row">
          <span class="author-avatar">${escapeHtml(initials(post.author))}</span>
          <span>${escapeHtml(post.author)}</span>
          <span class="meta-dot"></span>
          <span>${escapeHtml(formatDate(post.date))}</span>
        </div>
      </div>
    </div>
  </section>

  <div id="cover-image-wrap">
    <div class="container">
      <img id="cover-image"${coverClass} src="${escapeAttr(post.image)}" alt="${escapeAttr(post.title)}" loading="eager"${imagePosition}>
    </div>
  </div>

  <section id="article-body-section">
    <div class="container">
      <div class="article-body" id="article-body">
        ${post.content}
      </div>
      <div class="back-row">
        <a href="rmr-blog.html" class="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          All articles
        </a>
      </div>
    </div>
  </section>

  <section id="footer-cta" data-nav-dark>
    <div class="container">
      <div class="footer-cta-inner">
        <span class="footer-cta-eyebrow">Roll My Retirement</span>
        <h2 class="footer-cta-h2">Ready to roll over<br>your 401k?</h2>
        <p class="footer-cta-sub">Connect with a vetted advisor who can walk you through every step — at no cost to you.</p>
        <a href="rmr-contact.html" class="btn btn-ghost-light btn-arrow">
          Get started <span class="arrow">→</span>
        </a>
      </div>
    </div>
  </section>
  `.trim();
}

function articleStructuredData(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.image), socialImageUrl],
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    author: {
      '@type': 'Organization',
      name: post.author === 'RMR Editorial' ? 'Roll My Retirement' : post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Roll My Retirement',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/rmr-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/insights/${post.slug}`,
    },
  };
}

function articlePage(template, post) {
  const postUrl = `${siteUrl}/insights/${post.slug}`;
  const jsonLd = escapeScriptJson(articleStructuredData(post));
  const embeddedPost = escapeScriptJson(post);

  return template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(post.title)} — Roll My Retirement</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${escapeAttr(post.excerpt)}" />`,
    )
    .replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${escapeAttr(postUrl)}" />`,
    )
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${escapeAttr(post.title)}" />`,
    )
    .replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${escapeAttr(post.excerpt)}" />`,
    )
    .replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${escapeAttr(postUrl)}" />`,
    )
    .replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${escapeAttr(post.title)}" />`,
    )
    .replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${escapeAttr(post.excerpt)}" />`,
    )
    .replace(
      '</head>',
      `  <meta property="article:published_time" content="${escapeAttr(post.date)}" />
  <meta property="article:modified_time" content="${escapeAttr(post.date)}" />
  <meta property="article:section" content="${escapeAttr(post.category)}" />
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>`,
    )
    .replace(
      /<div id="post-mount">[\s\S]*?<\/div>\n\n<!-- ─── FOOTER/,
      `<div id="post-mount">
${articleMarkup(post)}
</div>

<!-- ─── FOOTER`,
    )
    .replace(
      '<!-- ─── SCRIPTS ──────────────────────────────────────────────────────── -->',
      `<script type="application/json" id="post-data">
${embeddedPost}
</script>

<!-- ─── SCRIPTS ──────────────────────────────────────────────────────── -->`,
    );
}

async function writeSearchFiles() {
  const postsPath = path.join(root, 'website/data/blog/posts.json');
  const postsData = JSON.parse(await readFile(postsPath, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  const routes = [
    { path: '/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { path: '/advisors', lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { path: '/contact', lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { path: '/insights', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    ...postsData.posts.map((post) => ({
      path: `/insights/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: post.featured ? '0.7' : '0.6',
    })),
  ];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    routes.map(sitemapUrl).join('\n'),
    '</urlset>',
    '',
  ].join('\n');

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');

  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(dist, 'robots.txt'), robots, 'utf8');
}

async function writeArticlePages() {
  const template = await readFile(path.join(root, 'website/pages/article.html'), 'utf8');
  const postsData = JSON.parse(await readFile(path.join(root, 'website/data/blog/posts.json'), 'utf8'));

  for (const post of postsData.posts) {
    const outputPath = path.join(dist, 'insights', `${post.slug}.html`);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, articlePage(template, post), 'utf8');
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await copyEntry(entry);
}

await writeSearchFiles();
await writeArticlePages();

console.log(`Built static site to ${path.relative(root, dist)}/`);
