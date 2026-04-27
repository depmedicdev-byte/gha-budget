import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

await build({
  entryPoints: [path.join(root, 'src/index.js')],
  outfile: path.join(root, 'browser/gha-budget.bundle.js'),
  bundle: true,
  format: 'iife',
  globalName: 'ghaBudget',
  target: 'es2020',
  platform: 'browser',
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  external: ['node:fs', 'node:path'],
  banner: {
    js: 'var process={env:{}};var require=function(m){if(m==="node:fs")return{};if(m==="node:path")return{basename:(p)=>String(p).split(/[\\\\/]/).pop(),resolve:(...a)=>a.join("/"),join:(...a)=>a.join("/"),relative:(_,p)=>p};throw new Error("missing module: "+m);};',
  },
}).then(() => console.log('built browser bundle')).catch((e) => { console.error(e); process.exit(1); });
