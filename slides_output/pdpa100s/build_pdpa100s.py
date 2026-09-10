# -*- coding: utf-8 -*-
"""
PDPA-100S 認定後サポート体制（PDPA-100 続編・8枚）

共用テンプレート slides_output/pdpa_template.py を使用する。
デザインを変えたい場合はテンプレート側を直す（このファイルには中身だけを書く）。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pdpa_template import (  # noqa: E402
    Deck, Inches, Pt, PP_ALIGN, MSO_ANCHOR, MSO_SHAPE,
    NAVY, ORANGE, WHITE, LGRAY, NAVY_CARD, ORANGE_TXT, TEXT, MUTED,
    BORDER, RED, GREEN, CREAM_MUTED, MINCHO, RGBColor,
    SW, SH, MARGIN, CW, BAND_H, CY, CB, CH,
    SZ_TITLE, SZ_TITLE_L, SZ_BODY, SZ_BODY_L, SZ_NOTE, SZ_NOTE_L,
)

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.dirname(HERE)

# このページが根拠にしている公的資料（pdpa_support/refs.json の REF 番号）
REF_MAP = {
    8: ["REF-001", "REF-002", "REF-004", "REF-005", "REF-006", "REF-007",
        "REF-008", "REF-009"],
}

# 見本に使うダミーの記載事項（実在しない人物・番号であることを明示する）
SAMPLE_NAME = "山田 太郎"
SAMPLE_NO = "PDPAA-2026-1234"
SAMPLE_DATE = "2026年6月12日"
SAMPLE_EXPIRE = "2028年6月11日"

# バッジ段階（協会 活動実績ポイント制度に対応・3段階）
SILVER = RGBColor(0x9B, 0xA5, 0xB0)
GOLD = RGBColor(0xC9, 0xA2, 0x27)
BADGE_LEVELS = [
    ("青バッジ", "卒業時に授与", NAVY, WHITE),
    ("銀バッジ", "活動100ポイント", SILVER, NAVY),
    ("金バッジ", "認定講師", GOLD, NAVY),
]


def draw_badge(s, x, y, w, h, band=NAVY, txt=WHITE, level="青バッジ",
               cond="卒業時に授与", detail=True):
    """認定バッジ（IDカード型）を枠 (x,y,w,h) に比例配置で描く"""
    k = w / Inches(3.30)          # 文字サイズの基準
    d.rect(s, x, y, w, h, fill=WHITE, line=NAVY, line_w=1.75, radius=0.05)
    # ストラップ穴
    d.rect(s, x + (w - 0.167 * w) / 2, y + 0.026 * h, 0.167 * w, 0.026 * h,
           fill=LGRAY, line=BORDER, radius=0.5)
    # ヘッダー（段階カラー）
    hy = y + 0.077 * h
    hh = 0.184 * h
    d.rect(s, x, hy, w, hh, fill=band)
    s.shapes.add_picture(d.photo("logo_circle"), int(x + 0.036 * w),
                         int(hy + 0.11 * hh), height=int(hh * 0.78))
    d.tbox(s, x + 0.236 * w, hy + 0.10 * hh, w - 0.273 * w, hh * 0.82,
           "一般社団法人\nペット防災アドバイザー協会", size=9 * k, color=txt,
           bold=True, ls=1.35)
    # 顔写真
    py = hy + hh + 0.036 * h
    pw = 0.309 * w
    ph = 0.337 * h
    d.framed_pic(s, "id_portrait", x + 0.048 * w, py, pw, ph, frame=NAVY, fw=1.0)
    ix = x + 0.400 * w
    iw = w - 0.448 * w
    d.tbox(s, ix, py + 0.005 * h, iw, 0.056 * h, "認定ペット防災アドバイザー",
           size=8.5 * k, color=ORANGE_TXT, bold=True)
    d.tbox(s, ix, py + 0.066 * h, iw, 0.051 * h, "ヤマダ タロウ",
           size=7.5 * k, color=MUTED)
    d.tbox(s, ix, py + 0.117 * h, iw, 0.112 * h, SAMPLE_NAME,
           size=20 * k, color=NAVY, bold=True)
    d.rect(s, ix, py + 0.250 * h, iw, Pt(1), fill=band)
    d.tbox(s, ix, py + 0.270 * h, iw, 0.066 * h, level,
           size=9 * k, color=NAVY, bold=True)
    # 記載事項
    if detail:
        rows = [("認定番号", SAMPLE_NO), ("認定日", SAMPLE_DATE),
                ("有効期限", SAMPLE_EXPIRE)]
    else:
        rows = [("認定番号", SAMPLE_NO)]
    ry = py + ph + 0.036 * h
    for i, (kk, vv) in enumerate(rows):
        yy = ry + 0.066 * h * i
        d.tbox(s, x + 0.048 * w, yy, 0.227 * w, 0.061 * h, kk,
               size=9 * k, color=MUTED)
        d.tbox(s, x + 0.288 * w, yy, w - 0.336 * w, 0.061 * h, vv,
               size=9.5 * k, color=TEXT, bold=True)
    # フッター（段階の条件）
    d.rect(s, x, y + h - 0.087 * h, w, 0.087 * h, fill=band)
    d.tbox(s, x, y + h - 0.087 * h, w, 0.087 * h, cond,
           size=9 * k, color=txt, bold=True, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)

d = Deck("PDPA-100S",
         photo_dirs=(os.path.join(HERE, "photos"),
                     os.path.join(SLIDES, "pdpa100", "photos"),
                     os.path.join(SLIDES, "pdpa101_photos")),
         ref_map=REF_MAP)

# ============================================================
# 1. 認定証と認定バッジ（1ページに大きく表示）
#    ロゴは AI に描かせず、公式ロゴ画像 logo_circle.png を配置する
#    記載事項はすべて架空の見本。SAMPLE 表記を必ず入れる
# ============================================================
s = d.add_slide()
d.title_band(s, "卒業後に授与される認定証と認定バッジ",
             kicker="一般社団法人 ペット防災アドバイザー協会　認定後サポート体制　PDPA-100S")

half = int((CW - Inches(0.40)) / 2)
ch0 = Inches(4.30)

# ---------------- 認定証（協会の公式デザイン画像を使用） ----------------
d.rect(s, MARGIN, CY, half, ch0, fill=LGRAY, line=BORDER, radius=0.03)
cert_h = ch0 - Inches(0.30)
cert_w = int(cert_h * 0.701)          # 原画の縦横比（A4縦）
cert_x = MARGIN + int((half - cert_w) / 2)
cert_y = CY + Inches(0.15)
d.framed_pic(s, "cert_official", cert_x, cert_y, cert_w, cert_h,
             frame=WHITE, fw=1.0)
d.rect(s, cert_x, cert_y, cert_w, cert_h, fill=None, line=BORDER, line_w=1.0)

d.rect(s, MARGIN, CY + ch0 + Inches(0.14), half, Inches(0.40), fill=NAVY)
d.tbox(s, MARGIN, CY + ch0 + Inches(0.14), half, Inches(0.40),
       "認定証（A4縦・全員に授与）", size=SZ_NOTE, color=WHITE, bold=True,
       align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ---------------- 認定バッジ（IDカード型・顔写真／氏名／認定番号） ----------------
bx0 = MARGIN + half + Inches(0.40)
d.rect(s, bx0, CY, half, ch0, fill=LGRAY, line=BORDER, radius=0.03)
card_w = Inches(3.30)
card_h = Inches(3.92)
draw_badge(s, bx0 + (half - card_w) / 2, CY + Inches(0.20), card_w, card_h,
           band=NAVY, txt=WHITE, level="青バッジ（卒業時）",
           cond="本証の写真・記載事項は見本です　SAMPLE")

d.rect(s, bx0, CY + ch0 + Inches(0.14), half, Inches(0.40), fill=NAVY)
d.tbox(s, bx0, CY + ch0 + Inches(0.14), half, Inches(0.40),
       "認定バッジ（IDカード型・全員に授与）", size=SZ_NOTE, color=WHITE, bold=True,
       align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

d.source_band(s, "出典：協会 認定制度規程 Ver.1.0（協会推奨）／"
                 "氏名・認定番号・写真はすべて架空の見本です（実際の仕様は別途決定）")

# ============================================================
# 2. 認定バッジは3段階（青→銀→金）
# ============================================================
s = d.add_slide()
d.title_band(s, "認定バッジは3段階", kicker="活動を続けるほど、バッジが上がります")

bw = int((CW - Inches(0.34) * 2) / 3)
bh = Inches(4.00)
x = MARGIN
for i, (name, cond, band, txt) in enumerate(BADGE_LEVELS):
    draw_badge(s, x, CY, bw, bh, band=band, txt=txt, level=name, cond=cond,
               detail=False)
    d.rect(s, x, CY + bh + Inches(0.16), bw, Inches(0.46), fill=band)
    d.tbox(s, x, CY + bh + Inches(0.16), bw, Inches(0.46), name,
           size=SZ_NOTE_L, color=txt, bold=True, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE)
    if i < len(BADGE_LEVELS) - 1:
        a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW,
                               int(x + bw + Inches(0.045)),
                               int(CY + bh / 2 - Inches(0.16)),
                               int(Inches(0.25)), int(Inches(0.32)))
        a.fill.solid(); a.fill.fore_color.rgb = ORANGE
        a.line.fill.background(); a.shadow.inherit = False
    x += bw + Inches(0.34)

d.source_band(s, "出典：協会 活動実績ポイント制度・バッジ制度 Ver.1.0（協会推奨）／"
                 "氏名・認定番号・写真は架空の見本です")

# ============================================================
# 3. オプション物品（有料）
# ============================================================
s = d.add_slide()
d.title_band(s, "オプション物品（有料・公式ロゴ入り）", kicker="OPTION")
opts = [("mock_armband", "腕章", "地域イベント・防災訓練での識別に"),
        ("mock_vest", "専用ベスト", "避難所支援や屋外活動での視認性確保に"),
        ("mock_cap", "帽子", "屋外イベント・炎天下での活動に")]
ow = int((CW - Inches(0.35) * 2) / 3)
oh = Inches(2.55)
x = MARGIN
for photo, label, note in opts:
    d.rect(s, x, CY, ow, CH, fill=WHITE, line=BORDER, radius=0.04)
    d.framed_pic(s, photo, x, CY, ow, oh, frame=WHITE, fw=1.0)
    d.rect(s, x, CY + oh, ow, Inches(0.56), fill=NAVY)
    d.tbox(s, x, CY + oh, ow, Inches(0.56), label, size=SZ_BODY, color=WHITE,
           bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    d.tbox(s, x + Inches(0.26), CY + oh + Inches(0.72), ow - Inches(0.52),
           Inches(1.2), note, size=SZ_NOTE, color=TEXT)
    x += ow + Inches(0.35)
d.source_band(s, "出典：協会 認定制度規程 Ver.1.0（協会推奨）／"
                 "画像は公式ロゴを用いた見本イメージです（実際の仕様・価格は別途決定）")

# ============================================================
# 2. サポートの3本柱
# ============================================================
s = d.add_slide()
d.title_band(s, "サポートは行動指針と同じ3本柱", kicker="OVERVIEW")
cards = [
    ("備える", "supplies_stockpile",
     "教材と知識が\n古くならない\n仕組みを協会が持つ"),
    ("守る", "shelter_pet_cage",
     "事故と災害に、\n認定者がひとりで\n向き合わない"),
    ("つなぐ", "instructor_teaching",
     "最初の一歩と\n地域との接点を\n協会がつくる"),
]
cw = int((CW - Inches(0.4) * 2) / 3)
x = MARGIN
for head, photo, body in cards:
    d.rect(s, x, CY, cw, CH, fill=WHITE, line=BORDER, radius=0.05)
    d.pic_fill(s, photo, x, CY, cw, Inches(2.05))
    d.orange_head(s, x, CY + Inches(2.05), cw, head, h=Inches(0.60), size=SZ_BODY)
    d.tbox(s, x + Inches(0.28), CY + Inches(2.75), cw - Inches(0.56), Inches(2.0),
           body, size=SZ_NOTE_L, color=TEXT, anchor=MSO_ANCHOR.MIDDLE)
    x += cw + Inches(0.4)
d.source_band(s, "出典：協会 認定後サポート規程 Ver.1.0（協会推奨）／行動指針「備える・守る・つなぐ」")

# ============================================================
# 3. つなぐ① ひとりで始めない
# ============================================================
s = d.add_slide()
d.title_band(s, "最初の一歩を、ひとりにしない", kicker="つなぐ ①")
pw = Inches(4.2)
d.framed_pic(s, "instructor_teaching", SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)
rows = [
    ("初回デビュー伴走メンター", "卒業後の最初の1回だけ、認定講師が\nZoomで同席し、企画と講評を行う"),
    ("共同開催マッチング", "近隣の認定者2〜3名をチーム化し、\nシニア層と専門職を協会が組ませる"),
]
y = CY
rh = int((CH - Inches(0.30)) / 2)
for head, body in rows:
    d.rect(s, MARGIN, y, lw, rh, fill=WHITE, line=BORDER, radius=0.05)
    d.orange_head(s, MARGIN, y, lw, head, h=Inches(0.56), size=SZ_BODY)
    d.tbox(s, MARGIN + Inches(0.28), y + Inches(0.80), lw - Inches(0.56),
           rh - Inches(1.0), body, size=SZ_NOTE_L, color=TEXT)
    y += rh + Inches(0.30)
d.source_band(s, "出典：協会 認定後サポート規程 Ver.1.0（協会推奨）")

# ============================================================
# 4. つなぐ② 協会が信用を貸す
# ============================================================
s = d.add_slide()
d.title_band(s, "協会が「信用」を貸します", kicker="つなぐ ②")
pw = Inches(3.9)
d.framed_pic(s, "location_townhall", SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)

d.orange_head(s, MARGIN, CY, lw, "公式文書パック", h=Inches(0.56), size=SZ_BODY)
d.tbox(s, MARGIN + Inches(0.1), CY + Inches(0.75), lw - Inches(0.2), Inches(1.5),
       "協会名義の依頼文・企画書ひな型・\n活動証明書・保険加入証明を発行。\n"
       "個人名では開かない窓口が開きます。",
       size=SZ_NOTE_L, color=TEXT)

d.orange_head(s, MARGIN, CY + Inches(2.45), lw, "認定者マップ（同意した項目のみ公開）",
              h=Inches(0.56), size=SZ_NOTE_L)
d.tbox(s, MARGIN + Inches(0.1), CY + Inches(3.20), lw - Inches(0.2), Inches(1.5),
       "既定は非公開。項目ごとに同意を取り、\n撤回はワンクリック。\n"
       "連絡は協会経由フォームに一本化します。",
       size=SZ_NOTE_L, color=TEXT)
d.source_band(s, "出典：協会 認定後サポート規程／個人情報の取扱い規程 Ver.1.0（協会推奨）")

# ============================================================
# 5. 守る 事故と災害に備える
# ============================================================
s = d.add_slide(NAVY)
d.title_band(s, "事故と災害に、備えておく", kicker="守る")
cw = int((CW - Inches(0.4)) / 2)
items = [
    ("団体賠償責任保険", "first_aid_cpr",
     "保険料は認定者負担。協会は手数料を\n上乗せしません。\n"
     "講座を主催する認定者は加入必須、\n啓発のみの認定者は任意です。"),
    ("発災時プロトコル", "shelter_pet_cage",
     "災害が起きたとき「今できること」と\n「してはいけないこと」を段階配信。\n"
     "獣医療・避難所運営の判断には\n立ち入らず、専門職へ橋渡しします。"),
]
x = MARGIN
for head, photo, body in items:
    d.rect(s, x, CY, cw, CH, fill=NAVY_CARD, radius=0.05)
    d.pic_fill(s, photo, x, CY, cw, Inches(1.75))
    d.orange_head(s, x, CY + Inches(1.75), cw, head, h=Inches(0.56), size=SZ_BODY)
    d.tbox(s, x + Inches(0.28), CY + Inches(2.50), cw - Inches(0.56), Inches(2.2),
           body, size=SZ_NOTE_L, color=WHITE)
    x += cw + Inches(0.4)
d.source_band(s, "出典：協会 認定後サポート規程 Ver.1.0（協会推奨）／保険は損害保険会社との協議事項",
              dark=True)

# ============================================================
# 6. 備える 教材が古くならない仕組み
# ============================================================
s = d.add_slide()
d.title_band(s, "教材が古くならない仕組み", kicker="備える")
pw = Inches(3.9)
d.framed_pic(s, "weather_alert_phone", SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)

flow = ["協会が公的資料を毎日監視する",
        "変更を検知したら該当ページを特定",
        "認定者へ差替えページを配信する"]
y = CY
rh = int((CH - Inches(1.05) - Inches(0.18) * 2) / 3)
for i, t in enumerate(flow, start=1):
    d.rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.10)
    d.num_badge(s, MARGIN + Inches(0.28), y + (rh - Inches(0.56)) / 2, i)
    d.tbox(s, MARGIN + Inches(1.05), y, lw - Inches(1.4), rh, t,
           size=SZ_NOTE_L, color=TEXT, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    y += rh + Inches(0.18)
d.rect(s, MARGIN, y + Inches(0.02), lw, Inches(0.75), fill=NAVY, radius=0.08)
d.tbox(s, MARGIN + Inches(0.25), y + Inches(0.02), lw - Inches(0.5), Inches(0.75),
       "2026年は気象庁と環境省で改訂が発生", size=SZ_NOTE_L, color=WHITE,
       bold=True, anchor=MSO_ANCHOR.MIDDLE)
d.source_band(s, "監視対象：環境省／内閣府（防災担当）／気象庁／総務省消防庁／"
                 "国土交通省・国土地理院（出典管理台帳 REF-001〜012）")

# ============================================================
# 7. 運用基盤（システム化）
# ============================================================
s = d.add_slide()
d.title_band(s, "活動を記録すれば、あとは自動", kicker="SYSTEM")
pw = Inches(3.6)
d.framed_pic(s, "certificate_badge", SW - MARGIN - pw, CY, pw, CH)
lw = CW - pw - Inches(0.45)

steps = ["LINEで\n報告", "事務局が\n承認", "ポイント\n加算",
         "バッジ\n昇格", "受験資格\n判定"]
bw = int((lw - Inches(0.12) * 4) / 5)
x = MARGIN
for i, t in enumerate(steps):
    fill = NAVY if i % 2 == 0 else ORANGE
    tc = WHITE if i % 2 == 0 else NAVY
    d.rect(s, x, CY, bw, Inches(1.55), fill=fill, radius=0.10)
    d.tbox(s, x + Inches(0.08), CY, bw - Inches(0.16), Inches(1.55), t,
           size=SZ_NOTE, color=tc, bold=True, align=PP_ALIGN.CENTER,
           anchor=MSO_ANCHOR.MIDDLE, ls=1.2)
    x += bw + Inches(0.12)

extra = [("卒業後90日オンボーディング", "30日=防災計画／60日=5人に伝える／90日=勉強会1回"),
         ("年1回の全国事例発表会", "優秀事例は翌年度の教材に採録し、提供者をクレジット")]
y = CY + Inches(1.85)
rh = int((CH - Inches(1.85) - Inches(0.2)) / 2)
for head, body in extra:
    d.rect(s, MARGIN, y, lw, rh, fill=LGRAY, line=BORDER, radius=0.08)
    d.tbox(s, MARGIN + Inches(0.28), y + Inches(0.16), lw - Inches(0.56), Inches(0.5),
           head, size=SZ_NOTE_L, color=NAVY, bold=True)
    d.tbox(s, MARGIN + Inches(0.28), y + Inches(0.78), lw - Inches(0.56), Inches(0.5),
           body, size=SZ_NOTE, color=MUTED)
    y += rh + Inches(0.2)
d.source_band(s, "出典：協会 活動実績ポイント制度・バッジ制度 Ver.1.0（協会推奨）")

# ============================================================
# 8. 導入ロードマップとまとめ
# ============================================================
s = d.add_slide(NAVY)
d.title_band(s, "導入ロードマップ", kicker="ROADMAP")
phases = [
    ("Phase 1", "〜1か月", "同意フォーム\n活動報告フォーム\nポイント集計とLINE通知"),
    ("Phase 2", "〜3か月", "出典アップデート通知\n保険の加入証明を\n自動で発行"),
    ("Phase 3", "〜6か月", "認定者マップの公開\n指名紹介と\n共同開催の仲介"),
]
cw = int((CW - Inches(0.3) * 2) / 3)
x = MARGIN
for tag, term, body in phases:
    d.rect(s, x, CY, cw, Inches(2.70), fill=NAVY_CARD, radius=0.08)
    d.tbox(s, x + Inches(0.28), CY + Inches(0.18), cw - Inches(0.56), Inches(0.45),
           tag, size=SZ_BODY, color=ORANGE, bold=True)
    d.tbox(s, x + Inches(0.28), CY + Inches(0.72), cw - Inches(0.56), Inches(0.4),
           term, size=SZ_NOTE, color=CREAM_MUTED)
    d.tbox(s, x + Inches(0.28), CY + Inches(1.28), cw - Inches(0.56), Inches(1.35),
           body, size=SZ_NOTE_L, color=WHITE)
    x += cw + Inches(0.3)

d.tbox(s, MARGIN, CY + Inches(2.92), CW, Inches(0.40), "覚えること 3つ",
       size=SZ_NOTE, color=CREAM_MUTED)
summary = ["保険料は認定者負担。開催する人は加入必須",
           "公開するのは、同意した項目だけ",
           "活動報告はシステムが集計する"]
y = CY + Inches(3.32)
for i, t in enumerate(summary, start=1):
    d.num_badge(s, MARGIN + Inches(0.05), y, i, d=Inches(0.40))
    d.tbox(s, MARGIN + Inches(0.62), y - Inches(0.05), CW - Inches(0.7), Inches(0.5),
           t, size=SZ_NOTE_L, color=WHITE, bold=True)
    y += Inches(0.50)
d.source_band(s, "出典：協会公式教育プログラム Ver.1.0　教材コード PDPA-100S", dark=True)

# ============================================================
d.save(os.path.join(HERE, "PDPA-100S_support_system.pptx"))
