import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  const runs = await prisma.automationRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 100
  });

  return (
    <section className="rounded-md border border-line bg-white p-5">
      <h2 className="text-xl font-bold">Publishing history</h2>
      <div className="mt-4 divide-y divide-line">
        {runs.map((run) => (
          <div key={run.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold">{run.status}</p>
              <p className="text-sm text-neutral-600">
                Fetched {run.fetchedCount}, deduped {run.dedupedCount}, used {run.usedItemCount} · {run.startedAt.toLocaleString()}
              </p>
              {run.error ? <p className="mt-2 text-sm text-red-700">{run.error}</p> : null}
            </div>
            {run.articleId ? (
              <Link href={`/admin/posts/${run.articleId}`} className="text-sm font-semibold text-accent">
                View article
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
