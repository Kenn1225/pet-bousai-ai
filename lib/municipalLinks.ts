// 郵便番号プレフィックス → 市区町村ペット防災情報リンク

interface MunicipalInfo {
  name: string
  url: string
}

// 主要自治体のペット防災ページ（郵便番号上3桁で照合）
const MUNICIPAL_MAP: Record<string, MunicipalInfo> = {
  // 北海道
  '060': { name: '札幌市', url: 'https://www.city.sapporo.jp/hokenjo/doubutsu/' },
  '064': { name: '札幌市', url: 'https://www.city.sapporo.jp/hokenjo/doubutsu/' },
  // 宮城
  '980': { name: '仙台市', url: 'https://www.city.sendai.jp/doubutsu/' },
  '981': { name: '仙台市', url: 'https://www.city.sendai.jp/doubutsu/' },
  // 東京
  '100': { name: '千代田区', url: 'https://www.city.chiyoda.lg.jp/koho/kenko/eisei/doubutsu/index.html' },
  '102': { name: '千代田区', url: 'https://www.city.chiyoda.lg.jp/koho/kenko/eisei/doubutsu/index.html' },
  '103': { name: '中央区', url: 'https://www.city.chuo.lg.jp/a0064/kenkohukusi/eisei/dobutsuhogo/' },
  '104': { name: '中央区', url: 'https://www.city.chuo.lg.jp/a0064/kenkohukusi/eisei/dobutsuhogo/' },
  '105': { name: '港区', url: 'https://www.city.minato.tokyo.jp/eisei/kenko/dobutsu/' },
  '106': { name: '港区', url: 'https://www.city.minato.tokyo.jp/eisei/kenko/dobutsu/' },
  '107': { name: '港区', url: 'https://www.city.minato.tokyo.jp/eisei/kenko/dobutsu/' },
  '108': { name: '港区', url: 'https://www.city.minato.tokyo.jp/eisei/kenko/dobutsu/' },
  '110': { name: '台東区', url: 'https://www.city.taito.lg.jp/koseki/dobutsu/' },
  '111': { name: '台東区', url: 'https://www.city.taito.lg.jp/koseki/dobutsu/' },
  '112': { name: '文京区', url: 'https://www.city.bunkyo.lg.jp/bosai/dobutsu/' },
  '113': { name: '文京区', url: 'https://www.city.bunkyo.lg.jp/bosai/dobutsu/' },
  '114': { name: '北区', url: 'https://www.city.kita.tokyo.jp/hokentokeika/dobutsu/' },
  '115': { name: '北区', url: 'https://www.city.kita.tokyo.jp/hokentokeika/dobutsu/' },
  '116': { name: '荒川区', url: 'https://www.city.arakawa.tokyo.jp/a014/dobutsu/' },
  '120': { name: '足立区', url: 'https://www.city.adachi.tokyo.jp/kurashi/dobutsu/' },
  '121': { name: '足立区', url: 'https://www.city.adachi.tokyo.jp/kurashi/dobutsu/' },
  '122': { name: '足立区', url: 'https://www.city.adachi.tokyo.jp/kurashi/dobutsu/' },
  '123': { name: '足立区', url: 'https://www.city.adachi.tokyo.jp/kurashi/dobutsu/' },
  '124': { name: '葛飾区', url: 'https://www.city.katsushika.lg.jp/institution/1000083/1000464/' },
  '125': { name: '葛飾区', url: 'https://www.city.katsushika.lg.jp/institution/1000083/1000464/' },
  '130': { name: '墨田区', url: 'https://www.city.sumida.lg.jp/smph/kenko_fukushi/kenko/dobutsu/' },
  '131': { name: '墨田区', url: 'https://www.city.sumida.lg.jp/smph/kenko_fukushi/kenko/dobutsu/' },
  '132': { name: '江戸川区', url: 'https://www.city.edogawa.tokyo.jp/e007/bousaianzen/bousai/pet/' },
  '133': { name: '江戸川区', url: 'https://www.city.edogawa.tokyo.jp/e007/bousaianzen/bousai/pet/' },
  '134': { name: '江戸川区', url: 'https://www.city.edogawa.tokyo.jp/e007/bousaianzen/bousai/pet/' },
  '135': { name: '江東区', url: 'https://www.city.koto.lg.jp/451070/dobutsuhogo/' },
  '136': { name: '江東区', url: 'https://www.city.koto.lg.jp/451070/dobutsuhogo/' },
  '140': { name: '品川区', url: 'https://www.city.shinagawa.tokyo.jp/PC/kenko/kenko-dobutsu/' },
  '141': { name: '品川区', url: 'https://www.city.shinagawa.tokyo.jp/PC/kenko/kenko-dobutsu/' },
  '142': { name: '品川区', url: 'https://www.city.shinagawa.tokyo.jp/PC/kenko/kenko-dobutsu/' },
  '143': { name: '大田区', url: 'https://www.city.ota.tokyo.jp/seikatsu/dobutu/' },
  '144': { name: '大田区', url: 'https://www.city.ota.tokyo.jp/seikatsu/dobutu/' },
  '145': { name: '大田区', url: 'https://www.city.ota.tokyo.jp/seikatsu/dobutu/' },
  '146': { name: '大田区', url: 'https://www.city.ota.tokyo.jp/seikatsu/dobutu/' },
  '150': { name: '渋谷区', url: 'https://www.city.shibuya.tokyo.jp/kenko/dobutsu/' },
  '151': { name: '渋谷区', url: 'https://www.city.shibuya.tokyo.jp/kenko/dobutsu/' },
  '152': { name: '目黒区', url: 'https://www.city.meguro.tokyo.jp/gyosei/hokeneisei/dobutsu/' },
  '153': { name: '目黒区', url: 'https://www.city.meguro.tokyo.jp/gyosei/hokeneisei/dobutsu/' },
  '154': { name: '世田谷区', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/004/006/d00003487.html' },
  '155': { name: '世田谷区', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/004/006/d00003487.html' },
  '156': { name: '世田谷区', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/004/006/d00003487.html' },
  '157': { name: '世田谷区', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/004/006/d00003487.html' },
  '158': { name: '世田谷区', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/004/006/d00003487.html' },
  '160': { name: '新宿区', url: 'https://www.city.shinjuku.lg.jp/kenko/eisei03_001.html' },
  '161': { name: '新宿区', url: 'https://www.city.shinjuku.lg.jp/kenko/eisei03_001.html' },
  '162': { name: '新宿区', url: 'https://www.city.shinjuku.lg.jp/kenko/eisei03_001.html' },
  '163': { name: '新宿区', url: 'https://www.city.shinjuku.lg.jp/kenko/eisei03_001.html' },
  '164': { name: '中野区', url: 'https://www.city.tokyo-nakano.lg.jp/dept/113000/dobutsu/' },
  '165': { name: '中野区', url: 'https://www.city.tokyo-nakano.lg.jp/dept/113000/dobutsu/' },
  '166': { name: '杉並区', url: 'https://www.city.suginami.tokyo.jp/guide/kenko/dobutsu/' },
  '167': { name: '杉並区', url: 'https://www.city.suginami.tokyo.jp/guide/kenko/dobutsu/' },
  '168': { name: '杉並区', url: 'https://www.city.suginami.tokyo.jp/guide/kenko/dobutsu/' },
  '169': { name: '新宿区', url: 'https://www.city.shinjuku.lg.jp/kenko/eisei03_001.html' },
  '170': { name: '豊島区', url: 'https://www.city.toshima.lg.jp/143/kenko/eisei/doubutsu/' },
  '171': { name: '豊島区', url: 'https://www.city.toshima.lg.jp/143/kenko/eisei/doubutsu/' },
  '172': { name: '板橋区', url: 'https://www.city.itabashi.tokyo.jp/kenko/dobutsu/' },
  '173': { name: '板橋区', url: 'https://www.city.itabashi.tokyo.jp/kenko/dobutsu/' },
  '174': { name: '板橋区', url: 'https://www.city.itabashi.tokyo.jp/kenko/dobutsu/' },
  '175': { name: '板橋区', url: 'https://www.city.itabashi.tokyo.jp/kenko/dobutsu/' },
  '176': { name: '練馬区', url: 'https://www.city.nerima.tokyo.jp/kurashi/dobutsu/' },
  '177': { name: '練馬区', url: 'https://www.city.nerima.tokyo.jp/kurashi/dobutsu/' },
  '178': { name: '練馬区', url: 'https://www.city.nerima.tokyo.jp/kurashi/dobutsu/' },
  '179': { name: '練馬区', url: 'https://www.city.nerima.tokyo.jp/kurashi/dobutsu/' },
  '180': { name: '武蔵野市', url: 'https://www.city.musashino.lg.jp/kenko_fukushi/dobutsu/' },
  '181': { name: '三鷹市', url: 'https://www.city.mitaka.lg.jp/c_service/002/002892.html' },
  '182': { name: '調布市', url: 'https://www.city.chofu.tokyo.jp/www/genre/0000000000000/1000000000024/' },
  '183': { name: '府中市', url: 'https://www.city.fuchu.tokyo.jp/kenko/doubutsu/' },
  '184': { name: '小金井市', url: 'https://www.city.koganei.lg.jp/smph/kurashi/dobutsu/' },
  '185': { name: '国分寺市', url: 'https://www.city.kokubunji.tokyo.jp/kurashi/1005191/dobutsu/' },
  // 神奈川
  '220': { name: '横浜市', url: 'https://www.city.yokohama.lg.jp/kurashi/kenkou-iryo/doubutu/' },
  '221': { name: '横浜市', url: 'https://www.city.yokohama.lg.jp/kurashi/kenkou-iryo/doubutu/' },
  '222': { name: '横浜市', url: 'https://www.city.yokohama.lg.jp/kurashi/kenkou-iryo/doubutu/' },
  '210': { name: '川崎市', url: 'https://www.city.kawasaki.jp/350/category/71-5-0-0-0-0-0-0-0-0.html' },
  '211': { name: '川崎市', url: 'https://www.city.kawasaki.jp/350/category/71-5-0-0-0-0-0-0-0-0.html' },
  '212': { name: '川崎市', url: 'https://www.city.kawasaki.jp/350/category/71-5-0-0-0-0-0-0-0-0.html' },
  '250': { name: '小田原市', url: 'https://www.city.odawara.kanagawa.jp/field/welfare/hygiene/animal/' },
  // 埼玉
  '330': { name: 'さいたま市', url: 'https://www.city.saitama.jp/002/007/003/dobutsu/' },
  '331': { name: 'さいたま市', url: 'https://www.city.saitama.jp/002/007/003/dobutsu/' },
  '332': { name: 'さいたま市', url: 'https://www.city.saitama.jp/002/007/003/dobutsu/' },
  // 千葉
  '260': { name: '千葉市', url: 'https://www.city.chiba.jp/hokenfukushi/kenkou/eisei/dobutsu/' },
  '261': { name: '千葉市', url: 'https://www.city.chiba.jp/hokenfukushi/kenkou/eisei/dobutsu/' },
  '262': { name: '千葉市', url: 'https://www.city.chiba.jp/hokenfukushi/kenkou/eisei/dobutsu/' },
  // 愛知
  '450': { name: '名古屋市', url: 'https://www.city.nagoya.jp/kenkofukushi/category/32-2-0-0-0-0-0-0-0-0.html' },
  '451': { name: '名古屋市', url: 'https://www.city.nagoya.jp/kenkofukushi/category/32-2-0-0-0-0-0-0-0-0.html' },
  // 大阪
  '530': { name: '大阪市', url: 'https://www.city.osaka.lg.jp/kenkoiryo/category/2226-0-0-0-0-0-0-0-0-0.html' },
  '531': { name: '大阪市', url: 'https://www.city.osaka.lg.jp/kenkoiryo/category/2226-0-0-0-0-0-0-0-0-0.html' },
  '532': { name: '大阪市', url: 'https://www.city.osaka.lg.jp/kenkoiryo/category/2226-0-0-0-0-0-0-0-0-0.html' },
  '591': { name: '堺市', url: 'https://www.city.sakai.lg.jp/kenko/eisei/dobutsu/' },
  // 兵庫
  '650': { name: '神戸市', url: 'https://www.city.kobe.lg.jp/a68702/kenko/eisei/dobutsu/' },
  '651': { name: '神戸市', url: 'https://www.city.kobe.lg.jp/a68702/kenko/eisei/dobutsu/' },
  '652': { name: '神戸市', url: 'https://www.city.kobe.lg.jp/a68702/kenko/eisei/dobutsu/' },
  // 京都
  '600': { name: '京都市', url: 'https://www.city.kyoto.lg.jp/hokenfukushi/category/5-3-4-0-0-0-0-0-0-0.html' },
  '601': { name: '京都市', url: 'https://www.city.kyoto.lg.jp/hokenfukushi/category/5-3-4-0-0-0-0-0-0-0.html' },
  // 広島
  '730': { name: '広島市', url: 'https://www.city.hiroshima.lg.jp/soshiki/51/' },
  '731': { name: '広島市', url: 'https://www.city.hiroshima.lg.jp/soshiki/51/' },
  // 福岡
  '810': { name: '福岡市', url: 'https://www.city.fukuoka.lg.jp/hofuku/dobutsu/' },
  '811': { name: '福岡市', url: 'https://www.city.fukuoka.lg.jp/hofuku/dobutsu/' },
  '812': { name: '福岡市', url: 'https://www.city.fukuoka.lg.jp/hofuku/dobutsu/' },
  '813': { name: '福岡市', url: 'https://www.city.fukuoka.lg.jp/hofuku/dobutsu/' },
  // 熊本
  '860': { name: '熊本市', url: 'https://www.city.kumamoto.jp/hpkiji/pub/list.aspx?c_id=5&class_set_id=2&class_id=1282' },
  // 沖縄
  '900': { name: '那覇市', url: 'https://www.city.naha.okinawa.jp/kurasi/kenko/dobutu/' },
  '901': { name: '那覇市', url: 'https://www.city.naha.okinawa.jp/kurasi/kenko/dobutu/' },
}

// 郵便番号から自治体ペット防災リンクを取得
export function getMunicipalPetLink(postalCode: string): MunicipalInfo | null {
  const digits = postalCode.replace(/[^0-9]/g, '')
  const prefix = digits.slice(0, 3)
  return MUNICIPAL_MAP[prefix] ?? null
}

// 汎用的な都道府県レベルのリンク（個別自治体が見つからない場合）
export const FALLBACK_LINKS = {
  hazardMap: 'https://disaportal.gsi.go.jp/',
  envMinistry: 'https://www.env.go.jp/nature/dobutsu/aigo/2_data/pamph/h2509.html',
  shelterSearch: 'https://www.mlit.go.jp/saigai/saigai_bousai01_000014.html',
  jvma: 'https://www.jvma.or.jp/',
}
