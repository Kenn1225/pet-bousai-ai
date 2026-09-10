const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });
const outputDir = __dirname;

const STYLE = `Photorealistic professional photograph, natural warm lighting, documentary/editorial photography style, high quality DSLR look, shallow depth of field where appropriate, trustworthy and calm tone suitable for a Japanese educational course about pet disaster preparedness. Absolutely NO text, NO watermark, NO logos, NO captions anywhere in the image. `;

const targets = {
  disaster_landslide: STYLE + "A landslide with mud and debris covering a mountain road in rural Japan, overcast daylight, documentary style.",
  disaster_volcano: STYLE + "A Japanese volcanic mountain erupting with a large ash plume rising into the sky, viewed from a safe distance, dramatic natural light.",
  shelter_pet_cage: STYLE + "Inside a Japanese school gymnasium used as a disaster evacuation shelter, rows of pet carriers and cages with dogs and cats, volunteers nearby, documentary style.",
  location_townhall: STYLE + "Exterior of a modern Japanese municipal town hall government building, daytime, clear sky.",
  location_grooming: STYLE + "Inside a pet grooming salon, a professional groomer carefully trimming a fluffy dog's fur, clean bright interior.",
  location_shelter_org: STYLE + "An animal rescue shelter in Japan, a volunteer sitting with several rescue dogs in an outdoor kennel area, warm afternoon light.",
  collab_groomer: STYLE + "A pet groomer or dog trainer talking with a pet owner in a bright salon, holding a small dog, friendly professional consultation.",
};

async function generatePhoto(name, prompt) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "nano-banana-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseModalities: ["image", "text"], temperature: 1.0 },
      });
      if (response.candidates && response.candidates[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const ext = part.inlineData.mimeType === "image/png" ? "png" : "jpeg";
            fs.writeFileSync(path.join(outputDir, `${name}.${ext}`), Buffer.from(part.inlineData.data, "base64"));
            console.log(`OK: ${name}`);
            return true;
          }
        }
      }
    } catch (e) {
      console.error(`Attempt ${attempt} failed for ${name}: ${e.message || e}`);
      if (attempt < 5) await new Promise(r => setTimeout(r, 6000 * attempt));
    }
  }
  console.error(`GAVE UP: ${name}`);
  return false;
}

async function main() {
  const names = Object.keys(targets);
  for (let i = 0; i < names.length; i += 3) {
    const batch = names.slice(i, i + 3);
    await Promise.allSettled(batch.map(n => generatePhoto(n, targets[n])));
  }
}
main();
