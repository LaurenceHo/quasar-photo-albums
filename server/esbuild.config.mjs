import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/**/*.ts'],
  bundle: false,
  platform: 'node',
  target: 'esnext',
  outdir: 'dist',
  format: 'esm',
  minify: true
});