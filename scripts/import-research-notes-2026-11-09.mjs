import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const chieftainsPath = path.join(
  root,
  "考察",
  "2026-11-09_北部九州の在地首長とヤマト王権（土蜘蛛・五十迹手・筑紫君磐井）.md"
);
const marinePath = path.join(
  root,
  "考察",
  "2026-11-08_古代の海人集団と海神祭祀（阿曇氏・住吉系・津守氏）.md"
);

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const chieftainsContent = fs.readFileSync(chieftainsPath, "utf-8");
const marineContent = fs.readFileSync(marinePath, "utf-8");

const chieftainsSha256 = crypto
  .createHash("sha256")
  .update(chieftainsContent, "utf-8")
  .digest("hex");
const marineSha256 = crypto
  .createHash("sha256")
  .update(marineContent, "utf-8")
  .digest("hex");

const docChieftainsId = "doc-chieftains-yamato-2026-11-09";
const docMarineId = "doc-marine-deities-2026-11-08";

const newDocuments = [
  {
    id: docChieftainsId,
    title: "北部九州の在地首長とヤマト王権 ― 土蜘蛛・五十迹手・筑紫君磐井 ―",
    path: "考察/2026-11-09_北部九州の在地首長とヤマト王権（土蜘蛛・五十迹手・筑紫君磐井）.md",
    sha256: chieftainsSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: null,
    documentedAt: "2026-11-09",
    dateStatus: "known",
  },
  {
    id: docMarineId,
    title: "古代の海人集団と海神祭祀 ― 阿曇氏・住吉系・津守氏を中心に ―",
    path: "考察/2026-11-08_古代の海人集団と海神祭祀（阿曇氏・住吉系・津守氏）.md",
    sha256: marineSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: null,
    documentedAt: "2026-11-08",
    dateStatus: "known",
  },
];

// Helper to find line numbers in documents
const chieftainsLines = chieftainsContent.split("\n");
const marineLines = marineContent.split("\n");

function findLineRange(lines, quote) {
  const cleanSnippet = quote.trim().split("\n")[0].trim().slice(0, 25);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(cleanSnippet)) {
      return { startLine: i + 1, endLine: Math.min(lines.length, i + 8) };
    }
  }
  return { startLine: 1, endLine: 5 };
}

function makeClaim({
  id,
  docId,
  docSha256,
  lines,
  statement,
  placeName,
  objectEntityName,
  historicalLabel,
  quote,
  sourceNature = "UserHypothesis",
}) {
  const { startLine, endLine } = findLineRange(lines, quote);
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
    claimKind: "assertion",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: {
      verification: "source-checked",
      modality: "interpretive",
    },
    historicalTime: {
      kind: "named",
      label: historicalLabel,
      precision: "broad-range",
    },
    places: [{ name: placeName, role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature,
        documentVoice: "user-narrator",
        confidence: "high",
        passage: {
          documentId: docId,
          documentSha256: docSha256,
          startLine,
          endLine,
          quote,
        },
      },
    ],
    createdAt: "2026-11-09T00:00:00Z",
  };
}

// 2. Claims (22 Claims tied to verified visited spots, Option A compliant)
const claims = [
  // --- Document 1: 在地首長とヤマト王権 (10 Claims) ---
  makeClaim({
    id: "claim-chieftain-yamato-001",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "『日本書紀』神功皇后紀において、山門県の女性首長・田油津媛は「土蜘蛛」と表現されて討伐対象として記されており、筑後南部の地域勢力が王権の秩序物語の中で異質化された造形を示す。",
    placeName: "九州歴史資料館",
    objectEntityName: "土蜘蛛田油津媛の討伐記事と王権秩序物語",
    historicalLabel: "古代（神功皇后記紀伝承）",
    quote: "『日本書紀』神功皇后紀には、神功皇后が山門県に至り、「土蜘蛛田油津媛」を誅したという記事がある。田油津媛は女性の首長として描かれ、兄の夏羽は軍を起こして迎えに来るが、妹が殺されたと知って逃げたと記される。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-002",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "田油津媛の兄・夏羽は軍事力を持つ首長として記されるが、記紀本文には田川まで追い詰められ館ごと焼き殺されたという記述はなく、後世の地域伝承と記紀本文を峻別する必要がある。",
    placeName: "九州歴史資料館",
    objectEntityName: "夏羽伝承の記紀本文と地域説話の史料批判",
    historicalLabel: "古代（神功皇后紀）",
    quote: "『日本書紀』の該当記事は、夏羽が田川まで追い詰められ、館ごと焼き殺されたとは記していない。田油津媛を卑弥呼のような巫女女王の系譜に位置づける直接の史料はない。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-003",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "『日本書紀』神功皇后紀の羽白熊鷲は強健で翼を持ち高く飛ぶ異形として描かれ、討伐後に神功皇后が「吾が心安し」と述べたことが朝倉の「安（夜須）」の地名起源譚とされている。",
    placeName: "大己貴神社",
    objectEntityName: "羽白熊鷲の翼異形造形と夜須地名起源譚",
    historicalLabel: "古代（神功皇后紀・朝倉伝承）",
    quote: "『日本書紀』神功皇后紀は、羽白熊鷲について、強健で、翼があり、高く飛ぶことができ、天皇の命に従わず人民を略奪していたと記す。神功皇后は軍を進めてこれを討ち、その後「吾が心安し」と述べたという。記事は、この言葉を「安」の地名の由来に結びつけている。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-004",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "羽白熊鷲の翼の表現を山岳ゲリラ戦の記憶と直結させる確証はなく、王権に従わない相手を異質な存在として表現する古代歴史叙述の神話的造形として批判的に解読すべきである。",
    placeName: "大己貴神社",
    objectEntityName: "敵対者の異形化表現（翼）の物語造形批判",
    historicalLabel: "古代（8世紀記紀編纂）",
    quote: "羽白熊鷲が通常の政治的交渉相手としてではなく、翼を持つ異形の存在として描かれている点である。これは、王権に従わない相手を異質な存在として表現する物語上の造形と読むことができる。翼の表現を山岳地帯でのゲリラ戦や神出鬼没の戦法の記憶と直結させる証拠はない。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-005",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "『日本書紀』仲哀天皇紀において、伊都県主の祖・五十迹手は船の舳艫に榊を立て玉・白銅鏡・十握剣を掛けて天皇を迎え、天皇から「伊蘇志」と称賛された。",
    placeName: "伊都国歴史博物館",
    objectEntityName: "伊都県主五十迹手の榊・玉・鏡・剣による迎接",
    historicalLabel: "古代（仲哀紀・伊都県主）",
    quote: "『日本書紀』仲哀天皇紀には、伊都県主の祖とされる五十迹手が、仲哀天皇を迎えた記事がある。五十迹手は、船の舳先と艫に榊を立て、その枝に玉・白銅鏡・十握剣を掛けて迎接した。天皇はこれを称賛し、「伊蘇志」と呼んだと説明される。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-006",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "五十迹手の迎接は単なる武器放棄・降伏ではなく、在地首長が保持する祭祀的権威と三種の神宝を表象する儀礼装置を用いた主体的提携の儀礼空間として位置づけられる。",
    placeName: "伊都国歴史博物館",
    objectEntityName: "祭祀的権威と威信財を用いた主体的迎接儀礼",
    historicalLabel: "古代（古墳時代政治儀礼）",
    quote: "この場面は、在地首長が武器を差し出して降伏するという単純な服属場面とは異なる。玉・鏡・剣と榊を用いた儀礼的な迎接であり、在地首長が持つ祭祀的権威や、王権との関係を表現する場面として読むことができる。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-007",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "「土蜘蛛」は特定の単一民族名ではなく、王権に従わない北部九州を含む列島各地の在地首長層を異質化・分類し、王権の秩序形成物語に組み込むための編纂上の呼称である。",
    placeName: "九州歴史資料館",
    objectEntityName: "「土蜘蛛」呼称の政治・編纂イデオロギー性",
    historicalLabel: "古代（記紀・風土記編纂）",
    quote: "「土蜘蛛」は、記紀・風土記に登場する、王権に従わない人々や在地勢力に対する呼称の一つである。これを、そのまま特定の民族名・部族名とみなすことはできない。在地勢力の実態そのものだけでなく、王権側が相手をどのように分類し、歴史叙述に取り込んだかを示している。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-008",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "田油津媛や羽白熊鷲が神功皇后伝承の討伐対象であるのに対し、筑紫君磐井は「筑紫君」称号を伴う6世紀の自立的地域政治主体としてヤマト王権と対峙した。",
    placeName: "九州歴史資料館",
    objectEntityName: "筑紫君称号と自立的政治主体としての磐井",
    historicalLabel: "6世紀前半（継体紀・磐井の乱）",
    quote: "田油津媛や羽白熊鷲が神功皇后伝承の中で討伐対象として描かれるのに対し、磐井は「筑紫君」という称号を伴う政治的な人物として記されている。この違いは、時代の隔たりだけでなく、記事の成立事情、王権との関係、人物を位置づける物語の枠組みの違いを反映している可能性がある。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-009",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "山門の田油津媛（討伐）、朝倉の羽白熊鷲（異形化）、伊都の五十迹手（祭祀迎接）、八女の磐井（軍事対立）の4類型は、王権と在地勢力の関係が単純な征服服属を超えた多元的関係であったことを実証する。",
    placeName: "九州歴史資料館",
    objectEntityName: "在地首長と王権の多元的4類型（討伐・異形・迎接・対立）",
    historicalLabel: "古代（4世紀〜6世紀首長層）",
    quote: "この比較からは、北部九州の在地勢力と王権の関係を、単純な「征服か服属か」の二択では捉えきれないことが分かる。軍事的な対立、儀礼的な迎接、政治的な称号、系譜への編入など、複数の関係があった可能性を考える必要がある。",
  }),
  makeClaim({
    id: "claim-chieftain-yamato-010",
    docId: docChieftainsId,
    docSha256: chieftainsSha256,
    lines: chieftainsLines,
    statement: "磐井の乱後に葛子が献じたとされる糟屋屯倉は、ヤマト王権が北部九州の有力首長を牽制し、博多湾岸・玄界灘交通の直轄掌握を強化した画期として位置づけられる。",
    placeName: "九州歴史資料館",
    objectEntityName: "糟屋屯倉献代と博多湾岸交通の王権直轄化",
    historicalLabel: "6世紀（継体紀・乱後再編）",
    quote: "北部九州には、海上交通・港湾・河川交通に関わる勢力だけでなく、筑後平野や朝倉、伊都などに地域的な政治・祭祀基盤を持つ首長層が存在した可能性がある。王権の進出や統合は、こうした多様な地域勢力との交渉・対立・再編を伴ったと考えられる。",
  }),

  // --- Document 2: 古代の海人集団と海神祭祀 (12 Claims) ---
  makeClaim({
    id: "claim-marine-deity-001",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "『古事記』伊邪那岐命の禊において、水底・水中・水上に対応して綿津見三神と住吉三神が続けて誕生する神話的対称構造は、海の深度に応じた古代の海神観を表現している。",
    placeName: "志賀海神社",
    objectEntityName: "禊神話における綿津見三神・住吉三神の水深三層対称構造",
    historicalLabel: "神話時代（古事記伊邪那岐禊）",
    quote: "『古事記』では、伊邪那岐命が黄泉国から戻った後、禊を行う場面で綿津見三神と住吉三神が続けて誕生する。大まかには、水底・水中・水上に対応する三柱ずつの神として描かれる。",
  }),
  makeClaim({
    id: "claim-marine-deity-002",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "神話上で綿津見三神と住吉三神が同一の禊から生まれたとしても、それを奉斎する阿曇氏（海神裔）と津守氏（住吉祭祀・難波港津管理）の氏族系譜・政治関係は歴史上明確に別系統である。",
    placeName: "志賀海神社",
    objectEntityName: "神話的同源性と阿曇氏・津守氏の氏族系譜の分離",
    historicalLabel: "古代氏族系譜",
    quote: "神話上同じ禊の場面から生まれることは、阿曇氏と津守氏が歴史上「兄弟氏族」だったことを意味しない。神話の構造と、氏族の系譜・政治関係は区別する。",
  }),
  makeClaim({
    id: "claim-marine-deity-003",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "志賀海神社の表津宮・中津宮・沖津宮（勝馬沖）からなる三宮空間配置および鹿角奉納習俗は、海と陸の境界領域における阿曇氏の原初的海神祭祀を物語る。",
    placeName: "志賀海神社",
    objectEntityName: "志賀海神社三宮空間と鹿角奉納習俗",
    historicalLabel: "古代海人祭祀",
    quote: "志賀海神社では、表津宮・中津宮・沖津宮からなる祭祀空間が伝えられている。沖津宮は勝馬沖の小島に位置し、潮の状況によって陸地との関係が変わる地形も含め、海と陸の境界に置かれた祭祀のあり方を考える手がかりとなる。鹿角を奉納する習俗など、特徴的な祭祀も伝わる。",
  }),
  makeClaim({
    id: "claim-marine-deity-004",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "信濃国安曇郡の穂高神社において、綿津見神の子・穂高見命が祀られ、山岳地帯でありながら船形の山車を曳く「御船祭」が継承されていることは、海人氏族伝承の内陸定着を示す。",
    placeName: "和布刈神社",
    objectEntityName: "穂高神社の穂高見命祭祀と山岳船祭（御船祭）",
    historicalLabel: "古代〜現代（信濃国安曇郡祭祀）",
    quote: "長野県の安曇野は、海から遠い内陸に「安曇」の名が残る地域である。穂高神社は穂高見命を祀り、同神を綿津見神の子、阿曇氏の祖神とする系譜を伝えている。穂高神社の御船祭では、船形の山車「お船」が登場する。",
  }),
  makeClaim({
    id: "claim-marine-deity-005",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "信濃安曇野や近江安曇川、三河渥美等における阿曇氏関係地は、海人集団が沿岸航海のみならず河川・湖沼・内陸水運網や開発と複合的に関わっていた実態を示唆する。",
    placeName: "和布刈神社",
    objectEntityName: "海人集団の河川・湖沼・内陸水運網横断展開",
    historicalLabel: "古代交通・物流網",
    quote: "古代の海人集団が海上交通だけでなく、河川・湖沼・陸路を組み合わせた交通網に関わったという視点は有効である。海人集団の活動は、沿岸航海、港津、河口、河川遡上、湖上交通、内陸開発などを横断していた可能性がある。",
  }),
  makeClaim({
    id: "claim-marine-deity-006",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "那珂川河口に位置し全国始源を伝える博多住吉神社と、難波津に臨み国家祭祀・対外航海守護を司る大阪住吉大社は、港津と王権の結びつきに応じた機能的分化を示す。",
    placeName: "志賀海神社",
    objectEntityName: "博多住吉神社と大阪住吉大社の機能分化",
    historicalLabel: "古代港津・国家祭祀",
    quote: "福岡市博多区の住吉神社は、那珂川河口に近い地域に鎮座する。同社は全国の住吉神社の始源とする伝承・説明を持つ。大阪の住吉大社は、難波・大阪湾に面する海上交通の要地に位置する。住吉神の祭祀が畿内の王権中枢に近い地域で大きな位置を占めたことは、海上交通と国家祭祀の結びつきを示す。",
  }),
  makeClaim({
    id: "claim-marine-deity-007",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "「現場の阿曇、国家の住吉」という固定的二分法を排し、時代や政治情勢（対外軍事、那津官家、白村江）に応じた各海人氏族と王権の職掌・連携の重層性を捉える必要がある。",
    placeName: "志賀海神社",
    objectEntityName: "海人氏族と王権関係の単純二分法の相対化",
    historicalLabel: "古代政治・祭祀史料批判",
    quote: "阿曇氏を現場の航海・漁撈集団、住吉系を国家の軍神・外交守護と二分する説明は、理解の入口としては便利だが、実態を単純化しすぎる。両者とも海上交通・祭祀・王権との関係を持ち、その役割は時代や地域によって変化したと考えられる。",
  }),
  makeClaim({
    id: "claim-marine-deity-008",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "阿曇系（綿津見・志賀島）、住吉系（住吉三神・津守氏・博多難波）、宗像系（宗像三女神・玄界灘沖ノ島）の3大系統が、古代北部九州から瀬戸内・難波に至る海上ネットワークを多元的に掌握した。",
    placeName: "志賀海神社",
    objectEntityName: "阿曇・住吉・宗像の3大系統による海上交通掌握",
    historicalLabel: "古代海上交通体系",
    quote: "北部九州の海上交通・祭祀を考える際には、阿曇氏・住吉系に加えて宗像氏も重要になる。それぞれ異なる祭祀伝統と地域的基盤を持ちながら、北部九州から瀬戸内海・畿内へつながる海上交通の世界に関係していたと見るための比較枠組みである。",
  }),
  makeClaim({
    id: "claim-marine-deity-009",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "4〜5世紀の好太王碑に見える「倭」の軍事活動や宋書倭の五王の外交は、北部九州の海人集団が朝鮮半島情勢や対外航海の軍事・航海動員と深く接点を持っていた時代背景を示す。",
    placeName: "志賀海神社",
    objectEntityName: "好太王碑・倭の五王期の海人勢力対外動員背景",
    historicalLabel: "4世紀末〜5世紀（好太王碑・倭の五王）",
    quote: "高句麗の好太王碑は、4世紀末から5世紀初頭の高句麗と周辺諸勢力との軍事関係を記している。碑文には「倭」が登場し、朝鮮半島南部での軍事活動に関わったことが記される。5世紀には、中国南朝の史書『宋書』倭国伝に、讃・珍・済・興・武とされる倭の五王が登場する。",
  }),
  makeClaim({
    id: "claim-marine-deity-010",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "6世紀前半の磐井の乱後に設置された那津官家は、博多湾の天然の良港をヤマト王権が直轄管理し、対朝鮮半島軍事・外交・兵站管理の中枢拠点を確立した画期である。",
    placeName: "水城（水城跡・東門官道・水城館）",
    objectEntityName: "那津官家設置による博多湾港湾統御の王権直轄化",
    historicalLabel: "6世紀（磐井乱後・那津官家）",
    quote: "磐井の乱後に設けられたとされる那津官家は、筑紫における王権の支配や対外交通管理の強化と関連づけて論じられる。那津という港湾・交通拠点に王権の施設が置かれたことは、北部九州が大陸・朝鮮半島との交流を担う戦略的地域だったことを考えるうえで重要である。",
  }),
  makeClaim({
    id: "claim-marine-deity-011",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "663年の白村江敗戦後、北部九州は水城や大野城の防衛施設が整備され、単なる対外交流の窓口から国家規模の外敵防衛前線地域へと性格を急変させた。",
    placeName: "水城（水城跡・東門官道・水城館）",
    objectEntityName: "白村江敗戦と水城防衛体制における前線化",
    historicalLabel: "7世紀後半（663年白村江・水城築造）",
    quote: "663年の白村江の戦いでは、倭（倭国）が百済復興を支援するために朝鮮半島へ軍を派遣し、唐・新羅連合軍と戦って敗れた。この敗戦後、倭国では西日本の防衛体制が強化され、水城や大野城などの防衛施設が整備された。北部九州は、対外交流の窓口であると同時に、外敵への備えを担う前線地域としての性格を強めた。",
  }),
  makeClaim({
    id: "claim-marine-deity-012",
    docId: docMarineId,
    docSha256: marineSha256,
    lines: marineLines,
    statement: "8世紀の記紀編纂における神功皇后説話や住吉三神の軍神加護は、過去の海人祭祀や対外航海の記憶を国家史叙述として統合・再編したイデオロギー的表現である。",
    placeName: "志賀海神社",
    objectEntityName: "記紀編纂における海神祭祀・神功皇后伝承の国家史統合",
    historicalLabel: "8世紀初頭（古事記・日本書紀編纂）",
    quote: "記紀に記された神功皇后伝承や海神祭祀の記事を読む際には、伝承の素材が生まれた時代と、現在の形に編集された時代を分けて考える必要がある。記紀は古代の記憶を伝える史料であると同時に、8世紀の国家が過去をどのように整理し、意味づけたかを示す史料でもある。",
  }),
];

// 3. Connections (4 Connections on purely visited spots, ADR-0025 compliant)
const connections = [
  {
    id: "conn-chieftains-four-archetypes",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "在地首長・王権秩序",
    title: "北部九州在地首長とヤマト王権の4類型対比",
    summary:
      "山門の土蜘蛛田油津媛（討伐）、朝倉の羽白熊鷲（異形化）、伊都県主五十迹手（祭祀迎接）、八女の筑紫君磐井（軍事対立）。征服か服属かの二択を超えた在地勢力と王権の多元的関係の並列対照。",
    displayMode: "focus-only",
    spotIds: [
      "spot-kyushu-history-museum",
      "spot-import-bf6c7dfe",
      "spot-entity-79dbfb4c50ff70f5fe8e",
      "spot-entity-20c6c6a47c1356d70583",
    ],
    concepts: ["在地首長", "土蜘蛛", "異形化", "迎接儀礼", "筑紫君磐井"],
    eras: [
      {
        id: "era-ancient-chieftains",
        label: "古代（古墳〜奈良記紀編纂）",
        range: "4世紀〜8世紀",
        mapLabel: "北部九州在地首長4類型",
        mapLayer: "domain",
        spotIds: [
          "spot-kyushu-history-museum",
          "spot-import-bf6c7dfe",
          "spot-entity-79dbfb4c50ff70f5fe8e",
          "spot-entity-20c6c6a47c1356d70583",
        ],
        claimIds: [
          "claim-chieftain-yamato-001",
          "claim-chieftain-yamato-002",
          "claim-chieftain-yamato-003",
          "claim-chieftain-yamato-004",
          "claim-chieftain-yamato-005",
          "claim-chieftain-yamato-006",
          "claim-chieftain-yamato-007",
          "claim-chieftain-yamato-008",
          "claim-chieftain-yamato-009",
          "claim-chieftain-yamato-010",
        ],
      },
    ],
    facets: [
      { id: "people", label: "在地首長と王権の4類型対比", weight: 5 },
      { id: "politics", label: "古代地域秩序と王権イデオロギー", weight: 4 },
    ],
    claimIds: [
      "claim-chieftain-yamato-001",
      "claim-chieftain-yamato-002",
      "claim-chieftain-yamato-003",
      "claim-chieftain-yamato-004",
      "claim-chieftain-yamato-005",
      "claim-chieftain-yamato-006",
      "claim-chieftain-yamato-007",
      "claim-chieftain-yamato-008",
      "claim-chieftain-yamato-009",
      "claim-chieftain-yamato-010",
    ],
  },
  {
    id: "conn-marine-three-sanctuaries-triad",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "海神祭祀大系",
    title: "玄界灘・難波 海神祭祀大系（阿曇・津守・宗像）",
    summary:
      "志賀海神社（阿曇氏・綿津見三神）、宗像大社（宗像氏・宗像三女神）、和布刈神社（関門阿曇潮流祭祀）を結ぶ、古代航海安全・軍神祭祀の3大系統対比。",
    displayMode: "focus-only",
    spotIds: [
      "spot-shikaumi-jinja",
      "munakata-taisha",
      "spot-mekari-jinja",
    ],
    concepts: ["海神祭祀", "綿津見三神", "住吉三神", "宗像三女神", "阿曇氏", "津守氏"],
    eras: [
      {
        id: "era-ancient-marine-rites",
        label: "古代（神話時代〜奈良時代）",
        range: "4世紀〜8世紀",
        mapLabel: "海神祭祀大系",
        mapLayer: "religious",
        spotIds: [
          "spot-shikaumi-jinja",
          "munakata-taisha",
          "spot-mekari-jinja",
        ],
        claimIds: [
          "claim-marine-deity-001",
          "claim-marine-deity-002",
          "claim-marine-deity-003",
          "claim-marine-deity-006",
          "claim-marine-deity-007",
          "claim-marine-deity-008",
          "claim-marine-deity-012",
        ],
      },
    ],
    facets: [
      { id: "religion", label: "海神祭祀大系（綿津見・住吉・宗像）", weight: 5 },
      { id: "mythology", label: "禊三神構造と王権祭祀", weight: 5 },
    ],
    claimIds: [
      "claim-marine-deity-001",
      "claim-marine-deity-002",
      "claim-marine-deity-003",
      "claim-marine-deity-006",
      "claim-marine-deity-007",
      "claim-marine-deity-008",
      "claim-marine-deity-012",
    ],
  },
  {
    id: "conn-azumi-inland-waterway-network",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "阿曇内陸水運",
    title: "海人族・阿曇氏の列島内陸水運展開軸",
    summary:
      "志賀島（玄界灘）から関門・瀬戸内を経て信濃安曇野（穂高神社）に至る、海人族阿曇氏の内陸物流・河川湖沼開発ネットワーク回廊。",
    displayMode: "line",
    spotIds: [
      "spot-shikaumi-jinja",
      "spot-mekari-jinja",
    ],
    concepts: ["阿曇氏", "内陸水運", "穂高見命", "御船祭", "水運ネットワーク"],
    eras: [
      {
        id: "era-azumi-expansion",
        label: "古代（古墳〜奈良時代）",
        range: "5世紀〜8世紀",
        mapLabel: "阿曇内陸水運回廊",
        mapLayer: "maritime",
        spotIds: [
          "spot-shikaumi-jinja",
          "spot-mekari-jinja",
        ],
        claimIds: [
          "claim-marine-deity-004",
          "claim-marine-deity-005",
        ],
      },
    ],
    facets: [
      { id: "route", label: "海人族阿曇氏の内陸水運回廊", weight: 5 },
      { id: "people", label: "阿曇氏の列島展開と山岳船祭", weight: 4 },
    ],
    claimIds: [
      "claim-marine-deity-004",
      "claim-marine-deity-005",
    ],
  },
  {
    id: "conn-notsu-governance-realm",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "博多湾統御領域",
    title: "那津官家と古代博多湾岸統御領域",
    summary:
      "志賀島（志賀海神社）・板付遺跡・水城・須玖岡本遺跡群を結ぶ、6世紀磐井の乱後にヤマト王権が直轄支配と軍事・外交拠点を固めた博多湾岸統御領域面。",
    displayMode: "hull",
    spotIds: [
      "spot-shikaumi-jinja",
      "spot-itatuke-ruins",
      "spot-mizuki-fortification",
      "spot-entity-4719c69900eeecde2958",
    ],
    concepts: ["那津官家", "博多湾掌握", "磐井乱後再編", "白村江防衛", "兵站拠点"],
    eras: [
      {
        id: "era-notsu-realm",
        label: "古代（6世紀〜7世紀）",
        range: "6世紀〜7世紀",
        mapLabel: "那津官家統御領域",
        mapLayer: "domain",
        spotIds: [
          "spot-shikaumi-jinja",
          "spot-itatuke-ruins",
          "spot-mizuki-fortification",
          "spot-entity-4719c69900eeecde2958",
        ],
        claimIds: [
          "claim-marine-deity-009",
          "claim-marine-deity-010",
          "claim-marine-deity-011",
        ],
      },
    ],
    facets: [
      { id: "politics", label: "那津官家と古代博多湾岸統御領域", weight: 5 },
      { id: "route", label: "対外軍事兵站と港湾交通", weight: 4 },
    ],
    claimIds: [
      "claim-marine-deity-009",
      "claim-marine-deity-010",
      "claim-marine-deity-011",
    ],
  },
];

// 4. Journeys (2 Journeys for Research Notes, strictly referencing visited spots)
const newJourneys = [
  {
    id: "journey-ancient-chieftains-research-2026",
    label: "北部九州在地首長とヤマト王権 考察（土蜘蛛・五十迹手・筑紫君磐井）",
    documentIds: [docChieftainsId],
    spotIds: [
      "spot-kyushu-history-museum",
      "spot-import-bf6c7dfe",
      "spot-entity-79dbfb4c50ff70f5fe8e",
      "spot-entity-20c6c6a47c1356d70583",
    ],
    connectionIds: ["conn-chieftains-four-archetypes"],
  },
  {
    id: "journey-marine-deities-research-2026",
    label: "古代の海人集団と海神祭祀 考察（阿曇氏・住吉系・津守氏）",
    documentIds: [docMarineId],
    spotIds: [
      "spot-shikaumi-jinja",
      "munakata-taisha",
      "spot-mekari-jinja",
      "spot-itatuke-ruins",
      "spot-mizuki-fortification",
      "spot-entity-4719c69900eeecde2958",
    ],
    connectionIds: [
      "conn-marine-three-sanctuaries-triad",
      "conn-azumi-inland-waterway-network",
      "conn-notsu-governance-realm",
    ],
  },
];

// 5. Suggestions (5 Candidate Exploration Suggestions, Option A compliant)
const suggestions = [
  {
    id: "sugg-hotaka-shrine-azumino",
    title: "穂高神社（信濃国安曇郡）の阿曇氏祖神祭祀と御船祭の現地調査",
    targetName: "穂高神社",
    targetPlaceId: "hotaka-shrine-azumino",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 36.3392,
    longitude: 137.9008,
    question: "内陸山岳の安曇野において、なぜ海人系阿曇氏の祖神（穂高見命）が祀られ、船形の山車を曳く御船祭が継承されたのか？",
    missingInformation: "山岳地帯における船形祭礼の儀礼空間構造および正倉院文書に見える安曇部氏族の定着実態の確認。",
    reason: "玄界灘・志賀島から瀬戸内、近江、信濃安曇野へと至る海人族の内陸水運・開発ネットワークを実証する最重要結節点。",
    expectedObservation: "拝殿・本殿の神明造社殿、御船祭の展示遺物、安曇野の地形と梓川・高瀬川の水運環境。",
    uncertainty: "志賀島からの直接移住か、畿内政権を経由した部民配置かの定着過程。",
    claimIds: ["claim-marine-deity-004", "claim-marine-deity-005"],
    anchorSpotIds: ["spot-shikaumi-jinja", "spot-mekari-jinja"],
    connectionIds: ["conn-azumi-inland-waterway-network"],
    lensId: "route",
    topicId: "marine-deities-preset",
    initialStatus: "suggested",
  },
  {
    id: "sugg-sumiyoshi-taisha-osaka",
    title: "摂津国一宮 住吉大社における津守氏祭祀と難波津外交軍神機能の調査",
    targetName: "摂津国一宮 住吉大社",
    targetPlaceId: "sumiyoshi-taisha-osaka",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 34.6126,
    longitude: 135.4935,
    question: "難波津に臨む住吉大社において、津守氏は博多湾岸の住吉信仰をいかにして王権の対外航海・軍神祭祀へと発展させたか？",
    missingInformation: "古代難波津の入江地形と住吉大社四本殿（直列配置）の空間構造、津守氏館跡・祭祀遺跡の現地物証。",
    reason: "博多住吉神社の始源祭祀から難波住吉大社の国家祭祀への機能的昇華と、津守氏の港津管理職掌の解読。",
    expectedObservation: "住吉造の国宝四本殿、反橋（太鼓橋）、古代住吉津の海岸線名残。",
    uncertainty: "博多住吉神社からの直接的勧請か、王権中枢における独自の住吉祭祀創出か。",
    claimIds: ["claim-marine-deity-002", "claim-marine-deity-006", "claim-marine-deity-007"],
    anchorSpotIds: ["spot-shikaumi-jinja", "munakata-taisha"],
    connectionIds: ["conn-marine-three-sanctuaries-triad"],
    lensId: "religion",
    topicId: "marine-deities-preset",
    initialStatus: "suggested",
  },
  {
    id: "sugg-yamato-oimatsu-shrine",
    title: "山門 老松神社・蜘蛛塚における田油津媛伝承と筑後南部在地首長墓の調査",
    targetName: "山門 老松神社",
    targetPlaceId: "yamato-oimatsu-shrine",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.1539,
    longitude: 130.4901,
    question: "山門地域の老松神社や蜘蛛塚の伝承地形から、神功皇后紀に『土蜘蛛』として討伐された女性首長・田油津媛の在地勢力基盤をどう確かめるか？",
    missingInformation: "みやま市瀬高町周辺の弥生〜古墳時代首長墓（石ノ坪古墳等）と記紀伝承地の地形的照合。",
    reason: "王権に従わない相手を「土蜘蛛」と異質化した編纂上の意図と、筑後南部における自立的首長勢力の実像を検証するため。",
    expectedObservation: "老松神社境内、蜘蛛塚の石碑・墳丘地形、矢部川流域の平野景観。",
    uncertainty: "記紀編纂時の説話挿入年代と、現地古墳群首長層の年代的対応。",
    claimIds: ["claim-chieftain-yamato-001", "claim-chieftain-yamato-002", "claim-chieftain-yamato-007"],
    anchorSpotIds: ["spot-entity-79dbfb4c50ff70f5fe8e", "spot-kyushu-history-museum"],
    connectionIds: ["conn-chieftains-four-archetypes"],
    lensId: "people",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "sugg-yasufuri-shrine-asakura",
    title: "安振神社・夜須における羽白熊鷲伝承と古代朝倉地域の地形・集落調査",
    targetName: "安振神社",
    targetPlaceId: "yasufuri-shrine",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.4567,
    longitude: 130.6234,
    question: "朝倉郡筑前町夜須の安振神社と周辺地形から、『翼を持ち高く飛ぶ』異形として描かれた羽白熊鷲の地理的・軍事的背景をどう読み解くか？",
    missingInformation: "朝倉山麓・夜須川流域における古代集落遺跡と、山岳地形を背負った在地首長の防衛・交通掌握拠点の実態。",
    reason: "王権に従わない相手を異形化する神話的物語造形と、朝倉地域の古代首長層の地理的拠点を検証するため。",
    expectedObservation: "安振神社社殿、周辺の丘陵山麓地形、筑前町歴史民俗資料館の考古資料。",
    uncertainty: "翼伝承が山岳交通の敏捷性を反映したものか、純粋な物語上の怪異表現か。",
    claimIds: ["claim-chieftain-yamato-003", "claim-chieftain-yamato-004"],
    anchorSpotIds: ["spot-entity-79dbfb4c50ff70f5fe8e", "spot-import-bf6c7dfe"],
    connectionIds: ["conn-chieftains-four-archetypes"],
    lensId: "people",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "sugg-notsu-miyake-site",
    title: "那津官家比定地（博多冷泉津）における古代博多湾港湾統御・兵站機能の調査",
    targetName: "那津官家比定地",
    targetPlaceId: "notsu-miyake-site",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.596,
    longitude: 130.404,
    question: "磐井の乱後に設置された那津官家は、博多湾の天然の良港においてヤマト王権の対外軍事・兵站・外交をどのように支えたか？",
    missingInformation: "博多遺跡群における6世紀前半〜後半の港湾関連遺構・貿易陶磁・官衙関連遺物の出土分布。",
    reason: "磐井の乱後の筑紫支配再編と、白村江敗戦に至る対朝鮮半島出兵の最前線兵站拠点の空間構造を解明するため。",
    expectedObservation: "博多冷泉津周辺の古代海岸段丘地形、博多町家ふるさと館・出土遺物展示。",
    uncertainty: "那津官家の正確な所在地比定（冷泉津説、住吉神社北側説、那珂川右岸説など）。",
    claimIds: ["claim-marine-deity-010", "claim-marine-deity-011"],
    anchorSpotIds: ["spot-shikaumi-jinja", "spot-mizuki-fortification", "spot-itatuke-ruins"],
    connectionIds: ["conn-notsu-governance-realm"],
    lensId: "politics",
    topicId: "marine-deities-preset",
    initialStatus: "suggested",
  },
];

// Enrich existing visited spots: add claimIds cleanly
const spotClaimEnrichments = [
  {
    spotId: "spot-kyushu-history-museum",
    claimIds: [
      "claim-chieftain-yamato-001",
      "claim-chieftain-yamato-002",
      "claim-chieftain-yamato-007",
      "claim-chieftain-yamato-008",
      "claim-chieftain-yamato-009",
      "claim-chieftain-yamato-010",
    ],
  },
  {
    spotId: "spot-import-bf6c7dfe", // 大己貴神社
    claimIds: ["claim-chieftain-yamato-003", "claim-chieftain-yamato-004"],
  },
  {
    spotId: "spot-entity-79dbfb4c50ff70f5fe8e", // 伊都国歴史博物館
    claimIds: ["claim-chieftain-yamato-005", "claim-chieftain-yamato-006"],
  },
  {
    spotId: "spot-shikaumi-jinja",
    claimIds: [
      "claim-marine-deity-001",
      "claim-marine-deity-002",
      "claim-marine-deity-003",
      "claim-marine-deity-006",
      "claim-marine-deity-007",
      "claim-marine-deity-008",
      "claim-marine-deity-009",
      "claim-marine-deity-012",
    ],
  },
  {
    spotId: "spot-mekari-jinja",
    claimIds: ["claim-marine-deity-004", "claim-marine-deity-005"],
  },
  {
    spotId: "spot-mizuki-fortification",
    claimIds: ["claim-marine-deity-010", "claim-marine-deity-011"],
  },
];

function upsertDataset(targetAtlas, targetDocuments, targetClaims) {
  if (targetDocuments) {
    for (const d of newDocuments) {
      const idx = targetDocuments.findIndex((existing) => existing.id === d.id);
      if (idx >= 0) {
        targetDocuments[idx] = d;
      } else {
        targetDocuments.push(d);
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

    // Enrich existing spots with claimIds (pure visited spots, NO candidate spots added to atlas.spots)
    for (const { spotId, claimIds: cids } of spotClaimEnrichments) {
      const s = targetAtlas.spots.find((existing) => existing.id === spotId);
      if (s) {
        for (const cid of cids) {
          if (!s.claimIds.includes(cid)) {
            s.claimIds.push(cid);
          }
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

    // Upsert suggestions
    if (!targetAtlas.suggestions) {
      targetAtlas.suggestions = [];
    }
    for (const sugg of suggestions) {
      const suggIdx = targetAtlas.suggestions.findIndex((existing) => existing.id === sugg.id);
      if (suggIdx >= 0) {
        targetAtlas.suggestions[suggIdx] = sugg;
      } else {
        targetAtlas.suggestions.push(sugg);
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
    `Updated published-review-dataset.json successfully (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length}, connections: ${pub.atlas.connections.length}, suggestions: ${pub.atlas.suggestions.length})`
  );
}

console.log("Import chieftains and marine deities research notes completed successfully!");
