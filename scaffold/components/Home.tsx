import type { ContentManifest } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

export default function Home({ manifest }: { manifest: ContentManifest }) {
  return <MarkdownBody content={manifest.home?.processedBody ?? ''} />;
}
