import AdminTabs from "./admin-tabs";

// 管理画面の共通の枠。上にタブを置く
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex-1">
      <AdminTabs />
      {children}
    </div>
  );
}
