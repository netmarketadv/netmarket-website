import { readdir, readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { transformHeadingItalicOHtml } from './heading-italic-o';

type MiddlewareNext = (error?: unknown) => void;
type ViteDevServerLike = {
  middlewares: {
    use: (handler: (request: IncomingMessage, response: ServerResponse, next: MiddlewareNext) => void) => void;
  };
};

async function findHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return findHtmlFiles(path);
      }

      return Promise.resolve(entry.isFile() && entry.name.endsWith('.html') ? [path] : []);
    })
  );

  return files.flat();
}

function shouldTransformResponse(response: ServerResponse) {
  const contentType = response.getHeader('content-type');
  return typeof contentType === 'string' && contentType.includes('text/html');
}

function configureDevServer(server: ViteDevServerLike) {
  server.middlewares.use((_request, response, next) => {
    const chunks: Buffer[] = [];
    const originalWrite = response.write.bind(response);
    const originalEnd = response.end.bind(response);
    const originalWriteHead = response.writeHead.bind(response);

    response.writeHead = ((...args: Parameters<ServerResponse['writeHead']>) => {
      if (shouldTransformResponse(response)) {
        response.removeHeader('content-length');
      }

      return originalWriteHead(...args);
    }) as ServerResponse['writeHead'];

    response.write = ((chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error) => void), callback?: (error?: Error) => void) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));

      if (typeof encodingOrCallback === 'function') {
        encodingOrCallback();
      } else if (callback) {
        callback();
      }

      return true;
    }) as ServerResponse['write'];

    response.end = ((chunk?: string | Uint8Array | (() => void), encodingOrCallback?: BufferEncoding | (() => void), callback?: () => void) => {
      const endCallback = typeof chunk === 'function' ? chunk : typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;

      if (typeof chunk === 'string' || chunk instanceof Uint8Array) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      if (!shouldTransformResponse(response)) {
        for (const bufferedChunk of chunks) {
          originalWrite(bufferedChunk);
        }

        return originalEnd(endCallback);
      }

      const html = Buffer.concat(chunks).toString('utf8');
      const transformed = transformHeadingItalicOHtml(html);
      if (!response.headersSent) {
        response.removeHeader('content-length');
      }
      return originalEnd(transformed, 'utf8', endCallback);
    }) as ServerResponse['end'];

    next();
  });
}

export function headingItalicOIntegration(): AstroIntegration {
  return {
    name: 'netmarket-heading-italic-o',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        const plugin = {
          name: 'netmarket-heading-italic-o-html',
          enforce: 'post',
          configureServer: configureDevServer,
          transformIndexHtml: {
            order: 'post',
            handler: transformHeadingItalicOHtml
          }
        } as const;

        updateConfig({
          vite: {
            plugins: [plugin]
          }
        });
      },
      'astro:build:done': async ({ dir }) => {
        const outputDirectory = fileURLToPath(dir);
        const htmlFiles = await findHtmlFiles(outputDirectory);

        await Promise.all(
          htmlFiles.map(async (file) => {
            const source = await readFile(file, 'utf8');
            const transformed = transformHeadingItalicOHtml(source);

            if (transformed !== source) {
              await writeFile(file, transformed);
            }
          })
        );
      }
    }
  };
}
