import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  province: string;
  deity: string;
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

export async function convertIchinomiyaCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "dainihonkoku-ichinomiyaki",
      kind: "classical-text" as const,
      title: "大日本国一宮記",
      authors: ["編者不詳"],
      publishedAt: "1350",
      reviewStatus: "reviewed" as const,
      note: "中世に全国六十余州の一宮を集成した記録。",
    },
    {
      id: "engishiki-jimmyocho-ichinomiya",
      kind: "classical-text" as const,
      title: "延喜式神名帳（式内一宮）",
      authors: ["藤原時平", "藤原忠平"],
      publishedAt: "0927",
      reviewStatus: "reviewed" as const,
      note: "延長5年完成の延喜式に載る各地の筆頭神社群。",
    },
  ];

  const viewpoints = [
    {
      id: "ichinomiya-system",
      kind: "analytical" as const,
      label: "律令制下における諸国一宮ネットワーク",
      description: "平安時代中期から中世にかけて、国司が巡拝する筆頭神社として定着した諸国一宮の地理的配置と信仰体系。",
    },
  ];

  const entities: any[] = [];
  const assertions: any[] = [];

  for (const row of rows) {
    const placeEntityId = `place-${row.id}`;
    const deityEntityId = `deity-${row.id}`;

    // Place entity
    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.name, `${row.province}国一宮 ${row.name}`, `${row.province}国一之宮`],
      description: `${row.province}国一之宮。${row.rank}。${row.description}`,
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
      viewpointIds: ["ichinomiya-system"],
      sourceIds: ["dainihonkoku-ichinomiyaki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `${row.province}国一宮 ${row.name}の祭神。`,
    });
  }

  // Group 1: Northern & Central Kyushu Ichinomiya (Hakozaki, Usa, Yusuhara, Yodohime, Aso)
  const kyushuPlaces = [
    "place-hakozaki-gu",
    "place-usa-jingu-ichi",
    "place-yusuhara-hachimangu",
    "place-yodohime-jinja",
    "place-aso-jinja",
  ];
  const kyushuAssertions = assertions.filter((a) => kyushuPlaces.includes(a.objectId));

  // Group 2: Sanyo / West Honshu Ichinomiya (Nagato Sumiyoshi, Tamanooya in Suo, Itsukushima in Aki)
  const sanyoPlaces = [
    "place-sumiyoshi-jinja-nagato",
    "place-tamanooya-jinja",
    "place-itsukushima-jinja-ichi",
  ];
  const sanyoAssertions = assertions.filter((a) => sanyoPlaces.includes(a.objectId));

  // Group 3: Border Islands Ichinomiya (Kaijin in Tsushima, Techo in Iki, Hakozaki in Chikuzen)
  const islandPlaces = [
    "place-kaijin-jinja",
    "place-techo-jinja",
    "place-hakozaki-gu",
  ];
  const islandAssertions = assertions.filter((a) => islandPlaces.includes(a.objectId));

  const mapConnections: any[] = [
    {
      id: "kyushu-ichinomiya-circuit",
      label: "九州諸国一宮巡礼回廊",
      description: "筑前（筥崎宮）、豊前（宇佐神宮）、豊後（柞原八幡宮）、肥前（與止日女神社）、肥後（阿蘇神社）を結ぶ九州中枢一之宮ネットワーク。",
      displayMode: "line",
      placeEntityIds: kyushuPlaces,
      contextEntityIds: Array.from(new Set(kyushuAssertions.map((a) => a.subjectId))),
      assertionIds: kyushuAssertions.map((a) => a.id),
      appearance: {
        color: "#059669",
        dashArray: [8, 4],
        legendLabel: "九州諸国一宮回廊",
      },
    },
    {
      id: "sanyo-ichinomiya-corridor",
      label: "西国山陽道・瀬戸内一宮回廊",
      description: "下関の長門国住吉神社、防府の周防国玉祖神社、宮島の安芸国厳島神社を結ぶ西国官道・瀬戸内海運の筆頭大社群。",
      displayMode: "line",
      placeEntityIds: sanyoPlaces,
      contextEntityIds: Array.from(new Set(sanyoAssertions.map((a) => a.subjectId))),
      assertionIds: sanyoAssertions.map((a) => a.id),
      appearance: {
        color: "#0284c7",
        dashArray: [6, 4],
        legendLabel: "山陽・瀬戸内一宮回廊",
      },
    },
    {
      id: "genkai-islands-ichinomiya-network",
      label: "玄界灘・国境諸島一宮海路",
      description: "対馬海神神社、壱岐天手長男神社、博多湾筥崎宮を結ぶ古代遣唐使・朝鮮半島渡航ルートの守護大社回廊。",
      displayMode: "line",
      placeEntityIds: islandPlaces,
      contextEntityIds: Array.from(new Set(islandAssertions.map((a) => a.subjectId))),
      assertionIds: islandAssertions.map((a) => a.id),
      appearance: {
        color: "#d97706",
        dashArray: [8, 4],
        legendLabel: "玄界灘・諸島一宮海路",
      },
    },
  ];

  const presets = [
    {
      id: "ichinomiya-western-preset",
      label: "西国諸国一宮ネットワーク",
      lensType: "relationship" as const,
      description: "九州・山陽・諸島における令制国の一宮（筆頭大社）の空間配置と、国司巡拝・地域統合の祭祀体系。",
      rootEntityIds: ["place-usa-jingu-ichi", "place-itsukushima-jinja-ichi"],
      relationFamilies: ["enshrinement" as const],
      viewpointIds: ["ichinomiya-system"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "ichinomiya-western-network",
    version: "0.1.0",
    label: "西国諸国一宮ネットワーク",
    description: "九州・山陽・対馬・壱岐の令制国一之宮群。地域社会の統合神と古代交通路に沿った筆頭大社を辿る外部ナレッジパック。",
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
  console.log(`[ingest] Ichinomiya pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("ichinomiya-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/ichinomiya-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/ichinomiya-western-network.json");
  convertIchinomiyaCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate ichinomiya pack:", err);
    process.exit(1);
  });
}
