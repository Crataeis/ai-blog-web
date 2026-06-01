import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { NewsletterBlock } from "@/components/newsletter-block";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6
  });

  return (
    <main>
      <section className="border-b border-line bg-[#f4f0e8]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Daily AI intelligence</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            New tools, product updates, and AI trends without the noise.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            A concise, source-backed daily brief for operators, founders, and teams deciding what matters in AI.
          </p>
          <Link className="mt-8 inline-flex rounded-md bg-accent px-5 py-3 font-semibold text-white" href="/blog">
            Read latest posts
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Latest posts</h2>
          <Link href="/blog" className="text-sm font-semibold text-accent">
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.id} article={post} />
          ))}
          {posts.length === 0 ? <p className="text-neutral-700">No published posts yet. Generate a draft from the admin dashboard.</p> : null}
        </div>
      </section>
      <NewsletterBlock />
    </main>
  );
}
