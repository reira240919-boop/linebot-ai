import type { Metadata } from "next";
import { connection } from "next/server";
import { listFaqs, type FaqRow } from "@/lib/supabase";
import FaqEditor from "./faq-editor";
import LoadError from "../load-error";

export const metadata: Metadata = {
  title: "質問と答えの編集",
};

export default async function FaqsPage() {
  // 開くたびに Supabase の最新の内容を読む
  await connection();

  let faqs: FaqRow[] | null = null;
  try {
    faqs = await listFaqs();
  } catch (err) {
    console.error("よくある質問の読み込みでエラー:", err);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <h1 className="text-2xl font-bold">質問と答え</h1>
      <p className="mt-2 text-base leading-relaxed">
        お客様によく聞かれる質問と、その答えを登録します。ここに書いた内容をもとに、LINE で自動の返事をします。
      </p>
      {faqs ? (
        <FaqEditor initialFaqs={faqs} />
      ) : (
        <LoadError what="質問" />
      )}
    </main>
  );
}
