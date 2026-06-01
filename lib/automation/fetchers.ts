import Parser from "rss-parser";
import type { Source } from "@prisma/client";
import type { FetchedItem } from "@/lib/automation/types";

const parser = new Parser();

export async function fetchSourceItems(source: Source): Promise<FetchedItem[]> {
  if (source.type === "RSS" || source.type === "CUSTOM_URL" || source.type === "PRODUCT") {
    return fetchRssLike(source);
  }
  if (source.type === "HACKER_NEWS") {
    return fetchHackerNews(source);
  }
  if (source.type === "GITHUB") {
    return fetchGitHubTrending(source);
  }
  return [];
}

async function fetchRssLike(source: Source) {
  const feed = await parser.parseURL(source.url);
  return feed.items.slice(0, 25).map((item) => ({
    sourceId: source.id,
    title: item.title ?? "Untitled",
    url: item.link ?? item.guid ?? source.url,
    summary: item.contentSnippet ?? item.content ?? "",
    author: item.creator ?? item.author,
    publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
    raw: item
  }));
}

async function fetchHackerNews(source: Source) {
  const response = await fetch(source.url, { next: { revalidate: 0 } });
  if (!response.ok) throw new Error(`Hacker News fetch failed: ${response.status}`);
  const data = (await response.json()) as { hits?: Array<Record<string, unknown>> };
  return (data.hits ?? []).slice(0, 25).map((hit) => ({
    sourceId: source.id,
    title: String(hit.title ?? hit.story_title ?? "Untitled"),
    url: String(hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`),
    summary: String(hit.story_text ?? ""),
    author: hit.author ? String(hit.author) : undefined,
    publishedAt: hit.created_at ? new Date(String(hit.created_at)) : undefined,
    raw: hit
  }));
}

async function fetchGitHubTrending(source: Source) {
  const response = await fetch(source.url, {
    headers: { "User-Agent": "ai-daily-blog-mvp" },
    next: { revalidate: 0 }
  });
  if (!response.ok) throw new Error(`GitHub trending fetch failed: ${response.status}`);
  const html = await response.text();
  const articleMatches = [...html.matchAll(/<article[\s\S]*?<\/article>/g)].slice(0, 15);

  const items: FetchedItem[] = [];
  for (const match of articleMatches) {
      const block = match[0];
      const href = block.match(/<h2[\s\S]*?<a[^>]+href="([^"]+)"/)?.[1];
      const name = block
        .match(/<h2[\s\S]*?<a[\s\S]*?>([\s\S]*?)<\/a>/)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const description = block
        .match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!href || !name) continue;
      items.push({
        sourceId: source.id,
        title: name,
        url: `https://github.com${href}`,
        summary: description,
        publishedAt: new Date(),
        raw: { scrapedFrom: source.url }
      });
  }
  return items;
}
