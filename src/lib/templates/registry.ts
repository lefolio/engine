import type { ResolvedTemplateModule, TemplateModule } from './types';
import {
  DefaultContentPage,
  DefaultHome,
  DefaultSectionIndex,
  DefaultStandalonePage,
} from './defaults';
import { collectLocalTemplates } from './collect-local';
import * as builtinTemplateEntry from 'lefolio-builtin-template';
import * as localTemplateEntry from 'lefolio-active-template';

const templates: Record<string, TemplateModule> = {};

for (const entry of [builtinTemplateEntry, localTemplateEntry]) {
  for (const template of collectLocalTemplates(entry as Record<string, unknown>)) {
    templates[template.id] = template;
  }
}

function withDefaults(template: TemplateModule): ResolvedTemplateModule {
  return {
    ...template,
    Home: template.Home ?? DefaultHome,
    SectionIndex: template.SectionIndex ?? DefaultSectionIndex,
    StandalonePage: template.StandalonePage ?? DefaultStandalonePage,
    ContentPage: template.ContentPage ?? DefaultContentPage,
  };
}

export function getTemplate(id: string): ResolvedTemplateModule {
  const template = templates[id];
  if (template) {
    return withDefaults(template);
  }

  const [fallback] = Object.values(templates);
  if (!fallback) {
    throw new Error(`Template "${id}" not found (no built-in or site-local template is available).`);
  }
  if (typeof console !== 'undefined') {
    console.warn(`Unknown template "${id}", falling back to "${fallback.id}".`);
  }
  return withDefaults(fallback);
}

export function resolveTemplateId(manifest: {
  template?: string;
  config?: { template?: string };
}): string {
  return manifest.template ?? manifest.config?.template ?? 'academic';
}
