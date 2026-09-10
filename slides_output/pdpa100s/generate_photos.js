// PDPA-100S 用：ロゴを合成するための「無地」製品写真を生成する
// ロゴは公式ロゴ画像を後から Pillow で合成するため、ここでは文字・ロゴを一切入れない
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const outputDir = path.join(__dirname, "photos");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const STYLE = "Clean studio product photography, soft even lighting, sharp focus, plain white seamless background, front view, laid flat. ABSOLUTELY NO text, NO letters, NO numbers, NO logo, NO emblem, NO patch, NO printing, NO embroidery, NO branding of any kind anywhere on the product or in the image. The surface must be completely blank and empty. ";

const photos = [
  {
    name: "mock_vest_plain",
    prompt: STYLE + "EXACTLY ONE single navy blue lightweight volunteer safety vest, alone in the frame, centered, filling most of the image. Only one garment - do NOT show a second vest, a back view, or any duplicate. Zipped front, mesh side panels, two front pockets at the waist, laid flat and photographed straight from above. The upper chest area is completely smooth, blank and unprinted."
  },
  {
    name: "mock_armband_plain",
    prompt: STYLE + "A plain white fabric armband (brassard) with a narrow navy blue border along the long edges, rectangular band laid flat horizontally. The center of the band is completely blank white fabric with nothing printed on it."
  },
  {
    name: "mock_cap_plain",
    prompt: STYLE + "A navy blue baseball cap, front view, curved brim, completely blank front panel with no embroidery or printing whatsoever."
  }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tryOnce(photo) {
  const res = await ai.models.generateContent({
    model: "nano-banana-pro-preview",
    contents: [{ role: "user", parts: [{ text: photo.prompt }] }],
    config: { responseModalities: ["image", "text"], temperature: 1.0 },
  });
  if (res.candidates && res.candidates[0]) {
    for (const part of res.candidates[0].content.parts) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType === "image/png" ? "png" : "jpg";
        fs.writeFileSync(path.join(outputDir, `${photo.name}.${ext}`),
          Buffer.from(part.inlineData.data, "base64"));
        return true;
      }
    }
  }
  return false;
}

// 503（高負荷）/ 429（毎分20件のレート制限）は指数バックオフでリトライ
async function generatePhoto(photo, attempts = 5) {
  for (let a = 1; a <= attempts; a++) {
    try {
      if (await tryOnce(photo)) return true;
      console.error(`  ${photo.name}: no image (attempt ${a})`);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      const retryable = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(msg);
      console.error(`  ${photo.name}: attempt ${a} failed${retryable ? " (retryable)" : ""}`);
      if (!retryable || a === attempts) return false;
    }
    await sleep(Math.min(20000, 5000 * a) + Math.floor(Math.random() * 3000));
  }
  return false;
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? photos.filter(p => only.includes(p.name)) : photos;
  let ok = 0;
  const failed = [];
  const results = await Promise.allSettled(list.map(p => generatePhoto(p)));
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) { ok++; console.log("  OK:", list[i].name); }
    else failed.push(list[i].name);
  });
  console.log(`Done: ${ok}/${list.length}`);
  if (failed.length) console.log("FAILED_LIST:", failed.join(" "));
}

main().catch(err => { console.error(err); process.exit(1); });
