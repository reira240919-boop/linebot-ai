import type { Metadata } from "next";
import { connection } from "next/server";
import { formatJapanDateTime, isNoticeShown, todayInJapan } from "@/lib/date";
import { getLatestNotice, type Notice } from "@/lib/supabase";

// お客様が LINE のリッチメニューから開くページ
export const metadata: Metadata = {
  title: "お知らせ",
};

export default async function NoticePage() {
  // 開くたびに最新のお知らせを読む
  await connection();

  let notice: Notice | null | undefined;
  try {
    notice = await getLatestNotice();
  } catch (err) {
    console.error("お知らせページの読み込みでエラー:", err);
  }

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
        <h1 className="text-2xl font-bold">お知らせ</h1>
        {notice === undefined ? (
          <p className="mt-4 text-base leading-relaxed">
            お知らせを読み込めませんでした。少し時間をおいて、もう一度開いてください。
          </p>
        ) : notice && isNoticeShown(notice.endsOn, todayInJapan()) ? (
          <article className="mt-4 rounded-xl border border-line p-4">
            <p className="whitespace-pre-wrap text-base leading-relaxed">{notice.body}</p>
            <p className="mt-3 text-sm">{formatJapanDateTime(notice.updatedAt)} 更新</p>
          </article>
        ) : (
          <p className="mt-4 text-base leading-relaxed">いまはお知らせはありません。</p>
        )}
      </main>
    </div>
  );
}
