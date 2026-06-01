import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { runNow } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [drafts, published, sources, runs] = await Promise.all([
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.source.count({ where: { isActive: true } }),
    prisma.automationRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 })
  ]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Drafts" value={drafts} />
        <Metric label="Published" value={published} />
        <Metric label="Active sources" value={sources} />
      </section>
      <section className="rounded-md border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Daily automation</h2>
            <p className="mt-1 text-sm text-neutral-700">Fetch sources, dedupe, generate a sourced draft, and insert affiliate links.</p>
          </div>
          <form action={runNow}>
            <button className="rounded-md bg-accent px-4 py-2 font-semibold text-white">Run now</button>
          </form>
        </div>
      </section>
      <section className="rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Recent runs</h2>
        <div className="mt-4 space-y-3 text-sm">
          {runs.map((run) => (
            <div key={run.id} className="flex justify-between border-b border-line pb-2">
              <span>{run.status}</span>
              <Link href="/admin/history" className="text-accent">
                {run.startedAt.toLocaleString()}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
