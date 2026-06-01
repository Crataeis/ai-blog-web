import { describe, expect, it } from "vitest";
import { insertAffiliateLinks } from "@/lib/automation/affiliate";
import { findDuplicate } from "@/lib/automation/dedupe";
import { tokenSimilarity } from "@/lib/utils/text";

describe("text similarity", () => {
  it("scores near-duplicate titles highly", () => {
    expect(tokenSimilarity("OpenAI launches new reasoning model", "OpenAI launches a reasoning model")).toBeGreaterThan(0.6);
  });
});

describe("dedupe", () => {
  it("matches semantic title duplicates", () => {
    const duplicate = findDuplicate(
      { sourceId: "s1", title: "GitHub releases AI coding agent", url: "https://example.com/a" },
      [{ id: "old", title: "GitHub releases an AI coding agent", url: "https://example.com/b", contentHash: "x" }]
    );
    expect(duplicate?.id).toBe("old");
  });
});

describe("affiliate insertion", () => {
  it("links the first product mention", () => {
    const output = insertAffiliateLinks("Try Notion AI for team notes. Notion AI is useful.", [
      { productName: "Notion AI", affiliateUrl: "https://example.com/notion", isSponsored: false }
    ]);
    expect(output).toContain("[Notion AI](https://example.com/notion)");
    expect(output.match(/https:\/\/example.com\/notion/g)).toHaveLength(1);
  });
});
