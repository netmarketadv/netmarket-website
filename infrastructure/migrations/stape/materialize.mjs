import { readFileSync, writeFileSync, mkdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const file = resolve('data/releases/stape-cms-import.json');
const raw = readFileSync(file);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const digest = hash(raw);
if (process.env.PLAN_SHA256 !== digest) throw new Error('Exact approved plan digest required.');
const plan = JSON.parse(raw);
for (const source of plan.sources) {
  if (hash(readFileSync(source.path)) !== source.sha256)
    throw new Error('Versioned content source changed: ' + source.path);
}
const output = resolve('artifacts/stape-cms-preparation/media');
mkdirSync(output, { recursive: true });
for (const media of plan.media) {
  if (
    !/^(apps\/web\/public\/|data\/releases\/stape-cms-media\/)/.test(media.assetPath) ||
    media.assetPath.split('/').includes('..') ||
    lstatSync(media.assetPath).isSymbolicLink()
  )
    throw new Error('Unauthorized media source path.');
  const bytes = readFileSync(media.assetPath);
  if (hash(bytes) !== media.sha256) throw new Error('Media changed: ' + media.sourceUrl);
  if (!/^[a-f0-9]{64}$/.test(media.key) || /[/\\]/.test(media.filename))
    throw new Error('Unsafe media destination.');
  writeFileSync(resolve(output, media.key + '-' + media.filename), bytes);
}
console.log('Verified all ' + plan.media.length + ' versioned media; approved plan ' + digest);
