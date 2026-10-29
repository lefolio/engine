import type { Metadata } from 'next';
import { loadManifest } from '@/lib/content/load-manifest';
import { metadataForHref } from '@/lib/content/page-seo';
import { getTemplate, resolveTemplateId } from '@/lib/templates/registry';

export function generateMetadata(): Metadata {
  return metadataForHref(loadManifest(), '/');
}

export default function HomePage() {
  const manifest = loadManifest();
  const { Home } = getTemplate(resolveTemplateId(manifest));
  return <Home manifest={manifest} />;
}
