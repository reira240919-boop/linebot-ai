import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

// 管理画面（/admin）は、合言葉で入った人だけ開ける。お知らせページ（/notice）などは対象外
export function proxy(request: NextRequest) {
  if (isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin-login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
