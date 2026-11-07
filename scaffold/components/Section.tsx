import Link from 'next/link';
import type { NavSection, StandalonePage } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

function formatDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Section({ section }: { section: NavSection }) {
  return (
    <div className="prose">
      {section.index?.processedBody ? (
        <MarkdownBody content={section.index.processedBody} />
      ) : (
        <h1>{section.name}</h1>
      )}
      {section.pages.length > 0 ? (
        <ul className="page-list">
          {section.pages.map((page) => {
            const date = formatDate(page.frontmatter?.date);
            return (
              <li key={page.href}>
                <Link href={page.href}>
                  <span className="page-list__title">{page.title}</span>
                  {date ? <span className="page-list__meta">{date}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function Standalone({ page }: { page: StandalonePage }) {
  return (
    <article className="prose">
      <MarkdownBody content={page.processedBody} />
    </article>
  );
}
