import type { ReactNode } from 'react';
import type { ContentManifest } from '@lefolio/engine/content';
import Navbar from './Navbar';

export default function SiteShell({
  manifest,
  children,
}: {
  manifest: ContentManifest;
  children: ReactNode;
}) {
  return (
    <div className="site">
      <Navbar manifest={manifest} />
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          Built with{' '}
          <a href="https://github.com/lefolio/engine" rel="noreferrer">
            @lefolio/engine
          </a>
        </div>
      </footer>
    </div>
  );
}
