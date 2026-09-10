const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });
const outputDir = __dirname;

const STYLE = `Photorealistic professional photograph, natural warm lighting, documentary/editorial photography style, high quality DSLR look, shallow depth of field where appropriate, trustworthy and calm tone suitable for a Japanese educational course about pet disaster preparedness. Absolutely NO text, NO watermark, NO logos, NO captions anywhere in the image. `;

const photos = [
  { name: "cover_senior_pet", prompt: STYLE + "A warm, joyful Japanese senior adult (60s) sitting on the floor of a cozy living room, gently embracing a golden retriever dog, soft natural window light, shallow depth of field, heartwarming second-life theme." },
  { name: "advisor_role", prompt: STYLE + "A caring Japanese adult kneeling down and gently comforting a small dog indoors, protective and reassuring gesture, warm soft lighting." },
  { name: "disaster_earthquake", prompt: STYLE + "A cracked residential street and a partially collapsed concrete block wall after an earthquake in a Japanese neighborhood, daytime, documentary photojournalism style." },
  { name: "disaster_typhoon", prompt: STYLE + "A powerful typhoon storm in Japan, bent trees and heavy wind and rain, dark dramatic stormy sky, urban street." },
  { name: "disaster_flood", prompt: STYLE + "Heavy rain causing a flooded urban street in Japan, a person with an umbrella wading through ankle-deep water, gray overcast sky." },
  { name: "disaster_landslide", prompt: STYLE + "A landslide with mud and debris covering a mountain road in rural Japan, overcast daylight, documentary style." },
  { name: "disaster_volcano", prompt: STYLE + "A Japanese volcanic mountain erupting with a large ash plume rising into the sky, viewed from a safe distance, dramatic natural light." },
  { name: "disaster_snow", prompt: STYLE + "Heavy snowfall covering traditional Japanese houses and a quiet street, snowstorm in progress, cold blue-white winter light." },
  { name: "anxious_owner", prompt: STYLE + "A worried Japanese pet owner sitting on the floor at home, gently holding a small dog close, concerned expression, moody indoor lighting." },
  { name: "evacuation_walk", prompt: STYLE + "A Japanese adult walking outdoors with a dog on a leash and an emergency backpack, evacuation scene, daytime, determined calm expression." },
  { name: "shelter_pet_cage", prompt: STYLE + "Inside a Japanese school gymnasium used as a disaster evacuation shelter, rows of pet carriers and cages with dogs and cats, volunteers nearby, documentary style." },
  { name: "location_townhall", prompt: STYLE + "Exterior of a modern Japanese municipal town hall government building, daytime, clear sky." },
  { name: "location_school", prompt: STYLE + "Exterior of a Japanese elementary school building with a schoolyard, daytime, clear sky." },
  { name: "location_vetclinic", prompt: STYLE + "Inside a clean modern veterinary clinic examination room in Japan, a veterinarian gently examining a dog on an exam table." },
  { name: "location_grooming", prompt: STYLE + "Inside a pet grooming salon, a professional groomer carefully trimming a fluffy dog's fur, clean bright interior." },
  { name: "location_pethotel", prompt: STYLE + "Inside a clean modern pet hotel boarding facility with rows of comfortable kennels, a staff member checking on a dog." },
  { name: "location_shelter_org", prompt: STYLE + "An animal rescue shelter in Japan, a volunteer sitting with several rescue dogs in an outdoor kennel area, warm afternoon light." },
  { name: "location_petshop", prompt: STYLE + "Inside a bright modern Japanese pet shop with shelves of pet supplies, a customer looking at products." },
  { name: "location_community_event", prompt: STYLE + "A local community outdoor festival event in a Japanese neighborhood park, families and pet owners with dogs gathered around an information booth, sunny day." },
  { name: "collab_vet", prompt: STYLE + "A veterinarian in a white coat talking with a pet owner while examining a dog on a clinic table, collaborative and warm atmosphere." },
  { name: "collab_groomer", prompt: STYLE + "A pet groomer or dog trainer talking with a pet owner in a bright salon, holding a small dog, friendly professional consultation." },
  { name: "collab_municipal", prompt: STYLE + "A local government staff member and a community volunteer standing together at an outdoor disaster preparedness information booth with pamphlets, daytime." },
  { name: "case_study_night", prompt: STYLE + "A dimly lit Japanese bedroom at night, a small dog standing alert and anxious near a bed, dramatic low-light nighttime atmosphere, tense mood, no text." },
];

async function generatePhoto(photo) {
  const response = await ai.models.generateContent({
    model: "nano-banana-pro-preview",
    contents: [{ role: "user", parts: [{ text: photo.prompt }] }],
    config: { responseModalities: ["image", "text"], temperature: 1.0 },
  });

  if (response.candidates && response.candidates[0]) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType === "image/png" ? "png" : "jpeg";
        const outPath = path.join(outputDir, `${photo.name}.${ext}`);
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
        return true;
      }
    }
  }
  return false;
}

async function runBatch(list) {
  return Promise.allSettled(list.map(p => generatePhoto(p)));
}

async function main() {
  const BATCH = 5;
  let ok = 0;
  const failed = [];
  for (let i = 0; i < photos.length; i += BATCH) {
    const batch = photos.slice(i, i + BATCH);
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: ${batch.map(p => p.name).join(", ")}`);
    const results = await runBatch(batch);
    results.forEach((r, idx) => {
      if (r.status === "fulfilled" && r.value) { ok++; }
      else { failed.push(batch[idx].name); console.error(`  FAILED: ${batch[idx].name}`, r.reason || "no image"); }
    });
  }
  console.log(`Done: ${ok}/${photos.length}`);
  if (failed.length) console.log("FAILED_LIST:", failed.join(","));
}

main().catch(err => { console.error(err); process.exit(1); });
