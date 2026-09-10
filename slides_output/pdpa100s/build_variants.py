# -*- coding: utf-8 -*-
"""
PDPA-100S 認定証・認定バッジのデザイン変更案（比較用）

本編には入れない検討用ファイル。採用案が決まったら build_pdpa100s.py に反映する。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pdpa_template import (  # noqa: E402
    Deck, Inches, Pt, PP_ALIGN, MSO_ANCHOR, MSO_SHAPE,
    NAVY, ORANGE, WHITE, LGRAY, NAVY_CARD, ORANGE_TXT, TEXT, MUTED,
    BORDER, RED, CREAM_MUTED, MINCHO, RGBColor,
    SW, SH, MARGIN, CW, CY, CH,
    SZ_BODY, SZ_NOTE, SZ_NOTE_L,
)

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.dirname(HERE)

SAMPLE_NAME = "山田 太郎"
SAMPLE_NO = "PDPA-A-2026-0001"
SAMPLE_DATE = "2026年3月31日"
SAMPLE_EXPIRE = "2028年3月31日"

d = Deck("PDPA-100S-VAR",
         photo_dirs=(os.path.join(HERE, "photos"),
                     os.path.join(SLIDES, "pdpa100", "photos"),
                     os.path.join(SLIDES, "pdpa101_photos")))


def draw_cert(s, x, y, w, h, seal="round"):
    """認定証を枠 (x,y,w,h) に比例配置で描く。seal は round（丸印）/ square（角印）"""
    k = w / Inches(5.666)          # 文字サイズの基準
    E = Inches(1.0)

    d.rect(s, x, y, w, h, fill=WHITE, line=NAVY, line_w=4.0)
    d.rect(s, x + 0.030 * w, y + 0.030 * h, w - 0.060 * w, h - 0.060 * h,
           fill=None, line=ORANGE, line_w=1.5)
    dsz = int(0.028 * w)
    for px, py in ((x + 0.055 * w, y + 0.052 * h),
                   (x + w - 0.055 * w - dsz, y + 0.052 * h),
                   (x + 0.055 * w, y + h - 0.052 * h - dsz),
                   (x + w - 0.055 * w - dsz, y + h - 0.052 * h - dsz)):
        dia = s.shapes.add_shape(MSO_SHAPE.DIAMOND, int(px), int(py), dsz, dsz)
        dia.fill.solid(); dia.fill.fore_color.rgb = ORANGE
        dia.line.fill.background(); dia.shadow.inherit = False

    inx = x + 0.085 * w
    inw = w - 0.170 * w

    # ロゴ
    lg = int(0.135 * h)
    s.shapes.add_picture(d.photo("logo_circle"), int(x + (w - lg) / 2),
                         int(y + 0.055 * h), height=lg)
    # 表題
    d.tbox(s, x, y + 0.215 * h, w, 0.13 * h, "認 定 証",
           size=38 * k, color=NAVY, bold=True, align=PP_ALIGN.CENTER,
           font=MINCHO, space=6 * k)
    d.tbox(s, x, y + 0.372 * h, w, 0.05 * h,
           "C E R T I F I C A T E   O F   C E R T I F I C A T I O N",
           size=9 * k, color=MUTED, align=PP_ALIGN.CENTER)
    # 氏名
    d.tbox(s, inx, y + 0.455 * h, inw, 0.09 * h, SAMPLE_NAME + "　殿",
           size=20 * k, color=TEXT, font=MINCHO)
    d.rect(s, inx, y + 0.560 * h, inw, Pt(1.2), fill=NAVY)
    # 本文
    d.tbox(s, inx, y + 0.595 * h, inw, 0.17 * h,
           "あなたは本協会所定の課程を修了し、認定試験に合格されたことを認め、\n"
           "認定ペット防災アドバイザーとしてここに認定します。",
           size=11 * k, color=TEXT, font=MINCHO, ls=1.5)
    # 認定番号・認定日
    d.tbox(s, inx, y + 0.770 * h, inw - 0.21 * w, 0.10 * h,
           "認定番号　" + SAMPLE_NO + "\n認定日　　" + SAMPLE_DATE,
           size=10 * k, color=MUTED, ls=1.45)
    d.tbox(s, inx, y + 0.900 * h, inw - 0.21 * w, 0.06 * h,
           "一般社団法人 ペット防災アドバイザー協会　代表理事",
           size=10 * k, color=TEXT, font=MINCHO)
    # 印影
    sd = int(0.165 * h)
    sx = int(x + w - 0.225 * w)
    sy = int(y + 0.765 * h)
    shape = MSO_SHAPE.OVAL if seal == "round" else MSO_SHAPE.RECTANGLE
    sl = s.shapes.add_shape(shape, sx, sy, sd, sd)
    sl.fill.background()
    sl.line.color.rgb = RED
    sl.line.width = Pt(2.5 if seal == "round" else 3.0)
    sl.shadow.inherit = False
    d.tbox(s, sx, sy, sd, sd, "認定\n之印", size=11 * k, color=RED, bold=True,
           align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=MINCHO, ls=1.1)


def label(s, x, y, w, text, fill=NAVY, color=WHITE, h=Inches(0.44)):
    d.rect(s, x, y, w, h, fill=fill)
    d.tbox(s, x, y, w, h, text, size=SZ_NOTE, color=color, bold=True,
           align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


# ============================================================
# 1. 認定証 レイアウト比較
# ============================================================
s = d.add_slide()
d.title_band(s, "認定証：レイアウト2案", kicker="変更案　どちらを採用しますか")

col = int((CW - Inches(0.50)) / 2)
ch0 = Inches(4.24)

# A案：現行（横向き・丸印）
draw_cert(s, MARGIN, CY, col, ch0, seal="round")
label(s, MARGIN, CY + ch0 + Inches(0.16), col, "A案　横向き・丸印（現行）")

# B案：A4縦・角印
pw = int(ch0 * 0.707)
px = MARGIN + col + Inches(0.50) + int((col - pw) / 2)
draw_cert(s, px, CY, pw, ch0, seal="square")
label(s, MARGIN + col + Inches(0.50), CY + ch0 + Inches(0.16), col,
      "B案　A4縦・角印", fill=ORANGE, color=NAVY)

d.source_band(s, "検討用（PDPA-100S-VAR）／氏名・認定番号は架空の見本です")

# ============================================================
# 2. 認定バッジ 段階カラー
# ============================================================
SILVER = RGBColor(0x9B, 0xA5, 0xB0)
GOLD = RGBColor(0xC9, 0xA2, 0x27)
PLATINUM = RGBColor(0x3E, 0x4A, 0x59)

s = d.add_slide()
d.title_band(s, "認定バッジ：4段階のカラー", kicker="変更案　段階を色で表す")

levels = [("青バッジ", "卒業時", NAVY, WHITE),
          ("銀バッジ", "活動100pt", SILVER, NAVY),
          ("金バッジ", "認定講師", GOLD, NAVY),
          ("プラチナ", "マスター講師", PLATINUM, WHITE)]

cw = int((CW - Inches(0.28) * 3) / 4)
card_h = Inches(3.90)
x = MARGIN
for name, cond, band, txt in levels:
    d.rect(s, x, CY, cw, card_h, fill=WHITE, line=NAVY, line_w=1.5, radius=0.05)
    # ストラップ穴
    d.rect(s, x + (cw - Inches(0.45)) / 2, CY + Inches(0.09), Inches(0.45),
           Inches(0.09), fill=LGRAY, line=BORDER, radius=0.5)
    # ヘッダー（段階カラー）
    hy = CY + Inches(0.26)
    d.rect(s, x, hy, cw, Inches(0.62), fill=band)
    s.shapes.add_picture(d.photo("logo_circle"), int(x + Inches(0.10)),
                         int(hy + Inches(0.07)), height=Inches(0.48))
    d.tbox(s, x + Inches(0.66), hy + Inches(0.06), cw - Inches(0.76), Inches(0.52),
           "一般社団法人\nペット防災アドバイザー協会", size=7.5, color=txt,
           bold=True, ls=1.3)
    # 顔写真
    py = hy + Inches(0.74)
    d.framed_pic(s, "id_portrait", x + Inches(0.14), py, Inches(0.86), Inches(1.10),
                 frame=NAVY, fw=1.0)
    ix = x + Inches(1.08)
    iw = cw - Inches(1.22)
    d.tbox(s, ix, py + Inches(0.04), iw, Inches(0.20),
           "認定ペット防災アドバイザー", size=7, color=ORANGE_TXT, bold=True)
    d.tbox(s, ix, py + Inches(0.30), iw, Inches(0.36), SAMPLE_NAME,
           size=15, color=NAVY, bold=True)
    d.rect(s, ix, py + Inches(0.76), iw, Pt(1), fill=band)
    d.tbox(s, ix, py + Inches(0.84), iw, Inches(0.22), name,
           size=9, color=NAVY, bold=True)
    # 記載事項
    ry = py + Inches(1.24)
    for i, (kk, vv) in enumerate((("認定番号", SAMPLE_NO), ("有効期限", SAMPLE_EXPIRE))):
        yy = ry + Inches(0.24) * i
        d.tbox(s, x + Inches(0.14), yy, Inches(0.68), Inches(0.22), kk,
               size=8, color=MUTED)
        d.tbox(s, x + Inches(0.86), yy, cw - Inches(1.0), Inches(0.22), vv,
               size=8.5, color=TEXT, bold=True)
    # 段階の条件
    d.rect(s, x, CY + card_h - Inches(0.34), cw, Inches(0.34), fill=band)
    d.tbox(s, x, CY + card_h - Inches(0.34), cw, Inches(0.34), cond,
           size=9, color=txt, bold=True, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)
    label(s, x, CY + card_h + Inches(0.14), cw, name, fill=band, color=txt,
          h=Inches(0.40))
    x += cw + Inches(0.28)

d.source_band(s, "検討用（PDPA-100S-VAR）／段階は協会 活動実績ポイント制度に対応"
                 "／氏名・認定番号・写真は架空の見本です")

d.save(os.path.join(HERE, "PDPA-100S_variants.pptx"),
       refs_path=os.path.join(HERE, "variants_refs.json"))
