'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ContentManifest } from '@lefolio/engine/content';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href);
}

export default function Navbar({ manifest }: { manifest: ContentManifest }) {
  const pathname = usePathname() || '/';
  const title = manifest.config.site.title || 'LeFolio';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-brand" href="/">
          {title}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {manifest.navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
