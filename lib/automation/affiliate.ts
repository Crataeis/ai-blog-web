import type { AffiliateLink } from "@prisma/client";

export function insertAffiliateLinks(markdown: string, links: Pick<AffiliateLink, "productName" | "affiliateUrl" | "isSponsored">[]) {
  let output = markdown;
  for (const link of links.filter((item) => item.productName && item.affiliateUrl)) {
    const escaped = link.productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<!\\[)\\b(${escaped})\\b(?!\\]\\()`, "i");
    const label = link.isSponsored ? `${link.productName} (sponsored)` : link.productName;
    output = output.replace(pattern, `[${label}](${link.affiliateUrl})`);
  }
  return output;
}

export function appendDisclosure(markdown: string) {
  if (markdown.includes("Affiliate disclosure")) return markdown;
  return `${markdown.trim()}\n\n---\n\n**Affiliate disclosure:** Some links may be affiliate or sponsored links. We may earn a commission if you buy through them, at no extra cost to you.`;
}
