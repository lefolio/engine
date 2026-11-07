import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { loadManifest } from '@lefolio/engine/content';
import { DocumentLang, MarkdownComponentsProvider } from '@lefolio/engine/markdown';
import { CONTENT_VERSION } from '../.content/content-version';
import './globals.css';

export function generateMetadata(): Metadata {
  const manifest = loadManifest();
  return {
    title: manifest.config.site.title,
    description: manifest.config.site.description,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const manifest = loadManifest();
  void CONTENT_VERSION;

  return (
    <html lang={manifest.lang} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <DocumentLang fallback={manifest.lang} routeLangs={manifest.routeLangs} />
        <MarkdownComponentsProvider>
          <main>{children}</main>
        </MarkdownComponentsProvider>
      </body>
    </html>
  );
}
