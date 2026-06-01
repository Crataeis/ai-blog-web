"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validation";

export async function subscribe(formData: FormData) {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return;
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email, source: "site" }
  });
  revalidatePath("/");
}
