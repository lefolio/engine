import { metadataForHref, readPageSeo, resolveSeoText, seoSourceForHref } from './page-seo';
import type { ContentManifest, PageFrontmatter } from './types';

describe('readPageSeo', () => {
  it('reads a seo object and ignores other shapes', () => {
    expect(
      readPageSeo({
        seo: { title: 'Long title', description: 'Override', schema: 'article' },
      } as PageFrontmatter),
    ).toEqual({
      title: 'Long title',
      description: 'Override',
      image: undefined,
      schema: 'article',
    });
    expect(readPageSeo({ seo: 'nope' } as PageFrontmatter)).toEqual({});
  });
});

describe('resolveSeoText', () => {
  it('prefers seo.title over the page title and description from frontmatter', () => {
    expect(
      resolveSeoText(
        {
          title: 'Accueil',
          frontmatter: {
            title: 'Accueil',
            description: 'From the note',
            seo: { title: 'Psychopraticien à Strasbourg' },
          },
        },
        { title: 'Site', description: 'Site description' },
      ),
    ).toMatchObject({
      title: 'Psychopraticien à Strasbourg',
      description: 'From the note',
    });
  });

  it('falls back to the page title and site description', () => {
    expect(
      resolveSeoText({ title: 'About', frontmatter: {} }, { title: 'Site', description: 'Hello' }),
    ).toMatchObject({ title: 'About', description: 'Hello' });
  });
});

describe('seoSourceForHref', () => {
  const manifest = {
    home: {
      lang: 'fr',
      title: 'Accueil',
      frontmatter: { title: 'Accueil' },
    },
    standalonePages: [
      { href: '/approche/', lang: 'fr', title: 'Approche', frontmatter: { title: 'Approche' } },
    ],
    pages: [
      {
        href: '/en/approach/',
        lang: 'en',
        title: 'Approach',
        frontmatter: { title: 'Approach' },
      },
    ],
    sections: [
      {
        sectionSlug: 'en',
        index: { lang: 'en', title: 'Home', frontmatter: { title: 'Home' } },
      },
    ],
  } as unknown as ContentManifest;

  it('resolves home, standalone, nested, and section index routes', () => {
    expect(seoSourceForHref(manifest, '/')?.title).toBe('Accueil');
    expect(seoSourceForHref(manifest, '/approche')?.title).toBe('Approche');
    expect(seoSourceForHref(manifest, '/en/approach/')?.lang).toBe('en');
    expect(seoSourceForHref(manifest, '/en/')?.title).toBe('Home');
  });
});

describe('metadataForHref', () => {
  it('keeps a file extension on the Open Graph image URL', () => {
    const metadata = metadataForHref(
      {
        basePath: '',
        authorAvatar: '/content-assets/Assets/olivier-rouiller.webp',
        config: {
          site: { url: 'https://www.re-connected.fr', title: '', description: '' },
          routes: [{ fr: '/', en: '/en/' }],
          languages: { fr: { locale: 'fr_FR' }, en: { locale: 'en_US' } },
        },
        home: {
          href: '/',
          lang: 'fr',
          title: 'Accueil',
          frontmatter: { title: 'Accueil', description: 'Desc', seo: { title: 'Long' } },
        },
        standalonePages: [],
        pages: [],
        sections: [],
      } as unknown as ContentManifest,
      '/',
    );

    const images = metadata.openGraph && 'images' in metadata.openGraph ? metadata.openGraph.images : undefined;
    expect(images).toEqual(['https://www.re-connected.fr/content-assets/Assets/olivier-rouiller.webp']);
    expect(metadata.alternates?.canonical).toBe('https://www.re-connected.fr/');
  });
});
