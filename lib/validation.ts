import { z } from "zod";

export const sourceSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["RSS", "PRODUCT", "GITHUB", "HACKER_NEWS", "CUSTOM_URL"]),
  url: z.string().url(),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const affiliateSchema = z.object({
  productName: z.string().min(2).max(120),
  destinationUrl: z.string().url(),
  affiliateUrl: z.string().url(),
  category: z.string().min(2).max(80),
  notes: z.string().max(800).optional().or(z.literal("")),
  isSponsored: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional()
});

export const articleEditSchema = z.object({
  title: z.string().min(5).max(160),
  seoTitle: z.string().min(5).max(160),
  metaDescription: z.string().min(20).max(220),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  summary: z.string().min(20),
  content: z.string().min(100),
  tags: z.string().transform((value) =>
    value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )
});

export const emailSchema = z.object({
  email: z.string().email()
});
