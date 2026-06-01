import { NextRequest, NextResponse } from "next/server";
import { runDailyAutomation } from "@/lib/automation/run";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(`cron:${request.headers.get("x-forwarded-for") ?? "local"}`, 5, 60_000);
  if (limited) return limited;

  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const article = await runDailyAutomation();
    return NextResponse.json({ ok: true, articleId: article.id, slug: article.slug });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "unknown error" }, { status: 500 });
  }
}
