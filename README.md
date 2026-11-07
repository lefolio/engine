# `@lefolio/engine`

Compile an Obsidian vault into a static site. The engine is the CLI and the content library. The site is an ordinary Next.js app.

The marketing site lives in **[lefolio/lefolio.md](https://github.com/lefolio/lefolio.md)** (`https://lefolio.md`).

## Structure

```text
lefolio/
├── scripts/             # lefolio CLI, sync, watch
├── scaffold/            # files copied by `lefolio init`
├── src/                 # content, SEO, and markdown libraries
└── package.json         # name: @lefolio/engine
```

## New site

```bash
npx lefolio init my-site
cd my-site
npm install
npx lefolio dev
```

`lefolio init` copies the route files once and refuses a directory that already has files. After that, `app/` and `components/` belong to the site.

`lefolio dev` compiles `Content/` into `.content/manifest.json` and `public/content-assets`, watches the vault, and runs `next dev` in the site. `lefolio build` does the same with `next build`.

The site installs Next, React, and Tailwind. Import the library from `@lefolio/engine/content`, `@lefolio/engine/seo`, and `@lefolio/engine/markdown`. Pass the site's own `:::` component map to `MarkdownComponentsProvider`.

### Languages

`site.lang` in `config.yaml` sets the default `<html lang>` (default `en`). A page overrides it with `lang:` in its frontmatter, and a `lang:` on a section index note (`En/En.md`) applies to every page in that section. `lefolio build` writes the per-page value into the exported HTML.

### Image alt text

`![[photo.webp|A description]]` uses the alias as alt text; without one, the file name is used.

## Develop the engine

```bash
npm install
npm test
npm run pack:dry
```

See [PACKAGING.md](./PACKAGING.md).

## Links

- Site: https://lefolio.md
- Package: `@lefolio/engine`
- Org: https://github.com/lefolio

## License

MIT
