// 認定バッジ（IDカード型）見本用の顔写真プレースホルダを生成する
// 実在しない人物のニュートラルな証明写真。見本であることはスライド側に明記する
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const outputDir = path.join(__dirname, "photos");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const photos = [
  {
    name: "id_portrait",
    prompt: "A formal Japanese ID photo (証明写真) of a friendly adult in their 50s wearing a plain navy jacket and white shirt, facing the camera straight on with a calm gentle expression, head and shoulders only, centered, plain light gray seamless studio background, even soft lighting, sharp focus, vertical portrait composition with space above the head. ABSOLUTELY NO text, NO letters, NO numbers, NO logo, NO watermark, NO border anywhere in the image."
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

(async () => {
  const results = await Promise.allSettled(photos.map(p => generatePhoto(p)));
  results.forEach((r, i) => {
    console.log((r.status === "fulfilled" && r.value ? "  OK: " : "  FAILED: ") + photos[i].name);
  });
})().catch(err => { console.error(err); process.exit(1); });
