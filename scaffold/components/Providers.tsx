'use client';

import type { ReactNode } from 'react';
import { MarkdownComponentsProvider } from '@lefolio/engine/markdown';
import { markdownComponents } from '@/lib/markdown-components';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MarkdownComponentsProvider components={markdownComponents}>{children}</MarkdownComponentsProvider>
  );
}
