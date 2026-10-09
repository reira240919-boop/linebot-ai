-- お知らせ（臨時休業など）の表。保存するたびに 1 件増やし、お知らせページには最新の 1 件を出す
-- 読み書きするのはサーバーだけ（Secret key）。外からは見えないよう RLS をオンにし、ポリシーは作らない。

create table if not exists public.notices (
  id bigint generated always as identity primary key,
  body text not null,
  updated_at timestamptz not null default now()
);

alter table public.notices enable row level security;

-- 新しい表が自動で公開されない設定のため、サーバー用の役割にだけ使う許可を出す
grant select, insert on public.notices to service_role;
