import type { SourceItem } from "@prisma/client";
import type { FetchedItem } from "@/lib/automation/types";
import { contentHash, normalizeTitle, tokenSimilarity } from "@/lib/utils/text";

export function findDuplicate(item: FetchedItem, existing: Pick<SourceItem, "id" | "title" | "url" | "contentHash">[]) {
  const hash = contentHash(item.title, item.url);
  return existing.find((candidate) => {
    if (candidate.url.toLowerCase() === item.url.toLowerCase()) return true;
    if (candidate.contentHash === hash) return true;
    if (normalizeTitle(candidate.title) === normalizeTitle(item.title)) return true;
    return tokenSimilarity(candidate.title, item.title) >= 0.82;
  });
}
