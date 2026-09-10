const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });
const outputDir = __dirname;

const SKILL_DIR = "C:\\Users\\Owner\\.claude\\skills\\slide-creator";
const REFS_G = path.join(SKILL_DIR, "references/slides_png");

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

const slide = {
  name: "slide_07_price",
  ref: path.join(REFS_G, "slide_06.jpg"),
  prompt: BASE + `LAYOUT: G04 center-impact slide. Small label badge at top center. One extremely large, bold, centered phrase as the main focal point. Thin emerald underline beneath it. Small subtext below. Maximum use of white space.

SLIDE CONTENT (use EXACTLY as written, keep it minimal):
- Small label badge: "ご案内"
- Huge center text: "受講料　330,000円（税込）"
- Small subtext below: "全12回＋特別講座2つ＋認定料込み"`,
};

async function main() {
  const contents = [];
  const imgData = fs.readFileSync(slide.ref);
  contents.push({ inlineData: { mimeType: "image/jpeg", data: imgData.toString("base64") } });
  contents.push({ text: "Use this reference image ONLY for layout structure and composition. Do NOT copy its colors.\n\n" + slide.prompt });

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
        console.log(`OK: ${outPath}`);
        return;
      }
    }
  }
  console.error("NO IMAGE RETURNED");
}
main().catch(e => { console.error(e); process.exit(1); });
