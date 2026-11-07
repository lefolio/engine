import type { NavSection, StandalonePage } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';

export default function Section({ section }: { section: NavSection }) {
  return <MarkdownBody content={section.index?.processedBody ?? ''} />;
}

export function Standalone({ page }: { page: StandalonePage }) {
  return <MarkdownBody content={page.processedBody} />;
}
