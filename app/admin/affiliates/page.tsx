import { prisma } from "@/lib/prisma";
import { createAffiliate, toggleAffiliate } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  const links = await prisma.affiliateLink.findMany({ orderBy: { productName: "asc" } });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form action={createAffiliate} className="space-y-3 rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Add affiliate link</h2>
        <Input name="productName" placeholder="Product name" />
        <Input name="destinationUrl" placeholder="Destination URL" />
        <Input name="affiliateUrl" placeholder="Affiliate URL" />
        <Input name="category" placeholder="Category" />
        <textarea name="notes" placeholder="Notes" className="min-h-24 w-full rounded-md border border-line px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input name="isSponsored" type="checkbox" value="true" />
          Sponsored placement
        </label>
        <button className="rounded-md bg-ink px-4 py-2 font-semibold text-paper">Add link</button>
      </form>
      <section className="rounded-md border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Links</h2>
        <div className="mt-4 divide-y divide-line">
          {links.map((link) => (
            <div key={link.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{link.productName}</p>
                <p className="text-sm text-neutral-600">
                  {link.category} · {link.isActive ? "Active" : "Inactive"} {link.isSponsored ? "· Sponsored" : ""}
                </p>
              </div>
              <form action={toggleAffiliate.bind(null, link.id, !link.isActive)}>
                <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">{link.isActive ? "Disable" : "Enable"}</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Input(props: { name: string; placeholder: string }) {
  return <input {...props} className="w-full rounded-md border border-line px-3 py-2" required />;
}
