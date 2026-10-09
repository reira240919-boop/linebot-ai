"use server";

import { adminDeniedMessage } from "@/lib/admin-auth";
import { todayInJapan } from "@/lib/date";
import { createNotice, type Notice } from "@/lib/supabase";
import type { ActionResult } from "../action-result";

export async function publishNoticeAction(body: string, endsOn: string): Promise<ActionResult<Notice>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  const text = body.trim();
  if (!text) return { ok: false, message: "お知らせの文章を入力してください。" };
  if (endsOn && !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)) {
    return { ok: false, message: "終わりの日を、カレンダーから選び直してください。" };
  }
  if (endsOn && endsOn < todayInJapan()) {
    return { ok: false, message: "終わりの日が、もう過ぎています。今日か、今日より後の日を選んでください。" };
  }
  try {
    const notice = await createNotice(text, endsOn || null);
    return { ok: true, message: "お知らせページに載せました", data: notice };
  } catch (err) {
    console.error("お知らせの保存でエラー:", err);
    return { ok: false, message: "載せられませんでした。通信の状態を確かめて、もう一度お試しください。" };
  }
}
