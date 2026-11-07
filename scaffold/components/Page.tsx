import type { ManifestPage } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

function formatDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Page({ page }: { page: ManifestPage }) {
  const date = formatDate(page.frontmatter?.date);

  return (
    <article className="prose">
      <header className="article-header">
        {date ? <p className="article-header__meta">{date}</p> : null}
      </header>
      <MarkdownBody content={page.processedBody} />
    </article>
  );
}
