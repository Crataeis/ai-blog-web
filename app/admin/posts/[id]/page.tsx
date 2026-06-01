import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publishArticle, rejectArticle, saveArticle } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { sourceItems: { include: { sourceItem: true } } }
  });
  if (!article) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={saveArticle.bind(null, article.id)} className="space-y-4 rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Review draft</h2>
        <Field label="Title" name="title" defaultValue={article.title} />
        <Field label="SEO title" name="seoTitle" defaultValue={article.seoTitle} />
        <label className="block text-sm font-semibold">
          Meta description
          <textarea name="metaDescription" defaultValue={article.metaDescription} className="mt-1 min-h-20 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <Field label="Slug" name="slug" defaultValue={article.slug} />
        <label className="block text-sm font-semibold">
          Summary
          <textarea name="summary" defaultValue={article.summary} className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Content
          <textarea name="content" defaultValue={article.content} className="mt-1 min-h-[520px] w-full rounded-md border border-line px-3 py-2 font-mono text-sm" />
        </label>
        <Field label="Tags comma separated" name="tags" defaultValue={article.tags.join(", ")} />
        <button className="rounded-md bg-ink px-4 py-2 font-semibold text-paper">Save changes</button>
      </form>
      <aside className="space-y-5">
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-bold">Status</h3>
          <p className="mt-2 text-sm text-neutral-700">{article.status}</p>
          <div className="mt-4 flex gap-2">
            <form action={publishArticle.bind(null, article.id)}>
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white">Publish</button>
            </form>
            <form action={rejectArticle.bind(null, article.id)}>
              <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">Reject</button>
            </form>
          </div>
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-bold">Sources</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {article.sourceItems.map(({ sourceItem }) => (
              <li key={sourceItem.id}>
                <a href={sourceItem.url} target="_blank" rel="noreferrer" className="text-accent underline">
                  {sourceItem.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
    </label>
  );
}
