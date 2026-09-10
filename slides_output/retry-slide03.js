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

const slide = {
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
};

async function main() {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
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
    } catch (e) {
      console.error(`Attempt ${attempt} failed: ${e.message || e}`);
      if (attempt < 4) await new Promise(r => setTimeout(r, 8000 * attempt));
    }
  }
  console.error("GAVE UP");
}
main();
