// PBA2026-100 〜 PBA2026-500 の範囲内であれば有効なアクセスコードとして扱う
export function isValidRangeCode(code: string): boolean {
  const m = code.trim().match(/^PBA2026-(\d{3})$/)
  if (!m) return false
  const n = Number(m[1])
  return n >= 100 && n <= 500
}
