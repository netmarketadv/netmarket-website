import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

// Load the existing TypeScript sources with the locked Vite runtime; never fetch CMS here.
export async function exportSources() {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const require = createRequire(new URL('../../../package.json', import.meta.url));
  const viteRequire = createRequire(require.resolve('vitest/package.json'));
  const { createServer } = await import(pathToFileURL(viteRequire.resolve('vite')).href);
  const previous = process.cwd();
  process.chdir(resolve(root, 'apps/web'));
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    resolve: { alias: { '@': resolve(process.cwd(), 'src') } },
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: 'custom'
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Preparation uses versioned sources only.');
  };
  try {
    const services = await server.ssrLoadModule('/src/lib/services/content.ts');
    const projects = await server.ssrLoadModule('/src/lib/projects/content.ts');
    const serviceData = await services.getServiceArchiveData();
    const projectData = await projects.getProjectArchiveData();
    if (serviceData.source !== 'fallback' || projectData.source !== 'migration-snapshot')
      throw new Error('Unexpected content origin during reconstruction.');
    return { services: serviceData.services, projects: projectData.projects };
  } finally {
    globalThis.fetch = originalFetch;
    await server.close();
    process.chdir(previous);
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = resolve('artifacts/stape-cms-preparation');
  mkdirSync(output, { recursive: true });
  writeFileSync(
    resolve(output, 'source-payloads.json'),
    JSON.stringify(await exportSources(), null, 2) + '\n'
  );
}
