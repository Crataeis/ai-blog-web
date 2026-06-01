import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { emailSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(`newsletter:${request.headers.get("x-forwarded-for") ?? "local"}`, 10, 60_000);
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email, source: "api" }
  });
  return NextResponse.json({ ok: true });
}
