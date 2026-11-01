import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const traveloguePath = path.join(root, "旅行記", "今回の門司探索を、訪問した神社.txt");
const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf-8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-moji-2026-11-01";
const documentTitle = "門司の神社探索記録（淡島神社・和布刈神社・甲宗八幡宮・戸上神社）";
const relativeTraveloguePath = "旅行記/今回の門司探索を、訪問した神社.txt";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-11-01",
  documentedAt: "2026-11-01",
  dateStatus: "known",
};

const spots = [
  {
    id: "spot-awashima-jinja-moji",
    name: "淡島神社（門司）",
    region: "福岡県 · 北九州市門司区",
    kind: "神社・生活信仰・医薬安産・針供養",
    latitude: 33.9152,
    longitude: 130.9626,
    claimIds: [
      "claim-moji-001",
      "claim-moji-002",
      "claim-moji-003",
      "claim-moji-019",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-mekari-jinja",
    name: "和布刈神社",
    region: "福岡県 · 北九州市門司区",
    kind: "神社・関門海峡海上祭祀・和布刈神事・瀬織津姫",
    latitude: 33.9609,
    longitude: 130.9623,
    claimIds: [
      "claim-moji-004",
      "claim-moji-005",
      "claim-moji-006",
      "claim-moji-007",
      "claim-moji-008",
      "claim-moji-019",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-koso-hachimangu",
    name: "甲宗八幡宮",
    region: "福岡県 · 北九州市門司区",
    kind: "神社・中世門司関文書・武家支配・宗像三女神合祀・楠原踊",
    latitude: 33.9528,
    longitude: 130.9678,
    claimIds: [
      "claim-moji-009",
      "claim-moji-010",
      "claim-moji-011",
      "claim-moji-012",
      "claim-moji-013",
      "claim-moji-019",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-tonogami-jinja",
    name: "戸上神社（本宮・上宮遥拝）",
    region: "福岡県 · 北九州市門司区",
    kind: "神社・戸上山岳祭祀・海中神像伝承・英彦山修験・満隆寺観音信仰",
    latitude: 33.9015,
    longitude: 130.944,
    claimIds: [
      "claim-moji-014",
      "claim-moji-015",
      "claim-moji-016",
      "claim-moji-017",
      "claim-moji-018",
      "claim-moji-019",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const claims = [
  // 1. 淡島神社 (3件)
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-001",
    statement:
      "門司の淡島神社は主祭神を少名比古那神とし、六條天皇御代（1165〜1168年頃）に紀伊国加太淡嶋神社から勧請された由緒を伝え、医薬・療病・安産・子授けなど女性の生活・身体の回復に関わる信仰を伝える。",
    subject: { name: "淡島神社（門司）", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "少名比古那神主祭神・紀伊国加太勧請由緒と女性身体回復信仰",
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
      label: "平安末期（1165〜1168年勧請由緒）〜現代",
      precision: "broad-range",
    },
    places: [{ name: "淡島神社（門司）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 25,
          endLine: 35,
          quote:
            "主祭神：少名比古那神。大己貴神（大国主神）との国土経営・医薬・療病に関する神話と結びつく。紀伊国の淡嶋神社から勧請されたと伝える。六條天皇の御代、1165～1168年頃の創建とする由緒。少名比古那神は医薬・療病・身体の回復に関わる神として説明され、淡島信仰では特に女性の病気、安産、子授けなどとの関係が強い。",
        },
      },
    ],
    createdAt: "2026-11-01T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-002",
    statement:
      "淡島神社境内には針塚・水蛭子社・稲荷小祠など複数の民間祭祀施設が併祀され、道具への感謝と裁縫上達を祈る針供養の生活文化が継承されている。",
    subject: { name: "淡島神社（門司）", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "針塚・水蛭子社併祀と針供養・道具感謝の生活文化",
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
      label: "近世〜現代民間生活史",
      precision: "period",
    },
    places: [{ name: "淡島神社（門司）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 36,
          endLine: 44,
          quote:
            "針塚、水蛭子社、稲荷関係の小祠、境内の複数の小さな祭祀施設。針供養は、日常生活で使われた針への感謝と、裁縫の上達を祈る行事である。針を単なる道具として扱うのではなく、長く使ったものに対して供養を行う生活文化が残っている。",
        },
      },
    ],
    createdAt: "2026-11-01T10:10:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-003",
    statement:
      "淡島神社は国家神話や武家権威よりも地域住民の身体や生活に近い信仰を中心とし、医薬・安産・針供養という異なる生活領域が少名比古那神を中心に複合した生活信仰拠点を形成している。",
    subject: { name: "淡島神社（門司）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "身体・安産・針供養の複合的生活信仰構造",
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
      label: "近世〜現代生活景観",
      precision: "broad-range",
    },
    places: [{ name: "淡島神社（門司）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 45,
          endLine: 52,
          quote:
            "淡島神社は、国家的な神話や武家の権威よりも、地域の人々の身体や暮らしに近い信仰を中心にしている。特に注目したいのは、医薬・安産・針仕事という異なる生活領域が、少名比古那神を中心にまとまっている点。",
        },
      },
    ],
    createdAt: "2026-11-01T10:20:00Z",
  },

  // 2. 和布刈神社 (5件)
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-004",
    statement:
      "関門海峡最狭部に臨む和布刈神社は祭神を瀬織津姫とし、神功皇后三韓親征からの帰還伝承および安曇磯良から潮干珠・潮満珠を授与された由緒伝承を伝える。",
    subject: { name: "和布刈神社", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "瀬織津姫祭神・神功皇后帰還伝承と安曇磯良潮珠由緒",
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
      label: "神功皇后・海人族伝承期〜古代",
      precision: "broad-range",
    },
    places: [{ name: "和布刈神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 57,
          endLine: 64,
          quote:
            "祭神は瀬織津姫とされる。神社の創建については、神功皇后の三韓征伐からの帰還に関係する伝承がある。安曇磯良から潮の満干を司る玉を受け取ったという伝承も伝わる。これらは神社の由緒・伝承として扱い、創建年代や出来事の歴史的事実とは区別する。",
        },
      },
    ],
    createdAt: "2026-11-01T10:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-005",
    statement:
      "和布刈神社では旧暦大晦日深夜から元旦未明にかけて神職が海に入り海底の和布を刈り取って神前に供える「和布刈神事」が伝承され、和銅3年（710年）の記録が現れるとする由緒を持つ。",
    subject: { name: "和布刈神社", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "和銅三年記録伝承と旧暦年越和布刈神事",
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
      label: "和銅3年（710年伝承）〜現代神事",
      precision: "broad-range",
    },
    places: [{ name: "和布刈神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 65,
          endLine: 78,
          quote:
            "旧暦の大晦日深夜から元旦未明にかけて、神職が海に入り、海底の和布を刈り取って神前に供える。龍神と天女が神事を見守る。龍神が潮を鎮め、海上に道をつくる。神職が海に入り、和布を刈り取る。神事が終わると潮が戻り、龍神は龍宮へ帰る。和銅3年（710年）の記録に神事が現れるという。",
        },
      },
    ],
    createdAt: "2026-11-01T10:40:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-006",
    statement:
      "和布刈神社の祭神・瀬織津姫は大祓詞の祓戸四神の一柱（川から海へ罪穢れを流し去る神）として位置づけられるが、大祓詞の教義受容と関門海峡における古代からの現地海上祭祀の起源は峻別して検討する必要がある。",
    subject: { name: "和布刈神社", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "大祓詞祓戸神（瀬織津姫）受容と海峡原初海上祭祀の峻別",
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
      label: "律令大祓詞成立期〜古代祭祀層",
      precision: "broad-range",
    },
    places: [{ name: "和布刈神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 79,
          endLine: 86,
          quote:
            "瀬織津姫は大祓詞に登場する祓戸四神の一柱として知られる。祓戸四神は、罪穢れを川・海へ流し、飲み込み、吹き払い、遠くへ運び去るという祓いの過程を担う神々として説明される。和布刈神社の海との結びつきを考えるうえで興味深いが、大祓詞に登場することと、和布刈の地で古代から同じ祭祀が行われていたことは同一ではない。",
        },
      },
    ],
    createdAt: "2026-11-01T10:50:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-007",
    statement:
      "和布刈神社は境内の鳥居・灯籠が関門海峡へ直面し、海側の注連縄が掛けられた巨岩や対岸への視線軸を備え、社殿建物だけでなく海峡空間そのものが祭祀景観の一体要素として構成されている。",
    subject: { name: "和布刈神社", type: "Place" },
    predicate: "spatial_layout",
    object: {
      kind: "entity",
      entity: {
        name: "海峡直面鳥居・灯籠・海中注連縄岩と海峡祭祀空間",
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
      label: "古代海上祭祀空間〜現代景観",
      precision: "broad-range",
    },
    places: [{ name: "和布刈神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 87,
          endLine: 98,
          quote:
            "鳥居が関門海峡に向かっている。海側に大きな岩があり、注連縄が掛けられている。灯籠も海峡を向いている。対岸にも鳥居が見える。特に印象的だったのは、境内の視線が海へ向かっていること。神社の建物だけを中心にした空間ではなく、海そのものが祭祀景観の一部になっているように感じられた。",
        },
      },
    ],
    createdAt: "2026-11-01T11:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-008",
    statement:
      "和布刈神社境内には現代の海洋散骨参拝所が設けられ、古代の航海安全や潮流祭祀を基層としつつ、海を信仰・供養の対象とする現代社会の宗教機能を柔軟に取り込んでいる。",
    subject: { name: "和布刈神社", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "海洋散骨参拝所併設と海神供養機能の現代展開",
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
      label: "現代（平成〜令和期）",
      precision: "period",
    },
    places: [{ name: "和布刈神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 93,
          endLine: 101,
          quote:
            "海洋散骨参拝所が設けられている。境内の建築や授与所には現代的な意匠が見られる。海洋散骨参拝所は現代の供養の仕組みであり、古代の海上祭祀とは区別する必要がある。ただ、海を信仰・供養の対象とする場所として、現在の社会に合わせた機能を取り込んでいる点は興味深い。",
        },
      },
    ],
    createdAt: "2026-11-01T11:10:00Z",
  },

  // 3. 甲宗八幡宮 (5件)
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-009",
    statement:
      "甲宗八幡宮は1924年奉納板によれば第一殿に応神天皇、第二殿に神功皇后、第三殿に宗像三女神（市杵島姫命・田心姫命・湍津姫命）を祀り、関門海峡の立地において八幡信仰と宗像信仰が複合している。",
    subject: { name: "甲宗八幡宮", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "応神天皇・神功皇后・宗像三女神の三殿配祀と海峡八幡宗像複合",
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
      label: "大正13年（1924年奉納板）〜現代祭神構成",
      precision: "broad-range",
    },
    places: [{ name: "甲宗八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 114,
          endLine: 126,
          quote:
            "現地の1924年の奉納板によれば、第一殿：応神天皇、第二殿：神功皇后、第三殿：市杵島姫命・田心姫命・湍津姫命を祀る。八幡信仰に宗像三女神が加わっている点は、海峡に面した立地を考えると興味深い。ただし、第三殿の祭神構成がいつ成立したかは、この奉納板だけでは分からない。",
        },
      },
    ],
    createdAt: "2026-11-01T11:20:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-010",
    statement:
      "甲宗八幡宮は貞観2年（860年）に清和天皇勅命により大宰府清原真人峯成が神功皇后着用の甲冑を神体として祀り「異国への西門を守る神」として創建されたとする由緒伝承を伝える。",
    subject: { name: "甲宗八幡宮", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "貞観二年大宰府清原峯成勅命創建伝承と神功皇后甲冑神体由緒",
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
      label: "平安時代前期・貞観2年（860年伝承）",
      precision: "period",
    },
    places: [{ name: "甲宗八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 128,
          endLine: 135,
          quote:
            "清和天皇の貞観2年（860年）、大宰府の清原真人峯成が勅命を受け、神功皇后の着用した甲冑を神体として祀ったと記されていた。「異国への西門を守る神」として説明され、門司の海上交通と対外関係を意識した由緒になっている。これは神社の伝承であり、甲冑の実在や創建時の事情を直接証明するものではない。",
        },
      },
    ],
    createdAt: "2026-11-01T11:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-011",
    statement:
      "甲宗八幡宮は北九州市指定文化財の古文書8点を所蔵し、1272年『門司関六ヶ郷総田数注文写』や1336年『足利尊氏寄進状』など中世における土地支配および武家権力の軍事・政治祈願との直接の結合を示す。",
    subject: { name: "甲宗八幡宮", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "門司関六ヶ郷総田数注文写・足利尊氏寄進状と中世武家土地支配拠点",
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
      label: "鎌倉時代（文永9年/1272年）〜南北朝期（建武3年/1336年）",
      precision: "broad-range",
    },
    places: [{ name: "甲宗八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 136,
          endLine: 156,
          quote:
            "北九州市指定文化財として、神社文書8点が指定されている。門司関六ヶ郷総田数注文写（1272年）：門司の六ヶ郷における土地の規模や構成を記録したもの。神社が単なる信仰施設ではなく、土地や地域社会の構造と深く関係していたことを考える手掛かりになる。足利尊氏寄進状（1336年）：多々良浜の戦いに勝利した後、尊氏が東上する際に、戦勝と子孫繁栄を祈って土地を寄進したとされる。これは八幡信仰が武家の政治・軍事と結びついていたことを示す史料である。",
        },
      },
    ],
    createdAt: "2026-11-01T11:40:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-012",
    statement:
      "甲宗八幡宮境内には平知盛の墓と伝えられる石塔が保存され、壇ノ浦合戦や門司城・彦島拠点の記憶を伝え、1953年の門司水害で筆立山から流出し現在地へ移設された歴史的経緯を持つ。",
    subject: { name: "甲宗八幡宮", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "平知盛墓伝承石塔・壇ノ浦落人伝承と昭和28年水害移設",
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
      label: "平安末期（文治元年/1185年伝承）〜昭和28年（1953年水害移設）",
      precision: "broad-range",
    },
    places: [{ name: "甲宗八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 157,
          endLine: 165,
          quote:
            "境内には平知盛の墓と伝えられる石塔がある。現地の説明板によれば、知盛は門司・彦島周辺に拠点を置き、門司城を築いたとされる。壇ノ浦の戦いで敗れ、入水したという。ただし、境内の石塔が実際に知盛の墓であるかは確定していない。1953年の門司水害で筆立山から流れ、現在地に移されたという伝承も含め、地域の記憶として扱うべきである。",
        },
      },
    ],
    createdAt: "2026-11-01T11:50:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-013",
    statement:
      "甲宗八幡宮には雨乞いに関わる市指定無形民俗文化財「楠原踊」が伝承され、謡や狂言の要素を持つ中世芸能の痕跡を現代の地域共同体祭祀の中に保持している。",
    subject: { name: "甲宗八幡宮", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "楠原踊（雨乞い民俗芸能・市指定文化財）と中世芸能痕跡",
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
      label: "中世芸能起源〜現代民俗文化財",
      precision: "broad-range",
    },
    places: [{ name: "甲宗八幡宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 166,
          endLine: 173,
          quote:
            "雨乞いに関係する楠原踊が伝わる。市指定無形民俗文化財であり、謡や狂言の要素を持つ芸能だったとされる。中世の芸能の痕跡を残すものとして興味深い。神社が地域の祭祀だけでなく、芸能や共同体の活動を受け止めてきたことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-01T12:00:00Z",
  },

  // 4. 戸上神社 (5件)
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-014",
    statement:
      "戸上神社は現在の祭神を天御中主神・伊邪那岐神・伊邪那美神ほか十七柱とし、戸上山頂の上宮と山麓の本宮が一体となった山岳霊峰祭祀の構成を持つ。",
    subject: { name: "戸上神社（本宮・上宮遥拝）", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "天御中主神・伊邪那岐・伊邪那美祭祀と戸上山頂上宮・山麓本宮構造",
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
      label: "明治以降現在祭神体系〜現代",
      precision: "broad-range",
    },
    places: [{ name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 190,
          endLine: 206,
          quote:
            "天御中主神、伊邪那岐神、伊邪那美神、その他十七柱を祀る。上宮もあり、山頂と麓の社が一体となった構成を持つ。天御中主神・伊邪那岐神・伊邪那美神という天地創成・国生みの神々は、現在の祭神体系としては戸上山の霊峰的な性格とよく調和している。しかし、現在の祭神構成が創建当初から存在したと判断することはできない。",
        },
      },
    ],
    createdAt: "2026-11-01T12:10:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-015",
    statement:
      "戸上神社石碑由緒は寛平年間（889〜898年）神託による創建と枝折戸奉戴、細川忠利・小笠原忠真による社殿造営や社領寄進、参勤交代大名の大里宿交通安全祈願所を伝え、旧柳郷氏子が古来「戸上権現」と称していた神仏習合史を明記する。",
    subject: { name: "戸上神社（本宮・上宮遥拝）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "寛平神託由緒・藩主社殿寄進・大里宿祈願所と戸上権現神仏習合名",
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
      label: "平安寛平（889〜898年）〜江戸期細川・小笠原藩政期",
      precision: "broad-range",
    },
    places: [{ name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 207,
          endLine: 219,
          quote:
            "宇多天皇の寛平年間（889～898年）、神託によって創建。御霊代を枝折戸に奉戴して山頂に奉安したことから戸上神社と称した。江戸時代には細川氏・小笠原氏の尊崇を受け、社殿造営や社領寄進があった。九州諸大名が参勤交代で大里の宿場を通過する際、武運長久や海陸交通安全を祈願した。旧柳郷（大里）の氏子は古来「戸上権現」と称していた。",
        },
      },
    ],
    createdAt: "2026-11-01T12:20:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-016",
    statement:
      "1696年『戸上山三大社権現治願覚書』によれば、根二の海上で大里漁師が網から神像引揚 → 湧水地「神島井」奉斎 → 伊古野家「鳥井ノ宮」 → 前立山柳之口氏神 → 山頂奉安 → 英彦山山伏六坊招来 → 山頂観音を山麓満隆寺へ移設という、海辺集落から霊峰山頂・修験への聖域遷移モデルが具体的に記されている。",
    subject: { name: "戸上神社（本宮・上宮遥拝）", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "1696年覚書にみる海中神像引揚・神島井・氏神から山頂上宮英彦山修験への聖域遷移",
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
      label: "元禄9年（1696年史料覚書）伝承体系",
      precision: "period",
    },
    places: [{ name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 220,
          endLine: 242,
          quote:
            "1696年『戸上山三大社権現治願覚書』。根二の海上で、大里の漁師・大江繁松が網から神像を得る。馬寄村の伊古野大学にも神託があり、現地で神像を確認する。清水の湧く場所「神島井」で奉斎する。伊古野家の屋敷に移し、鳥井ノ宮として祀る。馬寄村の一之坂の前立山に社を設け、柳之口の氏神とする。戸上山頂へ奉安する。英彦山から六人の山伏を招き、上宮に配置する。山頂の観音を山麓へ移し、満隆寺を設けたとする。海辺で神像を得て、湧水、屋敷、集落の氏神を経て、山頂へ移していくという伝承になっている。",
        },
      },
    ],
    createdAt: "2026-11-01T12:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-017",
    statement:
      "戸上山麓の満隆寺（常学院）縁起『戸上山満隆寺記』（18世紀成立）では海から得たものを観自在菩薩（観音）に似た木片として語っており、1696年覚書の神像伝承と同一の由緒が神仏習合の中で神像と観音像の双方の文脈で重層的に解釈されていた。",
    subject: { name: "戸上神社（本宮・上宮遥拝）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "満隆寺観音信仰・観音木片伝承と神像由緒の神仏習合的二重解釈",
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
      label: "近世（宝暦2年/1752年以前満隆寺記）",
      precision: "period",
    },
    places: [{ name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 243,
          endLine: 256,
          quote:
            "戸上山の山麓には、満隆寺（後の常学院）という寺院があった。1752年以前に成立したとされる『戸上山満隆寺記』では、海から得たものを観自在菩薩の像に似た木片として語っている。1696年の覚書では神像とされるものが、寺院側の縁起では観音像として説明されている。これは、同じ由緒が神と仏の異なる言葉で語られていたことを示す。さらに、英彦山系の山伏六坊の伝承があることから、戸上山は神社単独ではなく、修験・観音信仰・山岳祭祀が一体となった宗教空間だった可能性が高い。",
        },
      },
    ],
    createdAt: "2026-11-01T12:40:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-018",
    statement:
      "戸上神社の古層は現在の記紀創世神（イザナギ・イザナミ・天御中主神）ではなく、海辺集落の漂着神像・湧水・集落氏神を基底とし、山頂上宮・英彦山修験山伏・満隆寺観音が重畳した多層的形成史として捉えるのが適切である。",
    subject: { name: "戸上神社（本宮・上宮遥拝）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "記紀祭神先行批判と海辺・湧水・集落・山岳修験多層形成モデル",
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
      label: "古代〜中世修験〜明治祭神改変期",
      precision: "broad-range",
    },
    places: [{ name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 271,
          endLine: 291,
          quote:
            "現在のイザナギ・イザナミ・天御中主神が、創建当初から祀られていたかは確認できない。むしろ、古い伝承では神像の正体が一定しておらず、後世の寺院縁起では観音として語られている。戸上山の古層を考えるうえでは、海辺の集落、神像が発見されたという伝承、湧水のある場所での奉斎、集落の氏神、山頂の上宮、山伏による修行、山麓の観音信仰と満隆寺の構造が重要になる。戸上神社は、海と山、地域社会と修験、神と仏が重なって形成された信仰空間として捉えるのが適切である。",
        },
      },
    ],
    createdAt: "2026-11-01T12:50:00Z",
  },

  // 5. 門司四社総合比較 (1件)
  {
    schemaVersion: "0.2.0",
    id: "claim-moji-019",
    statement:
      "門司の四社は「淡島神社（生活文化・身体回復・民間信仰）」「和布刈神社（関門海峡潮流・海上祭祀・祓戸神話）」「甲宗八幡宮（中世武家・土地支配・地域芸能）」「戸上神社（海中神像・湧水・山岳修験・神仏習合）」とそれぞれ直交する固有の歴史的性格を持ち、関門海峡の複合的祭祀景観を分担・形成している。",
    subject: { name: "門司の神社探索記録", type: "Concept" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "門司四社の直交的性格分化（生活・海峡・武家・山岳）と複合祭祀景観",
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
      label: "古代〜中世〜近世〜現代複合史",
      precision: "broad-range",
    },
    places: [
      { name: "淡島神社（門司）", role: "subject_place" },
      { name: "和布刈神社", role: "subject_place" },
      { name: "甲宗八幡宮", role: "subject_place" },
      { name: "戸上神社（本宮・上宮遥拝）", role: "subject_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 294,
          endLine: 328,
          quote:
            "淡島神社：医薬・安産・針供養（女性の身体と生活／民間信仰）。和布刈神社：海・潮・祓い（海峡・航海・漁撈／海上祭祀と潮流）。甲宗八幡宮：八幡・武家・宗像（土地支配・中世の政治／古文書・寄進・地域芸能）。戸上神社：山・神像・権現・観音（海辺の集落と山岳信仰／神像伝承・上宮・修験）。四社を比較すると、門司の信仰は一つの神話体系だけでは説明できない。海峡を通る人々、海辺で生活する人々、山を信仰する人々、武家や藩主、地域の共同体が、それぞれの時代に信仰の形を重ねてきたと考えられる。",
        },
      },
    ],
    createdAt: "2026-11-01T13:00:00Z",
  },
];

const connections = [
  {
    id: "connection-moji-mekari-sea-channel",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "MEKARI / KANMON STRAIT / TIDAL RITUAL",
    title: "関門海峡の潮流掌握と和布刈海上祭祀（自然基層と祓戸神話）",
    summary:
      "関門海峡最狭部（早鞆の瀬戸）の急潮に直面する和布刈神社の海中注連縄岩・和布刈神事と、甲宗八幡宮の異国西門防備・宗像三女神合祀を、海峡交通と潮待ち海神祭祀の観点から結ぶ。",
    spotIds: [
      "spot-mekari-jinja",
      "spot-koso-hachimangu",
    ],
    claimIds: [
      "claim-moji-004",
      "claim-moji-005",
      "claim-moji-006",
      "claim-moji-007",
      "claim-moji-008",
      "claim-moji-009",
    ],
    concepts: [
      "和布刈神社",
      "関門海峡（早鞆の瀬戸）",
      "和布刈神事（和銅3年記録伝承）",
      "瀬織津姫",
      "海中注連縄岩",
      "甲宗八幡宮宗像三女神",
      "潮流掌握と海神祭祀",
    ],
    facets: [
      { id: "ritual", label: "和布刈神事・海神祭祀", weight: 5 },
      { id: "nature", label: "関門海峡・急潮流", weight: 5 },
      { id: "myth", label: "安曇磯良・潮満珠伝承", weight: 4 },
    ],
    lensId: "religion",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-mekari-tidal-ritual",
        label: "古代関門海峡の潮流祭祀から和布刈神事への展開",
        range: "古代（和銅3年伝承）〜現代",
        mapLabel: "早鞆の瀬戸和布刈海上祭祀と甲宗八幡宗像合祀",
        mapLayer: "maritime",
        spotIds: [
          "spot-mekari-jinja",
          "spot-koso-hachimangu",
        ],
        claimIds: [
          "claim-moji-005",
          "claim-moji-007",
          "claim-moji-009",
        ],
      },
    ],
  },
  {
    id: "connection-moji-tonogami-sacred-landscape",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "TONOGAMI / SACRED SHIFT / SHUGENDO",
    title: "戸上山の聖域形成史（海中神像から山頂・英彦山修験・満隆寺観音への遷移）",
    summary:
      "1696年『戸上山三大社権現治願覚書』に基づき、根二海上での網引き神像引揚から清水湧く神島井、鳥井ノ宮、前立山柳之口氏神を経て戸上山頂上宮・英彦山山伏六坊招来、満隆寺観音堂へ至る、地域生活圏から山岳霊峰聖域への重層的遷移モデルを検証する。",
    spotIds: [
      "spot-tonogami-jinja",
      "spot-awashima-jinja-moji",
    ],
    claimIds: [
      "claim-moji-014",
      "claim-moji-015",
      "claim-moji-016",
      "claim-moji-017",
      "claim-moji-018",
    ],
    concepts: [
      "戸上神社",
      "戸上山（独立峰）",
      "1696年覚書",
      "海中神像引揚伝承",
      "神島井湧水",
      "前立山柳之口氏神",
      "山頂上宮",
      "英彦山山伏六坊",
      "満隆寺（常学院）観音",
      "聖域遷移モデル",
    ],
    facets: [
      { id: "ritual", label: "英彦山修験・山岳登嶺", weight: 5 },
      { id: "myth", label: "海中漂着神像・観音木片伝承", weight: 5 },
      { id: "spatial", label: "湧水・氏神・山頂聖域遷移", weight: 5 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-tonogami-sacred-shift",
        label: "元禄覚書にみる海中神像引揚から山頂英彦山修験・満隆寺観音の展開",
        range: "中世〜元禄9年（1696年）〜江戸期",
        mapLabel: "戸上山海中神像遷移と修験観音習合景観",
        mapLayer: "religious",
        spotIds: [
          "spot-tonogami-jinja",
          "spot-awashima-jinja-moji",
        ],
        claimIds: [
          "claim-moji-015",
          "claim-moji-016",
          "claim-moji-017",
        ],
      },
    ],
  },
  {
    id: "connection-moji-medieval-warrior-governance",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "KOSO HACHIMAN / MONOSEKI / WARRIOR RULE",
    title: "門司関の中世土地支配と八幡・宗像信仰（甲宗八幡宮中世文書と芸能）",
    summary:
      "1272年『門司関六ヶ郷総田数注文写』や1336年『足利尊氏寄進状』に見る中世武家の土地支配・戦勝祈願拠点としての甲宗八幡宮と、平知盛墓伝承石塔、雨乞い芸能「楠原踊」（市指定無形民俗文化財）の重層性を捉える。",
    spotIds: [
      "spot-koso-hachimangu",
      "spot-mekari-jinja",
    ],
    claimIds: [
      "claim-moji-009",
      "claim-moji-010",
      "claim-moji-011",
      "claim-moji-012",
      "claim-moji-013",
    ],
    concepts: [
      "甲宗八幡宮",
      "門司関六ヶ郷総田数注文写（1272年）",
      "足利尊氏寄進状（1336年）",
      "平知盛墓伝承石塔",
      "壇ノ浦合戦の記憶",
      "楠原踊（雨乞い民俗芸能）",
      "中世武家土地支配",
    ],
    facets: [
      { id: "politics", label: "中世文書・土地支配・尊氏寄進", weight: 5 },
      { id: "ritual", label: "八幡信仰・楠原踊", weight: 5 },
      { id: "history", label: "門司関・平知盛伝承", weight: 4 },
    ],
    lensId: "politics",
    topicId: "politics-governance",
    eras: [
      {
        id: "era-koso-medieval-documents",
        label: "鎌倉・南北朝期門司関文書と八幡武家支配",
        range: "文永9年（1272年）〜建武3年（1336年）〜近世",
        mapLabel: "甲宗八幡宮中世文書と門司関土地支配層",
        mapLayer: "domain",
        spotIds: [
          "spot-koso-hachimangu",
          "spot-mekari-jinja",
        ],
        claimIds: [
          "claim-moji-011",
          "claim-moji-012",
          "claim-moji-013",
        ],
      },
    ],
  },
  {
    id: "connection-moji-four-shrines-landscape-comparison",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "FOUR SHRINES / FUNCTIONAL DIVISION / STRATIGRAPHY",
    title: "関門海峡四社における祭祀景観の性格分化（生活・海峡・武家・山岳）",
    summary:
      "淡島神社の生活文化・針供養、和布刈神社の海峡潮流祭祀、甲宗八幡宮の中世武家土地支配、戸上神社の修験神仏習合という、単一神話に還元できない門司の四極構造を横断的に比較し、関門海峡の重層的祭祀景観を捉える。",
    spotIds: [
      "spot-awashima-jinja-moji",
      "spot-mekari-jinja",
      "spot-koso-hachimangu",
      "spot-tonogami-jinja",
    ],
    claimIds: [
      "claim-moji-001",
      "claim-moji-003",
      "claim-moji-007",
      "claim-moji-011",
      "claim-moji-016",
      "claim-moji-019",
    ],
    concepts: [
      "淡島神社（生活信仰）",
      "和布刈神社（海峡潮流祭祀）",
      "甲宗八幡宮（中世武家支配）",
      "戸上神社（山岳修験・神像遷移）",
      "関門海峡四極構造",
      "祭祀景観の性格分化",
    ],
    facets: [
      { id: "ritual", label: "四社の機能的分化", weight: 5 },
      { id: "spatial", label: "海峡・集落・山岳空間", weight: 5 },
      { id: "history", label: "重層的地層動態", weight: 5 },
    ],
    lensId: "religion",
    topicId: "religion-concepts",
    eras: [
      {
        id: "era-moji-four-shrines-comparison",
        label: "門司四社における直交的祭祀景観の共存と展開",
        range: "古代〜現代",
        mapLabel: "門司関門海峡四社の複合祭祀景観",
        mapLayer: "religious",
        spotIds: [
          "spot-awashima-jinja-moji",
          "spot-mekari-jinja",
          "spot-koso-hachimangu",
          "spot-tonogami-jinja",
        ],
        claimIds: [
          "claim-moji-003",
          "claim-moji-007",
          "claim-moji-011",
          "claim-moji-016",
          "claim-moji-019",
        ],
      },
    ],
  },
];

const newJourney = {
  id: "journey-moji",
  label: "門司（関門海峡と古層祭祀）",
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
