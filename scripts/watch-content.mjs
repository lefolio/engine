import chokidar from 'chokidar';
import { spawn } from 'child_process';
import path from 'path';
import { CONTENT_DIR, ENGINE_ROOT, contentEnv, vaultArgs } from './resolve-paths.mjs';

let timer = null;

function syncArgs() {
  const args = [];
  const contentIdx = process.argv.indexOf('--content');
  if (contentIdx !== -1 && process.argv[contentIdx + 1]) {
    args.push('--content', process.argv[contentIdx + 1]);
  }
  args.push(...vaultArgs());
  return args;
}

function runSync() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ENGINE_ROOT, 'scripts/sync-content.mjs'), ...syncArgs()], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: contentEnv(),
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`sync failed: ${code}`))));
  });
}

function debouncedSync() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    runSync().catch((err) => console.error(err.message));
  }, 150);
}

console.log(`Watching ${CONTENT_DIR} for changes...`);

chokidar
  .watch(CONTENT_DIR, { ignoreInitial: true })
  .on('all', (event, filePath) => {
    console.log(`[content] ${event}: ${filePath}`);
    debouncedSync();
  });
