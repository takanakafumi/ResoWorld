import fs from "fs";
import path from "path";

const rootDir = "B:/09_Technology/22_ResoWorld_bionic";
const traveloguePath = path.join(rootDir, "旅行記/福岡市東区・志賀島.txt");
const draftPath = path.join(rootDir, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(rootDir, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(rootDir, "data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf8");
const travelogueSha256 = "40A04290F947F9E5584B4769DE74808E42C687EE43A4251A1180ECA4E88DEEEF";

const documentId = "doc-higashiku-shikanoshima";
const documentTitle = "福岡市東区・志賀島 古層祭祀景観探索";
const relativeTraveloguePath = "旅行記/福岡市東区・志賀島.txt";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-10-05",
  documentedAt: "2026-10-05",
  dateStatus: "known",
};

// 7 Key Spots
const spots = [
  {
    id: "spot-wajiro-oogami",
    name: "和白・大神神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・古墳",
    latitude: 33.6896,
    longitude: 130.4358,
    claimIds: ["claim-shika-001", "claim-shika-002"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-wajiro-yonsha",
    name: "和白四社神社・塩浜",
    region: "福岡県 · 福岡市東区",
    kind: "神社・製塩遺構",
    latitude: 33.6865,
    longitude: 130.4285,
    claimIds: ["claim-shika-003", "claim-shika-004"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-mitoma-watatsumi",
    name: "三苫・綿津見神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・神仏習合",
    latitude: 33.7028,
    longitude: 130.4342,
    claimIds: ["claim-shika-005"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-nata-shikishiki",
    name: "奈多・志式神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・海浜祭祀",
    latitude: 33.6822,
    longitude: 130.4075,
    claimIds: ["claim-shika-006", "claim-shika-007"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-ohtake-shrine",
    name: "大嶽神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・岩盤丘陵古墳",
    latitude: 33.6668,
    longitude: 130.3452,
    claimIds: ["claim-shika-008", "claim-shika-009"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-shikaumi-jinja",
    name: "志賀海神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・阿曇氏総本宮",
    latitude: 33.6692,
    longitude: 130.3128,
    claimIds: ["claim-shika-010", "claim-shika-011", "claim-shika-012", "claim-shika-013"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-nakatsumiya-kofun",
    name: "中津宮古墳",
    region: "福岡県 · 福岡市東区",
    kind: "海人首長墓・古墳",
    latitude: 33.6738,
    longitude: 130.2981,
    claimIds: ["claim-shika-014", "claim-shika-015"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-okitsumiya",
    name: "沖津宮",
    region: "福岡県 · 福岡市東区",
    kind: "海中島嶼聖域",
    latitude: 33.6845,
    longitude: 130.2872,
    claimIds: ["claim-shika-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

// Claims
const claims = [
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-001",
    statement: "和白大神神社では境内と宮前古墳の墓域が重層し、古代墳墓と後世の神社祭祀の空間的連続性が観察される。",
    subject: { name: "和白大神神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "古墳と神社の重層祭祀空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古墳時代〜現代", precision: "broad-range" },
    places: [{ name: "和白大神神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 14,
        endLine: 26,
        quote: "神社境内に古墳が重なっている場所。古墳時代の墓域、後世の神社祭祀という異なる時代の宗教的空間が同じ場所に残っている。",
      },
    }],
    createdAt: "2026-10-05T08:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-002",
    statement: "和白周辺の住宅地には天神・貴船などの小祠が点在し、生活・水・天候に関わるきめ細かな共同体祭祀が残存する。",
    subject: { name: "和白周辺小祠群", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "地域生活祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "broad-range" },
    places: [{ name: "和白", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 41,
        endLine: 50,
        quote: "住宅地の中の小さな社を確認。天候・水・生活などに関わる信仰が細かな単位で残っている。",
      },
    }],
    createdAt: "2026-10-05T08:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-003",
    statement: "和白四社神社では塩土老翁や神功皇后が祀られ、海岸部の製塩地名「塩浜」と海人祭祀が密接に結合している。",
    subject: { name: "和白四社神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "製塩生業と海人祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜中世", precision: "broad-period" },
    places: [{ name: "和白四社神社", role: "subject_place" }, { name: "塩浜", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 80,
        endLine: 91,
        quote: "特に重要なのが、塩浜という地名・生産活動と祭祀が近接していること。海岸で何を生産し、どう生活していたかという地域の生業と祭祀が重なっている。",
      },
    }],
    createdAt: "2026-10-05T09:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-004",
    statement: "和白四社神社には志賀三神（綿津見）と住吉三神が並置され、玄界灘と博多湾を結ぶ海人神話の統合が見られる。",
    subject: { name: "和白四社神社", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "志賀三神・住吉三神並祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古代", precision: "broad-period" },
    places: [{ name: "和白四社神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 57,
        endLine: 66,
        quote: "見えた要素：志賀三神、住吉三神、塩土老翁、神功皇后",
      },
    }],
    createdAt: "2026-10-05T09:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-005",
    statement: "三苫綿津見神社は旧称「八大龍王社」であり、海中仏像漂着伝承や観音・文殊菩薩とともに海神・龍王・仏教の重層習合を示す。",
    subject: { name: "三苫綿津見神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "海神龍王仏教の習合空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "中世〜近世", precision: "broad-range" },
    places: [{ name: "三苫綿津見神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 123,
        endLine: 137,
        quote: "海神信仰＋龍王信仰＋仏教＋神社という神仏習合の層が見える。明治の神仏分離によって現在の姿に整理されたが、古い仏教的要素も残っている。",
      },
    }],
    createdAt: "2026-10-05T09:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-006",
    statement: "奈多志式神社では亀石や龍宮神社とともに「お潮井（清めの砂）」が用いられ、海浜物質と信仰の密接な連動を示す。",
    subject: { name: "奈多志式神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "海浜物質とお潮井祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜現代", precision: "broad-range" },
    places: [{ name: "奈多志式神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 156,
        endLine: 166,
        quote: "海・漁撈・龍宮・亀・砂という海辺の生活と祭祀がまとまって見える。特にお潮井＝海岸の砂を清めに用いる習慣は、この後に訪れた志賀海神社ともつながる重要な要素。",
      },
    }],
    createdAt: "2026-10-05T10:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-007",
    statement: "志式神社のお潮井（海岸の砂による清め）は志賀海神社と通底し、玄界灘沿岸海人社会共通の物質的祭祀基盤を形成する。",
    subject: { name: "お潮井祭祀ネットワーク", type: "Concept" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "海人社会の物質祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古代〜現代", precision: "broad-range" },
    places: [{ name: "奈多志式神社", role: "subject_place" }, { name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 535,
        endLine: 551,
        quote: "海そのものだけでなく、塩浜・お潮井・砂・磯・石という海岸の物質そのものが祭祀対象・祭祀道具として残っている。",
      },
    }],
    createdAt: "2026-10-05T10:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-008",
    statement: "大嶽神社は海の中道を構成する岩盤丘陵に位置し、巨岩・大岳古墳・風神（志那都比古神）が複合した特異な聖域を形成する。",
    subject: { name: "大嶽神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "岩盤丘陵・古墳・風神複合聖域", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代", precision: "broad-period" },
    places: [{ name: "大嶽神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 194,
        endLine: 208,
        quote: "大岳は単なる海岸の丘ではなく、海の中道を構成する岩盤の小丘。海→岩盤丘陵→巨岩→古墳→風の神という独特の重なりがある。",
      },
    }],
    createdAt: "2026-10-05T11:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-009",
    statement: "海上交通環境にある海の中道の岩盤丘陵に大岳古墳が築かれており、海人航路掌握と高所墳墓の空間的関係が示唆される。",
    subject: { name: "大岳古墳", type: "Place" },
    predicate: "located_in",
    object: { kind: "entity", entity: { name: "海上交通路の岩盤丘陵", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古墳時代", precision: "broad-period" },
    places: [{ name: "大嶽神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 210,
        endLine: 218,
        quote: "大岳古墳の存在は確認できる。海上交通環境にある岩盤丘陵に古墳が築かれていること自体が興味深い。",
      },
    }],
    createdAt: "2026-10-05T11:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-010",
    statement: "志賀海神社では神宝として大量の鹿角が鹿角庫に納められており、神功皇后鹿狩り伝承を背景にした独自の狩猟・海神複合文化を物語る。",
    subject: { name: "志賀海神社 鹿角庫", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "神宝鹿角奉納祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜現代", precision: "broad-range" },
    places: [{ name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 261,
        endLine: 274,
        quote: "大量の鹿角を納める鹿角庫。鹿角そのものが長期にわたって神宝として扱われてきた。鹿角を奉納・保管するという独特の祭祀文化が存在したこと自体が重要。",
      },
    }],
    createdAt: "2026-10-05T11:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-011",
    statement: "志賀海神社の境内末社・磯崎社には大己貴神の石が祀られ、磯・石・海と国津神・出雲系譜の結節空間を形成している。",
    subject: { name: "志賀海神社 磯崎社", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "大己貴神の石祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜中世", precision: "broad-period" },
    places: [{ name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 322,
        endLine: 334,
        quote: "磯崎社・大己貴神の石。大己貴神と磯・石が組み合わされた祭祀空間。磯・石・海・大己貴という空間構成を見ることができる。",
      },
    }],
    createdAt: "2026-10-05T12:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-012",
    statement: "志賀海神社境内に「山の神」が祀られている事実は、海人社会が海だけでなく山林・木材・水・狩猟をも統合した広域生活圏を保持していたことを示す。",
    subject: { name: "志賀海神社 山の神", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "海人社会の山林統合生活圏", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古代", precision: "broad-period" },
    places: [{ name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 337,
        endLine: 367,
        quote: "海神の巨大な神社の中に山の神がある。海人社会＝海だけの世界ではない。海で活動する社会にとっても山・木材・狩猟等は不可欠。「海と山」が一つの生活圏として存在していた。",
      },
    }],
    createdAt: "2026-10-05T12:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-013",
    statement: "志賀海神社の惣社・八百萬神は抽象的観念ではなく、地域社会に存在した多数の末社・諸信仰を歴史的に集約した重層的統合の結晶である。",
    subject: { name: "志賀海神社 惣社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "地域信仰の集約・重層空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古代〜中世", precision: "broad-range" },
    places: [{ name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 278,
        endLine: 318,
        quote: "志賀海神社の場合は、実際に存在していた多数の末社・地域の信仰を集約した結果として見ることができる。海・山・船・道・火・生産・疫病など、地域社会の様々な宗教領域を抱え込んだ空間。",
      },
    }],
    createdAt: "2026-10-05T12:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-014",
    statement: "志賀島勝馬の中津宮古墳（7世紀中葉）は鉄矛・鉄鏃・銀メッキ耳環を出土し、志賀島を拠点とした阿曇海人集団の首長墓に比定される。",
    subject: { name: "中津宮古墳", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "海人集団首長墓", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古墳時代終末期〜飛鳥時代（7世紀中頃）", precision: "period" },
    places: [{ name: "中津宮古墳", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 377,
        endLine: 408,
        quote: "7世紀中ごろ、須恵器・鉄鏃・鉄矛・刀子・鉄斧・銀メッキ耳環。福岡市は、勝馬を拠点とした海人集団の首長の墓と推定している。",
      },
    }],
    createdAt: "2026-10-05T13:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-015",
    statement: "中津宮古墳の首長墓考古事実により、神話伝承上の「志賀島の海人族・阿曇氏」が物質的・歴史的な集団として確証される。",
    subject: { name: "志賀島阿曇海人社会", type: "Concept" },
    predicate: "interpreted_as",
    object: { kind: "entity", entity: { name: "考古学的に実在する古代首長集団", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "7世紀", precision: "period" },
    places: [{ name: "中津宮古墳", role: "subject_place" }, { name: "志賀海神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 411,
        endLine: 424,
        quote: "「志賀島には古代の海人がいた」という話が、神話だけではなく、具体的な首長墓・副葬品・考古学的集団として見えてくる。",
      },
    }],
    createdAt: "2026-10-05T13:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-shika-016",
    statement: "沖津宮は海中の石鳥居を経て鎮座し、満潮時の渡航遮断によって潮そのものが陸地と海上の神域境界を形成する景観構造を持つ。",
    subject: { name: "沖津宮", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "潮の干満が境界を画する海上神域", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜現代", precision: "broad-range" },
    places: [{ name: "沖津宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 450,
        endLine: 467,
        quote: "中津宮→海→石鳥居→沖津宮という構造。満潮になると人間が簡単には渡れないため、潮そのものが神域との境界を作るという、地形と祭祀が直接結びついた景観になっている。",
      },
    }],
    createdAt: "2026-10-05T13:45:00Z",
  },
];

// Atlas Connections for the new Journey
const connections = [
  {
    id: "connection-azumi-marine-lineage",
    connectionKind: "interpretive",
    initialStatus: "suggested",
    eyebrow: "AZUMI / SEA / RITUAL",
    title: "海人族・阿曇氏の祭祀と首長墓の重層",
    summary: "志賀海神社の綿津見祭祀・鹿角神宝と、勝馬中津宮古墳（7世紀海人首長墓）が結びつき、神話上の阿曇氏が考古学的首長層として実体化する。",
    spotIds: ["spot-shikaumi-jinja", "spot-nakatsumiya-kofun", "spot-okitsumiya"],
    claimIds: ["claim-shika-010", "claim-shika-014", "claim-shika-015", "claim-shika-016"],
    concepts: ["阿曇氏", "綿津見三神", "海人首長墓", "鹿角神宝", "海上神域"],
    facets: [
      { id: "myth", label: "神話", weight: 5 },
      { id: "ritual", label: "祭祀", weight: 5 },
      { id: "politics", label: "首長層", weight: 4 },
    ],
    lensId: "mythology",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-azumi-kofun",
        label: "海人首長と綿津見祭祀",
        range: "7世紀〜古代",
        mapLabel: "阿曇首長墓と海神総本社",
        mapLayer: "maritime",
        spotIds: ["spot-shikaumi-jinja", "spot-nakatsumiya-kofun", "spot-okitsumiya"],
        claimIds: ["claim-shika-014", "claim-shika-015"],
      },
    ],
  },
  {
    id: "connection-uminonakamichi-corridor",
    connectionKind: "interpretive",
    initialStatus: "suggested",
    eyebrow: "COAST / PRODUCTION / ROCK",
    title: "海の中道：砂・塩・岩盤丘陵と生活祭祀回廊",
    summary: "和白の塩浜・大神神社から奈多のお潮井、大嶽神社の岩盤丘陵・風神を経て志賀島へ至る、生活生業と物質祭祀の連続軸。",
    spotIds: [
      "spot-wajiro-oogami",
      "spot-wajiro-yonsha",
      "spot-mitoma-watatsumi",
      "spot-nata-shikishiki",
      "spot-ohtake-shrine",
      "spot-shikaumi-jinja",
    ],
    claimIds: [
      "claim-shika-001",
      "claim-shika-003",
      "claim-shika-005",
      "claim-shika-006",
      "claim-shika-007",
      "claim-shika-008",
    ],
    concepts: ["海の中道", "塩浜", "お潮井", "風神", "神仏習合", "神功皇后"],
    facets: [
      { id: "route", label: "回廊", weight: 5 },
      { id: "ritual", label: "祭祀", weight: 5 },
      { id: "exchange", label: "生業", weight: 4 },
    ],
    lensId: "religion",
    topicId: "shikinaisha-network-preset",
    eras: [
      {
        id: "era-coast-ritual",
        label: "沿岸生活と物質祭祀",
        range: "古代〜中世",
        mapLabel: "塩・砂・風の沿岸祭祀回廊",
        mapLayer: "religious",
        spotIds: [
          "spot-wajiro-yonsha",
          "spot-nata-shikishiki",
          "spot-ohtake-shrine",
          "spot-shikaumi-jinja",
        ],
        claimIds: ["claim-shika-003", "claim-shika-006", "claim-shika-007"],
      },
    ],
  },
  {
    id: "connection-onamuchi-isozaki-link",
    connectionKind: "interpretive",
    initialStatus: "suggested",
    eyebrow: "MYTH / ONAMUCHI / COAST",
    title: "玄界灘沿岸における大己貴（国津神）祭祀の結節",
    summary: "志賀海神社の磯崎社（大己貴神の石）および和白大神神社（大物主）に見る、玄界灘海人空間と出雲系譜・筑紫古層祭祀の重なり。",
    spotIds: ["spot-wajiro-oogami", "spot-shikaumi-jinja"],
    claimIds: ["claim-shika-001", "claim-shika-011", "claim-shika-012"],
    concepts: ["大己貴神", "大物主神", "国津神", "磯崎社", "山の神"],
    facets: [
      { id: "myth", label: "神話", weight: 5 },
      { id: "ritual", label: "祭祀", weight: 4 },
    ],
    lensId: "mythology",
    topicId: "asakura-kami-connections",
    eras: [
      {
        id: "era-onamuchi-presence",
        label: "国津神と海神の共生",
        range: "古代",
        mapLabel: "海神の社に宿る国津神の石",
        mapLayer: "mythic",
        spotIds: ["spot-wajiro-oogami", "spot-shikaumi-jinja"],
        claimIds: ["claim-shika-011", "claim-shika-012"],
      },
    ],
  },
];

// Journey definition
const newJourney = {
  id: "journey-higashiku-shikanoshima",
  label: "海の中道・志賀島",
  documentIds: [documentId],
  spotIds: spots.map((s) => s.id),
  connectionIds: connections.map((c) => c.id),
};

console.log("Applying updates to draft and atlas...");

// 1. Update tomono-review-draft.json
const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
if (!draft.documents.some((d) => d.id === documentId)) {
  draft.documents.push(newDocument);
}
for (const c of claims) {
  const idx = draft.claims.findIndex((existing) => existing.id === c.id);
  if (idx >= 0) {
    draft.claims[idx] = c;
  } else {
    draft.claims.push(c);
  }
}
fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");
console.log("Updated tomono-review-draft.json");

// 2. Update travel-atlas.yamatai.json
const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));

// Add or update journey
const jIdx = atlas.journeys.findIndex((j) => j.id === newJourney.id);
if (jIdx >= 0) {
  atlas.journeys[jIdx] = newJourney;
} else {
  atlas.journeys.push(newJourney);
}

// Add spots
for (const s of spots) {
  const sIdx = atlas.spots.findIndex((existing) => existing.id === s.id);
  if (sIdx >= 0) {
    atlas.spots[sIdx] = s;
  } else {
    atlas.spots.push(s);
  }
}

// Add connections
for (const c of connections) {
  const cIdx = atlas.connections.findIndex((existing) => existing.id === c.id);
  if (cIdx >= 0) {
    atlas.connections[cIdx] = c;
  } else {
    atlas.connections.push(c);
  }
}

fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
console.log("Updated travel-atlas.yamatai.json");

// 3. Update published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  if (pub.atlas) {
    const pubJIdx = pub.atlas.journeys.findIndex((j) => j.id === newJourney.id);
    if (pubJIdx >= 0) {
      pub.atlas.journeys[pubJIdx] = newJourney;
    } else {
      pub.atlas.journeys.push(newJourney);
    }
    for (const s of spots) {
      const psIdx = pub.atlas.spots.findIndex((existing) => existing.id === s.id);
      if (psIdx >= 0) {
        pub.atlas.spots[psIdx] = s;
      } else {
        pub.atlas.spots.push(s);
      }
    }
    for (const c of connections) {
      const pcIdx = pub.atlas.connections.findIndex((existing) => existing.id === c.id);
      if (pcIdx >= 0) {
        pub.atlas.connections[pcIdx] = c;
      } else {
        pub.atlas.connections.push(c);
      }
    }
  }
  if (!pub.documents.some((d) => d.id === documentId)) {
    pub.documents.push(newDocument);
  }
  for (const c of claims) {
    const idx = pub.claims.findIndex((existing) => existing.id === c.id);
    if (idx >= 0) {
      pub.claims[idx] = c;
    } else {
      pub.claims.push(c);
    }
  }
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log("Updated published-review-dataset.json");
}

console.log("Successfully imported journey-higashiku-shikanoshima!");
