"use client";

import type { FaqRow } from "@/lib/supabase";
import ListEditor from "../list-editor";
import { addFaqAction, removeFaqAction, saveFaqAction } from "./actions";

export default function FaqEditor({ initialFaqs }: { initialFaqs: FaqRow[] }) {
  return (
    <ListEditor
      initialRows={initialFaqs}
      fields={[
        { label: "質問", placeholder: "例：駐車場はありますか？", rows: 2 },
        { label: "答え", placeholder: "例：店舗の前に2台分あります。", rows: 4 },
      ]}
      toValues={(faq) => [faq.question, faq.answer]}
      renderRow={(faq) => (
        <>
          <p className="text-sm font-bold">質問</p>
          <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed">{faq.question}</p>
          <p className="mt-3 text-sm font-bold">答え</p>
          <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed">{faq.answer}</p>
        </>
      )}
      texts={{ itemName: "質問", emptyHelp: "お客様によく聞かれる質問と答えを登録してください。" }}
      onAdd={([question, answer]) => addFaqAction(question, answer)}
      onSave={(id, [question, answer]) => saveFaqAction(id, question, answer)}
      onRemove={removeFaqAction}
    />
  );
}
