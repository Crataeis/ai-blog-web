import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  if (!process.env.DATABASE_URL) {
    return [
      { url: siteUrl, lastModified: new Date() },
      { url: `${siteUrl}/blog`, lastModified: new Date() }
    ];
  }
  const articles = await prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: article.updatedAt
    }))
  ];
}
