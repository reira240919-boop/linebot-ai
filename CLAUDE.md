@AGENTS.md

# このプロジェクトのルール

正にするのは `requirements.md` と `提案書.md`。この 2 つにない機能は足さない。

## 名前の付け方

いまあるファイルと表に合わせる。

- Supabase の表の名前は、英語の複数形で小文字にする（例: `faqs`、`menus`）。新しく作る会話ログの表も `conversations` にする
- 列の名前は、英語の小文字を `_` でつなぐ（例: `sort_order`、`updated_at`）
- 表には `id`（`bigint generated always as identity primary key`）と `updated_at` を付ける。並び順が要る表には `sort_order` を付ける
- 表を作る SQL は `supabase/migrations/日時_内容.sql` に置く（例: `20261007000000_create_faqs_menus.sql`）
- `src/lib/` のファイル名は、つなぐ相手の名前を小文字で付ける（例: `claude.ts`、`supabase.ts`）
- 関数と変数は camelCase で、動きが分かる名前にする（例: `getKnowledge`、`answerQuestion`、`notifyOwner`）
- 型は PascalCase の単数形にする（例: `Faq`、`Menu`、`Answer`）
- 決まった文言は大文字を `_` でつなぐ（例: `ESCALATION_REPLY`）
- コメント、ログ、お客様とオーナー様に見せる文言は日本語で書く

## 配色（管理画面用）

お客様の LINE の見た目には使わない。オーナー様がスマホで使う管理画面の色だけを決める。

| 使う場所 | 色 |
| --- | --- |
| 背景 | 白 `#FFFFFF` |
| 本文の文字 | しっかり読める濃さのグレー `#4A4A4A` |
| 重要なボタン（保存・追加など） | 1 色だけ使う。くすみのあるピンク `#E6C4C4`、文字は本文と同じグレー `#4A4A4A` |
| 取り消しにくい操作（削除など） | 控えめな色。枠線か文字だけのボタンにし、灰色がかった赤茶 `#9C6B5E` を使う。目立つ赤で塗りつぶさない |
| 枠線・区切り線 | 薄いベージュ `#E8DFD8` |

- 重要なボタンの色を、ほかの用途に使い回さない
- 削除の前には確認を出す。保存や削除のあとには「保存しました」「削除しました」を出す
- タブや切り替えは、選んでいるものに背景色を付けて、いまどこにいるか分かるようにする

## 書き方

- 鍵やトークンはコードに書かない。`.env.local` に置き、コードからは `process.env` で読む
- `.env.local` の中身は、画面やログに出さない
- `SUPABASE_SECRET_KEY` はサーバーの中だけで使い、ブラウザに渡さない
- LINE からの受信は `src/app/api/line/webhook/route.ts` に置く。LINE 以外からのアクセスは署名チェックで弾く
- Claude API を使う処理は `src/lib/claude.ts`、Supabase の読み書きは `src/lib/supabase.ts` にまとめる
- デプロイ、`git commit`、`git push` は、ユーザーが明示するまでしない
