import type { Metadata } from 'next';
import { loadManifest } from '@lefolio/engine/content';
import { metadataForHref } from '@lefolio/engine/seo';
import Home from '@/components/Home';

export function generateMetadata(): Metadata {
  return metadataForHref(loadManifest(), '/');
}

export default function HomePage() {
  return <Home manifest={loadManifest()} />;
}
