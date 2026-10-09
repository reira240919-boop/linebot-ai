"use client";

import type { MenuRow } from "@/lib/supabase";
import ListEditor from "../list-editor";
import { addMenuAction, removeMenuAction, saveMenuAction } from "./actions";

export default function MenuEditor({ initialMenus }: { initialMenus: MenuRow[] }) {
  return (
    <ListEditor
      initialRows={initialMenus}
      fields={[
        { label: "メニュー名", placeholder: "例：カット" },
        { label: "料金", placeholder: "例：4,400円" },
      ]}
      toValues={(menu) => [menu.name, menu.price]}
      renderRow={(menu) => (
        <div className="flex items-baseline justify-between gap-3">
          <p className="whitespace-pre-wrap text-lg font-bold leading-relaxed">{menu.name}</p>
          <p className="shrink-0 whitespace-pre-wrap text-lg leading-relaxed">{menu.price}</p>
        </div>
      )}
      texts={{ itemName: "メニュー", emptyHelp: "メニュー名と料金を登録してください。" }}
      onAdd={([name, price]) => addMenuAction(name, price)}
      onSave={(id, [name, price]) => saveMenuAction(id, name, price)}
      onRemove={removeMenuAction}
    />
  );
}
