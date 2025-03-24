import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/app.ts', 'src/aggregations/albums.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node22',
  outdir: 'dist/lambda',
  format: 'esm',
  sourcemap: true,
  outExtension: { '.js': '.mjs' },
  banner: {
    js: `
      import { createRequire } from 'module';
      import { fileURLToPath } from 'url';
      import { dirname } from 'path';
      
      const require = createRequire(import.meta.url);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
    `
  },
  external: [
    '@aws-sdk/*',
    'aws-sdk',
    'crypto',
    'path',
    'fs',
    'url',
    'util',
    'stream',
    'buffer',
    'events',
    'http',
    'https',
    'net',
    'tls',
    'zlib'
  ]
});