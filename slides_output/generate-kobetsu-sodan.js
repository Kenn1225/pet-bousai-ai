const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const outputDir = __dirname;
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const SKILL_DIR = "C:\\Users\\Owner\\.claude\\skills\\slide-creator";
const REFS_G = path.join(SKILL_DIR, "references/slides_png");
const REFS_S = path.join(SKILL_DIR, "references/schematic_refs");

const BASE = `Create a professional Japanese presentation slide, 16:9 aspect ratio, for a 1-on-1 sales consultation deck aimed at active seniors who love pets, following a 3-day live launch event.
VISUAL STYLE:
- White to very light emerald-green gradient background
- Soft, light sage-emerald green (noticeably lighter and less saturated than a deep forest green - a gentle pastel-leaning emerald) as the primary accent color for headline text, borders, section labels, icons, and numbered badges
- White rounded cards with soft drop shadow for content blocks
- Warm, calm, trustworthy aesthetic - NOT techy, NOT flashy, NOT cyberpunk, NOT dark
- Bold Gothic Japanese font for titles; clean, highly legible regular Gothic font for body text with generous letter spacing and line height for readability by senior audiences
- Clean, minimal layout with generous white space and clear visual hierarchy
- All Japanese text must be perfectly legible, high contrast, and correctly rendered
- Do NOT include company logos, watermarks, brand marks, or copyright text
- Do NOT render hex color codes, pixel values, or technical labels as visible text on the slide
Use the reference image ONLY for layout structure and composition. Do NOT copy its colors.

All elements (title, cards, text blocks) must share the same alignment axis.
Title text is the largest element - about 1.5 to 2x body text size. NEVER make the title 3x or larger.
Do NOT display any pixel values, spacing numbers, dimension labels, hex color codes, or layout guides on the slide.

`;

const slides = [
  {
    id: 1,
    name: "slide_01_cover",
    ref: path.join(REFS_G, "slide_01.jpg"),
    prompt: BASE + `LAYOUT: G01 title/cover slide. Centered composition. Top emerald-green horizontal band with white subtitle text. Large bold dark-emerald main title in the center. Bottom area with a rounded tag showing the course name. Geometric diagonal stripe decoration in emerald at top corners.

SLIDE CONTENT (use EXACTLY as written):
- Top band text: "個別相談"
- Main title (centered, large): "本日はありがとうございます" then below it "第二の人生を、具体的な一歩に変える45分"
- Bottom rounded tag: "ペット防災アドバイザー養成講座"`,
  },
  {
    id: 2,
    name: "slide_02_recap",
    ref: path.join(REFS_G, "slide_07.jpg"),
    prompt: BASE + `LAYOUT: G06 vertical numbered list. Top-left label badge + large heading. Left-aligned numbered badge (01-05) rows stacked vertically, each a white rounded card. Large geometric decoration on the right side.
CONTENT DENSITY: Medium — Headline text should be about 1.5-2x the body text size, NOT 3x or larger.

SLIDE CONTENT (use EXACTLY as written, exactly 5 items, do not add extra items):
- Label badge: "振り返り"
- Heading: "3日間のライブで学んだこと　いのちを守る5つの重要行動"
- 01 身元情報の整備 - 迷子対策・マイクロチップ
- 02 防災バッグの準備 - 備蓄・避難グッズ一式
- 03 避難先の事前確認 - ペット可避難所リスト化
- 04 日頃のトレーニング - キャリー慣れ・コマンド練習
- 05 地域ネットワーク - 近隣・SNSでつながる
- Bottom line (small text below the list): "知識は手に入れた。次は、地域に広める側になる番です。"`,
  },
  {
    id: 3,
    name: "slide_03_gap",
    ref: path.join(REFS_G, "slide_23.jpg"),
    prompt: BASE + `LAYOUT: G12 data/statistics slide. Top label badge + heading. Center area shows two extra-large emerald-colored percentage numbers side by side with short captions under each. Bottom dark-gray conclusion band with white text.

SLIDE CONTENT (use EXACTLY as written, exactly 2 numbers, no more):
- Label badge: "見過ごされているギャップ"
- Heading: "人の防災は進んでいる。でも、ペット防災はほぼ手つかず"
- Left big number: "78%" caption below: "人の防災意識 - 多くの地域で防災教育・避難訓練が浸透"
- Right big number: "15%" caption below: "ペット防災の浸透率 - ペットオーナーですら具体的な対策を知らない"
- Small footnote text: "文部科学省「地震調査研究推進本部」データ準拠"
- Bottom conclusion band text: "このギャップこそが、あなたの出番です"`,
  },
  {
    id: 4,
    name: "slide_04_answer",
    ref: path.join(REFS_G, "slide_09.jpg"),
    prompt: BASE + `LAYOUT: G10 definition/answer slide. Top-left label badge. Center white rounded card with large emerald quotation marks framing a definition sentence. English sub-label "ANSWER" above it. Below the card, 4 small keyword tags in a row with icons.

SLIDE CONTENT (use EXACTLY as written, exactly 4 keyword tags):
- Sub-label: "ANSWER"
- Definition text inside card: "ペット防災アドバイザー養成講座 - 知識を「資格」に変え、地域で活動できる自分になる"
- 4 keyword tags: "教育者" / "地域コーディネーター" / "アドバイザー" / "社会貢献者"`,
  },
  {
    id: 5,
    name: "slide_05_curriculum",
    ref: path.join(REFS_S, "01_elements1_46-1920w.webp"),
    prompt: BASE + `LAYOUT: S01 table. Heading at top. Center: a clean table with a header row in emerald-green background with white text, and 4 data rows below in white/light-gray alternating rows with dark text.

SLIDE CONTENT (use EXACTLY as written, exactly 4 rows, do not add extra rows):
- Heading: "カリキュラム概要"
- Table header row: "項目" | "内容"
- Row 1: "講義回数" | "全12回（各90〜120分）"
- Row 2: "受講方法" | "Zoomリアルタイム受講／アーカイブ視聴"
- Row 3: "特別講座" | "犬の防災トレーニング／猫の防災トレーニング（オンライン実技）"
- Row 4: "認定" | "卒業試験合格で認定証を発行（一般社団法人ペット防災アドバイザー協会）"`,
  },
  {
    id: 6,
    name: "slide_06_activities",
    ref: path.join(REFS_S, "01_hubble_14-1920w.webp"),
    prompt: BASE + `LAYOUT: S25 side-by-side bullet columns. Heading at top. Two equal-width white rounded cards side by side, each with a bold column title and 2 short bullet lines below. Bottom conclusion line centered below both cards.

SLIDE CONTENT (use EXACTLY as written, exactly 2 columns):
- Heading: "卒業後にできること"
- Column 1 title: "① セミナー・講座の定期開催"
  - bullet: "地域の公民館・コミュニティセンターで開催"
  - bullet: "参加費として感謝の報酬を受け取る"
- Column 2 title: "② 個別コンサルティング＆プラン作成"
  - bullet: "ペットの種類・性格に合わせた防災プランを提案"
  - bullet: "コンサルティング費用として報酬を受け取る"
- Bottom conclusion text: "感謝の報酬を得ながら、地域に必要とされる存在に"`,
  },
  {
    id: 7,
    name: "slide_07_price",
    ref: path.join(REFS_G, "slide_06.jpg"),
    prompt: BASE + `LAYOUT: G04 center-impact slide. Small label badge at top center. One extremely large, bold, centered phrase as the main focal point. Thin emerald underline beneath it. Small subtext below. Maximum use of white space.

SLIDE CONTENT (use EXACTLY as written, keep it minimal):
- Small label badge: "ご案内"
- Huge center text: "受講料　330,000円（税込）"
- Small subtext below: "全12回＋特別講座2つ＋認定料込み"`,
  },
  {
    id: 8,
    name: "slide_08_bonus",
    ref: path.join(REFS_G, "slide_27.jpg"),
    prompt: BASE + `LAYOUT: G10 definition slide with checkmark accents. Top-left label badge. Center white rounded card with a definition-style statement, a large emerald checkmark icon beside it. Small subtext below the card.

SLIDE CONTENT (use EXACTLY as written):
- Label badge: "今日だけの特典"
- Definition text inside card: "本来10,000円の「45分間ZOOM個別相談」が、今日は無料"
- Subtext below card: "＝ この時間そのものが、今日だけの特典です"`,
  },
  {
    id: 9,
    name: "slide_09_deadline",
    ref: path.join(REFS_G, "slide_25.jpg"),
    prompt: BASE + `LAYOUT: G04 center-impact slide with partial color emphasis and an exclamation icon. Small label badge at top. One large centered bold phrase, with the most important part of the phrase highlighted in emerald color. Small subtext below.

SLIDE CONTENT (use EXACTLY as written, keep it minimal):
- Small label badge: "ご案内"
- Huge center text: "本日のご案内は、最終ライブ配信日より5日間限定"
- Small subtext below: "迷っている時間が、一番もったいない"`,
  },
  {
    id: 10,
    name: "slide_10_cta",
    ref: path.join(REFS_G, "slide_32.jpg"),
    prompt: BASE + `LAYOUT: G14 CTA slide. Fully centered composition. Large bold title at top-center. A chat-bubble icon in the middle in emerald color. Subtext below. Generous white space, simple and calm.

SLIDE CONTENT (use EXACTLY as written):
- Title: "今日、ここで一歩を踏み出しませんか"
- Subtext: "お申し込み方法のご案内"`,
  },
];

async function generateSlide(slide) {
  const contents = [];
  if (slide.ref && fs.existsSync(slide.ref)) {
    const ext = path.extname(slide.ref).toLowerCase();
    let mime = "image/jpeg";
    if (ext === ".webp") mime = "image/webp";
    if (ext === ".png") mime = "image/png";
    const imgData = fs.readFileSync(slide.ref);
    contents.push({ inlineData: { mimeType: mime, data: imgData.toString("base64") } });
    contents.push({ text: "Use this reference image ONLY for layout structure and composition. Do NOT copy its colors.\n\n" + slide.prompt });
  } else {
    contents.push({ text: slide.prompt });
  }

  const response = await ai.models.generateContent({
    model: "nano-banana-pro-preview",
    contents: [{ role: "user", parts: contents }],
    config: { responseModalities: ["image", "text"], temperature: 1.0 },
  });

  if (response.candidates && response.candidates[0]) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType === "image/png" ? "png" : "jpeg";
        const outPath = path.join(outputDir, `${slide.name}.${ext}`);
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
        return true;
      }
    }
  }
  return false;
}

async function runBatch(list) {
  return Promise.allSettled(list.map(s => generateSlide(s)));
}

async function main() {
  const BATCH = 5;
  let ok = 0;
  for (let i = 0; i < slides.length; i += BATCH) {
    const batch = slides.slice(i, i + BATCH);
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: generating ${batch.map(s => s.name).join(", ")}`);
    const results = await runBatch(batch);
    ok += results.filter(r => r.status === "fulfilled" && r.value).length;
    results.forEach((r, idx) => {
      if (r.status === "rejected") console.error(`  FAILED: ${batch[idx].name}`, r.reason);
      if (r.status === "fulfilled" && !r.value) console.error(`  NO IMAGE: ${batch[idx].name}`);
    });
  }
  console.log(`Done: ${ok}/${slides.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
