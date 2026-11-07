# LeFolio engine

The engine compiles an Obsidian vault. The site is an ordinary Next.js app and owns `app/` and its components. There is no template system and no `template:` key.

`README.md` and the code are the source of truth. This page is only the part that is easy to get wrong. Site-specific behavior (languages, analytics, class names) belongs in that site.

## Commands

Run these from the site directory. The site installs Next, React, and Tailwind.

| Command | What it does |
| --- | --- |
| `lefolio init [dir]` | Copies `scaffold/` once. Refuses a directory that already has files. Does not update an existing app. |
| `lefolio sync` | Compiles `Content/` into `.content/manifest.json`, `.content/engine.json`, `.content/content-version.ts`, and `public/content-assets`. |
| `lefolio dev` | Syncs, watches `Content/`, runs `next dev` in the site. |
| `lefolio build` | Syncs, runs `next build` in the site, then writes each page's `<html lang>` from `routeLangs`. |

`--content` and `--vault` override the content directory and the Obsidian vault root. The same values can be set with `LEFOLIO_CONTENT` and `LEFOLIO_VAULT`. Vault precedence is `--vault`, then `LEFOLIO_VAULT`, then `vault:` in `config.yaml`, then the nearest parent that contains `.obsidian/`, then the content directory itself.

Do not commit `.content/`, `out/`, `.next/`, or `public/content-assets/`.

## URL model

`scaffold/` shows the three routes. A permalink may contain slashes, so the nested route is `[section]/[...slug]`.

- The note named by `home` is `/`.
- A markdown file in the content root is a standalone page at `/{slug}/`.
- A folder is a section. `Section/Section.md` is the index at `/{section}/`. Other notes in that folder are `/{section}/{slug}/`.
- `permalink` in frontmatter replaces the slug and keeps its slashes. `permalink: articles/my-post` inside `En/` is `/en/articles/my-post/`.
- `published: false` keeps a note in the vault and leaves it off the site.

`config.yaml` `routes` are language pairs, not the filesystem routes. Each entry maps a language code to a pathname. `metadataForHref` uses an exact match for hreflang and canonical. A pair with `fr` also sets `x-default`.

`site.basePath` is written to `.content/engine.json`. The site's `next.config.ts` must read it and set both `basePath` and `assetPrefix`. An empty string means the site is served at the domain root.

## Imports

| Import | Use |
| --- | --- |
| `@lefolio/engine/content` | `loadManifest`, `getPage`, `pageParams`, `getSectionRoutes`, content types |
| `@lefolio/engine/seo` | `metadataForHref(manifest, href)` |
| `@lefolio/engine/markdown` | `MarkdownBody`, `MarkdownComponentsProvider`, the `:::` parse helpers |
| `@lefolio/engine/globals.css` | Tailwind entry. Site CSS references it; it does not replace the site's own stylesheet. |

`loadManifest` reads the filesystem. Server components may call it. A client component may import the content types, and may import `slugify` from `@lefolio/engine/markdown`, but must not import the manifest loader.

`:::` fences are rewritten by the library. The site passes its component map to `MarkdownComponentsProvider`. An unknown id is rendered as prose. Do not parse those fences again in the page.

## Assets

Wikilinks and embeds are resolved at sync time, in this order: a path from the vault root, a path relative to the note, a path relative to the content directory, then a unique filename anywhere in the vault. Files are copied to `public/content-assets/`. An unresolved embed is left as `*[Missing embed: ...]*`.

`![[photo.webp|A description]]` uses the alias as alt text. A bare embed uses the filename. Width, `left`, `right`, `center`, and `wrap` are the other embed parameters.

The watcher watches only the content directory. An asset that lives elsewhere in the vault is picked up on the next sync.

## Do not

- Add `src/templates`, `TemplateModule`, or a `template:` key. Page components live in the site.
- Run Next from this package. `lefolio dev` and `lefolio build` run it in the site.
- Treat `config.routes` as the list of pages. The filesystem and `permalink` decide the URLs. `routes` only pairs translations.
- Change a site's class names or `data-template` hook while moving code. Existing CSS is often scoped to that attribute.
