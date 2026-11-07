#!/usr/bin/env node
/**
 * Normalized static-export snapshot and diff.
 *
 *   node scripts/compare-build.mjs snapshot <outDir> <snapshot.json>
 *   node scripts/compare-build.mjs diff <snapshot.json> <outDir>
 *
 * Compares routes, document metadata, JSON-LD types, sitemap URLs, and the
 * visible text of <main>. Next chunk URLs and build ids are ignored.
 */
import fs from 'fs';
import path from 'path';

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '_next' ? [] : walkHtml(full);
    return entry.name === 'index.html' ? [full] : [];
  });
}

function routeOf(outDir, file) {
  const rel = path.relative(outDir, path.dirname(file)).split(path.sep).join('/');
  if (!rel || rel === '.') return '/';
  return `/${rel}/`;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function mainText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return stripTags(main ? main[1] : html.replace(/<header[\s\S]*?<\/header>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' '));
}

function attr(html, re) {
  const match = html.match(re);
  return match ? match[1] : '';
}

function jsonLdTypes(html) {
  const types = [];
  for (const block of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(block[1]);
      const nodes = data['@graph'] || [data];
      for (const node of nodes) {
        if (node && node['@type']) types.push(String(node['@type']));
      }
    } catch {
      types.push('invalid-jsonld');
    }
  }
  return types.sort();
}

function hreflang(html) {
  return [...html.matchAll(/<link[^>]*rel="alternate"[^>]*>/gi)]
    .map((tag) => {
      const lang = attr(tag[0], /hreflang="([^"]+)"/i) || attr(tag[0], /hrefLang="([^"]+)"/);
      const href = attr(tag[0], /href="([^"]+)"/i);
      return lang ? `${lang} ${href}` : '';
    })
    .filter(Boolean)
    .sort();
}

function pageRecord(html) {
  const refresh = attr(html, /http-equiv="refresh"[^>]*content="([^"]+)"/i);
  return {
    title: attr(html, /<title>([^<]*)<\/title>/i),
    description: attr(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || attr(html, /<meta[^>]*content="([^"]*)"[^>]*name="description"/i),
    canonical: attr(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i),
    hreflang: hreflang(html),
    jsonLd: jsonLdTypes(html),
    redirect: refresh || '',
    text: refresh ? '' : mainText(html),
  };
}

function sitemapUrls(outDir) {
  const file = path.join(outDir, 'sitemap.xml');
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
}

export function snapshotOut(outDir) {
  const pages = {};
  for (const file of walkHtml(outDir)) {
    pages[routeOf(outDir, file)] = pageRecord(fs.readFileSync(file, 'utf8'));
  }
  return {
    routes: Object.keys(pages).sort(),
    pages,
    sitemap: sitemapUrls(outDir),
  };
}

function diffSnapshots(before, after) {
  const lines = [];
  const beforeRoutes = new Set(before.routes);
  const afterRoutes = new Set(after.routes);
  for (const route of before.routes) {
    if (!afterRoutes.has(route)) lines.push(`missing route ${route}`);
  }
  for (const route of after.routes) {
    if (!beforeRoutes.has(route)) lines.push(`extra route ${route}`);
  }
  for (const route of before.routes) {
    if (!after.pages[route]) continue;
    const a = before.pages[route];
    const b = after.pages[route];
    for (const key of ['title', 'description', 'canonical', 'redirect', 'text']) {
      if (a[key] !== b[key]) {
        lines.push(`${route} ${key} changed`);
        lines.push(`  - ${String(a[key]).slice(0, 180)}`);
        lines.push(`  + ${String(b[key]).slice(0, 180)}`);
      }
    }
    if (JSON.stringify(a.hreflang) !== JSON.stringify(b.hreflang)) {
      lines.push(`${route} hreflang changed`);
    }
    if (JSON.stringify(a.jsonLd) !== JSON.stringify(b.jsonLd)) {
      lines.push(`${route} jsonLd ${JSON.stringify(a.jsonLd)} -> ${JSON.stringify(b.jsonLd)}`);
    }
  }
  if (JSON.stringify(before.sitemap) !== JSON.stringify(after.sitemap)) {
    lines.push('sitemap URLs changed');
    const beforeSet = new Set(before.sitemap);
    const afterSet = new Set(after.sitemap);
    for (const url of before.sitemap) if (!afterSet.has(url)) lines.push(`  missing ${url}`);
    for (const url of after.sitemap) if (!beforeSet.has(url)) lines.push(`  extra ${url}`);
  }
  return lines;
}

function main() {
  const [command, a, b] = process.argv.slice(2);
  if (command === 'snapshot') {
    const snap = snapshotOut(path.resolve(a));
    fs.mkdirSync(path.dirname(path.resolve(b)), { recursive: true });
    fs.writeFileSync(path.resolve(b), JSON.stringify(snap, null, 2));
    console.log(`snapshot ${snap.routes.length} routes -> ${b}`);
    return;
  }
  if (command === 'diff') {
    const before = JSON.parse(fs.readFileSync(path.resolve(a), 'utf8'));
    const after = snapshotOut(path.resolve(b));
    const lines = diffSnapshots(before, after);
    if (lines.length) {
      console.error(lines.join('\n'));
      process.exit(1);
    }
    console.log(`match ${after.routes.length} routes`);
    return;
  }
  console.error('Usage: compare-build.mjs snapshot <outDir> <file> | diff <file> <outDir>');
  process.exit(1);
}

main();
