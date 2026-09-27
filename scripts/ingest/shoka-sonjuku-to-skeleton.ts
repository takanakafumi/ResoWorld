import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema } from "../../apps/web/src/domain/lens-packs/schema";

interface CsvRow {
  id: string;
  name: string;
  person: string;
  role: string;
  latitude: number;
  longitude: number;
  period: string;
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

export async function convertShokaSonjukuCsvToPack(
  csvPath: string,
  outputPath: string
) {
  const rawCsv = await readFile(csvPath, "utf-8");
  const rows = parseCsv(rawCsv);

  const sources = [
    {
      id: "bocho-kaitenshi",
      kind: "research-publication" as const,
      title: "防長回天史",
      authors: ["末松謙澄"],
      publishedAt: "1921",
      reviewStatus: "reviewed" as const,
      note: "長州藩の幕末維新における政治・軍事・外交の公的編纂記録。",
    },
    {
      id: "yoshida-shoin-zenshu",
      kind: "modern-reference" as const,
      title: "吉田松陰全集",
      authors: ["山口県教育会"],
      publishedAt: "1936",
      reviewStatus: "reviewed" as const,
      note: "松下村塾における教育と思想的門下生の往復書簡記録。",
    },
  ];

  const viewpoints = [
    {
      id: "shoka-sonjuku-action-view",
      kind: "analytical" as const,
      label: "松下村塾門下生と長州志士の行動ネットワーク",
      description: "吉田松陰の思想教育を受けた門下生たちが、萩の小空間から下関・防府・京都へと展開した幕末変革の空間軌跡。",
    },
  ];

  const persons = [
    {
      id: "person-yoshida-shoin",
      kind: "person" as const,
      label: "吉田松陰",
      aliases: ["吉田寅次郎", "松陰先生"],
      description: "長州藩士・思想家。松下村塾を主宰し明治維新の精神的指導者となった。",
    },
    {
      id: "person-takasugi-shinsaku",
      kind: "person" as const,
      label: "高杉晋作",
      aliases: ["東行", "谷梅之助"],
      description: "松下村塾門下。奇兵隊を創設し功山寺挙兵で長州藩論を倒幕へと導いた志士。",
    },
    {
      id: "person-kido-takayoshi",
      kind: "person" as const,
      label: "木戸孝允",
      aliases: ["桂小五郎"],
      description: "松下村塾に学ぶ。維新の三傑の一人として薩長同盟締結や明治新政府の基礎を築いた。",
    },
    {
      id: "person-ito-hirobumi",
      kind: "person" as const,
      label: "伊藤博文",
      aliases: ["利助", "俊輔"],
      description: "松下村塾門下。英国留学、長州藩外交を経て初代内閣総理大臣・大日本帝国憲法起草者となった。",
    },
  ];

  const entities: any[] = [...persons];
  const assertions: any[] = [];

  // Teacher-student assertions
  assertions.push(
    {
      id: "teacher-shoin-takasugi",
      subjectId: "person-yoshida-shoin",
      predicate: "taught",
      objectId: "person-takasugi-shinsaku",
      relationFamily: "influence",
      nature: "reviewed-reference",
      viewpointIds: ["shoka-sonjuku-action-view"],
      sourceIds: ["yoshida-shoin-zenshu"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "松下村塾における師弟関係。識見と行動力を高く評価。",
    },
    {
      id: "teacher-shoin-kido",
      subjectId: "person-yoshida-shoin",
      predicate: "taught",
      objectId: "person-kido-takayoshi",
      relationFamily: "influence",
      nature: "reviewed-reference",
      viewpointIds: ["shoka-sonjuku-action-view"],
      sourceIds: ["yoshida-shoin-zenshu"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "松下村塾における師弟関係。有事の外交・政略を託した。",
    },
    {
      id: "teacher-shoin-ito",
      subjectId: "person-yoshida-shoin",
      predicate: "taught",
      objectId: "person-ito-hirobumi",
      relationFamily: "influence",
      nature: "reviewed-reference",
      viewpointIds: ["shoka-sonjuku-action-view"],
      sourceIds: ["yoshida-shoin-zenshu"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: "松下村塾における師弟関係。周旋の才能を見抜いた。",
    }
  );

  for (const row of rows) {
    const placeEntityId = `place-${row.id}`;

    entities.push({
      id: placeEntityId,
      kind: "place",
      label: row.name,
      aliases: [row.name, `${row.person}ゆかりの地`],
      description: `${row.description}`,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });

    // Associated person
    const associatedPersonId = row.person.includes("吉田松陰")
      ? "person-yoshida-shoin"
      : row.person.includes("高杉晋作")
      ? "person-takasugi-shinsaku"
      : row.person.includes("木戸") || row.person.includes("桂")
      ? "person-kido-takayoshi"
      : row.person.includes("伊藤")
      ? "person-ito-hirobumi"
      : "person-yoshida-shoin";

    assertions.push({
      id: `assoc-${row.id}`,
      subjectId: associatedPersonId,
      predicate: "associated_with",
      objectId: placeEntityId,
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["shoka-sonjuku-action-view"],
      sourceIds: ["bocho-kaitenshi"],
      confidence: "high",
      reviewStatus: "reviewed",
      note: `${row.name}における${row.person}の活動（${row.role}）。`,
    });
  }

  // Map Connection 1: Hagi Shoka Sonjuku to Shimonoseki Kaiten (Shoka Sonjuku, Kouzanji, Sakurayama, Tokoan)
  const kaitenPlaces = [
    "place-shoka-sonjuku",
    "place-kouzanji",
    "place-sakurayama-jinja",
    "place-tokoan",
  ];
  const kaitenAssertions = assertions.filter(
    (a) => kaitenPlaces.includes(a.objectId) || (kaitenPlaces.includes(a.subjectId) && !persons.some(p => p.id === a.subjectId))
  );

  // Map Connection 2: Choshu Alliance Axis (Shoka Sonjuku, Chinryutei, Mitajiri Ochaya)
  const alliancePlaces = [
    "place-shoka-sonjuku",
    "place-chinryutei",
    "place-mitajiri-ochaya",
  ];
  const allianceAssertions = assertions.filter(
    (a) => alliancePlaces.includes(a.objectId)
  );

  // Map Connection 3: Hagi Statesmen Cradle (Shoka Sonjuku, Kido House, Ito House)
  const cradlePlaces = [
    "place-shoka-sonjuku",
    "place-kido-takayoshi-house",
    "place-ito-hirobumi-house",
  ];
  const cradleAssertions = assertions.filter(
    (a) => cradlePlaces.includes(a.objectId)
  );

  const mapConnections: any[] = [
    {
      id: "hagi-shimonoseki-kaiten-corridor",
      label: "萩・下関回天挙兵回廊",
      description: "吉田松陰の松下村塾から、高杉晋作の功山寺挙兵、桜山神社（招魂社）、終焉の地・東行庵を結ぶ長州維新回天の行動空間。",
      displayMode: "line",
      placeEntityIds: kaitenPlaces,
      contextEntityIds: ["person-yoshida-shoin", "person-takasugi-shinsaku"],
      assertionIds: kaitenAssertions.map((a) => a.id),
      appearance: {
        color: "#b91c1c",
        dashArray: [8, 4],
        legendLabel: "萩・下関回天回廊",
      },
    },
    {
      id: "choshu-political-alliance-axis",
      label: "山口・防府薩長盟約軸",
      description: "萩の思想源流から、討幕密談の地・山口枕流亭、長州海軍根拠地・防府三田尻御茶屋を結ぶ薩長同盟・討幕政略の主要結節点。",
      displayMode: "line",
      placeEntityIds: alliancePlaces,
      contextEntityIds: ["person-yoshida-shoin", "person-kido-takayoshi"],
      assertionIds: allianceAssertions.map((a) => a.id),
      appearance: {
        color: "#4338ca",
        dashArray: [6, 4],
        legendLabel: "山口・防府盟約軸",
      },
    },
    {
      id: "hagi-statesmen-cradle-network",
      label: "萩城下・近代指導者誕生拠点群",
      description: "松下村塾を中心に、桂小五郎（木戸孝允）生家、初代首相伊藤博文旧宅が近接する萩城下の思想・人材集積エリア。",
      displayMode: "line",
      placeEntityIds: cradlePlaces,
      contextEntityIds: ["person-yoshida-shoin", "person-kido-takayoshi", "person-ito-hirobumi"],
      assertionIds: cradleAssertions.map((a) => a.id),
      appearance: {
        color: "#c026d3",
        dashArray: [4, 4],
        legendLabel: "萩・近代国家指導者群",
      },
    },
  ];

  const presets = [
    {
      id: "shoka-sonjuku-action-preset",
      label: "松下村塾門下生と長州志士の行動網",
      lensType: "relationship" as const,
      description: "吉田松陰の教育から高杉晋作の奇兵隊・功山寺挙兵、木戸孝允・伊藤博文らの政治的拠点へと広がる行動軌跡。",
      rootEntityIds: ["place-shoka-sonjuku", "person-yoshida-shoin"],
      relationFamilies: ["influence" as const, "association" as const],
      viewpointIds: ["shoka-sonjuku-action-view"],
      mapConnections,
    },
  ];

  const packData = {
    schemaVersion: "0.1.0" as const,
    id: "shoka-sonjuku-network",
    version: "0.1.0",
    label: "松下村塾門下生と長州志士の行動網",
    description: "萩の松下村塾を起点に、下関・防府・山口へと展開した高杉晋作・木戸孝允・伊藤博文らの活動拠点を結ぶ人物・歴史ナレッジパック。",
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
  console.log(`[ingest] Shoka Sonjuku pack successfully generated at: ${outputPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("shoka-sonjuku-to-skeleton.ts")) {
  const root = resolve(__dirname, "../..");
  const csvPath = resolve(root, "data/skeletons/shoka-sonjuku-sample.csv");
  const outputPath = resolve(root, "data/knowledge-packs/shoka-sonjuku-network.json");
  convertShokaSonjukuCsvToPack(csvPath, outputPath).catch((err) => {
    console.error("[ingest] Failed to generate Shoka Sonjuku pack:", err);
    process.exit(1);
  });
}
