import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  entityType: string;
  region: string;
  location: string;
  latitude: number;
  longitude: number;
  feature: string;
  description: string;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: any = {};
    header.forEach((key, index) => {
      const val = values[index];
      if (key === "latitude" || key === "longitude") {
        row[key] = parseFloat(val);
      } else {
        row[key] = val;
      }
    });
    return row as CsvRow;
  });
}

export async function convertYayoiArchaeologyCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "bunkacho-iseki-db",
      kind: "modern-reference" as const,
      title: "文化庁国指定文化財等データベース（特別史跡・史跡）",
      authors: ["文化庁"],
      publishedAt: "2024",
      reviewStatus: "reviewed" as const,
      note: "国特別史跡吉野ヶ里遺跡、原の辻遺跡、および国史跡平塚川添遺跡・板付遺跡・三雲井原遺跡・平原遺跡の発掘調査報告書集成。",
    },
    {
      id: "gishi-wajinden-archaeology",
      kind: "classical-text" as const,
      title: "三国志魏書東夷伝倭人条（魏志倭人伝）",
      authors: ["陳寿"],
      publishedAt: "0297",
      reviewStatus: "reviewed" as const,
      note: "一支国・伊都国・奴国の国名、戸数、官名、地理的関係の基本記述。",
    },
  ];

  const viewpoints = [
    {
      id: "yayoi-spatial-structure",
      kind: "analytical" as const,
      label: "北部九州における弥生拠点集落とクニの空間配置",
      description: "紀元前1世紀から3世紀にかけて、玄界灘沿岸（伊都・奴）から筑後川流域（吉野ヶ里・朝倉）、壱岐（一支）に展開した環濠集落・王墓・交易拠点の考古学的対比。",
    },
  ];

  const entities: any[] = [];
  const assertions: any[] = [];

  for (const row of rows) {
    const placeEntityId = `place-${row.id}`;

    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.name, `${row.region} ${row.name}`, row.feature],
      description: `${row.region}（${row.location}）。${row.feature}。${row.description}`,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });
  }

  // Assertion 1: Ariake / Chikugo river relationship (Yoshinogari <-> Hiratsuka Kawazoe)
  assertions.push({
    id: "arch-yoshinogari-hiratsuka",
    subjectId: "place-yoshinogari",
    predicate: "compares_with",
    objectId: "place-hiratsuka-kawazoe",
    relationFamily: "conceptual-comparison",
    nature: "reviewed-reference",
    viewpointIds: ["yayoi-spatial-structure"],
    sourceIds: ["bunkacho-iseki-db"],
    confidence: "high",
    reviewStatus: "reviewed",
    note: "有明海・筑後川水系における二大拠点環濠集落の対比。集落構造と時期の平行関係。",
  });

  // Assertion 2: Ito-koku internal royal link (Hirabaru <-> Mikumo-Ihara)
  assertions.push({
    id: "arch-hirabaru-mikumo",
    subjectId: "place-hirabaru",
    predicate: "associated_with",
    objectId: "place-mikumo-ihara",
    relationFamily: "association",
    nature: "reviewed-reference",
    viewpointIds: ["yayoi-spatial-structure"],
    sourceIds: ["bunkacho-iseki-db"],
    confidence: "high",
    reviewStatus: "reviewed",
    note: "伊都国の王邑（三雲南小路）と女王墓（平原方形周溝墓）の密接な支配関係。",
  });

  // Assertion 3: Ito-koku to Na-koku overland link (Mikumo-Ihara <-> Sugu-Okamoto)
  assertions.push({
    id: "arch-mikumo-sugu",
    subjectId: "place-mikumo-ihara",
    predicate: "connects_to",
    objectId: "place-sugu-okamoto",
    relationFamily: "route",
    nature: "reviewed-reference",
    viewpointIds: ["yayoi-spatial-structure"],
    sourceIds: ["gishi-wajinden-archaeology"],
    confidence: "high",
    reviewStatus: "reviewed",
    note: "魏志倭人伝の「東行至奴国百里」に対応する伊都国（糸島）から奴国（春日・福岡）への陸上交通路。",
  });

  // Assertion 4: Na-koku center to Itatuke (Sugu-Okamoto <-> Itatuke)
  assertions.push({
    id: "arch-sugu-itatuke",
    subjectId: "place-sugu-okamoto",
    predicate: "associated_with",
    objectId: "place-itatuke",
    relationFamily: "association",
    nature: "reviewed-reference",
    viewpointIds: ["yayoi-spatial-structure"],
    sourceIds: ["bunkacho-iseki-db"],
    confidence: "high",
    reviewStatus: "reviewed",
    note: "奴国内における水田農耕集落（板付）と王墓・青銅器鋳造工房（須玖岡本）の階層的関係。",
  });

  // Assertion 5: Genkai maritime trade (Mikumo-Ihara <-> Harunotsuji in Iki)
  assertions.push({
    id: "arch-mikumo-harunotsuji",
    subjectId: "place-mikumo-ihara",
    predicate: "connects_to",
    objectId: "place-harunotsuji",
    relationFamily: "route",
    nature: "reviewed-reference",
    viewpointIds: ["yayoi-spatial-structure"],
    sourceIds: ["gishi-wajinden-archaeology"],
    confidence: "high",
    reviewStatus: "reviewed",
    note: "一支国（壱岐）と伊都国（糸島）を結ぶ玄界灘の主要渡航海路。",
  });

  // Map Connection 1: Chikugo-Ariake corridor
  const chikugoPlaces = ["place-yoshinogari", "place-hiratsuka-kawazoe"];
  const chikugoAssertions = assertions.filter(
    (a) => chikugoPlaces.includes(a.subjectId) && chikugoPlaces.includes(a.objectId)
  );

  // Map Connection 2: Ito-Na archaeological axis
  const itoNaPlaces = ["place-hirabaru", "place-mikumo-ihara", "place-sugu-okamoto", "place-itatuke"];
  const itoNaAssertions = assertions.filter(
    (a) => itoNaPlaces.includes(a.subjectId) && itoNaPlaces.includes(a.objectId)
  );

  // Map Connection 3: Genkai island trade
  const genkaiTradePlaces = ["place-harunotsuji", "place-mikumo-ihara"];
  const genkaiTradeAssertions = assertions.filter(
    (a) => genkaiTradePlaces.includes(a.subjectId) && genkaiTradePlaces.includes(a.objectId)
  );

  const mapConnections: any[] = [
    {
      id: "chikugo-ariake-settlement-corridor",
      label: "筑後川・有明海弥生拠点回廊（吉野ヶ里・朝倉平塚川添）",
      description: "佐賀平野の巨大環濠集落・吉野ヶ里と、筑後川中流域の平塚川添遺跡を結ぶ弥生大集落・邪馬台国候補地ネットワーク。",
      displayMode: "line",
      placeEntityIds: chikugoPlaces,
      assertionIds: chikugoAssertions.map((a) => a.id),
      appearance: {
        color: "#ca8a04",
        dashArray: [8, 4],
        legendLabel: "有明・筑後弥生回廊",
      },
    },
    {
      id: "ito-na-archaeological-axis",
      label: "伊都国・奴国中枢王墓回廊（三雲・平原・須玖岡本・板付）",
      description: "糸島半島の伊都国王墓群（三雲・平原）から、福岡平野の奴国王墓（須玖岡本）・最古水田環濠集落（板付）を結ぶ古代王権中枢軸。",
      displayMode: "line",
      placeEntityIds: itoNaPlaces,
      assertionIds: itoNaAssertions.map((a) => a.id),
      appearance: {
        color: "#e11d48",
        dashArray: [6, 4],
        legendLabel: "伊都・奴国王墓軸",
      },
    },
    {
      id: "genkai-island-trade-route",
      label: "玄界灘海運・一支国伊都国回廊",
      description: "魏志倭人伝に記された一支国（壱岐原の辻）から伊都国（糸島三雲）への対馬海峡・玄界灘渡海中継ルート。",
      displayMode: "line",
      placeEntityIds: genkaiTradePlaces,
      assertionIds: genkaiTradeAssertions.map((a) => a.id),
      appearance: {
        color: "#2563eb",
        dashArray: [8, 4],
        legendLabel: "玄界灘海運回廊",
      },
    },
  ];

  const presets = [
    {
      id: "yayoi-archaeology-preset",
      label: "北部九州弥生拠点遺跡ネットワーク",
      lensType: "relationship" as const,
      description: "吉野ヶ里、平塚川添、伊都国三雲・平原、奴国須玖岡本、一支国原の辻を結ぶ弥生時代拠点集落と王墓群の考古学的空間配置。",
      rootEntityIds: ["place-yoshinogari", "place-hiratsuka-kawazoe"],
      relationFamilies: ["conceptual-comparison" as const, "route" as const, "association" as const],
      viewpointIds: ["yayoi-spatial-structure"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "yayoi-archaeology-network",
    version: "0.1.0",
    label: "北部九州弥生拠点遺跡ネットワーク",
    description: "有明海・筑後川水系から玄界灘・壱岐へと展開した弥生時代の拠点環濠集落と王墓群。魏志倭人伝と考古学的遺構が交差する外部ナレッジパック。",
    status: "active" as const,
    releasedAt: "2026-09-27",
    sources,
    viewpoints,
    entities,
    assertions,
    presets,
  };

  const validated = LensKnowledgePackSchema.parse(packData);
  await writeFile(outputPath, JSON.stringify(validated, null, 2), "utf-8");
  console.log(`[ingest] Yayoi archaeology pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("yayoi-archaeology-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/yayoi-archaeology-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/yayoi-archaeology-network.json");
  convertYayoiArchaeologyCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate yayoi archaeology pack:", err);
    process.exit(1);
  });
}
