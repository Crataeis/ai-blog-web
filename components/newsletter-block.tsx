import { subscribe } from "@/lib/actions/newsletter";

export function NewsletterBlock() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 rounded-md border border-line bg-ink p-6 text-paper md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Get the daily AI brief</h2>
          <p className="mt-2 text-sm text-neutral-300">One concise email with source-backed AI news and practical business context.</p>
        </div>
        <form action={subscribe} className="flex flex-col gap-2 sm:flex-row">
          <input name="email" type="email" required placeholder="you@example.com" className="min-w-72 rounded-md border border-neutral-600 bg-white px-3 py-2 text-ink" />
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-white">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
