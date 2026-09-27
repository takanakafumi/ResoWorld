import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  highway: string;
  province: string;
  location: string;
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

export async function convertAncientHighwaysCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "engishiki-hyobuso-ekidenma",
      kind: "classical-text" as const,
      title: "延喜式（巻二十八・兵部省諸国駅伝馬条）",
      authors: ["藤原時平", "藤原忠平"],
      publishedAt: "0927",
      reviewStatus: "reviewed" as const,
      note: "山陽道（大路、駅馬二十疋配備）および西海道（大宰府連絡路）の全駅家規定。",
    },
    {
      id: "shoku-nihongi-highway",
      kind: "classical-text" as const,
      title: "続日本紀（官道整備記録）",
      authors: ["菅野真道"],
      publishedAt: "0797",
      reviewStatus: "reviewed" as const,
      note: "大宝元年（701年）以降の駅馬制と大宰府官道運用の記録。",
    },
  ];

  const viewpoints = [
    {
      id: "ancient-highway-view",
      kind: "analytical" as const,
      label: "古代官道山陽道・西海道と大宰府連絡ネットワーク",
      description: "都と西の守り・大宰府を結ぶ律令国家唯一の大路（山陽道）と、関門海峡を越えて博多湾・都府楼へと続く西海道官道の空間構造。",
    },
  ];

  const entities: any[] = [];
  const assertions: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const placeEntityId = `place-${row.id}`;

    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.name, `${row.province}国 ${row.name}`, row.highway],
      description: `${row.province}国（${row.location}）。${row.rank}。${row.description}`,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });
  }

  // Sequential route assertions along the highway
  for (let i = 0; i < rows.length - 1; i++) {
    const curr = rows[i];
    const next = rows[i + 1];
    assertions.push({
      id: `highway-seg-${curr.id}-${next.id}`,
      subjectId: `place-${curr.id}`,
      predicate: "connects_to",
      objectId: `place-${next.id}`,
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["ancient-highway-view"],
      sourceIds: ["engishiki-hyobuso-ekidenma"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `${curr.highway}：${curr.name}から${next.name}への古代官道区間。`,
    });
  }

  // Map Connection 1: Sanyo Highway West section (Kamo -> Funo -> Saba -> Asa -> Shimonoseki)
  const sanyoPlaces = [
    "place-kamo-ekika",
    "place-funo-ekika",
    "place-saba-ekika",
    "place-asa-ekika",
    "place-shimonoseki-tsu",
  ];
  const sanyoAssertions = assertions.filter((a) =>
    sanyoPlaces.includes(a.subjectId) && sanyoPlaces.includes(a.objectId)
  );

  // Map Connection 2: Saikaido Dazaifu highway (Shimonoseki -> Onga -> Akama -> Mushiroda -> Korokan -> Dazaifu)
  const saikaidoPlaces = [
    "place-shimonoseki-tsu",
    "place-onga-ekika",
    "place-akama-ekika",
    "place-mushiroda-ekika",
    "place-korokan",
    "place-dazaifu-seicho",
  ];
  const saikaidoAssertions = assertions.filter((a) =>
    saikaidoPlaces.includes(a.subjectId) && saikaidoPlaces.includes(a.objectId)
  );

  const mapConnections: any[] = [
    {
      id: "sanyo-highway-west-trunk",
      label: "古代山陽道大路（安芸・周防・長門区間）",
      description: "東広島西条盆地から広島湾北、周防国府（防府）、厚狭盆地を経て関門海峡へと至る律令国家の大動脈。",
      displayMode: "line",
      placeEntityIds: sanyoPlaces,
      assertionIds: sanyoAssertions.map((a) => a.id),
      appearance: {
        color: "#2563eb",
        dashArray: [8, 4],
        legendLabel: "山陽道大路",
      },
    },
    {
      id: "saikaido-dazaifu-official-road",
      label: "西海道大宰府官道（関門・宗像・博多・都府楼）",
      description: "早鞆の瀬戸（関門海峡）から遠賀川、宗像赤間、席田を経て外交拠点・鴻臚館および大宰府政庁へと到達する西海道の中枢官道。",
      displayMode: "line",
      placeEntityIds: saikaidoPlaces,
      assertionIds: saikaidoAssertions.map((a) => a.id),
      appearance: {
        color: "#0891b2",
        dashArray: [6, 4],
        legendLabel: "西海道大宰府官道",
      },
    },
  ];

  const presets = [
    {
      id: "ancient-highways-preset",
      label: "古代官道・山陽道と西海道駅家網",
      lensType: "route" as const,
      description: "延喜式兵部省諸国駅伝馬条に記録された山陽道大路の駅家群と、関門海峡を越えて大宰府政庁・鴻臚館を結ぶ古代幹線交通網。",
      rootEntityIds: ["place-dazaifu-seicho", "place-korokan"],
      relationFamilies: ["route" as const],
      viewpointIds: ["ancient-highway-view"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "ancient-highways-network",
    version: "0.1.0",
    label: "古代官道・山陽道と西海道駅家網",
    description: "安芸・周防・長門から筑前大宰府へと続く古代の高速幹線道路ネットワーク。延喜式に基づく駅家と国際外交の空間配置。",
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
  console.log(`[ingest] Ancient highways pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("ancient-highways-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/ancient-highways-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/ancient-highways-network.json");
  convertAncientHighwaysCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate ancient highways pack:", err);
    process.exit(1);
  });
}
