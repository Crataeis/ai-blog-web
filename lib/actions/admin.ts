"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { runDailyAutomation } from "@/lib/automation/run";
import { affiliateSchema, articleEditSchema, sourceSchema } from "@/lib/validation";

export async function runNow() {
  await runDailyAutomation();
  revalidatePath("/admin");
  redirect("/admin/posts");
}

export async function saveArticle(id: string, formData: FormData) {
  const parsed = articleEditSchema.parse(Object.fromEntries(formData));
  await prisma.article.update({ where: { id }, data: parsed });
  revalidatePath("/admin/posts");
}

export async function publishArticle(id: string) {
  const article = await prisma.article.findUnique({ where: { id }, include: { sourceItems: true } });
  if (!article || article.sourceItems.length === 0) throw new Error("Cannot publish an article without sources.");
  await prisma.article.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  revalidatePath("/blog");
  redirect(`/blog/${article.slug}`);
}

export async function rejectArticle(id: string) {
  await prisma.article.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/posts");
}

export async function createSource(formData: FormData) {
  const parsed = sourceSchema.parse(Object.fromEntries(formData));
  await prisma.source.create({ data: parsed });
  revalidatePath("/admin/sources");
}

export async function toggleSource(id: string, isActive: boolean) {
  await prisma.source.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/sources");
}

export async function createAffiliate(formData: FormData) {
  const parsed = affiliateSchema.parse(Object.fromEntries(formData));
  await prisma.affiliateLink.create({ data: parsed });
  revalidatePath("/admin/affiliates");
}

export async function toggleAffiliate(id: string, isActive: boolean) {
  await prisma.affiliateLink.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/affiliates");
}
