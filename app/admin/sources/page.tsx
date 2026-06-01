import { prisma } from "@/lib/prisma";
import { createSource, toggleSource } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await prisma.source.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form action={createSource} className="space-y-3 rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Add source</h2>
        <input name="name" placeholder="Name" required className="w-full rounded-md border border-line px-3 py-2" />
        <select name="type" className="w-full rounded-md border border-line px-3 py-2" defaultValue="RSS">
          <option value="RSS">RSS</option>
          <option value="PRODUCT">Product source</option>
          <option value="GITHUB">GitHub trending</option>
          <option value="HACKER_NEWS">Hacker News</option>
          <option value="CUSTOM_URL">Custom URL</option>
        </select>
        <input name="url" placeholder="URL" required className="w-full rounded-md border border-line px-3 py-2" />
        <textarea name="notes" placeholder="Notes" className="min-h-24 w-full rounded-md border border-line px-3 py-2" />
        <button className="rounded-md bg-ink px-4 py-2 font-semibold text-paper">Add source</button>
      </form>
      <section className="rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Sources</h2>
        <div className="mt-4 divide-y divide-line">
          {sources.map((source) => (
            <div key={source.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{source.name}</p>
                <p className="break-all text-sm text-neutral-600">
                  {source.type} · {source.isActive ? "Active" : "Inactive"} · {source.url}
                </p>
              </div>
              <form action={toggleSource.bind(null, source.id, !source.isActive)}>
                <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">{source.isActive ? "Disable" : "Enable"}</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
