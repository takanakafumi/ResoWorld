import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const traveloguePath = path.join(root, "旅行記", "2026-11-03_北部九州の歴史探索記.md");
const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf-8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-fukuoka-2026-11-03";
const documentTitle =
  "2026年11月3日 北部九州の歴史探索記（弥生の集落から古代官道・防衛施設、地域祭祀まで）";
const relativeTraveloguePath = "旅行記/2026-11-03_北部九州の歴史探索記.md";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-11-03",
  documentedAt: "2026-11-03",
  dateStatus: "known",
};

const spots = [
  {
    id: "spot-itatuke-ruins",
    name: "板付遺跡弥生館",
    region: "福岡県 · 福岡市博多区",
    kind: "弥生集落遺跡",
    latitude: 33.5638,
    longitude: 130.4578,
    claimIds: [
      "claim-fukuoka-001",
      "claim-fukuoka-002",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-onojo-history-museum",
    name: "大野城市歴史資料展示室",
    region: "福岡県 · 大野城市",
    kind: "歴史資料館",
    latitude: 33.5358,
    longitude: 130.4815,
    claimIds: [
      "claim-fukuoka-003",
      "claim-fukuoka-004",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-zenichida-kofun-cluster",
    name: "善一田古墳群",
    region: "福岡県 · 大野城市",
    kind: "古墳群",
    latitude: 33.5135,
    longitude: 130.4832,
    claimIds: [
      "claim-fukuoka-005",
      "claim-fukuoka-006",
      "claim-fukuoka-007",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-mizuki-fortification",
    name: "水城（水城跡・東門官道・水城館）",
    region: "福岡県 · 太宰府市・大野城市",
    kind: "古代防衛施設・関門・古代官道",
    latitude: 33.5186,
    longitude: 130.5056,
    claimIds: [
      "claim-fukuoka-008",
      "claim-fukuoka-009",
      "claim-fukuoka-010",
      "claim-fukuoka-011",
      "claim-fukuoka-012",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-sugatamii-kinukake-tenmangu",
    name: "姿見井・衣掛天満宮",
    region: "福岡県 · 太宰府市",
    kind: "神社・伝承井戸",
    latitude: 33.5198,
    longitude: 130.5095,
    claimIds: [
      "claim-fukuoka-013",
      "claim-fukuoka-014",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-goryo-homan-jinja",
    name: "御陵寶満神社",
    region: "福岡県 · 大野城市",
    kind: "神社",
    latitude: 33.5292,
    longitude: 130.4891,
    claimIds: [
      "claim-fukuoka-015",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-umi-hachimangu",
    name: "宇美八幡宮",
    region: "福岡県 · 糟屋郡宇美町",
    kind: "神社",
    latitude: 33.5678,
    longitude: 130.5123,
    claimIds: [
      "claim-fukuoka-016",
      "claim-fukuoka-017",
      "claim-fukuoka-018",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-umi-obiegaura-okumiya",
    name: "宇美八幡宮 奥宮（御胞衣ヶ浦）",
    region: "福岡県 · 糟屋郡宇美町",
    kind: "奥宮・古代産育祭祀地",
    latitude: 33.5652,
    longitude: 130.5158,
    claimIds: [
      "claim-fukuoka-017",
      "claim-fukuoka-019",
      "claim-fukuoka-020",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const claims = [
  // 1. 板付遺跡弥生館 (2件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-001",
    statement:
      "板付遺跡では突帯文土器とともに東北系とされる亀ヶ岡系土器が出土し、弥生時代の北部九州が閉鎖的な文化圏ではなく列島規模の移動・交易・技術伝播ネットワークに接続していたことを示す。",
    subject: { name: "板付遺跡弥生館", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "突帯文土器・亀ヶ岡系土器共存に見る列島規模の弥生文化間交流",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "弥生時代早期〜前期",
      precision: "broad-range",
    },
    places: [{ name: "板付遺跡弥生館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 23,
          endLine: 28,
          quote:
            "異なる地域に由来する土器が存在することから、弥生時代の北部九州が単一の文化圏で閉じていたわけではないことが分かる。ただし、土器の分布をそのまま民族や人間集団の境界とみなすことはできない。人の移動、交易、技術の伝播、模倣など、複数の要因が考えられる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-002",
    statement:
      "板付遺跡出土の投弾（狩猟・防衛）、土笛（音響・合図・祭祀）、木製琴（弦楽器）は、弥生社会において稲作農耕のみならず音・道具・儀礼を含む豊かな生活文化が形成されていたことを裏付ける。",
    subject: { name: "板付遺跡弥生館", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "弥生時代の音・道具・儀礼文化（投弾・土笛・木製琴）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "弥生時代",
      precision: "broad-range",
    },
    places: [{ name: "板付遺跡弥生館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 29,
          endLine: 36,
          quote:
            "投弾・土笛・琴。投弾：狩猟や対人行為などへの利用が考えられるが、用途は断定できない。土笛：音を出す道具として、祭祀や合図など複数の可能性がある。琴：弥生時代にも木製の弦楽器が存在したことを示す。稲作だけでなく、道具・音・儀礼を含む生活文化が形成されていたことを確認できた。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 2. 大野城市歴史資料展示室 (2件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-003",
    statement:
      "北部九州の広型銅矛・銅戈、近畿・東海の銅鐸、吉備の特殊器台、山陰の四隅突出型墳丘墓に見られるように、弥生時代後期には地域ごとの独自な祭祀文化・社会圏のまとまりが存在した。",
    subject: { name: "大野城市歴史資料展示室", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "列島青銅器・祭祀遺物の地域分化（北部九州武器形青銅器 vs 近畿銅鐸）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "弥生時代中期〜後期",
      precision: "broad-range",
    },
    places: [{ name: "大野城市歴史資料展示室", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 45,
          endLine: 59,
          quote:
            "展示されていた広型銅矛から、北部九州の青銅器文化を改めて確認した。地域ごとに特徴的な青銅器や祭祀関連遺物が分布している。北部九州：銅矛・銅戈などの武器形青銅器、近畿：近畿式銅鐸、東海：三遠式銅鐸、吉備：特殊器台・特殊壺、山陰：四隅突出型墳丘墓。これらは単純な政治的境界ではないが、地域ごとに異なる祭祀・社会のまとまりが存在したことを考える手掛かりになる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-004",
    statement:
      "牛頸須恵器窯跡群は6世紀中頃から9世紀中頃にかけて約4km×4.8kmの広範囲に展開し、推定500基以上（調査300基以上）の窯で須恵器・瓦・陶棺を生産した古代北部九州屈指の大規模生産拠点である。",
    subject: { name: "大野城市歴史資料展示室", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "牛頸須恵器窯跡群の一大窯業生産基盤（瓦・陶棺・須恵器）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期〜平安時代（6世紀中頃〜9世紀中頃）",
      precision: "broad-range",
    },
    places: [{ name: "大野城市歴史資料展示室", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 60,
          endLine: 71,
          quote:
            "牛頸では、6世紀中頃から9世紀中頃にかけて、大規模な須恵器生産が行われた。推定窯数500基以上、調査された窯跡300基以上、分布範囲は約4km×4.8km、須恵器のほか瓦や陶棺なども生産。この地域が単なる集落ではなく、大規模な生産拠点だったことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 3. 善一田古墳群 (3件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-005",
    statement:
      "善一田古墳群18号墳（6世紀後半、東西26m円墳）から出土した鉄鋏（かなはし）や武器・馬具は、埋葬された地域首長が鉄器生産や鍛冶職人集団の統括・指導に関わっていた可能性を示す。",
    subject: { name: "善一田古墳群", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "善一田18号墳の鉄鋏出土と鉄生産職人集団統括首長",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期（6世紀後半）",
      precision: "broad-range",
    },
    places: [{ name: "善一田古墳群", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 83,
          endLine: 97,
          quote:
            "最も古く、大型の18号墳は、東西約26m、南北約22mの円墳。石室の規模や副葬品から、地域の有力者の墓と考えられている。出土品には武器・弓矢、馬具、装身具、鉄鋏（かなはし）があった。特に鉄鋏は、鉄器生産との関係を考える手掛かりになる。案内板では、鉄生産に関わる職人集団の指導者という可能性も示されていた。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-006",
    statement:
      "善一田古墳群から朝鮮半島新羅系土器や西アジア由来とされるガラス玉が出土し、20号墳から三葉環頭大刀が出土していることは、北部九州の内陸首長層が東アジアおよびシルクロードの広域交流網に連なっていたことを示す。",
    subject: { name: "善一田古墳群", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "善一田古墳群の新羅系土器・西アジアガラス玉・三葉環頭大刀に見る対外交流",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期〜終末期（6世紀後半〜7世紀後半）",
      precision: "broad-range",
    },
    places: [{ name: "善一田古墳群", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 98,
          endLine: 107,
          quote:
            "展示で印象的だったのは、朝鮮半島の新羅系土器や、西アジア由来とされるガラス玉である。また、20号墳からは三葉環頭大刀が出土している。こうした遺物は、北部九州が東アジアの交流ネットワークに接続していたことを示す。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-007",
    statement:
      "善一田古墳群は丘陵上から福岡平野と脊振山地を一望できる位置にあり、地形的条件とともに遠方からの視認性（地域のランドマーク性）を兼ね備えた首長墓空間として築造された。",
    subject: { name: "善一田古墳群", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "福岡平野・脊振山地を望む善一田古墳群の立地景観とランドマーク性",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期（6〜7世紀）",
      precision: "broad-range",
    },
    places: [{ name: "善一田古墳群", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 108,
          endLine: 115,
          quote:
            "丘陵上からは福岡平野と脊振山地を望むことができた。古墳の立地には、地形的な条件だけでなく、周囲から見えること、地域のランドマークとなることも関係していた可能性がある。善一田古墳群は、地域の有力者・鉄生産・対外交流が結びついた場所として理解できる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 4. 水城と古代官道 (5件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-008",
    statement:
      "水城は白村江の戦い（663年）翌年の664年に築造され、長さ約1.2km・高さ約10mの土塁に版築工法と敷粗朶（地盤補強）が用いられており、百済の扶余羅城と共通する大陸土木技術が確認できる。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天智3年（664年）水城築造と版築・敷粗朶（百済扶余羅城土木技術）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "飛鳥時代（664年天智3年築造）",
      precision: "broad-range",
    },
    places: [{ name: "水城（水城跡・東門官道・水城館）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 126,
          endLine: 139,
          quote:
            "水城は、白村江の戦い（663年）の翌年、664年に築造されたとされる。大陸・朝鮮半島からの侵攻に備え、博多湾から福岡平野を通って大宰府方面へ進む経路を遮断するための施設である。土塁の長さ：約1.2km、土塁の高さ：約10m、外濠・内濠を備える、土塁は版築工法で構築、敷粗朶を用いて地盤を補強。百済の扶余羅城と共通する築造技術が見られることも、当時の技術交流を考えるうえで興味深い。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-009",
    statement:
      "博多湾（海上玄関口）、水城（平野部交通制御・遮断）、大野城・基肄城（山岳防衛拠点）、大宰府（行政・外交・軍事中枢）はそれぞれ独立した施設ではなく、一体的な防衛・行政システムを構成していた。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "博多湾・水城・大野城・基肄城・大宰府の一体的防衛行政システム",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "7世紀後半〜8世紀（白村江後防衛網）",
      precision: "broad-range",
    },
    places: [{ name: "水城（水城跡・東門官道・水城館）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 140,
          endLine: 150,
          quote:
            "各施設が独立して存在していたのではなく、一体的な防衛・行政システムを構成していたこと。博多湾：大陸・朝鮮半島との海上交通の玄関口、水城：福岡平野から大宰府へ向かう経路を制御、大野城・基肄城：山地に配置された防衛拠点、大宰府：行政・外交・軍事の中心。水城は単なる長い土塁ではなく、平野部の交通を制御する施設でもあった。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-010",
    statement:
      "水城東門を通る古代官道は推定道路幅約10m（側溝付き）の直線道路として敷設され、北西約10km先の博多遺跡群と南東約1.2km先の大宰府条坊・政庁を直結し、都と大宰府を結ぶ主要幹線として機能した。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "水城東門を貫通する幅10m古代官道（博多遺跡群〜大宰府条坊・政庁直結）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "奈良時代〜平安時代",
      precision: "broad-range",
    },
    places: [{ name: "水城（水城跡・東門官道・水城館）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 151,
          endLine: 166,
          quote:
            "東門側の官道は、ほぼ直線的に延びていた。北西：約10km先に博多遺跡群、南東：約1.2km先に大宰府条坊・大宰府政庁、途中から筑前国分寺へ向かう支線も存在。推定道路幅は約10m。発掘では側溝も確認されている。この道路は、奈良・平安時代に都と大宰府を結ぶ主要経路として機能した。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-011",
    statement:
      "水城は単に敵の侵入を遮断する壁ではなく、土塁内に門を設けて博多港と大宰府を結ぶ交通を維持し、外国使節・役人・物資・情報を点検・統御するための「交通上の関門」であった。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "交通管理関門としての水城（人・物・情報の流れを統御・維持する国家機構）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "7〜9世紀（古代国家律令期）",
      precision: "broad-range",
    },
    places: [{ name: "水城（水城跡・東門官道・水城館）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 167,
          endLine: 174,
          quote:
            "ここで重要なのは、官道が水城の防衛施設を避けていなかったこと。防衛施設の中に門を設け、そこを通過する交通を管理する構造だった。敵の侵入を防ぐだけなら道路を塞げばよい。しかし、実際には博多の港と大宰府を結ぶ交通を維持する必要があった。外国使節、役人、物資、情報などが通過する経路でもあったのである。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-012",
    statement:
      "水城西門付近の官道側溝からクルミやヤマモモの花粉が確認され、天平宝字3年（759年）の詔で提案された「官道沿いへの果樹植栽（日陰の提供と非常時食料確保）」という古代道路管理の実態を裏付ける。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "759年詔に基づく官道沿い果樹植栽（クルミ・ヤマモモ花粉分析物証）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "奈良時代（759年天平宝字3年詔）",
      precision: "broad-range",
    },
    places: [{ name: "水城（水城跡・東門官道・水城館）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 175,
          endLine: 184,
          quote:
            "案内板には、759年の詔で官道沿いに木を植えることが提案された話もあった。日陰を作るだけでなく、非常時の食料にもなる果実を得るという考え方である。水城西門付近の官道側溝からは、クルミやヤマモモの花粉も確認されている。軍事施設の話から、道路の維持管理や植栽、移動する人々の環境まで見えてきた。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 5. 姿見井・衣掛天満宮 (2件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-013",
    statement:
      "姿見井は延喜元年（901年）菅原道真左遷路伝承（水面で衣服を整えた）を伝えるが、発掘された石積み構造は近世以降とみられ、官道の空間的記憶と道真伝承が近世地誌の中で結びつき定着したことを示す。",
    subject: { name: "姿見井・衣掛天満宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "菅原道真901年左遷伝承と近世姿見井石積み遺構の重層",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "平安時代（901年伝承）〜江戸時代（『筑前国続風土記拾遺』）",
      precision: "broad-range",
    },
    places: [{ name: "姿見井・衣掛天満宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 203,
          endLine: 214,
          quote:
            "901年、菅原道真が大宰府へ向かう際に、この場所で衣服を改め、水面に姿を映したという伝承がある。ただし、901年の出来事そのものを証明するものではない。一方、江戸時代の『筑前国続風土記拾遺』や明治期の地誌には、姿見井に関する記録が残っている。発掘調査では石積みの構造も確認されたが、構築年代は不明で、近世以降のものと考えられている。つまり、道真の伝承と井戸の存在は、後世の地域の記憶の中で結びついてきたと整理できる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-014",
    statement:
      "衣掛天満宮は宝永年間（1704〜1710年）に地元住民によって建立され、1953年枯死の御神木松から作られた絵馬や宮座・年中行事を通じ、道真伝承を核とした村落共同祭祀の場として機能してきた。",
    subject: { name: "姿見井・衣掛天満宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "宝永年間建立衣掛天満宮の宮座・年中行事と村落共同祭祀",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "江戸時代中期（宝永年間）〜現代",
      precision: "broad-range",
    },
    places: [{ name: "姿見井・衣掛天満宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 215,
          endLine: 226,
          quote:
            "衣掛天満宮では、道真が衣を掛けたという石や松の伝承が残っている。案内板によると、少なくとも宝永年間（1704～1710年）には、地元住民の花田氏らによって社が建立されていた。また、1953年に枯れた御神木の松から絵馬や額が作られ、拝殿内に残されているとのことだった。特に注目したのは、宮座や年中行事である。神社が伝承を保存するだけでなく、村落の共同祭祀の場として機能していたことを考える手掛かりになる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 6. 御陵寶満神社 (1件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-015",
    statement:
      "御陵寶満神社は玉依姫命の御陵伝承地とされる一方、近世に周辺五村（中村・乙金村・山田村・筒井村・井相田村）へ勧請・分社され、1886年鳥居建立にも五村が連名するなど、地域村落の共同祭祀ネットワークの中心であった。",
    subject: { name: "御陵寶満神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "御陵寶満神社を核とする周辺五村（乙金・中・山田・筒井・井相田）共同祭祀・分社ネットワーク",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "近世（1595年乙金勧請・1675年分社）〜明治（1886年鳥居）",
      precision: "broad-range",
    },
    places: [{ name: "御陵寶満神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 251,
          endLine: 268,
          quote:
            "今回、最も重要だったのは、御陵寶満宮から周辺五村へ勧請されたという記録である。中村、乙金村、山田村、筒井村、井相田村。地域資料では、乙金宝満宮は1595年、中宝満宮や筒井宝満神社は1675年に御陵から勧請されたとされる。1886年の鳥居建立にも、五村の名前が記されている。このことから、御陵寶満神社は近世において、周辺五村の共同祭祀の中心的な場所だったと考えられる。宝満神社の分布を個々の神社の由緒ではなく、地域の祭祀ネットワークとして見る視点が得られた。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 7. 宇美八幡宮・御胞衣ヶ浦 (4件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-016",
    statement:
      "宇美八幡宮は敏達天皇3年（574年）創建・神功皇后応神天皇出産伝承を伝える一方、確実な史料として天喜3年（1055年）石清水文書に北部九州八幡五社の一社として現れ、平安期に広域八幡ネットワークへ組み込まれていたことを裏付ける。",
    subject: { name: "宇美八幡宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "宇美八幡宮の創建伝承（574年）と1055年石清水文書（北部九州八幡五社）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "平安時代中期（1055年天喜3年文書）",
      precision: "broad-range",
    },
    places: [{ name: "宇美八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 281,
          endLine: 289,
          quote:
            "創建：敏達天皇3年（574年）と伝える。史料上の確認：1055年の石清水文書。案内板によると、1055年の史料では、宇美八幡宮を含む北部九州の八幡関係五社が石清水八幡宮の管轄下に入ったことが記されている。ここから、少なくとも平安時代には、宇美八幡宮が広域的な八幡信仰のネットワークに組み込まれていたことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-017",
    statement:
      "宇美八幡宮では「湯蓋の森」「衣掛の森」「子安の木」「産湯の水」「御胞衣ヶ浦」が配置され、神功皇后の出産に伴う一連の出来事が、巨木・水・石・胞衣という具体的な自然物・場所に結びついて空間的に分節・祀られている。",
    subject: { name: "宇美八幡宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "出産の具体的プロセスの空間連鎖（湯蓋森・衣掛森・子安木・産湯水・御胞衣ヶ浦）",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古代〜現代",
      precision: "broad-range",
    },
    places: [
      { name: "宇美八幡宮", role: "subject_place" },
      { name: "宇美八幡宮 奥宮（御胞衣ヶ浦）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 306,
          endLine: 318,
          quote:
            "出産伝承が複数の場所に分けて残されていること。湯蓋の森：産湯の湯船を覆ったように枝葉が茂った。衣掛の森：神功皇后が衣を掛けた。子安の木：槐の枝にすがって出産した。産湯の水：応神天皇の産湯に使われた。御胞衣ヶ浦：応神天皇の胞衣を納めた。これらは単に神功皇后や応神天皇の名前を祀るだけではなく、出産に伴う具体的な出来事を、木・水・石・胞衣といった対象に結びつけている。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-018",
    statement:
      "安産祈願で預かり出産後に子の名を記して返す「子安の石」習俗や、鎌倉初期に槐の神木から造られた薬師像への安産祈願記録は、宇美八幡宮の安産・産育信仰が中世初頭から民俗儀礼として持続してきたことを実証する。",
    subject: { name: "宇美八幡宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "宇美八幡宮「子安の石」民俗儀礼と鎌倉初期神木薬師像安産祈願",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "鎌倉時代初頭〜現代",
      precision: "broad-range",
    },
    places: [{ name: "宇美八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 319,
          endLine: 332,
          quote:
            "特に子安の石が印象的だった。安産祈願を受けた妊婦が石を預かり、出産後に別の石へ子どもの名前などを書いて、預かった石とともに奉納する習俗である。祈願から出産、御礼参りまでを一連の行為としてつなぐ仕組みになっている。また、鎌倉時代初頭には、宇美八幡宮の槐の木を用いて薬師像を造り、安産祈願を行ったという記録も残っている。安産信仰が、近世になって突然生まれたものではないことを示す材料である。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-019",
    statement:
      "宇美八幡宮奥宮の「御胞衣ヶ浦」は、応神天皇誕生時に母体から出た胞衣（胎盤・卵膜）を宇美川ですすぎ筥に納めた伝承地であり、出産の生命根源物である胞衣を特定の土地に結びつけて祀る日本伝統の産育民俗が聖域化した極めて貴重な事例である。",
    subject: { name: "宇美八幡宮 奥宮（御胞衣ヶ浦）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "御胞衣ヶ浦奥宮にみる胞衣（胎盤・卵膜）水洗・埋納の聖域化と日本産育民俗",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古代伝承〜現代",
      precision: "broad-range",
    },
    places: [{ name: "宇美八幡宮 奥宮（御胞衣ヶ浦）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 333,
          endLine: 350,
          quote:
            "案内板によれば、応神天皇の誕生時、御産所の裏を流れる宇美川で胞衣をすすぎ、筥に納めたと伝えられている。その場所を奥宮として祀っている。胞衣は、胎盤や胎児を包んでいた膜など、出産に伴って母体から出るもの。日本の伝統的な出産習俗では、胞衣は単なる廃棄物ではなく、子どもの生命や成長と関係するものとして扱われてきた。宇美八幡宮では、その胞衣を納めた場所が、本殿から離れた丘の上の奥宮として残されている。これは、出産という出来事の一部を、特定の土地に結びつけて祀るものといえる。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },

  // 8. 地域総括 (1件)
  {
    schemaVersion: "0.2.0",
    id: "claim-fukuoka-020",
    statement:
      "北部九州は、弥生・古墳期の対外交流・生産基盤（板付・牛頸・善一田）の上に、白村江後の国家防衛・交通関門（水城・官道・大宰府）が重なり、さらに村落共同祭祀（宝満五村）や民衆の身体・産育信仰（宇美・御胞衣ヶ浦）が多層的に交錯した歴史的結節点である。",
    subject: { name: "水城（水城跡・東門官道・水城館）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "国家統御（水城）と生活産育（宇美）が交錯する北部九州の歴史的結節性",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "弥生時代〜現代（複合重層史）",
      precision: "broad-range",
    },
    places: [
      { name: "板付遺跡弥生館", role: "subject_place" },
      { name: "大野城市歴史資料展示室", role: "subject_place" },
      { name: "善一田古墳群", role: "subject_place" },
      { name: "水城（水城跡・東門官道・水城館）", role: "subject_place" },
      { name: "姿見井・衣掛天満宮", role: "subject_place" },
      { name: "御陵寶満神社", role: "subject_place" },
      { name: "宇美八幡宮", role: "subject_place" },
      { name: "宇美八幡宮 奥宮（御胞衣ヶ浦）", role: "subject_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 353,
          endLine: 406,
          quote:
            "北部九州は、古代の交通・生産・政治の結節点だった。水城は「防衛施設」という一面的な理解では不十分だった。防衛・交通・行政・外交が交差する場所だったのである。宇美八幡宮では、神話的な由緒をそのまま古代の史実とみなすのではなく、伝承がどのように土地・自然物・生活習俗に結びつき、長く継承されてきたかを見ることができた。水城では国家が土地をどう利用し、管理したか。宇美八幡宮では人々が土地にどのような意味を与え、信仰を継承したか。この二つが、今回の探索を象徴するテーマだった。",
        },
      },
    ],
    createdAt: "2026-11-03T10:00:00Z",
  },
];

const connections = [
  {
    id: "connection-mizuki-dazaifu-highway-network",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "MIZUKI / HIGHWAY / DAZAIFU",
    title: "水城防衛線と博多・大宰府古代官道（防衛と交通管理の一体システム）",
    summary:
      "水城東門を直線で貫通する幅10mの古代官道と植樹花粉分析から、水城が単なる遮断壁ではなく、博多港と大宰府を結ぶ物資・使節・情報の流通を統御・維持する国家関門であった実態を結ぶ。",
    spotIds: [
      "spot-mizuki-fortification",
      "spot-sugatamii-kinukake-tenmangu",
    ],
    claimIds: [
      "claim-fukuoka-008",
      "claim-fukuoka-009",
      "claim-fukuoka-010",
      "claim-fukuoka-011",
      "claim-fukuoka-012",
      "claim-fukuoka-013",
    ],
    concepts: [
      "水城",
      "古代官道",
      "東門",
      "大宰府条坊",
      "博多港",
      "版築敷粗朶",
      "姿見井",
      "道真伝承",
    ],
    facets: [
      { id: "route", label: "古代官道交通網", weight: 5 },
      { id: "politics", label: "白村江国家防衛", weight: 5 },
      { id: "spatial", label: "関門交通統御", weight: 4 },
    ],
    lensId: "politics",
    eras: [
      {
        id: "era-mizuki-highway-defense",
        label: "白村江後国家防衛土塁と博多〜大宰府間官道の整備",
        range: "天智3年（664年）〜奈良・平安期",
        mapLabel: "水城防衛線と幅10m古代官道交通関門",
        mapLayer: "domain",
        spotIds: [
          "spot-mizuki-fortification",
          "spot-sugatamii-kinukake-tenmangu",
        ],
        claimIds: [
          "claim-fukuoka-008",
          "claim-fukuoka-010",
          "claim-fukuoka-011",
          "claim-fukuoka-012",
        ],
      },
    ],
  },
  {
    id: "connection-chikushi-iron-and-pottery-production",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "CHIKUSHI / IRON & POTTERY / TRADE",
    title: "筑紫平野の古代生産基盤と東アジア交易（牛頸須恵器窯と善一田古墳群鍛冶首長）",
    summary:
      "500基以上の牛頸須恵器窯跡群と、鉄鋏（鍛冶具）・新羅土器・西アジアガラス玉を出土した善一田古墳群を結び、古代国家形成を支えた地域首長の鉄器・窯業生産力と対外交流網を捉える。",
    spotIds: [
      "spot-onojo-history-museum",
      "spot-zenichida-kofun-cluster",
    ],
    claimIds: [
      "claim-fukuoka-003",
      "claim-fukuoka-004",
      "claim-fukuoka-005",
      "claim-fukuoka-006",
      "claim-fukuoka-007",
    ],
    concepts: [
      "牛頸須恵器窯跡群",
      "善一田古墳群18号墳",
      "鉄鋏（かなはし）",
      "新羅土器",
      "西アジアガラス玉",
      "青銅器祭祀",
    ],
    facets: [
      { id: "industry", label: "鉄器・須恵器生産", weight: 5 },
      { id: "exchange", label: "東アジアシルクロード交易", weight: 5 },
      { id: "archaeology", label: "古墳副葬物証", weight: 4 },
    ],
    lensId: "industry",
    eras: [
      {
        id: "era-chikushi-iron-pottery",
        label: "筑紫平野における牛頸須恵器窯業と善一田鍛冶首長集団の展開",
        range: "6世紀後半〜9世紀中頃",
        mapLabel: "牛頸須恵器窯群と善一田鉄器生産・東アジア交易首長墓",
        mapLayer: "maritime",
        spotIds: [
          "spot-onojo-history-museum",
          "spot-zenichida-kofun-cluster",
        ],
        claimIds: [
          "claim-fukuoka-004",
          "claim-fukuoka-005",
          "claim-fukuoka-006",
        ],
      },
    ],
  },
  {
    id: "connection-homan-shrine-five-villages-network",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "HOMAN / FIVE VILLAGES / COMMUNITY RITE",
    title: "宝満山信仰と御陵寶満神社の五村共同祭祀（近世地域村落の分社ネットワーク）",
    summary:
      "玉依姫御陵伝承を持つ御陵寶満宮から、乙金・中・山田・筒井・井相田の周辺五村へ勧請された祭祀の系譜と、近世村落共同体の結束基盤を結ぶ。",
    spotIds: [
      "spot-goryo-homan-jinja",
      "spot-zenichida-kofun-cluster",
    ],
    claimIds: [
      "claim-fukuoka-007",
      "claim-fukuoka-015",
    ],
    concepts: [
      "御陵寶満神社",
      "玉依姫御陵伝承",
      "五村分社（乙金・中・山田・筒井・井相田）",
      "宝満山信仰",
      "村落共同祭祀",
    ],
    facets: [
      { id: "religion", label: "宝満山信仰", weight: 5 },
      { id: "history", label: "近世五村勧請史", weight: 5 },
      { id: "spatial", label: "平野周縁祭祀網", weight: 4 },
    ],
    lensId: "religion",
    eras: [
      {
        id: "era-homan-five-villages-network",
        label: "玉依姫御陵伝承から周辺五村への分社・共同祭祀の展開",
        range: "文禄4年（1595年）〜近世〜明治19年（1886年）",
        mapLabel: "御陵寶満宮と周辺五村共同祭祀ネットワーク",
        mapLayer: "religious",
        spotIds: [
          "spot-goryo-homan-jinja",
          "spot-zenichida-kofun-cluster",
        ],
        claimIds: [
          "claim-fukuoka-007",
          "claim-fukuoka-015",
        ],
      },
    ],
  },
  {
    id: "connection-umi-birth-and-placenta-sacred-landscape",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "UMI / CHILDBIRTH / PLACENTA / FOLKLORE",
    title: "宇美八幡宮の出産伝承と御胞衣ヶ浦（身体・胞衣の聖域化と安産民俗）",
    summary:
      "宇美八幡宮の森・泉・木と奥宮・御胞衣ヶ浦（胞衣筥納め伝承）を結び、国家神話（八幡・神功）の枠組みを超えて、女性の身体・胎盤・出産儀礼が土地と自然物に密着して継承された産育祭祀の景観を解明する。",
    spotIds: [
      "spot-umi-hachimangu",
      "spot-umi-obiegaura-okumiya",
    ],
    claimIds: [
      "claim-fukuoka-016",
      "claim-fukuoka-017",
      "claim-fukuoka-018",
      "claim-fukuoka-019",
    ],
    concepts: [
      "宇美八幡宮",
      "御胞衣ヶ浦（奥宮）",
      "胞衣（胎盤・卵膜）",
      "湯蓋の森・衣掛の森",
      "子安の木",
      "子安の石信仰",
      "石清水文書",
    ],
    facets: [
      { id: "ritual", label: "産育・胞衣埋納儀礼", weight: 5 },
      { id: "myth", label: "八幡神誕生譚", weight: 4 },
      { id: "spatial", label: "宇美川河畔聖域", weight: 5 },
    ],
    lensId: "religion",
    eras: [
      {
        id: "era-umi-birth-placenta-rite",
        label: "応神天皇出産伝承・胞衣祭祀から石清水八幡五社・子安石信仰の展開",
        range: "敏達3年（574年伝承）〜天喜3年（1055年）〜現代",
        mapLabel: "宇美八幡宮巨樹群と御胞衣ヶ浦奥宮産育聖域",
        mapLayer: "religious",
        spotIds: [
          "spot-umi-hachimangu",
          "spot-umi-obiegaura-okumiya",
        ],
        claimIds: [
          "claim-fukuoka-016",
          "claim-fukuoka-017",
          "claim-fukuoka-018",
          "claim-fukuoka-019",
        ],
      },
    ],
  },
  {
    id: "connection-northern-kyushu-frontier-nodality",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "NORTHERN KYUSHU / STRATIGRAPHY / SYNTHESIS",
    title: "北部九州の重層地層（国家統御・地域生産・生活産育の交差点）",
    summary:
      "板付の弥生稲作・交流から、善一田の鍛冶、水城の国家防衛官道、宇美八幡宮の産育信仰に至る、北部九州の複合的結節性を包括的に結ぶ。",
    spotIds: [
      "spot-itatuke-ruins",
      "spot-zenichida-kofun-cluster",
      "spot-mizuki-fortification",
      "spot-umi-hachimangu",
    ],
    claimIds: [
      "claim-fukuoka-001",
      "claim-fukuoka-002",
      "claim-fukuoka-008",
      "claim-fukuoka-011",
      "claim-fukuoka-016",
      "claim-fukuoka-019",
      "claim-fukuoka-020",
    ],
    concepts: [
      "板付遺跡",
      "善一田古墳群",
      "水城跡",
      "宇美八幡宮",
      "重層地層",
      "国家防衛と生活産育",
    ],
    facets: [
      { id: "history", label: "北部九州通史地層", weight: 5 },
      { id: "politics", label: "古代国家統御", weight: 5 },
      { id: "ritual", label: "生活・産育祭祀", weight: 5 },
    ],
    lensId: "history",
    eras: [
      {
        id: "era-northern-kyushu-stratigraphy",
        label: "弥生稲作・鉄器生産から国家防衛官道・生活産育祭祀の重層展開",
        range: "弥生〜古代〜近世〜現代",
        mapLabel: "北部九州における国家統御と生活産育の重層地層",
        mapLayer: "domain",
        spotIds: [
          "spot-itatuke-ruins",
          "spot-zenichida-kofun-cluster",
          "spot-mizuki-fortification",
          "spot-umi-hachimangu",
        ],
        claimIds: [
          "claim-fukuoka-001",
          "claim-fukuoka-008",
          "claim-fukuoka-011",
          "claim-fukuoka-016",
          "claim-fukuoka-020",
        ],
      },
    ],
  },
];

const newJourney = {
  id: "journey-fukuoka-defense-and-birth",
  label: "北部九州（水城防衛官道と宇美八幡宮産育祭祀）",
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

// 1. tomono-review-draft.json
if (fs.existsSync(draftPath)) {
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  upsertDataset(null, draft.documents, draft.claims);
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");
  console.log("Updated tomono-review-draft.json");
}

// 2. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertDataset(atlas, null, null);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
  console.log("Updated travel-atlas.yamatai.json");
}

// 3. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertDataset(pub.atlas, pub.documents, pub.claims);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log(
    `Updated published-review-dataset.json (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length})`,
  );
}
