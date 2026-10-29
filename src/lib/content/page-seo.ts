import type { Metadata } from 'next';
import type { ContentConfig, ContentManifest, PageFrontmatter, PageSeo } from './types';

export interface SeoSource {
  href: string;
  lang: string;
  title: string;
  frontmatter: PageFrontmatter;
}

type ConfigExtras = ContentConfig & {
  brand?: string;
  routes?: Array<Record<string, string | undefined>>;
  languages?: Record<string, { locale?: string }>;
};

export function normalizeHref(href: string): string {
  const path = (href || '/').split(/[?#]/)[0] || '/';
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

export function readPageSeo(frontmatter: PageFrontmatter | null | undefined): PageSeo {
  const raw = frontmatter?.seo;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const seo = raw as Record<string, unknown>;
  const text = (key: string) => {
    const value = seo[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };
  return {
    title: text('title'),
    description: text('description'),
    image: text('image'),
    schema: text('schema'),
  };
}

export function resolveSeoText(
  source: Pick<SeoSource, 'title' | 'frontmatter'>,
  site: { title?: string; description?: string },
): { title: string; description: string; image?: string; schema?: string } {
  const seo = readPageSeo(source.frontmatter);
  const descriptionFromPage =
    typeof source.frontmatter.description === 'string' ? source.frontmatter.description.trim() : '';
  return {
    title: seo.title || source.frontmatter.title || source.title || site.title || '',
    description: seo.description || descriptionFromPage || site.description || '',
    image: seo.image,
    schema: seo.schema,
  };
}

export function seoSourceForHref(manifest: ContentManifest, href: string): SeoSource | null {
  const path = normalizeHref(href);

  if (path === '/' && manifest.home) {
    return {
      href: '/',
      lang: manifest.home.lang,
      title: manifest.home.title,
      frontmatter: manifest.home.frontmatter,
    };
  }

  const standalone = manifest.standalonePages.find((page) => normalizeHref(page.href) === path);
  if (standalone) return standalone;

  const page = manifest.pages.find((entry) => normalizeHref(entry.href) === path);
  if (page) return page;

  const section = manifest.sections.find((entry) => normalizeHref(`/${entry.sectionSlug}/`) === path);
  if (section?.index) {
    return {
      href: path,
      lang: section.index.lang,
      title: section.index.title,
      frontmatter: section.index.frontmatter,
    };
  }

  return null;
}

function siteOrigin(config: ContentConfig): string {
  return (config.site.url ?? '').replace(/\/$/, '');
}

function absoluteUrl(origin: string, basePath: string, href: string, trailingSlash = true): string {
  const path = trailingSlash
    ? normalizeHref(href)
    : (href.startsWith('/') ? href : `/${href}`).replace(/\/+$/, '') || '/';
  const joined = `${basePath}${path}`.replace(/\/{2,}/g, '/');
  return origin ? `${origin}${joined}` : joined;
}

function languageAlternates(
  config: ConfigExtras,
  href: string,
  origin: string,
  basePath: string,
): { languages?: Record<string, string>; locale?: string; alternateLocales?: string[] } {
  const routes = config.routes ?? [];
  const path = normalizeHref(href);
  const pair = routes.find((route) =>
    Object.values(route).some((value) => value && normalizeHref(value) === path),
  );
  if (!pair) return {};

  const languages: Record<string, string> = {};
  for (const [lang, target] of Object.entries(pair)) {
    if (!target) continue;
    languages[lang] = absoluteUrl(origin, basePath, target);
  }
  if (pair.fr) languages['x-default'] = absoluteUrl(origin, basePath, pair.fr);

  const pageLang = Object.entries(pair).find(([, target]) => target && normalizeHref(target) === path)?.[0];
  const locale = pageLang ? config.languages?.[pageLang]?.locale : undefined;
  const alternateLocales = Object.keys(pair)
    .filter((lang) => lang !== pageLang && pair[lang] && config.languages?.[lang]?.locale)
    .map((lang) => config.languages![lang]!.locale!);

  return { languages, locale, alternateLocales };
}

export function metadataForHref(manifest: ContentManifest, href: string): Metadata {
  const config = manifest.config as ConfigExtras;
  const source = seoSourceForHref(manifest, href);
  const fields = source
    ? resolveSeoText(source, config.site)
    : { title: config.site.title ?? '', description: config.site.description ?? '' };

  const origin = siteOrigin(config);
  const url = absoluteUrl(origin, manifest.basePath || '', source?.href ?? href);
  const alternates = languageAlternates(config, source?.href ?? href, origin, manifest.basePath || '');
  const imagePath = fields.image || manifest.authorAvatar || undefined;
  const image = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : absoluteUrl(origin, '', imagePath.startsWith('/') ? imagePath : `/${imagePath}`, false)
    : undefined;
  const brand = config.brand || config.site.title || undefined;
  const isArticle = fields.schema === 'article';

  return {
    title: fields.title || undefined,
    description: fields.description || undefined,
    alternates: {
      canonical: url,
      ...(alternates.languages ? { languages: alternates.languages } : {}),
    },
    openGraph: {
      title: fields.title || undefined,
      description: fields.description || undefined,
      url,
      siteName: brand,
      locale: alternates.locale,
      alternateLocale: alternates.alternateLocales,
      type: isArticle ? 'article' : 'website',
      ...(isArticle && source?.frontmatter.date
        ? { publishedTime: String(source.frontmatter.date) }
        : {}),
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: fields.title || undefined,
      description: fields.description || undefined,
      ...(image ? { images: [image] } : {}),
    },
  };
}
