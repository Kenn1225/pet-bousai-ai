const path = require("path");

const SKILL_DIR = "C:\\Users\\Owner\\.claude\\skills\\slide-creator";
const REFS_G = path.join(SKILL_DIR, "references/slides_png");
const REFS_S = path.join(SKILL_DIR, "references/schematic_refs");

const BASE = `Create a professional Japanese presentation slide, 16:9 aspect ratio, for a 1-on-1 sales consultation deck aimed at active seniors who love pets, following a 3-day live launch event.
VISUAL STYLE:
- White to very light emerald-green gradient background
- Deep, muted emerald green as the primary accent color for headline text, borders, section labels, icons, and numbered badges
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
    id: 9,
    name: "slide_09_deadline",
    ref: path.join(REFS_G, "slide_25.jpg"),
    prompt: BASE + `LAYOUT: G04 center-impact slide with partial color emphasis and an exclamation icon. Small label badge at top. One large centered bold phrase, with the most important part of the phrase highlighted in emerald color. Small subtext below.

SLIDE CONTENT (use EXACTLY as written, keep it minimal):
- Small label badge: "ご案内"
- Huge center text: "本日のご案内は、最終ライブ配信日より5日間限定"
- Small subtext below: "迷っている時間が、一番もったいない"`,
  },
];

module.exports = slides;
