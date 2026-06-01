import OpenAI from "openai";
import type { SourceItem } from "@prisma/client";
import type { GeneratedArticle } from "@/lib/automation/types";
import { slugify } from "@/lib/utils/slug";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing-key" });

export async function generateDailyArticle(items: SourceItem[]): Promise<GeneratedArticle> {
  if (items.length === 0) {
    throw new Error("Cannot generate an article without source items.");
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const title = `Today in AI: ${dateLabel} - New Tools, Product Updates, and Trends`;
  const sourceText = items
    .slice(0, 10)
    .map((item, index) => `${index + 1}. ${item.title}\nURL: ${item.url}\nSummary: ${item.summary ?? "No summary provided."}`)
    .join("\n\n");

  if (!process.env.OPENAI_API_KEY) {
    return fallbackArticle(title, sourceText);
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write concise, source-grounded B2B AI news briefs. Do not fabricate facts. Only use provided source material. Return valid JSON."
      },
      {
        role: "user",
        content: `Create one daily blog post with this exact title: "${title}".

Requirements:
- Include summary, 5-10 curated items, why each matters, business use cases, and affiliate-friendly CTA sections.
- Keep tone professional, concise, useful.
- If a fact is not in the sources, omit it.
- Return JSON with keys: title, seoTitle, metaDescription, slug, summary, content, tags.
- content must be Markdown.

Sources:
${sourceText}`
      }
    ]
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("OpenAI returned an empty article.");
  const parsed = JSON.parse(content) as GeneratedArticle;
  return {
    ...parsed,
    title: parsed.title || title,
    slug: slugify(parsed.slug || title),
    tags: parsed.tags?.length ? parsed.tags : ["ai-news", "ai-tools"]
  };
}

function fallbackArticle(title: string, sourceText: string): GeneratedArticle {
  const slug = slugify(title);
  return {
    title,
    seoTitle: title,
    metaDescription: "A source-backed daily roundup of AI tools, product updates, and business trends.",
    slug,
    summary: "A concise roundup generated from collected source items. Add an OpenAI API key for richer editorial generation.",
    content: `# ${title}

## Summary

This draft was created from collected source material. Review each source before publishing.

## Curated items

${sourceText
  .split("\n\n")
  .map((block) => `### ${block.split("\n")[0].replace(/^\d+\.\s*/, "")}\n\n${block.split("\n").slice(1).join("\n\n")}\n\n**Why it matters:** Review the source and add business context before publishing.\n\n**Business use case:** Identify whether this affects operations, product, marketing, or engineering workflows.`)
  .join("\n\n")}

## CTA

Compare your current AI workflow against these updates and test the tools that map to an active business problem.`,
    tags: ["ai-news", "ai-tools", "daily-brief"]
  };
}
