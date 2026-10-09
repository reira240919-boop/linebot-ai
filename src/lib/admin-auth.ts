import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// 管理画面の合言葉。合言葉そのものは .env.local の ADMIN_PASSWORD にだけ置く

export const ADMIN_COOKIE = "admin_session";

function getPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

export function isPasswordSet() {
  return getPassword() !== null;
}

// 合言葉から作る印。ブラウザにはこの印だけを渡し、合言葉は渡さない。合言葉を変えると古い印は使えなくなる
function tokenFor(password: string) {
  return createHmac("sha256", password).update("linebot-admin").digest("hex");
}

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// 入力された合言葉が合っていれば、ブラウザに渡す印を返す。違えば null
export function tokenIfPasswordMatches(input: string) {
  const password = getPassword();
  if (!password) return null;
  return sameText(tokenFor(input), tokenFor(password)) ? tokenFor(password) : null;
}

export function isValidAdminToken(token: string | undefined) {
  const password = getPassword();
  return Boolean(password && token && sameText(token, tokenFor(password)));
}

// 保存・削除などの処理の最初に呼ぶ。合言葉で入っていなければ、画面に出す文言を返す
export async function adminDeniedMessage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return isValidAdminToken(token) ? null : "合言葉の確認が切れました。画面を読み込み直して、もう一度合言葉を入れてください。";
}
