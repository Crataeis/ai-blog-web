import bcrypt from "bcryptjs";
import { PrismaClient, SourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 12) },
    create: {
      email,
      name: "Admin",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  const sources = [
    ["OpenAI News", SourceType.RSS, "https://openai.com/news/rss.xml"],
    ["Google AI Blog", SourceType.RSS, "https://blog.google/technology/ai/rss/"],
    ["Hacker News AI Search", SourceType.HACKER_NEWS, "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story"],
    ["GitHub AI Trending", SourceType.GITHUB, "https://github.com/trending?since=daily"]
  ] as const;

  for (const [name, type, url] of sources) {
    await prisma.source.upsert({
      where: { type_url: { type, url } },
      update: { name, isActive: true },
      create: { name, type, url }
    });
  }

  const affiliates = [
    {
      productName: "ChatGPT",
      destinationUrl: "https://chat.openai.com/",
      affiliateUrl: "https://chat.openai.com/",
      category: "AI Assistant",
      notes: "Replace with approved partner URL if available."
    },
    {
      productName: "Notion AI",
      destinationUrl: "https://www.notion.so/product/ai",
      affiliateUrl: "https://www.notion.so/product/ai",
      category: "Productivity",
      notes: "Sample affiliate entry."
    }
  ];

  for (const link of affiliates) {
    const existing = await prisma.affiliateLink.findFirst({ where: { productName: link.productName } });
    if (existing) {
      await prisma.affiliateLink.update({ where: { id: existing.id }, data: link });
    } else {
      await prisma.affiliateLink.create({ data: link });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
