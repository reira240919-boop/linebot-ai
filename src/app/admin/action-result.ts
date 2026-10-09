// サーバーの処理（保存・削除など）が画面に返す結果。data があれば画面に反映する
export type ActionResult<T> = { ok: boolean; message: string; data?: T };
