import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const engineRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(engineRoot, 'scripts', 'lefolio.mjs');

function runInit(dir) {
  return spawnSync(process.execPath, [cli, 'init', dir], { encoding: 'utf8' });
}

describe('lefolio init', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lefolio-init-'));
    fs.rmdirSync(dir);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('writes the route files', () => {
    const result = runInit(dir);
    expect(result.status).toBe(0);
    for (const file of [
      'app/layout.tsx',
      'app/page.tsx',
      'app/[section]/page.tsx',
      'app/[section]/[...slug]/page.tsx',
      'components/Home.tsx',
      'components/Section.tsx',
      'components/Page.tsx',
      'Content/config.yaml',
      'Content/Home.md',
      'next.config.ts',
    ]) {
      expect(fs.existsSync(path.join(dir, file))).toBe(true);
    }
    const home = fs.readFileSync(path.join(dir, 'app/page.tsx'), 'utf8');
    expect(home).toContain("@/components/Home");
  });

  test('refuses a non-empty directory', () => {
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'keep');
    const result = runInit(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/not empty/);
    expect(fs.existsSync(path.join(dir, 'keep.txt'))).toBe(true);
  });
});
