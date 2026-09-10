// 持病・疾患マスターデータ

export type Disease =
  | '心臓病' | '腎臓病' | '糖尿病' | '癲癇'
  | 'アレルギー（食物）' | 'アレルギー（環境）' | '関節疾患・椎間板疾患'
  | '腫瘍・がん' | '甲状腺疾患' | '肝臓病' | '膵炎'
  | '皮膚病・外耳炎' | '眼科疾患（白内障等）' | '歯科疾患'
  | '呼吸器疾患（気管虚脱等）' | '泌尿器疾患（結石・膀胱炎）'
  | '感染症（既往）' | 'なし'

export interface DiseaseMasterData {
  riskScore: number       // 健康リスクへの加算点
  urgency: '高' | '中' | '低'
  note: string            // 避難時の注意点
  infoUrl: string         // 解説リンク（農水省・獣医師会等の公式）
  stockItems: string[]    // 必要な備蓄品
  amazonSearchUrl: string // Amazon 備蓄品検索
}

export const DISEASE_MASTER: Record<Disease, DiseaseMasterData> = {
  '心臓病': {
    riskScore: 25,
    urgency: '高',
    note: '強いストレス・運動は心発作を誘発。避難時も安静を保てる環境が必須。薬を切らすと急変リスクあり。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['処方薬（最低30日分）', '薬の説明書コピー', 'かかりつけ獣医の連絡先', '携帯用酸素スプレー'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+心臓病+サプリ+備蓄',
  },
  '腎臓病': {
    riskScore: 20,
    urgency: '高',
    note: '脱水が急速に進むと腎不全が悪化。新鮮な水と療法食の確保が最優先。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['腎臓病用療法食（最低30日分）', '処方薬', '携帯用水フィルター', '注射器（強制給水用）'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=腎臓病+療法食+ペット+備蓄',
  },
  '糖尿病': {
    riskScore: 20,
    urgency: '高',
    note: 'インスリン注射が中断すると命に関わる。インスリンの保冷（2〜8℃）と注射器の備蓄が必須。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['インスリン（保冷バッグ必須）', '注射器・針', '血糖値測定器', '糖分（低血糖時用）'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=インスリン+保冷バッグ+ペット',
  },
  '癲癇': {
    riskScore: 30,
    urgency: '高',
    note: 'ストレス・疲労・環境変化が発作を誘発しやすい。発作時の対処法を家族で共有しておく。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['抗てんかん薬（最低30日分）', '発作記録メモ', '獣医師の緊急連絡先', '発作時の安全マット'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=てんかん+ペット+発作+備蓄',
  },
  'アレルギー（食物）': {
    riskScore: 10,
    urgency: '中',
    note: '避難所や救援物資のフードでアレルギー反応が出る可能性が高い。アレルゲンフリーフードの自前備蓄が必須。',
    infoUrl: 'https://www.env.go.jp/nature/dobutsu/aigo/',
    stockItems: ['アレルゲン対応療法食（30日分以上）', 'アレルゲンリストメモ', '抗アレルギー薬'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+アレルギー対応+フード+無添加',
  },
  'アレルギー（環境）': {
    riskScore: 8,
    urgency: '中',
    note: '避難所環境（埃・カビ・他の動物）でアレルギーが悪化しやすい。抗アレルギー薬の備蓄を。',
    infoUrl: 'https://www.env.go.jp/nature/dobutsu/aigo/',
    stockItems: ['抗アレルギー薬', 'ペット用除菌・消臭スプレー', 'アレルギーメモ'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+アレルギー+薬+備蓄',
  },
  '関節疾患・椎間板疾患': {
    riskScore: 15,
    urgency: '中',
    note: '長距離の歩行・階段・段差が痛みを悪化させる。ペット用カートやキャリーで移動負荷を軽減。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['痛み止め（獣医処方）', 'ペット用カート', '矯正サポーター', '保温ブランケット'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+カート+老犬+関節+介護',
  },
  '腫瘍・がん': {
    riskScore: 20,
    urgency: '高',
    note: '治療中断・ストレスが急速な悪化を招く。抗がん剤・痛み止めの備蓄と緊急連絡先の確保が重要。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['抗がん剤・処方薬', '痛み止め', '高カロリー補助食', 'かかりつけ獣医の連絡先'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+がん+サポート+フード',
  },
  '甲状腺疾患': {
    riskScore: 15,
    urgency: '中',
    note: '甲状腺ホルモン薬の中断で急変する可能性。薬の継続投与が最優先。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['甲状腺薬（30日分以上）', '薬の説明書', 'かかりつけ獣医の連絡先'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+甲状腺+サポート',
  },
  '肝臓病': {
    riskScore: 18,
    urgency: '高',
    note: '低タンパク療法食の中断や不適切な食事で急性悪化のリスク。食事管理が命綱。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['肝臓病用療法食（30日分）', '処方薬', 'サプリメント（SAMe等）'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=肝臓病+療法食+ペット',
  },
  '膵炎': {
    riskScore: 15,
    urgency: '中',
    note: '脂肪分の多い食事や絶食が発作を誘発。低脂肪食の備蓄と適切な給餌リズムの維持が重要。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['低脂肪療法食', '処方薬', '補液キット（脱水対策）'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=膵炎+低脂肪+ペット+療法食',
  },
  '皮膚病・外耳炎': {
    riskScore: 8,
    urgency: '低',
    note: '避難所の衛生環境悪化で症状が悪化しやすい。消毒薬・外用薬の備蓄を。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['処方外用薬', 'ペット用消毒薬', 'ガーゼ・包帯', '耳洗浄液'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+皮膚炎+外耳炎+薬+備蓄',
  },
  '眼科疾患（白内障等）': {
    riskScore: 10,
    urgency: '低',
    note: '視覚障害があると避難時の移動が危険。リードを短めに持ち、周囲の状況を声で伝えてあげる。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['点眼薬', 'エリザベスカラー', '目の保護用バンダナ'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+目薬+眼科疾患+サポート',
  },
  '歯科疾患': {
    riskScore: 5,
    urgency: '低',
    note: '重度の歯周病は敗血症リスクあり。ドライフードへの切り替えが困難な場合、柔らかい非常食を備蓄。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['ウェットフード（やわらかい食事）', '歯磨きセット', '口腔消臭スプレー'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+歯磨き+ウェットフード',
  },
  '呼吸器疾患（気管虚脱等）': {
    riskScore: 18,
    urgency: '高',
    note: '興奮・暑さ・埃でも発作が起きやすい。ハーネス使用必須（首輪は気管を圧迫）。携帯酸素も検討。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['処方薬（気管支拡張薬等）', 'ハーネス', '携帯酸素スプレー', '保冷グッズ'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+呼吸器+酸素スプレー+ハーネス',
  },
  '泌尿器疾患（結石・膀胱炎）': {
    riskScore: 12,
    urgency: '中',
    note: '水分摂取量の低下が結石・尿閉を悪化させる。避難時も新鮮な水を十分に与えることが最優先。',
    infoUrl: 'https://www.jbvp.org/',
    stockItems: ['泌尿器ケア療法食', '利尿促進サプリ', '携帯用給水器', '処方薬'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+泌尿器+療法食+結石',
  },
  '感染症（既往）': {
    riskScore: 10,
    urgency: '中',
    note: '免疫力が低下しているため、避難所での感染症二次罹患リスクが高い。他の動物との接触を最小化。',
    infoUrl: 'https://www.env.go.jp/nature/dobutsu/aigo/',
    stockItems: ['処方薬', '消毒用アルコール', 'ペット用マスク・フィルター', 'サプリメント（免疫強化）'],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+免疫+サプリ+感染症対策',
  },
  'なし': {
    riskScore: 0,
    urgency: '低',
    note: '健康なペットでも避難所環境は大きなストレスになります。定期的な様子確認を忘れずに。',
    infoUrl: 'https://www.env.go.jp/nature/dobutsu/aigo/',
    stockItems: [],
    amazonSearchUrl: 'https://www.amazon.co.jp/s?k=ペット+防災+備蓄セット',
  },
}
