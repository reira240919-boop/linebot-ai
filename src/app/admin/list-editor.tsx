"use client";

import { useState, type ReactNode } from "react";
import type { ActionResult } from "./action-result";
import { dangerButton, inputBox, plainButton, primaryButton, StatusBanner, useAdminAction } from "./ui";

// 「質問と答え」「メニューと料金」で共通の、追加・編集・削除ができる一覧

// 入力欄 1 つ分の設定。rows を付けると複数行の欄になる
export type Field = { label: string; placeholder: string; rows?: number };

type Values = [string, string];

// いま開いている操作（追加 / 編集 / 削除の確認）
type Mode = { kind: "none" } | { kind: "add" } | { kind: "edit"; id: number } | { kind: "confirmDelete"; id: number };

function EditForm({
  fields,
  initialValues = ["", ""],
  pending,
  onSave,
  onCancel,
}: {
  fields: [Field, Field];
  initialValues?: Values;
  pending: boolean;
  onSave: (values: Values) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Values>(initialValues);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
    >
      {fields.map((field, i) => {
        const props = {
          className: inputBox,
          value: values[i],
          placeholder: field.placeholder,
          disabled: pending,
          onChange: (e: { target: { value: string } }) =>
            setValues((prev) => (i === 0 ? [e.target.value, prev[1]] : [prev[0], e.target.value])),
        };
        return (
          <label key={field.label} className="block text-base font-bold">
            {field.label}
            {field.rows ? <textarea rows={field.rows} {...props} /> : <input type="text" {...props} />}
          </label>
        );
      })}
      <div className="flex gap-3">
        <button type="submit" className={`${primaryButton} flex-1`} disabled={pending}>
          {pending ? "保存しています…" : "保存する"}
        </button>
        <button type="button" className={plainButton} onClick={onCancel} disabled={pending}>
          やめる
        </button>
      </div>
    </form>
  );
}

export default function ListEditor<Row extends { id: number }>({
  initialRows,
  fields,
  toValues,
  renderRow,
  texts,
  onAdd,
  onSave,
  onRemove,
}: {
  initialRows: Row[];
  fields: [Field, Field];
  toValues: (row: Row) => Values;
  renderRow: (row: Row) => ReactNode;
  // itemName は「質問」「メニュー」など
  texts: { itemName: string; emptyHelp: string };
  onAdd: (values: Values) => Promise<ActionResult<Row[]>>;
  onSave: (id: number, values: Values) => Promise<ActionResult<Row[]>>;
  onRemove: (id: number) => Promise<ActionResult<Row[]>>;
}) {
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState<Mode>({ kind: "none" });
  const { pending, notice, clearNotice, run } = useAdminAction<Row[]>((result) => {
    if (result.data) setRows(result.data);
    if (result.ok) setMode({ kind: "none" });
  });

  function open(next: Mode) {
    clearNotice();
    setMode(next);
  }

  const close = () => setMode({ kind: "none" });
  const addLabel = `＋ ${texts.itemName}を追加する`;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <StatusBanner pending={pending} notice={notice} />

      {mode.kind === "add" ? (
        <section className="rounded-xl border-2 border-focus p-4">
          <h2 className="mb-3 text-lg font-bold">新しい{texts.itemName}</h2>
          <EditForm fields={fields} pending={pending} onSave={(v) => run(() => onAdd(v))} onCancel={close} />
        </section>
      ) : (
        <button type="button" className={`${primaryButton} w-full`} onClick={() => open({ kind: "add" })} disabled={pending}>
          {addLabel}
        </button>
      )}

      {rows.length === 0 && mode.kind !== "add" && (
        <div className="rounded-xl border border-dashed border-line p-6 text-center">
          <p className="text-lg font-bold">まだ{texts.itemName}がありません</p>
          <p className="mt-2 text-base leading-relaxed">
            上の「{addLabel}」を押して、{texts.emptyHelp}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-line p-4">
            {mode.kind === "edit" && mode.id === row.id ? (
              <EditForm
                fields={fields}
                initialValues={toValues(row)}
                pending={pending}
                onSave={(v) => run(() => onSave(row.id, v))}
                onCancel={close}
              />
            ) : (
              <>
                {renderRow(row)}
                {mode.kind === "confirmDelete" && mode.id === row.id ? (
                  <div className="mt-4 rounded-lg bg-line/50 p-4">
                    <p className="text-base font-bold">この{texts.itemName}を削除しますか？</p>
                    <p className="mt-1 text-base">削除すると元に戻せません。</p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        className={`${dangerButton} flex-1`}
                        onClick={() => run(() => onRemove(row.id))}
                        disabled={pending}
                      >
                        {pending ? "削除しています…" : "削除する"}
                      </button>
                      <button type="button" className={plainButton} onClick={close} disabled={pending}>
                        やめる
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      className={`${plainButton} flex-1`}
                      onClick={() => open({ kind: "edit", id: row.id })}
                      disabled={pending}
                    >
                      編集する
                    </button>
                    <button
                      type="button"
                      className={dangerButton}
                      onClick={() => open({ kind: "confirmDelete", id: row.id })}
                      disabled={pending}
                    >
                      削除する
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
