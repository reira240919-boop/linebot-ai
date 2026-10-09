#!/usr/bin/env python3
"""この案件の提案書。見た目は共通テンプレートを使う。"""

import importlib.util
from pathlib import Path

_template = Path.home() / ".cursor/templates/proposal-pdf/proposal_pdf.py"
_spec = importlib.util.spec_from_file_location("proposal_pdf_template", _template)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

SAMPLE = {
    "title": "LINE bot + AI 自動応答",
    "addressee": "美容室オーナー様",
    "problems": [
        "1日10〜15件のLINE問い合わせに、オーナー様がご自身で返信している",
        "土日は件数がもう少し増える",
        "営業時間外もすぐの返信を期待され、休みづらい",
        "同じ質問が繰り返されている（営業時間、カットの値段、予約の可否、パーマとカラーの同時施術、駐車場）",
    ],
    "solution_lead": "LINEの友だちからの質問に、登録した内容をもとに自動で返します。答えられないものだけ、オーナー様に知らせます。",
    "will_do": [
        "よくある5つの質問への自動応答（営業時間、カットの値段、予約の可否、パーマとカラーの同時施術、駐車場）",
        "自動で答えられない質問は、オーナー様に通知",
        "料金やメニューを、スマホから直せる管理画面（パソコンは不要。半年に1回の値上げに使えます）",
        "臨時休業などを、友だち約300人へ一斉にお知らせ",
    ],
    "wont_do": [
        "予約機能（電話と、いまのLINEの手動返信のまま。ご希望があれば次の段階でご相談）",
        "顧客カルテ",
        "決済",
        "多言語対応",
    ],
    "effects": [
        "1日10〜15件のうち、約8割を自動で返信",
        "オーナー様の対応時間は、1日30分から5分以下",
        "営業時間外の問い合わせにも、その場で返信できる",
    ],
    "tools": [
        {"name": "LINE Messaging API", "meaning": "いまお使いのLINE公式アカウントとそのまま接続する窓口"},
        {"name": "Claude API", "meaning": "質問の意味を読み、登録した内容に沿って日本語で返すAI。使った分だけ料金がかかる"},
        {"name": "Vercel", "meaning": "自動応答のプログラムを、インターネット上で動かす場所。無料枠"},
        {"name": "Supabase", "meaning": "営業時間や料金などの登録内容を入れておく保管場所。無料枠"},
    ],
    "schedule": "2週間",
    "initial_cost": "8万円（税込）",
    "initial_note": "ご予算10万円以内",
    "monthly_cost": "約2,000〜3,000円",
    "monthly_note": "AIの利用料のみ",
}


if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "提案書サンプル.pdf"
    _mod.build_proposal_pdf(SAMPLE, str(out))
    print(out)
