import {
  extractFirstImage,
  firstHeading,
  MarkdownBody,
  stripHeading,
  stripImages,
  type MarkdownBlockProps,
} from '@lefolio/engine/markdown';

export default function Split({ content }: MarkdownBlockProps) {
  const title = firstHeading(content, 2) ?? firstHeading(content);
  const withoutTitle = stripHeading(content, title);
  const image = extractFirstImage(withoutTitle);
  const body = stripImages(withoutTitle);

  return (
    <section className="split">
      <div className="split__copy">
        {title ? <h2 className="split__title">{title}</h2> : null}
        {body ? (
          <div className="split__body">
            <MarkdownBody content={body} />
          </div>
        ) : null}
      </div>
      <div className="split__media" aria-hidden={!image}>
        {image ? <img src={image.src} alt={image.alt || ''} /> : (
          <span className="split__placeholder">Image</span>
        )}
      </div>
    </section>
  );
}
