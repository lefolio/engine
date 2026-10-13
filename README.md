# `@lefolio/engine`

Publish a static site from an Obsidian vault — CLI `lefolio` + Next.js runtime + built-in templates.

The marketing site lives in **[lefolio/lefolio.md](https://github.com/lefolio/lefolio.md)** (`https://lefolio.md`).

## Structure

```text
lefolio/
├── scripts/             # lefolio CLI, sync, watch
├── src/                 # Next app + built-in templates (academic, portfolio, treasure)
├── package.json         # name: @lefolio/engine
└── PACKAGING.md         # npm publish notes
```

## Use with a site vault

```bash
# from a thin site with Content/ in cwd:
npm install @lefolio/engine   # or file:../lefolio while developing
npx lefolio dev
```

```json
{
  "dependencies": {
    "@lefolio/engine": "file:../lefolio"
  },
  "scripts": {
    "dev": "lefolio dev",
    "build": "lefolio build"
  }
}
```

Site-local templates: if `<cwd>/src/index.ts` exports `TemplateModule`(s), they are registered. Select with `Content/config.yaml` `template: <id>`.

Each template has a single look: colors and fonts live in its own CSS (there are no theme presets). Only the selected template is bundled; restart `lefolio dev` after changing `template:`. A dark template sets `colorScheme: 'dark'` on its `TemplateModule`.

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
