import type { PluggableList } from 'unified';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/** Remark/rehype plugin lists used by MarkdownRenderer. */
export const remarkPlugins: PluggableList = [remarkGfm];
export const rehypePlugins: PluggableList = [rehypeRaw];
