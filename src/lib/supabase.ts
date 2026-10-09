import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Faq = { question: string; answer: string };
export type Menu = { name: string; price: string; note: string };

// サーバーだけで使う（Secret key はブラウザに出さない）。最初に使うときに 1 つだけ作る
let client: SupabaseClient | null = null;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL または SUPABASE_SECRET_KEY が未設定です");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// 自動応答の元にする登録内容（FAQ とメニュー）をまとめて取る
export async function getKnowledge(): Promise<{ faqs: Faq[]; menus: Menu[] }> {
  const supabase = getClient();
  const [faqs, menus] = await Promise.all([
    supabase.from("faqs").select("question, answer").order("sort_order"),
    supabase.from("menus").select("name, price, note").order("sort_order"),
  ]);
  if (faqs.error) throw faqs.error;
  if (menus.error) throw menus.error;
  return { faqs: faqs.data, menus: menus.data };
}

// 管理画面で使う、よくある質問 1 件分
export type FaqRow = Faq & { id: number };
// 管理画面で使う、メニュー 1 件分（補足 note は画面では触らず、そのまま残す）
export type MenuRow = { id: number; name: string; price: string };

type ListTable = "faqs" | "menus";

// 新しく足すものは一覧のいちばん下に並べる
async function nextSortOrder(table: ListTable) {
  const { data, error } = await getClient()
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data[0]?.sort_order ?? 0) + 1;
}

async function insertRow(table: ListTable, values: Record<string, string>) {
  const { error } = await getClient()
    .from(table)
    .insert({ ...values, sort_order: await nextSortOrder(table) });
  if (error) throw error;
}

// 書き換えた行があれば true。もう消えていたら false
async function updateRow(table: ListTable, id: number, values: Record<string, string>) {
  const { data, error } = await getClient()
    .from(table)
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return data.length > 0;
}

async function deleteRow(table: ListTable, id: number) {
  const { error } = await getClient().from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function listFaqs(): Promise<FaqRow[]> {
  const { data, error } = await getClient()
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order")
    .order("id");
  if (error) throw error;
  return data;
}

export const createFaq = (question: string, answer: string) => insertRow("faqs", { question, answer });
export const updateFaq = (id: number, question: string, answer: string) => updateRow("faqs", id, { question, answer });
export const deleteFaq = (id: number) => deleteRow("faqs", id);

export async function listMenus(): Promise<MenuRow[]> {
  const { data, error } = await getClient()
    .from("menus")
    .select("id, name, price")
    .order("sort_order")
    .order("id");
  if (error) throw error;
  return data;
}

export const createMenu = (name: string, price: string) => insertRow("menus", { name, price });
export const updateMenu = (id: number, name: string, price: string) => updateRow("menus", id, { name, price });
export const deleteMenu = (id: number) => deleteRow("menus", id);

// お知らせ（臨時休業など）。いちばん新しく保存したものを出す
export type Notice = { body: string; endsOn: string | null; updatedAt: string };

function toNotice(row: { body: string; ends_on: string | null; updated_at: string }): Notice {
  return { body: row.body, endsOn: row.ends_on, updatedAt: row.updated_at };
}

export async function getLatestNotice(): Promise<Notice | null> {
  const { data, error } = await getClient()
    .from("notices")
    .select("body, ends_on, updated_at")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data[0] ? toNotice(data[0]) : null;
}

// endsOn は「2026-10-20」の形。null ならずっと載せる。保存したお知らせを返す
export async function createNotice(body: string, endsOn: string | null): Promise<Notice> {
  const { data, error } = await getClient()
    .from("notices")
    .insert({ body, ends_on: endsOn })
    .select("body, ends_on, updated_at")
    .single();
  if (error) throw error;
  return toNotice(data);
}

// LINE での文字のやり取りを、会話ログに 1 件残す。needsOwner は確信度が低く、オーナーの返信が必要なとき true
export async function saveConversation(lineUserId: string, question: string, reply: string, needsOwner: boolean) {
  const { error } = await getClient()
    .from("conversations")
    .insert({ line_user_id: lineUserId, question, reply, needs_owner: needsOwner });
  if (error) throw error;
}

// 管理画面を開いた直後に出す、返信が必要な質問（新しい順）
export type OwnerQuestion = { id: number; question: string; createdAt: string };

export async function listOwnerQuestions(): Promise<OwnerQuestion[]> {
  const { data, error } = await getClient()
    .from("conversations")
    .select("id, question, created_at")
    .eq("needs_owner", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data.map((row) => ({ id: row.id, question: row.question, createdAt: row.created_at }));
}
