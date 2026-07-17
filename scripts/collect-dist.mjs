/* Assemble the deployable site in dist/: the vanilla app files plus
   the built assistant island. Netlify publishes dist/. */
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const FILES = [
  'index.html',
  'styles.css',
  'app.js',
  'data.js',
  'manifest.webmanifest',
  'logo.webp',
  'logo.png',
  'touch-icon.png',
  'unfurl.png',
];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const f of FILES) cpSync(f, `dist/${f}`);
cpSync('faces', 'dist/faces', { recursive: true });
cpSync('assistant', 'dist/assistant', { recursive: true });
console.log('dist/ assembled');
