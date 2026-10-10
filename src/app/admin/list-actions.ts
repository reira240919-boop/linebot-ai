import type { ActionResult } from "./action-result";

// 「FAQ設定」「メニューと料金」の保存・削除で共通の流れ

export const SAVE_FAILED = "保存できませんでした。通信の状態を確かめて、もう一度お試しください。";
export const DELETE_FAILED = "削除できませんでした。通信の状態を確かめて、もう一度お試しください。";

// 2 つの欄の空欄チェック。空なら、その欄の名前を入れた文言を返す
export function checkFilled(values: [string, string], labels: [string, string]) {
  const index = values.findIndex((v) => !v);
  return index === -1 ? null : `${labels[index]}を入力してください。`;
}

// 書き込みを実行して、成功したら最新の一覧を返す。
// work が false を返したときは、相手がもう消えている（goneMessage を出す）
export async function writeAndList<T>(
  work: () => Promise<boolean | void>,
  list: () => Promise<T[]>,
  messages: { success: string; failure: string; gone?: string; log: string },
): Promise<ActionResult<T[]>> {
  try {
    if ((await work()) === false) {
      return { ok: false, message: messages.gone ?? messages.failure, data: await list() };
    }
    return { ok: true, message: messages.success, data: await list() };
  } catch (err) {
    console.error(`${messages.log}でエラー:`, err);
    return { ok: false, message: messages.failure };
  }
}
