import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const candidatePaths = [
  path.join(root, "旅行記", "nagasaki_exploration_2026-11-15.md"),
  path.join(root, "旅行記", "2026-11-15_長崎市内探索記録.md"),
  "/home/antigravity/nagasaki_exploration_2026-11-15.md",
  "/home/antigravity/upload/nagasaki_exploration_2026-11-15.md",
];

const sourcePath = candidatePaths.find((p) => fs.existsSync(p));

if (!sourcePath) {
  console.log(
    "[import-nagasaki-exploration] Source travelogue file not present in this environment. Skipping re-generation.",
  );
  process.exit(0);
}

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const content = fs.readFileSync(sourcePath, "utf-8");
const docSha256 = crypto
  .createHash("sha256")
  .update(content, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-nagasaki-exploration-2026-11-15";

const newDocument = {
  id: documentId,
  title: "2026年11月15日 長崎市内探索記録（港町の宗教景観・都市文化・海外交流）",
  path: "旅行記/nagasaki_exploration_2026-11-15.md",
  sha256: docSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-11-15",
  documentedAt: "2026-11-15",
  dateStatus: "known",
};

const lines = content.split("\n");

function findLineRange(quote) {
  const cleanSnippet = quote.trim().split("\n")[0].trim().slice(0, 20);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(cleanSnippet)) {
      return { startLine: i + 1, endLine: Math.min(lines.length, i + 14) };
    }
  }
  return { startLine: 1, endLine: 15 };
}

function makeClaim({
  id,
  statement,
  subjectName = "長崎歴史文化博物館",
  predicate = "witnesses",
  objectEntityName,
  objectEntityType = "Concept",
  claimKind = "observation",
  verification = "personal-evidence",
  modality = "asserted",
  sourceNature = "Observation",
  historicalLabel,
  observedPlaceNames = ["長崎歴史文化博物館"],
  quote,
}) {
  const { startLine, endLine } = findLineRange(quote);
  return {
    schemaVersion: "0.2.0",
    id,
    statement,
    subject: { name: subjectName, type: "Place" },
    predicate,
    object: {
      kind: "entity",
      entity: { name: objectEntityName, type: objectEntityType },
    },
    qualifiers: {},
    claimKind,
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification, modality },
    historicalTime: {
      kind: "named",
      label: historicalLabel,
      precision: "broad-range",
    },
    places: observedPlaceNames.map((name) => ({
      name,
      role: "observed_place",
    })),
    evidence: [
      {
        role: "supports",
        sourceNature,
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: docSha256,
          startLine,
          endLine,
          quote,
        },
      },
    ],
    createdAt: "2026-11-15T11:00:00Z",
  };
}

const claims = [
  // 1. 長崎歴史文化博物館 (2 Claims: 001..002)
  makeClaim({
    id: "claim-ngs-2026-001",
    statement:
      "長崎歴史文化博物館の常設展示は出島や長崎奉行所を中心に近世の海外交易と港湾都市史を紹介する構成となっており、縄文・弥生時代などの列島古層に関する展示は極めて乏しく、長崎の都市アイデンティティが近世以降の対外交流に強く依拠していることを示す。",
    subjectName: "長崎歴史文化博物館",
    objectEntityName: "長崎歴史文化博物館の長崎奉行所・海外交易中心展示と列島古層展示希薄性の対比",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代〜現代（近世都市史・博物館展示）",
    observedPlaceNames: ["長崎歴史文化博物館"],
    quote:
      "展示は豪華で、出島や長崎奉行所を中心に、海外交易と長崎の都市史を紹介する構成だった。一方、縄文・弥生時代に関する展示はほとんどなく、今回の関心からすると、そこはやや物足りなかった。",
  }),
  makeClaim({
    id: "claim-ngs-2026-002",
    statement:
      "マリア観音は観音菩薩像を聖母マリアに見立てた潜伏キリシタンの信仰遺物であるが、単なる「キリスト教の仏教への偽装」に還元すべきではなく、観音菩薩の宗教的造形、聖母マリアへの祈念、地域社会の仏教的生活習慣、禁教下での信仰継承が重層した接触領域の新たな信仰形態として捉える必要がある。",
    subjectName: "長崎歴史文化博物館",
    objectEntityName: "マリア観音における観音造形・聖母信仰・仏教的生活習慣・禁教継承の重層的結晶構造",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "江戸時代（禁教期〜潜伏キリシタン信仰継承）",
    observedPlaceNames: ["長崎歴史文化博物館"],
    quote:
      "マリア観音は、観音菩薩像を聖母マリアに見立てたものとして知られる。キリスト教が禁じられた時代、潜伏キリシタンが仏教的な造形を利用しながら信仰を維持した事例である。ここでは、単純にキリスト教が仏教に偽装したという話に還元しないことが重要になる。",
  }),

  // 2. 諏訪神社 (6 Claims: 003..008)
  makeClaim({
    id: "claim-ngs-2026-003",
    statement:
      "諏訪神社の社伝由緒では戦国期に破壊された諏訪・森崎・住吉の三社を1625年（寛永2年）に青木賢清が合祀再興し、1648年（慶安元年）に現在地へ移転したと伝えるが、古代以来の祭祀の直接的継続と無批判に見なすのではなく、近世初期における幕府直轄都市の総鎮守創出と神社空間再編として把握すべきである。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社（1625年青木賢清三社再興・1648年遷宮）の近世初期都市神社再編モデル",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "HistoricalSource",
    historicalLabel: "江戸時代初期（1625年寛永2年〜1648年慶安元年）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "神社の由緒では、戦国時代に諏訪・森崎・住吉の三社が破壊された後、1625年に青木賢清によって再興されたとされる。再興時には三社が合祀され、その後1648年に現在地へ移転したという。現在の諏訪神社を、そのまま古代以来の祭祀空間と見なすのではなく、近世初期の再興と都市における神社再編を重要な成立過程として捉える。",
  }),
  makeClaim({
    id: "claim-ngs-2026-004",
    statement:
      "諏訪神社境内では「病魔退散大楠」内部の日吉社伝承、厳島神社の相殿、および蛭子社の祭神表記の計3箇所に少彦名命（神）が登場するが、それぞれの成立年代や相互関係は未確認であり、蛭子社名と少彦名祭神表記の組み合わせを含め後世の合祀・祭神整理の可能性を考慮しつつ現地案内板の記載を保持する。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社境内3箇所における少彦名命共起（大楠日吉社・厳島相殿・蛭子社祭神表記）と未確定性の保持",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代〜現代（境内小祀配祀・未確定年代）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "特に注目したいのは、少彦名命の祭祀が複数の場所に登場すること。大楠内部の日吉社、厳島神社の相殿、蛭子社の祭神表記。ただし、それぞれの成立年代や関係は未確認。後世の合祀や祭神整理の可能性も含め、現段階では案内板の記載をそのまま保持する。",
  }),
  makeClaim({
    id: "claim-ngs-2026-005",
    statement:
      "諏訪神社境内の「蛙岩」は古図に注連縄と柵が描かれ昭和57年（1982年）長崎大水害後に厄難除け信仰が強化された自然物であるが、古図に描かれた自然岩の存在年代と水害後の厄除け信仰の強化年代は厳密に区別されるべきであり、自然物の古さを直ちに古代祭祀の起源に直結させる解釈は慎む必要がある。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社蛙岩の古図注連縄描写と1982年長崎大水害後の厄難除け信仰重層",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代〜現代（1982年昭和57年長崎大水害以降）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "蛙岩                                古図に注連縄・柵が描かれ、昭和57年の長崎大水害後に厄難除けの信仰が強まった",
  }),
  makeClaim({
    id: "claim-ngs-2026-006",
    statement:
      "諏訪神社境内の「五釐金之碑」は、長崎における対外貿易額の千分の五を積み立てた資金（五釐金）を長崎の公共事業に活用した歴史を記録しており、案内板によれば最終的に1891年（明治24年）完成の本河内水源地水道工事に全額投入されたとされ、海外交易の富が近代都市インフラへ転換された記念碑的痕跡である。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社「五釐金之碑」が示す対外貿易積立資金と1891年本河内水源地近代インフラ転換",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代中期〜明治期（1891年本河内水源地完成）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "五釐金之碑                          貿易額の千分の五を積み立てた資金を、長崎の公共事業に活用した歴史。案内板によれば、最終的には1891年完成の本河内水源地工事に全額投入された。海外交易による富が、近代的な都市インフラへ転換されたことを示す記念碑である。",
  }),
  makeClaim({
    id: "claim-ngs-2026-007",
    statement:
      "諏訪神社境内の「祖霊社」は、文化5年（1808年）フェートン号事件で責任を取り自害した長崎奉行・松平康平（図書頭）の慰霊・顕彰から始まり、その後神社再興に関わった歴代奉行や氏子の祖先等を合祀するに至ったもので、行政官の慰霊が都市共同体の祖霊祭祀へと拡張された重層的経緯を示す。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社祖霊社における1808年フェートン号事件長崎奉行松平康平慰霊から共同体祖霊祭祀への展開",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代後期（1808年文化5年フェートン号事件〜近代）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "祖霊社                              1808年フェートン号事件で責任を取り自害した長崎奉行・松平康平の慰霊から始まる。フェートン号事件の責任を取った長崎奉行の慰霊から始まり、再興に関わった奉行や氏子の祖先などを合祀するようになった。行政官の慰霊が、地域共同体の祖霊祭祀へと広がっていった点が興味深い。",
  }),
  makeClaim({
    id: "claim-ngs-2026-008",
    statement:
      "諏訪神社境内に1879年（明治12年）に建立された「まよひ子志らせ石」は、親と保護者が迷子情報を紙に貼って伝達・照合する機能を有しており、近代初頭の神社境内が単なる宗教的参拝空間にとどまらず、人々が集い支え合う都市の公共情報空間として機能していた実態を具現化している。",
    subjectName: "諏訪神社",
    objectEntityName: "諏訪神社「まよひ子志らせ石」（1879年・明治12年建立）と近代都市境内公共情報空間機能",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "明治期（1879年・明治12年）",
    observedPlaceNames: ["諏訪神社"],
    quote:
      "まよひ子志らせ石                    明治12年建立。迷子の親と保護者をつなぐ仕組み。神社が参拝場所であるだけでなく、参拝者が集まる地域の公共空間として機能していたことが分かる。明治12年という具体的な時代に、迷子の親子をつなぐ仕組みが石碑として残されている。",
  }),

  // 3. 松森天満宮 (5 Claims: 009..013)
  makeClaim({
    id: "claim-ngs-2026-009",
    statement:
      "松森天満宮は1625年（寛永2年）に今博多町に創建され1656年（明暦2年）に現在地へ遷宮したと案内図に記され、菅原道真公・天穂日命・菅原是善命を祀るとともに、諏訪神社再興時（1625年）に三社合祀が行われた場所とされるなど、両社の近世初期における深い歴史的接点を示す。",
    subjectName: "松森天満宮",
    objectEntityName: "松森天満宮（1625年今博多町創建・1656年現在地遷宮）と諏訪神社三社合祀再興の歴史的接点",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "HistoricalSource",
    historicalLabel: "江戸時代初期（1625年寛永2年〜1656年明暦2年）",
    observedPlaceNames: ["松森天満宮"],
    quote:
      "-   1625年：今博多町に創建\n-   1656年：現在地へ遷宮\n祭神は菅原道真公、天穂日命、菅原是善命。江戸時代から学問の神として信仰されてきた。また、諏訪神社の由緒では、1625年の再興時に三社を合祀した場所が松森天満宮の境内だったとされる。",
  }),
  makeClaim({
    id: "claim-ngs-2026-010",
    statement:
      "松森天満宮境内には炉粕町稲荷社、玉崎稲荷社、大学稲荷社、米津稲荷大明神、猿田彦神社（老松社・白太夫社合祀）、水神社、竈三柱神社（下西山神社）、菅原信清命社など多数の小宮が存在し、単一の祭祀計画ではなく各町や職業・生活に関わる多様な信仰が持ち込まれ複合集積した都市型境内構造を呈する。",
    subjectName: "松森天満宮",
    objectEntityName: "松森天満宮境内の多様な小宮群（町名稲荷・猿田彦・水神・竈三柱）と都市職能生活信仰の集積",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代〜現代（境内小宮群・年代未確定）",
    observedPlaceNames: ["松森天満宮"],
    quote:
      "炉粕町稲荷社     稲荷信仰\n玉崎稲荷社       稲荷信仰\n猿田彦神社       老松神社・白太夫神社を合祀\n水神社           水神信仰\n大学稲荷社       稲荷信仰\n竈三柱神社       下西山神社とも表記\n米津稲荷大明神   稲荷信仰\n菅原信清命社     菅原氏に関わる祭祀\nこれらの小宮は、単一の祭祀体系で一斉に配置されたものとは限らない。町ごとの信仰、職業や生活に関係する信仰、個別の奉納、合祀など、異なる成立経緯を持つ可能性がある。",
  }),
  makeClaim({
    id: "claim-ngs-2026-011",
    statement:
      "松森天満宮本殿欄間に奉納された県指定有形文化財「職人尽」（30枚板薄肉浮彫）は、1713年（正徳3年）に長崎奉行所御用指物師・喜兵衛と藤右衛門が彫刻奉納し（小原慶山下絵と推定）、1832年（天保3年）に唐絵目利・石崎融思が彩色したもので、海外貿易都市・長崎の専門職・高度技術・輸入美術鑑定文化が神社の奉納物に直接結晶化した稀有な史料である。",
    subjectName: "松森天満宮",
    objectEntityName: "県指定有形文化財「職人尽」（1713年御用指物師喜兵衛・藤右衛門作、1832年唐絵目利石崎融思彩色）",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代中期〜後期（1713年正徳3年奉納・1832年天保3年彩色）",
    observedPlaceNames: ["松森天満宮"],
    quote:
      "県指定有形文化財「職人尽」。指定年月日：1956年4月6日、奉納：1713年（正徳3年）、作品：30枚の板に職人の姿を薄肉浮彫、彫刻者：御用指物師・喜兵衛、藤右衛門、下絵の作者：不詳。小原慶山の可能性、1832年：唐絵目利・石崎融思が彩色。神社の奉納物に、奉行所の職人・絵師・輸入美術品の専門家が関わっている。",
  }),
  makeClaim({
    id: "claim-ngs-2026-012",
    statement:
      "松森天満宮境内のクスノキ群（7本・市指定天然記念物、最大樹高25m・幹囲7.8m）は、外国人居留地時代の欧米人から玉園山とともに「マウント・オブ・キャンファ（Mount of Camphor）」と呼称されていたと案内板に記録され、大樹群が長崎の都市景観・国際的ランドマークとして認識されていた歴史を伝える。",
    subjectName: "松森天満宮",
    objectEntityName: "松森天満宮クスノキ群（天然記念物）と外国人居留地時代の「マウント・オブ・キャンファ」都市景観",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "江戸時代〜幕末・明治居留地時代（クスノキ社叢景観）",
    observedPlaceNames: ["松森天満宮"],
    quote:
      "市指定天然記念物。指定：1974年6月18日、クスノキ：7本。案内板によれば、居留地時代の外国人は、神社に続く玉園山を「マウント・オブ・キャンファ」と呼んでいたという。クスノキが長崎の都市景観を特徴づける存在だったことが分かる。",
  }),
  makeClaim({
    id: "claim-ngs-2026-013",
    statement:
      "松森天満宮境内に残る「戦利兵器奉納ノ記」は、明治40年（1907年）3月に陸軍大臣・寺内正毅によって日露戦争（明治37・38年役）の戦利品が奉納された記念碑であり、近世の天満宮境内に近代国家の軍事・政治的記憶が刻印・上書きされた実態を示している。",
    subjectName: "松森天満宮",
    objectEntityName: "松森天満宮「戦利兵器奉納ノ記」（1907年・寺内正毅陸軍大臣奉納）と近代国家軍事記憶の刻印",
    claimKind: "observation",
    verification: "personal-evidence",
    modality: "asserted",
    sourceNature: "Observation",
    historicalLabel: "明治後期（1907年・明治40年）",
    observedPlaceNames: ["松森天満宮"],
    quote:
      "明治37・38年役（日露戦争）の戦利品を奉納した記念碑。奉納：明治40年3月、奉納者：陸軍大臣・寺内正毅。碑文には、戦勝の記念、皇運の隆昌、国勢の発揚が記されている。江戸時代の天満宮に、明治国家の軍事的・政治的な記憶が加わっている。",
  }),

  // 4. 出島（出島和蘭商館跡） (2 Claims: 014..015)
  makeClaim({
    id: "claim-ngs-2026-014",
    statement:
      "出島（出島和蘭商館跡）は1951年からの整備開始および1990年代以降の本格的復元事業により江戸時代の建物・街並みが再現されているが、これは江戸時代の特定の時代を選定・再構成した空間であり、現存する基壇遺構・発掘成果・絵図史料・復元の推定部分を学術的に区別して鑑賞・検証する必要がある。",
    subjectName: "出島（出島和蘭商館跡）",
    objectEntityName: "出島（和蘭商館跡）における1951年以降の段階的復元と特定時代再構成・遺構識別の史料批判",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "近世〜現代（1951年整備開始〜1990年代以降の史跡復元）",
    observedPlaceNames: ["出島（出島和蘭商館跡）"],
    quote:
      "長崎市は1951年から整備を開始し、1990年代以降、本格的な復元事業を進めてきた。現在は江戸時代の建物や街並みが復元されている。ただし、現在の出島は、特定の時代の姿を史料や発掘成果に基づいて再構成したもの。江戸時代のすべての時期を再現したわけではない。",
  }),
  makeClaim({
    id: "claim-ngs-2026-015",
    statement:
      "出島はオランダ文化の受容にとどまらず、①門・出入制限を伴う幕府の「管理の空間」、②商館員居住・倉庫・荷役・商談を行う「交易の空間」、③医学・博物学・測量・語学が日本側へ伝わる「知識の交流空間」という3つの視点が不可分に一体化した国家対外政策と国際接触の複合空間である。",
    subjectName: "出島（出島和蘭商館跡）",
    objectEntityName: "出島における三重視座（幕府の対外管理・商館交易運用・蘭学知識交流空間）の複合機能構造",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "江戸時代（1636年築造〜1859年開港・鎖国対外管理）",
    observedPlaceNames: ["出島（出島和蘭商館跡）"],
    quote:
      "出島を考える3つの視点。管理の空間：出島は、海外との交流を許可された空間であると同時に、幕府によって管理された空間でもあった。交易の空間：商館員の居住空間、倉庫、荷役、商談など、海外交易を実際に動かすための機能が集まっていた。知識の交流空間：医学、博物学、測量、語学など、海外から入ってきた知識が日本側に伝わる経路にもなった。",
  }),

  // 5. 比較・総括・歴史学方法論 (3 Claims: 016..018)
  makeClaim({
    id: "claim-ngs-2026-016",
    statement:
      "長崎の神社境内（諏訪神社・松森天満宮）は単なる神々への信仰空間にとどまらず、奉行所の行政・慰霊、商人・町の奉納、職人の卓越した技術、災害の厄難除け、国家戦争の記念、近代水道インフラ（五釐金）、迷子対策など、地域社会の各時代の記憶が小祀・石碑・彫刻・建築物として重層保存された「都市記憶のアーカイブ」である。",
    subjectName: "長崎歴史文化博物館",
    objectEntityName: "長崎都市神社（諏訪・松森）における信仰・行政・職人・災害・近代公共事業の都市記憶アーカイブ構造",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "江戸時代〜明治・大正・昭和・現代（都市記憶の集積史）",
    observedPlaceNames: [
      "長崎歴史文化博物館",
      "諏訪神社",
      "松森天満宮",
    ],
    quote:
      "神社は地域の信仰だけを保存する場所ではない。諏訪神社・松森天満宮の両方で、神社の境内に多様な歴史的記憶が残されていることが分かった。神々への信仰、町や商人の奉納、奉行所との関係、職人の技術、災害の記憶、戦争の記念、公共事業の歴史、地域生活の仕組み。神社は、地域社会がその時代ごとの重要なものを持ち込み、保存してきた空間でもある。",
  }),
  makeClaim({
    id: "claim-ngs-2026-017",
    statement:
      "境内に古い自然物（大楠・クスノキ群・蛙岩等）が存在することは直ちにその場所での祭祀が古代に遡る根拠とはならず、①自然物自体の年代（樹齢・地質年代）、②自然物に対する信仰の成立年代、③現在の祭祀・小祠の成立年代を厳密に区別して検証することが宗教景観分析における不可欠の規矩である。",
    subjectName: "諏訪神社",
    objectEntityName: "境内自然物の樹齢・自然物信仰年代・現行祭祀成立年代の厳密な三分法批判規矩",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "江戸時代〜現代（宗教景観分析方法論・地層峻別規矩）",
    observedPlaceNames: [
      "諏訪神社",
      "松森天満宮",
    ],
    quote:
      "古い自然物が存在するからといって、その場所の祭祀がすべて古代に遡るわけではない。自然物そのものの年代、信仰の成立年代、現在の祭祀の成立年代は分けて考える必要がある。",
  }),
  makeClaim({
    id: "claim-ngs-2026-018",
    statement:
      "北部九州・福岡での調査が古代の地域勢力・海人族祭祀・大陸墓制受容・軍事拠点（那津官家〜大宰府）の古層解明を主軸としたのに対し、長崎の探索は海外交易・奉行所支配・御用職人技術・多町小宮群・近代インフラ・潜伏信仰が交差する近世港湾都市社会史の重層性を実証しており、両地域の特質を時代地層の相違として構造的に把握できる。",
    subjectName: "長崎歴史文化博物館",
    objectEntityName: "福岡（古代地域勢力・海人古層・防衛拠点）と長崎（近世港湾都市・海外交易・職人行政記憶）の地域比較地層モデル",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "江戸時代〜現代（地域比較・歴史空間論）",
    observedPlaceNames: [
      "長崎歴史文化博物館",
      "諏訪神社",
      "松森天満宮",
      "出島（出島和蘭商館跡）",
    ],
    quote:
      "今回の長崎探索では、福岡で続けてきた古代の地域勢力・祭祀・海上交通の調査とは少し異なり、近世の港湾都市が形成した宗教・交易・職人・行政の文化に目を向けた。神社の境内に残る生活・信仰の歴史と、出島に残る国家・交易の歴史は、異なる側面を示している。長崎は、海外との接触によって形成された都市文化が、宗教・技術・生活・行政のさまざまな領域に入り込み、それらが現在まで異なる形で残っている都市である。",
  }),
];

const newSpots = [
  {
    id: "spot-nagasaki-museum",
    name: "長崎歴史文化博物館",
    region: "長崎県 · 長崎市",
    kind: "博物館",
    latitude: 32.7528,
    longitude: 129.8828,
    claimIds: [
      "claim-ngs-2026-001",
      "claim-ngs-2026-002",
      "claim-ngs-2026-016",
      "claim-ngs-2026-018",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-suwa-shrine-nagasaki",
    name: "諏訪神社",
    region: "長崎県 · 長崎市",
    kind: "神社・都市鎮守",
    latitude: 32.7536,
    longitude: 129.8856,
    claimIds: [
      "claim-ngs-2026-003",
      "claim-ngs-2026-004",
      "claim-ngs-2026-005",
      "claim-ngs-2026-006",
      "claim-ngs-2026-007",
      "claim-ngs-2026-008",
      "claim-ngs-2026-016",
      "claim-ngs-2026-017",
      "claim-ngs-2026-018",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-matsumori-tenmangu",
    name: "松森天満宮",
    region: "長崎県 · 長崎市",
    kind: "神社・天満宮",
    latitude: 32.7517,
    longitude: 129.885,
    claimIds: [
      "claim-ngs-2026-009",
      "claim-ngs-2026-010",
      "claim-ngs-2026-011",
      "claim-ngs-2026-012",
      "claim-ngs-2026-013",
      "claim-ngs-2026-016",
      "claim-ngs-2026-017",
      "claim-ngs-2026-018",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-dejima-nagasaki",
    name: "出島（出島和蘭商館跡）",
    region: "長崎県 · 長崎市",
    kind: "史跡・対外交易拠点",
    latitude: 32.7435,
    longitude: 129.873,
    claimIds: [
      "claim-ngs-2026-014",
      "claim-ngs-2026-015",
      "claim-ngs-2026-018",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const connections = [
  {
    id: "conn-nagasaki-suwa-matsumori-urban-rites",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "近世都市鎮守・職人技術奉納",
    title: "諏訪神社と松森天満宮の三社再興接点と都市記憶集積軸",
    summary:
      "1625年の三社合祀再興の場としての歴史的接点を持ち、諏訪神社の奉行随身像・五釐金碑・祖霊社・迷子石に対し、松森天満宮の職人尽彫刻（御用指物師・唐絵目利）・町名小宮群・戦利兵器碑が対比される、近世〜近代長崎の生活・技術・行政記憶の集積回廊。",
    spotIds: [
      "spot-suwa-shrine-nagasaki",
      "spot-matsumori-tenmangu",
    ],
    claimIds: [
      "claim-ngs-2026-003",
      "claim-ngs-2026-006",
      "claim-ngs-2026-007",
      "claim-ngs-2026-008",
      "claim-ngs-2026-009",
      "claim-ngs-2026-010",
      "claim-ngs-2026-011",
      "claim-ngs-2026-013",
      "claim-ngs-2026-016",
      "claim-ngs-2026-017",
    ],
    concepts: [
      "青木賢清",
      "三社合祀再興",
      "職人尽（御用指物師喜兵衛・藤右衛門）",
      "唐絵目利（石崎融思）",
      "五釐金之碑",
      "祖霊社（松平康平）",
      "まよひ子志らせ石",
      "都市記憶のアーカイブ",
    ],
    facets: [
      { id: "religion", label: "近世都市鎮守と町の生活信仰", weight: 5 },
      { id: "industry", label: "御用職人技術と輸入美術文化の奉納", weight: 5 },
      { id: "politics", label: "長崎奉行所・近代国家記憶の集積", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-nagasaki-shrines-urban-memory",
        label: "江戸時代初期〜近代",
        range: "1625年〜1907年",
        mapLabel: "諏訪神社・松森天満宮 都市信仰・技術集積軸",
        mapLayer: "domain",
        spotIds: [
          "spot-suwa-shrine-nagasaki",
          "spot-matsumori-tenmangu",
        ],
        claimIds: [
          "claim-ngs-2026-003",
          "claim-ngs-2026-009",
          "claim-ngs-2026-011",
          "claim-ngs-2026-016",
        ],
      },
    ],
    displayMode: "line",
  },
  {
    id: "conn-nagasaki-dejima-museum-trade-axis",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "対外管理・貿易・蘭学知識交流",
    title: "長崎奉行所（歴史文化博物館）と出島の対外管理・海外交流軸",
    summary:
      "長崎奉行所立地の歴史文化博物館と出島和蘭商館跡を結び、幕府による厳格な出入管理・貿易運用と、医学・博物学・通詞・美術鑑定などの海外知識交流が一体となって機能した長崎の国際結節点構造を解明する。",
    spotIds: [
      "spot-nagasaki-museum",
      "spot-dejima-nagasaki",
    ],
    claimIds: [
      "claim-ngs-2026-001",
      "claim-ngs-2026-014",
      "claim-ngs-2026-015",
      "claim-ngs-2026-018",
    ],
    concepts: [
      "出島和蘭商館跡",
      "長崎奉行所",
      "管理の空間",
      "交易の空間",
      "知識の交流空間",
      "蘭学・医学・通詞",
      "対外政策",
    ],
    facets: [
      { id: "route", label: "鎖国下の対外貿易・海上交通路", weight: 5 },
      { id: "politics", label: "幕府による出島管理と長崎奉行所統治", weight: 5 },
      { id: "exchange", label: "医学・博物学・言語の国際知識交流", weight: 4 },
    ],
    lensId: "route",
    topicId: "route-logistics",
    eras: [
      {
        id: "era-nagasaki-dejima-trade-governance",
        label: "江戸時代〜現代",
        range: "1636年築造〜1859年開港・1951年以降復元",
        mapLabel: "奉行所・出島 対外管理交易軸",
        mapLayer: "maritime",
        spotIds: [
          "spot-nagasaki-museum",
          "spot-dejima-nagasaki",
        ],
        claimIds: [
          "claim-ngs-2026-001",
          "claim-ngs-2026-014",
          "claim-ngs-2026-015",
        ],
      },
    ],
    displayMode: "line",
  },
  {
    id: "conn-nagasaki-religious-syncretism-layers",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "重層信仰・マリア観音・都市記憶",
    title: "港町長崎における宗教混交と記憶積層（マリア観音・都市鎮守・多様小宮）",
    summary:
      "博物館のマリア観音（仏教造形とキリスト教信仰の重層）、諏訪神社の都市鎮守・少彦名命共起・公共事業記憶、松森天満宮の職人奉納・町民小宮群を横断し、異なる文化・階層・時代が神仏・聖域を介して共生・保存された長崎特有の宗教景観を照射する。",
    spotIds: [
      "spot-nagasaki-museum",
      "spot-suwa-shrine-nagasaki",
      "spot-matsumori-tenmangu",
    ],
    claimIds: [
      "claim-ngs-2026-002",
      "claim-ngs-2026-003",
      "claim-ngs-2026-004",
      "claim-ngs-2026-010",
      "claim-ngs-2026-011",
      "claim-ngs-2026-016",
      "claim-ngs-2026-017",
      "claim-ngs-2026-018",
    ],
    concepts: [
      "マリア観音",
      "潜伏キリシタン信仰継承",
      "仏教的造形と聖母信仰",
      "少彦名命共起",
      "町の生活信仰小宮群",
      "宗教景観の重層性",
    ],
    facets: [
      { id: "religion", label: "接触領域における信仰の重層・共生", weight: 5 },
      { id: "people", label: "潜伏信徒・町人・職人・奉行の多層主体", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-nagasaki-multi-religious-landscape",
        label: "近世〜近代（信仰の重層と継承）",
        range: "江戸時代初期〜明治期",
        mapLabel: "長崎 宗教混交・記憶積層回廊",
        mapLayer: "domain",
        spotIds: [
          "spot-nagasaki-museum",
          "spot-suwa-shrine-nagasaki",
          "spot-matsumori-tenmangu",
        ],
        claimIds: [
          "claim-ngs-2026-002",
          "claim-ngs-2026-010",
          "claim-ngs-2026-016",
        ],
      },
    ],
    displayMode: "line",
  },
];

const newJourney = {
  id: "journey-nagasaki-port-city-2026-11-15",
  label: "長崎市内探索記録（港町の宗教景観・都市文化・海外交流）",
  documentIds: [documentId],
  spotIds: [
    "spot-nagasaki-museum",
    "spot-suwa-shrine-nagasaki",
    "spot-matsumori-tenmangu",
    "spot-dejima-nagasaki",
  ],
  connectionIds: connections.map((c) => c.id),
};

const newSuggestions = [
  {
    id: "sugg-oura-church-nagasaki",
    title: "大浦天主堂における開港期キリスト教再開と潜伏信徒発見の現地調査",
    targetName: "大浦天主堂",
    targetPlaceId: "oura-church-nagasaki",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 32.7342,
    longitude: 129.8703,
    question: "1865年の「信徒発見」の舞台となった大浦天主堂と、長崎歴史文化博物館で確認したマリア観音などの禁教下潜伏信仰の継承形態はどのように接続するか？",
    missingInformation: "開港期外国人居留地（南山手）の地形的立地と、禁教令下の浦上潜伏信徒がフランス人司祭プチジャンと接触した空間的動線の現地確認。",
    reason: "長崎の宗教景観において、禁教期の重層信仰（マリア観音）から開港・近代の信仰顕在化への移行プロセスを解明するための不可欠の対比拠点であるため。",
    expectedObservation: "国宝天主堂建築（ゴシック様式・ステンドグラス）、信徒発見のマリア像、南山手居留地と港湾の眺望、現地資料館展示。",
    uncertainty: "浦上地区の潜伏組織と五島・外海地区の信仰形態の差異。",
    claimIds: ["claim-ngs-2026-002", "claim-ngs-2026-018"],
    anchorSpotIds: ["spot-nagasaki-museum"],
    connectionIds: ["conn-nagasaki-religious-syncretism-layers"],
    lensId: "religion",
    topicId: "religion-syncretism",
    initialStatus: "suggested",
  },
  {
    id: "sugg-sotome-kakure-kirishitan",
    title: "外海（出津教会堂・枯松神社周辺）における仏教・神道・潜伏キリシタン信仰の重層現地調査",
    targetName: "出津教会堂・枯松神社（外海）",
    targetPlaceId: "sotome-shitsu-karematsu",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 32.8453,
    longitude: 129.7011,
    question: "ド・ロ神父の指導を受けた出津やキリシタン神社とされる枯松神社において、神道・仏教・キリスト教的習俗はどのように混交・共存してきたか？",
    missingInformation: "長崎市街地中心部（諏訪・松森・出島）と、外海西彼杵半島沿岸部の農漁村共同体における潜伏信仰・集落構造の差異の現地確認。",
    reason: "長崎市街地の都市型信仰（マリア観音・天満宮小宮群）に対し、周縁農漁村における独自の信仰保持・習合形態を比較検証するため。",
    expectedObservation: "出津教会堂の防風構造、枯松神社の鳥居とサン・ジワン祈念碑、角力灘に面する急傾斜地集落景観。",
    uncertainty: "枯松神社が神社形式をとった時期と地元共同体の認識の変遷。",
    claimIds: ["claim-ngs-2026-002", "claim-ngs-2026-016"],
    anchorSpotIds: ["spot-nagasaki-museum", "spot-suwa-shrine-nagasaki"],
    connectionIds: ["conn-nagasaki-religious-syncretism-layers"],
    lensId: "religion",
    topicId: "religion-syncretism",
    initialStatus: "suggested",
  },
  {
    id: "sugg-hongouchi-reservoir-nagasaki",
    title: "本河内高部水源地における貿易積立金（五釐金）と近代都市水道インフラの現地調査",
    targetName: "本河内高部水源地",
    targetPlaceId: "hongouchi-reservoir-nagasaki",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 32.7586,
    longitude: 129.9044,
    question: "諏訪神社の「五釐金之碑」に記された対外貿易額千分の五の積立金が、なぜ日本最初期の近代水道（1891年完成）として本河内に結実したのか？",
    missingInformation: "中島川上流・本河内渓谷の地形と、重力式コンクリートダム・導水路などの近代土木遺構の現存状況の現地確認。",
    reason: "海外交易の富が幕府直轄都市から近代自治体水道へと制度的・物理的に転換された都市インフラ発展史を実地検証するため。",
    expectedObservation: "本河内高部ダム堤体、水源地水面、中島川上流水系地形、近代水道記念碑群。",
    uncertainty: "江戸時代の五釐金管理台帳から明治水道起債への会計移行の詳細経緯。",
    claimIds: ["claim-ngs-2026-006", "claim-ngs-2026-016"],
    anchorSpotIds: ["spot-suwa-shrine-nagasaki"],
    connectionIds: ["conn-nagasaki-suwa-matsumori-urban-rites"],
    lensId: "route",
    topicId: "route-logistics",
    initialStatus: "suggested",
  },
];

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

    for (const s of newSpots) {
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

    if (!targetAtlas.suggestions) {
      targetAtlas.suggestions = [];
    }
    for (const sugg of newSuggestions) {
      const sIdx = targetAtlas.suggestions.findIndex((existing) => existing.id === sugg.id);
      if (sIdx >= 0) {
        targetAtlas.suggestions[sIdx] = sugg;
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
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
  console.log("Updated tomono-review-draft.json successfully.");
}

// 2. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertDataset(atlas, null, null);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2) + "\n", "utf8");
  console.log("Updated travel-atlas.yamatai.json successfully.");
}

// 3. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertDataset(pub.atlas, pub.documents, pub.claims);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2) + "\n", "utf8");
  console.log(
    `Updated published-review-dataset.json successfully (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length}, connections: ${pub.atlas.connections.length}, suggestions: ${pub.atlas.suggestions.length})`,
  );
}

console.log("Import Nagasaki exploration journey (2026-11-15) completed successfully!");
