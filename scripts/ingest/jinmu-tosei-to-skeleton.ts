import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  role: string;
  region: string;
  location: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: any = {};
    header.forEach((key, index) => {
      const val = values[index] ?? "";
      if (key === "latitude" || key === "longitude") {
        row[key] = parseFloat(val);
      } else {
        row[key] = val;
      }
    });
    return row as CsvRow;
  });
}

export async function convertJinmuToseiCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "kojiki-jinmuki",
      kind: "classical-text" as const,
      title: "古事記（中巻・神武天皇段）",
      authors: ["太安万侶", "稗田阿礼"],
      publishedAt: "0712",
      reviewStatus: "reviewed" as const,
      note: "日向美々津出航、宇沙、筑紫岡田宮、阿岐多祁理宮、吉備高島宮、浪速渡、孔舎衙坂の戦い、熊野迂回、八咫烏先導、畝傍橿原宮即位の基本記録。",
    },
    {
      id: "nihonshoki-jinmuki",
      kind: "classical-text" as const,
      title: "日本書紀（巻第三・神武天皇即位前紀）",
      authors: ["舎人親王"],
      publishedAt: "0720",
      reviewStatus: "reviewed" as const,
      note: "一柱騰宮、岡田宮、多祁理宮、高島宮での軍備・造船の年数、盾津の命名、名草邑・熊野の神毒、高倉下の神剣布都御魂の降下記述。",
    },
    {
      id: "setouchi-kodai-kaiun",
      kind: "modern-reference" as const,
      title: "瀬戸内古代海運と港湾遺跡集成",
      authors: ["古代交通研究会"],
      publishedAt: "2021",
      reviewStatus: "reviewed" as const,
      note: "瀬戸内海の潮流・潮待ち港（風待ち津）と吉備・安芸・周防の弥生〜古墳時代首長居館・港湾遺跡の考古学的検討。",
    },
  ];

  const viewpoints = [
    {
      id: "jinmu-tosei-route-view",
      kind: "analytical" as const,
      label: "神武東征・瀬戸内海内海航路と風待ち行宮網",
      description: "日向美々津から豊後宇佐、筑紫岡田宮、安芸多祁理宮、吉備高島宮を経て難波津に至る古代海上交通と行宮群。",
    },
    {
      id: "jinmu-yamato-conquest-view",
      kind: "analytical" as const,
      label: "難波敗退・熊野山岳踏破と大和橿原即位",
      description: "生駒山麓での敗退から紀伊半島迂回、熊野上陸、八咫烏の先導による険路踏破と橿原での即位。",
    },
  ];

  const entities = rows.map((row) => ({
    id: `place-${row.id}`,
    label: row.name,
    kind: "place" as const,
    aliases: [row.name, `${row.region} ${row.name}`, row.role],
    description: `${row.region}（${row.location}）。${row.role}。${row.description}`,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
    },
  }));

  const assertions: any[] = [
    {
      id: "assert-mimitsu-usa",
      subjectId: "place-mimitsu",
      predicate: "connects_to",
      objectId: "place-usa-hitohashira",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-tosei-route-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "日向美々津を出航し、豊後水道を経て宇佐の一柱騰宮へ至る航路。",
    },
    {
      id: "assert-usa-okada",
      subjectId: "place-usa-hitohashira",
      predicate: "connects_to",
      objectId: "place-okada-gu",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-tosei-route-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "宇佐から周防灘・関門海峡・洞海湾を抜けて筑紫の岡田宮へ至る航路。岡田宮に1年間滞在。",
    },
    {
      id: "assert-okada-takeri",
      subjectId: "place-okada-gu",
      predicate: "connects_to",
      objectId: "place-takeri-no-miya",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-tosei-route-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "岡田宮から関門海峡を越え、安芸国多祁理宮（埃宮）へ至る瀬戸内航路。7年間滞在。",
    },
    {
      id: "assert-takeri-takashima",
      subjectId: "place-takeri-no-miya",
      predicate: "connects_to",
      objectId: "place-takashima-no-miya",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-tosei-route-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "安芸多祁理宮から吉備国高島宮へ至る航路。高島宮に8年間滞在し軍船調達と兵糧蓄積を行う。",
    },
    {
      id: "assert-takashima-tatetsu",
      subjectId: "place-takashima-no-miya",
      predicate: "connects_to",
      objectId: "place-tatetsu-kusaka",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-tosei-route-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "吉備高島宮から備讃瀬戸・播磨灘を越えて難波津（草香江）へ至り、生駒山麓の日下で長髄彦と激戦。",
    },
    {
      id: "assert-tatetsu-kumano",
      subjectId: "place-tatetsu-kusaka",
      predicate: "connects_to",
      objectId: "place-kumano-kamikura",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-yamato-conquest-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "日下での敗退後、「日に向かって戦うのは良くない」として大阪湾へ退却し、紀伊半島を海路迂回して熊野へ上陸。",
    },
    {
      id: "assert-kumano-kashihara",
      subjectId: "place-kumano-kamikura",
      predicate: "connects_to",
      objectId: "place-kashihara-jingu",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["jinmu-yamato-conquest-view"],
      sourceIds: ["kojiki-jinmuki", "nihonshoki-jinmuki"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "神倉のゴトビキ岩上陸、高倉下による神剣布都御魂の受授、八咫烏の先導で吉野・熊野の険山を越えて大和盆地に入り、畝傍山麓の橿原宮で即位。",
    },
  ];

  const setouchiPlaces = [
    "place-mimitsu",
    "place-usa-hitohashira",
    "place-okada-gu",
    "place-takeri-no-miya",
    "place-takashima-no-miya",
    "place-tatetsu-kusaka",
  ];
  const setouchiAssertions = assertions.filter((a) =>
    setouchiPlaces.includes(a.subjectId) && setouchiPlaces.includes(a.objectId)
  );

  const bypassPlaces = ["place-tatetsu-kusaka", "place-kumano-kamikura"];
  const bypassAssertions = assertions.filter((a) =>
    bypassPlaces.includes(a.subjectId) && bypassPlaces.includes(a.objectId)
  );

  const enthronementPlaces = ["place-kumano-kamikura", "place-kashihara-jingu"];
  const enthronementAssertions = assertions.filter((a) =>
    enthronementPlaces.includes(a.subjectId) && enthronementPlaces.includes(a.objectId)
  );

  const mapConnections: any[] = [
    {
      id: "jinmu-setouchi-sea-route",
      label: "神武東征・瀬戸内海路と風待ち行宮網",
      description: "日向美々津から豊後宇佐、筑紫岡田宮、安芸多祁理宮、吉備高島宮を経て難波津に至る古代内海航路と造船・補給拠点回廊。",
      displayMode: "line",
      placeEntityIds: setouchiPlaces,
      assertionIds: setouchiAssertions.map((a) => a.id),
      appearance: {
        color: "#2563eb",
        dashArray: [8, 4],
        legendLabel: "瀬戸内東征航路",
      },
    },
    {
      id: "jinmu-kusaka-defeat-and-bypass",
      label: "孔舎衙坂の難波敗退と紀伊半島迂回路",
      description: "生駒山麓の激戦で五瀬命が負傷・敗退したのち、日下から大阪湾へ退却し紀伊半島を海路迂回して熊野へ至った転進路。",
      displayMode: "line",
      placeEntityIds: bypassPlaces,
      assertionIds: bypassAssertions.map((a) => a.id),
      appearance: {
        color: "#dc2626",
        dashArray: [6, 4],
        legendLabel: "生駒敗退・熊野迂回路",
      },
    },
    {
      id: "jinmu-kumano-yamato-enthronement",
      label: "熊野山岳踏破・八咫烏先導と大和橿原即位",
      description: "神倉神社ゴトビキ岩上陸と神剣布都御魂受授、八咫烏に導かれた熊野山越えを経て畝傍山麓の橿原宮で初代天皇として即位した王権創始軸。",
      displayMode: "line",
      placeEntityIds: enthronementPlaces,
      assertionIds: enthronementAssertions.map((a) => a.id),
      appearance: {
        color: "#7c3aed",
        dashArray: [8, 4],
        legendLabel: "熊野山越え・大和即位軸",
      },
    },
  ];

  const presets = [
    {
      id: "jinmu-setouchi-route-preset",
      label: "神武東征・瀬戸内海路と風待ち津",
      lensType: "route" as const,
      description: "日向美々津から瀬戸内海を経て難波津に至る古代海上交通と行宮群",
      rootEntityIds: ["place-mimitsu", "place-takashima-no-miya"],
      relationFamilies: ["route" as const, "association" as const],
      viewpointIds: ["jinmu-tosei-route-view"],
      mapConnections: [mapConnections[0]],
    },
    {
      id: "jinmu-yamato-conquest-preset",
      label: "難波敗退・熊野山越えと大和即位",
      lensType: "relationship" as const,
      description: "生駒での敗退から紀伊半島迂回・八咫烏の先導による熊野山岳踏破と橿原即位",
      rootEntityIds: ["place-tatetsu-kusaka", "place-kashihara-jingu"],
      relationFamilies: ["route" as const, "conceptual-comparison" as const, "association" as const],
      viewpointIds: ["jinmu-yamato-conquest-view"],
      mapConnections: [mapConnections[1], mapConnections[2]],
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "jinmu-tosei-network",
    version: "0.1.0",
    label: "神武東征・瀬戸内海路と大和建国ネットワーク",
    description: "日向美々津から豊後・筑紫・安芸・吉備の瀬戸内航路、生駒敗退、熊野迂回、八咫烏先導、大和橿原即位に至る神話空間と古代地理の結節点ネットワーク。",
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
  console.log(`Successfully generated Jinmu Tosei Knowledge Pack: ${outputPath}`);
}

async function main() {
  const csvPath = resolve(__dirname, "../../data/skeletons/jinmu-tosei-sample.csv");
  const outputPath = resolve(__dirname, "../../data/knowledge-packs/jinmu-tosei-network.json");
  await convertJinmuToseiCsvToPack(csvPath, outputPath);
}

if (process.argv[1]?.includes("jinmu-tosei-to-skeleton")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
