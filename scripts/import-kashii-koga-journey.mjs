import crypto from "crypto";
import fs from "fs";
import path from "path";

const rootDir = "B:/09_Technology/22_ResoWorld_bionic";
const traveloguePath = path.join(rootDir, "旅行記/香椎古賀探索.txt");
const draftPath = path.join(rootDir, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(rootDir, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(rootDir, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-kashii-koga";
const documentTitle = "福岡市東区〜古賀市 神社・祭祀景観探索記録（山の神・海の神・石の祭祀・地域の神社統合）";
const relativeTraveloguePath = "旅行記/香椎古賀探索.txt";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-10-24",
  documentedAt: "2026-10-24",
  dateStatus: "known",
};

// 12 Visited Spots from 福岡市東区〜古賀市 神社・祭祀景観探索記録
const spots = [
  {
    id: "spot-shita-hara-otoshigami",
    name: "下原大歳神社（大歳宮）",
    region: "福岡県 · 福岡市東区",
    kind: "神社・農耕石祠祭祀",
    latitude: 33.6708,
    longitude: 130.4567,
    claimIds: ["claim-kashii-koga-001"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-washio-daigongen",
    name: "鷲尾大権現",
    region: "福岡県 · 福岡市東区",
    kind: "神社・神仏習合・修験",
    latitude: 33.6779,
    longitude: 130.4608,
    claimIds: ["claim-kashii-koga-002"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-sarutahiko-koshinzuka-kashii",
    name: "下原猿田彦石塔・庚申塚",
    region: "福岡県 · 福岡市東区",
    kind: "石塔・街道境界祭祀",
    latitude: 33.674,
    longitude: 130.458,
    claimIds: ["claim-kashii-koga-003"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-oyamada-saigu",
    name: "小山田斎宮",
    region: "福岡県 · 古賀市",
    kind: "神社・斎宮伝承地",
    latitude: 33.7138,
    longitude: 130.5073,
    claimIds: ["claim-kashii-koga-004"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-aitaka-jinja",
    name: "愛鷹神社",
    region: "福岡県 · 古賀市",
    kind: "神社・海幸山幸・鮭信仰",
    latitude: 33.7076,
    longitude: 130.5052,
    claimIds: ["claim-kashii-koga-005", "claim-kashii-koga-006"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-oyamatsumi-jinja-taniyama",
    name: "大山祇神社（谷山山の神）",
    region: "福岡県 · 古賀市",
    kind: "神社・山の神祭祀",
    latitude: 33.7077,
    longitude: 130.5053,
    claimIds: ["claim-kashii-koga-007"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-taniyama-hachimangu",
    name: "谷山八幡宮",
    region: "福岡県 · 古賀市",
    kind: "神社・八幡宮・地域共存",
    latitude: 33.7128,
    longitude: 130.5022,
    claimIds: ["claim-kashii-koga-008"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-funabaru-kofun",
    name: "国史跡 船原古墳",
    region: "福岡県 · 古賀市",
    kind: "遺跡・国史跡・金銅製馬具",
    latitude: 33.7147,
    longitude: 130.5025,
    claimIds: ["claim-kashii-koga-009", "claim-kashii-koga-010"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-yakuoji-shirahige",
    name: "薬王寺白鬚神社",
    region: "福岡県 · 古賀市",
    kind: "神社・白鬚信仰・温泉奥",
    latitude: 33.7181,
    longitude: 130.5139,
    claimIds: ["claim-kashii-koga-011"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-koga-jinja",
    name: "古賀神社",
    region: "福岡県 · 古賀市",
    kind: "神社・村社合祀",
    latitude: 33.7299,
    longitude: 130.4688,
    claimIds: ["claim-kashii-koga-012"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-koseki-miya",
    name: "皇石宮・皇石神社",
    region: "福岡県 · 古賀市",
    kind: "神社・神功皇石・巨石磐座",
    latitude: 33.7241,
    longitude: 130.4656,
    claimIds: ["claim-kashii-koga-013", "claim-kashii-koga-014", "claim-kashii-koga-015"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-koseki-oki-no-ido",
    name: "皇石神社 沖の井戸（御供井）",
    region: "福岡県 · 古賀市",
    kind: "史跡・御饌水井戸・祭祀水利",
    latitude: 33.723,
    longitude: 130.4605,
    claimIds: ["claim-kashii-koga-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

// 16 Claims grounded with exact travelogue line citations
const claims = [
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-001",
    statement: "下原大歳神社（大歳宮）では本殿右奥の石祠開口部に自然石が祀られ供物が捧げられており、本殿と石祠を直ちに一体視せず農耕大歳神と在地石祭祀の複合層として観察される。",
    subject: { name: "下原大歳神社（大歳宮）", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "大歳神と奥の石祠自然石祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "broad-range" },
    places: [{ name: "下原大歳神社（大歳宮）", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 24,
        endLine: 40,
        quote: "本殿の右奥には別の石祠があり、開口部に自然石が置かれ、榊、杯、酒、花が供えられていた。本殿と石祠を、最初から一体の祭祀施設とみなさないことが重要である。石祠に自然石が納められている点は注目されるが、それだけで古代祭祀の遺構と断定することはできない。",
      },
    }],
    createdAt: "2026-10-24T09:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-002",
    statement: "立花山登山口の鷲尾大権現では、滝上の不動明王・千手観音・石鎚山札・山の神小祠・日の出龍神石塔が併存し、糟屋北部新四国八十八箇所の札所として水と山岳修行の神仏習合層を留めている。",
    subject: { name: "鷲尾大権現", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "滝・不動明王・石鎚山・山の神の神仏習合修行聖域", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜近代（新四国札所）", precision: "broad-range" },
    places: [{ name: "鷲尾大権現", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 44,
        endLine: 65,
        quote: "滝の上に不動明王像があり、山中には小さな社があった。鈴緒の木札には「石鎚山」と記されていた。下方には「山の神」とされる小祠があった。自然石や石塔に「南無妙法蓮華経」「日の出龍神」などの文字が刻まれていた。糟屋北部新四国八十八箇所の札所として紹介されている。",
      },
    }],
    createdAt: "2026-10-24T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-003",
    statement: "下原の街道沿いには「猿田彦大神」の刻字石塔（庚申塚）が単独で祀られ、村落境や道案内を司る民俗的境界祭祀の地点が独立して保持されている。",
    subject: { name: "下原猿田彦石塔・庚申塚", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "街道沿いの境界・道案内・庚申信仰石塔", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "江戸時代〜現代", precision: "period" },
    places: [{ name: "下原猿田彦石塔・庚申塚", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 68,
        endLine: 81,
        quote: "道沿いに小さな石塔があり、「猿田彦大神」と刻まれていた。大きな神社の境内というより、道端の信仰地点に見えた。猿田彦は、道案内や境界・道の神として理解されることが多い。",
      },
    }],
    createdAt: "2026-10-24T10:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-004",
    statement: "古賀市小山田の小山田斎宮は『日本書紀』神功皇后紀に登場する小山田邑斎宮の伝承地であり、大木が茂る山裾社叢に事代主・天照・住吉・神功皇后を祀り志賀神社・菅原神社を併置する。",
    subject: { name: "小山田斎宮", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "神功皇后小山田邑斎宮伝承地と古代社叢", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "qualified" },
    historicalTime: { kind: "named", label: "古代伝承（日本書紀）〜近世・近代", precision: "broad-range" },
    places: [{ name: "小山田斎宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 84,
        endLine: 112,
        quote: "大木が多く、背後に山が迫る印象的な場所だった。境内には志賀神社、菅原神社もあった。この場所は、仲哀天皇の死後に神功皇后が小山田邑に斎宮を設けたという伝承と結びついている。",
      },
    }],
    createdAt: "2026-10-24T11:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-005",
    statement: "古賀市谷山の愛鷹神社は山幸彦（彦火火出見尊）・豊玉姫尊・鵜草葺不合尊を祀り、天徳2年（958年）大目配山創建・延享3年（1746年）現在地移転の由緒と履物奉納習俗を伝える。",
    subject: { name: "愛鷹神社", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "海幸山幸神話神（山幸彦・豊玉姫）と鷹狩伝承", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "平安中期（958年伝承）〜延享3年（1746年移転）", precision: "broad-range" },
    places: [{ name: "愛鷹神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 115,
        endLine: 128,
        quote: "愛鷹神社は、山幸彦が鷹狩りを好んだことと社名を結びつけて説明している。もとは大目配山に鎮座し、天徳2年（958年）頃の創建と伝える。その後、延享3年（1746年）に現在地へ移ったと説明されている。山幸彦と豊玉姫、鵜草葺不合尊の神話が由緒に取り入れられている。",
      },
    }],
    createdAt: "2026-10-24T11:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-006",
    statement: "愛鷹神社では旧暦10月9日の祭礼期に鮭が川を遡上したという伝承が神威と結びついて語り継がれ、海・川・山と集落を結ぶ地域固有の生業・自然信仰が神話祭祀と重なっている。",
    subject: { name: "愛鷹神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "旧暦10月9日祭礼の鮭遡上伝承と神威認識", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "period" },
    places: [{ name: "愛鷹神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 129,
        endLine: 137,
        quote: "旧暦10月9日の祭礼に関連して、鮭が川を遡上したという伝承がある。近年の鮭の確認も、地元では神威と結びつけて語られている。特に、鮭の遡上を神の使いとみなす伝承は、海と川、山と集落をつなぐ地域の信仰を考えるうえで興味深い。",
      },
    }],
    createdAt: "2026-10-24T11:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-007",
    statement: "愛鷹神社隣の大山祇神社（大正12年移転）は、春に山から里へ下りて農耕を守り秋の収穫後に山へ帰る「山の神」信仰が、大山祇神という公的社名・神名へ整理された過程を示している。",
    subject: { name: "大山祇神社（谷山山の神）", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "春下り秋帰りの「山の神」と大山祇神合定", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "民俗慣習〜大正12年（1923年移転）", precision: "broad-range" },
    places: [{ name: "大山祇神社（谷山山の神）", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 140,
        endLine: 156,
        quote: "もともと地域では「山の神」として信仰されていたという。春に山の神が里へ下りて農耕・作物を守り、秋の収穫後に山へ帰るという信仰が説明されている。説明板は、この地域で祀る山の神を大山祇神と説明している。大正12年（1923年）に旧鎮座地から現在地へ移転したと記されている。",
      },
    }],
    createdAt: "2026-10-24T12:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-008",
    statement: "谷山八幡宮（祭神：神功皇后・応神天皇・玉依姫）は境内に公民館や遊具が併設され日常生活と共存しつつ、拝殿に西洋風人物画の額が奉納されるなど特異な奉納文化を残す。",
    subject: { name: "谷山八幡宮", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "八幡祭祀・西洋風奉納額と公民館併設の地域生活空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "broad-range" },
    places: [{ name: "谷山八幡宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 159,
        endLine: 183,
        quote: "境内の向かいに公民館があり、境内には滑り台などの遊具があった。拝殿・絵馬所付近に、西洋風の人物画を思わせる額が掲げられていた。境内に公民館や遊具があることは、神社が歴史遺産として保存されるだけの場所ではなく、地域の日常生活と共存していることを示している。",
      },
    }],
    createdAt: "2026-10-24T12:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-009",
    statement: "国史跡・船原古墳（古賀市谷山）は古墳時代後期〜終末期の円墳であり、遺構土坑から金銅製歩揺付辻金具・鈴付杏葉などの国内屈指の馬具・武器類が出土し、当時の有力首長と対外交流の物証を示す。",
    subject: { name: "国史跡 船原古墳", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "古墳時代後期〜終末期の国史跡と国内屈指の金銅製馬具出土", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古墳時代後期〜終末期（6世紀末〜7世紀初頭）", precision: "period" },
    places: [{ name: "国史跡 船原古墳", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Archaeology",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 186,
        endLine: 197,
        quote: "今回の探索範囲にある考古学的な地点。神社ではないため、祭神を割り当てない。船原古墳は、古墳時代後期から終末期にかけての地域社会を考えるうえで重要な遺跡である。馬具や武器などの出土品は、当時の有力者、技術、対外交流を考える手掛かりになる。",
      },
    }],
    createdAt: "2026-10-24T13:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-010",
    statement: "船原古墳の考古学的年代と近隣神社の社名・祭神・由緒年代は峻別すべきであり、地理的近接性のみで直接結びつけず、同じ地域に異なる時代の遺構が重なる土地の重層利用として捉える。",
    subject: { name: "国史跡 船原古墳", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "考古学的時間軸と神社由緒時間の方法論的峻別", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "歴史認識論", precision: "broad-range" },
    places: [{ name: "国史跡 船原古墳", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 193,
        endLine: 197,
        quote: "古墳と現在の神社を、地理的に近いという理由だけで直接結びつけることはできない。古墳の年代と、現在の神社の社名・祭神・由緒が成立した時期は別々に検討する必要がある。同じ地域に異なる時代の遺構が重なっていること自体は、土地の長期的な利用を考える重要な背景となる。",
      },
    }],
    createdAt: "2026-10-24T13:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-011",
    statement: "薬王寺白鬚神社（猿田彦命・大雀天皇、武内宿禰伝承）では境内に疫神社小祠を配し、山上愛宕神社（迦具土神）を望む位置関係にあり、温泉谷奥の守護・厄除け信仰の重層性を示す。",
    subject: { name: "薬王寺白鬚神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "温泉谷奥の白鬚祭祀・疫神小祠・愛宕神社の空間配置", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "qualified" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "broad-range" },
    places: [{ name: "薬王寺白鬚神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 201,
        endLine: 222,
        quote: "第三者の神社情報では、猿田彦命、大雀天皇（仁徳天皇）。古い記録には、武内宿禰も記載されている。境内付近に、疫神社と思われる小さな祭祀地点があった。山上には愛宕神社があると考えられる位置関係だった。",
      },
    }],
    createdAt: "2026-10-24T13:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-012",
    statement: "古賀神社は昭和27年（1952年）に旧古賀村の浦口神社・皇石神社・貴布祢神社・日若神社の4社が合祀されて成立し、複数の旧社祭神（大日霎・素戔鳴・埴安・高龗・闇龗・大山咋）と地域の記憶を統合した。",
    subject: { name: "古賀神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "昭和27年における旧古賀村4社合祀と地域祭祀再編", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "昭和27年（1952年）", precision: "period" },
    places: [{ name: "古賀神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 234,
        endLine: 245,
        quote: "旧古賀村には浦口神社、皇石神社、貴布祢神社、日若神社などがあり、昭和27年（1952年）2月17日に合祀され、古賀神社となった。合祀は、単に神社の数が減ったというだけでなく、地域の祭祀を一つの神社へ再編する過程として見ることができる。",
      },
    }],
    createdAt: "2026-10-24T14:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-013",
    statement: "皇石神社（鹿部山）の御神体は平たく巨大な立石「神功皇石」であり、神功皇后の新羅遠征誓約伝承を宿し、享禄3年（1530年）「大石大明神」棟札を経て文政3年（1820年）に「皇石」と改称された。",
    subject: { name: "皇石宮・皇石神社", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "巨大立石「神功皇石」と大石大明神から皇石への社名変遷", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "享禄3年（1530年）〜文政3年（1820年）", precision: "broad-range" },
    places: [{ name: "皇石宮・皇石神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 255,
        endLine: 283,
        quote: "享禄3年（1530年）の社殿再建に関する棟札には、「大石大明神」という名称が記されていたとする資料がある。御神体は平たく巨大な立石とされ、「神功皇石」と呼ばれている。神功皇后が新羅征討に関する誓いを立て、巨石を立てたという伝承が伝えられている。文政3年（1820年）に「皇石」という社名になった。",
      },
    }],
    createdAt: "2026-10-24T14:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-014",
    statement: "皇石神社社殿後方からは1898年に甕棺から銅戈が出土し、1972年には社地北西部から祭祀用土器が見つかっており、巨石の周りに弥生〜古代の物証が存在するが神社祭祀との直接連続性は峻別される。",
    subject: { name: "皇石宮・皇石神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "社殿後方からの甕棺・銅戈出土と祭祀用土器の考古学的重層", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "弥生時代〜古代出土遺構", precision: "period" },
    places: [{ name: "皇石宮・皇石神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Archaeology",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 260,
        endLine: 282,
        quote: "1898年には、社殿後方の甕棺から銅戈が出土したとする資料がある。1972年には、社地北西部から祭祀用土器が見つかったとする説明がある。考古資料が出土したことは、この場所や周辺で過去に人々が活動していたことを示す。しかし、それだけで約2000年間にわたる祭祀の途切れない連続性が証明されるわけではない。",
      },
    }],
    createdAt: "2026-10-24T15:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-015",
    statement: "皇石神社境内には鏡を祀る荒波神社が併設されており、玄界灘沿岸の鹿部山における海神・波除けの海洋祭祀が巨石信仰と並び立っている。",
    subject: { name: "皇石宮・皇石神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "鏡を祀る境内荒波神社と海洋祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "period" },
    places: [{ name: "皇石宮・皇石神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 265,
        endLine: 269,
        quote: "背後に山があり、社殿・建物は比較的新しく見えた。境内には荒波神社が併設されていた。荒波神社には鏡が祀られていた。",
      },
    }],
    createdAt: "2026-10-24T15:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-koga-016",
    statement: "皇石神社の沖の井戸は『福岡県神社誌』に「御供井」と記され、9月1日に浚渫して新嘗祭の御饌水に用い、神功皇后の飲水伝承を伴うなど、祭祀を日常的に支える水利管理の空間を実証している。",
    subject: { name: "皇石神社 沖の井戸（御供井）", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "新嘗祭御饌水のための御供井浚渫と祭祀水利管理", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世（神社誌記録）〜現代", precision: "broad-range" },
    places: [{ name: "皇石神社 沖の井戸（御供井）", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 290,
        endLine: 301,
        quote: "『福岡県神社誌』の記述を紹介する資料では、この井戸は「御供井」とされ、かつて9月1日に浚渫し、新嘗祭の御饌水に用いたと伝えられている。沖の井戸は、皇石神社の巨石や由緒とは別に、祭祀を実際に支える水の確保・管理という側面を示す。",
      },
    }],
    createdAt: "2026-10-24T15:30:00Z",
  },
];

// 4 Thematic & Spatial Connections
const connections = [
  {
    id: "connection-kashii-koga-saigu-koseki",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "SAIGU / SACRED ROCK / RITUAL WELL",
    title: "神功皇后小山田斎宮と皇石巨石・沖の井戸の祭祀回廊",
    summary: "『日本書紀』神功皇后紀の小山田邑斎宮伝承が残る小山田斎宮から、新羅遠征の誓約立石「神功皇石」を祀る鹿部山皇石神社、新嘗祭の御饌水を汲む沖の井戸（御供井）、八幡祭祀の谷山八幡宮へと連なる神功皇后伝承と巨石・水利の聖域回廊。",
    spotIds: [
      "spot-oyamada-saigu",
      "spot-taniyama-hachimangu",
      "spot-koseki-miya",
      "spot-koseki-oki-no-ido",
    ],
    claimIds: [
      "claim-kashii-koga-004",
      "claim-kashii-koga-008",
      "claim-kashii-koga-013",
      "claim-kashii-koga-015",
      "claim-kashii-koga-016",
    ],
    concepts: ["小山田邑斎宮", "神功皇石", "誓約立石", "御供井", "沖の井戸", "新嘗祭御饌水"],
    facets: [
      { id: "myth", label: "神話・斎宮", weight: 5 },
      { id: "ritual", label: "立石・水利祭祀", weight: 5 },
      { id: "exchange", label: "海浜回廊", weight: 4 },
    ],
    lensId: "mythology",
    topicId: "jingu-kogo-legend-preset",
    eras: [
      {
        id: "era-kashii-koga-saigu-myth",
        label: "小山田邑斎宮と神功皇石の誓約伝承",
        range: "古代伝承（日本書紀）",
        mapLabel: "小山田斎宮と鹿部山・神功皇石の誓約立石",
        mapLayer: "mythic",
        spotIds: ["spot-oyamada-saigu", "spot-koseki-miya", "spot-taniyama-hachimangu"],
        claimIds: ["claim-kashii-koga-004", "claim-kashii-koga-008", "claim-kashii-koga-013"],
      },
      {
        id: "era-kashii-koga-well-ritual",
        label: "御供井（沖の井戸）浚渫と社殿祭祀の維持",
        range: "近世（享禄・文政）〜現代",
        mapLabel: "沖の井戸御供水と荒波神社・皇石宮祭祀",
        mapLayer: "religious",
        spotIds: ["spot-koseki-miya", "spot-koseki-oki-no-ido", "spot-oyamada-saigu"],
        claimIds: ["claim-kashii-koga-013", "claim-kashii-koga-015", "claim-kashii-koga-016"],
      },
    ],
  },
  {
    id: "connection-kashii-koga-funabaru-archaeology",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "KOFUN / GILDED BRONZE / URN SPEAR",
    title: "国史跡船原古墳（金銅製馬具・武具）と鹿部山甕棺銅戈の古代首長・祭祀層",
    summary: "国史跡・船原古墳の国内最高峰金銅製馬具（歩揺付辻金具・鈴付杏葉）と、皇石神社社殿後方から出土した甕棺・銅戈、祭祀用土器を対比。神社由緒の神話時間と考古学的遺構の実年代を峻別しつつ、古賀地域の首長層・対外交流の物的基底を検証する。",
    spotIds: [
      "spot-funabaru-kofun",
      "spot-koseki-miya",
      "spot-koga-jinja",
    ],
    claimIds: [
      "claim-kashii-koga-009",
      "claim-kashii-koga-010",
      "claim-kashii-koga-012",
      "claim-kashii-koga-014",
    ],
    concepts: ["船原古墳（国史跡）", "金銅製歩揺付辻金具", "鹿部山甕棺銅戈", "祭祀用土器", "考古学年代の峻別"],
    facets: [
      { id: "politics", label: "古代首長・馬具", weight: 5 },
      { id: "ritual", label: "甕棺・祭祀土器", weight: 4 },
    ],
    lensId: "route",
    topicId: "yayoi-archaeology-network",
    eras: [
      {
        id: "era-kashii-koga-archaeological-bedrock",
        label: "弥生甕棺銅戈から6〜7世紀金銅製馬具の首長層",
        range: "弥生時代中期〜古墳終末期（6世紀末〜7世紀初頭）",
        mapLabel: "船原古墳金銅馬具と鹿部山甕棺銅戈出土層",
        mapLayer: "domain",
        spotIds: ["spot-funabaru-kofun", "spot-koseki-miya"],
        claimIds: ["claim-kashii-koga-009", "claim-kashii-koga-010", "claim-kashii-koga-014"],
      },
    ],
  },
  {
    id: "connection-kashii-koga-water-mountain-kami",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "YAMASACHI / SALMON / MOUNTAIN KAMI",
    title: "山幸彦・豊玉姫と鮭遡上・里下り「山の神」の生業水系ネットワーク",
    summary: "愛鷹神社に伝わる山幸彦・豊玉姫祭祀と旧暦10月9日の鮭遡上神威伝承から、隣接する大山祇神社が示す「春に里へ下り秋に山へ帰る山の神」の農耕信仰、下原大歳神社奥石祠の自然石祀りまで、海・川・山を結ぶ生業祭祀の広がりを辿る。",
    spotIds: [
      "spot-aitaka-jinja",
      "spot-oyamatsumi-jinja-taniyama",
      "spot-shita-hara-otoshigami",
    ],
    claimIds: [
      "claim-kashii-koga-001",
      "claim-kashii-koga-005",
      "claim-kashii-koga-006",
      "claim-kashii-koga-007",
    ],
    concepts: ["山幸彦（彦火火出見尊）", "豊玉姫尊", "鮭遡上信仰", "春下り秋帰りの山の神", "大歳神社奥石祠"],
    facets: [
      { id: "ritual", label: "山の神・鮭神威", weight: 5 },
      { id: "exchange", label: "海川山水系", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-concepts",
    eras: [
      {
        id: "era-kashii-koga-salmon-mountain-folklife",
        label: "大目配山創建伝承と里下り山の神・鮭遡上祭祀",
        range: "平安（958年伝承）〜近世移転・民俗祭祀",
        mapLabel: "愛鷹神社鮭遡上と大山祇・下原大歳水系",
        mapLayer: "religious",
        spotIds: ["spot-aitaka-jinja", "spot-oyamatsumi-jinja-taniyama", "spot-shita-hara-otoshigami"],
        claimIds: ["claim-kashii-koga-001", "claim-kashii-koga-005", "claim-kashii-koga-006", "claim-kashii-koga-007"],
      },
    ],
  },
  {
    id: "connection-kashii-koga-syncretism-reorganization",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "SHUGENDO / SYNCRETISM / MODERN MERGER",
    title: "立花山麓修験・神仏習合と近世・近代の神社合祀・社名再編",
    summary: "滝・不動明王・石鎚山札・日の出龍神を併置する立花山登山口の鷲尾大権現から、温泉谷奥の薬王寺白鬚神社・山上愛宕社、街道の猿田彦石塔、昭和27年に旧古賀村4社を統合した古賀神社まで、神仏習合修験と近世・近代の祭祀再編を追う。",
    spotIds: [
      "spot-washio-daigongen",
      "spot-yakuoji-shirahige",
      "spot-koga-jinja",
      "spot-sarutahiko-koshinzuka-kashii",
    ],
    claimIds: [
      "claim-kashii-koga-002",
      "claim-kashii-koga-003",
      "claim-kashii-koga-011",
      "claim-kashii-koga-012",
    ],
    concepts: ["鷲尾大権現", "石鎚山札", "日の出龍神", "新四国霊場", "薬王寺白鬚神社", "昭和27年古賀神社合祀"],
    facets: [
      { id: "ritual", label: "滝・不動明王修験", weight: 5 },
      { id: "politics", label: "近代村社合祀", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-kashii-koga-syncretism-modern-merger",
        label: "立花山麓の行場修験から近代神社合祀への変遷",
        range: "江戸時代〜昭和27年（1952年）",
        mapLabel: "鷲尾大権現・薬王寺白鬚と古賀神社昭和合祀",
        mapLayer: "religious",
        spotIds: ["spot-washio-daigongen", "spot-yakuoji-shirahige", "spot-koga-jinja", "spot-sarutahiko-koshinzuka-kashii"],
        claimIds: ["claim-kashii-koga-002", "claim-kashii-koga-003", "claim-kashii-koga-011", "claim-kashii-koga-012"],
      },
    ],
  },
];

const newJourney = {
  id: "journey-kashii-koga",
  label: "香椎・古賀・立花山麓",
  documentIds: [documentId],
  spotIds: spots.map((s) => s.id),
  connectionIds: connections.map((c) => c.id),
};

function upsertDataset(targetAtlas, targetDocs, targetClaims) {
  if (targetDocs) {
    const dIdx = targetDocs.findIndex((d) => d.id === documentId);
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
    const jIdx = targetAtlas.journeys.findIndex((j) => j.id === newJourney.id);
    if (jIdx >= 0) {
      targetAtlas.journeys[jIdx] = newJourney;
    } else {
      targetAtlas.journeys.push(newJourney);
    }
    for (const s of spots) {
      const sIdx = targetAtlas.spots.findIndex((existing) => existing.id === s.id);
      if (sIdx >= 0) {
        targetAtlas.spots[sIdx] = s;
      } else {
        targetAtlas.spots.push(s);
      }
    }
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

// 1. Update tomono-review-draft.json
const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
upsertDataset(null, draft.documents, draft.claims);
fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");
console.log("Updated tomono-review-draft.json");

// 2. Update travel-atlas.yamatai.json
const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
upsertDataset(atlas, null, null);
fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
console.log("Updated travel-atlas.yamatai.json");

// 3. Update published-review-dataset.json
const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
upsertDataset(pub.atlas, pub.documents, pub.claims);
fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
console.log(
  `Updated published-review-dataset.json (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length})`,
);
