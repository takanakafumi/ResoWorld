import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const fieldVisitPath = path.join(
  root,
  "旅行記",
  "2026-11-07_太宰府探索記録（九州国立博物館・太宰府天満宮・榎社・王城神社）.md",
);
const essayPath = path.join(
  root,
  "旅行記",
  "2026-11-07_卑弥呼の鏡展から考える古代日本列島の政治構造.md",
);

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const fieldVisitContent = fs.readFileSync(fieldVisitPath, "utf-8");
const fieldVisitSha256 = crypto
  .createHash("sha256")
  .update(fieldVisitContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const essayContent = fs.readFileSync(essayPath, "utf-8");
const essaySha256 = crypto
  .createHash("sha256")
  .update(essayContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const docFieldVisitId = "doc-dazaifu-field-visit-2026-11-07";
const docEssayId = "doc-himiko-mirrors-essay-2026-11-07";

const newDocuments = [
  {
    id: docFieldVisitId,
    title: "2026年11月7日 太宰府探索記録（九州国立博物館・太宰府天満宮・榎社・王城神社）",
    path: "旅行記/2026-11-07_太宰府探索記録（九州国立博物館・太宰府天満宮・榎社・王城神社）.md",
    sha256: fieldVisitSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: "2026-11-07",
    documentedAt: "2026-11-07",
    dateStatus: "known",
  },
  {
    id: docEssayId,
    title: "2026年11月7日 卑弥呼の鏡展から考える古代日本列島の政治構造",
    path: "旅行記/2026-11-07_卑弥呼の鏡展から考える古代日本列島の政治構造.md",
    sha256: essaySha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: "2026-11-07",
    documentedAt: "2026-11-07",
    dateStatus: "known",
  },
];

const spots = [
  {
    id: "spot-kyushu-national-museum",
    name: "九州国立博物館",
    region: "福岡県 · 太宰府市石坂",
    kind: "博物館・文化施設",
    latitude: 33.5186,
    longitude: 130.5401,
    claimIds: [
      "claim-dazaifu-001",
      "claim-dazaifu-002",
      "claim-dazaifu-003",
      "claim-dazaifu-007",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-dazaifu-tenmangu",
    name: "太宰府天満宮",
    region: "福岡県 · 太宰府市宰府",
    kind: "神社",
    latitude: 33.5215,
    longitude: 130.5348,
    claimIds: [
      "claim-dazaifu-009",
      "claim-dazaifu-010",
      "claim-dazaifu-013",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-tenkai-inari-okunoin",
    name: "天開稲荷社 奥の院",
    region: "福岡県 · 太宰府市宰府",
    kind: "神社・奥の院",
    latitude: 33.5244,
    longitude: 130.5367,
    claimIds: [
      "claim-dazaifu-009",
      "claim-dazaifu-011",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-dazaifu-shiga-sha",
    name: "太宰府天満宮 志賀社",
    region: "福岡県 · 太宰府市宰府",
    kind: "神社・境内社",
    latitude: 33.5212,
    longitude: 130.534,
    claimIds: [
      "claim-dazaifu-009",
      "claim-dazaifu-010",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-dazaifu-kyakukan",
    name: "大宰府客館跡",
    region: "福岡県 · 太宰府市朱雀",
    kind: "古代官衙遺跡・迎賓施設",
    latitude: 33.5133,
    longitude: 130.521,
    claimIds: [
      "claim-dazaifu-014",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-enoki-sha",
    name: "榎社（府の南館・神幸式御旅所）",
    region: "福岡県 · 太宰府市朱雀",
    kind: "神社・古代官舎跡",
    latitude: 33.5108,
    longitude: 130.5222,
    claimIds: [
      "claim-dazaifu-015",
      "claim-dazaifu-016",
      "claim-dazaifu-017",
      "claim-dazaifu-018",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-ojo-jinja-tonokoga",
    name: "王城神社",
    region: "福岡県 · 太宰府市通古賀",
    kind: "神社",
    latitude: 33.5098,
    longitude: 130.5117,
    claimIds: [
      "claim-dazaifu-019",
      "claim-dazaifu-020",
      "claim-dazaifu-021",
      "claim-dazaifu-022",
      "claim-dazaifu-023",
      "claim-dazaifu-024",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const claims = [
  // 1. 鏡と政治構造（論考より）
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-001",
    statement:
      "弥生時代の青銅鏡（前漢鏡・後漢鏡）の分布は北部九州に濃密に集中しており、朝鮮半島との直接的鉄器・青銅器交易を通じて伊都国や奴国が独自の政治的・威信財基盤を確立していたことを示す。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "弥生時代北部九州の青銅鏡集中と対外交易基盤",
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
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 30,
          endLine: 41,
          quote:
            "弥生時代の青銅鏡の分布を考えると、北部九州は非常に重要な地域だった。その背景には、朝鮮半島との交流がある。鉄器や青銅器などの先進的な物資が流入する。大陸・半島との外交や交易に関わる有力者が形成される。鏡などの威信財が、地域の有力者の権威を示す役割を持つ。伊都国や奴国などの存在を考えても、北部九州は単なる大陸への通過点ではなく、独自の政治的基盤を持った地域だったと考えられる。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-002",
    statement:
      "三角縁神獣鏡は畿内を中心に分布する一方、福岡平野、筑後川中流域、遠賀川流域、周防灘沿岸など北部九州にも相当数が出土しており、北部九州が畿内政治ネットワークの周縁ではなく重要な提携相手であったことを物語る。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "北部九州における三角縁神獣鏡出土と畿内・九州提携ネットワーク",
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
      label: "古墳時代前期（3世紀後半〜4世紀）",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 44,
          endLine: 55,
          quote:
            "三角縁神獣鏡の分布は、全体としては畿内を中心とする傾向がある。一方で、北部九州にも相当数の出土例があり、決して周辺的な存在ではない。北部九州では、福岡平野だけでなく、筑後川中流域、遠賀川流域、周防灘沿岸などにも出土例が見られる。このことから、古墳時代前期の北部九州は、畿内の政治ネットワークが及ぶ範囲に入っていく一方、地域の有力者も引き続き存在感を持っていたと考えられる。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-003",
    statement:
      "鏡の出土状況は「ヤマト王権からの単線的支配・配布」と即断すべきではなく、各地域の有力首長の入手経路、副葬の独自性、墳墓規模と合わせて重層的に解釈する必要がある。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "鏡の副葬状況・入手経路に見る地域首長層の自律的受容",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "弥生〜古墳時代移行期",
      precision: "broad-period",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 52,
          endLine: 69,
          quote:
            "ただし、鏡が出土したことだけで、ヤマト王権から一方的に配布された、あるいは政治的支配を受けたと断定することはできない。鏡の入手経路、保有期間、副葬の仕方、他の副葬品や墳墓の規模などを合わせて考える必要がある。今回の議論で大切なのは、鏡の分布を単純な勢力圏の地図として扱わないことだ。既存の地域勢力が、新しい政治的関係の中でどのように位置づけられていったかを考える材料でもある。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-004",
    statement:
      "筑後川流域には広大な平野と水運・有明海ルートが存在し、前期の祇園山古墳や御塚・権現塚古墳、6世紀の八女岩戸山古墳・石人山古墳に至るまで、玄界灘側とは異なる独自の政治的・経済的重心を維持していた。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "筑後川流域・八女の独自政治重心（祇園山・御塚・岩戸山）",
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
      label: "古墳時代前期〜後期（3世紀〜6世紀）",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 79,
          endLine: 96,
          quote:
            "筑後川流域には広い平野があり、農業生産を支える基盤があった。また、筑後川を通じた内陸の移動や、有明海方面とのつながりも考えられる。北部九州の玄界灘側とは異なる方向に交通・交流の基盤を持つ地域だった。祇園山古墳：筑後川中流域の古墳時代前期の重要な古墳。御塚・権現塚古墳：筑後地域の有力者層を考えるうえで重要な古墳群。岩戸山古墳：6世紀の筑紫君磐井に関係する、北部九州を代表する大型古墳。石人山古墳：八女地域の有力者層を考えるうえで重要な古墳。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-005",
    statement:
      "筑紫君磐井がヤマト王権に対抗し得た背景には、筑後平野の農業生産力と、朝鮮半島との直接的な外交・軍事交流を支えた強固な地域的基盤が存在した。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "筑紫君磐井の対抗力を支えた筑後平野の経済力と対外交流基盤",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期（6世紀）",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 97,
          endLine: 109,
          quote:
            "特に岩戸山古墳は、筑紫君磐井の存在を通じて、北部九州にヤマト王権と対峙し得るほどの政治的基盤があったことを考える材料になる。筑後は、北部九州の対外交流を支える玄界灘側とは別の地域的な重心だったのではないか。今回の鏡の分布は、北部九州内部にも複数の政治的中心があった可能性を考えるきっかけになった。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-006",
    statement:
      "4世紀後半以降に始まる沖ノ島祭祀は、ヤマト王権が玄界灘ルートを武力で奪取したのではなく、宗像地域に元来存在した海人族の航海・祭祀基盤が王権の対外交流秩序と相互に提携・包摂されたプロセスとして理解される。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "沖ノ島祭祀成立における宗像海人族基盤と王権対外秩序の協調包摂",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "古墳時代中期（4世紀後半以降）",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 143,
          endLine: 157,
          quote:
            "古墳時代中期以降、宗像・沖ノ島の祭祀は、ヤマト王権の対外交流や政治的秩序と結びついていったと考えられる。ここで重要なのは、これを「ヤマト王権が新たにルートを作り、北部九州から取り上げた」と単純化しないことだ。むしろ、もともと宗像地域には海上交通を担う人々や地域勢力が存在した。その航海・交流の基盤が、ヤマト王権の対外交流の仕組みに組み込まれていった。宗像の地域勢力も、王権との関係を通じて政治的な役割を強めていった。という相互関係として見る方が自然である。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-007",
    statement:
      "3世紀の魏鏡・親魏倭王外交と、4世紀後半以降の沖ノ島祭祀・前方後円墳体制は、対外交流の窓口としての北部九州の重要性を共通の基盤としながらも、政治的重心と国家統合の枠組みが再編された異なる段階に属する。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "3世紀魏鏡外交から4世紀後半沖ノ島祭祀・前方後円墳体制への段階的再編",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "3世紀〜4世紀後半",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 159,
          endLine: 167,
          quote:
            "卑弥呼の時代における魏との外交と、古墳時代の沖ノ島祭祀は、同じ対外交流でも政治的な背景が異なる。3世紀：魏との外交を通じて、倭国の有力者が中国王朝の外交秩序に位置づけられる。4世紀後半以降：ヤマト王権の成長とともに、宗像・沖ノ島を含む対外交流と祭祀の仕組みが形成されていく。つまり、北部九州の海上交通の重要性は続きながら、その政治的な位置づけや関係する勢力が変化していったと考えられる。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-008",
    statement:
      "『魏志倭人伝』における「倭」「倭国」「邪馬台国」「親魏倭王」は峻別されるべき概念であり、卑弥呼が魏の外交秩序に位置づけられたことは列島全体が単一の中央集権国家であったことを意味しない。",
    subject: { name: "九州国立博物館", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "魏志倭人伝における呼称峻別と列島多元勢力モデル",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "3世紀（三国・魏志倭人伝期）",
      precision: "broad-range",
    },
    places: [{ name: "九州国立博物館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docEssayId,
          documentSha256: essaySha256,
          startLine: 172,
          endLine: 187,
          quote:
            "『魏志倭人伝』に登場する言葉は、次のように区別して考えたい。倭：中国側から見た日本列島の人々や地域に関する広い呼称。倭国：魏との外交関係に登場する政治的なまとまり。邪馬台国：卑弥呼が都を置いたとされる国。親魏倭王：魏が卑弥呼に与えた称号。魏が卑弥呼を「親魏倭王」として認めたことは、魏の外交秩序の中に卑弥呼が位置づけられたことを意味する。しかし、それは当時の列島全体が一つの統一国家だったことを証明するものではない。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },

  // 2. 太宰府天満宮・境内社（探索記録より）
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-009",
    statement:
      "太宰府天満宮は学問の神としての菅原道真崇拝にとどまらず、菅家祖先・親族信仰、海神（志賀社）、食物神（天開稲荷）、菓祖神（中島神社）、大国主・天照など、国家・地域・産業の諸神が同居する多層的信仰空間である。",
    subject: { name: "太宰府天満宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天神信仰・菅家血縁神・海神・産業神が同居する太宰府天満宮の多層信仰空間",
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
      label: "平安時代〜近現代",
      precision: "broad-range",
    },
    places: [{ name: "太宰府天満宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 77,
          endLine: 87,
          quote:
            "小祠を観察すると、大きく二つのまとまりが見られた。菅原道真の親族関係：菅原家の祖先や血縁、道真との縁に関わる信仰。それ以外の神々：大国主命、天照大神、高良、金毘羅など、幅広い神々。道真を中心とする天満宮の信仰空間に、血縁的なつながりを持つ神々と、地域・国家・産業などに関わる神々が集まっている。天満宮が単一の神格だけを祀る場所ではなく、複数の信仰を抱えた空間になっていることが見えてきた。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-010",
    statement:
      "太宰府天満宮境内の志賀社は、境内最古の社殿（1458年再建・国指定重要文化財）を有し、内陸の天満宮において博多湾志賀海神社と同根の綿津見三神（海神）が別格として奉斎され続けている物証である。",
    subject: { name: "太宰府天満宮 志賀社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天満宮境内最古社殿（1458年国重文）志賀社と綿津見三神海神信仰",
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
      label: "室町時代（長禄2年・1458年再建）〜現在",
      precision: "broad-range",
    },
    places: [{ name: "太宰府天満宮 志賀社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 100,
          endLine: 108,
          quote:
            "志賀社は国指定重要文化財の社殿を持ち、境内でも別格の存在感がある社。祭神は綿津見三神で、志賀海神社と同じ海神を祀る。今回の探索では、沖ノ島の祭祀や北部九州の海上交通に関心を持った直後だったため、特に印象的だった。太宰府天満宮の中心的な信仰は道真だが、その境内には海神信仰も存在している。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-011",
    statement:
      "天開稲荷社 奥の院は、巨石で組まれた洞穴・石室状の特異な空間構造を持ち、一般的な木造社殿とは異なる原初的な岩穴・石積みの神聖空間を保持している。",
    subject: { name: "天開稲荷社 奥の院", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天開稲荷社奥の院の巨石石室状洞穴祭祀遺構",
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
      label: "鎌倉末期勧請〜現代",
      precision: "broad-range",
    },
    places: [{ name: "天開稲荷社 奥の院", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 66,
          endLine: 73,
          quote:
            "今回、特に印象に残ったのは奥の院だった。石で囲まれた空間。古墳の石室を思わせる構造。一般的な社殿とは異なる、洞穴・石室に近い印象。形が古墳の石室に似ていることと、実際に古墳や古代祭祀の遺構を転用したことは別である。現時点では、建築的な類似として記録しておく。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-012",
    statement:
      "中島神社は、垂仁天皇の命で常世国から不老長寿の果実（橘）を持ち帰った田道間守命を菓祖として祀り（1954年兵庫県中嶋神社より勧請）、「海の彼方からの霊物到来」という古代的世界観の近現代的展開を示す。",
    subject: { name: "太宰府天満宮", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "中島神社の田道間守菓祖信仰と常世国霊物渡来神話の継承",
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
      label: "昭和29年（1954年）勧請〜現代",
      precision: "broad-range",
    },
    places: [{ name: "太宰府天満宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 92,
          endLine: 99,
          quote:
            "『古事記』『日本書紀』に登場し、垂仁天皇の命で常世国へ渡り、不老長寿の霊果「非時香菓（ときじくのかぐのこのみ）」を持ち帰った人物とされる。この霊果は橘にあたると伝えられ、田道間守命は後世に菓子の始祖「菓祖」として信仰されるようになった。太宰府の中島神社は、兵庫県豊岡市の中嶋神社から昭和29年（1954年）に勧請されたもの。「海の向こうから何かをもたらす」という世界観には興味深い共通点がある。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-013",
    statement:
      "飛梅伝承は、901年の道真大宰府左遷という歴史的事実と、後世に肥大化した天神御霊信仰・神異譚が結びついて形成された文化的モニュメントである。",
    subject: { name: "太宰府天満宮", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "延喜元年（901年）道真左遷の史実と飛梅神異譚の文化的結合",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "assertion",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "interpretive" },
    historicalTime: {
      kind: "named",
      label: "延喜元年（901年）〜平安・中世",
      precision: "broad-range",
    },
    places: [{ name: "太宰府天満宮", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 57,
          endLine: 61,
          quote:
            "道真にまつわる有名な伝承。道真の大宰府左遷と、都から飛んできたという梅の伝説が結びついている。歴史上の道真と、後世に形成された天神信仰の伝承を分けて考える必要があるが、現在の天満宮を象徴する存在である。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },

  // 3. 大宰府客館跡・榎社（探索記録より）
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-014",
    statement:
      "大宰府客館跡は、外国使節や客人を迎賓・接待した古代国家の迎賓施設であり、博多湾の鴻臚館と内陸の大宰府政庁・条坊が直結した国際外交都市の実態を証言する。",
    subject: { name: "大宰府客館跡", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "大宰府客館跡（条坊西端迎賓施設・鴻臚館連動国際都市）",
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
      label: "奈良時代〜平安時代初期",
      precision: "broad-range",
    },
    places: [{ name: "大宰府客館跡", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 114,
          endLine: 119,
          quote:
            "大宰府客館は、古代大宰府において外国使節などを迎えるための施設だった。九州国立博物館で見た大陸交流や遣唐使の展示と、現地の都市空間が結びつく場所である。大宰府は単なる地方行政機関ではなく、外交・軍事・交通の重要拠点だった。客館跡を通ることで、古代の大宰府がどのような人々を迎え、どのような国際的役割を担っていたかを具体的に考えられる。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-015",
    statement:
      "榎社の地にはもともと古代大宰府の高級官人官舎「府の南館」が所在し、国家の行政・宿舎施設が道真の謫居（901〜903年）を経て聖地化された「官衙から信仰空間への用途転換」の典型例である。",
    subject: { name: "榎社（府の南館・神幸式御旅所）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "府の南館から道真謫居地・榎社への官衙都市・御霊信仰用途転換",
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
      label: "延喜元年（901年）〜平安時代",
      precision: "broad-range",
    },
    places: [{ name: "榎社（府の南館・神幸式御旅所）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 127,
          endLine: 131,
          quote:
            "この場所には、都から大宰府へ赴任する高級官人の官舎「府の南館」があった。道真も延喜元年（901年）に大宰府へ左遷された後、ここで晩年を過ごした。つまり、もともとは古代大宰府の官僚機構に属する施設だった場所が、後世には道真の記憶と信仰の場所になった。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-016",
    statement:
      "榎社境内には道真に餅を差し出して支えた老婆・浄妙尼を祀る小祠が現存し、秋の神幸式大祭において神輿到着時にまず浄妙尼へ感謝の御幣を捧げる儀礼が継承されている。",
    subject: { name: "榎社（府の南館・神幸式御旅所）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "浄妙尼小祠と梅ヶ枝餅伝承・神幸式における感謝御幣奉奠儀礼",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "assertion",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "interpretive" },
    historicalTime: {
      kind: "named",
      label: "平安時代〜現在",
      precision: "broad-range",
    },
    places: [{ name: "榎社（府の南館・神幸式御旅所）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 133,
          endLine: 138,
          quote:
            "案内板によると、道真の苦境を見かねた浄妙尼が餅を差し出したという伝承がある。この故事が、太宰府名物の梅ヶ枝餅の由来と結びついている。境内には浄妙尼を祀る小社があり、秋の神幸式大祭では、神輿が到着すると、まず浄妙尼の小社に感謝の御幣を捧げる。道真本人だけでなく、道真を支えた人物の記憶も祭礼の中で継承されている点が興味深い。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-017",
    statement:
      "榎社を御旅所（行宮）とする神幸式大祭は、康和3年（1101年）に大宰権帥・大江匡房によって始められたと伝えられ、900年以上にわたり古代官舎跡と天満宮を結ぶ御霊慰撫の動線として機能している。",
    subject: { name: "榎社（府の南館・神幸式御旅所）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "康和3年（1101年）大江匡房創始の神幸式大祭（天満宮・榎社行宮御渡）",
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
      label: "康和3年（1101年）〜現在",
      precision: "broad-range",
    },
    places: [{ name: "榎社（府の南館・神幸式御旅所）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 141,
          endLine: 145,
          quote:
            "現地案内板では、康和3年（1101年）に大宰権帥・大江匡房によって始められたと説明されている。毎年9月に太宰府天満宮から榎社まで御神輿が渡御し、榎社を行宮・御旅所として一夜を過ごす。この祭礼は福岡県無形民俗文化財に指定されている。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-018",
    statement:
      "榎社境内に設置されたしめ縄付きの二つの加工石台は、祭礼における神輿の安置（神輿休石・礼拝石）に関わる儀礼遺構である可能性が高い。",
    subject: { name: "榎社（府の南館・神幸式御旅所）", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "榎社境内の二つの加工石台（神輿休石・神輿礼拝石儀礼遺構）",
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
      label: "近世〜現代",
      precision: "broad-range",
    },
    places: [{ name: "榎社（府の南館・神幸式御旅所）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 151,
          endLine: 157,
          quote:
            "四角く加工された新しい石の台座が二つあった。それぞれにしめ縄が掛けられていた。別資料では、神幸式に関係する「神輿休石」「神輿礼拝石」という名称が紹介されている。神輿が到着し、浄妙尼への礼拝を経て榎社を御旅所とする祭礼の動線を考えると、石台が祭礼に関係する可能性はある。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },

  // 4. 通古賀・王城神社（探索記録より）
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-019",
    statement:
      "王城神社の社伝（船賀法印『王城神社縁起』）は、天智4年（665年）に四王寺山（王城山）で武甕槌命と相殿で祀られていた事代主命を通古賀（筑前国衙庄）に移座したと伝え、白村江防衛山城（大野城）の築造期と重なる聖地伝承を保持する。",
    subject: { name: "王城神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天智4年（665年）四王寺山王城山から通古賀への事代主命移座伝承",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "assertion",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "interpretive" },
    historicalTime: {
      kind: "named",
      label: "天智4年（665年）社伝伝承",
      precision: "broad-range",
    },
    places: [{ name: "王城神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 177,
          endLine: 183,
          quote:
            "現地の「王城神社由来記」によると、王城神社の始まりは天智天皇4年（665年）。それまでは武甕槌命と相殿で四王寺山に祀られていた事代主命を、筑前国衙庄（現在の通古賀五丁目、旧小字扇屋敷）に移したことに由来すると説明されている。神社名は、四王寺山を王城山と呼び、そこに祀られた神を王城大明神と崇めたことによるという。この由緒は船賀法印の「王城神社縁起」に基づく伝承であり、四王寺山の信仰と、現在の通古賀の神社を結びつける地域の伝承として重要である。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-020",
    statement:
      "王城神社は天正6年（1578年）の秋月勢の兵火で焼失後、領主・小早川隆景の寄進により再建され、戦国末期の武家領主による地域社寺復興の歴史を宿す。",
    subject: { name: "王城神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "天正6年（1578年）秋月勢兵火焼失と領主・小早川隆景による王城神社再建",
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
      label: "天正6年（1578年）〜戦国・近世",
      precision: "broad-range",
    },
    places: [{ name: "王城神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 190,
          endLine: 192,
          quote:
            "1578年：高橋紹運を攻めた秋月勢の兵火で社殿が焼失。その後：領主・小早川隆景の寄進を受けて再建。1872年：旧水城村の村社に指定。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-021",
    statement:
      "王城神社の「宮座お籠り神事」は太宰府市民遺産第18号に認定されており、春籠り（農作業開始祈願）・夏籠り（田植え終了感謝）・秋の宮座お籠り（五穀豊穣感謝）という農事暦に即した地域共同体の祭祀自治が今なお実践されている。",
    subject: { name: "王城神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "太宰府市民遺産第18号・王城神社の農事暦宮座お籠り神事（春・夏・秋）",
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
      label: "中世・近世〜現代（太宰府市民遺産）",
      precision: "broad-range",
    },
    places: [{ name: "王城神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 198,
          endLine: 212,
          quote:
            "王城神社の「宮座お籠り」神事および「真魚箸料理」は、太宰府市民遺産第18号に認定されている。王城神社では、農事暦に合わせて年3回のお籠り神事が行われる。春籠り：農作業開始にあたって豊作を祈願。夏籠り：田植え終了への感謝と稲の成長・豊作祈願。秋の宮座お籠り：土地の平和と五穀豊穣への感謝。農作業の進行に合わせて、地域共同体が神事を行い、直会の宴席を設ける仕組みが残っている。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-022",
    statement:
      "秋の宮座お籠りで行われる「真魚箸料理」は、二人の料理人が向かい合い、神饌の懸鯛に手を触れず真魚箸と包丁のみで調理する対面式の古式包丁儀礼を継承する極めて稀有な神事である。",
    subject: { name: "王城神社", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "真魚箸料理（二人の料理人による対面式古式包丁神饌調理儀礼）",
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
      label: "近世〜現在",
      precision: "broad-range",
    },
    places: [{ name: "王城神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 215,
          endLine: 225,
          quote:
            "秋の宮座お籠りで行われる、非常に特徴的な神事。神前に供える懸鯛を、手で直接触れずに調理する。自治会長から任命された二人の料理人が向かい合う。真魚箸と包丁を使う。真魚箸で鯛を押さえながら包丁を入れる。調理した鯛を神前に供える。という形式。一般に「包丁式」と呼ばれる儀式に近いが、二人の料理人が対面して行う形式は全国的にも珍しいという。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-023",
    statement:
      "王城神社の由緒（665年移座伝承）と、現在氏子集団によって継承されている宮座お籠り・真魚箸料理の実態は、史料上の確定性と民俗的継承の事実として峻別して評価されるべきである。",
    subject: { name: "王城神社", type: "Place" },
    predicate: "interprets",
    object: {
      kind: "entity",
      entity: {
        name: "王城神社の社伝由緒と現在継承される宮座祭祀実態の峻別評価",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "hypothesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "unverified", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "古代〜現代",
      precision: "broad-period",
    },
    places: [{ name: "王城神社", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 227,
          endLine: 248,
          quote:
            "案内板自身が由来は不明としているため、古代祭祀からの直接的な継承と断定することはできない。しかし、地域固有の祭祀が現在まで受け継がれていることは確かである。王城神社では、665年の移座という伝承と、現在まで継承されている宮座お籠り・真魚箸料理を確認できた。由緒の古さをそのまま史実とするのではなく、史料上の確実性と、現在まで続く祭祀の実態を分けて評価することが重要。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-dazaifu-024",
    statement:
      "大宰府の歴史的性格は、政庁・官衙・客館が象徴する「古代国家の外交・軍事中枢」という中央的側面と、榎社・王城神社が示す「御霊信仰の定着と地域共同体による農耕祭祀の自律的継承」という重層構造によって形成されている。",
    subject: { name: "大宰府客館跡", type: "Place" },
    predicate: "witnesses",
    object: {
      kind: "entity",
      entity: {
        name: "大宰府空間の多重地層構造（外交軍事中枢・御霊信仰・地域宮座農耕祭祀）",
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
      label: "古代〜現代の重層構造",
      precision: "broad-range",
    },
    places: [
      { name: "大宰府客館跡", role: "subject_place" },
      { name: "榎社（府の南館・神幸式御旅所）", role: "evidence_place" },
      { name: "王城神社", role: "evidence_place" },
      { name: "太宰府天満宮", role: "evidence_place" },
    ],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: docFieldVisitId,
          documentSha256: fieldVisitSha256,
          startLine: 278,
          endLine: 289,
          quote:
            "弥生時代の稲作、沖ノ島の海上祭祀、筑紫君磐井の政治的な存在感。そこから古代大宰府の外交・行政機能へ進み、さらに道真の御霊信仰、地域の神社祭祀へとつながっていった。特に印象的だったのは、榎社と王城神社の対比である。榎社：古代の官人の官舎が、道真の記憶と御霊信仰の場所になった。王城神社：四王寺山の神を移したという由緒を持ち、地域の農耕祭祀を現在まで継承している。大宰府という政治都市の歴史だけでなく、その周囲に暮らす人々が土地と神々をどのように結びつけてきたか。今回は、その両方を見ることができた探索だった。",
        },
      },
    ],
    createdAt: "2026-11-07T10:00:00Z",
  },
];

const connections = [
  {
    id: "connection-dazaifu-enoki-tenmangu",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "ENOKISHA / TRAVEL / TENMANGU",
    title: "榎社御旅所・太宰府天満宮 神幸式渡御回廊（官舎謫居から御霊慰撫へ）",
    summary:
      "康和3年（1101年）大江匡房によって創始された神幸式大祭を通じ、菅原道真の配流官舎跡（府の南館・榎社）と慰霊中枢（天満宮本殿）を結ぶ900年以上の御霊鎮魂動線を捉える。",
    spotIds: [
      "spot-enoki-sha",
      "spot-dazaifu-tenmangu",
    ],
    claimIds: [
      "claim-dazaifu-015",
      "claim-dazaifu-017",
      "claim-dazaifu-024",
    ],
    concepts: [
      "榎社",
      "府の南館",
      "菅原道真",
      "大江匡房",
      "神幸式大祭",
      "御旅所",
      "御霊信仰",
      "太宰府天満宮",
    ],
    facets: [
      { id: "route", label: "神幸式渡御動線", weight: 5 },
      { id: "religious", label: "天神御霊信仰", weight: 5 },
      { id: "spatial", label: "官舎から聖地への用途転換", weight: 4 },
    ],
    lensId: "route",
    topicId: "dazaifu-defense-preset",
    eras: [
      {
        id: "era-dazaifu-shinkoshiki",
        label: "平安末期神幸式大祭創始と御旅所渡御",
        range: "康和3年（1101年）〜現在",
        mapLabel: "榎社御旅所・天満宮本殿 神幸式渡御回廊",
        mapLayer: "religious",
        spotIds: [
          "spot-enoki-sha",
          "spot-dazaifu-tenmangu",
        ],
        claimIds: [
          "claim-dazaifu-015",
          "claim-dazaifu-017",
        ],
      },
    ],
  },
  {
    id: "connection-dazaifu-kyakukan-enoki",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "KYAKUKAN / ADMINISTRATIVE / MINAMINOKATA",
    title: "古代大宰府官衙軸：客館跡・府の南館（国際外交迎賓と官僚宿舎）",
    summary:
      "古代大宰府条坊の西端に位置する迎賓施設「客館跡」と高級官人宿舎「府の南館（榎社）」を結び、大陸外交使節を迎賓・統御した国際都市機構を捉える。",
    spotIds: [
      "spot-dazaifu-kyakukan",
      "spot-enoki-sha",
    ],
    claimIds: [
      "claim-dazaifu-014",
      "claim-dazaifu-015",
    ],
    concepts: [
      "大宰府客館跡",
      "府の南館",
      "榎社",
      "鴻臚館",
      "古代官衙都市",
      "外交迎賓",
    ],
    facets: [
      { id: "politics", label: "古代官衙外交機構", weight: 5 },
      { id: "spatial", label: "条坊都市空間", weight: 4 },
    ],
    lensId: "politics",
    topicId: "dazaifu-defense-preset",
    eras: [
      {
        id: "era-dazaifu-kyakukan-axis",
        label: "古代大宰府官衙・客館迎賓都市",
        range: "奈良時代〜平安初期",
        mapLabel: "古代客館跡と南館官衙軸",
        mapLayer: "domain",
        spotIds: [
          "spot-dazaifu-kyakukan",
          "spot-enoki-sha",
        ],
        claimIds: [
          "claim-dazaifu-014",
          "claim-dazaifu-015",
        ],
      },
    ],
  },
  {
    id: "connection-dazaifu-tenmangu-shigasha",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "TENMANGU / MARITIME / SHIGASHA",
    title: "太宰府天満宮境内海神奉斎軸：本殿・志賀社（天神空間に包摂された阿曇海神）",
    summary:
      "天満宮境内最古の社殿（1458年・国重文）を有する志賀社と本殿を結び、内陸の学問・御霊信仰中枢において玄界灘の志賀海神社と同根の綿津見三神（海神）が別格として奉斎され続ける多層的祭祀構造を捉える。",
    spotIds: [
      "spot-dazaifu-tenmangu",
      "spot-dazaifu-shiga-sha",
    ],
    claimIds: [
      "claim-dazaifu-009",
      "claim-dazaifu-010",
    ],
    concepts: [
      "太宰府天満宮",
      "志賀社",
      "綿津見三神",
      "志賀海神社",
      "阿曇氏",
      "室町再建重要文化財",
    ],
    facets: [
      { id: "mythology", label: "海神信仰包摂", weight: 5 },
      { id: "religious", label: "境内多層信仰", weight: 4 },
    ],
    lensId: "mythology",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-tenmangu-shigasha-maritime",
        label: "天満宮境内における海神（綿津見三神）の別格奉斎",
        range: "室町時代（1458年再建）〜現在",
        mapLabel: "天満宮境内海神奉斎軸（志賀社）",
        mapLayer: "maritime",
        spotIds: [
          "spot-dazaifu-tenmangu",
          "spot-dazaifu-shiga-sha",
        ],
        claimIds: [
          "claim-dazaifu-009",
          "claim-dazaifu-010",
        ],
      },
    ],
  },
  {
    id: "connection-dazaifu-tenmangu-kyuhaku",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "KYUHAKU / MATERIAL CULTURE / TENMANGU",
    title: "天満宮・九州国立博物館 信仰空間と古代東アジア物質文化連動軸",
    summary:
      "天満宮背後の丘陵を貫くトンネルで直結された九州国立博物館と境内を結び、展示された青銅鏡・沖ノ島出土品・磐井資料などの古代物質文化と、近世・現代の天神信仰・学術知の共生を捉える。",
    spotIds: [
      "spot-dazaifu-tenmangu",
      "spot-kyushu-national-museum",
    ],
    claimIds: [
      "claim-dazaifu-001",
      "claim-dazaifu-002",
      "claim-dazaifu-007",
      "claim-dazaifu-024",
    ],
    concepts: [
      "九州国立博物館",
      "太宰府天満宮",
      "卑弥呼の鏡展",
      "三角縁神獣鏡",
      "沖ノ島出土品",
      "物質文化",
    ],
    facets: [
      { id: "politics", label: "古代物質文化連動", weight: 5 },
      { id: "spatial", label: "信仰空間と学術知", weight: 4 },
    ],
    lensId: "politics",
    topicId: "sankakubuchi-alliance-preset",
    eras: [
      {
        id: "era-kyuhaku-tenmangu-knowledge",
        label: "古代東アジア交流物質文化と現代学術発信",
        range: "現代（2005年開館）",
        mapLabel: "九州国立博物館と天満宮知見結合",
        mapLayer: "modern",
        spotIds: [
          "spot-dazaifu-tenmangu",
          "spot-kyushu-national-museum",
        ],
        claimIds: [
          "claim-dazaifu-001",
          "claim-dazaifu-002",
          "claim-dazaifu-024",
        ],
      },
    ],
  },
  {
    id: "connection-dazaifu-mizuki-ojojinja",
    connectionKind: "documented",
    initialStatus: "confirmed",
    eyebrow: "MIZUKI / SHIOJI & TONOKOGA / OJO",
    title: "水城・官道と通古賀王城神社 四王寺山防衛・宮座農耕軸",
    summary:
      "白村江防衛の水城・大野城（四王寺山）と通古賀の王城神社を結び、天智4年（665年）四王寺山からの事代主命移座伝承と、太宰府市民遺産「宮座お籠り」「真魚箸料理」という地域共同体の生きた農耕祭祀自治を捉える。",
    spotIds: [
      "spot-mizuki-fortification",
      "spot-ojo-jinja-tonokoga",
    ],
    claimIds: [
      "claim-dazaifu-019",
      "claim-dazaifu-021",
      "claim-dazaifu-022",
      "claim-dazaifu-024",
    ],
    concepts: [
      "水城",
      "四王寺山",
      "大野城",
      "王城神社",
      "事代主命",
      "小早川隆景",
      "宮座お籠り",
      "真魚箸料理",
      "太宰府市民遺産",
    ],
    facets: [
      { id: "route", label: "防衛拠点と村落祭祀", weight: 5 },
      { id: "religious", label: "市民遺産宮座神事", weight: 5 },
    ],
    lensId: "route",
    topicId: "dazaifu-defense-preset",
    eras: [
      {
        id: "era-mizuki-tonokoga-ojo",
        label: "四王寺山防衛山城伝承と通古賀宮座神事",
        range: "天智4年（665年伝承）〜現代",
        mapLabel: "四王寺山伝承と通古賀王城神社宮座軸",
        mapLayer: "domain",
        spotIds: [
          "spot-mizuki-fortification",
          "spot-ojo-jinja-tonokoga",
        ],
        claimIds: [
          "claim-dazaifu-019",
          "claim-dazaifu-021",
          "claim-dazaifu-022",
        ],
      },
    ],
  },
];

const newJourney = {
  id: "journey-dazaifu-himiko-mirrors-2026-11-07",
  label: "太宰府探訪と卑弥呼の鏡展（古代国家都市と多層祭祀）",
  documentIds: [docFieldVisitId, docEssayId],
  spotIds: spots.map((s) => s.id),
  connectionIds: connections.map((c) => c.id),
};

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

console.log("Import dazaifu journey completed successfully!");
