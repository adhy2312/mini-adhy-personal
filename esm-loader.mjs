import { access } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve as pathResolve, extname } from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('/'))) {
      const parentURL = context.parentURL;
      if (parentURL && parentURL.startsWith('file:')) {
        const parentPath = fileURLToPath(parentURL);
        const parentDir = pathResolve(parentPath, '..');
        
        // Try adding .js
        const candidateJs = pathResolve(parentDir, specifier + '.js');
        try {
          await access(candidateJs);
          return nextResolve(pathToFileURL(candidateJs).href, context);
        } catch {}

        // Try /index.js
        const candidateIndex = pathResolve(parentDir, specifier, 'index.js');
        try {
          await access(candidateIndex);
          return nextResolve(pathToFileURL(candidateIndex).href, context);
        } catch {}
      }
    }
    throw err;
  }
}

