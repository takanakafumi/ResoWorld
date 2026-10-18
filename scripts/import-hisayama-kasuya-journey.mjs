import crypto from "crypto";
import fs from "fs";
import path from "path";

const rootDir = "B:/09_Technology/22_ResoWorld_bionic";
const traveloguePath = path.join(rootDir, "旅行記/福岡市東区_篠栗粕屋.txt");
const draftPath = path.join(rootDir, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(rootDir, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(rootDir, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-hisayama-kasuya";
const documentTitle = "久山町・糟屋周辺の神社探索記録（古墳・水辺・御霊信仰・神功皇后伝承）";
const relativeTraveloguePath = "旅行記/福岡市東区_篠栗粕屋.txt";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-10-18",
  documentedAt: "2026-10-18",
  dateStatus: "known",
};

// 12 Visited Spots from 久山町・糟屋周辺の神社探索記録
const spots = [
  {
    id: "spot-hatta-tenma-kifune",
    name: "八田天満貴船神社",
    region: "福岡県 · 福岡市東区",
    kind: "神社・八神水神祭祀",
    latitude: 33.6383,
    longitude: 130.4578,
    claimIds: ["claim-kasuya-001"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-hebi-hachiman",
    name: "部木八幡神社・部木古墳群",
    region: "福岡県 · 糟屋郡久山町",
    kind: "神社・古墳",
    latitude: 33.6432,
    longitude: 130.4892,
    claimIds: ["claim-kasuya-002", "claim-kasuya-003"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-okuma-goryo",
    name: "大隈御霊神社",
    region: "福岡県 · 糟屋郡粕屋町",
    kind: "神社・神仏習合",
    latitude: 33.6214,
    longitude: 130.4876,
    claimIds: ["claim-kasuya-004"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-kurodono-maruyama",
    name: "黒殿神社・丸山城跡",
    region: "福岡県 · 糟屋郡粕屋町",
    kind: "城跡・史跡",
    latitude: 33.6228,
    longitude: 130.4895,
    claimIds: ["claim-kasuya-005"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-wada-hachimangu",
    name: "和田八幡宮（刻線の石）",
    region: "福岡県 · 糟屋郡篠栗町",
    kind: "神社・神仏習合",
    latitude: 33.6262,
    longitude: 130.5142,
    claimIds: ["claim-kasuya-006", "claim-kasuya-007"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-tsubakuro-goryo",
    name: "津波黒御霊神社",
    region: "福岡県 · 糟屋郡篠栗町",
    kind: "神社・祭祀",
    latitude: 33.6288,
    longitude: 130.5218,
    claimIds: ["claim-kasuya-008"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-kiyose-jinja",
    name: "木寄神社",
    region: "福岡県 · 糟屋郡久山町",
    kind: "神社・祭祀",
    latitude: 33.6468,
    longitude: 130.5112,
    claimIds: ["claim-kasuya-009"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-otomiya-kofun",
    name: "乙宮神社・乙宮古墳群",
    region: "福岡県 · 糟屋郡久山町",
    kind: "遺跡・古墳",
    latitude: 33.6495,
    longitude: 130.5168,
    claimIds: ["claim-kasuya-010", "claim-kasuya-011"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-ino-tenshoko-daijingu",
    name: "伊野天照皇大神宮",
    region: "福岡県 · 糟屋郡久山町",
    kind: "神宮",
    latitude: 33.6716,
    longitude: 130.5172,
    claimIds: ["claim-kasuya-012", "claim-kasuya-013"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-yamada-saigu",
    name: "山田邑斎宮",
    region: "福岡県 · 糟屋郡久山町",
    kind: "神社・祭祀",
    latitude: 33.6582,
    longitude: 130.5021,
    claimIds: ["claim-kasuya-014"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-saniwa-jinja",
    name: "審神者神社",
    region: "福岡県 · 糟屋郡久山町",
    kind: "神社・祭祀",
    latitude: 33.6565,
    longitude: 130.4998,
    claimIds: ["claim-kasuya-015"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-rokushogu-ato",
    name: "六所宮跡",
    region: "福岡県 · 糟屋郡久山町",
    kind: "史跡",
    latitude: 33.6558,
    longitude: 130.5009,
    claimIds: ["claim-kasuya-016"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

// 16 Claims
const claims = [
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-001",
    statement: "八田天満貴船神社では高龗大神・菅原神・罔象女神に加え、『古語拾遺』『延喜式』の宮中八神に類似する八柱（高皇産霊神〜事代主神）が合祀され、水神・天神・宮廷系祭神の重層が見られる。",
    subject: { name: "八田天満貴船神社", type: "Place" },
    predicate: "enshrined_at",
    object: { kind: "entity", entity: { name: "貴船水神・天神・八神の複合祭祀", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代伝承〜近現代", precision: "broad-range" },
    places: [{ name: "八田天満貴船神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 28,
        endLine: 46,
        quote: "2004年の由緒碑には、高龗大神、菅原神、罔象女神のほか、次の八柱が記されていた。この八柱は、古代の宮廷祭祀に関わる「八神」とよく似ており、『古語拾遺』や『延喜式』に見える八神との比較は有効。",
      },
    }],
    createdAt: "2026-10-18T09:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-002",
    statement: "部木八幡神社は弘安8年（1285年）に蒲田字北隅の旧「別火宮（へひのみや）」から現在地へ遷座し、延宝元年（1672年）に福岡藩主・黒田光之により再建されたと伝わる。",
    subject: { name: "部木八幡神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "別火宮からの遷座と黒田藩再建", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "reported" },
    historicalTime: { kind: "named", label: "鎌倉時代（1285年）〜江戸時代（1672年）", precision: "broad-range" },
    places: [{ name: "部木八幡神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Tradition",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 49,
        endLine: 59,
        quote: "1285年（弘安8年）、別火宮（へひのみや）から現在地へ移ったと説明される。1672年には黒田光之による再建があったとされる。火を絶やさず守る宮だったことから「別火」の名が生じたという説明がある。",
      },
    }],
    createdAt: "2026-10-18T09:20:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-003",
    statement: "部木八幡神社の西側には前方後方墳（1号墳・約23m）を含む部木古墳群9基および弥生集落・墓域が存在するが、古墳群と後世の八幡祭祀の直接的連続性は区別して検証すべきである。",
    subject: { name: "部木古墳群", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "前方後方墳を含む古墳群と後世神社空間の重層", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "弥生〜古墳時代", precision: "broad-period" },
    places: [{ name: "部木八幡神社・部木古墳群", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Archaeology",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 60,
        endLine: 64,
        quote: "西側には部木古墳群があり、9基ほどの古墳が知られる。1号墳は約23mとされ、前方後方墳という特徴を持つ。ただし、古墳群と八幡神社の祭祀が直接連続している証拠は確認できていない。",
      },
    }],
    createdAt: "2026-10-18T09:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-004",
    statement: "丸山麓の大隈御霊神社は早良親王（崇道天皇）・伊予親王・橘逸勢・藤原広嗣・吉備大臣・火雷神など八所御霊系祭神を祀り、境内に仏堂・仏像を残す神仏習合的な御霊鎮魂拠点である。",
    subject: { name: "大隈御霊神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "八所御霊鎮魂と神仏習合空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "平安〜南北朝（14世紀）・近世", precision: "broad-range" },
    places: [{ name: "大隈御霊神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 67,
        endLine: 77,
        quote: "早良親王（崇道天皇）、伊予親王、橘逸勢、文屋宮田丸、藤原吉子と考えられる「藤太夫人」、藤原広嗣、吉備真備と考えられる「吉備大臣」、火雷神などが挙げられる。現地は丸山の麓にあり、鳥居近くに池が見られ、境内には神仏習合を思わせる仏堂・仏像もある。",
      },
    }],
    createdAt: "2026-10-18T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-005",
    statement: "丸山城跡には山頂主郭・二重横堀・竪堀の山城遺構が残り、天正14年（1586年）落城時の黒殿姫の最期を伝える黒殿神社は、国家神話とは異なる戦乱の地域記憶を宿している。",
    subject: { name: "黒殿神社・丸山城跡", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "戦国山城遺構と落城記憶の祭祀化", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "戦国時代（1586年）〜近世", precision: "period" },
    places: [{ name: "黒殿神社・丸山城跡", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 80,
        endLine: 92,
        quote: "天正14年（1586年）秋の戦乱で城が落ちる際、黒殿姫は家臣に自分の首を落とさせた。丸山城跡には、山頂の主郭、二重の横堀、竪堀、尾根を断ち切る遺構など、山城の構造を示す痕跡がある。",
      },
    }],
    createdAt: "2026-10-18T10:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-006",
    statement: "和田八幡宮は応神天皇・神功皇后・武内宿禰を祀りつつ境内に阿弥陀堂や鐘を存置し、神仏分離以前の習合景観を色濃く残している。",
    subject: { name: "和田八幡宮", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "八幡信仰と阿弥陀堂の神仏習合空間", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "近世〜現代", precision: "broad-range" },
    places: [{ name: "和田八幡宮（刻線の石）", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 95,
        endLine: 102,
        quote: "祭神：応神天皇、神功皇后、武内宿禰。境内に阿弥陀堂や鐘があり、神仏習合の痕跡を思わせる。",
      },
    }],
    createdAt: "2026-10-18T11:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-007",
    statement: "和田八幡宮の「刻線の石」は現地説明板で太陽信仰の暦・方位図説が紹介される一方、古賀市教委『線刻石の謎』が指摘通り、石材の年代・線刻年代・祭祀転用年代を分離して慎重に扱う必要がある。",
    subject: { name: "和田八幡宮の刻線の石", type: "Artifact" },
    predicate: "interpreted_as",
    object: { kind: "entity", entity: { name: "線刻石の多段階年代検証対象", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "年代未詳（後世転用の可能性含む）", precision: "unknown" },
    places: [{ name: "和田八幡宮（刻線の石）", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 103,
        endLine: 108,
        quote: "古賀市教育委員会の資料『れきしのアルバム No.30「線刻石の謎」』（2008年）は、旧古賀町の貴船神社跡や綿津見神社などの線刻石を取り上げる。石の年代、線を刻んだ年代、祭祀に用いられた年代は、別々である可能性がある。",
      },
    }],
    createdAt: "2026-10-18T11:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-008",
    statement: "津波黒御霊神社は宝永元年（1704年）に大隈御霊神社から八所御霊を勧請して村の氏神としたと伝わり、御霊信仰が近世村落間で勧請・再構成された地域ネットワークを示す。",
    subject: { name: "津波黒御霊神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "大隈御霊神社からの村落間勧請", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "reported" },
    historicalTime: { kind: "named", label: "江戸時代中期（宝永元年・1704年）", precision: "year" },
    places: [
      { name: "津波黒御霊神社", role: "subject_place" },
      { name: "大隈御霊神社", role: "related_place" },
    ],
    evidence: [{
      role: "supports",
      sourceNature: "Tradition",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 112,
        endLine: 122,
        quote: "二次資料では、宝永元年（1704年）に津波黒の村が大隈御霊神社から神を勧請し、氏神としたという伝承が紹介されている。御霊信仰が一つの場所だけのものではなく、村から村へ勧請され、地域の氏神として再構成された可能性が見えてきた。",
      },
    }],
    createdAt: "2026-10-18T11:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-009",
    statement: "木寄神社（祭神：事代主神）は新立川の木材集積地「きよせ」に由来し、大正12年（1923年）の八幡宮合祀後に昭和初期に元の社地へ復帰し、旧暦11月4日の「木寄供日（どじょう汁）」を継承している。",
    subject: { name: "木寄神社", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "川運生業地名と近代合祀からの旧社地復帰", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "江戸中期〜大正合祀・昭和復帰", precision: "broad-range" },
    places: [{ name: "木寄神社", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 126,
        endLine: 142,
        quote: "「木寄」は以前「きよせ」と呼ばれ、伐採した木材を集めた場所に由来するという。大正12年（1923年）に八幡宮へ合祀された後、昭和初期に元の社地へ戻されたとされる。旧暦11月4日に「木寄供日（くんち）」が行われ、どじょう汁を食べる。",
      },
    }],
    createdAt: "2026-10-18T12:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-010",
    statement: "乙宮神社本殿裏には4〜5世紀（低墳丘・竪穴式石室推定）の乙宮古墳群5基が存在し、古墳時代の墓域の前面に後世の豊玉姫命祭祀が重層している。",
    subject: { name: "乙宮神社・乙宮古墳群", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "4〜5世紀古墳群と豊玉姫祭祀の空間重層", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古墳時代前期〜中期（4〜5世紀）", precision: "century" },
    places: [{ name: "乙宮神社・乙宮古墳群", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Archaeology",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 146,
        endLine: 164,
        quote: "本殿裏に古墳が5基あり、墳丘の直径は推定6〜12m。低墳丘で竪穴式石室だった可能性などから、4〜5世紀の古墳と推定される。古墳群が神社の背後に残ることは重要だが、古墳の被葬者と神社祭祀の直接的な継承関係は未確認。",
      },
    }],
    createdAt: "2026-10-18T12:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-011",
    statement: "『筑前国続風土記拾遺』によれば、江戸時代の乙宮神社では宝満派の山伏・成圓坊が9月9日の大祭を司っており、村落神社に宝満山修験道が深く関与していた。",
    subject: { name: "乙宮神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "宝満派修験（成圓坊）による祭祀管掌", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "reported" },
    historicalTime: { kind: "named", label: "江戸時代", precision: "period" },
    places: [{ name: "乙宮神社・乙宮古墳群", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "HistoricalText",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 150,
        endLine: 162,
        quote: "『筑前国続風土記拾遺』によると、江戸時代には宝満派の山伏・成圓坊が9月9日の大祭を司ったとされる。",
      },
    }],
    createdAt: "2026-10-18T13:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-012",
    statement: "伊野天照皇大神宮は最奥に「古神殿跡」と滝・渓流の祭祀空間を擁し、天照大神・手力雄神・萬幡千々姫神に加え水取宮・五霊大明神・住吉三神・志賀三神を合祀する重層聖域である。",
    subject: { name: "伊野天照皇大神宮", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "滝・古神殿跡と海神・水神・伊勢神の重層聖域", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "古代〜近世・近代", precision: "broad-range" },
    places: [{ name: "伊野天照皇大神宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 169,
        endLine: 180,
        quote: "最奥の古神殿跡と滝が印象的だった。水辺、山林、社殿、奥の祭祀空間を含めて見る価値がある。天照大神、手力雄神、萬幡千々姫神、合祀：水取宮祭神、五霊大明神、住吉三神、志賀三神。",
      },
    }],
    createdAt: "2026-10-18T13:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-013",
    statement: "伊野天照皇大神宮は『日本書紀』神功皇后紀の小山田邑斎宮伝承や『日本三代実録』（元慶元年・877年）天照神授位記事に結びつけられ、近世には福岡藩黒田家により伊勢神宮にならった構法・式年遷宮が整備された。",
    subject: { name: "伊野天照皇大神宮", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "小山田邑斎宮伝承と黒田藩による筑前伊勢信仰整備", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "平安（877年）〜江戸時代", precision: "broad-range" },
    places: [{ name: "伊野天照皇大神宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "Tradition",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 181,
        endLine: 196,
        quote: "神功皇后が小山田邑の斎宮で天照大神を祀ったという『日本書紀』の伝承に結びつける。黒田藩主の崇敬を受け、伊勢神宮の構法を学んだという。元慶元年は877年であり、由来記の887年とは10年ずれる。",
      },
    }],
    createdAt: "2026-10-18T13:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-014",
    statement: "山田邑斎宮は、『日本書紀』神功皇后紀の小山田邑斎宮記事に対し、江戸時代の貝原益軒『筑前国続風土記』が上山田村「聖母屋敷」を比定した地であり、古代史書の記述と近世地誌による比定の層を区別して理解できる。",
    subject: { name: "山田邑斎宮", type: "Place" },
    predicate: "interpreted_as",
    object: { kind: "entity", entity: { name: "日本書紀小山田邑斎宮の近世地誌比定地", type: "Concept" } },
    qualifiers: {},
    claimKind: "synthesis",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "interpretive" },
    historicalTime: { kind: "named", label: "古代伝承（720年書紀）・江戸時代（1709年続風土記）", precision: "broad-range" },
    places: [{ name: "山田邑斎宮", role: "subject_place" }],
    evidence: [{
      role: "supports",
      sourceNature: "HistoricalText",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 200,
        endLine: 215,
        quote: "江戸時代の貝原益軒『筑前国続風土記』は、上山田村の「聖母屋敷」に神功皇后の社があることを記し、香椎に近いことなどから、ここが斎宮の跡ではないかと推定した。古代史書に記述があることと、現在の社地が当時の所在地だと考古学的に証明されていることは別である。",
      },
    }],
    createdAt: "2026-10-18T14:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-015",
    statement: "山田の審神者神社は『日本書紀』神功皇后紀で審神者を務めた中臣烏賊津使主を祀り、慶長3年（1598年）まで対面していた六所大明神旧社地との間に「建物を建ててはならない」不犯慣習が現在も守られている。",
    subject: { name: "審神者神社", type: "Place" },
    predicate: "associated_with",
    object: { kind: "entity", entity: { name: "中臣烏賊津使主祭祀と六所宮旧社地対面の不犯慣習", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "安土桃山（1598年以前）〜現代", precision: "broad-range" },
    places: [
      { name: "審神者神社", role: "subject_place" },
      { name: "六所宮跡", role: "related_place" },
    ],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 218,
        endLine: 231,
        quote: "中臣烏賊津使主（なかとみのいかつおみ）を審神者としたという記述がある。慶長3年（1598年）まで六所に社殿があった六所大明神と向かい合っていた。両者の間には建物を建ててはならないという伝承があり、現在も守られているという。",
      },
    }],
    createdAt: "2026-10-18T14:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-016",
    statement: "六所宮跡は慶長年間（1598年頃）の移転後に神田・地名「六所」として保存され、江戸時代には福岡藩黒田家が伊野天照皇大神宮を「内宮」、豊受大神を祀る六所宮を「外宮」と対置し伊勢御田扇を奉納した。",
    subject: { name: "六所宮跡", type: "Place" },
    predicate: "functioned_as",
    object: { kind: "entity", entity: { name: "旧社地の神田化と伊野（内宮）・六所（外宮）の対置再編", type: "Concept" } },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: { kind: "named", label: "慶長年間（1598年）〜江戸時代（黒田継高期）", precision: "broad-range" },
    places: [
      { name: "六所宮跡", role: "subject_place" },
      { name: "伊野天照皇大神宮", role: "related_place" },
    ],
    evidence: [{
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId,
        documentSha256: travelogueSha256,
        startLine: 234,
        endLine: 250,
        quote: "移転後の土地は神田となり、「六所」という地名が残った。江戸時代、黒田家は伊野天照皇大神宮を内宮、豊受大神を祀る六所宮を外宮として尊んだという。",
      },
    }],
    createdAt: "2026-10-18T14:45:00Z",
  },
];

// 4 Thematic & Spatial Connections for the Journey
const connections = [
  {
    id: "connection-yamada-saigu-ino-ise",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "SAIGU / ORACLE / ISE REORGANIZATION",
    title: "小山田邑斎宮伝承と「伊野＝内宮・六所＝外宮」の近世伊勢再編",
    summary: "『日本書紀』神功皇后紀の小山田邑斎宮・審神者（中臣烏賊津使主）伝承が山田邑斎宮・審神者神社・部木八幡に宿り、さらに江戸時代に黒田藩が伊野天照皇大神宮を内宮、六所宮を外宮と見立てて再編した重層回廊。",
    spotIds: [
      "spot-ino-tenshoko-daijingu",
      "spot-yamada-saigu",
      "spot-saniwa-jinja",
      "spot-rokushogu-ato",
      "spot-hebi-hachiman",
    ],
    claimIds: [
      "claim-kasuya-002",
      "claim-kasuya-012",
      "claim-kasuya-013",
      "claim-kasuya-014",
      "claim-kasuya-015",
      "claim-kasuya-016",
    ],
    concepts: ["小山田邑斎宮", "審神者（中臣烏賊津使主）", "内宮・外宮見立て", "黒田藩", "旧社地不犯慣習"],
    facets: [
      { id: "myth", label: "神話・斎宮", weight: 5 },
      { id: "ritual", label: "祭祀再編", weight: 5 },
      { id: "politics", label: "藩政整備", weight: 4 },
    ],
    lensId: "mythology",
    topicId: "jingu-kogo-legend-preset",
    eras: [
      {
        id: "era-yamada-saigu-ancient",
        label: "小山田邑斎宮と審神者伝承",
        range: "古代伝承（日本書紀）",
        mapLabel: "神功皇后斎宮と中臣烏賊津使主の沙庭",
        mapLayer: "mythic",
        spotIds: ["spot-yamada-saigu", "spot-saniwa-jinja", "spot-ino-tenshoko-daijingu"],
        claimIds: ["claim-kasuya-013", "claim-kasuya-014", "claim-kasuya-015"],
      },
      {
        id: "era-ino-rokusho-kuroda",
        label: "黒田藩による内宮・外宮整備と旧社地記憶",
        range: "安土桃山（1598年）〜江戸時代",
        mapLabel: "伊野（内宮）・六所（外宮）と神田・不犯の記憶",
        mapLayer: "religious",
        spotIds: ["spot-ino-tenshoko-daijingu", "spot-rokushogu-ato", "spot-saniwa-jinja", "spot-hebi-hachiman"],
        claimIds: ["claim-kasuya-002", "claim-kasuya-013", "claim-kasuya-015", "claim-kasuya-016"],
      },
    ],
  },
  {
    id: "connection-kasuya-goryo-maruyama",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "GORYO / CASTLE / LOCAL MEMORY",
    title: "糟屋の御霊信仰勧請網（大隈→津波黒）と丸山落城の地域記憶",
    summary: "早良親王・橘逸勢・藤原広嗣らを祀る大隈御霊神社から宝永元年（1704年）に津波黒御霊神社へ氏神として勧請されたネットワークと、同じ丸山に残る黒殿神社・丸山城跡の落城悲話を対比し、政治的御霊鎮魂と戦国落城記憶の異同を検証する。",
    spotIds: [
      "spot-okuma-goryo",
      "spot-tsubakuro-goryo",
      "spot-kurodono-maruyama",
    ],
    claimIds: [
      "claim-kasuya-004",
      "claim-kasuya-005",
      "claim-kasuya-008",
    ],
    concepts: ["御霊信仰", "早良親王（崇道天皇）", "藤原広嗣", "村落間勧請", "丸山城跡", "黒殿姫伝承"],
    facets: [
      { id: "ritual", label: "御霊鎮魂", weight: 5 },
      { id: "politics", label: "敗者・戦乱記憶", weight: 4 },
      { id: "exchange", label: "勧請網", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-kasuya-goryo-network",
        label: "御霊社の成立と村落間勧請",
        range: "中世（14世紀）〜宝永元年（1704年）",
        mapLabel: "大隈から津波黒への御霊勧請と丸山城跡",
        mapLayer: "religious",
        spotIds: ["spot-okuma-goryo", "spot-tsubakuro-goryo", "spot-kurodono-maruyama"],
        claimIds: ["claim-kasuya-004", "claim-kasuya-005", "claim-kasuya-008"],
      },
    ],
  },
  {
    id: "connection-hisayama-kofun-shugendo",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "KOFUN / SHUGENDO / ENGRAVED STONE",
    title: "古墳群・線刻石の基底層と宝満修験・神仏習合の重層",
    summary: "部木古墳群（前方後方墳）や乙宮古墳群（4〜5世紀）、和田八幡宮の「刻線の石」といった神社以前の古層物証の上に、豊玉姫・八幡祭祀や宝満派山伏（成圓坊）・阿弥陀堂が重なり合った糟屋・久山の垂直地層。",
    spotIds: [
      "spot-hebi-hachiman",
      "spot-otomiya-kofun",
      "spot-wada-hachimangu",
    ],
    claimIds: [
      "claim-kasuya-003",
      "claim-kasuya-006",
      "claim-kasuya-007",
      "claim-kasuya-010",
      "claim-kasuya-011",
    ],
    concepts: ["部木古墳群（前方後方墳）", "乙宮古墳群", "刻線の石（線刻石）", "宝満派修験（成圓坊）", "神仏習合"],
    facets: [
      { id: "ritual", label: "古墳と修験", weight: 5 },
      { id: "myth", label: "豊玉姫・八幡", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-concepts",
    eras: [
      {
        id: "era-hisayama-kofun-bedrock",
        label: "古墳時代の墓域と線刻石・近世修験の重層",
        range: "4〜5世紀（古墳時代）〜江戸時代",
        mapLabel: "部木・乙宮古墳群と宝満修験・刻線の石",
        mapLayer: "religious",
        spotIds: ["spot-hebi-hachiman", "spot-otomiya-kofun", "spot-wada-hachimangu"],
        claimIds: ["claim-kasuya-003", "claim-kasuya-007", "claim-kasuya-010", "claim-kasuya-011"],
      },
    ],
  },
  {
    id: "connection-hisayama-water-livelihood",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "WATER / TIMBER / EIGHT KAMI",
    title: "水系・木材川運と宮中八神・供日（くんち）の生活祭祀",
    summary: "八田天満貴船神社の貴船水神・八神合祀から、新立川の木材集積地「きよせ」に由来し大正合祀から元の社地へ復帰した木寄神社（事代主神・どじょう汁供日）、伊野の滝・水取宮合祀まで、河川水系と地域生活が支えた祭祀軸。",
    spotIds: [
      "spot-hatta-tenma-kifune",
      "spot-kiyose-jinja",
      "spot-ino-tenshoko-daijingu",
    ],
    claimIds: [
      "claim-kasuya-001",
      "claim-kasuya-009",
      "claim-kasuya-012",
    ],
    concepts: ["貴船水神", "宮中八神", "木寄（木材川運）", "事代主神", "合祀からの復帰", "木寄供日"],
    facets: [
      { id: "ritual", label: "水神・供日", weight: 5 },
      { id: "exchange", label: "川運・生業", weight: 4 },
    ],
    lensId: "religion",
    topicId: "shikinaisha-network-preset",
    eras: [
      {
        id: "era-hisayama-river-folklife",
        label: "河川生業と合祀復帰の地域信仰",
        range: "近世〜大正・昭和初期",
        mapLabel: "八田・木寄・猪野川水系の生活祭祀",
        mapLayer: "religious",
        spotIds: ["spot-hatta-tenma-kifune", "spot-kiyose-jinja", "spot-ino-tenshoko-daijingu"],
        claimIds: ["claim-kasuya-001", "claim-kasuya-009", "claim-kasuya-012"],
      },
    ],
  },
];

const newJourney = {
  id: "journey-hisayama-kasuya",
  label: "久山・糟屋・篠栗",
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
