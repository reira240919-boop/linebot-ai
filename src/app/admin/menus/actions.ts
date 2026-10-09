"use server";

import { adminDeniedMessage } from "@/lib/admin-auth";
import { createMenu, deleteMenu, listMenus, updateMenu, type MenuRow } from "@/lib/supabase";
import type { ActionResult } from "../action-result";
import { checkFilled, DELETE_FAILED, SAVE_FAILED, writeAndList } from "../list-actions";

const LABELS: [string, string] = ["メニュー名", "料金"];
const GONE = "このメニューは、すでに削除されています。画面を読み込み直してください。";

export async function addMenuAction(name: string, price: string): Promise<ActionResult<MenuRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  const values: [string, string] = [name.trim(), price.trim()];
  const invalid = checkFilled(values, LABELS);
  if (invalid) return { ok: false, message: invalid };
  return writeAndList(() => createMenu(...values), listMenus, { success: "保存しました", failure: SAVE_FAILED, log: "メニューの追加" });
}

export async function saveMenuAction(id: number, name: string, price: string): Promise<ActionResult<MenuRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  const values: [string, string] = [name.trim(), price.trim()];
  const invalid = checkFilled(values, LABELS);
  if (invalid) return { ok: false, message: invalid };
  return writeAndList(() => updateMenu(id, ...values), listMenus, { success: "保存しました", failure: SAVE_FAILED, gone: GONE, log: "メニューの保存" });
}

export async function removeMenuAction(id: number): Promise<ActionResult<MenuRow[]>> {
  const denied = await adminDeniedMessage();
  if (denied) return { ok: false, message: denied };
  return writeAndList(() => deleteMenu(id), listMenus, { success: "削除しました", failure: DELETE_FAILED, log: "メニューの削除" });
}
