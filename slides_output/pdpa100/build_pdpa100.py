# -*- coding: utf-8 -*-
"""
PDPA-100 一般社団法人ペット防災アドバイザー協会 公式教育システム
公式PowerPoint（30枚） ビルドスクリプト

協会標準（memory/pdpa_brand_standards.md および公式教育システム設計書 Ver.1.0 準拠）
  ブランドカラー : ネイビー #17375E / オレンジ #F5A623 / ホワイト #FFFFFF / ライトグレー #F3F5F7
  フォント       : BIZ UDPゴシック
  文字サイズ     : タイトル 34〜40pt / 本文 26〜30pt / 注釈 18〜20pt
  デザインルール : タイトル=ネイビー帯白文字 / 見出し=オレンジ帯 / 重要=赤い「！」
                   ワーク=緑帯 / ケーススタディ=オレンジ背景 / コラム=薄いグレー
                   1ページ1テーマ / 本文80文字程度 / 写真必須 / 図必須 / 出典必須(下部18pt)
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from pptx.oxml import parse_xml
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
NEW_PHOTOS = os.path.join(HERE, "photos")
OLD_PHOTOS = os.path.join(os.path.dirname(HERE), "pdpa101_photos")

# ---------------- 公式ブランドカラー ----------------
NAVY = RGBColor(0x17, 0x37, 0x5E)   # メイン
ORANGE = RGBColor(0xF5, 0xA6, 0x23)  # サブ
WHITE = RGBColor(0xFF, 0xFF, 0xFF)   # 背景
LGRAY = RGBColor(0xF3, 0xF5, 0xF7)   # 補助
# 派生色（公式4色から演算・用途限定）
NAVY_CARD = RGBColor(0x24, 0x48, 0x70)   # ネイビー背景上のカード
ORANGE_TXT = RGBColor(0xB3, 0x76, 0x08)  # 白背景上のオレンジ文字（可読性確保）
TEXT = RGBColor(0x1B, 0x22, 0x2C)        # 本文
MUTED = RGBColor(0x5A, 0x64, 0x72)       # 注釈
BORDER = RGBColor(0xD8, 0xDE, 0xE6)      # 罫線
RED = RGBColor(0xC0, 0x2A, 0x1E)         # 重要「！」専用
GREEN = RGBColor(0x2E, 0x7D, 0x5B)       # ワーク帯専用
CREAM_MUTED = RGBColor(0xC9, 0xD2, 0xDD)

FONT = "BIZ UDPGothic"

# ---------------- 文字サイズ（協会標準） ----------------
SZ_TITLE = 34      # タイトル 34〜40pt
SZ_TITLE_L = 40
SZ_BODY = 26       # 本文 26〜30pt
SZ_BODY_L = 30
SZ_NOTE = 18       # 注釈 18〜20pt
SZ_NOTE_L = 20

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
SW, SH = prs.slide_width, prs.slide_height

MARGIN = Inches(0.75)
CW = SW - MARGIN * 2               # コンテンツ幅 11.833in
BAND_H = Inches(1.30)              # タイトル帯
CY = Inches(1.60)                  # コンテンツ上端
CB = Inches(6.50)                  # コンテンツ下端
CH = CB - CY                       # コンテンツ高 4.90in
SRC_Y = Inches(6.55)               # 出典帯
SRC_H = Inches(0.95)

_page = {"n": 0}

# ============================================================
# 出典管理台帳（pdpa_support/refs.json）との紐付け
# キー = スライド番号 / 値 = そのページが根拠にしている REF 番号。
# check_refs.py が公的資料の更新を検知したとき、ここを逆引きして
# 「どの教材の何ページを改訂すべきか」を特定する。
# 出典の文字列を変更したら、この対応表も必ず更新する。
# ============================================================
SLIDE_REF_MAP = {
    5:  ["REF-011"],
    6:  ["REF-006", "REF-012"],
    7:  ["REF-001"],
    8:  ["REF-001", "REF-004", "REF-005", "REF-006", "REF-007", "REF-009"],
    9:  ["REF-001"],
    10: ["REF-001"],
    11: ["REF-001", "REF-005"],
    12: ["REF-001"],
    13: ["REF-005"],
    14: ["REF-002"],
    15: ["REF-004"],
    16: ["REF-006"],
    17: ["REF-007"],
    18: ["REF-008"],
    19: ["REF-009"],
    21: ["REF-003"],
}
# 実際に出力された「ページ番号 → 出典文字列 / REF番号」を記録する
SLIDE_REFS = {}


# ============================================================
# 基本ヘルパ
# ============================================================
def P(name):
    """写真パス解決（新規生成分 → 既存 pdpa101_photos の順）"""
    for d in (NEW_PHOTOS, OLD_PHOTOS):
        for ext in (".jpg", ".jpeg", ".png"):
            p = os.path.join(d, name + ext)
            if os.path.exists(p):
                return p
    raise FileNotFoundError("photo not found: " + name)


def _apply_ea(run, font_name):
    """日本語（East Asian）フォントも同じ書体に固定する"""
    rPr = run._r.get_or_add_rPr()
    # DrawingML の子要素順は latin → ea → cs のため、順番を守って挿入する
    anchor = rPr.find(qn("a:latin"))
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = parse_xml(
                '<%s xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>' % tag)
            if anchor is not None:
                anchor.addnext(el)
            else:
                rPr.append(el)
        el.set("typeface", font_name)
        anchor = el


def add_slide():
    return prs.slides.add_slide(BLANK)


def set_bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def rect(slide, x, y, w, h, fill=None, line=None, radius=None, line_w=1.25):
    st = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(st, int(x), int(y), int(w), int(h))
    if radius:
        try:
            shp.adjustments[0] = radius
        except Exception:
            pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    shp.text_frame.word_wrap = True
    return shp


def tbox(slide, x, y, w, h, text, size=SZ_BODY, color=TEXT, bold=False,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, ls=1.25, space_after=0):
    tb = slide.shapes.add_textbox(int(x), int(y), int(w), int(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = ls
        if space_after:
            p.space_after = Pt(space_after)
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.name = FONT
        r.font.color.rgb = color
        _apply_ea(r, FONT)
    return tb


def pic_fill(slide, path, x, y, w, h):
    """指定枠を埋めるようにセンタークロップして写真を配置"""
    x, y, w, h = int(x), int(y), int(w), int(h)
    iw, ih = Image.open(path).size
    pic = slide.shapes.add_picture(path, x, y, width=w, height=h)
    tr, sr = w / h, iw / ih
    if sr > tr:
        c = (1 - tr / sr) / 2
        pic.crop_left = pic.crop_right = c
    else:
        c = (1 - sr / tr) / 2
        pic.crop_top = pic.crop_bottom = c
    return pic


def framed_pic(slide, path, x, y, w, h, frame=WHITE, fw=3.0):
    pic_fill(slide, path, x, y, w, h)
    b = rect(slide, x, y, w, h, fill=None, line=frame, line_w=fw)
    return b


def translucent(shape, alpha_pct):
    """図形に透明度を与える（0=不透明, 100=透明）"""
    srgb = shape.fill._xPr.find(
        ".//{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr")
    el = srgb.makeelement(
        "{http://schemas.openxmlformats.org/drawingml/2006/main}alpha",
        {"val": str(int((100 - alpha_pct) * 1000))})
    srgb.append(el)


# ---------------- 帯・出典 ----------------
def title_band(slide, text, band=NAVY, txt=WHITE, size=SZ_TITLE, kicker=None,
               kicker_color=None):
    rect(slide, 0, 0, SW, BAND_H, fill=band)
    if kicker:
        tbox(slide, MARGIN, Inches(0.16), CW, Inches(0.32), kicker,
             size=SZ_NOTE, color=kicker_color or ORANGE, bold=True)
        tbox(slide, MARGIN, Inches(0.52), CW, Inches(0.66), text,
             size=size, color=txt, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    else:
        tbox(slide, MARGIN, 0, CW, BAND_H, text, size=size, color=txt,
             bold=True, anchor=MSO_ANCHOR.MIDDLE)
    # ネイビー帯の下端にオレンジのアクセントライン
    rect(slide, 0, BAND_H - Pt(5), SW, Pt(5), fill=ORANGE)


def orange_head(slide, x, y, w, text, h=Inches(0.52), size=SZ_NOTE_L):
    """見出し＝オレンジ帯"""
    rect(slide, x, y, w, h, fill=ORANGE)
    tbox(slide, x + Inches(0.18), y, w - Inches(0.36), h, text,
         size=size, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)


def alert_icon(slide, x, y, d=Inches(0.62)):
    """重要＝赤い「！」アイコン"""
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, int(x), int(y), int(d), int(d))
    c.fill.solid(); c.fill.fore_color.rgb = RED
    c.line.fill.background(); c.shadow.inherit = False
    tf = c.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = "！"
    r.font.size = Pt(24); r.font.bold = True; r.font.color.rgb = WHITE
    r.font.name = FONT; _apply_ea(r, FONT)
    return c


def num_badge(slide, x, y, n, d=Inches(0.56), fill=ORANGE, color=NAVY):
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, int(x), int(y), int(d), int(d))
    c.fill.solid(); c.fill.fore_color.rgb = fill
    c.line.fill.background(); c.shadow.inherit = False
    tf = c.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.word_wrap = False          # 2桁の番号が円内で折り返さないようにする
    tf.margin_left = tf.margin_right = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = str(n)
    r.font.size = Pt(20 if len(str(n)) < 2 else 15)
    r.font.bold = True; r.font.color.rgb = color
    r.font.name = FONT; _apply_ea(r, FONT)
    return c


def source_band(slide, source, dark=False, page=True):
    """出典＝ページ下部・18pt（協会標準）。あわせて REF 番号を記録する"""
    _page["n"] += 1
    n = _page["n"]
    SLIDE_REFS[n] = {"source": source, "refs": SLIDE_REF_MAP.get(n, [])}
    bg = NAVY_CARD if dark else LGRAY
    fg = CREAM_MUTED if dark else MUTED
    rect(slide, 0, SRC_Y, SW, SRC_H, fill=bg)
    tbox(slide, MARGIN, SRC_Y, CW - Inches(1.1), SRC_H, source,
         size=SZ_NOTE, color=fg, ls=1.15, anchor=MSO_ANCHOR.MIDDLE)
    if page:
        tbox(slide, SW - MARGIN - Inches(0.9), SRC_Y, Inches(0.9), SRC_H,
             str(_page["n"]), size=SZ_NOTE, color=fg, bold=True,
             align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)


def bullet_rows(slide, items, y=None, x=None, w=None, row_h=None, gap=None,
                size=SZ_BODY, numbered=True, fill=WHITE, line=BORDER,
                color=TEXT, badge_fill=ORANGE, badge_color=NAVY):
    """縦積みの箇条書きカード（1行1メッセージ）"""
    x = MARGIN if x is None else x
    w = CW if w is None else w
    n = len(items)
    gap = Inches(0.16) if gap is None else gap
    if row_h is None:
        row_h = int((CH - gap * (n - 1)) / n)
    y = CY if y is None else y
    for i, t in enumerate(items, start=1):
        rect(slide, x, y, w, row_h, fill=fill, line=line, radius=0.10)
        tx = x + Inches(0.35)
        if numbered:
            num_badge(slide, x + Inches(0.32), y + (row_h - Inches(0.56)) / 2, i,
                      fill=badge_fill, color=badge_color)
            tx = x + Inches(1.12)
        tbox(slide, tx, y, w - (tx - x) - Inches(0.35), row_h, t,
             size=size, color=color, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.2)
        y += row_h + gap


# ============================================================
# 1. 表紙
# ============================================================
s = add_slide()
set_bg(s, NAVY)
pic_fill(s, P("cover_senior_pet"), 0, 0, SW, SH)
ov = rect(s, 0, 0, SW, SH, fill=NAVY)
translucent(ov, 62)
ov2 = rect(s, 0, Inches(2.55), SW, Inches(4.95), fill=NAVY)
translucent(ov2, 10)

s.shapes.add_picture(P("logo"), MARGIN, Inches(0.5), height=Inches(1.25))
tbox(s, MARGIN, Inches(2.85), CW, Inches(0.5),
     "一般社団法人 ペット防災アドバイザー協会", size=SZ_BODY, color=WHITE, bold=True)
tbox(s, MARGIN, Inches(3.45), CW, Inches(0.95),
     "公式教育システム", size=54, color=WHITE, bold=True)
tbox(s, MARGIN, Inches(4.55), CW, Inches(0.4),
     "Pet Disaster Preparedness Advisor Association", size=SZ_NOTE, color=CREAM_MUTED)
rect(s, MARGIN, Inches(5.15), Inches(4.9), Inches(0.66), fill=ORANGE)
tbox(s, MARGIN, Inches(5.15), Inches(4.9), Inches(0.66),
     "備える・守る・つなぐ", size=SZ_BODY, color=NAVY, bold=True,
     align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
tbox(s, MARGIN, Inches(6.35), CW, Inches(0.75),
     "教材コード PDPA-100　Ver.1.0　制定 2026年7月31日\n"
     "監修：一般社団法人 ペット防災アドバイザー協会",
     size=SZ_NOTE, color=CREAM_MUTED, ls=1.25)
_page["n"] += 1

# ============================================================
# 2. 本日の内容
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "本日の内容", kicker="AGENDA")
pw = Inches(4.3)
framed_pic(s, P("online_lecture"), SW - MARGIN - pw, CY, pw, CH)
items = [
    "協会の理念と行動指針",
    "教材の公的根拠を確認する",
    "全12講座カリキュラムの全体像",
    "教材制作基準と品質基準",
    "認定制度と今後の展開",
]
bullet_rows(s, items, w=CW - pw - Inches(0.45))
source_band(s, "出典：一般社団法人 ペット防災アドバイザー協会 公式マスタープロジェクト Ver.1.0")

# ============================================================
# 3. 協会理念
# ============================================================
s = add_slide()
set_bg(s, NAVY)
pic_fill(s, P("advisor_role"), 0, 0, SW, SH)
ov = rect(s, 0, 0, SW, SH, fill=NAVY)
translucent(ov, 30)
tbox(s, MARGIN, Inches(1.35), CW, Inches(0.45), "協会理念", size=SZ_NOTE_L,
     color=ORANGE, bold=True, align=PP_ALIGN.CENTER)
tbox(s, Inches(1.3), Inches(2.15), SW - Inches(2.6), Inches(2.9),
     "人とペットの命を守る知識を\n地域へ広げ、\n災害に備える文化を育てる。",
     size=SZ_TITLE_L, color=WHITE, bold=True, align=PP_ALIGN.CENTER,
     anchor=MSO_ANCHOR.MIDDLE, ls=1.45)
rect(s, (SW - Inches(3.2)) / 2, Inches(5.35), Inches(3.2), Pt(5), fill=ORANGE)
source_band(s, "出典：協会公式教育プログラム Ver.1.0「基本理念」", dark=True)

# ============================================================
# 4. 行動指針「備える・守る・つなぐ」
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "行動指針「備える・守る・つなぐ」", kicker="OUR PRINCIPLE")
cards = [
    ("備える", "supplies_stockpile", "日頃から人とペットの命を守る準備をする"),
    ("守る", "evacuation_walk", "災害時に落ち着いて行動し、安全を確保する"),
    ("つなぐ", "community_seminar", "地域・行政・専門職・飼い主を結び、次の世代へつなぐ"),
]
cw = int((CW - Inches(0.4) * 2) / 3)
x = MARGIN
for head, photo, body in cards:
    rect(s, x, CY, cw, CH, fill=WHITE, line=BORDER, radius=0.05)
    pic_fill(s, P(photo), x, CY, cw, Inches(2.05))
    orange_head(s, x, CY + Inches(2.05), cw, head, h=Inches(0.60), size=SZ_BODY)
    tbox(s, x + Inches(0.28), CY + Inches(2.75), cw - Inches(0.56), Inches(2.0),
         body, size=SZ_NOTE_L, color=TEXT, ls=1.4, anchor=MSO_ANCHOR.MIDDLE)
    x += cw + Inches(0.4)
source_band(s, "出典：協会行動指針（協会推奨）／公式教育プログラム Ver.1.0")

# ============================================================
# 5. 日本は世界有数の災害大国
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "日本は世界有数の災害大国", kicker="RISK IN JAPAN")
pw = Inches(4.6)
framed_pic(s, P("disaster_earthquake"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
tbox(s, MARGIN, CY, lw, Inches(0.5), "世界全体に占める日本の割合", size=SZ_BODY,
     color=NAVY, bold=True)
stats = [("0.25%", "国土面積"), ("20.8%", "M6以上の地震回数"),
         ("7.0%", "活火山数"), ("18.3%", "災害被害額")]
gy = CY + Inches(0.72)
bw = int((lw - Inches(0.25)) / 2)
bh = Inches(1.95)
for i, (val, lab) in enumerate(stats):
    bx = MARGIN + (i % 2) * (bw + Inches(0.25))
    by = gy + (i // 2) * (bh + Inches(0.25))
    rect(s, bx, by, bw, bh, fill=LGRAY, line=BORDER, radius=0.08)
    tbox(s, bx, by + Inches(0.22), bw, Inches(0.85), val, size=44, color=NAVY,
         bold=True, align=PP_ALIGN.CENTER)
    tbox(s, bx, by + Inches(1.20), bw, Inches(0.5), lab, size=SZ_NOTE_L,
         color=MUTED, align=PP_ALIGN.CENTER)
source_band(s, "出典：内閣府『平成18年版 防災白書』第1部第1章「災害を受けやすい日本の国土」")

# ============================================================
# 6. 日本で起こる主な自然災害
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "日本で起こる主な自然災害", kicker="NATURAL HAZARDS")
haz = [("disaster_earthquake", "地震"), ("disaster_typhoon", "台風"),
       ("disaster_flood", "豪雨・洪水"), ("disaster_landslide", "土砂災害"),
       ("disaster_volcano", "火山"), ("disaster_snow", "豪雪")]
cols, gapx, gapy = 3, Inches(0.30), Inches(0.32)
cw = int((CW - gapx * (cols - 1)) / cols)
ch = Inches(1.72)
for i, (fn, lab) in enumerate(haz):
    cx = MARGIN + (i % cols) * (cw + gapx)
    cy = CY + (i // cols) * (ch + gapy + Inches(0.52))
    framed_pic(s, P(fn), cx, cy, cw, ch)
    rect(s, cx, cy + ch, cw, Inches(0.52), fill=NAVY)
    tbox(s, cx, cy + ch, cw, Inches(0.52), lab, size=SZ_BODY, color=WHITE,
         bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
source_band(s, "出典：気象庁「防災気象情報」／内閣府 防災情報のページ")

# ============================================================
# 7. 災害で困るのは人だけではありません
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "災害で困るのは人だけではありません", kicker="ALL COMPANION ANIMALS")
pets = [("pet_dog", "犬"), ("pet_cat", "猫"), ("pet_bird", "鳥"),
        ("pet_rabbit", "うさぎ"), ("pet_ferret", "フェレット"), ("pet_reptile", "爬虫類")]
cols, gapx = 6, Inches(0.22)
cw = int((CW - gapx * (cols - 1)) / cols)
py = CY + Inches(0.12)
ph = Inches(2.80)
for i, (fn, lab) in enumerate(pets):
    cx = MARGIN + i * (cw + gapx)
    framed_pic(s, P(fn), cx, py, cw, ph)
    rect(s, cx, py + ph - Inches(0.52), cw, Inches(0.52), fill=NAVY)
    tbox(s, cx, py + ph - Inches(0.52), cw, Inches(0.52), lab, size=SZ_NOTE_L,
         color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
rect(s, MARGIN, py + ph + Inches(0.35), CW, Inches(1.05), fill=LGRAY,
     line=BORDER, radius=0.06)
tbox(s, MARGIN + Inches(0.4), py + ph + Inches(0.35), CW - Inches(0.8), Inches(1.05),
     "協会は犬・猫だけでなく、鳥・小動物・爬虫類の防災も講座に含めます。",
     size=SZ_BODY, color=NAVY, bold=True, align=PP_ALIGN.CENTER,
     anchor=MSO_ANCHOR.MIDDLE)
source_band(s, "出典：環境省『人とペットの災害対策ガイドライン』（平成30年3月発行）")

# ============================================================
# 8. 教材の根拠とする公的機関
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "教材の根拠とする公的機関", kicker="OFFICIAL SOURCES")
orgs = [("環境省", "人とペットの災害対策ガイドライン"),
        ("内閣府（防災担当）", "避難情報／避難所運営ガイドライン"),
        ("気象庁", "防災気象情報・警戒レベル"),
        ("総務省消防庁", "応急手当・避難行動"),
        ("国土交通省・国土地理院", "ハザードマップポータルサイト")]
n = len(orgs)
gap = Inches(0.14)
rh = int((CH - gap * (n - 1)) / n)
y = CY
for i, (name, use) in enumerate(orgs, start=1):
    rect(s, MARGIN, y, CW, rh, fill=LGRAY, line=BORDER, radius=0.12)
    rect(s, MARGIN, y, Inches(0.13), rh, fill=ORANGE)
    tbox(s, MARGIN + Inches(0.45), y, Inches(4.6), rh, name, size=SZ_BODY,
         color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, MARGIN + Inches(5.2), y, CW - Inches(5.6), rh, use, size=SZ_NOTE_L,
         color=TEXT, anchor=MSO_ANCHOR.MIDDLE)
    y += rh + gap
source_band(s, "出典：協会 教材制作ガイドライン「品質基準」②行政資料（Ver.1.0）")

# ============================================================
# 9. 環境省「人とペットの災害対策ガイドライン」
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "環境省の公式ガイドラインが土台です", kicker="THE FOUNDATION")
pw = Inches(4.5)
framed_pic(s, P("shelter_pet_cage"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
orange_head(s, MARGIN, CY, lw, "人とペットの災害対策ガイドライン")
tbox(s, MARGIN, CY + Inches(0.78), lw, Inches(3.9),
     "発行：環境省 自然環境局\n"
     "　　　総務課 動物愛護管理室\n"
     "発行年月：平成30年3月\n\n"
     "平成25年6月策定の「災害時における\n"
     "ペットの救護対策ガイドライン」を、\n"
     "平成28年熊本地震の検証を踏まえ改訂。",
     size=SZ_BODY, color=TEXT, ls=1.2)
source_band(s, "出典：環境省『人とペットの災害対策ガイドライン』（平成30年3月発行）")

# ============================================================
# 10. 「同行避難」とは
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "「同行避難」とは", kicker="KEY TERM 1")
pw = Inches(4.2)
framed_pic(s, P("evacuation_walk"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
c = rect(s, MARGIN, CY, lw, Inches(2.6), fill=NAVY, radius=0.05)
tbox(s, MARGIN + Inches(0.35), CY + Inches(0.2), lw - Inches(0.7), Inches(2.2),
     "飼い主が飼養しているペットを\n"
     "同行し、指定緊急避難場所等まで\n"
     "避難すること",
     size=28, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.45)
tbox(s, MARGIN, CY + Inches(2.9), lw, Inches(1.9),
     "ペットとともに安全な場所まで\n避難する「行動」を指す言葉です。",
     size=SZ_BODY, color=TEXT, ls=1.45)
source_band(s, "出典：環境省『人とペットの災害対策ガイドライン』（平成30年3月）総説")

# ============================================================
# 11. 「同行避難」と「同伴避難」の違い
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "「同行避難」と「同伴避難」の違い", kicker="KEY TERM 2")
cw = int((CW - Inches(0.4)) / 2)
pairs = [("同行避難", "evacuation_walk", "安全な場所まで避難する\n「行動」",
          "環境省『人とペットの災害対策ガイドライン』", NAVY, WHITE),
         ("同伴避難", "shelter_pet_cage", "避難所でペットを飼養管理する\n「状態」",
          "内閣府『避難所運営ガイドライン』", ORANGE, NAVY)]
x = MARGIN
for head, photo, body, ref, bc, tc in pairs:
    rect(s, x, CY, cw, CH, fill=WHITE, line=BORDER, radius=0.04)
    pic_fill(s, P(photo), x, CY, cw, Inches(1.85))
    rect(s, x, CY + Inches(1.85), cw, Inches(0.62), fill=bc)
    tbox(s, x, CY + Inches(1.85), cw, Inches(0.62), head, size=SZ_BODY_L,
         color=tc, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, x + Inches(0.3), CY + Inches(2.68), cw - Inches(0.6), Inches(1.3),
         body, size=SZ_BODY, color=TEXT, bold=True, ls=1.4)
    tbox(s, x + Inches(0.3), CY + Inches(4.15), cw - Inches(0.6), Inches(0.6),
         ref, size=SZ_NOTE, color=MUTED, ls=1.15)
    x += cw + Inches(0.4)
source_band(s, "出典：環境省『人とペットの災害対策ガイドライン』／内閣府『避難所運営ガイドライン』")

# ============================================================
# 12. 【重要】同行避難＝同室飼養ではありません
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "同行避難＝同室で飼えるとは限りません", kicker="重要",
           kicker_color=ORANGE)
pw = Inches(3.9)
framed_pic(s, P("shelter_pet_cage"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
alert_icon(s, MARGIN, CY + Inches(0.05))
tbox(s, MARGIN + Inches(0.85), CY, lw - Inches(0.85), Inches(0.72),
     "誤解が最も多いポイント", size=SZ_BODY, color=RED, bold=True,
     anchor=MSO_ANCHOR.MIDDLE)
rect(s, MARGIN, CY + Inches(0.90), lw, Inches(4.0), fill=LGRAY, line=BORDER,
     radius=0.05)
tbox(s, MARGIN + Inches(0.32), CY + Inches(1.10), lw - Inches(0.64), Inches(3.6),
     "同行避難は、避難所等でペットを\n同室で飼養管理することを\n意味しません。\n\n"
     "飼養環境は避難所等によって異なり、\n受入れ条件は自治体・避難所ごとに\n必ず確認します。",
     size=SZ_BODY, color=TEXT, ls=1.18)
source_band(s, "出典：環境省『人とペットの災害対策ガイドライン』（平成30年3月）総説")

# ============================================================
# 13. 避難所でのペット受入れは国の方針
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "避難所のペット受入れは国の方針", kicker="NATIONAL POLICY")
pw = Inches(4.0)
framed_pic(s, P("location_townhall"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
rows = [("令和2年", "防災基本計画の修正",
         "避難所におけるペットのためのスペース確保等、\n受入れの促進を図る"),
        ("令和6年12月", "避難生活における良好な生活環境の\n確保に向けた取組指針（改定）",
         "平時から関係部局で認識を共有し、\n受入れ体制の構築と周知を図る")]
y = CY
rh = int((CH - Inches(0.25)) / 2)
for tag, name, body in rows:
    rect(s, MARGIN, y, lw, rh, fill=WHITE, line=BORDER, radius=0.05)
    rect(s, MARGIN, y, lw, Inches(0.52), fill=NAVY)
    tbox(s, MARGIN + Inches(0.25), y, lw - Inches(0.5), Inches(0.52), tag,
         size=SZ_NOTE_L, color=ORANGE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, MARGIN + Inches(0.25), y + Inches(0.68), lw - Inches(0.5), Inches(0.8),
         name, size=SZ_NOTE_L, color=NAVY, bold=True, ls=1.2)
    tbox(s, MARGIN + Inches(0.25), y + Inches(1.55), lw - Inches(0.5), Inches(0.9),
         body, size=SZ_NOTE_L, color=TEXT, ls=1.3)
    y += rh + Inches(0.25)
source_band(s, "出典：内閣府（防災担当）『避難生活における良好な生活環境の確保に向けた取組指針』"
               "（平成25年8月／令和6年12月改定）、防災基本計画（令和2年修正）")

# ============================================================
# 14. ガイドライン改訂の最新動向
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "ガイドラインは今、改訂作業中です", kicker="LATEST (2026)")
pw = Inches(4.2)
framed_pic(s, P("noto_recovery"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
orange_head(s, MARGIN, CY, lw, "改訂の背景と主な論点")
tbox(s, MARGIN, CY + Inches(0.78), lw, Inches(2.75),
     "令和6年能登半島地震の対応検証と、\n防災基本計画の修正等を踏まえた改訂。\n\n"
     "論点：関係部局の連携、\n避難所のゾーニング、分散避難への支援",
     size=SZ_BODY, color=TEXT, ls=1.2)
rect(s, MARGIN, CY + Inches(3.65), lw, Inches(1.05), fill=LGRAY, line=BORDER,
     radius=0.06)
tbox(s, MARGIN + Inches(0.28), CY + Inches(3.65), lw - Inches(0.56), Inches(1.05),
     "協会推奨：改訂版の公表後に\n該当ページを Ver.更新する", size=SZ_NOTE_L,
     color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.25)
source_band(s, "出典：環境省 報道発表（令和8年6月8日）「『人とペットの災害対策ガイドライン』の"
               "改訂案に係る意見の募集（パブリック・コメント）について」意見募集：令和8年6月8日〜26日")

# ============================================================
# 15. 警戒レベルは5段階
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "避難情報の警戒レベルは5段階", kicker="ALERT LEVELS")
levels = [("5", "緊急安全確保", "命の危険。直ちに安全確保", ORANGE),
          ("4", "避難指示", "危険な場所から全員避難", ORANGE),
          ("3", "高齢者等避難", "高齢者等は避難／ペット連れは早めに", ORANGE),
          ("2", "自らの避難行動を確認", "避難経路・避難先を確認", LGRAY),
          ("1", "災害への心構えを高める", "最新情報に注意する", LGRAY)]
n = len(levels)
gap = Inches(0.12)
rh = int((CH - gap * (n - 1)) / n)
y = CY
for lv, name, act, bc in levels:
    dark = bc is ORANGE
    rect(s, MARGIN, y, CW, rh, fill=LGRAY if not dark else WHITE,
         line=BORDER, radius=0.10)
    rect(s, MARGIN, y, Inches(1.35), rh, fill=NAVY if dark else BORDER)
    tbox(s, MARGIN, y, Inches(1.35), rh, lv, size=SZ_BODY_L,
         color=ORANGE if dark else MUTED, bold=True, align=PP_ALIGN.CENTER,
         anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, MARGIN + Inches(1.65), y, Inches(4.3), rh, name, size=SZ_BODY,
         color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, MARGIN + Inches(6.15), y, CW - Inches(6.5), rh, act, size=SZ_NOTE_L,
         color=TEXT, anchor=MSO_ANCHOR.MIDDLE)
    y += rh + gap
source_band(s, "出典：内閣府（防災担当）『避難情報に関するガイドライン』（令和8年3月改定）")

# ============================================================
# 16. 防災気象情報が生まれ変わりました
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "防災気象情報が生まれ変わりました", kicker="2026年5月29日 運用開始")
pw = Inches(4.2)
framed_pic(s, P("disaster_typhoon"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
pts = ["情報名称に警戒レベルの数字がつきます\n（例：レベル3大雨警報）",
       "レベル4相当の情報として「危険警報」を運用",
       "河川氾濫に「レベル5氾濫特別警報」を新設"]
y = CY
rh = int((CH - Inches(0.2) * 2) / 3)
for i, t in enumerate(pts, start=1):
    rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.08)
    num_badge(s, MARGIN + Inches(0.3), y + (rh - Inches(0.56)) / 2, i)
    tbox(s, MARGIN + Inches(1.1), y, lw - Inches(1.45), rh, t, size=SZ_NOTE_L,
         color=TEXT, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.3)
    y += rh + Inches(0.2)
source_band(s, "出典：気象庁「新たな防災気象情報について（令和8年〜）」"
               "令和8年5月29日運用開始")

# ============================================================
# 17. ハザードマップ
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "ハザードマップで自宅の危険を知る", kicker="HAZARD MAP")
pw = Inches(4.3)
framed_pic(s, P("hazard_map_check"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
maps = [("重ねるハザードマップ", "洪水・土砂災害・津波・高潮などの\nリスク情報を地図に重ねて表示"),
        ("わがまちハザードマップ", "市町村が作成したハザードマップを\n全国から検索できる")]
y = CY
rh = int((CH - Inches(0.3)) / 2)
for name, body in maps:
    rect(s, MARGIN, y, lw, rh, fill=WHITE, line=BORDER, radius=0.05)
    orange_head(s, MARGIN, y, lw, name, h=Inches(0.56), size=SZ_BODY)
    tbox(s, MARGIN + Inches(0.28), y + Inches(0.78), lw - Inches(0.56),
         rh - Inches(1.0), body, size=SZ_NOTE_L, color=TEXT, ls=1.35)
    y += rh + Inches(0.3)
source_band(s, "出典：国土交通省・国土地理院「ハザードマップポータルサイト」"
               "https://disaportal.gsi.go.jp/")

# ============================================================
# 18. マイクロチップ制度
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "マイクロチップは法律上の身元表示", kicker="MICROCHIP")
pw = Inches(4.3)
framed_pic(s, P("microchip_vet"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
mc = ["令和4年6月1日施行の改正法で、\n販売業者に装着・登録を義務化",
      "譲り受けた飼い主は30日以内に変更登録",
      "既に飼っている犬猫の装着は努力義務"]
y = CY
rh = int((CH - Inches(0.2) * 2) / 3)
for i, t in enumerate(mc, start=1):
    rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.08)
    num_badge(s, MARGIN + Inches(0.3), y + (rh - Inches(0.56)) / 2, i)
    tbox(s, MARGIN + Inches(1.1), y, lw - Inches(1.45), rh, t, size=SZ_NOTE_L,
         color=TEXT, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.3)
    y += rh + Inches(0.2)
source_band(s, "出典：環境省「犬と猫のマイクロチップ情報登録」"
               "（動物の愛護及び管理に関する法律／指定登録機関：公益社団法人 日本獣医師会）")

# ============================================================
# 19. 人の命を守る技術も学ぶ
# ============================================================
s = add_slide()
set_bg(s, NAVY)
title_band(s, "人が生き残らなければ、ペットも救えない", kicker="FIRST AID",
           size=SZ_TITLE)
pw = Inches(4.3)
framed_pic(s, P("first_aid_cpr"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
rect(s, MARGIN, CY, lw, CH, fill=NAVY_CARD, radius=0.05)
tbox(s, MARGIN + Inches(0.32), CY + Inches(0.3), lw - Inches(0.64), CH - Inches(0.6),
     "本講座は第3回・第4回で\n人の防災を重点的に学びます。\n\n"
     "消防庁の「応急手当WEB講習」で\n基礎知識を学べます。\n\n"
     "地域によっては、受講証明の提示で\n救命講習の実技時間が短縮されます。",
     size=SZ_BODY, color=WHITE, ls=1.2)
source_band(s, "出典：総務省消防庁 応急手当WEB講習／各消防本部 普通救命講習", dark=True)

# ============================================================
# 20. ケーススタディ（オレンジ背景）
# ============================================================
s = add_slide()
set_bg(s, ORANGE)
pic_fill(s, P("case_study_night"), 0, 0, SW, Inches(2.6))
ov = rect(s, 0, 0, SW, Inches(2.6), fill=NAVY)
translucent(ov, 45)
tbox(s, MARGIN, Inches(0.55), CW, Inches(0.4), "ケーススタディ（毎回実施）",
     size=SZ_NOTE_L, color=ORANGE, bold=True)
tbox(s, MARGIN, Inches(1.15), CW, Inches(0.9), "あなたならどうしますか？",
     size=SZ_TITLE_L, color=WHITE, bold=True)
rect(s, MARGIN, Inches(3.0), CW, Inches(2.05), fill=WHITE, radius=0.04)
tbox(s, MARGIN + Inches(0.4), Inches(3.0), CW - Inches(0.8), Inches(2.05),
     "深夜2時、震度6強の地震が発生。停電。\n"
     "犬は吠え続け、猫は押し入れに隠れています。",
     size=SZ_BODY_L, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.5)
tbox(s, MARGIN, Inches(5.35), CW, Inches(0.9),
     "最初に何をしますか？　正解を一つに決めず、複数の視点を共有します。",
     size=SZ_BODY, color=NAVY, bold=True, align=PP_ALIGN.CENTER)
source_band(s, "出典：協会オリジナル事例（協会推奨）／全講座で毎回実施")

# ============================================================
# 21. ワーク（緑帯）
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "ワーク：5〜10分・毎回実施", band=GREEN, kicker="WORK",
           kicker_color=WHITE)
pw = Inches(3.9)
framed_pic(s, P("workbook_writing"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
qs = ["自宅のハザードマップを確認しましたか？",
      "ペット用の備蓄は何日分ありますか？",
      "避難先までの経路を歩きましたか？"]
y = CY
rh = int((CH - Inches(0.2) * 2) / 3)
for i, q in enumerate(qs, start=1):
    rect(s, MARGIN, y, lw, rh, fill=WHITE, line=GREEN, radius=0.08, line_w=2.0)
    tbox(s, MARGIN + Inches(0.3), y, Inches(1.0), rh, "Q%d" % i, size=SZ_BODY,
         color=GREEN, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, MARGIN + Inches(1.3), y, lw - Inches(1.6), rh, q, size=SZ_NOTE_L,
         color=TEXT, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.3)
    y += rh + Inches(0.2)
source_band(s, "出典：環境省『災害、あなたとペットは大丈夫？"
               "人とペットの災害対策ガイドライン＜一般飼い主編＞』（平成30年）")

# ============================================================
# 22. 教育体系は2段階
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "教育体系は2段階", kicker="CERTIFICATION SYSTEM")
pw = Inches(3.9)
framed_pic(s, P("instructor_teaching"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
lv = [("レベル1", "認定ペット防災アドバイザー", "全12講座＋実技2講座\n＋卒業試験＋Zoom面接", NAVY, WHITE),
      ("レベル2", "認定講師", "認定取得後1年以上の活動実績\nで受験資格を付与", ORANGE, NAVY)]
y = CY
rh = int((CH - Inches(0.32)) / 2)
for tag, name, body, bc, tc in lv:
    rect(s, MARGIN, y, lw, rh, fill=bc, radius=0.05)
    tbox(s, MARGIN + Inches(0.32), y + Inches(0.18), lw - Inches(0.64), Inches(0.42),
         tag, size=SZ_NOTE_L, color=tc, bold=True)
    tbox(s, MARGIN + Inches(0.32), y + Inches(0.65), lw - Inches(0.64), Inches(0.6),
         name, size=SZ_BODY_L, color=tc, bold=True)
    tbox(s, MARGIN + Inches(0.32), y + Inches(1.38), lw - Inches(0.64), Inches(0.9),
         body, size=SZ_NOTE_L, color=tc, ls=1.3)
    y += rh + Inches(0.32)
source_band(s, "出典：協会 資格制度規程 Ver.1.0（協会推奨）")

# ============================================================
# 23-24. 全12講座カリキュラム
# ============================================================
def curriculum(titles, head, start_no, photo, src):
    s = add_slide()
    set_bg(s, WHITE)
    title_band(s, head, kicker="CURRICULUM")
    pw = Inches(3.6)
    framed_pic(s, P(photo), SW - MARGIN - pw, CY, pw, CH)
    lw = CW - pw - Inches(0.45)
    n = len(titles)
    gap = Inches(0.13)
    rh = int((CH - gap * (n - 1)) / n)
    y = CY
    for i, t in enumerate(titles):
        rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.12)
        num_badge(s, MARGIN + Inches(0.24), y + (rh - Inches(0.56)) / 2,
                  start_no + i)
        tbox(s, MARGIN + Inches(1.02), y, lw - Inches(1.3), rh, t,
             size=SZ_NOTE_L, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.2)
        y += rh + gap
    source_band(s, src)


curriculum(["ペット防災アドバイザーという新しい役割",
            "日本で起こる自然災害を知る",
            "人の防災①　家庭でできる防災",
            "人の防災②　外出先で災害が起きたら",
            "ペット防災の基礎①",
            "ペット防災の基礎②"],
           "全12講座カリキュラム（第1回〜第6回）", 1, "supplies_stockpile",
           "出典：協会公式教育プログラム Ver.1.0 カリキュラム設計書（PDPA-101〜106）")

curriculum(["犬の防災①（災害前）",
            "犬の防災②（避難所生活）",
            "猫の防災①（事前の備え）",
            "猫の防災②（避難生活）",
            "鳥・小動物・爬虫類の防災",
            "ペット防災アドバイザーとして活動する"],
           "全12講座カリキュラム（第7回〜第12回）", 7, "crate_training",
           "出典：協会公式教育プログラム Ver.1.0 カリキュラム設計書（PDPA-107〜112）")

# ============================================================
# 25. 特別講座（オンライン実技）
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "特別講座（オンライン実技）", kicker="PRACTICAL TRAINING")
cw = int((CW - Inches(0.4)) / 2)
sp = [("PDPA-D201", "犬の防災トレーニング", "crate_training",
       "クレート／ハウス／待て／呼び戻し／リードコントロール"),
      ("PDPA-C202", "猫の防災トレーニング", "cat_carrier",
       "キャリー練習／ケージ生活／爪切り／投薬／捕獲")]
x = MARGIN
for code, name, photo, body in sp:
    rect(s, x, CY, cw, CH, fill=WHITE, line=BORDER, radius=0.04)
    pic_fill(s, P(photo), x, CY, cw, Inches(2.1))
    tbox(s, x + Inches(0.28), CY + Inches(2.3), cw - Inches(0.56), Inches(0.36),
         code, size=SZ_NOTE, color=ORANGE_TXT, bold=True)
    tbox(s, x + Inches(0.28), CY + Inches(2.72), cw - Inches(0.56), Inches(0.55),
         name, size=SZ_BODY_L, color=NAVY, bold=True)
    tbox(s, x + Inches(0.28), CY + Inches(3.5), cw - Inches(0.56), Inches(1.2),
         body, size=SZ_NOTE_L, color=TEXT, ls=1.35)
    x += cw + Inches(0.4)
source_band(s, "出典：協会公式教育プログラム Ver.1.0（特別講座2講座・オンライン実技）")

# ============================================================
# 26. 1講義90分は15分×6ブロック
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "1講義90分は「15分×6ブロック」", kicker="LESSON DESIGN")
blocks = ["導入", "講義①", "動画", "講義②", "ワーク", "まとめ"]
bw = int((CW - Inches(0.18) * 5) / 6)
x = MARGIN
for i, b in enumerate(blocks):
    fill = NAVY if i % 2 == 0 else ORANGE
    tc = WHITE if i % 2 == 0 else NAVY
    rect(s, x, CY + Inches(0.25), bw, Inches(1.5), fill=fill, radius=0.10)
    tbox(s, x, CY + Inches(0.25), bw, Inches(1.5), b, size=SZ_BODY, color=tc,
         bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, x, CY + Inches(1.88), bw, Inches(0.35), "15分", size=SZ_NOTE,
         color=MUTED, align=PP_ALIGN.CENTER)
    x += bw + Inches(0.18)
pw = Inches(4.0)
framed_pic(s, P("online_lecture"), MARGIN, CY + Inches(2.35), pw, Inches(2.5))
tbox(s, MARGIN + pw + Inches(0.5), CY + Inches(2.35), CW - pw - Inches(0.5),
     Inches(2.5),
     "一定時間ごとに学習のリズムを変え、\nオンラインでも集中力を維持します。\n"
     "Zoom受講とアーカイブ視聴の\nハイブリッド形式で実施します。",
     size=SZ_BODY, color=TEXT, ls=1.25, anchor=MSO_ANCHOR.MIDDLE)
source_band(s, "出典：協会 教材制作ガイドライン Ver.1.0「受講者が飽きない工夫」（協会推奨）")

# ============================================================
# 27. 1テーマは4段階＋制作基準
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "1テーマは4段階で構成する", kicker="MATERIAL DESIGN")
steps = ["知る", "理解する", "考える", "実践する"]
bw = int((CW - Inches(0.55) * 3) / 4)
x = MARGIN
for i, st in enumerate(steps):
    rect(s, x, CY + Inches(0.1), bw, Inches(1.35), fill=NAVY, radius=0.10)
    tbox(s, x, CY + Inches(0.1), bw, Inches(1.35), "【%s】" % st, size=SZ_BODY_L,
         color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    if i < 3:
        a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                               int(x + bw + Inches(0.08)),
                               int(CY + Inches(0.62)),
                               int(Inches(0.39)), int(Inches(0.32)))
        a.fill.solid(); a.fill.fore_color.rgb = ORANGE
        a.line.fill.background(); a.shadow.inherit = False
    x += bw + Inches(0.55)
orange_head(s, MARGIN, CY + Inches(1.85), CW, "教材制作基準（固定・変更しない）",
            h=Inches(0.56), size=SZ_BODY)
tbox(s, MARGIN + Inches(0.3), CY + Inches(2.65), CW - Inches(0.6), Inches(2.0),
     "1ページ1テーマ　／　本文は80文字程度まで\n"
     "写真・図・出典はすべて必須（出典はページ下部18pt）\n"
     "ワーク・ケーススタディ・まとめ・宿題は毎回入れる",
     size=SZ_BODY, color=TEXT, ls=1.6)
source_band(s, "出典：協会 教材制作ガイドライン Ver.1.0「教材制作基準」（協会推奨・固定）")

# ============================================================
# 28. 品質基準と教材コード体系
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "品質基準と教材コード体系", kicker="QUALITY & CODE")
lw = int((CW - Inches(0.45)) / 2)
orange_head(s, MARGIN, CY, lw, "品質基準の優先順位")
q = ["①　科学的根拠", "②　行政資料", "③　現場経験", "④　分かりやすさ"]
y = CY + Inches(0.7)
for t in q:
    rect(s, MARGIN, y, lw, Inches(0.72), fill=LGRAY, line=BORDER, radius=0.12)
    tbox(s, MARGIN + Inches(0.3), y, lw - Inches(0.6), Inches(0.72), t,
         size=SZ_BODY, color=NAVY, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(0.83)
tbox(s, MARGIN, y - Inches(0.05), lw, Inches(0.6),
     "協会独自ノウハウは「協会推奨」と明記して区別",
     size=SZ_NOTE, color=RED, bold=True, ls=1.2)

rx = MARGIN + lw + Inches(0.45)
orange_head(s, rx, CY, lw, "教材コード体系（PDPA）")
codes = [("PDPA-100", "協会理念・教育方針"),
         ("PDPA-101〜112", "基本12講座"),
         ("PDPA-D201/C202", "犬猫の実技講座"),
         ("PDPA-E301", "卒業試験"),
         ("PDPA-I401", "認定講師研修"),
         ("PDPA-R501", "更新講習・テスト")]
y = CY + Inches(0.7)
for code, name in codes:
    rect(s, rx, y, lw, Inches(0.58), fill=WHITE, line=BORDER, radius=0.12)
    tbox(s, rx + Inches(0.22), y, Inches(2.85), Inches(0.58), code, size=SZ_NOTE,
         color=ORANGE_TXT, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tbox(s, rx + Inches(3.10), y, lw - Inches(3.25), Inches(0.58), name,
         size=SZ_NOTE, color=TEXT, anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(0.68)
source_band(s, "出典：協会 教材制作ガイドライン Ver.1.0「品質基準」「知的財産管理システム」")

# ============================================================
# 29. 卒業試験と認定・更新
# ============================================================
s = add_slide()
set_bg(s, WHITE)
title_band(s, "卒業試験と認定・更新制度", kicker="EXAM & RENEWAL")
pw = Inches(3.9)
framed_pic(s, P("certificate_badge"), SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
stats = [("50問中45問", "学科試験（4者択一）の合格基準"),
         ("Zoom面接", "実践レポート提出後に最終面接"),
         ("2年に1回", "更新は確認テスト・費用は無料")]
y = CY
rh = int((CH - Inches(0.22) * 2) / 3)
for val, lab in stats:
    rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.08)
    tbox(s, MARGIN + Inches(0.3), y + Inches(0.18), lw - Inches(0.6), Inches(0.6),
         val, size=SZ_BODY_L, color=NAVY, bold=True)
    tbox(s, MARGIN + Inches(0.3), y + Inches(0.92), lw - Inches(0.6), Inches(0.55),
         lab, size=SZ_NOTE_L, color=TEXT, ls=1.25)
    y += rh + Inches(0.22)
source_band(s, "出典：協会 認定制度・試験規程 Ver.1.0（協会推奨）"
               "／認定証・認定カード・認定バッジを授与")

# ============================================================
# 30. 今日のまとめ
# ============================================================
s = add_slide()
set_bg(s, NAVY)
title_band(s, "今日のまとめ　覚えること3つ", kicker="SUMMARY")
items = ["協会の行動指針は「備える・守る・つなぐ」",
         "独自ノウハウは「協会推奨」と明記して区別する",
         "「同行避難」は同室で飼えることを意味しない"]
gap = Inches(0.20)
rh = Inches(1.10)
y = CY
for i, t in enumerate(items, start=1):
    rect(s, MARGIN, y, CW, rh, fill=NAVY_CARD, radius=0.10)
    num_badge(s, MARGIN + Inches(0.32), y + (rh - Inches(0.56)) / 2, i)
    tbox(s, MARGIN + Inches(1.12), y, CW - Inches(1.5), rh, t, size=SZ_BODY,
         color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, ls=1.25)
    y += rh + gap
tbox(s, MARGIN, y + Inches(0.12), CW, Inches(0.95),
     "© 一般社団法人 ペット防災アドバイザー協会　本教材の著作権は協会に帰属します。\n"
     "協会の許可なく複製、転載、改変、配布することを禁止します。",
     size=SZ_NOTE, color=CREAM_MUTED, ls=1.3)
source_band(s, "出典：協会公式教育プログラム Ver.1.0　教材コード PDPA-100", dark=True)

# ============================================================
out = os.path.join(HERE, "PDPA-100_official_education_system.pptx")
prs.save(out)
print("Saved:", out)
print("Slides:", len(prs.slides))

# 出典の逆引きマップを書き出す（check_refs.py が参照する）
import json
ref_out = os.path.join(HERE, "slide_refs.json")
with open(ref_out, "w", encoding="utf-8") as f:
    json.dump({"material": "PDPA-100", "version": "1.0",
               "slides": SLIDE_REFS}, f, ensure_ascii=False, indent=2)
linked = sum(1 for v in SLIDE_REFS.values() if v["refs"])
print("Saved:", ref_out, "(REF紐付け %d / 出典帯 %d ページ)" % (linked, len(SLIDE_REFS)))
