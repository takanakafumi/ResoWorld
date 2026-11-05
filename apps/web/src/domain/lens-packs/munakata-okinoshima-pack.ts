import { LensKnowledgePackSchema } from "./schema";

export const munakataOkinoshimaSacredLandscapePack = LensKnowledgePackSchema.parse({
  schemaVersion: "0.1.0",
  id: "munakata-okinoshima-sacred-landscape",
  version: "0.1.0",
  label: "宗像・沖ノ島の祭祀景観",
  description: "沖ノ島祭祀の考古学的期間、国家祭祀終焉に関する神社由緒、現在の三宮と遥拝所を、典拠の性質を分けて読む。",
  packCategory: "sacred-landscape-pack",
  regionalComparisons: [
    {
      id: "comparison-munakata-itsukushima",
      title: "宗像・沖ノ島と厳島・弥山の海上三女神・島嶼祭祀比較",
      regions: ["北部九州（宗像・玄界灘）", "安芸・瀬戸内海（厳島・弥山）"],
      commonality:
        "ともに現在の主祭神を宗像三女神（田心姫・湍津姫・市杵島姫）とし、島体・山頂巨岩（沖ノ島巨岩群／弥山山頂巨岩群）を神域の核とする海上交通要衝の聖域である。",
      difference:
        "沖ノ島は4〜9世紀の国家祭祀遺構（約8万点の出土品）が考古学的に実証される絶海の禁足島であるのに対し、厳島は古代史料（『日本後紀』811年）では「伊都岐嶋神」と記され、平安末期の平清盛造営と三鬼大権現・修験道（神仏習合層）が厚く発達した。",
      chronology:
        "沖ノ島祭祀は4世紀後半〜9世紀末（考古物証：確度A）、宗像三女神の文献記載は8世紀初頭（記紀：史料A）。厳島は社伝で推古朝（593年：史料B）を主張し、確実な文献初見は811年（史料A）、海上社殿整備は12世紀後半。",
      contactPossibility:
        "玄界灘から関門海峡を経て瀬戸内海（安芸灘・大野瀬戸）へ至る西日本の主要内海航路で直結しており、海人族・佐伯氏・平氏・宗像氏の海上ネットワーク上で高い接触可能性がある。",
      independence:
        "島嶼・巨岩に対する基層の自然崇拝は各地域の地理的必然性から独立して発生し得る一方、「宗像三女神」としての神名体系・配祀の揃い方は記紀神話や勧請ネットワークによる制度的・思想的波及を含む。",
      alternativeExplanation:
        "厳島の基層祭祀は本来「伊都岐嶋（斎き島）の在地海神・山神」であり、後に海上守護神として著名な宗像三女神（特に市杵島姫）と同定・統合されたとする段階的習合モデルで説明できる。",
    },
  ],
  status: "draft",
  releasedAt: "2026-09-24",
  sources: [
    {
      id: "munakata-archives-okinoshima-ritual-site",
      kind: "modern-reference",
      sourceCategory: "A",
      compilationEra: "現代公的調査整理（対象遺構：4〜9世紀末）",
      title: "沖ノ島祭祀遺跡",
      publisher: "『神宿る島』宗像・沖ノ島と関連遺産群保存活用協議会",
      url: "https://www.munakata-archives.asia/frmSearchBunkazaiDetail.aspx?id=30&langid=",
      retrievedAt: "2026-09-24",
      locator: "4世紀から9世紀末の航海安全に関わる古代祭祀遺跡という説明",
      reviewStatus: "reviewed",
    },
    {
      id: "munakata-archives-clan-and-ritual",
      kind: "modern-reference",
      sourceCategory: "A",
      compilationEra: "現代公的調査整理（対象遺構：4世紀後半〜9世紀）",
      title: "宗像氏と沖ノ島祭祀",
      publisher: "『神宿る島』宗像・沖ノ島と関連遺産群保存活用協議会",
      url: "https://www.munakata-archives.asia/frmSearchBunkazaiDetail.aspx?id=161",
      retrievedAt: "2026-09-24",
      locator: "4世紀後半の祭祀開始、宗像氏、ヤマト王権の対外交流、新原・奴山古墳群",
      reviewStatus: "reviewed",
    },
    {
      id: "munakata-taisha-origin-okinoshima",
      kind: "modern-reference",
      sourceCategory: "B",
      title: "宗像大社 由緒",
      publisher: "宗像大社",
      url: "https://munakata-taisha.or.jp/yuisyo.html",
      retrievedAt: "2026-09-24",
      locator: "三宮と祭神、沖ノ島出土品、勅使差遣、894年以後の国家祭祀",
      reviewStatus: "reviewed",
      note: "三宮の現在祭祀と神社公式の由緒として用いる。由緒が示す因果関係を考古学的確定事項へ拡張しない。",
    },
    {
      id: "munakata-taisha-nakatsumiya",
      kind: "modern-reference",
      sourceCategory: "B",
      title: "宗像大社 中津宮",
      publisher: "宗像大社",
      url: "https://munakata-taisha.or.jp/about_nakatsu.html",
      retrievedAt: "2026-09-24",
      locator: "中津宮祭神と沖津宮遥拝所の所在地・昭和8年再建",
      reviewStatus: "reviewed",
    },
  ],
  viewpoints: [
    { id: "munakata-archaeological-ritual", kind: "source", label: "沖ノ島祭祀の考古学的範囲", description: "祭祀遺跡と出土品から確認できる時期・場所・対外交流の文脈を見る。" },
    { id: "munakata-institutional-history", kind: "source", label: "宗像大社の制度的由緒", description: "神社公式が説明する国家祭祀の終焉と現在の祭祀施設を、考古学的事実と分けて見る。" },
  ],
  entities: [
    { id: "okinoshima", kind: "place", label: "沖ノ島", aliases: ["宗像沖ノ島"], coordinates: { latitude: 34.2439, longitude: 130.1033 } },
    { id: "okinoshima-ritual-site", kind: "place", label: "沖ノ島祭祀遺跡", aliases: [], coordinates: { latitude: 34.2439, longitude: 130.1033 } },
    { id: "munakata-okitsumiya", kind: "place", label: "沖津宮", aliases: ["宗像大社沖津宮", "宗像大社 沖津宮", "宗像大社 沖津宮（沖ノ島）", "沖ノ島（沖津宮）"], coordinates: { latitude: 34.2439, longitude: 130.1033 } },
    { id: "munakata-nakatsumiya", kind: "place", label: "中津宮", aliases: ["宗像大社中津宮", "宗像大社 中津宮", "宗像大社 中津宮（大島）", "大島（中津宮）"], coordinates: { latitude: 33.9004, longitude: 130.4328 } },
    { id: "munakata-hetsumiya", kind: "place", label: "辺津宮", aliases: ["宗像大社辺津宮", "宗像大社 辺津宮", "宗像大社"], coordinates: { latitude: 33.8306, longitude: 130.5142 } },
    { id: "okitsumiya-yohai", kind: "place", label: "沖津宮遥拝所", aliases: ["宗像大社 沖津宮遥拝所", "大島 沖津宮遥拝所"], coordinates: { latitude: 33.9083, longitude: 130.4167 } },
    { id: "oshima-munakata", kind: "place", label: "大島", aliases: ["筑前大島"], coordinates: { latitude: 33.9022, longitude: 130.4286 } },
    { id: "munakata-clan", kind: "group", label: "宗像氏", aliases: ["胸形氏"] },
    { id: "yamato-polity", kind: "polity", label: "ヤマト王権", aliases: ["大和朝廷"] },
    { id: "tagorihime-munakata", kind: "deity", label: "田心姫神", aliases: ["田心姫命"] },
    { id: "tagitsuhime-munakata", kind: "deity", label: "湍津姫神", aliases: ["湍津姫命"] },
    { id: "ichikishimahime-munakata", kind: "deity", label: "市杵島姫神", aliases: ["市杵島姫命"] },
    { id: "okinoshima-ritual-period", kind: "event", label: "沖ノ島における古代祭祀（4～9世紀末）", aliases: ["沖ノ島祭祀"] },
    { id: "munakata-state-ritual-end-894", kind: "event", label: "大規模な国家祭祀の終焉（894年）", aliases: ["遣唐使廃止後の祭祀再編"] },
    { id: "okitsumiya-yohai-rebuild-1933", kind: "event", label: "沖津宮遥拝所の再建（1933年）", aliases: ["昭和8年の沖津宮遥拝所再建"] },
  ],
  assertions: [
    { id: "munakata-okinoshima-001", subjectId: "okinoshima-ritual-period", predicate: "occurred_at", objectId: "okinoshima-ritual-site", relationFamily: "ritual", nature: "reviewed-reference", viewpointIds: ["munakata-archaeological-ritual"], sourceIds: ["munakata-archives-okinoshima-ritual-site"], sequence: 1, historicalTime: { kind: "calendar", label: "4世紀～9世紀末", startYear: 300, endYear: 899, approximate: true }, evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed", note: "保存活用協議会の文化財解説が示す考古学的期間。毎年継続した祭祀回数や頻度までは示さない。" },
    { id: "munakata-okinoshima-002", subjectId: "munakata-clan", predicate: "participated_in", objectId: "okinoshima-ritual-period", relationFamily: "historical-context", nature: "reviewed-reference", viewpointIds: ["munakata-archaeological-ritual"], sourceIds: ["munakata-archives-clan-and-ritual"], sequence: 1, historicalTime: { kind: "calendar", label: "4世紀後半以降", startYear: 350, endYear: 899, approximate: true }, evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
    { id: "munakata-okinoshima-003", subjectId: "yamato-polity", predicate: "cooperated_with", objectId: "munakata-clan", relationFamily: "historical-context", nature: "reviewed-reference", viewpointIds: ["munakata-archaeological-ritual"], sourceIds: ["munakata-archives-clan-and-ritual"], sequence: 1, historicalTime: { kind: "calendar", label: "古墳時代を中心とする対外交流期", startYear: 350, endYear: 599, approximate: true }, evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed", note: "保存活用協議会の解説に基づく。両者の政治関係全体を単純化する線ではない。" },
    { id: "munakata-okinoshima-004", subjectId: "munakata-state-ritual-end-894", predicate: "changed", objectId: "okinoshima-ritual-period", relationFamily: "historical-context", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-origin-okinoshima"], sequence: 2, historicalTime: { kind: "calendar", label: "寛平6年", startYear: 894, approximate: false }, evidenceBasis: "institutional-tradition", confidence: "medium", reviewStatus: "reviewed", note: "宗像大社公式が遣唐使廃止により大規模な国家祭祀が終焉したと説明する由緒。考古学資料だけから同年の断絶を確定しない。" },
    { id: "munakata-okinoshima-005", subjectId: "okitsumiya-yohai-rebuild-1933", predicate: "rebuilt", objectId: "okitsumiya-yohai", relationFamily: "historical-context", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-nakatsumiya"], sequence: 3, historicalTime: { kind: "calendar", label: "昭和8年", startYear: 1933, approximate: false }, evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
    { id: "munakata-okinoshima-006", subjectId: "tagorihime-munakata", predicate: "enshrined_at", objectId: "munakata-okitsumiya", relationFamily: "enshrinement", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-origin-okinoshima"], evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
    { id: "munakata-okinoshima-007", subjectId: "tagitsuhime-munakata", predicate: "enshrined_at", objectId: "munakata-nakatsumiya", relationFamily: "enshrinement", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-origin-okinoshima", "munakata-taisha-nakatsumiya"], evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
    { id: "munakata-okinoshima-008", subjectId: "ichikishimahime-munakata", predicate: "enshrined_at", objectId: "munakata-hetsumiya", relationFamily: "enshrinement", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-origin-okinoshima"], evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
    { id: "munakata-okinoshima-009", subjectId: "okitsumiya-yohai", predicate: "located_on", objectId: "oshima-munakata", relationFamily: "association", nature: "reviewed-reference", viewpointIds: ["munakata-institutional-history"], sourceIds: ["munakata-taisha-nakatsumiya"], evidenceBasis: "modern-documentation", confidence: "high", reviewStatus: "reviewed" },
  ],
  presets: [
    {
      id: "munakata-okinoshima-history",
      label: "沖ノ島祭祀遺跡の変遷と国家祭祀",
      lensType: "timeline",
      description: "考古学的に確認される4～9世紀末の沖ノ島祭祀、894年の終焉に関する神社由緒、1933年の遥拝所再建を典拠別に並べる。",
      rootEntityIds: ["okinoshima-ritual-period", "munakata-state-ritual-end-894", "okitsumiya-yohai-rebuild-1933"],
      relationFamilies: ["ritual", "historical-context"],
      viewpointIds: ["munakata-archaeological-ritual", "munakata-institutional-history"],
      expansionDepth: 3,
    },
    {
      id: "munakata-three-shrines",
      label: "宗像三宮の社殿景観と現在祭祀",
      lensType: "relationship",
      description: "沖津宮・中津宮・辺津宮の現在祭神と、大島の沖津宮遥拝所を古代祭祀の連続性とは分けて見る。",
      rootEntityIds: ["munakata-okitsumiya", "munakata-nakatsumiya", "munakata-hetsumiya", "okitsumiya-yohai"],
      relationFamilies: ["enshrinement", "association"],
      viewpointIds: ["munakata-institutional-history"],
      expansionDepth: 2,
      mapConnections: [
        {
          id: "munakata-three-shrines-landscape",
          label: "宗像三宮と沖津宮遥拝所の社殿景観・海中神域軸",
          description:
            "本土の辺津宮、大島の中津宮と沖津宮遥拝所、絶海の孤島・沖ノ島の沖津宮を結ぶ、現在まで継承される国家祭祀の景観直列軸。",
          displayMode: "line",
          contextEntityIds: ["munakata-clan", "tagorihime-munakata", "tagitsuhime-munakata", "ichikishimahime-munakata", "oshima-munakata"],
          placeEntityIds: ["munakata-hetsumiya", "munakata-nakatsumiya", "okitsumiya-yohai", "munakata-okitsumiya"],
          pointFocusEntityIds: {
            "munakata-hetsumiya": "munakata-hetsumiya",
            "munakata-nakatsumiya": "munakata-nakatsumiya",
            "okitsumiya-yohai": "okitsumiya-yohai",
            "munakata-okitsumiya": "munakata-okitsumiya",
          },
          assertionIds: [
            "munakata-okinoshima-006",
            "munakata-okinoshima-007",
            "munakata-okinoshima-008",
            "munakata-okinoshima-009",
          ],
          appearance: { color: "#d7a6ff", dashArray: [6, 6], legendLabel: "宗像三宮神域軸" },
          explorationQuestions: {
            "munakata-nakatsumiya": {
              question: "大島の中津宮は、本土の辺津宮と絶海の沖津宮を中継する実務的・祭祀的結節点としてどう機能したか？",
              reason: "玄界灘に浮かぶ大島に鎮座し湍津姫神を祀る宗像三宮の第二宮。沖ノ島を望む沖津宮遥拝所も併設。",
            },
            "okitsumiya-yohai": {
              question: "女人禁制かつ渡航が禁じられた沖ノ島に対し、大島の遥拝所はどのような信仰空間・視覚装置として機能したか？",
              reason: "大島北端から沖ノ島を直線上に視認・遥拝する場であり、海を渡らずに絶海の神域と感応する空間装置。",
            },
            "munakata-okitsumiya": {
              question: "遣唐使航路の安全を祈るヤマト王権の国家祭祀において、沖ノ島はなぜ『海の正倉院』と呼ばれるほどの奉納を受けたのか？",
              reason: "島全体が御神体であり、女人禁制が守られた絶海の孤島。4〜9世紀にわたる国宝8万点の古代祭祀遺物が手つかずで出土。",
            },
          },
        },
      ],
      spatialOverlay: {
        "type": "FeatureCollection",
        "features": [
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-munakata-core",
                                "label": "宗像中枢圏（田島・辺津宮〜釣川流域）",
                                "sublabel": "宗像氏本拠・玄界海人祭祀の源流",
                                "category": "zone-polity",
                                "color": "#2dd4bf"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.539,
                                                        33.83
                                                ],
                                                [
                                                        130.53837,
                                                        33.83401
                                                ],
                                                [
                                                        130.53652,
                                                        33.83781
                                                ],
                                                [
                                                        130.53355,
                                                        33.84122
                                                ],
                                                [
                                                        130.52959,
                                                        33.84407
                                                ],
                                                [
                                                        130.52485,
                                                        33.84622
                                                ],
                                                [
                                                        130.51956,
                                                        33.84755
                                                ],
                                                [
                                                        130.514,
                                                        33.848
                                                ],
                                                [
                                                        130.50844,
                                                        33.84755
                                                ],
                                                [
                                                        130.50315,
                                                        33.84622
                                                ],
                                                [
                                                        130.49841,
                                                        33.84407
                                                ],
                                                [
                                                        130.49445,
                                                        33.84122
                                                ],
                                                [
                                                        130.49148,
                                                        33.83781
                                                ],
                                                [
                                                        130.48963,
                                                        33.83401
                                                ],
                                                [
                                                        130.489,
                                                        33.83
                                                ],
                                                [
                                                        130.48963,
                                                        33.82599
                                                ],
                                                [
                                                        130.49148,
                                                        33.82219
                                                ],
                                                [
                                                        130.49445,
                                                        33.81878
                                                ],
                                                [
                                                        130.49841,
                                                        33.81593
                                                ],
                                                [
                                                        130.50315,
                                                        33.81378
                                                ],
                                                [
                                                        130.50844,
                                                        33.81245
                                                ],
                                                [
                                                        130.514,
                                                        33.812
                                                ],
                                                [
                                                        130.51956,
                                                        33.81245
                                                ],
                                                [
                                                        130.52485,
                                                        33.81378
                                                ],
                                                [
                                                        130.52959,
                                                        33.81593
                                                ],
                                                [
                                                        130.53355,
                                                        33.81878
                                                ],
                                                [
                                                        130.53652,
                                                        33.82219
                                                ],
                                                [
                                                        130.53837,
                                                        33.82599
                                                ],
                                                [
                                                        130.539,
                                                        33.83
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-shikanoshima-hakata",
                                "label": "志賀島〜博多湾口（阿曇氏・金印海域）",
                                "sublabel": "志賀海神社・那津海人ネットワーク",
                                "category": "zone-polity",
                                "color": "#38bdf8"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.365,
                                                        33.67
                                                ],
                                                [
                                                        130.36412,
                                                        33.67556
                                                ],
                                                [
                                                        130.36153,
                                                        33.68085
                                                ],
                                                [
                                                        130.35736,
                                                        33.68559
                                                ],
                                                [
                                                        130.35182,
                                                        33.68955
                                                ],
                                                [
                                                        130.34519,
                                                        33.69252
                                                ],
                                                [
                                                        130.33779,
                                                        33.69437
                                                ],
                                                [
                                                        130.33,
                                                        33.695
                                                ],
                                                [
                                                        130.32221,
                                                        33.69437
                                                ],
                                                [
                                                        130.31481,
                                                        33.69252
                                                ],
                                                [
                                                        130.30818,
                                                        33.68955
                                                ],
                                                [
                                                        130.30264,
                                                        33.68559
                                                ],
                                                [
                                                        130.29847,
                                                        33.68085
                                                ],
                                                [
                                                        130.29588,
                                                        33.67556
                                                ],
                                                [
                                                        130.295,
                                                        33.67
                                                ],
                                                [
                                                        130.29588,
                                                        33.66444
                                                ],
                                                [
                                                        130.29847,
                                                        33.65915
                                                ],
                                                [
                                                        130.30264,
                                                        33.65441
                                                ],
                                                [
                                                        130.30818,
                                                        33.65045
                                                ],
                                                [
                                                        130.31481,
                                                        33.64748
                                                ],
                                                [
                                                        130.32221,
                                                        33.64563
                                                ],
                                                [
                                                        130.33,
                                                        33.645
                                                ],
                                                [
                                                        130.33779,
                                                        33.64563
                                                ],
                                                [
                                                        130.34519,
                                                        33.64748
                                                ],
                                                [
                                                        130.35182,
                                                        33.65045
                                                ],
                                                [
                                                        130.35736,
                                                        33.65441
                                                ],
                                                [
                                                        130.36153,
                                                        33.65915
                                                ],
                                                [
                                                        130.36412,
                                                        33.66444
                                                ],
                                                [
                                                        130.365,
                                                        33.67
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "sightline-munakata-okinoshima",
                                "label": "宗像三宮〜沖ノ島 遥拝視軸（約60km）",
                                "sublabel": "辺津宮〜大島中津宮（遥拝所）〜沖津宮（沖ノ島）の神域軸",
                                "category": "sightline",
                                "color": "#f43f5e",
                                "dashed": true
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                130.5142,
                                                33.8308
                                        ],
                                        [
                                                130.435,
                                                33.9
                                        ],
                                        [
                                                130.418,
                                                33.911
                                        ],
                                        [
                                                130.103,
                                                34.244
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "route-genkai-coastal",
                                "label": "玄界灘沿岸海人航路（志賀島〜勝浦〜宗像〜鐘崎〜関門）",
                                "sublabel": "海人族が結んだ沿岸航行回廊",
                                "category": "route-primary",
                                "color": "#fbbf24"
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                130.3,
                                                33.66
                                        ],
                                        [
                                                130.42,
                                                33.76
                                        ],
                                        [
                                                130.52,
                                                33.88
                                        ],
                                        [
                                                130.65,
                                                33.93
                                        ],
                                        [
                                                130.93,
                                                33.95
                                        ]
                                ]
                        }
                }
        ],
        "legend": [
                {
                        "label": "宗像三宮〜沖ノ島 遥拝視軸（約60km）",
                        "color": "#f43f5e",
                        "dashed": true
                },
                {
                        "label": "宗像玄界海人中枢圏",
                        "color": "#2dd4bf",
                        "isPolygon": true
                },
                {
                        "label": "博多湾・那津沿岸海域",
                        "color": "#38bdf8",
                        "isPolygon": true
                },
                {
                        "label": "玄界灘沿岸海人航路",
                        "color": "#fbbf24"
                }
        ]
},
    },
  ],
});
