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
