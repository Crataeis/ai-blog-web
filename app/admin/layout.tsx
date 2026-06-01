import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/posts">Drafts</Link>
          <Link href="/admin/affiliates">Affiliate links</Link>
          <Link href="/admin/sources">Sources</Link>
          <Link href="/admin/history">History</Link>
        </nav>
      </div>
      {children}
    </main>
  );
}
