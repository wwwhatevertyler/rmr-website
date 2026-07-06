import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const siteUrl = 'https://www.rollmyretirement.com';

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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await copyEntry(entry);
}

await writeSearchFiles();

console.log(`Built static site to ${path.relative(root, dist)}/`);
