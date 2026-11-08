import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const traveloguePath = path.join(
  root,
  "旅行記",
  "2026-11-08_志賀島探索と筑紫君・筑紫神社考察.md",
);

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf-8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-shikanoshima-chikushi-2026-11-08";

const newDocument = {
  id: documentId,
  title: "2026年11月8日 探索・考察記録（志賀島探索と筑紫君・筑紫神社考察）",
  path: "旅行記/2026-11-08_志賀島探索と筑紫君・筑紫神社考察.md",
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-11-08",
  documentedAt: "2026-11-08",
  dateStatus: "known",
};

// 1. Spots: 2 New + 2 Enriched Existing
const newSpots = [
  {
    id: "spot-kin-in-park",
    name: "金印公園",
    region: "福岡県 · 福岡市東区志賀島",
    kind: "史跡・記念公園",
    latitude: 33.6669,
    longitude: 130.3015,
    claimIds: [
      "claim-shika-kin-001",
      "claim-shika-kin-002",
      "claim-shika-kin-003",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-moko-zuka",
    name: "蒙古塚（首切塚）",
    region: "福岡県 · 福岡市東区志賀島",
    kind: "中世戦跡・供養塔",
    latitude: 33.6841,
    longitude: 130.3087,
    claimIds: [
      "claim-shika-moko-001",
      "claim-shika-moko-002",
      "claim-shika-moko-003",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

// Claims to append to existing spot-shikaumi-jinja
const shikaumiNewClaimIds = [
  "claim-shika-umi-001",
  "claim-shika-umi-002",
  "claim-shika-umi-003",
];

// Claims to append to existing spot-entity-20c6c6a47c1356d70583 (筑紫神社)
const chikushiNewClaimIds = [
  "claim-chikushi-order-001",
  "claim-chikushi-order-002",
  "claim-chikushi-order-003",
  "claim-chikushi-order-004",
  "claim-chikushi-iwai-001",
  "claim-chikushi-iwai-002",
  "claim-chikushi-iwai-003",
  "claim-chikushi-iwai-004",
  "claim-chikushi-iwai-005",
];

const travelogueLines = travelogueContent.split("\n");

function findLineRange(quote) {
  const cleanSnippet = quote.trim().split("\n")[0].trim().slice(0, 25);
  for (let i = 0; i < travelogueLines.length; i++) {
    if (travelogueLines[i].includes(cleanSnippet)) {
      return { startLine: i + 1, endLine: Math.min(travelogueLines.length, i + 12) };
    }
  }
  return { startLine: 1, endLine: 15 };
}

function makeClaim({
  id,
  statement,
  placeName,
  objectEntityName,
  historicalLabel,
  quote,
}) {
  const { startLine, endLine } = findLineRange(quote);
  return {
    schemaVersion: "0.2.0",
    id,
    statement,
    subject: { name: placeName, type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: objectEntityName, type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: historicalLabel,
      precision: "broad-range",
    },
    places: [{ name: placeName, role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine,
          endLine,
          quote,
        },
      },
    ],
    createdAt: "2026-11-08T10:00:00Z",
  };
}

// 2. 18 Claims
const claims = [
  makeClaim({
    id: "claim-shika-kin-001",
    statement: "志賀島の金印公園は、1784年（天明4年）に『後漢書』東夷伝所載の西暦57年光武帝下賜記事に対応する「漢委奴国王」金印（国宝）が発見された地である。",
    placeName: "金印公園",
    objectEntityName: "漢委奴国王金印（1784年発見・国宝）",
    historicalLabel: "弥生時代中期・江戸時代（1784年）",
    quote: "志賀島の金印公園では、1784年（天明4年）に発見された「漢委奴国王」金印について確認した。発見：1784年、発見地：志賀島、印文：「漢委奴国王」、『後漢書』東夷伝に記された、西暦57年の倭の使者への金印下賜記事との関係が知られる、現在の所蔵先：福岡市博物館、国宝。",
  }),
  makeClaim({
    id: "claim-shika-kin-002",
    statement: "金印の志賀島発見は直ちに島内の王都・王墓の存在を証明するものではないが、志賀島が博多湾口に位置する古代海上交通・対外交流の最重要拠点であったことを物語る。",
    placeName: "金印公園",
    objectEntityName: "博多湾口の海上交通・対外外交ゲートウェイ",
    historicalLabel: "弥生時代中期〜後期",
    quote: "金印が志賀島で発見されたことと、奴国の王都や政治の中心が志賀島にあったことは別の問題である。発見時の考古学的な状況は十分に明らかではなく、島に王宮や王墓があったと断定することはできない。一方、志賀島が博多湾の入口に位置することから、古代の海上交通や対外交流との関係を考えるうえで重要な場所である。",
  }),
  makeClaim({
    id: "claim-shika-kin-003",
    statement: "金印公園には郭沫若の詩碑および福岡市・広州市友好都市記念碑が併設されており、古代の外交遺物発見地に近現代の日中文化交流の記憶が重層している。",
    placeName: "金印公園",
    objectEntityName: "古代外交遺物発見地と近現代日中交流記念（郭沫若詩碑・広州友好記念碑）",
    historicalLabel: "近現代（1974年・1980年）",
    quote: "公園には、郭沫若の詩碑と、広州・福岡の友好都市記念碑もある。郭沫若は1918〜1923年に九州帝国大学で学んだ。1955年の福岡訪問時に詩を詠み、1974年にその詩を書き写した。福岡市と広州市は1979年に友好都市となった。金印という古代の日中交流を示す遺物のそばに、近現代の日中交流の記念碑が置かれている。",
  }),
  makeClaim({
    id: "claim-shika-umi-001",
    statement: "志賀海神社の祭神である綿津見三神（底津・中津・表津綿津見神）は、海底から表層に至る海の三層構造を象徴する海神として奉斎されている。",
    placeName: "志賀海神社",
    objectEntityName: "綿津見三神（底津・中津・表津＝海の三層性）",
    historicalLabel: "古代祭祀（神話時代〜古代）",
    quote: "志賀海神社の祭神は綿津見三神。底津綿津見神、中津綿津見神、表津綿津見神。海の深いところから表層まで、三層の海を象徴する神々として祀られている。",
  }),
  makeClaim({
    id: "claim-shika-umi-002",
    statement: "志賀海神社は古代海人集団・安曇氏の祭祀拠点であり、志賀島が博多湾口における航海・海上交通を掌握した集団の重要舞台であったことを示す。",
    placeName: "志賀海神社",
    objectEntityName: "古代海人集団安曇氏の祭祀・航海拠点",
    historicalLabel: "古代（古墳〜奈良時代）",
    quote: "志賀海神社は、古代の海人集団である安曇氏との関係で知られる。安曇氏は海上交通や航海に関わった有力集団として伝えられ、志賀島はその祭祀的な拠点として重要な意味を持っていたと考えられる。",
  }),
  makeClaim({
    id: "claim-shika-umi-003",
    statement: "万葉集に残る白水郎（海人）荒雄の対馬公的派遣と海難死の伝承は、奈良時代においても志賀島海人が朝廷の公的な海上交通を担っていた実態を実証する。",
    placeName: "志賀海神社",
    objectEntityName: "奈良時代における志賀島海人の公的海上交通参画",
    historicalLabel: "奈良時代",
    quote: "奈良時代の志賀の海人、白水郎（あま）荒雄が、対馬への公的な船の仕事に関わり、海上で命を落としたという話が万葉集に残されている。これは1世紀の金印の時代からの直接的な連続性を証明するものではない。しかし、少なくとも奈良時代にも、志賀島周辺の人々が公的な海上交通に関わっていたことを示す手がかりである。",
  }),
  makeClaim({
    id: "claim-shika-moko-001",
    statement: "志賀島は文永の役（1274年）および弘安の役（1281年）の激戦地であり、蒙古塚（旧称首切塚）は元軍戦死者を弔う供養地として位置づけられる。",
    placeName: "蒙古塚（首切塚）",
    objectEntityName: "文永・弘安の役戦跡および元軍戦死者供養地",
    historicalLabel: "鎌倉時代（1274年・1281年）",
    quote: "志賀島周辺は、1274年の文永の役、1281年の弘安の役で戦場となった地域である。現地案内によると、この場所はかつて「首切塚」と呼ばれ、1927年に蒙古・元軍の戦死者を弔う供養塔が建立された。",
  }),
  makeClaim({
    id: "claim-shika-moko-002",
    statement: "蒙古塚には1927年の高鍋日統による供養塔建立、1938年の徳王訪問など、中世の戦跡に近代の仏教供養と国際関係が重層している。",
    placeName: "蒙古塚（首切塚）",
    objectEntityName: "1927年供養塔建立・1938年徳王訪問（勝立寺飛地境内）",
    historicalLabel: "近代（1927年・1938年）",
    quote: "供養塔建立：1927年、建立の提唱者：日蓮宗の僧侶・高鍋日統、徳王の訪問：1938年、現在：福岡市中央区の勝立寺の飛地境内。ここには複数の時代の記憶が重なっている。1274年・1281年の戦闘の記憶、戦死者への供養という仏教的な営み、1927年の近代における記念碑建立、1938年の徳王訪問という近代の国際関係。",
  }),
  makeClaim({
    id: "claim-shika-moko-003",
    statement: "志賀島において敵側戦死者を供養する蒙古塚と日本側戦勝祈願が伝わる火焔塚が並存する事実は、戦争の記憶が防衛側単一視点ではなく多角的に残されていることを示す。",
    placeName: "蒙古塚（首切塚）",
    objectEntityName: "敵側死者供養と自国祈願の並存（多角的戦争記憶）",
    historicalLabel: "鎌倉時代〜近代",
    quote: "同じ志賀島周辺には、蒙古襲来に際して日本側の祈りが伝えられる火焔塚もある。火焔塚が日本側の戦勝祈願の伝承に結びつくのに対し、蒙古塚は敵側の死者への供養を表す。両者を並べると、戦争の記憶が一つの立場だけで残っているわけではないことが分かる。",
  }),
  makeClaim({
    id: "claim-chikushi-order-001",
    statement: "『筑後国風土記』逸文の荒ぶる神伝承では、筑前筑後国境の峠で往来者を害していた神を、筑紫君と肥君の占い、甕依姫の祝（祭祀）によって鎮め往来秩序を回復したとされる。",
    placeName: "筑紫神社",
    objectEntityName: "筑紫君・肥君の占いと甕依姫祭祀による神の鎮定・秩序回復",
    historicalLabel: "古代風土記時代（奈良時代編纂）",
    quote: "筑前・筑後の境界に、荒ぶる神がいる山（坂）があった。そこを往来する人々は、半ば生き、半ば死ぬほどの被害を受けていた。筑紫君と肥君らが占いを行った。筑紫君らの祖とされる甕依姫を祝（はふり、祭祀者）として祭らせた。その後、道を行く人々が神に害されなくなった。その神を「筑紫の神」と呼ぶようになった。",
  }),
  makeClaim({
    id: "claim-chikushi-order-002",
    statement: "荒ぶる神伝承において神を武力で討伐せず祭祀によって鎮定した筋書きは、地域有力者が土地神を祀ることで境界往来の交通秩序を平和的に成立させた記憶を反映している。",
    placeName: "筑紫神社",
    objectEntityName: "武力討伐ではなく祭祀による平和的境界交通秩序の確立",
    historicalLabel: "古代（古墳〜奈良時代）",
    quote: "重要なのは、神を武力で退治したのではなく、祭祀によって鎮めたという筋書きである。ここから、地域の有力者が土地の神を祭り、境界や交通の秩序を成立させた記憶が反映されている可能性を考えられる。",
  }),
  makeClaim({
    id: "claim-chikushi-order-003",
    statement: "逸文の「半生半死」や棺木伐採の「木尽し」は峠の危険・地域間紛争・疫病・土地神への畏怖などの複合的危機を象徴しており、単一の検疫制度等に還元することはできない。",
    placeName: "筑紫神社",
    objectEntityName: "峠道・紛争・疫病・土地神畏怖の象徴的表現（近代制度への短絡否定）",
    historicalLabel: "古代風土記時代",
    quote: "逸文には、往来する人々が「半生半死」となるという強烈な表現がある。また、別の地名起源説として、死者の棺を作るために山の木を伐り尽くしたという「木尽し」の話も記される。これらを実際の死亡率や大量死の記録とみなすことはできない。疫病や検疫の仕組みと結びつける説も、現段階では根拠が不足している。",
  }),
  makeClaim({
    id: "claim-chikushi-order-004",
    statement: "荒ぶる神の占いに筑紫君だけでなく肥君も関与している構図は、筑前筑後の境界秩序が複数地域勢力の協同関与のもとに形成された伝承構造を示す。",
    placeName: "筑紫神社",
    objectEntityName: "境界問題における複数地域勢力（筑紫・肥）の協同関与",
    historicalLabel: "古代（古墳〜奈良時代）",
    quote: "祭祀を担う甕依姫は筑紫君の祖とされる一方、占いには肥君も関与している。伝承の構造上、筑紫君だけの物語ではなく、複数の地域勢力が関わる境界の問題として描かれている。伝承上は、筑前・筑後の境界に関わる問題に、筑紫君と肥君の双方が関与したという構図になっている。",
  }),
  makeClaim({
    id: "claim-chikushi-iwai-001",
    statement: "磐井の乱（527〜528年）は単なる地方豪族の反乱ではなく、北部九州地域首長が保持していた政治・軍事・対外交流上の自立性とヤマト王権の支配拡大との衝突であった。",
    placeName: "筑紫神社",
    objectEntityName: "北部九州首長の自立的政治・軍事・外交権と王権拡大の衝突",
    historicalLabel: "古墳時代後期（527〜528年）",
    quote: "磐井の乱は、527〜528年頃に起きたとされる、筑紫君磐井とヤマト王権の軍事的衝突である。これは単なる地方豪族の反乱というだけでなく、北部九州の有力者が持っていた政治・軍事・対外交流上の自立性と、ヤマト王権による支配拡大との関係を考えるうえで重要な出来事である。",
  }),
  makeClaim({
    id: "claim-chikushi-iwai-002",
    statement: "磐井敗北後に子の葛子が糟屋屯倉を献上した伝承が示すように、筑紫君勢力は乱後も完全滅亡せず、一部基盤を保持しながら新体制へ組み込まれていった。",
    placeName: "筑紫神社",
    objectEntityName: "糟屋屯倉献上と新支配体制への包摂・勢力存続",
    historicalLabel: "古墳時代後期（6世紀）",
    quote: "磐井の敗北後、息子の葛子が糟屋屯倉を献上したという伝承もある。地域の政治勢力が完全に消滅したというより、敗北後に一部が新しい支配体制へ組み込まれた可能性も考えられる。",
  }),
  makeClaim({
    id: "claim-chikushi-iwai-003",
    statement: "風土記逸文の筑紫君・甕依姫を磐井本人や直系祖先と即断する証拠はなく、筑紫神社を磐井直接の本拠地や氏神と断定することは史料上慎重であるべきである。",
    placeName: "筑紫神社",
    objectEntityName: "磐井の氏神・本拠地との短絡的一体化の否定",
    historicalLabel: "古代〜現代（学術史料批判）",
    quote: "筑紫神社の逸文に登場する筑紫君が磐井本人を指すわけではない。甕依姫と磐井の直接の系譜関係も確認できない。筑紫神社を磐井の本拠地や直接の氏神と断定することはできない。",
  }),
  makeClaim({
    id: "claim-chikushi-iwai-004",
    statement: "中央史書（記紀）が磐井を反乱者として描くのに対し、風土記逸文には地域神を祭り秩序を整えた筑紫君の姿が残り、筑紫神社は磐井の時代を生み出したより古い地域秩序の手がかりである。",
    placeName: "筑紫神社",
    objectEntityName: "磐井の時代を支えた古い北部九州地域秩序の手がかり",
    historicalLabel: "古代（古墳〜奈良時代）",
    quote: "ヤマト王権側の記録では、磐井は討伐された反乱者として描かれる。一方、筑紫神社の伝承には、筑紫君が土地の神を祭り、地域の秩序に関与したという別の姿が残っている。筑紫神社は「磐井ゆかりの神社」と決めつけるよりも、磐井の時代を理解するための、より古い地域秩序の手がかりとして位置づけるのが適切である。",
  }),
  makeClaim({
    id: "claim-chikushi-iwai-005",
    statement: "『筑後国風土記』逸文の原型成立時期や中世筑紫氏との連続性は未確定であり、現在の神社由緒や後世の整理を古代祭祀の原形にそのまま投影してはならない。",
    placeName: "筑紫神社",
    objectEntityName: "風土記逸文の編纂時期と後世由緒の慎重な分離",
    historicalLabel: "古代〜中世〜現代",
    quote: "『筑後国風土記』は現存せず、逸文として後世の文献に引用されて伝わる。逸文の内容は、8世紀の風土記編纂時点で記録された伝承であり、伝承の原型がいつ成立したかは確定できない。中世の筑紫氏と古代の筑紫君との連続性も確定していない。神社の祭神や由緒が後世に整理・変更された可能性も考慮し、古代の祭祀を現在の形からそのまま復元しない。",
  }),
];

// 3. Connections (ADR-0025)
const connections = [
  {
    id: "conn-shikanoshima-kinin-shikaumi",
    title: "志賀島・古代博多湾口対外交流と海神祭祀",
    eyebrow: "博多湾口・海人外交",
    summary: "1784年に金印が発見された金印公園と、阿曇氏総本宮の志賀海神社を結び、博多湾口における古代奴国の対外交流と海人族の海上交通祭祀の連動を捉える。",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    spotIds: ["spot-kin-in-park", "spot-shikaumi-jinja"],
    concepts: ["奴国外交", "綿津見祭祀", "安曇氏", "博多湾交通"],
    eras: [
      {
        id: "era-ancient-yayoi-kofun",
        label: "古代（弥生・古墳・奈良）",
        range: "1世紀〜8世紀",
        mapLabel: "古代博多湾口",
        mapLayer: "maritime",
        spotIds: ["spot-kin-in-park", "spot-shikaumi-jinja"],
        claimIds: [
          "claim-shika-kin-001",
          "claim-shika-kin-002",
          "claim-shika-umi-001",
          "claim-shika-umi-002",
          "claim-shika-umi-003",
        ],
      },
    ],
    facets: [
      { id: "route", label: "古代海上航路・対外交流", weight: 5 },
      { id: "mythology", label: "綿津見三神・海人族祭祀", weight: 4 },
    ],
    claimIds: [
      "claim-shika-kin-001",
      "claim-shika-kin-002",
      "claim-shika-umi-001",
      "claim-shika-umi-002",
      "claim-shika-umi-003",
    ],
  },
  {
    id: "conn-shikanoshima-moko-defense",
    title: "志賀島・中世蒙古襲来と元軍戦死者供養の重層性",
    eyebrow: "中世博多湾防衛",
    summary: "元寇（文永・弘安の役）の激戦地である志賀島において、敵側死者を供養する蒙古塚（首切塚）と、島内の戦勝祈願伝承（火焔塚）が併存する多角的な戦争記憶。",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    spotIds: ["spot-moko-zuka", "spot-shikaumi-jinja"],
    concepts: ["蒙古襲来", "元軍供養", "勝立寺飛地", "多角的記憶"],
    eras: [
      {
        id: "era-medieval-kamakura",
        label: "中世〜近代（鎌倉・昭和）",
        range: "1274年〜1938年",
        mapLabel: "元寇戦跡・供養塔",
        mapLayer: "domain",
        spotIds: ["spot-moko-zuka", "spot-shikaumi-jinja"],
        claimIds: [
          "claim-shika-moko-001",
          "claim-shika-moko-002",
          "claim-shika-moko-003",
        ],
      },
    ],
    facets: [
      { id: "route", label: "博多湾中世防衛網", weight: 4 },
      { id: "people", label: "元寇戦跡と敵味方供養", weight: 4 },
    ],
    claimIds: [
      "claim-shika-moko-001",
      "claim-shika-moko-002",
      "claim-shika-moko-003",
    ],
  },
  {
    id: "conn-chikushi-order-boundary",
    title: "筑前筑後国境・筑紫神社の荒ぶる神祭祀と往来秩序",
    eyebrow: "国境祭祀と地域秩序",
    summary: "『筑後国風土記』逸文に記された荒ぶる神伝承を通じ、武力討伐ではなく筑紫君・肥君の協同卜占と甕依姫の祭祀によって境界交通秩序を成立させた古代北部九州の自立的基盤。",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    spotIds: [
      "spot-entity-20c6c6a47c1356d70583", // 筑紫神社
      "spot-shikaumi-jinja",              // 海人・博多湾岸拠点との対比
    ],
    concepts: ["荒ぶる神", "甕依姫", "筑紫君", "境界秩序"],
    eras: [
      {
        id: "era-ancient-fudoki",
        label: "古代（古墳〜奈良風土記）",
        range: "6世紀〜8世紀",
        mapLabel: "筑前筑後境界",
        mapLayer: "religious",
        spotIds: [
          "spot-entity-20c6c6a47c1356d70583",
          "spot-shikaumi-jinja",
        ],
        claimIds: [
          "claim-chikushi-order-001",
          "claim-chikushi-order-002",
          "claim-chikushi-order-003",
          "claim-chikushi-order-004",
          "claim-chikushi-iwai-001",
          "claim-chikushi-iwai-002",
          "claim-chikushi-iwai-003",
          "claim-chikushi-iwai-004",
          "claim-chikushi-iwai-005",
        ],
      },
    ],
    facets: [
      { id: "people", label: "筑紫君・肥君・甕依姫の地域秩序", weight: 5 },
      { id: "mythology", label: "荒ぶる神と境界祭祀", weight: 5 },
    ],
    claimIds: [
      "claim-chikushi-order-001",
      "claim-chikushi-order-002",
      "claim-chikushi-order-003",
      "claim-chikushi-order-004",
      "claim-chikushi-iwai-001",
      "claim-chikushi-iwai-002",
      "claim-chikushi-iwai-003",
      "claim-chikushi-iwai-004",
      "claim-chikushi-iwai-005",
    ],
  },
];

// 4. Journey
const newJourney = {
  id: "journey-shikanoshima-chikushi-2026-11-08",
  label: "志賀島探索と筑紫君・筑紫神社考察（海人祭祀・対外交流と古代地域秩序）",
  documentIds: [documentId],
  spotIds: [
    "spot-kin-in-park",
    "spot-shikaumi-jinja",
    "spot-moko-zuka",
    "spot-entity-20c6c6a47c1356d70583",
  ],
  connectionIds: connections.map((c) => c.id),
};

function upsertDataset(targetAtlas, targetDocs, targetClaims) {
  if (targetDocs) {
    const dIdx = targetDocs.findIndex((d) => d.id === newDocument.id);
    if (dIdx >= 0) {
      targetDocs[dIdx] = newDocument;
    } else {
      targetDocs.push(newDocument);
    }
  }

  if (targetClaims) {
    for (const c of claims) {
      const idx = targetClaims.findIndex((existing) => existing.id === c.id);
      if (idx >= 0) {
        targetClaims[idx] = c;
      } else {
        targetClaims.push(c);
      }
    }
  }

  if (targetAtlas) {
    if (!targetAtlas.journeys) {
      targetAtlas.journeys = [];
    }
    const jIdx = targetAtlas.journeys.findIndex((j) => j.id === newJourney.id);
    if (jIdx >= 0) {
      targetAtlas.journeys[jIdx] = newJourney;
    } else {
      targetAtlas.journeys.push(newJourney);
    }

    // Upsert new spots
    for (const s of newSpots) {
      const sIdx = targetAtlas.spots.findIndex((existing) => existing.id === s.id);
      if (sIdx >= 0) {
        targetAtlas.spots[sIdx] = s;
      } else {
        targetAtlas.spots.push(s);
      }
    }

    // Enrich existing spot-shikaumi-jinja
    const shikaumi = targetAtlas.spots.find((s) => s.id === "spot-shikaumi-jinja");
    if (shikaumi) {
      for (const cid of shikaumiNewClaimIds) {
        if (!shikaumi.claimIds.includes(cid)) {
          shikaumi.claimIds.push(cid);
        }
      }
    }

    // Enrich existing spot-entity-20c6c6a47c1356d70583 (筑紫神社)
    const chikushi = targetAtlas.spots.find((s) => s.id === "spot-entity-20c6c6a47c1356d70583");
    if (chikushi) {
      for (const cid of chikushiNewClaimIds) {
        if (!chikushi.claimIds.includes(cid)) {
          chikushi.claimIds.push(cid);
        }
      }
    }

    // Upsert connections
    for (const c of connections) {
      const cIdx = targetAtlas.connections.findIndex((existing) => existing.id === c.id);
      if (cIdx >= 0) {
        targetAtlas.connections[cIdx] = c;
      } else {
        targetAtlas.connections.push(c);
      }
    }
  }
}

// 1. tomono-review-draft.json
if (fs.existsSync(draftPath)) {
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  upsertDataset(null, draft.documents, draft.claims);
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");
  console.log("Updated tomono-review-draft.json successfully.");
}

// 2. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertDataset(atlas, null, null);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
  console.log("Updated travel-atlas.yamatai.json successfully.");
}

// 3. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertDataset(pub.atlas, pub.documents, pub.claims);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log(
    `Updated published-review-dataset.json successfully (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length})`,
  );
}

console.log("Import shikanoshima and chikushi journey completed successfully!");
