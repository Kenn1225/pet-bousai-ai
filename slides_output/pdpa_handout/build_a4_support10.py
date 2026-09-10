# -*- coding: utf-8 -*-
"""
卒業後に受けられる10のサポート（A4縦・1枚）

配布用の1枚もの。スライドではなく印刷物なので、文字サイズは協会標準の
「タイトル34〜40pt／本文26〜30pt」ではなく印刷向けの実寸で組む。
色・フォント・ロゴの扱いは協会標準どおり。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pdpa_template import (  # noqa: E402
    Deck, Inches, Pt, PP_ALIGN, MSO_ANCHOR, MSO_SHAPE,
    NAVY, ORANGE, WHITE, LGRAY, ORANGE_TXT, TEXT, MUTED, BORDER, CREAM_MUTED,
)

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.dirname(HERE)

# ---- A4縦 210×297mm ----
PW = Inches(8.268)
PH = Inches(11.693)
M = Inches(0.55)                 # 左右余白
CWD = PW - M * 2                 # 本文幅 7.168in

d = Deck("PDPA-100S-A4",
         photo_dirs=(os.path.join(SLIDES, "pdpa100s", "photos"),
                     os.path.join(SLIDES, "pdpa100", "photos"),
                     os.path.join(SLIDES, "pdpa101_photos")))
d.prs.slide_width = PW
d.prs.slide_height = PH

s = d.add_slide()

# ============================================================
# ヘッダー：中央上にロゴ
# ============================================================
LOGO_H = Inches(1.08)
s.shapes.add_picture(d.photo("logo_circle"),
                     int((PW - LOGO_H) / 2), int(Inches(0.46)), height=int(LOGO_H))

d.tbox(s, M, Inches(1.70), CWD, Inches(0.48),
       "卒業後に受けられる 10 のサポート", size=25, color=NAVY, bold=True,
       align=PP_ALIGN.CENTER)
d.rect(s, (PW - Inches(2.10)) / 2, Inches(2.26), Inches(2.10), Pt(4), fill=ORANGE)
d.tbox(s, M, Inches(2.42), CWD, Inches(0.30),
       "認定ペット防災アドバイザーのためのバックアップ体制",
       size=12, color=MUTED, align=PP_ALIGN.CENTER)

# ============================================================
# 10のサポート（2列×5行）
# ============================================================
ITEMS = [
    ("初回デビュー伴走",
     "卒業後はじめての講座は認定講師がZoomで同席し、企画の相談から講評まで伴走します。"),
    ("セミナー開催キット",
     "PowerPoint・司会台本・配布資料・アンケート・修了証テンプレートを一式で提供します。"),
    ("協会名義の公式文書",
     "自治体や学校へ出す依頼文・企画書ひな型・活動証明書を協会名義で発行します。"),
    ("団体賠償責任保険",
     "講座中の事故に備える保険にご加入いただけます（保険料は認定者負担）。"),
    ("出典アップデート通知",
     "環境省・内閣府・気象庁などの改訂を協会が監視し、古くなった教材ページを差し替えて配信します。"),
    ("協会ライブラリー",
     "スライド・チラシ・チェックリスト・ポスターを認定者専用ページから自由にダウンロードできます。"),
    ("毎月のオンライン勉強会",
     "最近の災害事例、防災グッズ、行政情報、法改正を毎月共有。認定者どうしの交流の場にもなります。"),
    ("認定者マップと指名紹介",
     "地域や企業からの相談を協会がお取り次ぎします。公開するのはご本人が同意した項目だけです。"),
    ("共同開催マッチング",
     "近隣の認定者2〜3名でチームを組めるよう協会が仲介。はじめての開催もひとりで抱えません。"),
    ("活動記録とバッジ昇格",
     "LINEで活動を報告すればポイントを自動集計。青→銀→金のバッジ昇格まで協会が判定します。"),
]

COLS = 2
GAP_X = Inches(0.24)
GAP_Y = Inches(0.16)
CARD_W = int((CWD - GAP_X) / COLS)
CARD_H = Inches(1.26)
TOP = Inches(2.94)

for i, (head, body) in enumerate(ITEMS):
    c, r = i % COLS, i // COLS
    x = M + c * (CARD_W + GAP_X)
    y = TOP + r * (CARD_H + GAP_Y)

    d.rect(s, x, y, CARD_W, CARD_H, fill=WHITE, line=BORDER, radius=0.07)
    # 左のアクセント（角丸からはみ出さないよう上下を少し詰める）
    d.rect(s, x + Inches(0.02), y + Inches(0.08), Inches(0.08),
           CARD_H - Inches(0.16), fill=ORANGE)
    d.num_badge(s, x + Inches(0.24), y + Inches(0.15), i + 1, d=Inches(0.40))
    d.tbox(s, x + Inches(0.74), y + Inches(0.16), CARD_W - Inches(0.92), Inches(0.32),
           head, size=13.5, color=NAVY, bold=True)
    d.tbox(s, x + Inches(0.26), y + Inches(0.56), CARD_W - Inches(0.48), Inches(0.68),
           body, size=9.5, color=TEXT, ls=1.35)

# ============================================================
# フッター：中央下に協会名
# ============================================================
last_bottom = TOP + 5 * CARD_H + 4 * GAP_Y
d.tbox(s, M, last_bottom + Inches(0.14), CWD, Inches(0.22),
       "教材コード PDPA-100S　認定後サポート体制　Ver.1.0",
       size=8, color=MUTED, align=PP_ALIGN.CENTER)

FOOT_H = Inches(0.92)
FOOT_Y = PH - Inches(0.42) - FOOT_H
d.rect(s, 0, FOOT_Y, PW, FOOT_H, fill=NAVY)
d.rect(s, 0, FOOT_Y, PW, Pt(4), fill=ORANGE)
d.tbox(s, M, FOOT_Y + Inches(0.16), CWD, Inches(0.30),
       "一般社団法人 ペット防災アドバイザー協会", size=15, color=WHITE, bold=True,
       align=PP_ALIGN.CENTER)
d.tbox(s, M, FOOT_Y + Inches(0.52), CWD, Inches(0.26),
       "備える・守る・つなぐ", size=11, color=ORANGE, bold=True,
       align=PP_ALIGN.CENTER)

d.tbox(s, M, PH - Inches(0.34), CWD, Inches(0.20),
       "© 一般社団法人 ペット防災アドバイザー協会",
       size=7.5, color=MUTED, align=PP_ALIGN.CENTER)

d.save(os.path.join(HERE, "PDPA_support10_A4.pptx"),
       refs_path=os.path.join(HERE, "a4_refs.json"))
