-- お知らせに「いつまで載せるか（終わりの日）」を足す。空欄ならずっと載せる
-- 終わりの日を過ぎたお知らせは、お客様のお知らせページに出さない

alter table public.notices add column if not exists ends_on date;
