-- 会話ログに「オーナーの返信が必要か（確信度が低かったか）」を足す
-- 管理画面を開いた直後の「返信が必要な質問」に使う

alter table public.conversations add column if not exists needs_owner boolean not null default false;
