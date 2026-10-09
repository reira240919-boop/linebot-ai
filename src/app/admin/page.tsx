import type { Metadata } from "next";
import { connection } from "next/server";
import { formatJapanDateTime } from "@/lib/date";
import { listOwnerQuestions, type OwnerQuestion } from "@/lib/supabase";
import LoadError from "./load-error";

export const metadata: Metadata = {
  title: "管理画面",
};

// 管理画面を開いた直後。自動で答えられず、オーナーの返信が必要な質問を新しい順に出す
export default async function AdminHomePage() {
  // 開くたびに最新の内容を読む
  await connection();

  let questions: OwnerQuestion[] | null = null;
  try {
    questions = await listOwnerQuestions();
  } catch (err) {
    console.error("返信が必要な質問の読み込みでエラー:", err);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <h1 className="text-2xl font-bold">返信が必要な質問</h1>
      <p className="mt-2 text-base leading-relaxed">
        自動では答えられなかった、お客様からの質問です。LINE 公式アカウントのチャットから返信してください。
      </p>
      {questions === null ? (
        <LoadError what="質問" />
      ) : questions.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line p-6 text-center">
          <p className="text-lg font-bold">返信が必要な質問はありません</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {questions.map((q) => (
            <li key={q.id} className="rounded-xl border border-line p-4">
              <p className="text-sm">{formatJapanDateTime(q.createdAt)}</p>
              <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed">{q.question}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
