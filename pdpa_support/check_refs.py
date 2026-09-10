# -*- coding: utf-8 -*-
"""
PDPA 出典アップデート監視（案4の中核）

refs.json に登録した公的資料のページを取得して内容のハッシュを比較し、
変化を検知したら slide_refs.json を逆引きして
「どの教材の何ページを改訂すべきか」を特定する。

使い方:
    python check_refs.py --seed     # 初回。現状をベースラインとして保存する（通知しない）
    python check_refs.py            # 差分チェック。変化があれば report.json を出力
    python check_refs.py --id REF-002   # 特定の資料だけ確認

運用上の注意:
    官公庁サイトへの負荷を避けるため 1 日 1 回までとし、リクエスト間隔を空ける。
    Vercel の Cron（vercel.json）から日次で叩く想定。
"""
import argparse
import glob
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone, timedelta

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
REFS = os.path.join(HERE, "refs.json")
STATE = os.path.join(HERE, "refs_state.json")
REPORT = os.path.join(HERE, "refs_report.json")

JST = timezone(timedelta(hours=9))
UA = ("PDPA-RefMonitor/1.0 "
      "(Pet Disaster Preparedness Advisor Association; educational material maintenance)")
REQUEST_INTERVAL = 2.0     # 秒。官公庁サイトへの配慮
TIMEOUT = 30

# 更新と無関係に毎回変わりうる要素は比較対象から外す
_STRIP = [
    re.compile(r"<script\b.*?</script>", re.S | re.I),
    re.compile(r"<style\b.*?</style>", re.S | re.I),
    re.compile(r"<!--.*?-->", re.S),
    re.compile(r"<[^>]+>"),                      # タグを落として本文だけ残す
]
_CSRF = re.compile(r"(csrf|nonce|sessionid|_token)[=\"':\s]+[A-Za-z0-9_\-]{8,}", re.I)


def content_hash(html):
    """表示テキストだけを取り出して正規化したハッシュを返す"""
    text = html
    for pat in _STRIP:
        text = pat.sub(" ", text)
    text = _CSRF.sub(" ", text)
    text = re.sub(r"&nbsp;?", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return hashlib.sha256(text.encode("utf-8", "ignore")).hexdigest(), len(text)


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def load_slide_index():
    """slides_output/*/slide_refs.json を集めて REF番号 → 教材ページ の逆引きを作る"""
    index = {}
    pattern = os.path.join(REPO, "slides_output", "*", "slide_refs.json")
    for path in glob.glob(pattern):
        data = load_json(path, {})
        material = data.get("material", os.path.basename(os.path.dirname(path)))
        for page, info in (data.get("slides") or {}).items():
            for ref in info.get("refs", []):
                index.setdefault(ref, []).append({
                    "material": material,
                    "page": int(page),
                    "source": info.get("source", ""),
                })
    for ref in index:
        index[ref].sort(key=lambda r: (r["material"], r["page"]))
    return index


def fetch(url):
    r = requests.get(url, headers={"User-Agent": UA}, timeout=TIMEOUT)
    r.raise_for_status()
    if not r.encoding or r.encoding.lower() == "iso-8859-1":
        r.encoding = r.apparent_encoding
    return r.text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", action="store_true",
                    help="現状をベースラインとして保存する（差分は報告しない）")
    ap.add_argument("--id", action="append", default=None,
                    help="対象の REF 番号を絞る（複数指定可）")
    args = ap.parse_args()

    ledger = load_json(REFS)
    if not ledger:
        print("refs.json が見つかりません", file=sys.stderr)
        return 1
    refs = ledger["refs"]
    if args.id:
        refs = [r for r in refs if r["id"] in args.id]

    state = load_json(STATE, {}) or {}
    slide_index = load_slide_index()
    now = datetime.now(JST).isoformat(timespec="seconds")

    changed, errors, unchanged = [], [], 0

    for i, ref in enumerate(refs):
        if i:
            time.sleep(REQUEST_INTERVAL)
        rid, url = ref["id"], ref["url"]
        try:
            h, size = content_hash(fetch(url))
        except Exception as e:
            errors.append({"id": rid, "url": url, "error": str(e)[:200]})
            print("  ERROR %s  %s" % (rid, str(e)[:120]))
            continue

        prev = state.get(rid)
        state[rid] = {"hash": h, "size": size, "checked_at": now, "url": url}

        if prev is None:
            print("  NEW   %s  %s" % (rid, ref["title"][:40]))
            continue
        if prev["hash"] == h:
            unchanged += 1
            continue

        affected = slide_index.get(rid, [])
        changed.append({
            "id": rid,
            "title": ref["title"],
            "issuer": ref["issuer"],
            "url": url,
            "prev_checked_at": prev.get("checked_at"),
            "size_before": prev.get("size"),
            "size_after": size,
            "affected_slides": affected,
            "note": ref.get("note", ""),
        })
        state[rid]["last_changed_at"] = now
        print("  CHANGED %s  %s  -> 影響ページ %d件"
              % (rid, ref["title"][:34], len(affected)))

    save_json(STATE, state)

    if args.seed:
        print("\nベースラインを保存しました: %s (%d件)" % (STATE, len(state)))
        return 0

    report = {"checked_at": now, "changed": changed, "errors": errors,
              "unchanged": unchanged}
    save_json(REPORT, report)

    print("\n--- 結果 ---")
    print("変化あり %d / 変化なし %d / エラー %d" % (len(changed), unchanged, len(errors)))
    for c in changed:
        print("\n■ %s %s（%s）" % (c["id"], c["title"], c["issuer"]))
        print("  %s" % c["url"])
        if c["note"]:
            print("  留意: %s" % c["note"])
        if c["affected_slides"]:
            print("  改訂を検討すべき教材ページ:")
            for a in c["affected_slides"]:
                print("    - %s p.%d  %s" % (a["material"], a["page"], a["source"][:60]))
        else:
            print("  （この資料を出典にしている教材ページはまだありません）")
    print("\nレポート: %s" % REPORT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
