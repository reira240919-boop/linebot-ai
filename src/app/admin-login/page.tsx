import type { Metadata } from "next";
import { connection } from "next/server";
import { isPasswordSet } from "@/lib/admin-auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "管理画面の入口",
};

// 管理画面の入口。合言葉を入れると管理画面が開く
export default async function AdminLoginPage() {
  // 合言葉が設定されているかは、開くたびに確かめる
  await connection();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-10">
      <h1 className="text-2xl font-bold">管理画面</h1>
      {isPasswordSet() ? (
        <>
          <p className="mt-2 text-base leading-relaxed">合言葉を入れて、「管理画面を開く」を押してください。</p>
          <LoginForm />
        </>
      ) : (
        <p role="alert" className="mt-6 rounded-lg border border-danger p-4 text-base leading-relaxed text-danger">
          合言葉が未設定です。管理画面は開けません。
        </p>
      )}
    </main>
  );
}
