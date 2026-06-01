import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchSourceItems } from "@/lib/automation/fetchers";
import { findDuplicate } from "@/lib/automation/dedupe";
import { appendDisclosure, insertAffiliateLinks } from "@/lib/automation/affiliate";
import { generateDailyArticle } from "@/lib/automation/generate";
import { contentHash, normalizeTitle } from "@/lib/utils/text";

export async function runDailyAutomation() {
  const run = await prisma.automationRun.create({ data: { status: "RUNNING", logs: [] } });
  const logs: string[] = [];
  let fetchedCount = 0;
  let dedupedCount = 0;

  try {
    const sources = await prisma.source.findMany({ where: { isActive: true } });
    const existing = await prisma.sourceItem.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { id: true, title: true, url: true, contentHash: true }
    });

    const createdIds: string[] = [];

    for (const source of sources) {
      try {
        const fetched = await fetchSourceItems(source);
        fetchedCount += fetched.length;
        for (const item of fetched) {
          const duplicate = findDuplicate(item, existing);
          if (duplicate) {
            dedupedCount += 1;
            continue;
          }
          const created = await prisma.sourceItem.upsert({
            where: { url: item.url },
            update: {},
            create: {
              sourceId: item.sourceId,
              title: item.title,
              url: item.url,
              summary: item.summary,
              author: item.author,
              publishedAt: item.publishedAt,
              raw: item.raw as object,
              normalizedTitle: normalizeTitle(item.title),
              contentHash: contentHash(item.title, item.url)
            }
          });
          existing.push({ id: created.id, title: created.title, url: created.url, contentHash: created.contentHash });
          createdIds.push(created.id);
        }
        logs.push(`Fetched ${fetched.length} items from ${source.name}.`);
      } catch (error) {
        logs.push(`Source failed: ${source.name} - ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }

    const usableItems = await prisma.sourceItem.findMany({
      where: { id: { in: createdIds }, status: "NEW" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 10
    });

    if (usableItems.length === 0) {
      throw new Error("No new source items available. Refusing to create an unsourced article.");
    }

    const generated = await generateDailyArticle(usableItems);
    const affiliateLinks = await prisma.affiliateLink.findMany({ where: { isActive: true } });
    const content = appendDisclosure(insertAffiliateLinks(generated.content, affiliateLinks));
    const shouldPublish = process.env.AUTO_PUBLISH === "true";

    const article = await prisma.article.create({
      data: {
        title: generated.title,
        seoTitle: generated.seoTitle,
        metaDescription: generated.metaDescription,
        slug: generated.slug,
        summary: generated.summary,
        content,
        tags: generated.tags,
        status: shouldPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
        publishedAt: shouldPublish ? new Date() : null,
        automationRunId: run.id,
        sourceItems: {
          create: usableItems.map((item) => ({ sourceItemId: item.id }))
        }
      }
    });

    await prisma.sourceItem.updateMany({ where: { id: { in: usableItems.map((item) => item.id) } }, data: { status: "USED" } });
    await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        fetchedCount,
        dedupedCount,
        usedItemCount: usableItems.length,
        articleId: article.id,
        logs
      }
    });

    return article;
  } catch (error) {
    await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        fetchedCount,
        dedupedCount,
        error: error instanceof Error ? error.message : "unknown error",
        logs
      }
    });
    throw error;
  }
}
