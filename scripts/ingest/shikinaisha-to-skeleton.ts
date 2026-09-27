import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  deity: string;
  province: string;
  district: string;
  currentShrine: string;
  latitude: number;
  longitude: number;
  rank: string;
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

export async function convertShikinaishaCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "engishiki-jimmyocho",
      kind: "classical-text" as const,
      title: "延喜式神名帳（巻九・十）",
      authors: ["藤原時平", "藤原忠平"],
      publishedAt: "0927",
      reviewStatus: "reviewed" as const,
      note: "延長5年（927年）完成の延喜式所載の全国官社一覧（式内社）。",
    },
  ];

  const viewpoints = [
    {
      id: "shikinaisha-maritime-rites",
      kind: "analytical" as const,
      label: "古代国家祭祀と海路・街道ネットワーク",
      description: "延喜式神名帳に記載された式内社・名神大社を、古代海上交通および山陽道・大宰府防衛の観点から構造化する。",
    },
  ];

  const entities: any[] = [];
  const assertions: any[] = [];
  const placeIdsByProvince: Record<string, string[]> = {};

  for (const row of rows) {
    const placeEntityId = `place-${row.id}`;
    const deityEntityId = `deity-${row.id}`;

    if (!placeIdsByProvince[row.province]) {
      placeIdsByProvince[row.province] = [];
    }
    placeIdsByProvince[row.province].push(placeEntityId);

    // Place entity
    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.currentShrine, `${row.province}国${row.district} ${row.name}`],
      description: `${row.province}国${row.district}座。${row.rank}。${row.description}`,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });

    // Deity entity
    entities.push({
      id: deityEntityId,
      kind: "deity",
      label: row.deity,
      aliases: [row.deity],
      description: `${row.name}の主祭神`,
    });

    // Assertion: Enshrinement
    assertions.push({
      id: `enshrine-${row.id}`,
      subjectId: deityEntityId,
      predicate: "enshrined_at",
      objectId: placeEntityId,
      relationFamily: "enshrinement",
      nature: "reviewed-reference",
      viewpointIds: ["shikinaisha-maritime-rites"],
      sourceIds: ["engishiki-jimmyocho"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `延喜式神名帳記載：${row.province}国 ${row.name}（${row.rank}）`,
    });
  }

  // Map connections: Coastal shrines network in Chikuzen / Buzen
  const chikuzenBuzenPlaces = [
    ...(placeIdsByProvince["筑前"] ?? []),
    ...(placeIdsByProvince["豊前"] ?? []),
  ];

  const mapConnections: any[] = [];
  if (chikuzenBuzenPlaces.length >= 2) {
    const cbAssertions = assertions.filter((a) =>
      chikuzenBuzenPlaces.includes(a.objectId)
    );
    mapConnections.push({
      id: "chikuzen-buzen-maritime-network",
      label: "玄界灘・周防灘海上守護回廊",
      description: "志賀海神社（海人族・阿曇氏）、宗像大社（宗像三女神）、住吉神社（大和王権渡航神）、宇佐神宮（八幡大神）を結ぶ玄界灘から瀬戸内西端への祭祀ネットワーク。",
      displayMode: "line",
      placeEntityIds: chikuzenBuzenPlaces,
      contextEntityIds: Array.from(new Set(cbAssertions.map((a) => a.subjectId))),
      assertionIds: cbAssertions.map((a) => a.id),
      appearance: {
        color: "#10b981",
        dashArray: [8, 4],
        legendLabel: "式内名神大社・海路ネットワーク",
      },
    });
  }

  // Sanyo / Aki connection
  const sanyoAkiPlaces = [
    ...(placeIdsByProvince["安芸"] ?? []),
    ...(placeIdsByProvince["周防"] ?? []),
  ];
  if (sanyoAkiPlaces.length >= 2) {
    const sanyoAssertions = assertions.filter((a) =>
      sanyoAkiPlaces.includes(a.objectId)
    );
    mapConnections.push({
      id: "sanyo-maritime-corridor",
      label: "瀬戸内西部・山陽道祭祀回廊",
      description: "厳島神社（瀬戸内航路守護）、速谷神社（山陽道交通安全祈願）、防府天満宮（周防国府）を結ぶ西国交通の重要拠点群。",
      displayMode: "line",
      placeEntityIds: sanyoAkiPlaces,
      contextEntityIds: Array.from(new Set(sanyoAssertions.map((a) => a.subjectId))),
      assertionIds: sanyoAssertions.map((a) => a.id),
      appearance: {
        color: "#a855f7",
        dashArray: [6, 4],
        legendLabel: "瀬戸内・山陽道回廊",
      },
    });
  }

  const presets = [
    {
      id: "shikinaisha-network-preset",
      label: "式内名神大社ネットワーク",
      lensType: "relationship" as const,
      description: "延喜式神名帳に記された名神大社と祭神の関係および古代交通回廊の配置。",
      rootEntityIds: chikuzenBuzenPlaces.slice(0, 2),
      relationFamilies: ["enshrinement" as const],
      viewpointIds: ["shikinaisha-maritime-rites"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "shikinaisha-chikuzen-buzen",
    version: "0.1.0",
    label: "筑前・豊前・安芸の式内社ネットワーク",
    description: "延喜式神名帳に基づく名神大社群。玄界灘の海人族祭祀、大宰府防衛、瀬戸内航路守護の空間配置を辿る外部ナレッジパック。",
    status: "active" as const,
    releasedAt: "2026-09-27",
    sources,
    viewpoints,
    entities,
    assertions,
    presets,
  };

  // Validate strictly with Zod
  const validated = LensKnowledgePackSchema.parse(packData);
  await writeFile(outputPath, JSON.stringify(validated, null, 2), "utf-8");
  console.log(`[ingest] Knowledge pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("shikinaisha-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/shikinaisha-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/shikinaisha-chikuzen-buzen.json");
  convertShikinaishaCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate pack:", err);
    process.exit(1);
  });
}
