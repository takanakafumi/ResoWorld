import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  type: string;
  province: string;
  location: string;
  latitude: number;
  longitude: number;
  builtYear: string;
  builder: string;
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

export async function convertAncientFortressesCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "nihon-shoki",
      kind: "classical-text" as const,
      title: "日本書紀（天智紀・持統紀）",
      authors: ["舎人親王"],
      publishedAt: "0720",
      reviewStatus: "reviewed" as const,
      note: "天智三年（664年）水城築造、天智四年（665年）長門城・大野城・基肄城築造、天智六年（667年）高安城・屋嶋城・金田城築造の記録。",
    },
    {
      id: "shoku-nihongi",
      kind: "classical-text" as const,
      title: "続日本紀（文武紀）",
      authors: ["菅野真道", "藤原継縄"],
      publishedAt: "0797",
      reviewStatus: "reviewed" as const,
      note: "文武二年（698年）大野城・基肄城・鞠智城修復の記載。",
    },
  ];

  const viewpoints = [
    {
      id: "dazaifu-national-defense",
      kind: "analytical" as const,
      label: "白村江敗戦後の国防体制と古代山城配置",
      description: "663年白村江の戦いでの敗戦を契機に、唐・新羅の侵攻を想定して対馬から大宰府、瀬戸内、大和盆地にかけて急造された防衛施設・山城の空間ネットワーク。",
    },
  ];

  const entities: any[] = [
    {
      id: "polity-yamato-court",
      kind: "polity",
      label: "大和王権（朝廷）",
      aliases: ["近江朝廷", "大和朝廷"],
      description: "天智天皇のもとで近江令や国防要塞網の整備を進めた古代日本の統治中枢。",
    },
    {
      id: "polity-dazaifu",
      kind: "polity",
      label: "大宰府",
      aliases: ["筑紫大宰", "遠の朝廷"],
      description: "西海道九国二島を統括し、外交・軍事・防衛の最前線となった古代行政中枢。",
    },
  ];

  const assertions: any[] = [];
  const placeIds: string[] = [];

  for (const row of rows) {
    const placeEntityId = `place-${row.id}`;
    placeIds.push(placeEntityId);

    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.name, `${row.province}国 ${row.name}`],
      description: `${row.province}国（${row.location}）。${row.type}。${row.builtYear}築城（${row.builder}）。${row.description}`,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });

    // Assertion 1: Built by Yamato Court
    const assertionBuiltId = `built-${row.id}`;
    assertions.push({
      id: assertionBuiltId,
      subjectId: "polity-yamato-court",
      predicate: "constructed",
      objectId: placeEntityId,
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["dazaifu-national-defense"],
      sourceIds: ["nihon-shoki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `${row.name}は${row.builtYear}に${row.builder}により築城。`,
    });

    // Assertion 2: Defends Dazaifu
    const assertionDefenseId = `defends-${row.id}`;
    assertions.push({
      id: assertionDefenseId,
      subjectId: placeEntityId,
      predicate: "defends",
      objectId: "polity-dazaifu",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["dazaifu-national-defense"],
      sourceIds: ["nihon-shoki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `${row.name}は大宰府および古代国防の要衝。`,
    });
  }

  // Map Connection 1: Dazaifu core defense triad (Mizuki, Ono-jo, Kii-jo)
  const dazaifuCorePlaces = ["place-mizuki", "place-ono-jo", "place-kii-jo"];
  const dazaifuCoreAssertions = assertions.filter(
    (a) => dazaifuCorePlaces.includes(a.objectId) || dazaifuCorePlaces.includes(a.subjectId)
  );

  // Map Connection 2: Western maritime defense line (Kaneda-jo in Tsushima, Raizan in Itoshima, Mizuki in Dazaifu, Kikuchi-jo in Higo)
  const westernDefensePlaces = ["place-kaneda-jo", "place-raizan-shinogoseki", "place-mizuki", "place-kikuchi-jo"];
  const westernDefenseAssertions = assertions.filter(
    (a) => westernDefensePlaces.includes(a.objectId) || westernDefensePlaces.includes(a.subjectId)
  );

  // Map Connection 3: Setouchi and Yamato defense line (Yashima-jo, Takayasu-jo)
  const setouchiYamatoPlaces = ["place-yashima-ji-castle", "place-takayasu-jo"];
  const setouchiYamatoAssertions = assertions.filter(
    (a) => setouchiYamatoPlaces.includes(a.objectId) || setouchiYamatoPlaces.includes(a.subjectId)
  );

  const mapConnections: any[] = [
    {
      id: "dazaifu-core-defense-network",
      label: "大宰府直轄防衛ライン（水城・大野城・基肄城）",
      description: "平野を遮断する水城土塁、背後の四王寺山に聳える大野城、南方を扼する基山基肄城による大宰府の三位一体要塞群。",
      displayMode: "line",
      placeEntityIds: dazaifuCorePlaces,
      contextEntityIds: ["polity-yamato-court", "polity-dazaifu"],
      assertionIds: dazaifuCoreAssertions.map((a) => a.id),
      appearance: {
        color: "#dc2626",
        dashArray: [8, 4],
        legendLabel: "大宰府直轄防衛線",
      },
    },
    {
      id: "western-maritime-defense-line",
      label: "西海道・対馬海防要塞網",
      description: "朝鮮半島に対峙する対馬金田城から、玄界灘方面の雷山神籠石、大宰府水城、有明海・肥後兵站拠点の鞠智城を結ぶ西日本防衛の縦深陣地網。",
      displayMode: "line",
      placeEntityIds: westernDefensePlaces,
      contextEntityIds: ["polity-yamato-court", "polity-dazaifu"],
      assertionIds: westernDefenseAssertions.map((a) => a.id),
      appearance: {
        color: "#ea580c",
        dashArray: [6, 4],
        legendLabel: "対馬・西海道海防網",
      },
    },
    {
      id: "setouchi-yamato-defense-corridor",
      label: "瀬戸内・畿内最終防衛回廊",
      description: "瀬戸内海の要衝・讃岐屋嶋城と、大和盆地・近江朝の前面を守る河内・大和境の高安城を結ぶ内海・畿内防衛ライン。",
      displayMode: "line",
      placeEntityIds: setouchiYamatoPlaces,
      contextEntityIds: ["polity-yamato-court", "polity-dazaifu"],
      assertionIds: setouchiYamatoAssertions.map((a) => a.id),
      appearance: {
        color: "#7c3aed",
        dashArray: [8, 4],
        legendLabel: "瀬戸内・畿内防衛線",
      },
    },
  ];

  const presets = [
    {
      id: "dazaifu-defense-preset",
      label: "白村江後の古代国防・山城ネットワーク",
      lensType: "relationship" as const,
      description: "663年の白村江敗戦を機に築造された水城・朝鮮式山城群の空間配置と、大宰府および畿内防衛の構造。",
      rootEntityIds: ["place-mizuki", "place-ono-jo"],
      relationFamilies: ["historical-context" as const, "association" as const],
      viewpointIds: ["dazaifu-national-defense"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "ancient-defense-network",
    version: "0.1.0",
    label: "白村江後の古代国防・山城ネットワーク",
    description: "天智天皇期に唐・新羅の侵攻に備えて急造された水城、大野城、基肄城、金田城などの古代山城群。大宰府防衛と国家防衛体制の空間配置。",
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
  console.log(`[ingest] Ancient defense pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("ancient-fortresses-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/ancient-fortresses-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/ancient-defense-network.json");
  convertAncientFortressesCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate ancient defense pack:", err);
    process.exit(1);
  });
}
