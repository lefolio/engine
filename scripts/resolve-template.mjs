/**
 * Resolve the template id from config.yaml (used by sync + engine.json).
 */

export const BUILTIN_TEMPLATES = ['academic', 'portfolio', 'treasure'];

export function resolveTemplateId(config) {
  const value = config?.template;
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return 'academic';
}
