import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AI Daily Brief",
    template: "%s | AI Daily Brief"
  },
  description: "Daily AI news, tools, product updates, and business use cases.",
  openGraph: {
    siteName: "AI Daily Brief",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-line bg-paper/95">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              AI Daily Brief
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/blog">Blog</Link>
              <Link href="/tags/ai-tools">Tags</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/admin" className="rounded-md bg-ink px-3 py-2 text-paper">
                Admin
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-16 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-neutral-700 md:grid-cols-4">
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/contact">Contact</Link>
            <span>© {new Date().getFullYear()} AI Daily Brief</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
