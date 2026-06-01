import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { sourceItems: true }
  });

  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="text-xl font-bold">Generated articles</h2>
      <div className="mt-4 divide-y divide-line">
        {articles.map((article) => (
          <div key={article.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-semibold">{article.title}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {article.status} · {article.sourceItems.length} sources · {article.createdAt.toLocaleString()}
              </p>
            </div>
            <Link href={`/admin/posts/${article.id}`} className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
              Review
            </Link>
          </div>
        ))}
        {articles.length === 0 ? <p className="py-4 text-sm text-neutral-700">No articles yet. Run automation from the dashboard.</p> : null}
      </div>
    </section>
  );
}
