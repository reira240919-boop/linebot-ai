// 画面を開いたときに、Supabase から読み込めなかったときの知らせ
export default function LoadError({ what }: { what: string }) {
  return (
    <p role="alert" className="mt-6 rounded-lg border border-danger p-4 text-base leading-relaxed text-danger">
      {what}を読み込めませんでした。通信の状態を確かめて、画面を読み込み直してください。
    </p>
  );
}
