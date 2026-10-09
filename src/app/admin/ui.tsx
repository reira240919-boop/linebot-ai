"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "./action-result";

// 管理画面の 3 つの画面で共通の見た目と、保存・削除の動き

export const primaryButton =
  "min-h-11 rounded-lg bg-accent px-5 text-base font-bold text-ink disabled:opacity-50";
export const plainButton =
  "min-h-11 rounded-lg border border-line bg-white px-5 text-base text-ink disabled:opacity-50";
export const dangerButton =
  "min-h-11 rounded-lg border border-danger bg-white px-5 text-base text-danger disabled:opacity-50";
export const inputBox =
  "mt-1 min-h-11 w-full rounded-lg border border-line bg-white p-3 text-base leading-relaxed text-ink focus:border-focus focus:outline-none";

type Notice = { ok: boolean; message: string };

// 保存・削除を実行し、処理中の表示と結果の文言を管理する
export function useAdminAction<T>(onResult: (result: ActionResult<T>) => void) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult<T>>) {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await action();
        onResult(result);
        setNotice({ ok: result.ok, message: result.message });
      } catch {
        setNotice({ ok: false, message: "通信できませんでした。電波の良い場所で、もう一度お試しください。" });
      }
    });
  }

  return { pending, notice, clearNotice: () => setNotice(null), run };
}

// 処理中・成功・失敗を、画面の上に出す
export function StatusBanner({ pending, notice }: { pending: boolean; notice: Notice | null }) {
  return (
    <div aria-live="polite">
      {pending && <p className="rounded-lg bg-line/50 p-4 text-base">処理しています。少しお待ちください…</p>}
      {!pending && notice && (
        <p
          role={notice.ok ? "status" : "alert"}
          className={
            notice.ok
              ? "rounded-lg bg-line/50 p-4 text-base font-bold"
              : "rounded-lg border border-danger p-4 text-base text-danger"
          }
        >
          {notice.message}
        </p>
      )}
    </div>
  );
}
