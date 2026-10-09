"use server";

import { adminDeniedMessage } from "@/lib/admin-auth";
import { createFaq, deleteFaq, listFaqs, updateFaq, type FaqRow } from "@/lib/supabase";
import type { ActionResult } from "../action-result";
import { checkFilled, DELETE_FAILED, SAVE_FAILED, writeAndList } from "../list-actions";

const LABELS: [string, string] = ["質問", "答え"];
const GONE = "この質問は、すでに削除されています。画面を読み込み直してください。";

export async function addFaqAction(question: string, answer: string): Promise<ActionResult<FaqRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  const values: [string, string] = [question.trim(), answer.trim()];
  const invalid = checkFilled(values, LABELS);
  if (invalid) return { ok: false, message: invalid };
  return writeAndList(() => createFaq(...values), listFaqs, { success: "保存しました", failure: SAVE_FAILED, log: "よくある質問の追加" });
}

export async function saveFaqAction(id: number, question: string, answer: string): Promise<ActionResult<FaqRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  const values: [string, string] = [question.trim(), answer.trim()];
  const invalid = checkFilled(values, LABELS);
  if (invalid) return { ok: false, message: invalid };
  return writeAndList(() => updateFaq(id, ...values), listFaqs, { success: "保存しました", failure: SAVE_FAILED, gone: GONE, log: "よくある質問の保存" });
}

export async function removeFaqAction(id: number): Promise<ActionResult<FaqRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  return writeAndList(() => deleteFaq(id), listFaqs, { success: "削除しました", failure: DELETE_FAILED, log: "よくある質問の削除" });
}
