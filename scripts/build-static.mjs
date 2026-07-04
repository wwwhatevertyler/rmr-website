import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const entries = [
  ['rmr-home.html', 'index.html'],
  ['rmr-home.html'],
  ['rmr-advisors-page.html'],
  ['rmr-contact.html'],
  ['rmr-blog.html'],
  ['rmr-blog-post.html'],
  ['footer.js'],
  ['cursor.js'],
  ['audio.js'],
  ['router.js'],
  ['audio/background-audio-trimmed.mp3'],
  ['audio/audio-for-clicks-1.wav'],
  ['rmr-logo.png'],
  ['favicon.ico'],
  ['favicon-32x32.png'],
  ['favicon-192x192.png'],
  ['favicon-512x512.png'],
  ['apple-touch-icon.png'],
  ['site.webmanifest'],
  ['blog'],
  ['Website Images'],
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
