# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ---- palette (light sage-emerald) ----
BG_WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
BG_MINT       = RGBColor(0xF0, 0xFA, 0xF4)
ACCENT_LIGHT  = RGBColor(0x9C, 0xD3, 0xB4)   # soft sage green
ACCENT_MED    = RGBColor(0x4F, 0x9C, 0x74)   # medium emerald (headline/underline)
ACCENT_DARK   = RGBColor(0x2F, 0x6B, 0x4F)   # deep emerald (rarely used, small accents)
TEXT_DARK     = RGBColor(0x22, 0x2A, 0x26)
TEXT_GRAY     = RGBColor(0x6B, 0x72, 0x6E)
CARD_BORDER   = RGBColor(0xE4, 0xEF, 0xE8)
CONCLUSION_BG = RGBColor(0x4B, 0x55, 0x63)
WHITE         = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "Yu Gothic"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
SW, SH = prs.slide_width, prs.slide_height


def add_slide():
    return prs.slides.add_slide(BLANK)


def set_bg(slide, color=BG_MINT):
    bg = slide.background
    bg.fill.solid()
    bg.fill.fore_color.rgb = color


def rect(slide, x, y, w, h, fill=None, line=None, radius=None, shadow=False):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(shape_type, x, y, w, h)
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
        shp.line.width = Pt(1)
    shp.shadow.inherit = False
    return shp


def textbox(slide, x, y, w, h, text, size=18, color=TEXT_DARK, bold=False,
            align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=FONT, line_spacing=1.15):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    lines = text.split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.name = font
        r.font.color.rgb = color
    return tb


def badge(slide, x, y, text, w=Inches(2.2), h=Inches(0.55), fill=ACCENT_MED, color=WHITE, size=16):
    shp = rect(slide, x, y, w, h, fill=fill, radius=0.5)
    tf = shp.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.1)
    tf.margin_right = Inches(0.1)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.name = FONT
    r.font.color.rgb = color
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    return shp


def footer(slide):
    textbox(slide, Inches(0.4), Inches(7.05), Inches(8), Inches(0.35),
            "ペット防災アドバイザー養成講座 個別相談", size=9, color=TEXT_GRAY)


# ============================================================
# Slide 1: 表紙
# ============================================================
s = add_slide()
set_bg(s, BG_MINT)
rect(s, 0, 0, SW, Inches(1.6), fill=ACCENT_LIGHT)
textbox(s, 0, Inches(0.5), SW, Inches(0.7), "個別相談", size=32, color=WHITE, bold=True,
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
textbox(s, Inches(0.8), Inches(3.0), Inches(11.7), Inches(1.8),
        "本日はありがとうございます\n第二の人生を、具体的な一歩に変える45分",
        size=40, color=ACCENT_DARK, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
        line_spacing=1.3)
tag = rect(s, Inches(4.16), Inches(5.6), Inches(5.0), Inches(0.7), fill=ACCENT_LIGHT, radius=0.5)
tf = tag.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "ペット防災アドバイザー養成講座"
r.font.size = Pt(18)
r.font.bold = True
r.font.name = FONT
r.font.color.rgb = WHITE

# ============================================================
# Slide 2: 3日間の振り返り
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(0.6), Inches(0.5), "振り返り", w=Inches(1.8))
textbox(s, Inches(0.6), Inches(1.15), Inches(11.5), Inches(1.1),
        "3日間のライブで学んだこと　いのちを守る5つの重要行動",
        size=24, color=ACCENT_DARK, bold=True, line_spacing=1.2)

items = [
    ("01", "身元情報の整備 - 迷子対策・マイクロチップ"),
    ("02", "防災バッグの準備 - 備蓄・避難グッズ一式"),
    ("03", "避難先の事前確認 - ペット可避難所リスト化"),
    ("04", "日頃のトレーニング - キャリー慣れ・コマンド練習"),
    ("05", "地域ネットワーク - 近隣・SNSでつながる"),
]
y = Inches(2.35)
row_h = Inches(0.75)
gap = Inches(0.12)
for num, label in items:
    rect(s, Inches(0.6), y, Inches(11.5), row_h, fill=BG_WHITE, line=CARD_BORDER, radius=0.25)
    circ = slide_circ = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.85), y + Inches(0.13), Inches(0.5), Inches(0.5))
    circ.fill.solid(); circ.fill.fore_color.rgb = ACCENT_MED
    circ.line.fill.background()
    circ.shadow.inherit = False
    ctf = circ.text_frame
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
    cp = ctf.paragraphs[0]
    cp.alignment = PP_ALIGN.CENTER
    cr = cp.add_run(); cr.text = num
    cr.font.size = Pt(14); cr.font.bold = True; cr.font.name = FONT; cr.font.color.rgb = WHITE
    textbox(s, Inches(1.6), y, Inches(10.3), row_h, label, size=17, color=TEXT_DARK, bold=True,
            anchor=MSO_ANCHOR.MIDDLE)
    y = y + row_h + gap

textbox(s, Inches(0.6), Inches(6.85), Inches(11.5), Inches(0.4),
        "知識は手に入れた。次は、地域に広める側になる番です。", size=13, color=TEXT_GRAY)

# ============================================================
# Slide 3: ギャップ
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(0.6), Inches(0.5), "見過ごされているギャップ", w=Inches(3.4))
textbox(s, Inches(0.6), Inches(1.25), Inches(11.5), Inches(1.0),
        "人の防災は進んでいる。でも、ペット防災はほぼ手つかず", size=22, color=TEXT_DARK, bold=True)

card_w = Inches(5.5); card_h = Inches(3.0)
rect(s, Inches(0.6), Inches(2.5), card_w, card_h, fill=BG_WHITE, line=CARD_BORDER, radius=0.08)
textbox(s, Inches(0.6), Inches(2.7), card_w, Inches(1.6), "78%", size=72, color=ACCENT_LIGHT,
        bold=True, align=PP_ALIGN.CENTER)
textbox(s, Inches(0.9), Inches(4.35), Inches(4.9), Inches(0.9),
        "人の防災意識 - 多くの地域で防災教育・避難訓練が浸透", size=14, color=TEXT_DARK,
        align=PP_ALIGN.CENTER)

rect(s, Inches(7.2), Inches(2.5), card_w, card_h, fill=BG_WHITE, line=CARD_BORDER, radius=0.08)
textbox(s, Inches(7.2), Inches(2.7), card_w, Inches(1.6), "15%", size=72, color=ACCENT_LIGHT,
        bold=True, align=PP_ALIGN.CENTER)
textbox(s, Inches(7.5), Inches(4.35), Inches(4.9), Inches(0.9),
        "ペット防災の浸透率 - ペットオーナーですら具体的な対策を知らない", size=14, color=TEXT_DARK,
        align=PP_ALIGN.CENTER)

textbox(s, Inches(0.6), Inches(5.75), Inches(6), Inches(0.35),
        "文部科学省「地震調査研究推進本部」データ準拠", size=10, color=TEXT_GRAY)
rect(s, 0, Inches(6.3), SW, Inches(1.0), fill=CONCLUSION_BG)
textbox(s, 0, Inches(6.3), SW, Inches(1.0), "このギャップこそが、あなたの出番です",
        size=22, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ============================================================
# Slide 4: The Answer
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(0.6), Inches(0.5), "講座の価値", w=Inches(1.8))
ans_lbl = rect(s, Inches(5.7), Inches(1.35), Inches(1.9), Inches(0.5), fill=BG_WHITE, line=ACCENT_MED, radius=0.3)
atf = ans_lbl.text_frame
atf.vertical_anchor = MSO_ANCHOR.MIDDLE
ap = atf.paragraphs[0]; ap.alignment = PP_ALIGN.CENTER
ar = ap.add_run(); ar.text = "ANSWER"
ar.font.size = Pt(14); ar.font.bold = True; ar.font.name = FONT; ar.font.color.rgb = ACCENT_MED

rect(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(2.3), fill=BG_WHITE, line=CARD_BORDER, radius=0.08)
textbox(s, Inches(1.4), Inches(2.4), Inches(10.5), Inches(1.8),
        "ペット防災アドバイザー養成講座\n知識を「資格」に変え、地域で活動できる自分になる",
        size=26, color=TEXT_DARK, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
        line_spacing=1.3)

tags = ["教育者", "地域コーディネーター", "アドバイザー", "社会貢献者"]
tag_w = Inches(2.7); tag_h = Inches(0.65); tag_gap = Inches(0.15)
total_w = tag_w * 4 + tag_gap * 3
start_x = int((SW - total_w) / 2)
x = start_x
for t in tags:
    badge(s, x, Inches(5.1), t, w=tag_w, h=tag_h, fill=ACCENT_MED, size=14)
    x = x + tag_w + tag_gap

# ============================================================
# Slide 5: カリキュラム概要 (table)
# ============================================================
s = add_slide()
set_bg(s)
textbox(s, 0, Inches(0.5), SW, Inches(0.9), "カリキュラム概要", size=32, color=ACCENT_DARK, bold=True,
        align=PP_ALIGN.CENTER)

rows_data = [
    ("項目", "内容"),
    ("講義回数", "全12回（各90〜120分）"),
    ("受講方法", "Zoomリアルタイム受講／アーカイブ視聴"),
    ("特別講座", "犬の防災トレーニング／猫の防災トレーニング（オンライン実技）"),
    ("認定", "卒業試験合格で認定証を発行（一般社団法人ペット防災アドバイザー協会）"),
]
tbl_x, tbl_y = Inches(0.8), Inches(1.7)
tbl_w, tbl_h = Inches(11.7), Inches(4.8)
graphic_frame = s.shapes.add_table(len(rows_data), 2, tbl_x, tbl_y, tbl_w, tbl_h)
table = graphic_frame.table
table.columns[0].width = Inches(2.6)
table.columns[1].width = Inches(9.1)
for ri, (c1, c2) in enumerate(rows_data):
    table.rows[ri].height = Inches(0.96)
    for ci, val in enumerate((c1, c2)):
        cell = table.cell(ri, ci)
        cell.text = val
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        cell.margin_left = Inches(0.2)
        cell.margin_right = Inches(0.2)
        para = cell.text_frame.paragraphs[0]
        run = para.runs[0]
        run.font.name = FONT
        run.font.size = Pt(16 if ri > 0 else 16)
        if ri == 0:
            run.font.bold = True
            run.font.color.rgb = WHITE
            cell.fill.solid(); cell.fill.fore_color.rgb = ACCENT_MED
        else:
            run.font.bold = (ci == 0)
            run.font.color.rgb = TEXT_DARK
            cell.fill.solid()
            cell.fill.fore_color.rgb = BG_WHITE if ri % 2 == 1 else BG_MINT

# ============================================================
# Slide 6: 卒業後にできること
# ============================================================
s = add_slide()
set_bg(s)
textbox(s, 0, Inches(0.5), SW, Inches(0.9), "卒業後にできること", size=32, color=ACCENT_DARK, bold=True,
        align=PP_ALIGN.CENTER)

col_w = Inches(5.5); col_h = Inches(3.6)
rect(s, Inches(0.65), Inches(1.7), col_w, col_h, fill=BG_WHITE, line=CARD_BORDER, radius=0.06)
textbox(s, Inches(1.0), Inches(1.95), Inches(4.9), Inches(0.9),
        "① セミナー・講座の定期開催", size=19, color=ACCENT_DARK, bold=True, line_spacing=1.2)
textbox(s, Inches(1.0), Inches(2.9), Inches(4.9), Inches(1.5),
        "・地域の公民館・コミュニティセンターで開催\n・参加費として感謝の報酬を受け取る",
        size=15, color=TEXT_DARK, line_spacing=1.4)

rect(s, Inches(7.15), Inches(1.7), col_w, col_h, fill=BG_WHITE, line=CARD_BORDER, radius=0.06)
textbox(s, Inches(7.5), Inches(1.95), Inches(4.9), Inches(0.9),
        "② 個別コンサルティング＆プラン作成", size=19, color=ACCENT_DARK, bold=True, line_spacing=1.2)
textbox(s, Inches(7.5), Inches(2.9), Inches(4.9), Inches(1.5),
        "・ペットの種類・性格に合わせた防災プランを提案\n・コンサルティング費用として報酬を受け取る",
        size=15, color=TEXT_DARK, line_spacing=1.4)

textbox(s, 0, Inches(5.8), SW, Inches(0.6), "感謝の報酬を得ながら、地域に必要とされる存在に",
        size=20, color=ACCENT_MED, bold=True, align=PP_ALIGN.CENTER)

# ============================================================
# Slide 7: 投資額
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(5.57), Inches(1.3), "ご案内", w=Inches(2.2))
textbox(s, 0, Inches(3.0), SW, Inches(1.2), "受講料　330,000円（税込）", size=44, color=ACCENT_DARK,
        bold=True, align=PP_ALIGN.CENTER)
line = rect(s, Inches(3.5), Inches(4.25), Inches(6.3), Pt(2.5), fill=ACCENT_MED)
textbox(s, 0, Inches(4.5), SW, Inches(0.6), "全12回＋特別講座2つ＋認定料込み", size=17, color=TEXT_GRAY,
        align=PP_ALIGN.CENTER)

# ============================================================
# Slide 8: 今日だけの特典
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(0.6), Inches(0.5), "今日だけの特典", w=Inches(2.6))
rect(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(1.9), fill=BG_WHITE, line=CARD_BORDER, radius=0.1)
check = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.3), Inches(2.65), Inches(0.8), Inches(0.8))
check.fill.solid(); check.fill.fore_color.rgb = ACCENT_MED
check.line.fill.background(); check.shadow.inherit = False
ctf = check.text_frame; ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
cp = ctf.paragraphs[0]; cp.alignment = PP_ALIGN.CENTER
cr = cp.add_run(); cr.text = "✓"
cr.font.size = Pt(28); cr.font.bold = True; cr.font.color.rgb = WHITE; cr.font.name = FONT
textbox(s, Inches(2.4), Inches(2.35), Inches(9.6), Inches(1.4),
        "本来10,000円の「45分間ZOOM個別相談」が、今日は無料",
        size=24, color=TEXT_DARK, bold=True, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.3)
textbox(s, 0, Inches(4.4), SW, Inches(0.6), "＝ この時間そのものが、今日だけの特典です",
        size=18, color=ACCENT_MED, bold=True, align=PP_ALIGN.CENTER)

# ============================================================
# Slide 9: 締切
# ============================================================
s = add_slide()
set_bg(s)
badge(s, Inches(5.57), Inches(0.9), "ご案内", w=Inches(2.2))
tb = s.shapes.add_textbox(Inches(0.8), Inches(2.6), Inches(11.7), Inches(1.8))
tf = tb.text_frame; tf.word_wrap = True
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; p.line_spacing = 1.3
r1 = p.add_run(); r1.text = "本日のご案内は、最終ライブ配信日より"
r1.font.size = Pt(32); r1.font.bold = True; r1.font.name = FONT; r1.font.color.rgb = TEXT_DARK
p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
r2 = p2.add_run(); r2.text = "5日間限定"
r2.font.size = Pt(40); r2.font.bold = True; r2.font.name = FONT; r2.font.color.rgb = ACCENT_MED
textbox(s, 0, Inches(4.8), SW, Inches(0.6), "迷っている時間が、一番もったいない",
        size=18, color=TEXT_GRAY, align=PP_ALIGN.CENTER)

# ============================================================
# Slide 10: CTA
# ============================================================
s = add_slide()
set_bg(s)
textbox(s, 0, Inches(1.6), SW, Inches(1.0), "今日、ここで一歩を踏み出しませんか",
        size=32, color=ACCENT_DARK, bold=True, align=PP_ALIGN.CENTER)
bubble = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.17), Inches(3.1), Inches(1.0), Inches(1.0))
bubble.fill.solid(); bubble.fill.fore_color.rgb = ACCENT_MED
bubble.line.fill.background(); bubble.shadow.inherit = False
btf = bubble.text_frame; btf.vertical_anchor = MSO_ANCHOR.MIDDLE
bp = btf.paragraphs[0]; bp.alignment = PP_ALIGN.CENTER
br = bp.add_run(); br.text = "・・・"
br.font.size = Pt(20); br.font.bold = True; br.font.color.rgb = WHITE; br.font.name = FONT
textbox(s, 0, Inches(4.7), SW, Inches(0.6), "お申し込み方法のご案内", size=20, color=TEXT_DARK,
        align=PP_ALIGN.CENTER)

out_path = r"C:\Users\Owner\pet-bousai-ai\slides_output\kobetsu_sodan_editable.pptx"
prs.save(out_path)
print("Saved:", out_path)
