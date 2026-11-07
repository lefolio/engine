import type { ContentManifest } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

export default function Home({ manifest }: { manifest: ContentManifest }) {
  return (
    <div className="prose">
      <MarkdownBody content={manifest.home?.processedBody ?? ''} />
    </div>
  );
}
