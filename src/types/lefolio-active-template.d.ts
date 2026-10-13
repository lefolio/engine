declare module 'lefolio-active-template' {
  import type { TemplateModule } from '@/lib/templates/types';

  export const template: TemplateModule | undefined;
  export const templates: TemplateModule[] | undefined;
  const defaultExport: TemplateModule | null | undefined;
  export default defaultExport;
}

/** The selected built-in template entry (or the empty stub), aliased in next.config.mjs. */
declare module 'lefolio-builtin-template' {
  const entry: Record<string, unknown>;
  export = entry;
}
