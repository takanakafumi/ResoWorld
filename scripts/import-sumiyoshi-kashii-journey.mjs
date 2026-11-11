import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const sumiyoshiDocPath = path.join(
  root,
  "旅行記",
  "2026-11-11_博多住吉神社探索記録（住吉三神・海神族・古代博多湾の祭祀景観）.md",
);
const kashiiDocPath = path.join(
  root,
  "旅行記",
  "2026-11-11_香椎宮と香椎潟の歴史探索記録.md",
);

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const sumiyoshiContent = fs.readFileSync(sumiyoshiDocPath, "utf-8");
const sumiyoshiSha256 = crypto
  .createHash("sha256")
  .update(sumiyoshiContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const kashiiContent = fs.readFileSync(kashiiDocPath, "utf-8");
const kashiiSha256 = crypto
  .createHash("sha256")
  .update(kashiiContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const docSumiyoshiId = "doc-hakata-sumiyoshi-2026-11-11";
const docKashiiId = "doc-kashii-kashiigata-2026-11-11";

const newDocuments = [
  {
    id: docSumiyoshiId,
    title: "2026年11月11日 博多住吉神社 探索記録（住吉三神・海神族・古代博多湾の祭祀景観）",
    path: "旅行記/2026-11-11_博多住吉神社探索記録（住吉三神・海神族・古代博多湾の祭祀景観）.md",
    sha256: sumiyoshiSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: "2026-11-11",
    documentedAt: "2026-11-11",
    dateStatus: "known",
  },
  {
    id: docKashiiId,
    title: "2026年11月11日 香椎宮と香椎潟の歴史探索記録（香椎廟・万葉歌碑・御島神社・訶志比宮址）",
    path: "旅行記/2026-11-11_香椎宮と香椎潟の歴史探索記録.md",
    sha256: kashiiSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: "2026-11-11",
    documentedAt: "2026-11-11",
    dateStatus: "known",
  },
];

const spots = [
  // 1. 博多住吉神社（未訪問候補地から訪問済みへ昇格）
  {
    id: "spot-sumiyoshi-hakata",
    name: "筑前国一宮 住吉神社",
    region: "福岡県 · 福岡市博多区住吉",
    kind: "神社",
    latitude: 33.5861,
    longitude: 130.4142,
    claimIds: [
      "claim-marine-deity-001",
      "claim-marine-deity-006",
      "claim-marine-deity-007",
      "claim-marine-deity-008",
      "claim-marine-deity-012",
      "claim-sumiyoshi-001",
      "claim-sumiyoshi-002",
      "claim-sumiyoshi-003",
      "claim-sumiyoshi-004",
      "claim-sumiyoshi-005",
      "claim-sumiyoshi-006",
      "claim-sumiyoshi-008",
      "claim-sumiyoshi-009",
      "claim-sumiyoshi-010",
      "claim-sumiyoshi-011",
      "claim-sumiyoshi-012",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 2. 博多住吉神社 境内 志賀神社
  {
    id: "spot-sumiyoshi-shiga-sha",
    name: "博多住吉神社 境内 志賀神社",
    region: "福岡県 · 福岡市博多区住吉",
    kind: "神社・境内社",
    latitude: 33.5858,
    longitude: 130.414,
    claimIds: ["claim-sumiyoshi-007", "claim-sumiyoshi-008", "claim-sumiyoshi-010"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 3. 香椎宮 本社
  {
    id: "spot-kashii-gu",
    name: "香椎宮（香椎廟）",
    region: "福岡県 · 福岡市東区香椎",
    kind: "神社・勅祭社",
    latitude: 33.6558,
    longitude: 130.4533,
    claimIds: [
      "claim-kashii-001",
      "claim-kashii-002",
      "claim-kashii-003",
      "claim-kashii-013",
      "claim-kashii-015",
      "claim-kashii-016",
      "claim-kashii-017",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 4. 香椎宮 頓宮
  {
    id: "spot-kashii-tongu",
    name: "香椎宮 頓宮",
    region: "福岡県 · 福岡市東区香椎",
    kind: "神社・御旅所",
    latitude: 33.6552,
    longitude: 130.4439,
    claimIds: ["claim-kashii-008", "claim-kashii-010", "claim-kashii-015", "claim-kashii-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 5. 香椎潟 万葉歌碑
  {
    id: "spot-kashiigata-manyo-monument",
    name: "香椎潟 万葉歌碑",
    region: "福岡県 · 福岡市東区香椎",
    kind: "記念碑・文学遺跡",
    latitude: 33.6551,
    longitude: 130.444,
    claimIds: ["claim-kashii-008", "claim-kashii-009", "claim-kashii-010", "claim-kashii-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 6. 濱男神社
  {
    id: "spot-hamao-shrine",
    name: "濱男神社",
    region: "福岡県 · 福岡市東区香椎浜",
    kind: "神社・境外末社",
    latitude: 33.6588,
    longitude: 130.4372,
    claimIds: ["claim-kashii-011", "claim-kashii-012", "claim-kashii-015", "claim-kashii-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 7. 御島神社
  {
    id: "spot-mishima-shrine",
    name: "御島神社（香椎浜海上の鳥居）",
    region: "福岡県 · 福岡市東区香椎浜",
    kind: "神社・海上祭祀",
    latitude: 33.6608,
    longitude: 130.4328,
    claimIds: ["claim-kashii-011", "claim-kashii-012", "claim-kashii-015", "claim-kashii-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 8. 古宮大明神社・訶志比宮址
  {
    id: "spot-kashii-furumiya-shrine",
    name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）",
    region: "福岡県 · 福岡市東区香椎",
    kind: "神社・宮址伝承地",
    latitude: 33.6563,
    longitude: 130.4565,
    claimIds: [
      "claim-kashii-004",
      "claim-kashii-005",
      "claim-kashii-006",
      "claim-kashii-007",
      "claim-kashii-015",
      "claim-kashii-016",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  // 9. 巻尾神社
  {
    id: "spot-kashii-makioto-shrine",
    name: "巻尾神社",
    region: "福岡県 · 福岡市東区香椎",
    kind: "神社・末社",
    latitude: 33.6575,
    longitude: 130.4552,
    claimIds: ["claim-kashii-014", "claim-kashii-015", "claim-kashii-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const claims = [
  // ===================== 住吉神社 Claims =====================
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-001",
    statement:
      "住吉神社の祭神は底筒男命・中筒男命・表筒男命の住吉三神であり、『古事記』では伊邪那岐命が黄泉国帰還後に筑紫の日向の橘の小門の阿波岐原で禊祓を行った際に誕生した海・航海・禊祓を司る神格とされる。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "worships",
    object: {
      kind: "entity",
      entity: { name: "住吉三神（底筒男命・中筒男命・表筒男命）", type: "Deity" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "神話伝承時代", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 43,
          endLine: 57,
          quote:
            "住吉神社の祭神は住吉三神。底筒男命、中筒男命、表筒男命。『古事記』では、伊邪那岐命が黄泉国から帰還した後、筑紫の日向の橘の小門の阿波岐原で禊を行った際に生まれた神々として記されている。住吉三神は海・航海・禊祓に関係する神格として知られる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-002",
    statement:
      "博多住吉神社は現地案内板において全国約2,000社ある住吉神社の始源、式内名神大社、筑前国一之宮、旧官幣小社と説明され、古代から国家的な祭祀の対象となってきた格式を持つ。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "holds_status",
    object: {
      kind: "entity",
      entity: { name: "筑前国一之宮・式内名神大社・全国住吉神社始源", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜中世", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 61,
          endLine: 73,
          quote:
            "現地案内板では、住吉神社について以下のように説明されていた。全国約2,000社ある住吉神社の始源、式内名神大社、筑前国一之宮、旧官幣小社。住吉神社は、古代から国家的な祭祀の対象となってきた格式の高い神社である。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-003",
    statement:
      "住吉神社本殿は『住吉造』と呼ばれる建築様式で、元和9年（1623年）に福岡藩主黒田長政によって再建された国の重要文化財である。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "features",
    object: {
      kind: "entity",
      entity: { name: "住吉造本殿（1623年黒田長政再建・国指定重要文化財）", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "江戸時代初期（元和9年・1623年）", precision: "period" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 77,
          endLine: 86,
          quote:
            "本殿は『住吉造』と呼ばれる独特の建築様式。現地案内板によると、元和9年（1623年）に黒田長政によって再建されたもので、重要文化財に指定されている。現在の建築は近世のものだが、住吉造という建築様式を伝える重要な遺構である。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-004",
    statement:
      "住吉神社には弥生時代の青銅祭器である銅戈6口・銅矛5口が伝来し福岡県文化財に指定されており、北部九州・博多湾岸における古代青銅器祭祀・首長権威の古層を示唆する。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "preserves",
    object: {
      kind: "entity",
      entity: { name: "弥生時代青銅祭器（銅戈6口・銅矛5口、福岡県指定文化財）", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "弥生時代中期〜後期", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 94,
          endLine: 110,
          quote:
            "住吉神社には、以下の青銅器が伝わっている。銅戈 6口、銅矛 5口。いずれも弥生時代の青銅祭器とされ、福岡県の文化財に指定されている。北部九州では、青銅器が単なる武器ではなく、祭祀や首長の権威を示す器物として用いられた。住吉神社に弥生時代の青銅祭器が伝わっていることは、この地域の古い祭祀を考えるうえで興味深い。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-005",
    statement:
      "銅戈・銅矛は出土場所や出土状態が明らかでなく、現在の神社境内で使用されたと断定したり、弥生時代に現在の住吉三神祭祀が成立していた直接証拠とは扱えないため、成立過程の慎重な分離が必要である。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: { name: "青銅祭器出土不明性と住吉三神成立時期の時代層分離", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "qualified" },
    historicalTime: { kind: "named", label: "弥生時代〜古代祭祀成立期", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 112,
          endLine: 133,
          quote:
            "ただし、出土地点が不明であるため、これらの青銅器が現在の住吉神社境内で使用されていたと断定することはできない。また、青銅器の存在だけから、弥生時代に現在と同じ住吉三神の祭祀が成立していたと判断することもできない。弥生時代の青銅祭器、古代の海上祭祀、住吉三神の神格、律令国家による神社制度を同じ時代のものとして扱わず、それぞれの成立過程を検討する必要がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-006",
    statement:
      "文化財案内板によると中世末頃までは博多湾が現在の住吉神社付近まで入り込み神社周辺が河口に突き出した地形であり、海や河口に近い立地環境が海・航海・禊祓を司る住吉祭祀の性格を考える重要手掛かりとなる。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: { name: "中世末博多湾岸旧海岸線・河口立地環境", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜中世末期", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 141,
          endLine: 161,
          quote:
            "文化財案内板には、中世末頃までは博多湾が現在の住吉神社付近まで入り込み、神社の周辺が河口に突き出した場所だったという説明があった。現在は市街地の内陸に位置しているが、かつては海に近い場所だった。住吉三神が航海・海上交通・禊祓に関係する神であることを踏まえると、海辺に近い立地は祭祀の性格を考えるうえで意味を持つ。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-007",
    statement:
      "境内の志賀神社には豊後国久住の志賀氏が志賀大神（綿津見神）を氏神として奉納した『志賀神社福分小判』があり、案内板では住吉大神と志賀大神がともに伊邪那岐命の禊で誕生した水・海を司る神と説明される。",
    subject: { name: "博多住吉神社 境内 志賀神社", type: "Place" },
    predicate: "preserves",
    object: {
      kind: "entity",
      entity: { name: "志賀神社福分小判（豊後久住志賀氏奉納）と志賀大神祭祀", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近現代〜信仰伝承", precision: "broad-range" },
    places: [
      { name: "筑前国一宮 住吉神社", role: "observed_place" },
      { name: "博多住吉神社 境内 志賀神社", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 173,
          endLine: 187,
          quote:
            "境内の志賀神社には『志賀神社福分小判』が奉納されている。案内板によれば、豊後国久住の志賀氏が志賀大神を氏神としており、宝くじ当選への報恩として奉納したもの。また、案内板では住吉大神と志賀大神について、伊弉諾命の禊によって誕生した神々であり、水・海を司る神として説明している。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-008",
    statement:
      "『古事記』の禊の場面では住吉三神（底筒男・中筒男・表筒男）と綿津見三神（底津・中津・上津綿津見）が並行して誕生し、古代の海洋祭祀に二大系統が存在したことを示す重要な並行性を持つ。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "住吉三神と綿津見三神の並行誕生神話", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代神話編纂期（奈良時代初頭）", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 191,
          endLine: 206,
          quote:
            "『古事記』の禊の場面では、住吉三神と綿津見三神が同じ禊の過程で誕生する。底筒男命・底津綿津見神、中筒男命・中津綿津見神、表筒男命・上津綿津見神。どちらも三柱の神で構成され、海に関係する神格を持つ。この並行性は、古代の海洋祭祀を考えるうえで重要である。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-009",
    statement:
      "『古事記』において綿津見神は阿曇連の祖神関係が明記される一方、住吉神と津守氏の関係は記紀本文では明瞭でなく、神の祭祀と氏族系譜の間に重要な非対称性が認められる。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "阿曇氏（綿津見神系譜明記）と津守氏（住吉神系譜非明記）の非対称性", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "qualified" },
    historicalTime: { kind: "named", label: "古代氏族系譜編纂期", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 210,
          endLine: 228,
          quote:
            "『古事記』では、綿津見神の子である宇都志日金拆命の子孫が阿曇連であると記されている。阿曇氏は綿津見神との祖神関係が明示された氏族であり、志賀海神社を中心とする海人集団との関係が知られている。一方、住吉神については、記紀の中で津守氏との祖神関係が阿曇氏ほど明確には記されていない。ここには重要な非対称性がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-010",
    statement:
      "住吉神社境内には船玉・志賀・人丸・菅原・稲荷・三日恵比須・少彦名・天津などの小宮が重層し、航海・海神・和歌・学問・商売・医療など地域社会の多様な信仰が長い歴史の中で蓄積された複合祭祀空間を形成している。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "features",
    object: {
      kind: "entity",
      entity: { name: "住吉神社境内小宮群による複合祭祀重層空間", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "中世〜近世〜現代", precision: "broad-range" },
    places: [
      { name: "筑前国一宮 住吉神社", role: "observed_place" },
      { name: "博多住吉神社 境内 志賀神社", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 246,
          endLine: 268,
          quote:
            "住吉神社は住吉三神だけを祀る単一の祭祀空間ではない。航海、海神、学問、商売、医療・国土経営など、さまざまな神格が境内に重なっている。これは神社が長い歴史の中で、地域社会の信仰や他の神社との関係を取り込みながら形成されてきたことを示している。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-011",
    statement:
      "阿曇氏（綿津見神）・宗像氏（宗像三女神）・津守氏（住吉三神）などの海洋系氏族は、北部九州から瀬戸内海にかけての海上交通・祭祀を分担し、単一の海神信仰ではなく固有の神格・成立時期・王権接続過程を持っていた。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "北部九州海洋系氏族（阿曇・宗像・津守）の多元的海上交通祭祀", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "古墳時代〜律令国家形成期", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 274,
          endLine: 289,
          quote:
            "これまで調べてきた阿曇氏・宗像氏・津守氏などを並べると、北部九州から瀬戸内海にかけての海上交通と祭祀の関係が見えてくる。これらの祭祀は、単に海の神を祀るという共通点だけで一括りにできない。それぞれの神格、氏族との関係、祭祀の成立時期、王権との接続過程を分けて考える必要がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-sumiyoshi-012",
    statement:
      "住吉神は神功皇后新羅遠征の神託神として記紀に登場し、在地博多湾の古い海上祭祀が先行した上で、王権の対外航海・外交安全を司る国家祭祀体系へ組み込まれていった可能性が考えられる。",
    subject: { name: "筑前国一宮 住吉神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "神功皇后伝説における住吉神神託と国家祭祀編入過程", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "qualified" },
    historicalTime: { kind: "named", label: "古墳時代〜奈良時代", precision: "broad-range" },
    places: [{ name: "筑前国一宮 住吉神社", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docSumiyoshiId,
          documentSha256: sumiyoshiSha256,
          startLine: 293,
          endLine: 307,
          quote:
            "住吉神は、記紀の神功皇后の物語にも登場する。神功皇后の新羅遠征に際して神託を下す神として描かれ、航海や対外活動と関係する神格が示されている。ただし、住吉神が最初から国家祭祀のために作られた神であると断定することはできない。在地の海上祭祀が先行し、後に王権の祭祀体系へ組み込まれた可能性も検討する必要がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },

  // ===================== 香椎宮・香椎潟 Claims =====================
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-001",
    statement:
      "香椎宮の祭神は仲哀天皇・神功皇后・応神天皇・住吉大神であり、本殿は享和元年（1801年）再建の『香椎造』と呼ばれる独特の建築様式を持つ国指定重要文化財である。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "features",
    object: {
      kind: "entity",
      entity: { name: "香椎造本殿（1801年再建・国指定重要文化財）", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "江戸時代後期（享和元年・1801年）", precision: "period" },
    places: [{ name: "香椎宮（香椎廟）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 43,
          endLine: 57,
          quote:
            "香椎宮の祭神は以下の四柱。仲哀天皇、神功皇后、応神天皇、住吉大神。案内板では、3世紀ごろ仲哀天皇が神功皇后とともにこの地に橿日宮を営み、この地で崩御した仲哀天皇の霊を神功皇后が祀ったことを起源としている。古くは『香椎廟』と称され、朝廷や人々の崇敬を受けてきた。本殿は享和元年（1801年）に再建され、『香椎造』と呼ばれる独特の建築様式を持つ。国の重要文化財に指定されている。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-002",
    statement:
      "香椎宮の起源には神功皇后が仲哀天皇の霊を祀った西暦200年の伝承と、養老7年（723年）造営開始・神亀元年（724年）竣工の香椎廟という奈良時代の国家的制度化が存在し、伝承と史実の時間層を明確に分離する必要がある。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "西暦200年伝承と724年奈良時代香椎廟造営の時間層分離", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "奈良時代（神亀元年・724年）", precision: "period" },
    places: [{ name: "香椎宮（香椎廟）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 61,
          endLine: 78,
          quote:
            "西暦200年：神功皇后が仲哀天皇の神霊を祀ったことを起源とする。養老7年（723年）：神功皇后の神託により朝廷が新宮の造営を開始。神亀元年（724年）：新宮が竣工し、仲哀天皇と神功皇后を祀る香椎廟となった。ここでは、伝承上の起源と奈良時代の制度的な整備を区別する必要がある。仲哀天皇の崩御を西暦200年とする年代は、記紀の伝承を後世の年代体系に当てはめたものであり、実年代として確定したものではない。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-003",
    statement:
      "香椎宮は伊勢大廟とともに『廟号』を持つ九州唯一の特別な施設であり、天平9年（737年）以来朝廷より勅使が派遣され国家安泰を祈願する奉幣の儀が続き、現在も10年ごとの勅祭が行われている。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "holds_status",
    object: {
      kind: "entity",
      entity: { name: "伊勢大廟と並ぶ香椎廟号・737年以降朝廷勅祭奉幣拠点", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "奈良時代（天平9年・737年）〜現代", precision: "broad-range" },
    places: [{ name: "香椎宮（香椎廟）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 82,
          endLine: 96,
          quote:
            "案内板では、香椎宮は伊勢大廟とともに『廟号』を持つ特別な施設として説明されている。また、奈良時代以降、朝廷から勅使が派遣され、国家の安泰を祈願する奉幣が行われてきたとされる。天平9年（737年）以来、勅使奉幣の儀が続き、現在も10年ごとの勅祭が行われている。香椎廟は、単なる地方の神社ではなく、九州における朝廷の重要な祭祀拠点として位置づけられていた。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-004",
    statement:
      "『古事記』に記された『帯中日子天皇、竺紫訶志比宮、治天下也』を根拠として、古宮付近の碑において仲哀天皇大本営御旧蹟碑・訶志比宮址・崩御の地と比定されている。",
    subject: { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", type: "Place" },
    predicate: "identified_as",
    object: {
      kind: "entity",
      entity: { name: "仲哀天皇訶志比宮址・大本営御旧蹟碑（古事記比定地）", type: "Place" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "記紀神話時代〜近代顕彰碑", precision: "broad-range" },
    places: [
      { name: "香椎宮（香椎廟）", role: "observed_place" },
      { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 114,
          endLine: 133,
          quote:
            "『古事記』に記された『帯中日子天皇、竺紫訶志比宮、治天下也』という記述を根拠として、この場所を訶志比宮址に比定している。案内板では、仲哀天皇が仲哀天皇8年（199年）にこの地に都を定め、翌9年（200年）に崩御したと説明している。また、神功皇后が仲哀天皇の遺志を継いで三韓征伐を行ったため、この地を大本営跡としている。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-005",
    statement:
      "古宮境内の沙庭斎場は『古事記』において武内宿禰が沙庭で神命を請い、神功皇后に神憑り神託が下る祭祀と政治判断が交差する空間の伝承地とされている。",
    subject: { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "沙庭斎場（武内宿禰神命拝受・神功皇后神憑り伝承地）", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "記紀神話時代伝承", precision: "broad-range" },
    places: [{ name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 137,
          endLine: 154,
          quote:
            "仲哀天皇は内外政策について神教を求めるため、常に沙庭を設けて神託を請うていた場所とされる。『古事記』の仲哀天皇段では、建内宿禰が沙庭にいて神の命を請う場面が登場する。神功皇后に神が憑依し、西方の国を授けるという神託が下る。沙庭は単なる庭ではなく、神意を問う祭祀と政治判断が交差する場所として描かれている。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-006",
    statement:
      "棺掛椎は仲哀天皇崩御後に神功皇后が死を秘して棺を椎の木に立て掛け、そこから漂った芳香が『香椎』の地名由来になったという伝承地であり、王権物語と結びついた地名由来譚を物語る。",
    subject: { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "棺掛椎伝承と香椎地名由来譚", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "地名伝承", precision: "broad-range" },
    places: [{ name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 158,
          endLine: 172,
          quote:
            "案内板によれば、仲哀天皇の崩御後、神功皇后は天皇の死を秘し、棺を椎の木に立て掛けて、天皇が親臨しているかのように会議を開いたという。棺から香りが漂ったことが『香椎』の地名の由来になったという伝承も紹介されている。これは香椎という地名と仲哀天皇の物語を結びつける地名由来譚として理解できる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-007",
    statement:
      "古宮大明神社は724年遷宮後の旧宮地で仲哀天皇神霊を摂社として祀った場所であり、大正4年（1915年）に仲哀天皇が本社へ復帰した経緯から、祭神構成が創建以来不変ではなく歴史の中で変化したことを示す。",
    subject: { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "香椎廟祭神の分離・古宮摂社化・1915年本社復帰の変遷", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "724年遷宮〜大正4年（1915年）", precision: "broad-range" },
    places: [
      { name: "香椎宮（香椎廟）", role: "observed_place" },
      { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 176,
          endLine: 196,
          quote:
            "案内板では、724年に香椎廟が新宮に遷宮された後、いつしか香椎廟が普通の神社のように扱われ、祭神も神功皇后一柱となったため、仲哀天皇の神霊を旧宮地に移して摂社として祀ったと説明している。さらに、大正4年（1915年）11月10日に仲哀天皇が香椎宮本社に再び加列され、古宮から本社に復したとしている。この説明から、祭神構成が創建以来不変だったわけではないことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-008",
    statement:
      "香椎宮頓宮境内の香椎潟万葉歌碑（明治21年三条実美筆）には、神亀5年（728年）大宰府官人らが香椎廟参拝後に香椎浦で詠んだ大伴旅人・小野老・宇努首男人の万葉歌三首が刻まれており、728年に香椎廟が官人参拝対象だった確実な史料事実を示す。",
    subject: { name: "香椎潟 万葉歌碑", type: "Place" },
    predicate: "commemorates",
    object: {
      kind: "entity",
      entity: { name: "神亀5年（728年）大宰府官人香椎廟参拝万葉歌碑（旅人・老・男人）", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "奈良時代（神亀5年・728年）", precision: "period" },
    places: [
      { name: "香椎宮 頓宮", role: "observed_place" },
      { name: "香椎潟 万葉歌碑", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 209,
          endLine: 251,
          quote:
            "神亀5年（728年）、大宰府の官人たちが香椎廟に参拝した後、香椎浦に馬を止めて詠んだ三首が万葉仮名で刻まれている。大伴旅人『いざ子ども 香椎の潟に 白妙の 袖さえぬれて 朝菜摘みてむ』、小野老『時つ風吹くべくならぬ 香椎潟 潮干の浦に 玉藻刈りてな』、宇努首男人『往き帰り 常にわが見し 香椎潟 明日ゆ後には 見む縁もなし』。この記録から、728年には香椎廟が大宰府官人の参拝対象となっていたことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-009",
    statement:
      "万葉歌の内容からは香椎潟が単なる景勝地ではなく海藻採りや潮干狩りが行われた生活の場であったことが読み取れ、旅人・老の海辺活動の楽しさと男人の別れの惜別という異なる時間感覚が表れている。",
    subject: { name: "香椎潟 万葉歌碑", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "香椎潟の生活景観（潮干狩・海藻採り）と官人たちの詩情", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "奈良時代（8世紀前半）", precision: "broad-range" },
    places: [{ name: "香椎潟 万葉歌碑", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 253,
          endLine: 267,
          quote:
            "歌の内容からは、香椎潟が単なる景勝地ではなく、海藻採りや潮干狩りができる生活の場でもあったことが読み取れる。宇努首男人の歌は、香椎潟を日常的に見ていた人物が、その土地を離れることを惜しんでいる。同じ場所にいても、旅人と小野老は海辺での活動を楽しみ、男人は別れを惜しんでいる。それぞれの時間感覚の違いも興味深い。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-010",
    statement:
      "昭和初期までは頓宮周辺の丘の麓まで波が打ち寄せ丘上から遠浅の磯浜を見渡せた旧海岸線環境があり、現在の市街地化された景観とは異なる海辺の古環境が存在していた。",
    subject: { name: "香椎宮 頓宮", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: { name: "昭和初期までの香椎潟波打ち際・丘上遠浅磯浜旧景観", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜昭和初期", precision: "broad-range" },
    places: [
      { name: "香椎宮 頓宮", role: "observed_place" },
      { name: "香椎潟 万葉歌碑", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 271,
          endLine: 283,
          quote:
            "案内板には、昭和初期までは丘の麓まで波が打ち寄せ、丘上から潮干狩りのできる遠浅の磯浜を見渡せたと記されている。現在は住宅地や道路に囲まれているが、かつては頓宮周辺の丘のすぐ下に海があった。この説明は、現在の地形だけでは分からない香椎の海辺の景観を考えるうえで重要である。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-011",
    statement:
      "海上の御島神社（綿津見神、神功皇后みづら結い伝承）と陸側の濱男神社は、かつて神職が海上の御島へ渡り悪天候時には濱男神社から遥拝したという『海上祭祀地点と陸上遥拝拠点』の相互補完関係を持つ。",
    subject: { name: "御島神社（香椎浜海上の鳥居）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: { name: "御島神社（海上祭祀）と濱男神社（陸上遥拝拠点）の相関構造", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代海上祭祀〜現代", precision: "broad-range" },
    places: [
      { name: "濱男神社", role: "observed_place" },
      { name: "御島神社（香椎浜海上の鳥居）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 295,
          endLine: 326,
          quote:
            "御島神社は綿津見神を祀るとされる。地域の説明では、かつて神職が毎日御島神社へ渡って参拝し、悪天候で渡れない場合は濱男神社から遥拝したとされる。つまり、御島神社：海上の祭祀地点、濱男神社：陸側からの遥拝・祭祀拠点という関係があったと考えられる。御島神社には、神功皇后が仲哀天皇崩御後に島へ渡り、海水で髪を洗い、男髪の『みづら』に結い直したという伝承がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-012",
    statement:
      "御島神社（海上の綿津見神）・濱男神社（陸上遥拝）は、志賀海神社（阿曇氏綿津見神）や博多住吉神社（住吉神・港津管理）と接続する博多湾全体の海上祭祀ネットワークの一角を成し、王権祭祀空間（香椎宮）と海辺で近接していた。",
    subject: { name: "御島神社（香椎浜海上の鳥居）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "博多湾沿岸における海上祭祀群と王権祭祀の近接性", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代（古墳〜奈良時代）", precision: "broad-range" },
    places: [
      { name: "濱男神社", role: "observed_place" },
      { name: "御島神社（香椎浜海上の鳥居）", role: "observed_place" },
      { name: "香椎宮（香椎廟）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 330,
          endLine: 345,
          quote:
            "志賀海神社・阿曇氏（綿津見神を奉斎する海人系氏族）、御島神社（海上の島で綿津見神を祀る）、濱男神社（御島神社への陸側の遥拝拠点）、住吉神社・津守氏（住吉神の祭祀と王権・港津管理）。御島神社を阿曇氏の祭祀拠点だったと断定できる史料はないが、香椎潟の海上祭祀が香椎宮という王権ゆかりの祭祀空間と近接していたことは重要である。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-013",
    statement:
      "香椎宮の御神木綾杉には神功皇后植樹伝承、樹齢1800年伝承、新古今和歌集の古歌、夏目漱石の句などが重なり、古い樹木そのものと後世の文学・信仰が多層化した記念物である。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "features",
    object: {
      kind: "entity",
      entity: { name: "香椎宮御神木綾杉（神功皇后植樹伝承・新古今和歌・漱石句）", type: "Artifact" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "伝承時代〜鎌倉〜近代〜現代", precision: "broad-range" },
    places: [{ name: "香椎宮（香椎廟）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 351,
          endLine: 379,
          quote:
            "香椎宮の御神木である綾杉には、神功皇后が『とこしへに本朝を鎮め護るべし』と祈りを込めて植えたという伝承がある。『ちはやふる香椎の宮のあや杉は 神のみそきにたてる成けり』（新古今和歌集）、『秋立つや千早ふる世の杉ありて』（夏目漱石）。ここには、古い樹木そのもの、神功皇后が植えたという伝承、古典和歌、近代文学、御神木としての信仰という複数の時間層が重なっている。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-014",
    statement:
      "巻尾神社は仲哀天皇・神功皇后に仕え香椎守護を命じられた中臣烏賊津大連命を祀り、宮司家の木家（武家）および古代中臣氏の祖先神伝承を保持しており、主祭神だけでなく祭祀職掌家をめぐる伝承を残す。",
    subject: { name: "巻尾神社", type: "Place" },
    predicate: "worships",
    object: {
      kind: "entity",
      entity: { name: "中臣烏賊津大連命（木家宮司家・中臣氏祖先神伝承）", type: "Deity" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代祭祀職掌伝承", precision: "broad-range" },
    places: [
      { name: "香椎宮（香椎廟）", role: "observed_place" },
      { name: "巻尾神社", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 387,
          endLine: 406,
          quote:
            "祭神は中臣烏賊津大連命。案内板では、仲哀天皇・神功皇后に仕えた人物であり、仲哀天皇崩御後に神功皇后・武内宿禰とともに事態を収拾したと説明している。三韓征伐の際には香椎の守護を命じられたとされ、宮司家の一つである木家（武家）の祖先神、また中臣氏の祖先神とも伝えられている。神社の由緒は主祭神の物語だけでなく、祭祀を支えた人々の系譜や職掌の記憶も取り込んでいる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-015",
    statement:
      "平成元年（1989年）の『香椎宮周辺歴史散歩案内』では境内のみならず不老水・古宮・大本営跡・御島鳥居・浜男神社・印鑰神社・十三仏奥の院・報恩寺・薬師様など19箇所が紹介され、地域社会における多層的歴史景観の認識範囲が記録されている。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "香椎地域における神仏習合・海神・水源・共同体小社の多層的歴史景観", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "現代（平成元年・1989年記録）", precision: "period" },
    places: [
      { name: "香椎宮（香椎廟）", role: "observed_place" },
      { name: "濱男神社", role: "observed_place" },
      { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 412,
          endLine: 472,
          quote:
            "現地で確認した『香椎宮 周辺歴史散歩案内』は、平成元年4月吉日に作成されたもの。不老水、武内屋敷跡、古宮、仲哀天皇大本営跡、高砲神社、薬師様、かぶと塚、印鑰神社、御島鳥居、平野神社、頓宮、十三仏奥の院、巻尾神社、報恩寺など掲載されている19か所。香椎宮の境内だけではなく、海辺・水源・寺院・塚・地域の小社まで含めて歴史景観として紹介されていたことが分かる。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-016",
    statement:
      "香椎の歴史構造は『王権・国家祭祀の軸（訶志比宮・香椎廟・朝廷奉幣）』『海・水の祭祀の軸（御島神社・濱男神社・香椎潟）』『地域信仰・神仏習合の軸（不老水・薬師・十三仏・報恩寺）』という3大軸の重層景観として捉えられる。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "香椎歴史景観の3大軸（王権国家祭祀・海水の祭祀・地域信仰神仏習合）総合モデル", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜中世〜近現代", precision: "broad-range" },
    places: [
      { name: "香椎宮（香椎廟）", role: "observed_place" },
      { name: "香椎宮 頓宮", role: "observed_place" },
      { name: "濱男神社", role: "observed_place" },
      { name: "御島神社（香椎浜海上の鳥居）", role: "observed_place" },
      { name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", role: "observed_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 476,
          endLine: 512,
          quote:
            "香椎は大きく三つの軸から理解できる。A. 王権・国家祭祀の軸（訶志比宮址・古宮 → 香椎宮 → 頓宮：仲哀・神功伝承、香椎廟、朝廷造営・奉幣、大宰府官人参拝）。B. 海・水の祭祀の軸（御島神社 → 濱男神社 → 香椎潟：海上島綿津見祭祀、陸側遥拝、海辺の生活、海洋氏族背景）。C. 地域信仰・神仏習合の軸（不老水・薬師様・十三仏奥の院・報恩寺：水源長寿、薬師信仰、神仏重層、共同体小社）。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kashii-017",
    statement:
      "『続日本紀』には対新羅外交関係をめぐって香椎廟に奉幣した記録があり、香椎廟は仲哀天皇伝承地というだけでなく、九州における大宰府の対外政策・外交・軍事危機と直結した国家祭祀施設として機能していた。",
    subject: { name: "香椎宮（香椎廟）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: { name: "続日本紀にみる香椎廟奉幣と大宰府対外外交・軍事祭祀機能", type: "Concept" },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "source-checked", modality: "asserted" },
    historicalTime: { kind: "named", label: "奈良時代（8世紀）", precision: "broad-range" },
    places: [{ name: "香椎宮（香椎廟）", role: "observed_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docKashiiId,
          documentSha256: kashiiSha256,
          startLine: 516,
          endLine: 529,
          quote:
            "奈良時代の香椎廟は、大宰府官人の参拝対象であり、朝廷が対外政策に際して奉幣する場所でもあった。『続日本紀』には、新羅との関係をめぐって香椎廟に奉幣した記録がある。香椎廟は仲哀天皇の伝承地というだけでなく、九州の対外政策・外交・軍事と結びつく祭祀施設として機能していた可能性がある。",
        },
      },
    ],
    createdAt: "2026-11-11T10:00:00Z",
  },
];

const connections = [
  // 1. 住吉神社 境内祭祀ネットワーク
  {
    id: "conn-hakata-sumiyoshi-precinct-mesh",
    connectionKind: "itinerary",
    initialStatus: "confirmed",
    eyebrow: "博多湾岸海洋祭祀",
    title: "博多住吉神社 本殿・志賀神社 境内祭祀連動軸",
    summary: "全国住吉神社始源の本殿と、境内に祀られた志賀神社（綿津見三神）を結ぶ博多湾岸海洋祭祀の重層軸。",
    spotIds: ["spot-sumiyoshi-hakata", "spot-sumiyoshi-shiga-sha"],
    claimIds: [
      "claim-sumiyoshi-001",
      "claim-sumiyoshi-007",
      "claim-sumiyoshi-008",
      "claim-sumiyoshi-010",
    ],
    concepts: ["住吉三神", "綿津見三神", "志賀大神", "阿波岐原禊", "海洋祭祀二大体系"],
    facets: [
      { id: "route", label: "博多湾岸海洋祭祀", weight: 5 },
      { id: "religious", label: "海神族祭祀重層", weight: 5 },
    ],
    lensId: "route",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-sumiyoshi-precinct",
        label: "古代阿波岐原禊伝承と博多湾岸海洋祭祀",
        range: "古代神話〜現代",
        mapLabel: "博多住吉神社境内海神祭祀軸",
        mapLayer: "maritime",
        spotIds: ["spot-sumiyoshi-hakata", "spot-sumiyoshi-shiga-sha"],
        claimIds: [
          "claim-sumiyoshi-001",
          "claim-sumiyoshi-007",
          "claim-sumiyoshi-008",
        ],
      },
    ],
  },
  // 2. 香椎宮 古宮・本社・頓宮 王権祭祀軸
  {
    id: "conn-kashii-royal-sanctuary-axis",
    connectionKind: "itinerary",
    initialStatus: "confirmed",
    eyebrow: "王権・国家祭祀",
    title: "香椎 訶志比宮址・古宮・香椎宮本社・頓宮 王権祭祀軸",
    summary: "仲哀天皇崩御地・訶志比宮址（古宮）から、奈良時代造営の香椎廟（本社）、香椎潟見晴らしの頓宮を結ぶ王権・国家祭祀軸。",
    spotIds: [
      "spot-kashii-furumiya-shrine",
      "spot-kashii-makioto-shrine",
      "spot-kashii-gu",
      "spot-kashii-tongu",
    ],
    claimIds: [
      "claim-kashii-001",
      "claim-kashii-002",
      "claim-kashii-003",
      "claim-kashii-004",
      "claim-kashii-005",
      "claim-kashii-006",
      "claim-kashii-007",
      "claim-kashii-014",
      "claim-kashii-016",
    ],
    concepts: ["仲哀天皇", "神功皇后", "香椎廟", "訶志比宮", "沙庭斎場", "中臣烏賊津大連命"],
    facets: [
      { id: "route", label: "王権・国家祭祀回廊", weight: 5 },
      { id: "politics", label: "大宰府外交・国家廟", weight: 5 },
    ],
    lensId: "politics",
    topicId: "jingu-kogo-legend-preset",
    eras: [
      {
        id: "era-kashii-royal-sanctuary",
        label: "訶志比宮址から奈良時代香椎廟国家祭祀",
        range: "3世紀伝承〜8世紀神亀・天平〜現代",
        mapLabel: "香椎王権・国家祭祀回廊",
        mapLayer: "domain",
        spotIds: [
          "spot-kashii-furumiya-shrine",
          "spot-kashii-gu",
          "spot-kashii-tongu",
        ],
        claimIds: [
          "claim-kashii-001",
          "claim-kashii-002",
          "claim-kashii-003",
          "claim-kashii-004",
        ],
      },
    ],
  },
  // 3. 香椎潟 海上祭祀・遥拝・万葉景観軸
  {
    id: "conn-kashiigata-maritime-manyo-axis",
    connectionKind: "itinerary",
    initialStatus: "confirmed",
    eyebrow: "海上祭祀・万葉景観",
    title: "香椎潟 御島神社・濱男神社・万葉歌碑 海上祭祀・万葉景観回廊",
    summary: "香椎浜海上の御島神社（綿津見神）から陸側遥拝拠点の濱男神社、そして大伴旅人ら大宰府官人が海藻を摘み別れを惜しんだ香椎潟頓宮万葉歌碑を結ぶ景観軸。",
    spotIds: [
      "spot-mishima-shrine",
      "spot-hamao-shrine",
      "spot-kashiigata-manyo-monument",
      "spot-kashii-tongu",
    ],
    claimIds: [
      "claim-kashii-008",
      "claim-kashii-009",
      "claim-kashii-010",
      "claim-kashii-011",
      "claim-kashii-012",
      "claim-kashii-016",
    ],
    concepts: ["御島神社", "濱男神社", "香椎潟", "大伴旅人", "小野老", "宇努首男人", "綿津見神"],
    facets: [
      { id: "route", label: "香椎潟海上祭祀・万葉歌回廊", weight: 5 },
      { id: "religious", label: "博多湾沿岸海神遥拝", weight: 5 },
    ],
    lensId: "route",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-kashiigata-maritime-manyo",
        label: "古代海上祭祀と728年大宰府官人万葉景観",
        range: "古代〜728年神亀5年〜現代",
        mapLabel: "香椎潟海上祭祀・万葉回廊",
        mapLayer: "maritime",
        spotIds: [
          "spot-mishima-shrine",
          "spot-hamao-shrine",
          "spot-kashiigata-manyo-monument",
        ],
        claimIds: [
          "claim-kashii-008",
          "claim-kashii-011",
          "claim-kashii-012",
        ],
      },
    ],
  },
];

const newJourneys = [
  {
    id: "journey-hakata-sumiyoshi-2026-11-11",
    label: "博多住吉神社と古代博多湾海上祭祀（住吉三神・海神族・青銅器・旧海岸線）",
    documentIds: [docSumiyoshiId],
    spotIds: ["spot-sumiyoshi-hakata", "spot-sumiyoshi-shiga-sha"],
    connectionIds: ["conn-hakata-sumiyoshi-precinct-mesh"],
  },
  {
    id: "journey-kashii-kashiigata-2026-11-11",
    label: "香椎宮と香椎潟の古層祭祀景観（香椎廟・万葉歌碑・御島神社・訶志比宮址）",
    documentIds: [docKashiiId],
    spotIds: [
      "spot-kashii-gu",
      "spot-kashii-tongu",
      "spot-kashiigata-manyo-monument",
      "spot-hamao-shrine",
      "spot-mishima-shrine",
      "spot-kashii-furumiya-shrine",
      "spot-kashii-makioto-shrine",
    ],
    connectionIds: [
      "conn-kashii-royal-sanctuary-axis",
      "conn-kashiigata-maritime-manyo-axis",
    ],
  },
];

function upsertDataset(targetAtlas, targetDocs, targetClaims) {
  if (targetDocs) {
    for (const doc of newDocuments) {
      const dIdx = targetDocs.findIndex((d) => d.id === doc.id);
      if (dIdx >= 0) {
        targetDocs[dIdx] = doc;
      } else {
        targetDocs.push(doc);
      }
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
    for (const j of newJourneys) {
      const jIdx = targetAtlas.journeys.findIndex((existing) => existing.id === j.id);
      if (jIdx >= 0) {
        targetAtlas.journeys[jIdx] = j;
      } else {
        targetAtlas.journeys.push(j);
      }
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

console.log("Import hakata sumiyoshi and kashii journeys completed successfully!");
