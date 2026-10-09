import { createHmac, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { answerQuestion } from "@/lib/claude";
import { getKnowledge, saveConversation } from "@/lib/supabase";

// LINE から届くイベントのうち、今回使う部分だけの型
type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
};

// 自動で答えられないときの返事。オーナーに通知し、オーナーがチャットで手動返信する
const ESCALATION_REPLY =
  "お問い合わせありがとうございます。\nスタッフが内容を確認して、こちらのトークでご返信します。少々お待ちください。";

// LINE からのアクセスかを、署名で確かめる
function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  const received = Buffer.from(signature, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function callLine(path: string, payload: unknown, accessToken: string) {
  const res = await fetch(`https://api.line.me/v2/bot/message/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`LINE ${path} failed:`, res.status, await res.text());
  }
}

// お客様の LINE の表示名（オーナーがチャットで相手を探しやすくするため）
async function getDisplayName(userId: string | undefined, accessToken: string) {
  if (!userId) return null;
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const profile = (await res.json()) as { displayName?: string };
  return profile.displayName ?? null;
}

// 答えられなかった質問を、オーナーの LINE に 1 通だけ知らせる（無料枠の月 200 通に数える）
async function notifyOwner(question: string, customerId: string | undefined, accessToken: string) {
  const ownerId = process.env.OWNER_LINE_USER_ID;
  if (!ownerId) {
    console.error("OWNER_LINE_USER_ID が未設定のため、オーナーに通知できません:", question);
    return;
  }
  const name = await getDisplayName(customerId, accessToken);
  const text = `【要返信】自動で答えられない質問が届きました\n\nお客様: ${name ?? "（名前を取得できませんでした）"}\n質問: ${question}\n\nLINE公式アカウントのチャットから返信してください。`;
  await callLine("push", { to: ownerId, messages: [{ type: "text", text }] }, accessToken);
}

// 登録内容をもとに返事を決める。失敗したときもお客様を待たせず、手動対応に回す
async function buildReply(question: string): Promise<{ text: string; needsOwner: boolean }> {
  try {
    const { faqs, menus } = await getKnowledge();
    const answer = await answerQuestion(question, faqs, menus);
    // 高・中はそのまま返事する。低（または返信文が空）はオーナーの手動対応に回す
    if (answer.confidence !== "low" && answer.reply.trim()) return { text: answer.reply, needsOwner: false };
  } catch (err) {
    console.error("自動応答でエラー（オーナーの手動対応に回す）:", err);
  }
  return { text: ESCALATION_REPLY, needsOwner: true };
}

// 会話ログに残す。失敗しても、お客様への返事とオーナーへの通知は止めない
async function logConversation(userId: string | undefined, question: string, reply: string, needsOwner: boolean) {
  if (!userId) return;
  try {
    await saveConversation(userId, question, reply, needsOwner);
  } catch (err) {
    console.error("会話ログの保存でエラー:", err);
  }
}

async function handleTextMessage(event: LineEvent, accessToken: string) {
  const question = event.message!.text ?? "";
  const { text, needsOwner } = await buildReply(question);
  await callLine("reply", { replyToken: event.replyToken, messages: [{ type: "text", text }] }, accessToken);
  // 会話ログとオーナーへの通知は、LINE に受け取りを返したあとで行う（お客様への返事を待たせない）
  after(() =>
    Promise.all([
      logConversation(event.source?.userId, question, text, needsOwner),
      needsOwner ? notifyOwner(question, event.source?.userId, accessToken) : null,
    ]),
  );
}

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !accessToken) {
    console.error("LINE_CHANNEL_SECRET または LINE_CHANNEL_ACCESS_TOKEN が未設定です");
    return new Response("Server misconfigured", { status: 500 });
  }

  const body = await request.text();
  if (!isValidSignature(body, request.headers.get("x-line-signature"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const { events = [] } = JSON.parse(body) as { events?: LineEvent[] };

  // 文字のメッセージだけ自動応答する（画像やスタンプはチャットで手動対応）
  await Promise.all(
    events
      .filter((e) => e.type === "message" && e.message?.type === "text" && e.replyToken)
      .map((e) => handleTextMessage(e, accessToken)),
  );

  return new Response("OK", { status: 200 });
}
