import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";

export const metadata = {
  title: "Blog",
  description: "Latest AI news, tools, product updates, and business trends."
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Blog</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <ArticleCard key={post.id} article={post} />
        ))}
      </div>
    </main>
  );
}
