import type { Metadata } from 'next';
import { loadManifest, getSectionRoutes } from '@/lib/content/load-manifest';
import { metadataForHref } from '@/lib/content/page-seo';
import { getTemplate, resolveTemplateId } from '@/lib/templates/registry';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  if (section === '_') return {};
  return metadataForHref(loadManifest(), `/${section}/`);
}

export function generateStaticParams() {
  const params = getSectionRoutes();
  // `output: 'export'` requires at least one path for dynamic segments.
  return params.length > 0 ? params : [{ section: '_' }];
}

export default async function SectionIndexPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionName } = await params;
  const manifest = loadManifest();
  const { SectionIndex, StandalonePage } = getTemplate(resolveTemplateId(manifest));

  const standalonePage = manifest.standalonePages.find(
    (page) => page.sectionSlug === sectionName
  );
  if (standalonePage) {
    return <StandalonePage manifest={manifest} page={standalonePage} />;
  }

  const section = manifest.sections.find((s) => s.sectionSlug === sectionName);

  if (!section) {
    return <p className="text-muted">Section not found.</p>;
  }

  return <SectionIndex manifest={manifest} section={section} />;
}
