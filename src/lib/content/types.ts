export interface SiteConfig {
  title: string;
  description?: string;
  url?: string;
  basePath?: string;
  /** Default page language (BCP 47, e.g. `fr`). Pages override it with a `lang` frontmatter key. */
  lang?: string;
}

export interface AuthorConfig {
  name: string;
  pronouns?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  employer?: string;
  links?: Record<string, string>;
}

export type NavigationConfig =
  | string[]
  | Record<string, string | null>
  | Array<string | Record<string, string>>;

export interface AnalyticsConfig {
  /** GA4 measurement ID, e.g. G-XXXXXXXXXX */
  google?: string;
}

export interface HeaderCtaConfig {
  label: string;
  href: string;
}

export interface ContentConfig {
  site: SiteConfig;
  home: string;
  author: AuthorConfig;
  navigation: NavigationConfig;
  template?: string;
  analytics?: AnalyticsConfig;
  /** Obsidian vault root for wikilink/embed resolution (relative to content dir, or absolute). */
  vault?: string;
  /** Optional site logo path (vault-relative), used by landing-style shells. */
  logo?: string;
  /** Optional favicon path (vault-relative), copied to content-assets at sync. */
  favicon?: string;
  /** Optional header CTA (label + href; href may be external). */
  cta?: HeaderCtaConfig;
}

export interface PageFrontmatter {
  title?: string;
  date?: string;
  order?: number;
  permalink?: string;
  authors?: string | string[];
  venue?: string;
  journal?: string;
  proceedings?: string;
  thumbnail?: string;
  live_url?: string;
  github_url?: string;
  hero_image?: string;
  /** Full-bleed image above a blog/article body (preferred over thumbnail for posts). */
  feature_image?: string;
  display?: string;
  sort?: string;
  preview?: string;
  /**
   * Draft flag (`false`) or publish date (`2026-07-26`).
   * Omit / `true` = published; date strings are treated as published with that date.
   */
  published?: boolean | string;
  /** Last-updated date (ISO or display string). */
  updated?: string;
  /** Page language; on a section index note it also applies to the section's pages. */
  lang?: string;
  [key: string]: unknown;
}

export interface ManifestPage {
  relativePath: string;
  /** Original folder name (e.g. "Blog"). */
  section: string;
  /** Slugified section URL segment (e.g. "blog"). */
  sectionSlug: string;
  slug: string;
  title: string;
  lang: string;
  frontmatter: PageFrontmatter;
  processedBody: string;
  href: string;
  /** Resolved public URL for feature/hero/thumbnail image. */
  thumbnail?: string | null;
}

export interface NavItem {
  label: string;
  href: string;
  type: 'section' | 'page' | 'external';
}

export interface SectionListItem {
  section: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  href: string;
  date?: string | null;
  authors: string[];
  venue?: string | null;
  thumbnail?: string | null;
  frontmatter?: PageFrontmatter;
}

export interface SectionIndexNote {
  relativePath: string;
  title: string;
  lang: string;
  frontmatter: PageFrontmatter;
  processedBody: string;
}

export interface NavSection {
  name: string;
  /** Slugified URL segment for the section (e.g. "blog" for folder "Blog"). */
  sectionSlug: string;
  display: string;
  preview?: string | null;
  index: SectionIndexNote | null;
  pages: SectionListItem[];
}

export interface StandalonePage {
  relativePath: string;
  /** Raw basename without extension. */
  segment: string;
  /** Slugified URL segment (e.g. "tutorial" for "Tutorial.md"). */
  sectionSlug: string;
  title: string;
  lang: string;
  frontmatter: PageFrontmatter;
  processedBody: string;
  href: string;
}

export interface ContentManifest {
  generatedAt: string;
  template: string;
  config: ContentConfig;
  basePath: string;
  /** Site default language (`site.lang`, default `en`). */
  lang: string;
  /** Language of every route (no basePath), e.g. `{ "/": "fr", "/en/": "en" }`. */
  routeLangs: Record<string, string>;
  home: {
    relativePath: string;
    title: string;
    lang: string;
    frontmatter: PageFrontmatter;
    processedBody: string;
    heroImage?: string | null;
  } | null;
  navigation: NavItem[];
  sections: NavSection[];
  standalonePages: StandalonePage[];
  sectionRoutes: Array<{ section: string }>;
  pages: ManifestPage[];
  assets: Record<string, string>;
  authorAvatar: string | null;
  logo: string | null;
  favicon: string | null;
}
