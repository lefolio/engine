import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { resolveContentDir, readEngineMeta } from './scripts/resolve-paths.mjs';
import { BUILTIN_TEMPLATES, resolveTemplateId } from './scripts/resolve-template.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const stubTemplate = path.join(srcDir, 'lib/templates/no-external.ts');
const stubBuiltin = path.join(srcDir, 'lib/templates/no-builtin.ts');

function normalizeBasePath(value) {
  if (!value || value === '/') return '';
  return String(value).replace(/\/$/, '');
}

function readBasePath() {
  const meta = readEngineMeta();
  if (meta?.basePath !== undefined) {
    return normalizeBasePath(meta.basePath);
  }

  const contentDir = resolveContentDir();
  const configPath = path.join(contentDir, 'config.yaml');

  try {
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return normalizeBasePath(config.site?.basePath);
  } catch {
    return '';
  }
}

function resolveExternalTemplateEntry() {
  const root = process.env.LEFOLIO_TEMPLATE_ROOT;
  if (!root) return null;
  for (const name of ['index.ts', 'index.tsx']) {
    const candidate = path.join(root, 'src', name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function readTemplateId() {
  const meta = readEngineMeta();
  if (meta?.template) return meta.template;
  try {
    const config = yaml.load(fs.readFileSync(path.join(resolveContentDir(), 'config.yaml'), 'utf8'));
    return resolveTemplateId(config);
  } catch {
    return resolveTemplateId(null);
  }
}

/**
 * Only the selected built-in is bundled, so other templates' CSS never ships.
 * A site-local template gets the stub; an unknown id without one falls back to academic.
 */
function resolveBuiltinTemplateEntry(templateId, hasExternal) {
  if (BUILTIN_TEMPLATES.includes(templateId)) {
    return path.join(srcDir, 'templates', templateId, 'index.ts');
  }
  return hasExternal ? stubBuiltin : path.join(srcDir, 'templates', 'academic', 'index.ts');
}

const basePath = readBasePath();
const externalTemplateEntry = resolveExternalTemplateEntry();
const activeTemplate = externalTemplateEntry || stubTemplate;
const builtinTemplate = resolveBuiltinTemplateEntry(readTemplateId(), Boolean(externalTemplateEntry));

const packageAliases = {
  '@': srcDir,
  'lefolio-active-template': activeTemplate,
  'lefolio-builtin-template': builtinTemplate,
  '@lefolio/engine/template': path.join(srcDir, 'lib/templates/public.ts'),
  '@lefolio/engine/markdown': path.join(srcDir, 'components/markdown-public.ts'),
  '@lefolio/engine/parse': path.join(srcDir, 'lib/markdown/parse/index.ts'),
  '@lefolio/engine/globals.css': path.join(srcDir, 'app/globals.css'),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Allow compiling site-local `./src` templates outside the engine / cache root.
  ...(externalTemplateEntry ? { experimental: { externalDir: true } } : {}),
  // Next 16 defaults to Turbopack; keep `@/` working for packaged runtimes.
  turbopack: {
    resolveAlias: {
      ...packageAliases,
    },
  },
  // Fallback when building with `--webpack` (e.g. static-export edge cases).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...packageAliases,
    };
    return config;
  },
};

export default nextConfig;
