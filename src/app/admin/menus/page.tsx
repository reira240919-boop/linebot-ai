import type { Metadata } from "next";
import { connection } from "next/server";
import { listMenus, type MenuRow } from "@/lib/supabase";
import MenuEditor from "./menu-editor";
import LoadError from "../load-error";

export const metadata: Metadata = {
  title: "メニューと料金の編集",
};

export default async function MenusPage() {
  // 開くたびに Supabase の最新の内容を読む
  await connection();

  let menus: MenuRow[] | null = null;
  try {
    menus = await listMenus();
  } catch (err) {
    console.error("メニューの読み込みでエラー:", err);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <h1 className="text-2xl font-bold">メニューと料金</h1>
      <p className="mt-2 text-base leading-relaxed">
        メニュー名と料金を登録します。お客様に料金を聞かれたとき、ここに書いた内容をもとに LINE で自動の返事をします。
      </p>
      {menus ? (
        <MenuEditor initialMenus={menus} />
      ) : (
        <LoadError what="メニュー" />
      )}
    </main>
  );
}
