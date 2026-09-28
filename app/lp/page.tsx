import Link from 'next/link'
import Image from 'next/image'

const LINE_URL = 'https://line.me/R/ti/p/@941zsnxl'

// Unsplash 無料写真（クレジット不要）
const PHOTOS = {
  dog:    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
  cat:    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
  rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80',
  bird:   'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=900&q=80',
  senior: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&w=900&q=80',
}

const LINE_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
)

export default function LpPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontSize: '18px' }}>

      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6 pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src={PHOTOS.dog} alt="" fill style={{ objectFit: 'cover' }} priority />
        </div>
        <div className="relative z-10">
          <p className="text-sm tracking-widest text-emerald-400 font-semibold mb-5">
            自然災害危機管理士 × ペット災害危機管理士 Wライセンス監修
          </p>
          <h1 className="text-3xl font-black leading-tight mb-6">
            もし明日、大地震が来たら──<br />
            <span className="text-emerald-400">あなたのペットを、</span><br />
            守れますか？
          </h1>
          <p className="text-base text-gray-200 leading-loose mb-8">
            「知っていれば、防げた」<br />
            被災してペットを失った方が、後から必ず言う言葉です。<br /><br />
            正しい知識と準備があれば、<br />
            うちの子は生き残れた──。<br /><br />
            そして今、その知識を「教える側」になることで<br />
            <span className="text-emerald-400 font-bold">地域に必要とされ、副業収入まで得られる</span><br />
            唯一のプログラムがあります。
          </p>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-emerald-400 active:scale-95 transition-all">
            {LINE_SVG} プログラムの詳細を見る ↓
          </a>
          <p className="text-sm text-gray-400 mt-4">※ 一般社団法人ペット防災アドバイザー協会が運営しています</p>
        </div>
      </section>

      {/* ─── ペット写真グリッド ─── */}
      <section className="bg-white px-4 py-8">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          {[
            { src: PHOTOS.dog,    alt: '犬' },
            { src: PHOTOS.cat,    alt: '猫' },
            { src: PHOTOS.rabbit, alt: 'うさぎ' },
            { src: PHOTOS.bird,   alt: '鳥' },
          ].map(p => (
            <div key={p.alt} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
              <Image src={p.src} alt={p.alt} fill style={{ objectFit: 'cover' }} />
              <div className="absolute inset-x-0 bottom-0 bg-black/30 text-white text-xs text-center py-1 font-bold">
                {p.alt}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-base text-gray-500 mt-4">
          犬・猫・うさぎ・鳥──<br />すべてのペットに対応したプログラムです
        </p>
      </section>

      {/* ─── 衝撃データ ─── */}
      <section className="bg-red-900 text-white px-6 py-10 text-center">
        <p className="text-sm text-red-300 tracking-widest font-semibold mb-5">知らないと後悔する数字</p>
        <div className="space-y-5">
          {[
            { num: '82%', text: '東日本大震災でペットを「同行避難できなかった」飼い主の割合', src: '（環境省調査）' },
            { num: '4割', text: '全国の指定避難所のうち、ペット受け入れができない施設の割合', src: '（内閣府調査）' },
            { num: '30日', text: '環境省が推奨するペット用食料の最低備蓄日数', src: '（2023年改訂版ガイドライン）' },
          ].map(d => (
            <div key={d.num} className="bg-red-800 rounded-xl p-5">
              <div className="text-5xl font-black text-yellow-300 mb-2">{d.num}</div>
              <p className="text-base text-red-100 leading-relaxed">{d.text}</p>
              <p className="text-sm text-red-400 mt-1">{d.src}</p>
            </div>
          ))}
        </div>
        <p className="text-base text-red-200 mt-6 leading-relaxed">
          「うちは大丈夫」──そう思っている方のほとんどが、<br />
          いざというとき、何もできなかったのです。
        </p>
      </section>

      {/* ─── 共感ストーリー ─── */}
      <section className="px-6 py-12 bg-gray-50">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-6">REAL STORY</p>
        <div className="relative mb-6 rounded-2xl overflow-hidden h-48">
          <Image src={PHOTOS.cat} alt="猫と飼い主" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-base font-bold text-center px-4">
              大切な家族を<br />守れなかった後悔
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-400 mb-3">2024年1月 能登半島地震 被災者の声</p>
          <p className="text-base text-gray-800 leading-loose italic">
            「20年間一緒に暮らした猫を連れて避難所に向かいました。<br />
            でも入口で『動物はお断りです』と言われました。<br /><br />
            真冬の車の中で、猫と二人で一週間過ごしました。<br />
            猫は翌週、亡くなりました。<br /><br />
            <span className="font-bold text-gray-900">知っていれば、別の避難所を探せた。<br />
            準備していれば、命を繋げた。</span><br /><br />
            知らなかった自分を、今も責め続けています。」
          </p>
          <p className="text-sm text-gray-400 mt-4">（70代・女性。本人の承諾のもと掲載）</p>
        </div>
        <p className="text-base text-gray-600 leading-loose mt-6 text-center">
          この後悔を、全国のペット飼育者に<br />
          繰り返させてはいけない。<br /><br />
          それが、このプログラムを作った理由です。
        </p>
      </section>

      {/* ─── 講師紹介 ─── */}
      <section className="px-6 py-12 bg-white">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-8">INSTRUCTOR</p>
        <div className="max-w-4xl mx-auto md:flex md:items-center md:gap-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center text-4xl flex-shrink-0">
                🐾
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-bold">プログラム監修・講師</p>
                <p className="text-xl font-black text-gray-900">佐藤ケン</p>
                <p className="text-sm text-gray-500">一般社団法人ペット防災アドバイザー協会 代表理事</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {[
                'ペット災害危機管理士',
                'ペット救急救命士',
                '自然災害危機管理士',
                'ドッグトレーナー歴 ニューヨーク10年・東京18年（継続中）',
                'ペット専門学校 講師歴17年',
              ].map(c => (
                <div key={c} className="flex gap-3 text-base text-gray-700">
                  <span className="text-emerald-500 flex-shrink-0 font-bold">✓</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <p className="text-base text-gray-600 leading-loose border-t border-emerald-200 pt-5">
              「ニューヨークと東京で合わせて28年、ドッグトレーナーとして活動してきました。
              現場で見てきた一番の後悔は、飼い主さんが正しい知識を持っていなかったこと。
              ペット専門学校で17年間教えてきた経験と、自然災害・ペット防災の両ライセンスを持つ
              専門家として、『知っている』を『命を救える』に変えるお手伝いをします。」
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:w-80 flex-shrink-0 flex flex-col items-center gap-4">
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-emerald-200">
              <Image src="/images/instructor-kenn.jpg" alt="佐藤ケン講師" fill style={{ objectFit: 'cover' }} />
              <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full overflow-hidden shadow-lg border-4 border-white bg-white">
                <Image src="/images/official-emblem.jpg" alt="ペット防災アドバイザー 公式認定エンブレム" fill style={{ objectFit: 'cover' }} />
              </div>
            </div>
            <div className="w-64 md:w-72 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image src="/images/online-course.png" alt="佐藤ケン講師によるオンライン講座の様子"
                width={1080} height={589} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── プログラム内容 ─── */}
      <section className="px-6 py-12 bg-gray-50">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-2">PROGRAM</p>
        <h2 className="text-2xl font-black text-gray-900 text-center mb-3">
          命を守る１２の防災スキル<br />
          <span className="text-lg text-violet-600">＋ ４つの防災特化型<br className="sm:hidden" />ペットトレーニングメソッド</span>
        </h2>
        <p className="text-sm text-gray-400 text-center mb-2">全12回講義＋ペットトレーニング動画4本</p>
        <p className="text-sm text-gray-400 text-center mb-8">最短3か月〜6か月・ハイブリッド開催（対面＋オンライン）</p>

        {/* ペット画像 */}
        <div className="relative h-40 rounded-2xl overflow-hidden mb-6 shadow">
          <Image src={PHOTOS.dog} alt="犬の防災訓練" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
            <p className="text-white text-base font-black text-center">
              「教えられる専門家」に<br />なるための実践カリキュラム
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { n: '01', title: '自然災害スキル', desc: '日本で起こる自然災害とその特性を熟知する。地震・洪水・台風・土砂災害のメカニズムと、ペットへの影響を徹底解説。' },
            { n: '02', title: '人用防災スキル', desc: '人の防災を徹底的に見直す。飼い主自身が安全でなければペットも守れない。家族の防災計画をゼロから再構築します。' },
            { n: '03', title: '家具転倒防止スキル', desc: '家の中を細部まで確認して家具の転倒を防ぐ。室内の危険箇所の発見方法と、ペットを守る安全な空間づくりを学びます。' },
            { n: '04', title: 'ペット別災害リスク診断スキル', desc: 'ペット別に災害リスクを評価する実践的な診断法を習得。AIツールも活用し、種類・年齢・健康状態に合わせた診断を行います。' },
            { n: '05', title: '同行避難理解スキル', desc: '正しい同行避難を理解する。環境省ガイドライン・避難所の実態・行政の仕組みを正確に把握し、現場で使える知識を身につけます。' },
            { n: '06', title: '同行避難リスク回避スキル', desc: '同行避難時に危険を回避する。移動中・避難所到着時・長期避難生活での具体的リスクと、その回避方法を実践的に学びます。' },
            { n: '07', title: '避難所ペット飼育・管理スキル', desc: '避難所におけるペットの飼育・管理方法。スペース確保・衛生管理・他の避難者との共存ルール・ストレス軽減策を体系的に習得。' },
            { n: '08', title: '犬・猫の避難行動トレーニングスキル', desc: '犬・猫に特化した避難行動のトレーニング。クレート慣れ・フセ・マテ・呼び戻しなど、災害時に命を救うトレーニング技術を実践。' },
            { n: '09', title: 'その他ペット避難行動スキル', desc: 'うさぎ・鳥・爬虫類・小動物の避難時における行動対応。デリケートなペット特有のストレス管理と安全な移送方法を習得します。' },
            { n: '10', title: '地域防災連携スキル', desc: '地域防災との連携・自治体とのつながりを築く。自治会・行政・ペット関連企業と連携し、地域全体でペットを守るネットワーク形成。' },
            { n: '11', title: 'セミナー・個別相談スキル', desc: '認定資格取得後のセミナーや個別相談を受けるための説明スキル。台本・スライド・集客チラシのテンプレートをすべて提供します。' },
            { n: '12', title: '副業・事業化完全マニュアルスキル', desc: '副業・事業化の完全マニュアル。料金設定・SNS集客・法人提携・保険会社との連携まで、修了後すぐに活動できる実践力を養います。' },
          ].map(c => (
            <div key={c.n} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 bg-emerald-600 text-white text-sm font-black rounded-full flex items-center justify-center">
                {c.n}
              </div>
              <div>
                <p className="text-base font-bold text-gray-800 mb-0.5">{c.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 卒業認定試験 */}
        <div className="mt-5 bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
          <p className="text-3xl mb-3">🎓</p>
          <p className="text-base font-black mb-2">最後に「卒業認定試験」</p>
          <p className="text-sm leading-loose opacity-90 mb-3">
            12のスキルを習得した証として、卒業認定試験を実施します。<br />
            合格すると、晴れて──
          </p>
          <div className="bg-white text-emerald-700 rounded-xl py-3 px-5 inline-block">
            <p className="text-xl font-black">「ペット防災アドバイザー」</p>
            <p className="text-sm font-semibold mt-1">として正式に活躍スタート！</p>
          </div>
        </div>

        {/* ペットトレーニング動画 */}
        <div className="mt-6 bg-violet-50 border border-violet-200 rounded-2xl p-5">
          <p className="text-base font-black text-violet-700 mb-3">🎬 ４つの防災特化型ペットトレーニングメソッド</p>
          <div className="space-y-2">
            {[
              '動画① クレートトレーニング完全版（犬・猫）',
              '動画② 呼び戻し＆フセ・マテの防災応用',
              '動画③ 小動物・鳥のキャリートレーニング',
              '動画④ シニアペットの安心避難術',
            ].map(v => (
              <div key={v} className="flex gap-2 text-base text-violet-800">
                <span className="text-violet-500">▶</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* サポート体制 */}
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <p className="text-sm font-black text-emerald-700 mb-3">🤝 充実のサポート体制</p>
          <div className="space-y-3">
            {[
              { icon: '👥', title: '週1回グループコンサルタント', desc: '受講生全員が集まり、質問・事例共有・ロールプレイを実施。一人で悩まない環境を作ります。' },
              { icon: '🗓️', title: '月1回 予約制・個別コンサルタント', desc: '佐藤ケン講師と1対1。あなたの地域・状況に合わせた個別アドバイスが受けられます。' },
            ].map(s => (
              <div key={s.title} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-base font-bold text-emerald-800">{s.title}</p>
                  <p className="text-sm text-emerald-700 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── こんな方へ ─── */}
      <section className="px-6 py-12 bg-white">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-6">FOR WHOM</p>
        <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
          こんな方のための<br />プログラムです
        </h2>
        <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
          <Image src={PHOTOS.senior} alt="シニアとペット" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="space-y-3">
          {[
            { icon: '🐾', text: '大切なペットを、次の災害から本当の意味で守りたい' },
            { icon: '🌟', text: '定年後・子育て後に「社会の役に立つ仕事」をしたい' },
            { icon: '💰', text: '月数万円の副業収入を、好きなことで得たい' },
            { icon: '📜', text: '「ペット防災の専門家」という肩書きが欲しい' },
            { icon: '🤝', text: '同じ思いを持つ仲間と出会い、つながりたい' },
            { icon: '🏠', text: '地域のペット飼育者を守る、頼られる存在になりたい' },
          ].map(i => (
            <div key={i.text} className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <span className="text-2xl flex-shrink-0">{i.icon}</span>
              <p className="text-base text-gray-700 font-medium leading-relaxed">{i.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 修了後の副業ビジョン ─── */}
      <section className="px-6 py-12 bg-gray-900 text-white">
        <p className="text-sm text-emerald-400 tracking-widest font-bold text-center mb-2">AFTER GRADUATION</p>
        <h2 className="text-2xl font-black text-center mb-8">
          修了後、こんな未来が<br />待っています
        </h2>
        <div className="space-y-4">
          {[
            { scene: '自治会・町内会のセミナー', fee: '謝礼 1〜2万円/回', detail: '地域の防災責任者から声がかかります。月1〜2回で月2〜4万円。' },
            { scene: 'ペットサロン・動物病院でのミニ講座', fee: '1〜3万円/回', detail: '「うちのお客様に教えてほしい」という依頼は日常的に起きます。' },
            { scene: '企業向けペット防災研修', fee: '3〜10万円/回', detail: 'ペット保険会社・ホームセンター・ペット関連企業からの需要が急増しています。' },
            { scene: 'オンライン個別コンサル', fee: '5,000〜1万円/件', detail: 'スマホ一台でできる相談サービス。自分のペースで収入を得られます。' },
          ].map(v => (
            <div key={v.scene} className="bg-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <p className="text-base font-bold text-emerald-400">{v.scene}</p>
                <span className="text-sm bg-emerald-700 text-white px-3 py-1 rounded-full flex-shrink-0">{v.fee}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{v.detail}</p>
            </div>
          ))}
        </div>
        <div className="bg-emerald-800 rounded-xl p-5 mt-6 text-center">
          <p className="text-sm text-emerald-300 mb-1">月3件・副業収入の試算</p>
          <p className="text-4xl font-black text-yellow-300 mb-1">月 3〜10万円</p>
          <p className="text-sm text-emerald-300">受講料は副業収入で十分に回収できます</p>
        </div>
      </section>

      {/* ─── 卒業生の声 ─── */}
      <section className="px-6 py-12 bg-white">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-8">VOICE</p>
        <div className="space-y-5">
          {[
            {
              name: '60代・女性（元看護師）',
              text: '定年後、何をすればいいか分からなかった私が、今では地域のセミナー講師として活動しています。参加者の方から「ありがとう」と言われるたびに、生きがいを感じています。',
            },
            {
              name: '65代・男性（元会社員）',
              text: '「副業で稼げる」と半信半疑でしたが、修了後2か月で自治会セミナー2件と動物病院の講座1件が入りました。月5万円の副収入は、本当に生活に余裕をもたらしてくれています。',
            },
            {
              name: '58代・女性（ペット愛好家）',
              text: '大切な愛犬を守りたい一心で参加しましたが、「自分も教える側になれる」とは思っていませんでした。今は地域の頼られる存在として、毎日が充実しています。',
            },
          ].map(v => (
            <div key={v.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
              </div>
              <p className="text-base text-gray-700 leading-loose italic mb-3">「{v.text}」</p>
              <p className="text-sm text-gray-400 font-semibold">{v.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 価格・特典 ─── */}
      <section id="apply" className="px-6 py-12 bg-emerald-700 text-white">
        <p className="text-sm text-emerald-300 tracking-widest font-bold text-center mb-2">PRICE & BENEFITS</p>
        <h2 className="text-2xl font-black text-center mb-8">受講料と含まれるもの</h2>

        {/* 2人枠プラン */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 mb-5">
          <div className="text-center mb-5 pb-5 border-b border-gray-100">
            <div className="inline-block bg-red-100 text-red-600 text-sm font-black px-4 py-1 rounded-full mb-3">
              ⚠️ 限定申込 5名様枠（先着順）
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-emerald-600">¥330,000</span>
              <span className="text-base text-gray-400">税込</span>
            </div>
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-base font-black text-emerald-700 mb-1">
                ご夫婦・ご兄弟・お友達と<br />2名まで同時受講OK！
              </p>
              <p className="text-sm text-emerald-600 leading-relaxed">
                お一人あたり実質 <span className="text-xl font-black text-emerald-700">¥165,000</span>（税込）<br />
                2名でシェアすれば半額になります
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              '全12回ハイブリッド講義（録画視聴付き）',
              'ペットトレーニング動画解説 全4本',
              '週1回グループコンサルタント',
              '月1回 予約制・個別コンサルタント',
              'テキスト・ワークシート・スライドテンプレート',
              '「ペット防災アドバイザー」認定証の発行',
              'AI防災診断ツール（副業活動での使用権）',
              '卒業生コミュニティ（生涯会員・案件シェア）',
              '修了後の副業初案件 個別サポート',
              '協会ロゴ・名称の使用許可',
            ].map(b => (
              <div key={b} className="flex gap-3 text-base text-gray-700">
                <span className="text-emerald-500 flex-shrink-0 font-bold">✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mt-5 text-center">
            <p className="text-base text-gray-500">分割払い：各自のクレジットカード会社にご確認ください</p>
          </div>
        </div>

        <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-5 bg-white text-emerald-700 font-black text-lg rounded-2xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all mb-4">
          {LINE_SVG}
          LINEで無料相談・申し込み
        </a>
        <p className="text-center text-base text-emerald-300">まずは話を聞くだけでも大歓迎です</p>
      </section>

      {/* ─── うさぎ・鳥 写真セクション ─── */}
      <section className="bg-gray-50 px-6 py-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow">
            <Image src={PHOTOS.rabbit} alt="うさぎ" fill style={{ objectFit: 'cover' }} />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm text-center py-2 font-bold">
              うさぎの防災対策も学べます
            </div>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow">
            <Image src={PHOTOS.bird} alt="鳥" fill style={{ objectFit: 'cover' }} />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm text-center py-2 font-bold">
              鳥の避難計画も習得
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 py-12 bg-white">
        <p className="text-sm text-emerald-600 tracking-widest font-bold text-center mb-8">FAQ</p>
        <div className="space-y-4">
          {[
            {
              q: 'パソコン・スマホが苦手ですが大丈夫ですか？',
              a: '大丈夫です。講座はハイブリッド形式で、対面でサポートします。オンライン操作でつまずいた場合も、事務局がLINEでサポートします。',
            },
            {
              q: '資格は認められますか？副業に使えますか？',
              a: '一般社団法人ペット防災アドバイザー協会が発行する認定証です。名刺・チラシ・SNSに「ペット防災アドバイザー（一般社団法人ペット防災アドバイザー協会認定）」と記載して活動いただけます。受講生の実際の副業収入事例もあります。',
            },
            {
              q: '自分にセミナーができるか不安です',
              a: '第6回の「セミナー設計・登壇スキル」で、台本・スライドのテンプレートをすべてお渡しします。また修了後の初案件は、佐藤ケン講師が同行または監修でサポートします。',
            },
            {
              q: '分割払いはできますか？',
              a: '分割払いは、各自のクレジットカード会社にてご確認ください。詳細はLINEでご相談ください。',
            },
            {
              q: 'キャンセルはできますか？',
              a: '契約後1週間以内かつ受講開始前であれば、全額返金いたします。受講開始後のキャンセル・返金はいかなる理由でも対応できません。ご了承の上お申込みください。',
            },
          ].map(faq => (
            <div key={faq.q} className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-base font-bold text-gray-900 mb-3">Q. {faq.q}</p>
              <p className="text-base text-gray-600 leading-loose">A. {faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 最後のCTA ─── */}
      <section className="px-6 py-14 bg-gray-900 text-white text-center">
        <p className="text-sm text-emerald-400 tracking-widest font-bold mb-4">LAST MESSAGE</p>
        <h2 className="text-2xl font-black leading-tight mb-6">
          「何もできなかった」後悔を、<br />
          <span className="text-emerald-400">「助けられた」誇り</span>に変える。<br /><br />
          それは、あなたにしかできません。
        </h2>
        <p className="text-base text-gray-300 leading-loose mb-8">
          ペット防災の正しい知識を持ち、<br />
          地域で「頼られる専門家」として活躍する──<br /><br />
          その一歩が、今日踏み出せます。<br />
          まずはLINEで話しかけてください。
        </p>
        <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#06C755] text-white font-black text-lg rounded-2xl shadow-lg hover:bg-emerald-400 active:scale-95 transition-all mb-4">
          {LINE_SVG}
          LINE で無料相談する
        </a>
        <p className="text-sm text-gray-500 mt-4">
          © 一般社団法人ペット防災アドバイザー協会
        </p>
      </section>

    </div>
  )
}
