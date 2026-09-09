import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outputPath = resolve(root, 'apps/web/dist/.htaccess');
const redirectMapPath = resolve(root, 'data/migrations/go-live/legacy-url-map.json');
const environment = process.env.PUBLIC_DEPLOY_ENV ?? 'local';

if (!['local', 'staging', 'production'].includes(environment)) {
  throw new Error(`PUBLIC_DEPLOY_ENV non valido: ${environment}`);
}

const common = `ErrorDocument 404 /404.html

AddType image/x-icon .ico
AddType application/manifest+json .webmanifest

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml
</IfModule>
`;

const staging = `${common}
<IfModule mod_headers.c>
  Header always set Cache-Control "no-store, max-age=0"
  Header always set X-Robots-Tag "noindex, nofollow, noarchive"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;

function rulePattern(path) {
  return path
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function productionConfig() {
  const migration = JSON.parse(await readFile(redirectMapPath, 'utf8'));
  const redirects = migration.entries
    .filter((entry) => entry.action === '301')
    .map(
      (entry) =>
        `RewriteRule ^${rulePattern(entry.oldPath)}/?$ https://netmarket.it${entry.newPath} [R=301,L,NE]`
    );
  const gone = migration.entries
    .filter((entry) => entry.action === '410')
    .map((entry) => `RewriteRule ^${rulePattern(entry.oldPath)}/?$ - [G,L]`);

  return `${common}
RewriteEngine On

# URL legacy: risoluzione diretta verso la destinazione canonica, prima del dominio.
${redirects.join('\n')}

# Contenuti temporanei o tecnici rimossi senza equivalente.
${gone.join('\n')}

# Una sola origine canonica, possibilmente in un salto.
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} !^netmarket\\.it$ [NC]
RewriteRule ^ https://netmarket.it%{REQUEST_URI} [R=301,L,NE]

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Strict-Transport-Security "max-age=31536000"

  <FilesMatch "\\.(?:css|js|mjs|woff2?|ttf|ico|png|jpe?g|webp|avif|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(?:html?)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
`;
}

const contents = environment === 'production' ? await productionConfig() : staging;
await writeFile(outputPath, contents, 'utf8');
console.log(`Configurazione ${environment} scritta in ${outputPath}`);
