"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isPasswordSet, tokenIfPasswordMatches } from "@/lib/admin-auth";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isPasswordSet()) return { error: "パスワードが未設定です" };
  const token = tokenIfPasswordMatches(String(formData.get("password") ?? ""));
  if (!token) return { error: "パスワードが違います" };

  // 期限を付けない印にする。ブラウザを閉じるまで、入り直さなくてよい
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  redirect("/admin");
}
