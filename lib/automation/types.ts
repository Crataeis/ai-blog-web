export type FetchedItem = {
  sourceId: string;
  title: string;
  url: string;
  summary?: string;
  author?: string;
  publishedAt?: Date;
  raw?: unknown;
};

export type GeneratedArticle = {
  title: string;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
};
