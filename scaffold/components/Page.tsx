import type { ManifestPage } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

export default function Page({ page }: { page: ManifestPage }) {
  return <MarkdownBody content={page.processedBody} />;
}
