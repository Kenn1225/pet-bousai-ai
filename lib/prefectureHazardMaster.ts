// 47都道府県ハザード基礎マスター
// 地震傾向・台風頻度・豪雪・活火山の情報を都道府県ごとに記載

export type EarthquakeTendency = 'very-high' | 'high' | 'medium' | 'low'
export type TyphoonFrequency = 'very-high' | 'high' | 'medium' | 'low'

export interface PrefectureHazardProfile {
  prefecture: string
  region: string // 地方区分
  earthquakeTendency: EarthquakeTendency // 地震リスク傾向
  typhoonFrequency: TyphoonFrequency // 台風上陸・接近の頻度
  hasCoast: boolean // 海に面するか
  heavySnowArea: boolean // 豪雪地帯・特別豪雪地帯に指定
  hasActiveVolcano: boolean // 常時観測火山を含むか
  notes: string
  source: string
}

export const PREFECTURE_HAZARD_MASTER: Record<string, PrefectureHazardProfile> = {
  北海道: {
    prefecture: '北海道',
    region: '北海道',
    earthquakeTendency: 'very-high', // 千島海溝、日本海溝（太平洋側）
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: true, // 火山帯: 支笏火山群、阿蘇山等
    notes: '北海道は複数の活火山帯に位置し、特に太平洋側は千島海溝の地震リスク大',
    source: '地震調査研究推進本部、気象庁、国土交通省',
  },
  青森県: {
    prefecture: '青森県',
    region: '東北',
    earthquakeTendency: 'very-high', // 日本海溝（三陸沖）
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: true, // 八甲田山、岩木山等
    notes: '日本海溝の外縁、太平洋側で巨大地震リスク高い',
    source: '地震調査研究推進本部、気象庁',
  },
  岩手県: {
    prefecture: '岩手県',
    region: '東北',
    earthquakeTendency: 'very-high', // 日本海溝（三陸沖）
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '2011年東日本大震災の震源地直近。日本海溝に面している',
    source: '地震調査研究推進本部',
  },
  宮城県: {
    prefecture: '宮城県',
    region: '東北',
    earthquakeTendency: 'very-high', // 日本海溝（三陸沖）
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '東日本大震災の主震源地。日本海溝に直接面している',
    source: '地震調査研究推進本部',
  },
  秋田県: {
    prefecture: '秋田県',
    region: '東北',
    earthquakeTendency: 'high', // 日本海東縁の地震帯
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '日本海側の活動的な地震帯に位置。豪雪地帯',
    source: '地震調査研究推進本部、国土交通省',
  },
  山形県: {
    prefecture: '山形県',
    region: '東北',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: true, // 鳥海山
    notes: '日本海側に位置。豪雪、活火山を含む',
    source: '地震調査研究推進本部、気象庁、国土交通省',
  },
  福島県: {
    prefecture: '福島県',
    region: '東北',
    earthquakeTendency: 'very-high', // 東経142度線上の地震帯、日本海溝側面
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '複数の地震帯に近接。太平洋側と日本海側両側がリスク',
    source: '地震調査研究推進本部',
  },
  茨城県: {
    prefecture: '茨城県',
    region: '関東',
    earthquakeTendency: 'very-high', // 日本海溝、北米プレート内地震帯
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '2011年東日本大震災による大被害。日本海溝に面している',
    source: '地震調査研究推進本部',
  },
  栃木県: {
    prefecture: '栃木県',
    region: '関東',
    earthquakeTendency: 'high', // 太平洋プレート、北米プレート境界
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: true, // 日光火山群
    notes: '内陸県だが北米プレート内地震帯に含まれる。火山あり',
    source: '地震調査研究推進本部、気象庁',
  },
  群馬県: {
    prefecture: '群馬県',
    region: '関東',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: true, // 一部指定
    hasActiveVolcano: false,
    notes: '内陸県だが地震活動が活発。一部豪雪地帯',
    source: '地震調査研究推進本部、国土交通省',
  },
  埼玉県: {
    prefecture: '埼玉県',
    region: '関東',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '内陸県だが首都圏直下地震の影響を受ける可能性',
    source: '地震調査研究推進本部',
  },
  千葉県: {
    prefecture: '千葉県',
    region: '関東',
    earthquakeTendency: 'very-high', // 日本海溝、房総沖の活動帯
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '房総沖の複雑な地形が地震リスクを高める。台風直撃も多い',
    source: '地震調査研究推進本部',
  },
  東京都: {
    prefecture: '東京都',
    region: '関東',
    earthquakeTendency: 'very-high', // 首都直下地震の最大リスク地域
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 伊豆-小笠原火山帯
    notes: '首都直下地震による震度7の被害が想定される最高リスク地域',
    source: '地震調査研究推進本部、気象庁',
  },
  神奈川県: {
    prefecture: '神奈川県',
    region: '関東',
    earthquakeTendency: 'very-high', // 相模トラフ、関東地震帯
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 箱根山等
    notes: '相模トラフが直下にあり、大規模地震リスクが高い',
    source: '地震調査研究推進本部、気象庁',
  },
  新潟県: {
    prefecture: '新潟県',
    region: '中部',
    earthquakeTendency: 'high', // 日本海東縁の地震帯、新潟県地震帯
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: true, // 新潟焼山
    notes: '日本海側の活動的な地震帯。豪雪、活火山を含む',
    source: '地震調査研究推進本部、国土交通省、気象庁',
  },
  富山県: {
    prefecture: '富山県',
    region: '中部',
    earthquakeTendency: 'high', // 日本海東縁の地震帯
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '日本海側の地震帯に位置。豪雪地帯',
    source: '地震調査研究推進本部、国土交通省',
  },
  石川県: {
    prefecture: '石川県',
    region: '中部',
    earthquakeTendency: 'high', // 日本海東縁の地震帯、能登半島地震帯
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '日本海側地震帯。能登半島の地震活動も活発。豪雪',
    source: '地震調査研究推進本部、国土交通省',
  },
  福井県: {
    prefecture: '福井県',
    region: '中部',
    earthquakeTendency: 'high', // 日本海東縁の地震帯
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '日本海側地震帯に位置。豪雪地帯。原発立地県',
    source: '地震調査研究推進本部、国土交通省',
  },
  山梨県: {
    prefecture: '山梨県',
    region: '中部',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: true, // 富士山
    notes: '内陸県だが富士山直下の深い地震がある。火山',
    source: '地震調査研究推進本部、気象庁',
  },
  長野県: {
    prefecture: '長野県',
    region: '中部',
    earthquakeTendency: 'high', // 糸魚川-静岡構造線の地震帯
    typhoonFrequency: 'low',
    hasCoast: false, // 内陸県
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: true, // 浅間山、白山等
    notes: '内陸県だが活動的な断層帯を含む。豪雪、活火山',
    source: '地震調査研究推進本部、国土交通省、気象庁',
  },
  岐阜県: {
    prefecture: '岐阜県',
    region: '中部',
    earthquakeTendency: 'high', // 糸魚川-静岡構造線、東海地震に関連
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: true, // 白山
    notes: '内陸県だが南部は東海地震の想定震源に近い',
    source: '地震調査研究推進本部、気象庁',
  },
  静岡県: {
    prefecture: '静岡県',
    region: '中部',
    earthquakeTendency: 'very-high', // 東海地震、南海トラフの最大リスク地域
    typhoonFrequency: 'high', // 台風の常襲地帯
    hasCoast: true,
    heavySnowArea: true, // 一部指定（山間部）
    hasActiveVolcano: true, // 富士山
    notes: '東海地震・南海トラフの最大リスク地域。台風常襲地帯。火山',
    source: '地震調査研究推進本部、気象庁、国土交通省',
  },
  愛知県: {
    prefecture: '愛知県',
    region: '東海',
    earthquakeTendency: 'very-high', // 南海トラフに面している
    typhoonFrequency: 'high', // 台風常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフの想定震源に直面。台風常襲地帯',
    source: '地震調査研究推進本部、気象庁',
  },
  三重県: {
    prefecture: '三重県',
    region: '関西',
    earthquakeTendency: 'very-high', // 南海トラフの想定震源
    typhoonFrequency: 'very-high', // 台風の最大常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフの直上。台風常襲地帯では最も頻度が高い',
    source: '地震調査研究推進本部、気象庁',
  },
  滋賀県: {
    prefecture: '滋賀県',
    region: '関西',
    earthquakeTendency: 'medium',
    typhoonFrequency: 'low',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '内陸県。琵琶湖を有する。地震リスクは相対的に低い',
    source: '地震調査研究推進本部',
  },
  京都府: {
    prefecture: '京都府',
    region: '関西',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: 'ユーラシア・フィリピンプレート境界に近い',
    source: '地震調査研究推進本部',
  },
  大阪府: {
    prefecture: '大阪府',
    region: '関西',
    earthquakeTendency: 'high', // 上町断層など活動断層が多い
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: 'インタープレート境界が比較的近い。都市直下地震リスク',
    source: '地震調査研究推進本部',
  },
  兵庫県: {
    prefecture: '兵庫県',
    region: '関西',
    earthquakeTendency: 'very-high', // 兵庫県南部地震の震源地。鈴鹿山脈と関連
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 一部指定
    hasActiveVolcano: false,
    notes: '1995年兵庫県南部地震による大被害の歴史。南海トラフにも面している',
    source: '地震調査研究推進本部、国土交通省',
  },
  奈良県: {
    prefecture: '奈良県',
    region: '関西',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: false, // 内陸県
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '内陸県だが南部で南海トラフの影響を受ける可能性',
    source: '地震調査研究推進本部',
  },
  和歌山県: {
    prefecture: '和歌山県',
    region: '関西',
    earthquakeTendency: 'very-high', // 南海トラフの直上
    typhoonFrequency: 'very-high', // 台風常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフの想定震源。台風最大常襲地域の1つ',
    source: '地震調査研究推進本部、気象庁',
  },
  鳥取県: {
    prefecture: '鳥取県',
    region: '中国',
    earthquakeTendency: 'high',
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 全域指定
    hasActiveVolcano: false,
    notes: '日本海側。豪雪地帯',
    source: '国土交通省',
  },
  島根県: {
    prefecture: '島根県',
    region: '中国',
    earthquakeTendency: 'high',
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: true, // 一部指定
    hasActiveVolcano: true, // 三瓶山
    notes: '日本海側。活火山を含む',
    source: '地震調査研究推進本部、気象庁、国土交通省',
  },
  岡山県: {
    prefecture: '岡山県',
    region: '中国',
    earthquakeTendency: 'medium',
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 一部指定（山間部）
    hasActiveVolcano: false,
    notes: '「晴れの国」として知られ相対的に天災が少ない',
    source: '地震調査研究推進本部',
  },
  広島県: {
    prefecture: '広島県',
    region: '中国',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: true, // 一部指定
    hasActiveVolcano: false,
    notes: '瀬戸内海側と日本海側で地震動が異なる',
    source: '地震調査研究推進本部、国土交通省',
  },
  山口県: {
    prefecture: '山口県',
    region: '中国',
    earthquakeTendency: 'medium',
    typhoonFrequency: 'low',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '地形的に比較的安定している',
    source: '地震調査研究推進本部',
  },
  徳島県: {
    prefecture: '徳島県',
    region: '四国',
    earthquakeTendency: 'very-high', // 南海トラフ直上
    typhoonFrequency: 'very-high', // 台風常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフの直上。台風の最大常襲地帯',
    source: '地震調査研究推進本部、気象庁',
  },
  香川県: {
    prefecture: '香川県',
    region: '四国',
    earthquakeTendency: 'high', // 南海トラフに関連
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '瀬戸内海側は相対的に静穏',
    source: '地震調査研究推進本部',
  },
  愛媛県: {
    prefecture: '愛媛県',
    region: '四国',
    earthquakeTendency: 'very-high', // 南海トラフに面している
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 石鎚山等
    notes: '南海トラフの想定震源に面している',
    source: '地震調査研究推進本部、気象庁',
  },
  高知県: {
    prefecture: '高知県',
    region: '四国',
    earthquakeTendency: 'very-high', // 南海トラフの直上
    typhoonFrequency: 'very-high', // 台風最大常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフ直上。台風最大常襲地帯。降水量が日本で最大',
    source: '地震調査研究推進本部、気象庁',
  },
  福岡県: {
    prefecture: '福岡県',
    region: '九州',
    earthquakeTendency: 'high',
    typhoonFrequency: 'high', // 台風常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '台風常襲地帯。地震活動も活発',
    source: '地震調査研究推進本部、気象庁',
  },
  佐賀県: {
    prefecture: '佐賀県',
    region: '九州',
    earthquakeTendency: 'high',
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '台風常襲地帯',
    source: '地震調査研究推進本部、気象庁',
  },
  長崎県: {
    prefecture: '長崎県',
    region: '九州',
    earthquakeTendency: 'high',
    typhoonFrequency: 'very-high', // 台風最大常襲地帯の1つ
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 雲仙普賢岳
    notes: '台風最大常襲地帯。活火山を含む',
    source: '地震調査研究推進本部、気象庁',
  },
  熊本県: {
    prefecture: '熊本県',
    region: '九州',
    earthquakeTendency: 'very-high', // 中央構造線、布田川断層帯
    typhoonFrequency: 'high',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 阿蘇火山群
    notes: '2016年熊本地震の震源地。活火山を含む',
    source: '地震調査研究推進本部、気象庁',
  },
  大分県: {
    prefecture: '大分県',
    region: '九州',
    earthquakeTendency: 'high',
    typhoonFrequency: 'medium',
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 阿蘇、由布山等
    notes: '活火山を含む。温泉県として知られる',
    source: '地震調査研究推進本部、気象庁',
  },
  宮崎県: {
    prefecture: '宮崎県',
    region: '九州',
    earthquakeTendency: 'very-high', // 南海トラフ、日向灘の地震帯
    typhoonFrequency: 'very-high', // 台風常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '南海トラフ、日向灘の地震帯に面している。台風常襲地帯',
    source: '地震調査研究推進本部、気象庁',
  },
  鹿児島県: {
    prefecture: '鹿児島県',
    region: '九州',
    earthquakeTendency: 'very-high', // 南海トラフに関連。琉球トラフ
    typhoonFrequency: 'very-high', // 台風の最大常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: true, // 桜島（日本で最も活動的）、霧島山等
    notes: '南海トラフ・琉球トラフに面している。桜島は世界で最も活動的な活火山',
    source: '地震調査研究推進本部、気象庁',
  },
  沖縄県: {
    prefecture: '沖縄県',
    region: '九州・沖縄',
    earthquakeTendency: 'very-high', // 琉球トラフ
    typhoonFrequency: 'very-high', // 台風最大常襲地帯
    hasCoast: true,
    heavySnowArea: false,
    hasActiveVolcano: false,
    notes: '琉球トラフ上に位置。台風最大常襲地帯',
    source: '地震調査研究推進本部、気象庁',
  },
}

/**
 * 都道府県がハザード地域か判定
 * @param prefecture 都道府県名
 * @returns ハザード情報。見つからない場合は null
 */
export function getPrefectureHazard(prefecture: string): PrefectureHazardProfile | null {
  return PREFECTURE_HAZARD_MASTER[prefecture] ?? null
}
