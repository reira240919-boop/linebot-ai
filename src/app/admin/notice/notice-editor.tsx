"use client";

import { useState } from "react";
import { formatJapanDate, formatJapanDateTime, isNoticeShown } from "@/lib/date";
import type { Notice } from "@/lib/supabase";
import { inputBox, plainButton, primaryButton, StatusBanner, useAdminAction } from "../ui";
import { publishNoticeAction } from "./actions";

// いまのお知らせが、お客様に見えているかの説明
function visibilityText(notice: Notice, today: string) {
  if (!notice.endsOn) return "終わりの日なし。お客様にずっと見えています";
  const end = formatJapanDate(notice.endsOn);
  return isNoticeShown(notice.endsOn, today)
    ? `${end}まで、お客様に見えています`
    : `${end}で終わったので、お客様には見えていません`;
}

// today は日本時間の今日（サーバーで決めて渡す）
export default function NoticeEditor({ initialNotice, today }: { initialNotice: Notice | null; today: string }) {
  const [notice, setNotice] = useState(initialNotice);
  const [body, setBody] = useState(initialNotice?.body ?? "");
  const [endsOn, setEndsOn] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { pending, notice: result, clearNotice, run } = useAdminAction<Notice>((res) => {
    if (res.data) setNotice(res.data);
    if (res.ok) setConfirming(false);
  });

  const isEmpty = body.trim() === "";

  // 文章や終わりの日を変えたら、確認を出し直す
  function edit(update: () => void) {
    update();
    setConfirming(false);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <StatusBanner pending={pending} notice={result} />

      <section className="rounded-xl border border-line p-4">
        <h2 className="text-lg font-bold">いまのお知らせページ</h2>
        {notice ? (
          <>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{notice.body}</p>
            <p className="mt-2 text-sm">{formatJapanDateTime(notice.updatedAt)} に載せました</p>
            <p className="mt-1 text-sm font-bold">{visibilityText(notice, today)}</p>
          </>
        ) : (
          <p className="mt-2 text-base leading-relaxed">
            まだお知らせがありません。下に文章を書いて「お知らせページに載せる」を押してください。
          </p>
        )}
      </section>

      <label className="block text-base font-bold">
        お知らせの文章
        <textarea
          className={inputBox}
          rows={6}
          value={body}
          onChange={(e) => edit(() => setBody(e.target.value))}
          placeholder="例：10月20日（月）は臨時休業いたします。ご迷惑をおかけしますが、よろしくお願いいたします。"
          disabled={pending}
        />
      </label>

      <label className="block text-base font-bold">
        いつまで載せるか（終わりの日）
        <span className="block text-sm font-normal">
          この日が終わると、お客様のページから自動で消えます。空欄なら、ずっと載せます。
        </span>
        <input
          type="date"
          className={inputBox}
          value={endsOn}
          min={today}
          onChange={(e) => edit(() => setEndsOn(e.target.value))}
          disabled={pending}
        />
      </label>
      {endsOn && (
        <button
          type="button"
          className={`${plainButton} self-start`}
          onClick={() => edit(() => setEndsOn(""))}
          disabled={pending}
        >
          終わりの日を空欄にする
        </button>
      )}

      {confirming ? (
        <div className="rounded-lg bg-line/50 p-4">
          <p className="text-base font-bold">この内容をお知らせページに載せます。よろしいですか？</p>
          <p className="mt-1 text-base">
            {endsOn ? `${formatJapanDate(endsOn)}まで載せます。` : "終わりの日なしで、ずっと載せます。"}
            いま載っているお知らせは、この文章に置きかわります。
          </p>
          <div className="mt-3 flex gap-3">
            <button type="button" className={`${primaryButton} flex-1`} onClick={() => run(() => publishNoticeAction(body, endsOn))} disabled={pending}>
              {pending ? "載せています…" : "載せる"}
            </button>
            <button type="button" className={plainButton} onClick={() => setConfirming(false)} disabled={pending}>
              やめる
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`${primaryButton} w-full`}
            onClick={() => {
              clearNotice();
              setConfirming(true);
            }}
            disabled={pending || isEmpty}
          >
            お知らせページに載せる
          </button>
          {isEmpty && <p className="text-base">文章を書くと、載せられるようになります。</p>}
        </>
      )}
    </div>
  );
}
