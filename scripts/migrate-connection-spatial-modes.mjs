import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const SPATIAL_MODE_RULES = {
  // 1. focus-only（オーラ・概念比較・並列系統）
  "conn-shikanoshima-kinin-shikaumi": "focus-only",
  "conn-chikushi-order-boundary": "focus-only",
  "connection-moji-four-shrines-landscape-comparison": "focus-only",
  "connection-northern-kyushu-frontier-nodality": "focus-only",
  "connection-kasuya-goryo-maruyama": "focus-only",
  "ritual-to-state": "focus-only",
  "shinbutsu-as-space": "focus-only",
  "mountain-is-sanctuary": "focus-only",
  "religion-as-network": "focus-only",
  "connection-wajinden-toma-tomonoura": "focus-only",
  "connection-onamuchi-isozaki-link": "focus-only",
  "connection-kasuya-sue-wakasugi-modern-religious-conception": "focus-only",
  "connection-dazaifu-tenmangu-kyuhaku": "focus-only",

  // 2. hull（領域面・勢力圏・地域拠点群）
  "connection-kashii-koga-funabaru-archaeology": "hull",
  "connection-yamada-saigu-ino-ise": "hull",
  "connection-hisayama-kofun-shugendo": "hull",
  "connection-hisayama-water-livelihood": "hull",
  "connection-kashii-koga-syncretism-reorganization": "hull",
  "connection-yamatai-maritime-inland-network": "hull",
  "connection-azumi-marine-lineage": "hull",
  "connection-chikushi-iron-and-pottery-production": "hull",
  "connection-homan-shrine-five-villages-network": "hull",
  "connection-umi-birth-and-placenta-sacred-landscape": "hull",
  "connection-kashii-koga-water-mountain-kami": "hull",

  // 3. line（物理移動・街道・航路・旅程）
  "conn-shikanoshima-moko-defense": "line",
  "connection-mizuki-dazaifu-highway-network": "line",
  "connection-uminonakamichi-corridor": "line",
  "connection-moji-mekari-sea-channel": "line",
  "connection-moji-tonogami-sacred-landscape": "line",
  "connection-moji-medieval-warrior-governance": "line",
  "connection-kashii-koga-saigu-koseki": "line",
  "connection-kasuya-sue-wakasugi-ancient-admin-transport": "line",
  "connection-kasuya-sue-wakasugi-wakasugi-shrine-lineage": "line",
  "connection-kasuya-sue-wakasugi-craft-technology-material-history": "line",
  "connection-dazaifu-enoki-tenmangu": "line",
  "connection-dazaifu-kyakukan-enoki": "line",
  "connection-dazaifu-tenmangu-shigasha": "line",
  "connection-dazaifu-mizuki-ojojinja": "line",
  "connection-setouchi-maritime-sacred-layer": "line",
  "connection-evidence-claim-6006f254550ec1856533": "line",
};

function applyModes(connections) {
  let updated = 0;
  for (const c of connections) {
    if (c.id.startsWith("itinerary-")) {
      c.displayMode = "line";
      updated++;
    } else if (SPATIAL_MODE_RULES[c.id]) {
      c.displayMode = SPATIAL_MODE_RULES[c.id];
      updated++;
    } else {
      // Default fallback
      c.displayMode = "line";
    }
  }
  return updated;
}

// 1. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  if (atlas.connections) {
    const count = applyModes(atlas.connections);
    fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
    console.log(`Updated travel-atlas.yamatai.json (${count} connections migrated)`);
  }
}

// 2. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  const conns = pub.atlas?.connections ?? pub.connections ?? [];
  const count = applyModes(conns);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log(`Updated published-review-dataset.json (${count} connections migrated)`);
}

console.log("Spatial modes migration completed successfully!");
