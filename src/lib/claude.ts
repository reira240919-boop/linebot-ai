import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Faq, Menu } from "./supabase";

const client = new Anthropic();

// 確信度。高・中はお客様に返事し、低はオーナーの手動対応に回す
const AnswerSchema = z.object({
  confidence: z.enum(["high", "medium", "low"]),
  reply: z.string(),
});

export type Answer = z.infer<typeof AnswerSchema>;

function buildSystemPrompt(faqs: Faq[], menus: Menu[]) {
  const faqText = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const menuText = menus
    .map((m) => `- ${m.name}: ${m.price}${m.note ? `（${m.note}）` : ""}`)
    .join("\n");

  return `あなたは美容室の LINE 公式アカウントで、お客様の質問に答える係です。
下の「登録内容」だけを根拠に、やさしく丁寧な日本語で、短く答えてください。

確信度（confidence）の決め方:
- high（高）: 質問への答えが、登録内容にそのまま書いてある
- medium（中）: 近いことは登録内容に書いてあるが、ぴったりの文はない。登録内容の範囲だけで答えられる
- low（低）: 登録内容にない
- FAQ や料金に直接該当する記述がない場合は、確信度を low にする
- 1〜10 点のような自己採点だけで決めない。上の基準に当てはめて、high / medium / low のどれかを選ぶ
- 予約の申し込みそのもの、相談ごとは low にする

返信文（reply）の決まり:
- 登録内容に書いてあることだけを答える。書いていない料金・時間・可否は作らない、推測しない
- medium のときも、登録内容の範囲を超えて言い切らない
- high と medium のときだけ reply に返信文を入れる。low のときの reply は空でよい
- 返信文は LINE で読みやすいよう 2〜4 文程度。見出しや記号での装飾はしない

# 登録内容

## よくある質問
${faqText || "（登録なし）"}

## メニューと料金
${menuText || "（登録なし）"}`;
}

// 質問への確信度を判定し、高・中なら返信文を作る
export async function answerQuestion(question: string, faqs: Faq[], menus: Menu[]): Promise<Answer> {
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(AnswerSchema) },
    system: buildSystemPrompt(faqs, menus),
    messages: [{ role: "user", content: question }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return { confidence: "low", reply: "" };
  }
  return response.parsed_output;
}
