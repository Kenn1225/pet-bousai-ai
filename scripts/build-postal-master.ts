/**
 * 郵便番号マスタービルドスクリプト
 * 日本郵便の郵便番号CSV（KEN_ALL.CSV）を解析し、
 * 都道府県マップと市区町村ヒントテーブルを生成する
 *
 * 使い方：
 *   1. https://www.post.japanpost.jp/zipcode/dl/utf-zip.html から
 *      KEN_ALL.CSV（UTF-8版）をダウンロード
 *   2. ファイルをこのスクリプトと同じディレクトリに置く
 *   3. npx ts-node scripts/build-postal-master.ts
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'

interface PrefectureEntry {
  prefCode: string
  prefName: string
  count: number
}

interface PostalRecord {
  zipcode: string
  prefName: string
  city: string
  town: string
}

// 郵便番号3桁プレフィックス → 都道府県の多数決マップを作成
async function buildPrefectureMap(csvPath: string): Promise<Record<string, string>> {
  const prefixMap: Record<string, PrefectureEntry[]> = {}

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
  })

  for await (const line of rl) {
    // KEN_ALL.CSV は以下のフォーマット（カンマ区切り、ダブルクォート囲み）
    // "郵便番号","都道府県コード","都道府県","市区町村","町域"
    const match = line.match(/"(\d+)","(\d+)","([^"]+)","([^"]+)","([^"]+)"/)
    if (!match) continue

    const [, zipcode, prefCode, prefName, city, town] = match
    const prefix = zipcode.slice(0, 3)

    if (!prefixMap[prefix]) prefixMap[prefix] = []
    const existing = prefixMap[prefix].find((e) => e.prefName === prefName)
    if (existing) {
      existing.count++
    } else {
      prefixMap[prefix].push({ prefCode, prefName, count: 1 })
    }
  }

  // 多数決でプレフィックス → 都道府県を確定
  const result: Record<string, string> = {}
  for (const [prefix, entries] of Object.entries(prefixMap)) {
    // countが最も多い都道府県を選択
    const winner = entries.reduce((a, b) => (a.count > b.count ? a : b))
    result[prefix] = winner.prefName

    // 注）複数の都道府県にまたがるプレフィックス（境界）は素朴に最多決で選んだが、
    // 本来はそのプレフィックスを5桁以上の粒度に分割して個別保持するのが正確。
    // 現在の簡略版では許容とする。
  }

  return result
}

// 市区町村ヒントを作成（補正フラグ対象の主要都市のみ、暫定版）
function buildCityHints(): Record<string, string> {
  // フェーズ3で補正フラグが確定した後、実際の市区町村リストと照合して拡張する
  // 以下は暫定的な主要都市のみ
  return {
    '100': '千代田区',
    '102': '千代田区',
    '980': '仙台市',
    '981': '仙台市',
    '220': '横浜市',
    '221': '横浜市',
    '330': 'さいたま市',
    '331': 'さいたま市',
    '450': '名古屋市',
    '530': '大阪市',
    '650': '神戸市',
    '600': '京都市',
    '730': '広島市',
    '810': '福岡市',
  }
}

async function main() {
  const csvPath = path.join(__dirname, 'KEN_ALL.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ KEN_ALL.csv が見つかりません: ${csvPath}`)
    console.error('以下からダウンロードしてください:')
    console.error('https://www.post.japanpost.jp/zipcode/dl/utf-zip.html')
    process.exit(1)
  }

  console.log('📖 郵便番号CSVを解析中...')
  const prefectureMap = await buildPrefectureMap(csvPath)
  const cityHints = buildCityHints()

  // 都道府県マップ生成
  const prefectureContent = `// Auto-generated: 郵便番号3桁プレフィックス → 都道府県
// DO NOT EDIT MANUALLY - Use scripts/build-postal-master.ts to regenerate

export const POSTAL_PREFECTURE_MAP: Record<string, string> = ${JSON.stringify(prefectureMap, null, 2)}
`

  const prefectureFile = path.join(__dirname, '../lib/data/postalPrefectureMap.ts')
  fs.mkdirSync(path.dirname(prefectureFile), { recursive: true })
  fs.writeFileSync(prefectureFile, prefectureContent)
  console.log(`✅ ${prefectureFile} を生成（${Object.keys(prefectureMap).length}件）`)

  // 市区町村ヒント生成
  const cityContent = `// Auto-generated: 郵便番号プレフィックス → 市区町村ヒント（補正フラグ対象のみ暫定版）
// DO NOT EDIT MANUALLY - Use scripts/build-postal-master.ts to regenerate

export const POSTAL_CITY_HINTS: Record<string, string> = ${JSON.stringify(cityHints, null, 2)}
`

  const cityFile = path.join(__dirname, '../lib/data/postalCityHints.ts')
  fs.writeFileSync(cityFile, cityContent)
  console.log(`✅ ${cityFile} を生成（${Object.keys(cityHints).length}件、暫定版）`)

  console.log('🎉 郵便番号マスター生成完了')
}

main().catch((err) => {
  console.error('❌ エラー:', err)
  process.exit(1)
})
