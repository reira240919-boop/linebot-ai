// 日付の書き方は毎回同じなので、最初に 1 回だけ作って使い回す
const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "long",
  day: "numeric",
  weekday: "short",
});
const isoDateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" });

// 日本時間で「2026年10月9日 12:30」の形にする
export function formatJapanDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

// 日本時間の今日を「2026-10-09」の形で返す（終わりの日と比べるため）
export function todayInJapan() {
  return isoDateFormat.format(new Date());
}

// 「2026-10-20」を「10月20日(月)」の形にする
export function formatJapanDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00+09:00`));
}

// 終わりの日が空欄か、今日以降ならお客様に見せる
export function isNoticeShown(endsOn: string | null, today: string) {
  return endsOn === null || endsOn >= today;
}
