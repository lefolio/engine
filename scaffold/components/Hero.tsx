import {
  extractLinks,
  firstHeading,
  MarkdownBody,
  stripHeading,
  type MarkdownBlockProps,
} from '@lefolio/engine/markdown';

export default function Hero({ content }: MarkdownBlockProps) {
  const title = firstHeading(content, 1);
  const body = stripHeading(content, title);
  const actions = extractLinks(body);
  const prose = actions.reduce(
    (text, link) => text.replace(`[${link.text}](${link.href})`, '').trim(),
    body
  );

  return (
    <section className="hero">
      {title ? <h1 className="hero__title">{title}</h1> : null}
      {prose ? (
        <div className="hero__body">
          <MarkdownBody content={prose} />
        </div>
      ) : null}
      {actions.length > 0 ? (
        <div className="hero__actions">
          {actions.map((action) => (
            <a key={`${action.href}-${action.text}`} className="button" href={action.href}>
              {action.text}
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
