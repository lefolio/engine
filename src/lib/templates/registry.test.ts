import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('./defaults', () => ({
  DefaultHome: () => null,
  DefaultSectionIndex: () => null,
  DefaultStandalonePage: () => null,
  DefaultContentPage: () => null,
}));

jest.mock('@/templates/academic', () => ({
  academicTemplate: {
    id: 'academic',
    routing: 'multipage',
    Shell: () => null,
    loadStyles: async () => undefined,
  },
}));
jest.mock('@/templates/treasure', () => ({
  treasureTemplate: {
    id: 'treasure',
    routing: 'multipage',
    Shell: () => null,
    loadStyles: async () => undefined,
  },
}));
jest.mock('@/templates/portfolio', () => ({
  portfolioTemplate: {
    id: 'portfolio',
    routing: 'multipage',
    Shell: () => null,
    loadStyles: async () => undefined,
    Home: () => null,
  },
}));

const localShell = () => null;
jest.mock('lefolio-active-template', () => ({
  templates: [],
  template: undefined,
  default: null,
}));

describe('templates/registry', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('resolveTemplateId prefers manifest.template then config then academic', async () => {
    const { resolveTemplateId } = await import('./registry');
    expect(resolveTemplateId({ template: 'portfolio' })).toBe('portfolio');
    expect(resolveTemplateId({ config: { template: 'treasure' } })).toBe('treasure');
    expect(resolveTemplateId({})).toBe('academic');
  });

  it('getTemplate returns the requested template with defaults filled', async () => {
    const { getTemplate } = await import('./registry');
    const portfolio = getTemplate('portfolio');
    expect(portfolio.id).toBe('portfolio');
    expect(typeof portfolio.Home).toBe('function');
    expect(typeof portfolio.SectionIndex).toBe('function');
    expect(typeof portfolio.ContentPage).toBe('function');
  });

  it('getTemplate falls back to academic for unknown ids', async () => {
    const { getTemplate } = await import('./registry');
    const fallback = getTemplate('nope');
    expect(fallback.id).toBe('academic');
    expect(console.warn).toHaveBeenCalled();
  });

  it('merges local templates and lets local id override builtins', async () => {
    jest.doMock('lefolio-active-template', () => ({
      template: {
        id: 'academic',
        routing: 'multipage',
        Shell: localShell,
        loadStyles: async () => undefined,
        Home: () => null,
      },
      templates: [
        {
          id: 'salo',
          routing: 'multipage',
          Shell: localShell,
          loadStyles: async () => undefined,
        },
      ],
      default: null,
    }));

    const { getTemplate } = await import('./registry');
    expect(getTemplate('salo').id).toBe('salo');
    expect(getTemplate('academic').Shell).toBe(localShell);
  });
});
