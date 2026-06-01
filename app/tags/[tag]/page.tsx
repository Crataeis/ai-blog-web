import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { isMissingDatabaseTable } from "@/lib/db-errors";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const posts = await prisma.article
    .findMany({
      where: { status: "PUBLISHED", tags: { has: tag } },
      orderBy: { publishedAt: "desc" }
    })
    .catch((error) => {
      if (isMissingDatabaseTable(error)) return [];
      throw error;
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Tag: {tag}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <ArticleCard key={post.id} article={post} />
        ))}
      </div>
    </main>
  );
}
