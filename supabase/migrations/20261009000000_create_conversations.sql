-- 会話ログ（LINE で文字のやり取りがあったときの、質問と bot の返事）の表
-- 読み書きするのはサーバーだけ（Secret key）。外からは見えないよう RLS をオンにし、ポリシーは作らない。
-- ログはあとから直さないので、updated_at ではなく、やり取りした時刻を created_at に残す。

create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  line_user_id text not null,
  question text not null,
  reply text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

-- 新しい表が自動で公開されない設定のため、サーバー用の役割にだけ使う許可を出す
grant select, insert on public.conversations to service_role;
