import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { NewsletterBlock } from "@/components/newsletter-block";
import { isMissingDatabaseTable } from "@/lib/db-errors";

type Props = { params: { slug: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } }).catch((error) => {
    if (isMissingDatabaseTable(error)) return null;
    throw error;
  });
  if (!article || article.status !== "PUBLISHED") return {};
  return {
    title: article.seoTitle,
    description: article.metaDescription,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.seoTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      tags: article.tags
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article
    .findUnique({
      where: { slug: params.slug },
      include: { sourceItems: { include: { sourceItem: true } } }
    })
    .catch((error) => {
      if (isMissingDatabaseTable(error)) return null;
      throw error;
    });

  if (!article || article.status !== "PUBLISHED") notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: `${process.env.SITE_URL ?? "http://localhost:3000"}/blog/${article.slug}`,
    citation: article.sourceItems.map(({ sourceItem }) => sourceItem.url)
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">AI daily brief</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-neutral-700">{article.summary}</p>
        <div className="mt-8 border-y border-line py-4 text-sm text-neutral-700">
          This article includes affiliate disclosure and cites collected source material.
        </div>
        <div className="prose mt-8 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
        </div>
        <section className="mt-10 rounded-md border border-line bg-white p-5">
          <h2 className="font-bold">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {article.sourceItems.map(({ sourceItem }) => (
              <li key={sourceItem.id}>
                <a href={sourceItem.url} className="text-accent underline" rel="nofollow noreferrer" target="_blank">
                  {sourceItem.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <NewsletterBlock />
    </main>
  );
}
