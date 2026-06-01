import Link from "next/link";
import { format } from "date-fns";
import type { Article } from "@prisma/client";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="rounded-md border border-line bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        {article.publishedAt ? format(article.publishedAt, "MMM d, yyyy") : "Draft"}
      </p>
      <h3 className="mt-3 text-xl font-bold leading-snug">
        <Link href={`/blog/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">{article.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {article.tags.slice(0, 3).map((tag) => (
          <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="rounded-full bg-[#edf7f4] px-2.5 py-1 text-xs text-accent">
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
