import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { applyJourneyAtlasUpdateDraft } from "../src/domain/imports/journey-atlas-update.ts";

const ReviewAtlasSchema = z.object({
  title: z.string().min(1),
  journeys: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    documentIds: z.array(z.string().min(1)).min(1),
    spotIds: z.array(z.string().min(1)).min(1),
    connectionIds: z.array(z.string().min(1)),
    unvisitedPlaces: z.array(z.object({
      id: z.string().min(1), name: z.string().min(1),
      latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
      claimIds: z.array(z.string().min(1)).min(1), targetKind: z.literal("missed_visit"),
      positionStatus: z.enum(["candidate", "confirmed"]),
    })).optional(),
  })).default([]),
  spots: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    region: z.string().min(1),
    kind: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    claimIds: z.array(z.string()),
    mapRole: z.enum(["visited-place", "area-context"]).default("visited-place"),
    positionStatus: z.enum(["candidate", "confirmed", "rejected"]).default("confirmed"),
  })).min(1),
  connections: z.array(z.object({
    id: z.string().min(1),
    connectionKind: z.enum(["documented", "comparative", "interpretive", "itinerary"]).default("interpretive"),
    initialStatus: z.enum(["suggested", "confirmed", "rejected"]).default("suggested"),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    spotIds: z.array(z.string()).min(2),
    claimIds: z.array(z.string()).min(1),
    concepts: z.array(z.string()).min(1),
    facets: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      weight: z.number().int().min(1).max(5),
    })).min(1),
    lensId: z.string().optional(),
    topicId: z.string().nullable().optional(),
    eras: z.array(z.any()),
  })),
  suggestions: z.array(z.any()).default([]),
});

const root = resolve(__dirname, "../../..");
const atlasPath = resolve(root, "data/imports/review/travel-atlas.yamatai.json");
const atlas = JSON.parse(readFileSync(atlasPath, "utf8"));
const updateDraftPath = resolve(root, "data/imports/tomono-review-draft.atlas-update.json");
const updateDraft = JSON.parse(readFileSync(updateDraftPath, "utf8"));

const updatedAtlas = applyJourneyAtlasUpdateDraft(atlas, updateDraft);
console.log("Applied atlas update draft. Total spots:", updatedAtlas.spots.length);
console.log("Total journeys:", (updatedAtlas.journeys ?? []).length);

// Add itinerary connection
const spotMap = new Map(updatedAtlas.spots.map((s: any) => [s.name, s.id]));

const itinerarySpotNames = [
  "神戸市立博物館",
  "神戸ポートミュージアム・átoa",
  "福山駅",
  "味処 秀",
  "福山のカラオケスナック",
  "広島県立歴史博物館",
  "福山城",
  "備後護国神社",
  "福山市人権平和資料館",
  "福山駅",
  "鞆の浦",
  "いろは丸展示館",
  "福山市鞆の浦歴史民俗資料館",
  "沼名前神社",
  "小烏神社",
  "正一位五社大明神",
  "広島駅",
  "広島駅前大橋南",
  "常太郎",
  "音戸温泉",
  "流川・薬研堀周辺",
  "白神社",
  "国立広島原爆死没者追悼平和祈念館",
  "平和記念公園レストハウス",
  "原爆ドーム",
  "バッケンモーツアルトカフェ",
  "広島平和記念資料館",
  "広島駅",
];

const itinerarySpotIds = itinerarySpotNames.map(name => spotMap.get(name)).filter(Boolean) as string[];

const tomoJourney = (updatedAtlas.journeys ?? []).find((j: any) => j.id === updateDraft.journey.id);
if (tomoJourney) {
  tomoJourney.connectionIds = ["itinerary-kobe-fukuyama-tomo-hiroshima"];
}

const itineraryClaimIds = updateDraft.candidateSpots.flatMap((s: any) => s.claimIds).slice(0, 10);

const itineraryConn = {
  id: "itinerary-kobe-fukuyama-tomo-hiroshima",
  connectionKind: "itinerary" as const,
  initialStatus: "confirmed" as const,
  eyebrow: "神戸・福山・鞆の浦・広島 · 訪問順",
  title: "瀬戸内海沿岸を西進し、港町と歴史の重層を辿る",
  summary: "神戸開港の地から備後・福山城下町、潮待ちの港・鞆の浦を巡り、広島市街・平和記念公園と古層の白神社へと移動した探索経路です。",
  spotIds: itinerarySpotIds,
  claimIds: itineraryClaimIds,
  concepts: ["瀬戸内海", "潮待ちの港", "城下町", "近世から近代", "現代都市の古層"],
  facets: [{ id: "itinerary", label: "訪問順", weight: 5 }],
  eras: [],
  lensId: "itinerary",
  topicId: null,
};

// Also connect Tomonoura to Wajinden Route Topic
const tomoSpotId = spotMap.get("鞆の浦");
const numakumaSpotId = spotMap.get("沼名前神社");
const shirakamiSpotId = spotMap.get("白神社");

const wajindenTomaConn = {
  id: "connection-wajinden-toma-tomonoura",
  connectionKind: "interpretive" as const,
  initialStatus: "confirmed" as const,
  eyebrow: "魏志倭人伝ルートと瀬戸内海交通",
  title: "投馬国比定地としての備後・鞆の浦と潮流ネットワーク",
  summary: "魏志倭人伝に記された『投馬国』の有力比定地の一つである備後・鞆の浦。瀬戸内海の東西の潮流が出会う潮待ちの天然の良港としての地勢と、古代海運の結節点としての性格を考察します。",
  spotIds: [tomoSpotId!, numakumaSpotId!].filter(Boolean),
  claimIds: updateDraft.candidateSpots.find((s: any) => s.name === "鞆の浦")?.claimIds || [],
  concepts: ["投馬国説", "潮待ちの港", "海上交通", "瀬戸内海航路"],
  facets: [
    { id: "route", label: "経路", weight: 5 },
    { id: "geography", label: "地形・交通", weight: 4 },
  ],
  eras: [],
  lensId: "route",
  topicId: "wajinden-route-comparison",
};

// Also religion connection: Numakuma & Shirakami maritime archaic layer
const maritimeSacredConn = {
  id: "connection-setouchi-maritime-sacred-layer",
  connectionKind: "interpretive" as const,
  initialStatus: "confirmed" as const,
  eyebrow: "瀬戸内の海神・岩礁祭祀",
  title: "潮待ちの海神信仰と都市下に残る岩礁祭祀の古層",
  summary: "鞆の浦の沼名前神社（大綿津見神、神功皇后渡海伝承）と、広島市街中心部に残る白神社（かつての海上の岩礁祭祀・根源神の接続）にみられる、地形と海運に根ざした原初的祭祀景観の重層です。",
  spotIds: [numakumaSpotId!, shirakamiSpotId!].filter(Boolean),
  claimIds: [
    ...(updateDraft.candidateSpots.find((s: any) => s.name === "沼名前神社")?.claimIds || []),
    ...(updateDraft.candidateSpots.find((s: any) => s.name === "白神社")?.claimIds || []),
  ].slice(0, 8),
  concepts: ["海神信仰", "岩礁祭祀", "綿津見神", "白神", "古層祭祀景観"],
  facets: [
    { id: "religion", label: "信仰・祭祀", weight: 5 },
    { id: "geography", label: "自然・地形", weight: 4 },
  ],
  eras: [],
  lensId: "religion",
  topicId: "regional-sacred-comparison",
};

updatedAtlas.connections.push(itineraryConn, wajindenTomaConn, maritimeSacredConn);

console.log("Total connections:", updatedAtlas.connections.length);

// Validate against ReviewAtlasSchema
ReviewAtlasSchema.parse(updatedAtlas);
console.log("Validated successfully against ReviewAtlasSchema!");

// Also validate with tomono-review-draft.json claims
const datasetPath = resolve(root, "data/imports/tomono-review-draft.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));
const claimIds = new Set(dataset.claims.map((c: any) => c.id));
const spotIds = new Set(updatedAtlas.spots.map((s: any) => s.id));
const docIds = new Set(dataset.documents.map((d: any) => d.id));

// Verify referential integrity
let errors = 0;
for (const spot of updatedAtlas.spots) {
  for (const cid of spot.claimIds) {
    if (!claimIds.has(cid)) {
      console.error(`Unknown claim in spot ${spot.name}: ${cid}`);
      errors++;
    }
  }
}

for (const conn of updatedAtlas.connections) {
  for (const sid of conn.spotIds) {
    if (!spotIds.has(sid)) {
      console.error(`Unknown spot in connection ${conn.id}: ${sid}`);
      errors++;
    }
  }
  for (const cid of conn.claimIds) {
    if (!claimIds.has(cid)) {
      console.error(`Unknown claim in connection ${conn.id}: ${cid}`);
      errors++;
    }
  }
}

for (const j of updatedAtlas.journeys ?? []) {
  for (const did of j.documentIds) {
    if (!docIds.has(did)) {
      console.error(`Unknown doc in journey ${j.id}: ${did}`);
      errors++;
    }
  }
  for (const sid of j.spotIds) {
    if (!spotIds.has(sid)) {
      console.error(`Unknown spot in journey ${j.id}: ${sid}`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log("PERFECT REFERENTIAL INTEGRITY! 0 errors.");
  // Save updated atlas
  writeFileSync(atlasPath, JSON.stringify(updatedAtlas, null, 2) + "\n", "utf8");
  console.log("Saved updated atlas to:", atlasPath);

  // Also update published-review-dataset.json
  const publishedPath = resolve(root, "apps/web/src/data/published-review-dataset.json");
  const publishedData = {
    datasetId: "resoworld-published-atlas",
    privacy: "anonymized-demo",
    documents: dataset.documents,
    claims: dataset.claims,
    atlas: updatedAtlas,
  };
  writeFileSync(publishedPath, JSON.stringify(publishedData, null, 2) + "\n", "utf8");
  console.log("Saved updated published dataset to:", publishedPath);
} else {
  console.error(`Found ${errors} referential integrity errors.`);
  process.exit(1);
}
