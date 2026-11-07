#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { contentEnv, ENGINE_ROOT } from './resolve-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCAFFOLD_DIR = path.join(ENGINE_ROOT, 'scaffold');

function run(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function nextArgs(command, extra) {
  if (!extra.includes('--turbopack') && !extra.includes('--webpack')) {
    return [command, '--webpack', ...extra];
  }
  return [command, ...extra];
}

function resolveNextBin(cwd) {
  const local = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fs.existsSync(local)) return local;
  const engine = path.join(ENGINE_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fs.existsSync(engine)) return engine;
  throw new Error('next is not installed. Add it to this site: npm install next react react-dom');
}

function contentArgs(argv) {
  const args = [];
  for (const flag of ['--content', '--vault']) {
    const idx = argv.indexOf(flag);
    if (idx !== -1 && argv[idx + 1]) {
      args.push(flag, argv[idx + 1]);
    }
  }
  return args;
}

/**
 * A file: install of this checkout has its own @types/react, and so does the
 * site. TypeScript treats those as different React types. Point the site at
 * the engine's copy. A published install has no nested @types, so this is a no-op.
 */
function shareReactTypes(siteRoot) {
  const engineTypes = path.join(ENGINE_ROOT, 'node_modules', '@types');
  const siteTypes = path.join(siteRoot, 'node_modules', '@types');
  for (const name of ['react', 'react-dom']) {
    const source = path.join(engineTypes, name);
    const dest = path.join(siteTypes, name);
    if (!fs.existsSync(source) || !fs.existsSync(path.dirname(dest))) continue;
    let destReal = dest;
    try {
      destReal = fs.realpathSync(dest);
    } catch {
      destReal = dest;
    }
    if (destReal === fs.realpathSync(source)) continue;
    fs.rmSync(dest, { recursive: true, force: true });
    const rel = path.relative(path.dirname(dest), source);
    fs.symlinkSync(rel, dest);
  }
}

function applyRouteLangs(siteRoot) {
  const manifestPath = path.join(siteRoot, '.content', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const routeLangs = manifest.routeLangs ?? {};
  const outDir = path.join(siteRoot, 'out');
  if (!fs.existsSync(outDir)) return;

  for (const [href, lang] of Object.entries(routeLangs)) {
    if (typeof lang !== 'string' || !lang) continue;
    const route = href.replace(/^\/+|\/+$/g, '');
    const htmlPath = route
      ? path.join(outDir, route, 'index.html')
      : path.join(outDir, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, 'utf8');
    const next = html.replace(/<html\b[^>]*>/, (tag) => {
      if (/\slang=/.test(tag)) return tag.replace(/\slang="[^"]*"/, ` lang="${lang}"`);
      return tag.replace('<html', `<html lang="${lang}"`);
    });
    if (next !== html) fs.writeFileSync(htmlPath, next);
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function initSite(dir) {
  const target = path.resolve(dir || '.');
  if (!fs.existsSync(SCAFFOLD_DIR)) {
    throw new Error(`Scaffold is missing at ${SCAFFOLD_DIR}`);
  }
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new Error(`Refusing to init ${target}: the directory is not empty.`);
  }
  fs.mkdirSync(target, { recursive: true });
  copyDir(SCAFFOLD_DIR, target);
  console.log(`Created a LeFolio app in ${target}`);
  console.log('Next: cd there, npm install, then lefolio dev');
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv.find((arg) => !arg.startsWith('-'));
  const siteRoot = process.cwd();
  const env = contentEnv(argv);
  const flags = contentArgs(argv);
  const passthrough = argv.filter((arg, index) => {
    if (arg.startsWith('-') && arg !== command) {
      const prev = argv[index - 1];
      if (prev === '--content' || prev === '--vault') return false;
      return true;
    }
    if (argv[index - 1] === '--content' || argv[index - 1] === '--vault') return false;
    return false;
  });

  if (!command || command === 'help' || command === '--help') {
    console.log(`Usage: lefolio <command> [--content <path>] [--vault <path>]

Commands:
  init [dir]   Copy a Next.js app scaffold. Refuses a non-empty directory.
  sync         Compile Content/ into .content/manifest.json and public/content-assets
  dev          Sync, watch Content/, and run next dev in this directory
  build        Sync, then next build in this directory

The site is an ordinary Next.js app. lefolio only compiles the vault.
`);
    process.exit(command ? 0 : 1);
  }

  const script = path.join(__dirname, 'sync-content.mjs');

  switch (command) {
    case 'init': {
      const dir = argv.find((arg, index) => index > argv.indexOf('init') && !arg.startsWith('-'));
      initSite(dir);
      break;
    }

    case 'sync':
      await run(process.execPath, [script, ...flags], { cwd: siteRoot, env });
      break;

    case 'build':
      await run(process.execPath, [script, ...flags], { cwd: siteRoot, env });
      shareReactTypes(siteRoot);
      await run(process.execPath, [resolveNextBin(siteRoot), ...nextArgs('build', passthrough)], {
        cwd: siteRoot,
        env,
      });
      applyRouteLangs(siteRoot);
      break;

    case 'dev': {
      await run(process.execPath, [script, ...flags], { cwd: siteRoot, env });
      shareReactTypes(siteRoot);
      const watch = spawn(process.execPath, [path.join(__dirname, 'watch-content.mjs'), ...flags], {
        cwd: siteRoot,
        stdio: 'inherit',
        env,
      });
      const next = spawn(process.execPath, [resolveNextBin(siteRoot), ...nextArgs('dev', passthrough)], {
        cwd: siteRoot,
        stdio: 'inherit',
        env,
      });
      const shutdown = () => {
        watch.kill();
        next.kill();
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      await new Promise((resolve) => next.on('close', resolve));
      watch.kill();
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
