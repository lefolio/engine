import type { Metadata } from 'next';
import './globals.css';
import GoogleAnalytics, {
  normalizeGoogleAnalyticsId,
} from '@/components/GoogleAnalytics';
import { DocumentLang } from '@/components/DocumentLang';
import { loadManifest } from '@/lib/content/load-manifest';
import { CONTENT_VERSION } from '@/lib/content/content-version';
import { getTemplate, resolveTemplateId } from '@/lib/templates/registry';
import { MarkdownComponentsProvider } from '@/components/markdown/MarkdownComponentsProvider';

/** 1×1 transparent GIF — used when the site omits `favicon:` so browsers don't keep a stale /favicon.ico. */
const EMPTY_FAVICON =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export function generateMetadata(): Metadata {
  const manifest = loadManifest();
  const metadata: Metadata = {
    title: manifest.config.site.title,
    description: manifest.config.site.description,
    icons: manifest.favicon
      ? { icon: manifest.favicon }
      : { icon: [{ url: EMPTY_FAVICON, type: 'image/gif', sizes: '1x1' }] },
  };
  return metadata;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const manifest = loadManifest();
  void CONTENT_VERSION;

  const templateId = resolveTemplateId(manifest);
  const template = getTemplate(templateId);
  const { Shell } = template;
  await template.loadStyles();

  const colorScheme = template.colorScheme ?? 'light';
  const googleAnalyticsId = normalizeGoogleAnalyticsId(manifest.config.analytics?.google);

  return (
    <html
      lang={manifest.lang}
      data-template={templateId}
      data-scroll-behavior="smooth"
      style={{ colorScheme }}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {googleAnalyticsId ? <GoogleAnalytics measurementId={googleAnalyticsId} /> : null}
        <DocumentLang fallback={manifest.lang} routeLangs={manifest.routeLangs} />
        <MarkdownComponentsProvider
          components={template.markdownComponents}
          colorScheme={colorScheme}
        >
          <Shell manifest={manifest}>{children}</Shell>
        </MarkdownComponentsProvider>
      </body>
    </html>
  );
}
