// PDPA-100 公式教育システム スライド用 追加写真生成
// 既存 pdpa101_photos の22点で足りないテーマだけを生成する
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const outputDir = path.join(__dirname, "photos");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const STYLE = "Photorealistic professional photograph, natural warm lighting, documentary/editorial photography style, high quality DSLR look, shallow depth of field where appropriate, trustworthy and calm tone suitable for a Japanese public-interest educational course about pet disaster preparedness. Absolutely NO text, NO letters, NO watermark, NO logos, NO captions, NO signage anywhere in the image. ";

const photos = [
  { name: "pet_dog", prompt: STYLE + "Close portrait of a friendly medium-sized dog sitting calmly indoors in a Japanese home, soft window light, looking at camera." },
  { name: "pet_cat", prompt: STYLE + "Close portrait of a calm domestic cat sitting on a wooden floor in a Japanese home, soft natural light, looking at camera." },
  { name: "pet_bird", prompt: STYLE + "A small pet cockatiel or budgerigar perched inside a clean cage in a bright Japanese living room, soft natural light." },
  { name: "pet_rabbit", prompt: STYLE + "A pet rabbit sitting on a soft mat inside a Japanese home, gentle natural light, calm and cute." },
  { name: "pet_ferret", prompt: STYLE + "A pet ferret standing curiously on a wooden floor inside a Japanese home, soft indoor light." },
  { name: "pet_reptile", prompt: STYLE + "A pet leopard gecko or bearded dragon resting inside a clean glass terrarium with a heat lamp, indoor setting." },
  { name: "supplies_stockpile", prompt: STYLE + "A neat flat-lay of pet emergency stockpile items on a wooden floor: pet food in sealed bags, bottled water, collapsible bowls, pet wipes, waste bags, a leash, a pet blanket and a first-aid pouch, arranged tidily, bright even lighting." },
  { name: "crate_training", prompt: STYLE + "A calm dog resting comfortably inside an open plastic pet carrier crate in a Japanese living room, owner's hand gently nearby, warm soft light." },
  { name: "cat_carrier", prompt: STYLE + "A cat calmly entering a soft-sided pet carrier placed on the floor of a Japanese home, owner kneeling nearby encouraging it, soft natural light." },
  { name: "small_animal_cage", prompt: STYLE + "A small animal cage with a hamster or rabbit covered partly with a warm blanket next to a portable battery power station during a power outage, dim indoor light." },
  { name: "hazard_map_check", prompt: STYLE + "A Japanese adult sitting at a home dining table holding a smartphone and looking at a printed local map spread out, planning an evacuation route, warm indoor light, screen content not readable." },
  { name: "weather_alert_phone", prompt: STYLE + "Close-up of Japanese hands holding a smartphone indoors near a rain-streaked window on a stormy evening, screen glow visible but content unreadable, tense atmosphere." },
  { name: "microchip_vet", prompt: STYLE + "A veterinarian holding a handheld scanner device over the shoulder area of a calm small dog on an examination table in a clean Japanese veterinary clinic." },
  { name: "first_aid_cpr", prompt: STYLE + "A Japanese first-aid training class in a community hall, participants kneeling and practicing chest compressions on CPR training manikins, instructor guiding them, bright daylight." },
  { name: "online_lecture", prompt: STYLE + "A Japanese adult in their 50s attending an online lecture on a laptop at a home desk, taking notes in a notebook, a dog resting nearby, warm afternoon light, laptop screen content unreadable." },
  { name: "workbook_writing", prompt: STYLE + "Close-up of Japanese hands writing with a pencil in a blank open notebook on a wooden desk beside a coffee cup, warm natural light, no readable text on the page." },
  { name: "instructor_teaching", prompt: STYLE + "A Japanese instructor standing beside a blank projection screen and speaking to a small seated audience in a bright community meeting room, gesturing warmly, projection screen completely blank." },
  { name: "community_seminar", prompt: STYLE + "A small community disaster-preparedness seminar in a Japanese public hall, about a dozen adults of mixed ages seated at tables listening attentively, bright daylight through windows." },
  { name: "certificate_badge", prompt: STYLE + "Close-up of a person's hands holding a blank cream-colored certificate paper with a navy blue ribbon and a small round metal pin badge on a wooden desk, no text or writing on the certificate, soft natural light." },
  { name: "noto_recovery", prompt: STYLE + "A residential street in a rural Japanese coastal town after a major earthquake, cracked asphalt, tilted utility pole and damaged tile roofs, overcast daylight, respectful photojournalism style, no people." },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tryOnce(photo) {
  const response = await ai.models.generateContent({
    model: "nano-banana-pro-preview",
    contents: [{ role: "user", parts: [{ text: photo.prompt }] }],
    config: { responseModalities: ["image", "text"], temperature: 1.0 },
  });
  if (response.candidates && response.candidates[0]) {
    for (const part of response.candidates[0].content.parts) {
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

// 503（高負荷）/ 429（毎分20件のレート制限）は指数バックオフでリトライする
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
  const BATCH = 3;          // 同時実行を抑える
  const COOLDOWN = 25000;   // バッチ間の待機（毎分20件の制限対策）
  let ok = 0;
  const failed = [];
  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH);
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: ${batch.map(p => p.name).join(", ")}`);
    const results = await Promise.allSettled(batch.map(p => generatePhoto(p)));
    results.forEach((r, idx) => {
      if (r.status === "fulfilled" && r.value) { ok++; console.log(`  OK: ${batch[idx].name}`); }
      else { failed.push(batch[idx].name); }
    });
    if (i + BATCH < list.length) await sleep(COOLDOWN);
  }
  console.log(`Done: ${ok}/${list.length}`);
  if (failed.length) console.log("FAILED_LIST:", failed.join(" "));
}

main().catch(err => { console.error(err); process.exit(1); });
