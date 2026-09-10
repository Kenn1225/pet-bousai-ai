# -*- coding: utf-8 -*-
"""
公式ロゴを使った物品見本（腕章・ベスト・帽子）を作る。

ロゴは AI に描かせない。必ず協会公式ロゴ画像（logo.jpg）を合成する。
  1. logo.jpg は白背景の円形エンブレムなので、円形に切り抜いて透過PNGにする
  2. 無地の製品写真（generate_photos.js で生成）にロゴを合成する
認定証・認定バッジは PPTX 側で図形として描画する（そこでも同じ透過ロゴを使う）。
"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTOS = os.path.join(HERE, "photos")
SRC_LOGO = os.path.join(os.path.dirname(HERE), "pdpa101_photos", "logo.jpg")
LOGO_PNG = os.path.join(PHOTOS, "logo_circle.png")

os.makedirs(PHOTOS, exist_ok=True)


def find_logo_bbox(im, tol=246):
    """白背景を除いたエンブレム部分の外接矩形を求める"""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    step = max(1, min(w, h) // 400)
    left, top, right, bottom = w, h, 0, 0
    for y in range(0, h, step):
        for x in range(0, w, step):
            if px[x, y] < tol:
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
    return left, top, right, bottom


def build_circle_logo(size=1200):
    """logo.jpg を正円で切り抜いた透過PNGを作る"""
    im = Image.open(SRC_LOGO).convert("RGB")
    l, t, r, b = find_logo_bbox(im)
    # 正方形に整える（円形エンブレムなので中心を保って長辺に合わせる）
    cx, cy = (l + r) / 2, (t + b) / 2
    side = max(r - l, b - t)
    half = side / 2
    box = (int(cx - half), int(cy - half), int(cx + half), int(cy + half))
    im = im.crop(box).resize((size, size), Image.LANCZOS)

    # 円形のアルファマスク（縁は少しぼかしてジャギーを消す）
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))

    out = im.convert("RGBA")
    out.putalpha(mask)
    out.save(LOGO_PNG)
    print("saved", LOGO_PNG, out.size, "crop=", box)
    return out


def paste_logo(base_path, out_path, cx_ratio, cy_ratio, w_ratio, patch=None,
               shadow=True):
    """製品写真の指定位置にロゴを合成する。

    cx_ratio, cy_ratio : 画像幅・高さに対するロゴ中心の位置（0〜1）
    w_ratio            : 画像幅に対するロゴ直径の比
    patch              : ロゴの下に敷く円の色（刺しゅうワッペン風）。None なら敷かない
    """
    base = Image.open(base_path).convert("RGBA")
    W, H = base.size
    d = int(W * w_ratio)
    logo = Image.open(LOGO_PNG).convert("RGBA").resize((d, d), Image.LANCZOS)
    cx, cy = int(W * cx_ratio), int(H * cy_ratio)
    x, y = cx - d // 2, cy - d // 2

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if patch:
        pad = int(d * 0.055)
        pd = d + pad * 2
        pl = Image.new("RGBA", (pd, pd), (0, 0, 0, 0))
        ImageDraw.Draw(pl).ellipse([0, 0, pd - 1, pd - 1], fill=patch)
        layer.alpha_composite(pl, (x - pad, y - pad))
    if shadow:
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse(
            [x + int(d * 0.02), y + int(d * 0.03),
             x + d + int(d * 0.02), y + d + int(d * 0.03)], fill=(0, 0, 0, 70))
        sh = sh.filter(ImageFilter.GaussianBlur(d * 0.02))
        layer.alpha_composite(sh)
    layer.alpha_composite(logo, (x, y))

    out = Image.alpha_composite(base, layer).convert("RGB")
    out.save(out_path, quality=95)
    print("saved", out_path, out.size)


def find(name):
    for ext in (".png", ".jpg", ".jpeg"):
        p = os.path.join(PHOTOS, name + ext)
        if os.path.exists(p):
            return p
    return None


if __name__ == "__main__":
    build_circle_logo()

    jobs = [
        # (無地写真, 出力名, 中心X, 中心Y, 直径比, 下地パッチ色)
        ("mock_armband_plain", "mock_armband", 0.50, 0.50, 0.26, None),
        ("mock_vest_plain",    "mock_vest",    0.435, 0.345, 0.105, (255, 255, 255, 255)),
        ("mock_cap_plain",     "mock_cap",     0.50, 0.42, 0.16, (255, 255, 255, 255)),
    ]
    for src, dst, cx, cy, wr, patch in jobs:
        sp = find(src)
        if not sp:
            print("SKIP (無地写真がまだありません):", src)
            continue
        paste_logo(sp, os.path.join(PHOTOS, dst + ".jpg"), cx, cy, wr, patch=patch)
