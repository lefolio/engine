'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { MarkdownBlockComponent } from '@/lib/markdown/components/types';
import type { ColorScheme } from '@/lib/templates/types';

const MarkdownComponentsContext = createContext<Record<string, MarkdownBlockComponent>>(
  {}
);

const ColorSchemeContext = createContext<ColorScheme>('light');

export function MarkdownComponentsProvider({
  components,
  colorScheme = 'light',
  children,
}: {
  components?: Record<string, MarkdownBlockComponent>;
  colorScheme?: ColorScheme;
  children: ReactNode;
}) {
  return (
    <ColorSchemeContext.Provider value={colorScheme}>
      <MarkdownComponentsContext.Provider value={components ?? {}}>
        {children}
      </MarkdownComponentsContext.Provider>
    </ColorSchemeContext.Provider>
  );
}

export function useMarkdownComponents(): Record<string, MarkdownBlockComponent> {
  return useContext(MarkdownComponentsContext);
}

/** The active template's color scheme (picks the code highlighting palette). */
export function useColorScheme(): ColorScheme {
  return useContext(ColorSchemeContext);
}
