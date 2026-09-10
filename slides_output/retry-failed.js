const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });
const outputDir = __dirname;

const all = require("./slides-data.js");
const targets = all.filter(s => ["slide_06_activities", "slide_09_deadline"].includes(s.name));

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

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
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
            console.log(`OK: ${slide.name}`);
            return true;
          }
        }
      }
    } catch (e) {
      console.error(`Attempt ${attempt} failed for ${slide.name}: ${e.message || e}`);
      if (attempt < 4) await new Promise(r => setTimeout(r, 8000 * attempt));
    }
  }
  console.error(`GAVE UP: ${slide.name}`);
  return false;
}

async function main() {
  for (const s of targets) {
    await generateSlide(s);
  }
}
main();
