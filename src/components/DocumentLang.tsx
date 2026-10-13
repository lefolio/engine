'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function normalizeRoute(pathname: string): string {
  const route = pathname.endsWith('/') ? pathname : `${pathname}/`;
  try {
    return decodeURI(route);
  } catch {
    return route;
  }
}

/**
 * Keeps `<html lang>` in step with client-side navigation. Static HTML gets the
 * right value at build time; the root layout itself cannot see the route.
 */
export function DocumentLang({
  fallback,
  routeLangs,
}: {
  fallback: string;
  routeLangs: Record<string, string>;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const route = normalizeRoute(pathname || '/');
    document.documentElement.lang = routeLangs[route] ?? fallback;
  }, [pathname, fallback, routeLangs]);

  return null;
}
