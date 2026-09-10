// 郵便番号ルックアップAPI
// CSV生成データから都道府県・市区町村を検索

import { POSTAL_PREFECTURE_MAP } from './data/postalPrefectureMap'
import { POSTAL_CITY_HINTS } from './data/postalCityHints'

export interface PostalLookupResult {
  postalCode: string
  prefecture: string
  city: string | null
  matchLevel: 'city' | 'prefecture'
}

/**
 * 郵便番号から都道府県・市区町村を検索
 * @param postalCode 郵便番号（ハイフンあり/なし両対応）
 * @returns 検索結果。市区町村が見つからない場合は matchLevel: 'prefecture'
 * @throws Error 都道府県自体が見つからない場合
 */
export function lookupPostalCode(postalCode: string): PostalLookupResult {
  // ハイフン・スペースをすべて削除
  const normalized = postalCode.replace(/[^\d]/g, '')

  if (normalized.length < 3 || normalized.length > 7) {
    throw new Error(`不正な郵便番号: ${postalCode}（7桁数字で入力してください）`)
  }

  // 3桁→5桁→7桁の順で検索。最初にヒットしたプレフィックスレベルで都道府県を確定
  let prefectureKey: string | undefined
  for (const len of [3, 5, 7]) {
    const prefix = normalized.slice(0, len)
    if (POSTAL_PREFECTURE_MAP[prefix]) {
      prefectureKey = prefix
      break
    }
  }

  if (!prefectureKey) {
    throw new Error(`郵便番号が見つかりません: ${postalCode}`)
  }

  const prefecture = POSTAL_PREFECTURE_MAP[prefectureKey]

  // 市区町村を5桁→7桁で検索
  let city: string | null = null
  let matchLevel: 'city' | 'prefecture' = 'prefecture'
  for (const len of [5, 7]) {
    const prefix = normalized.slice(0, len)
    if (POSTAL_CITY_HINTS[prefix]) {
      city = POSTAL_CITY_HINTS[prefix]
      matchLevel = 'city'
      break
    }
  }

  return {
    postalCode: normalized,
    prefecture,
    city,
    matchLevel,
  }
}
