"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/faqs", label: "FAQ設定" },
  { href: "/admin/menus", label: "メニューと料金" },
  { href: "/admin/notice", label: "お知らせ" },
];

// 管理画面の上のタブ。選んでいるタブは背景色で分かるようにする
export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-white">
      <div className="mx-auto w-full max-w-xl px-4 pt-3">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center text-base font-bold"
        >
          管理画面TOP
        </Link>
        <ul className="mt-1 flex gap-2 pb-3">
          {TABS.map((tab) => {
            const selected = pathname.startsWith(tab.href);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={selected ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-center rounded-lg px-1 text-center text-sm font-bold leading-tight ${
                    selected ? "bg-ink text-white" : "border border-line bg-white text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
