-- FAQ（よくある質問と答え）とメニュー（料金）の表
-- 読み書きするのはサーバーだけ（Secret key）。外からは見えないよう RLS をオンにし、ポリシーは作らない。

create table if not exists public.faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.menus (
  id bigint generated always as identity primary key,
  name text not null,
  price text not null,
  note text not null default '',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;
alter table public.menus enable row level security;

-- 新しい表が自動で公開されない設定のため、サーバー用の役割にだけ使う許可を出す
grant select, insert, update, delete on public.faqs, public.menus to service_role;
