import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await copyEntry(entry);
}

console.log(`Built static site to ${path.relative(root, dist)}/`);
