import type { Metadata } from "next";
import { connection } from "next/server";
import { todayInJapan } from "@/lib/date";
import { getLatestNotice, type Notice } from "@/lib/supabase";
import NoticeEditor from "./notice-editor";
import LoadError from "../load-error";

export const metadata: Metadata = {
  title: "お知らせの編集",
};

export default async function NoticeAdminPage() {
  // 開くたびに Supabase の最新の内容を読む
  await connection();

  let notice: Notice | null | undefined;
  try {
    notice = await getLatestNotice();
  } catch (err) {
    console.error("お知らせの読み込みでエラー:", err);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <h1 className="text-2xl font-bold">お知らせ</h1>
      <p className="mt-2 text-base leading-relaxed">
        臨時休業などのお知らせを書きます。載せた文章は、LINE のトーク画面の下にあるメニューから開く「お知らせページ」に出ます。LINE のメッセージは送らないので、料金はかかりません。
      </p>
      {notice !== undefined ? (
        <NoticeEditor initialNotice={notice} today={todayInJapan()} />
      ) : (
        <LoadError what="お知らせ" />
      )}
    </main>
  );
}
