import type {
  RegionalComparisonEntry,
  SacredSiteStratigraphyProfile,
  SourceTraditionComparisonEntry,
} from "./source-evaluation";

/**
 * 代表的な重層聖域スポットの「祭祀史7項目（Sacred Site Stratigraphy Profile）」定義
 * - 「現在の祭神・社伝の主張（史料B/C・確度B）」と「考古・古代基礎史料で確認できる基底層（史料A・確度A）」を明確に分離して保持する。
 */
export const SACRED_SITE_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
  {
    id: "stratigraphy-munakata-okinoshima",
    primarySpotIds: ["munakata-taisha", "spot-okinoshima"],
    primarySpotNames: [
      "宗像大社",
      "宗像大社（辺津宮）",
      "宗像大社 辺津宮",
      "沖ノ島",
      "宗像大社 沖津宮",
      "沖ノ島（沖津宮）",
      "高宮祭場",
    ],
    targetSpotIds: ["munakata-taisha", "spot-okinoshima"],
    targetRegion: "宗像",
    spotNames: [
      "宗像大社",
      "宗像大社（辺津宮）",
      "宗像大社 辺津宮",
      "沖ノ島",
      "宗像大社 沖津宮",
      "沖ノ島（沖津宮）",
      "高宮祭場",
    ],
    title: "宗像大社・沖ノ島 祭祀景観の層構造",
    summary:
      "4〜9世紀の沖ノ島巨岩・露天祭祀遺構（考古物証：確度A）から、記紀・延喜式における宗像三女神の三宮体制（古代基礎史料：史料A）、中近世の社殿再興と近代社格再編までが重なる列島屈指の重層聖域。",
    currentDeities:
      "宗像三女神 — 田心姫神（沖津宮・沖ノ島）、湍津姫神（中津宮・大島）、市杵島姫神（辺津宮・田島）",
    claimedOrigin: {
      statement:
        "天照大神と素戔嗚尊の誓約（うけい）により化成した三女神が、「道主貴（みちぬしのむち）」として玄界灘の海北道中へ降臨し鎮座したとする神代起源伝承。",
      sourceTitle: "『日本書紀』神代上・瑞珠盟約段（第三の一書）／社伝由緒",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "養老4年（720年）編纂",
        extantManuscriptEra: "平安〜鎌倉期古写本（卜部家本等）",
        targetEra: "神代（神話的起源）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『古事記』（712年）および『日本書紀』（720年）に胸形（宗像）君が奉斎する三女神（奥津宮・中津宮・辺津宮）が明記され、『延喜式』神名帳（927年）で筑前国宗像郡の名神大社三座として記載。ただし4世紀後半の祭祀開始時点から同名の三女神体系であったかまでは文献・考古単独では直接証明されない。",
      sourceTitle: "『古事記』『日本書紀』『延喜式』神名帳・沖ノ島祭祀遺跡発掘報告",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "8世紀初頭（712〜720年）／延長5年（927年）",
        extantManuscriptEra: "真福寺本古事記（1371〜1372年写）・九条家本延喜式（平安末期写）",
        targetEra: "古墳時代中期（4世紀後半）〜平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "沖津宮（沖ノ島）は4世紀後半〜9世紀末の祭祀遺跡が原位置で存続。辺津宮（田島）は遅くとも7世紀後半〜8世紀初頭には高宮（下高宮）および社殿前身の祭祀拠点が形成され、1590年（天正18年）造営の本殿が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "4世紀後半〜9世紀末（古墳〜平安初期）",
        description:
          "沖ノ島で「岩上祭祀 → 岩陰祭祀 → 半岩陰・半露天祭祀 → 露天祭祀」の4段階変遷（銅鏡・金製指輪・唐三彩・滑石製形代など約8万点の奉献遺物）。",
        certaintyTier: "A",
      },
      {
        era: "7世紀後半〜8世紀（飛鳥〜奈良期）",
        description:
          "沖ノ島での露天祭祀と並行して、大島（中津宮）および九州本土・釣川河口域（辺津宮・高宮）へ祭祀施設が展開し、三宮体系が確立。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世（鎌倉・戦国・江戸期）",
        description:
          "宗像大宮司家による神仏習合・社領経営、戦国期の焼失と小早川隆景による辺津宮本殿再建（1590年）、筑前福岡藩による保護。",
        certaintyTier: "A",
      },
      {
        era: "明治〜昭和期（近代再編）",
        description:
          "神仏分離・官幣大社列格。昭和期の第1〜3次沖ノ島学術調査により、社伝を超えた4〜9世紀の国家祭祀物証が確認された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "玄界灘の絶海の孤島「沖ノ島」の島体そのものと巨岩群（磐座）、および辺津宮背後の宗像山（高宮祭場・社殿を持たない古代露天祭祀遺構）、周辺の宗像氏首長墓群（新原・奴山古墳群）。",
      features: [
        "沖ノ島巨岩群（1号〜22号遺跡）",
        "辺津宮・高宮祭場（露天祭祀）",
        "新原・奴山古墳群",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["宗像氏（胸形君・宗像朝臣）", "ヤマト王権（対外遣使・国家祭祀）"],
      routeAndPoliticalContext:
        "九州本土（辺津宮）— 大島（中津宮）— 沖ノ島（沖津宮）— 朝鮮半島（伽耶・百済・新羅・唐）を結ぶ玄界灘・海北道中の海上交通大動脈。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-shikaumi-jinja",
    primarySpotIds: ["spot-shikaumi-jinja"],
    primarySpotNames: ["志賀海神社", "志賀海神社（本宮）", "志賀神社"],
    targetSpotIds: ["spot-shikaumi-jinja"],
    targetRegion: "福岡",
    spotNames: ["志賀海神社", "志賀島", "勝馬・沖津宮（志賀海神社摂社）", "勝馬・沖津宮"],
    title: "志賀海神社・志賀島 祭祀景観の層構造",
    summary:
      "博多湾口を扼する志賀島に鎮座する阿曇氏（安曇氏）奉斎の古社。海神（綿津見三神）と阿曇連の祖神関係が記紀・風土記・万葉集・延喜式（史料A）で一貫して確認されると同時に、勝馬からの遷座伝承や神功皇后伝承・鹿角奉納習俗が重なる。",
    currentDeities:
      "綿津見三神 — 底津綿津見神・仲津綿津見神・表津綿津見神（相殿：神功皇后・玉依姫命・応神天皇）",
    claimedOrigin: {
      statement:
        "伊弉諾尊の禊祓により生じた綿津見三神を阿曇氏の祖（穂高見命）が奉斎したことに始まり、元は志賀島北端の勝馬（表津宮・中津宮・沖津宮の三社）に鎮座していたが、2世紀（または神功皇后三韓征伐時）に現在地（勝山・現社地）へ遷座したと伝える。",
      sourceTitle: "志賀海神社社伝・『筑前国続風土記』（貝原益軒・1709年）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世（宝永6年／1709年『筑前国続風土記』等）",
        targetEra: "神代〜神功皇后伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『古事記』『日本書紀』に綿津見三神が「阿曇連らが拝き祭る筑紫の斯我（志賀）の神」と明記され、『貞観元年（859年）日本三代実録』の神階奉授記事および『延喜式』神名帳（927年）の筑前国糟屋郡「志加海神社三座 並名神大」として確認される。",
      sourceTitle: "『古事記』『日本書紀』『日本三代実録』『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "712年・720年・901年・927年",
        extantManuscriptEra: "平安〜南北朝期古写本",
        targetEra: "古墳〜奈良・平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "志賀島北部の勝馬（沖津宮・旧鎮座伝承地）と南東端の現在地（博多湾口を望む丘陵）の2拠点構造を持ち、平安期の式内名神大社三座段階では現社地周辺を中心に三座の祭祀が確立していたとみられる。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生〜古墳時代",
        description:
          "志賀島が対外交渉・海上交通の要衝として機能（1784年に志賀島叶の崎から「漢委奴国王」金印が出土）。海人集団・阿曇氏の拠点化。",
        certaintyTier: "A",
      },
      {
        era: "奈良〜平安時代（律令期）",
        description:
          "阿曇氏が宮内省内膳司（高橋氏とともに御贄を貢進）として中央政界・海産物貢納に関与し、筑前国糟屋郡の名神大社三座に列格。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世",
        description:
          "神功皇后の三韓出兵伝承（亀石・鹿角奉納・御神楽）や神宮寺との神仏習合が展開し、福岡藩主黒田氏による社殿造営・崇敬を受ける。",
        certaintyTier: "A",
      },
      {
        era: "明治以降（近代再編）",
        description:
          "明治4年（1871年）に官幣小社へ列格し、神仏分離を経て現在の社殿・境内構成へ整備。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "博多湾と玄界灘を分かつ陸繋島「志賀島」の地形そのもの、勝馬海岸の小島（沖津宮の岩礁・島嶼祭祀）、および境内の遥拝石（亀石）・磐座的岩礁。",
      features: ["勝馬・沖津宮（小島・岩礁聖域）", "博多湾口を望む勝山丘陵", "志賀島金印出土地周辺"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["阿曇氏（安曇連・海人族系氏族）"],
      routeAndPoliticalContext:
        "博多湾（那津・大宰府外港）の出入口を掌握する海上関門であり、壱岐・対馬・朝鮮半島航路および瀬戸内・信濃（穂高）等への阿曇氏展開の起点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-itsukushima-misen",
    primarySpotIds: ["spot-import-3048de44"],
    primarySpotNames: ["厳島神社", "嚴島神社"],
    targetSpotIds: [
      "spot-import-3048de44",
      "spot-import-ce8f62f9",
      "spot-import-ce520293",
      "spot-quick-7f78b183ba010594",
    ],
    targetRegion: "広島",
    spotNames: [
      "厳島神社",
      "嚴島神社",
      "弥山",
      "弥山原始林・磐座群",
      "御山神社",
      "大聖院",
    ],
    title: "厳島・弥山 祭祀景観の層構造",
    summary:
      "神体山である弥山山頂の巨岩群（自然神域・磐座層）を基底とし、9世紀初頭の古代史料（『日本後紀』・『延喜式』：史料A）、平安末期の平清盛による海上寝殿造社殿と空海・修験系の三鬼大権現信仰（神仏習合層）、明治の神仏分離による再編までが立体的に重なる。",
    currentDeities:
      "宗像三女神 — 市杵島姫命・田心姫命・湍津姫命（御山神社も同三女神、大聖院・弥山三鬼堂は三鬼大権現）",
    claimedOrigin: {
      statement:
        "推古天皇元年（593年）、佐伯鞍職が神託を受けて社殿を創建したとする社伝。また大同元年（806年）に空海（弘法大師）が弥山で求聞持修法を行い開山したとする真言密教・修験伝承。",
      sourceTitle: "厳島神社社伝・『房顕覚書』・大聖院縁起",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世〜近世の社伝・寺院縁起",
        targetEra: "飛鳥時代（593年）／平安初期（806年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "弘仁2年（811年）『日本後紀』に「安芸国佐伯郡伊都岐嶋神」が名神に預かる記事が確実な文献初見であり、『延喜式』神名帳（927年）で安芸国佐伯郡「伊都伎嶋神社 名神大」として記載。古代史料上の神名は「伊都岐嶋神」であり、宗像三女神との明確な同定・固定化は平安後期〜中世以降の再編を含む。",
      sourceTitle: "『日本後紀』（弘仁2年7月条）・『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "承和7年（840年）『日本後紀』／延長5年（927年）『延喜式』",
        extantManuscriptEra: "三条西家本・九条家本",
        targetEra: "平安時代初期（9世紀初頭）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "島全体を神体として海浜から遥拝・奉斎する構造が先行し、仁安3年（1168年）頃に佐伯景弘と平清盛の支援によって現在の海上に張り出す寝殿造社殿群が造営された（現在の本殿は元亀2年／1571年毛利元就再建）。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "先史〜古代（基底層）",
        description:
          "弥山（標高535m）の山体・山頂巨岩群（くぐり岩・舟岩・盤石）を神体とする島嶼・山岳自然崇拝。",
        certaintyTier: "A",
      },
      {
        era: "9〜10世紀（律令期）",
        description:
          "安芸国佐伯郡の「伊都岐嶋神」として名神大社に列格し、安芸国一宮へと発展。",
        certaintyTier: "A",
      },
      {
        era: "12世紀後半（平安末期・平家造営）",
        description:
          "平清盛・佐伯景弘により海上社殿群を大規模造営し、平家一門の氏神・法華経奉納（平家納経）の聖地となる。同時に弥山では三鬼大権現（追帳鬼神・時眉鬼神・魔羅鬼神）を中心とする山岳修験・神仏習合空間が発達。",
        certaintyTier: "A",
      },
      {
        era: "明治元年（1868年）以降（神仏分離）",
        description:
          "神仏分離令により別当寺の大願寺・大聖院等を分離し、弥山山頂の三鬼堂（三鬼大権現）と御山神社（三女神の奥宮）が空間・制度的に切り分けられた。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "花崗岩の奇岩・巨石が露出する弥山山頂部の巨岩群（磐座）、弥山原始林、および大野瀬戸に面した御笠浜の干満差を持つ海浜・入江。",
      features: ["弥山山頂巨岩群（磐座・くぐり岩）", "弥山原始林（神体山）", "御笠浜（潮汐海浜祭祀空間）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["佐伯氏（安芸国佐伯郡の豪族・神主家）", "平氏（平清盛）", "大内氏・毛利氏"],
      routeAndPoliticalContext:
        "安芸灘と広島湾・大野瀬戸を結ぶ瀬戸内海航路の要衝であり、海から島・海浜社殿を経て弥山山頂へ登拝する垂直・水平の複合経路。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-usa-omoto",
    primarySpotIds: ["usa-jingu"],
    primarySpotNames: ["宇佐神宮", "宇佐八幡宮"],
    targetSpotIds: ["usa-jingu", "omoto-jinja"],
    targetRegion: "宇佐",
    spotNames: [
      "宇佐神宮",
      "御許山",
      "御許山・大元神社",
      "御許山 大元神社",
      "宇佐神宮 大元神社",
    ],
    title: "宇佐神宮・御許山 祭祀景観の層構造",
    summary:
      "宇佐平野の背後に聳える御許山（大元山）山頂の三巨石（磐座）と比売大神の在地基層祭祀に、応神天皇（八幡神）・神功皇后の国家神話と初期の神仏習合（弥勒寺・神宮寺）が重層した八幡総本宮。",
    currentDeities:
      "一之御殿：八幡大神（応神天皇）、二之御殿：比売大神（多岐津姫命・市杵島姫命・多紀理姫命）、三之御殿：神功皇后",
    claimedOrigin: {
      statement:
        "欽明天皇32年（571年）に八幡神が鷹居瀬社・小山田社等を経て顕現し、和銅5年（712年）に鷹居社、神亀2年（725年）に現在地（亀山・小椋山）へ一之御殿が造営されたとする伝承。",
      sourceTitle: "『八幡宇佐宮御託宣集』（1290〜1313年編纂）・『扶桑略記』",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "鎌倉時代後期（正応3年〜正和2年／1290〜1313年）",
        targetEra: "6世紀後半（欽明朝）〜奈良時代初期（725年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『続日本紀』天平9年（737年）条・天平勝宝元年（749年）東大寺盧舎那仏造立への八幡大神上京記事が同時代一次史料として明確であり、『延喜式』神名帳（927年）で豊前国宇佐郡「八幡大菩薩宇佐宮・比売神社・大帯姫廟神社（並名神大）」の三座が記載される。",
      sourceTitle: "『続日本紀』『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "延暦16年（797年）『続日本紀』／延長5年（927年）『延喜式』",
        extantManuscriptEra: "金沢文庫本続日本紀・九条家本延喜式",
        targetEra: "奈良時代（8世紀前半〜中葉）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "8世紀前半（神亀2年／725年〜天平年間）には現在の小椋山（亀山）に宇佐宮および神宮寺（弥勒寺）の複合空間が形成されており、奥宮にあたる御許山山頂の三巨石は社殿を持たない禁足磐座として現在も維持されている。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳〜飛鳥時代（基層）",
        description:
          "御許山山頂の三巨石（磐座）における自然崇拝・比売大神（在地女神）祭祀と、宇佐国造・辛嶋氏・大神氏ら複数氏族の関与。",
        certaintyTier: "A",
      },
      {
        era: "8世紀（奈良時代・国家神化と初期神仏習合）",
        description:
          "隼人征討・東大寺大仏造立・道鏡事件（宇佐八幡宮神託事件）を通じて皇室守護の国家神となり、「八幡大菩薩」号と弥勒寺（神宮寺）による日本最古級の神仏習合体制が成立。",
        certaintyTier: "A",
      },
      {
        era: "平安〜中世（三殿体制・六郷満山連携）",
        description:
          "弘仁14年（823年）に神功皇后を祀る三之御殿が加わり現在の一〜三之御殿（八幡造）体制が確立。国東半島の六郷満山寺院群と一体の宗教圏を形成。",
        certaintyTier: "A",
      },
      {
        era: "明治元年（1868年）以降（神仏分離）",
        description:
          "神仏分離により境内の弥勒寺等の仏教施設が撤去され、官幣大社宇佐神宮として再編。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "御許山（標高647m）山頂の禁足地に立つ3基の巨石（磐座）、小椋山の独立丘陵と菱形池（湧水・鍛冶伝承池）、および駅館川流域の宇佐古墳群（赤塚古墳・免ヶ平古墳等）。",
      features: ["御許山山頂・三巨石（禁足磐座）", "菱形池（御霊水）", "駅館川・川部高森古墳群"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["宇佐氏（宇佐公）", "辛嶋氏", "大神氏（大神朝臣）"],
      routeAndPoliticalContext:
        "周防灘（瀬戸内海西端）と豊後・日向・筑紫を結ぶ海上・陸上交通の結節点であり、ヤマト王権の九州経営と対朝鮮半島・隼人政策の前線拠点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-kashii-gu",
    primarySpotIds: ["spot-kashii-gu"],
    primarySpotNames: ["香椎宮", "橿日宮", "香椎廟", "橿日廟"],
    targetSpotIds: ["spot-kashii-gu"],
    targetRegion: "福岡",
    spotNames: ["香椎宮", "香椎古宮", "橿日宮", "香椎宮・古宮"],
    title: "香椎宮・古宮 祭祀景観の層構造",
    summary:
      "記紀における仲哀天皇崩御と神功皇后審神者（さにわ）の行宮伝承地であり、古代律令制下では「神社」ではなく諸陵寮管轄の霊廟「橿日廟」として扱われた特異な層構造を持つ（史料A・確度A）。",
    currentDeities:
      "主祭神：仲哀天皇・神功皇后（配祀：応神天皇・住吉大神）",
    claimedOrigin: {
      statement:
        "仲哀天皇9年（200年）に熊襲征伐の行宮「橿日宮」が営まれ、天皇崩御の後、神功皇后が神代・小山田邑に斎宮を建てて自ら神主となり、さらに神亀元年（724年）に神託により現在地へ社殿が造営されたと伝える。",
      sourceTitle: "『日本書紀』仲哀天皇紀・神功皇后摂政前紀／香椎宮社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "養老4年（720年）『日本書紀』／中近世社伝",
        targetEra: "仲哀朝〜奈良時代初期（724年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『万葉集』巻6（天平9年／737年、大伴旅人・小野老らの香椎廟参拝歌）および『続日本紀』天平宝字3年（759年）条に「香椎廟」として現れ、『延喜式』（927年）では神名帳（神社）ではなく諸陵寮式に「橿日廟」として記載される。朝廷から伊勢・宇佐に次ぐ奉幣を受ける国家の霊廟であった。",
      sourceTitle: "『万葉集』『続日本紀』『延喜式』諸陵寮式",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "8世紀中葉〜延長5年（927年）",
        extantManuscriptEra: "西本願寺本万葉集・九条家本延喜式",
        targetEra: "奈良〜平安時代（8〜10世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "仲哀天皇の行宮・棺が掛けられた椎の木の伝承地である「古宮（香椎古宮）」と、神功皇后を祀る現在の本宮（寛政13年／1801年福岡藩主黒田斉清再建の香椎造本殿）の二拠点構造を持つ。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "奈良〜平安時代（霊廟「橿日廟」期）",
        description:
          "『延喜式』神名帳に記載されない「廟（橿日廟）」として大宰府官人の参拝や朝廷からの奉幣使派遣（香椎使）を受け、宇佐八幡宮とも密接に連動。",
        certaintyTier: "A",
      },
      {
        era: "平安後期〜中世（神宮寺と武家崇敬）",
        description:
          "石清水八幡宮や筥崎宮との神仏習合・本末関係の中で「香椎宮」として神社化し、大宮司（武内宿禰後裔を称する三苫氏・大中臣氏等）が奉仕。",
        certaintyTier: "A",
      },
      {
        era: "近世（寛政13年／1801年）",
        description:
          "筑前福岡藩第10代藩主・黒田斉清により、全国唯一の建築様式「香椎造」の現本殿が再建される。",
        certaintyTier: "A",
      },
      {
        era: "明治〜大正期（近代社格と主祭神再編）",
        description:
          "明治18年（1885年）に官幣大社に列格。大正4年（1915年）にそれまで神功皇后一座が中心だった本殿に仲哀天皇を合祀し、二座を主祭神とする現在形へ再編。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "博多湾奥・香椎潟（旧入海）を望む立花山麓の地形、古宮の「香椎（綾杉・椎の木）」聖樹信仰、および湧水「不老水」。",
      features: ["古宮・棺掛椎（聖樹・殯宮伝承地）", "香椎潟（旧内海津）", "不老水（霊泉湧水）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大宰府官人層", "中臣・大中臣氏系祠官", "武内宿禰伝承系氏族"],
      routeAndPoliticalContext:
        "博多湾東岸（香椎潟）の海陸結節点であり、大宰府から糟屋評・宗像・瀬戸内へと抜ける古代官道および対外遣使の奉幣ルート。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-miyajidake",
    primarySpotIds: ["spot-miyajidake-jinja"],
    primarySpotNames: ["宮地嶽神社", "宮地岳古墳"],
    targetSpotIds: ["spot-miyajidake-jinja"],
    targetRegion: "福岡",
    spotNames: ["宮地嶽神社", "宮地岳古墳", "宮地嶽古墳", "奥の院・宮地岳古墳"],
    title: "宮地嶽神社・宮地岳古墳 祭祀景観の層構造",
    summary:
      "社伝が語る神功皇后の渡海祈願伝承（史料B）の背後に、全長23mの巨石横穴式石室と国宝級の金銅製馬具・ガラス製品を出土した6世紀末〜7世紀初頭の首長墓「宮地岳古墳」（史料A・確度A）が奥の院として実在する典型的重層聖地。",
    currentDeities:
      "息長足比売命（神功皇后）、勝村大神、勝頼大神",
    claimedOrigin: {
      statement:
        "神功皇后が三韓渡海に際し、宮地岳の山頂にて天神地祇に祈願した故地を起源とし、約1700年前の創建と伝える。",
      sourceTitle: "宮地嶽神社社伝・近世筑前地誌",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代の社伝・地誌",
        targetEra: "神功皇后伝承期（古墳時代初期相当）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『延喜式』神名帳（927年）には記載が見えず（式外社）、確実な最古層の物証は神社奥の院の不動神社に開口する「宮地岳古墳」（6世紀末〜7世紀初頭の円墳・巨石横穴式石室）およびそこから出土した国宝指定の金銅製鞍金具・頭椎大刀・緑色ガラス丸玉等の考古遺物である。",
      sourceTitle: "宮地岳古墳出土品（国宝・九州国立博物館寄託）／『筑前国続風土記』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "古墳時代終末期（6世紀末〜7世紀初頭）造営／昭和9年（1934年）学術調査",
        targetEra: "6世紀末〜7世紀初頭（飛鳥時代初期）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "元は宮地岳山頂（古宮）に祀られていた祠が中世〜近世に山腹の現在地へ遷座し、奥の院の巨石古墳石室は不動明王（不動窟）として信仰されてきた。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "6世紀末〜7世紀初頭（古墳終末期）",
        description:
          "津屋崎古墳群の最高首長墓として「宮地岳古墳」（巨石横穴式石室）が築造され、ヤマト王権および朝鮮半島と直結する豪華副葬品が納められる。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世（神仏習合・不動窟信仰）",
        description:
          "開口した巨石石室が「不動窟」として修験・真言系の信仰対象となり、神功皇后・勝村・勝頼の三柱を祀る宮地嶽大明神として信仰を集める。",
        certaintyTier: "A",
      },
      {
        era: "明治〜昭和期（近代商業開運信仰と国宝発見）",
        description:
          "北九州・筑豊炭田や商工業者の開運・商売繁盛信仰により大規模社殿が整備され、昭和初期の石室調査で出土遺物が一括国宝となる。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "玄界灘（津屋崎・相島）を見下ろす宮地岳（標高181m）の山体と、奥の院・不動神社を成す巨石横穴式石室（宮地岳古墳）、および周辺の津屋崎古墳群（勝浦峯ノ畑古墳〜在自山ノ神古墳）。",
      features: ["宮地岳古墳（巨石横穴式石室・国宝出土）", "宮地岳山頂（古宮）", "津屋崎古墳群・旧入海（津屋崎潟）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["胸形君（宗像氏）西翼の海人首長層", "ヤマト王権対外交易勢力"],
      routeAndPoliticalContext:
        "宗像（釣川流域）と糟屋・博多湾の中間に位置する津屋崎潟（古代の良港）を掌握し、沖ノ島・玄界灘航路を支えた海人首長の拠点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-sumiyoshi",
    primarySpotIds: ["spot-sumiyoshi-jinja-fukuoka", "spot-sumiyoshi-taisha"],
    primarySpotNames: [
      "住吉神社",
      "筑前國一宮 住吉神社",
      "筑前一之宮 住吉神社",
      "博多 住吉神社",
      "博多住吉神社",
      "住吉大社",
    ],
    targetSpotIds: ["spot-sumiyoshi-jinja-fukuoka", "spot-sumiyoshi-taisha", "spot-arahito-jinja"],
    targetRegion: "福岡",
    spotNames: [
      "住吉神社",
      "筑前國一宮 住吉神社",
      "筑前一之宮 住吉神社",
      "博多 住吉神社",
      "博多住吉神社",
      "住吉大社",
      "現人神社",
    ],
    title: "住吉神社（博多・摂津）・現人神社 祭祀景観の層構造",
    summary:
      "伊弉諾尊の禊祓から生じた住吉三神（筒男三神）の海神祭祀を基底とし、那珂川流域（現人・博多住吉）と大阪湾（摂津住吉）の双極拠点、さらに神功皇后伝承・遣唐使航路守護・和歌神化が重層する。",
    currentDeities:
      "住吉三神 — 底筒男命・中筒男命・表筒男命（配祀：天照皇大神・神功皇后）",
    claimedOrigin: {
      statement:
        "伊弉諾尊が筑紫の日向の橘の小戸の阿波岐原で禊祓を行った際に出現した住吉三神を祀り、博多住吉神社を「住吉本宮（日本第一住吉宮）」、または神功皇后摂政11年（211年）に摂津住吉へ鎮座したと伝える。",
      sourceTitle: "『古事記』『日本書紀』神代・神功皇后紀／『住吉大社神代記』／博多住吉神社社伝",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "712年・720年（記紀）／天平3年（731年）仮託・平安期成立説もある『住吉大社神代記』",
        targetEra: "神代〜神功皇后摂政期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本書紀』神功皇后紀に荒魂を穴門山田邑、和魂を大津淳中倉之長峡（摂津住吉）に祀る記事があり、『延喜式』神名帳（927年）では筑前国那珂郡「住吉神社三座 並名神大」および摂津国住吉郡「住吉坐神社四座 並名神大」として双方が国家最高格の名神大社に列する。",
      sourceTitle: "『古事記』『日本書紀』『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "712年・720年・927年",
        extantManuscriptEra: "平安〜南北朝期古写本",
        targetEra: "古墳〜奈良・平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "博多住吉神社はかつて那珂川河口の「冷泉津（博多湾の入海岬）」に面する海浜聖地であり（現本殿は元和9年／1623年黒田長政再建の住吉造）、摂津住吉大社も古代の大阪湾岸（住吉津）に面して第一〜第四本宮のL字配置を保持する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳〜飛鳥時代（海人・外交拠点）",
        description:
          "那珂川流域（奴国中枢〜博多湾岸）および難波・住吉津の航海守護神として、津守氏や筑紫海人層により筒男三神が奉斎される。",
        certaintyTier: "A",
      },
      {
        era: "奈良〜平安時代（律令期・遣唐使守護と一宮化）",
        description:
          "遣唐使船の航路安全祈願の国家祭祀を担い、筑前国一宮・摂津国一宮として確立。摂津住吉は四座目に神功皇后（息長足姫命）を配する四本宮体制となる。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世（和歌神・神仏習合と福岡藩再建）",
        description:
          "中世には軍神から和歌・芸能・農耕の神へと信仰が拡大。博多住吉神社は戦国期の兵火後、1623年に黒田長政により古代様式を伝える住吉造本殿が再建された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "博多住吉が立地する旧那珂川河口砂州・岬地形（冷泉津）、那珂川上流の灌漑・水源祭祀地（現人神社・山田堰周辺）、および弥生王墓群（須玖岡本遺跡・那珂遺跡群）に近接する立地。",
      features: ["旧冷泉津・那珂川河口岬地形", "住吉造本殿（重要文化財）", "那珂川水系（現人神社〜博多湾）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["津守氏（津守連・住吉大社祠官）", "筑紫・那津の海人層", "佐伯・大伴・阿曇等の外交軍事氏族"],
      routeAndPoliticalContext:
        "難波津・住吉津（瀬戸内海東端）と関門（穴門住吉）・博多湾那津（筑前住吉）・壱岐住吉を一直線に結ぶヤマト王権の対外航路ネットワーク。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-kora-taisha",
    primarySpotIds: ["spot-kora-taisha"],
    primarySpotNames: ["高良大社", "筑後国一の宮 高良大社", "高良山", "高良玉垂宮"],
    targetSpotIds: ["spot-kora-taisha"],
    targetRegion: "久留米",
    spotNames: ["高良大社", "高良山", "高良山神籠石", "高良玉垂宮"],
    title: "高良大社・高良山神籠石 祭祀景観の層構造",
    summary:
      "筑後川中流域を見下ろす高良山に鎮座する筑後国一宮。山腹を取り巻く7世紀の古代山城「高良山神籠石」（考古物証：確度A）と、正体について複数の有力説が並立する主祭神「高良玉垂命」の重層信仰を持つ。",
    currentDeities:
      "高良玉垂命（左右相殿：八幡大神・住吉大神、別宮：豊比咩命）",
    claimedOrigin: {
      statement:
        "履中天皇元年（400年）創建と伝え、高良玉垂命が神功皇后の三韓出兵時に干珠・満珠を奉じて先鋒を務め、高良山に鎮座したとする縁起伝承。また元々高良山は地主女神・高良御子神（または豊比咩命）の山であり、高良神が一夜の宿を借りて結界を張り鎮座したという借宿神話を持つ。",
      sourceTitle: "『高良玉垂宮神秘書』（中世末期成立）・高良大社社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "室町〜戦国期（『高良玉垂宮神秘書』）",
        targetEra: "神功皇后伝承期〜履中天皇元年（400年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『続日本後紀』承和7年（840年）条の神階授与記事が確実な文献初見であり、『延喜式』神名帳（927年）で筑後国三井郡「高良玉垂命神社 名神大」として記載される。また山腹の「高良山神籠石」（延長約1.5kmの列石・水門遺構）が7世紀の古代山城として考古学的に確認される。",
      sourceTitle: "『続日本後紀』『日本三代実録』『延喜式』神名帳・高良山神籠石発掘調査",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "869年『続日本後紀』／927年『延喜式』",
        extantManuscriptEra: "平安〜近世写本",
        targetEra: "飛鳥時代（7世紀）〜平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "7世紀には高良山に神籠石（古代山城）が築かれ、遅くとも9世紀前半には山上に高良玉垂命神社と神宮寺（高良山隆慶寺等）の複合山岳聖域が成立していた（現社殿は万延元年／1860年久留米藩主有馬頼咸造営）。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳〜飛鳥時代（磐座・首長墓・神籠石）",
        description:
          "高良山奥宮周辺の磐座・湧水祭祀と山麓の御塚・権現塚古墳などの有力首長墓、さらに7世紀後半の対外緊張期に築かれた古代山城「高良山神籠石」。",
        certaintyTier: "A",
      },
      {
        era: "平安〜中世（筑後国一宮・天台山岳修験）",
        description:
          "筑後国一宮として国司・在庁官人の崇敬を集め、中世には天台宗寺院群（高良山二十六ヶ寺）と一体化した巨大宗教都市・軍事拠点となる。『高良玉垂宮神秘書』が編纂される。",
        certaintyTier: "A",
      },
      {
        era: "祭神論争（中世〜近代）",
        description:
          "主祭神「高良玉垂命」の正体について、①武内宿禰説、②物部保連（物部氏祖）説、③藤大臣（安曇磯良・住吉系海人）説、④水沼君祖神説などが並立し現在も単一説に確定していない。",
        certaintyTier: "C",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "耳納山地西端の霊峰・高良山の山体、山腹を巡る「高良山神籠石」の切石列石、奥宮（高良御子神社・水分社）の湧水・磐座。",
      features: ["高良山神籠石（国指定史跡・7世紀山城）", "高良山奥宮（湧水・磐座）", "権現塚・御塚古墳群（山麓）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["物部氏（筑後物部・鏡連）", "水沼君（水間君）", "丹波氏（高良大祝家）", "草野氏・有馬氏"],
      routeAndPoliticalContext:
        "有明海から筑後川を遡上する水運と、大宰府から肥後・薩摩へ南下する西海道官道（筑後国府）が交差する内陸・河川交通の要衝。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-izumo-taisha",
    primarySpotIds: ["spot-izumo-taisha"],
    primarySpotNames: ["出雲大社", "出雲國一之宮 出雲大社", "杵築大社", "天日隅宮"],
    targetSpotIds: ["spot-izumo-taisha"],
    targetRegion: "出雲",
    spotNames: ["出雲大社", "杵築大社", "八雲山"],
    title: "出雲大社・八雲山 祭祀景観の層構造",
    summary:
      "記紀・出雲国風土記（史料A）の国譲り・天日隅宮（杵築大社）神話と、2000年に境内から出土した鎌倉期巨大宇豆柱（考古物証：確度A）、背後の禁足神体山・八雲山の磐座層が重なる出雲信仰の中枢。",
    currentDeities:
      "大国主大神（大己貴神・八千矛神・葦原色許男神）",
    claimedOrigin: {
      statement:
        "大国主大神が葦原中国を天孫に譲る条件として、天照大神（または高皇産霊尊）が「天日隅宮（あめのひすみのみや）／百不足八十隈手」の壮大な宮殿を造営し、天穂日命の子孫（出雲国造）に祭祀を掌らせたとする神代創建伝承。",
      sourceTitle: "『古事記』上巻・『日本書紀』神代下・『出雲国風土記』出雲郡杵築郷条",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "712年『古事記』・720年『日本書紀』・天平5年（733年）『出雲国風土記』",
        extantManuscriptEra: "真福寺本古事記・細川家本出雲国風土記等",
        targetEra: "神代（国譲り神話期）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "天平5年（733年）成立の『出雲国風土記』出雲郡条に「杵築大社」として明記され、『延喜式』神名帳（927年）で出雲国出雲郡「杵築大社 名神大」として記載。また2000年〜2001年の境内発掘調査で、宝治2年（1248年）造営本殿の巨大宇豆柱・心御柱（直径約1.35mの杉材3本束ね柱）が原位置で出土し、中世高層神殿伝承（『口遊』等の「雲太・和二・京三」）が考古学的に裏付けられた。",
      sourceTitle: "『出雲国風土記』『延喜式』神名帳・出雲大社境内遺跡発掘調査報告（2000年）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "733年『出雲国風土記』／927年『延喜式』／2000年発掘調査",
        targetEra: "奈良〜鎌倉時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "遅くとも奈良時代初頭には現在の八雲山南麓（杵築の地）に大社が鎮座しており、現存する国宝本殿は延享元年（1744年）造営の大社造建築である。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生〜古墳時代（青柴垣・神体山・荒神谷/加茂岩倉層）",
        description:
          "八雲山・鶴山・亀山の地形と猪目洞窟・命主社背後の真名井社磐座における自然・巨石祭祀。",
        certaintyTier: "A",
      },
      {
        era: "平安〜鎌倉時代（高層神殿造営と度重なる倒壊）",
        description:
          "平安〜鎌倉期に10回以上の造営・倒壊記録があり、宝治2年（1248年）造営の巨大本殿遺構（3本束ね柱）が境内地下に遺存。",
        certaintyTier: "A",
      },
      {
        era: "中世後期〜近世（鰐淵寺との神仏習合と寛文造営）",
        description:
          "中世には別当・鰐淵寺との神仏習合が進み祭神が素戔嗚尊とされる時期もあったが、寛文7年（1667年）の造営時に神仏分離と大国主神への復古が行われた。",
        certaintyTier: "A",
      },
      {
        era: "明治初期（杵築大社から出雲大社への改称と祭神論争）",
        description:
          "明治4年（1871年）に官幣大社列格とともに正式社名を「杵築大社」から「出雲大社」へ改称。明治14年の祭神論争（千家尊福と伊勢派の論争）でも大国主大神主祭が維持された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "本殿背後に聳える禁足の神体山「八雲山」と命主社（神魂伊能知奴志神社）背後の真名井遺跡（磐座・銅戈・勾玉出土地）、および境内地下の鎌倉期本殿巨大柱根遺構。",
      features: ["境内出土・鎌倉期巨大宇豆柱（重要文化財）", "八雲山（禁足神体山）", "命主社・真名井磐座（銅戈・勾玉出土）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["出雲氏（出雲臣・出雲国造：千家家・北島家）"],
      routeAndPoliticalContext:
        "日本海沿岸航路（北九州・宗像・隠岐・丹後・越を結ぶ対馬海流ルート）の要衝である稲佐の浜・宇迦橋河口と、出雲平野・斐伊川水系を結ぶ結節点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-takachiho",
    primarySpotIds: ["spot-takachiho-jinja"],
    primarySpotNames: ["高千穂神社"],
    targetSpotIds: ["spot-takachiho-jinja", "spot-kushifuru-jinja", "spot-amanoiwayato-jinja"],
    targetRegion: "高千穂",
    spotNames: ["高千穂神社", "くしふる神社", "槵觸神社", "天岩戸神社", "天安河原", "高千穂峡"],
    title: "高千穂・槵觸峯・天岩戸 祭祀景観の層構造",
    summary:
      "記紀・風土記の天孫降臨神話（「日向の高千穂の久士布流多気」：史料A）と、五ヶ瀬川渓谷・槵觸山の自然聖域、中世の「十社大明神」・高千穂神楽、および日向国内での南北2つの高千穂比定論争が重なる山岳神話空間。",
    currentDeities:
      "高千穂皇神（日向三代と配偶神の十社大明神）・ミケヌノミコト（鬼八退治伝承）",
    claimedOrigin: {
      statement:
        "天照大神の孫・瓊瓊杵尊（ににぎのみこと）が「筑紫の日向の高千穂の久士布流多気（くしふるたけ）」に天降った神代伝承を起源とし、高千穂神社は垂仁天皇朝の創建と伝える。",
      sourceTitle: "『古事記』上巻・『日本書紀』神代下・『日向国風土記』逸文／高千穂神社社伝",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "712年・720年・8世紀前半（風土記逸文は鎌倉期『釈日本紀』所引）",
        targetEra: "神代（天孫降臨神話期）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『続日本後紀』承和10年（843年）条に日向国無位「高智保皇神」へ従五位下を授ける記事があり、三代実録でも神階昇叙が確認される（ただし『延喜式』神名帳の日向国四座には直接記載されない式外社）。",
      sourceTitle: "『続日本後紀』（承和10年条）・『日本三代実録』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "貞観11年（869年）『続日本後紀』",
        targetEra: "平安時代初期（9世紀前半）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "槵觸（くしふる）山そのものを神体山として遥拝していた古層から、平安末〜鎌倉期に高千穂太郎政次（三田井氏）らにより「十社大明神（高千穂神社）」としての社殿・修験組織が整備された（現本殿は安永7年／1778年造営）。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "先史〜古墳時代（渓谷・洞窟・横穴墓群）",
        description:
          "阿蘇火砕流が形成した五ヶ瀬川渓谷（高千穂峡）・岩屋（天安河原）の自然地形と、槵觸山周辺の古墳・高千穂横穴墓群。",
        certaintyTier: "A",
      },
      {
        era: "平安〜中世（高智保皇神から十社大明神・修験神楽へ）",
        description:
          "9世紀の「高智保皇神」から、中世には熊野修験・阿蘇信仰の影響を受けて「十社大明神」および高千穂郷八十八社体制・高千穂夜神楽が形成された。",
        certaintyTier: "A",
      },
      {
        era: "近世〜近代（天孫降臨比定地論争と社名改称）",
        description:
          "記紀の「高千穂」をめぐり、臼杵郡高千穂郷（宮崎県高千穂町）説と霧島山高千穂峰（宮崎・鹿児島県境）説の二大比定論争が本居宣長以降も継続。明治4年（1871年）に十社大明神から「高千穂神社」へ改称。",
        certaintyTier: "C",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "神体山としての槵觸（くしふる）山、岩戸川渓谷の大洞窟「天安河原（仰慕ヶ窟）」、五ヶ瀬川の柱状節理渓谷（高千穂峡・真名井の滝）。",
      features: ["槵觸山（神体山・古墳群）", "天安河原（岩窟祭祀空間）", "高千穂峡・真名井の滝（柱状節理・湧水）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["三田井氏（大神氏流・中世高千穂領主）", "阿蘇氏・日下部氏"],
      routeAndPoliticalContext:
        "阿蘇カルデラ外輪山から五ヶ瀬川を下って日向灘（延岡）へ抜ける九州脊梁山地の東西横断回廊。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-kunisaki-rokugo",
    primarySpotIds: ["futagoji"],
    primarySpotNames: ["両子寺"],
    targetSpotIds: [
      "kumano-magaibutsu",
      "futagoji",
      "spot-fukiji",
      "spot-makioodo",
    ],
    targetRegion: "国東",
    spotNames: [
      "両子寺",
      "文殊仙寺",
      "熊野磨崖仏",
      "富貴寺",
      "真木大堂",
      "国東半島・六郷満山",
    ],
    title: "国東半島・六郷満山（両子寺・熊野磨崖仏・富貴寺）の層構造",
    summary:
      "両子山から放射状に広がる火山性奇岩・岩屋（自然山岳層）に、宇佐八幡と天台密教が結合した「六郷満山」の峯入り修験と平安後期の磨崖仏・阿弥陀堂（史料A・確度A）が重なる神仏習合の原風景。",
    currentDeities:
      "千手観音・阿弥陀如来・不動明王（太郎天）・文殊菩薩・権現（六郷満山天台宗寺院群と六所権現）",
    claimedOrigin: {
      statement:
        "養老2年（718年）、宇佐八幡神の化身とされる仁聞菩薩（にんもんぼさつ）が国東半島の二十八山本寺を開創し、六万九千三百八十余体の仏像を彫造したとする開山伝承。",
      sourceTitle: "『八幡宇佐宮御託宣集』・『六郷満山縁起』・各寺院社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "鎌倉時代後期〜室町期の縁起・託宣集",
        targetEra: "奈良時代初期（養老2年／718年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "平安時代後期〜鎌倉初期の『宇佐大鏡』（1190年代編纂）に宇佐宮弥勒寺の末寺群として「六郷山（本山・中山・末山）」の組織・所領が記録され、富貴寺大堂（12世紀後半・国宝）や熊野磨崖仏（平安末期・国指定重要文化財）、長安寺太郎天像（大治5年／1130年銘）などの同時代造像・建築物証が現存する。",
      sourceTitle: "『宇佐大鏡』・長安寺太郎天像胎内銘（1130年）・富貴寺大堂／熊野磨崖仏",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "12世紀（平安時代末期〜鎌倉初期）",
        targetEra: "10〜12世紀（平安中期〜末期）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "平安時代中期〜後期（10〜12世紀）には各谷の岩屋・奇岩に本山（学問）・中山（修行）・末山（布教）の三山組織と峯入り行場が現在地で機能していた。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "先史〜古代（奇岩・洞窟・水分祭祀）",
        description:
          "両子山（標高721m）・文殊山等の安山岩質凝灰角礫岩が浸食されてできた岩峰・岩屋（洞窟）・湧水に対する山岳自然崇拝。",
        certaintyTier: "A",
      },
      {
        era: "平安〜鎌倉時代（宇佐弥勒寺傘下の六郷満山完成）",
        description:
          "宇佐八幡宮の神宮寺（弥勒寺）別当・紀氏（宇佐留守職）および天台宗僧侶の主導により、65ヶ寺におよぶ六郷満山三山体制・峯入り修験・修正鬼会が確立。",
        certaintyTier: "A",
      },
      {
        era: "戦国〜江戸時代（大友兵火と杵築藩・延岡藩等による復興）",
        description:
          "天正年間の大友宗麟による焼討ちで多くの堂宇を失うも、近世に領主保護のもと両子寺（総持院）を中心に再興し、仁聞菩薩二十八霊場巡礼が庶民に定着。",
        certaintyTier: "A",
      },
      {
        era: "明治初期（神仏分離と六所権現の切り離し）",
        description:
          "神仏分離により寺院境内の六所権現・熊野社等が独立神社として分離されたが、修正鬼会や峯入りなど神仏習合の儀礼構造が現在も色濃く残存。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "両子山から海岸へ放射状に延びる深い谷（ラジアール谷）と奇岩群（針ノ耳・鬼ノ背割等）、岩壁に直接彫られた熊野磨崖仏・元宮磨崖仏。",
      features: ["熊野磨崖仏（不動明王・大日如来）", "富貴寺大堂（平安建築・国宝）", "両子山・文殊山の岩屋と峯入り行場"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["宇佐氏・大神氏・紀氏（弥勒寺留守職）", "田染氏・国東領主層"],
      routeAndPoliticalContext:
        "周防灘・伊予灘に突き出した国東半島の沿岸港津と、宇佐神宮から放射状の谷を巡る海上・山岳回廊。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-tsushima-watatsumi",
    primarySpotIds: ["spot-tsushima-watatsumi", "spot-kaijin-jinja"],
    primarySpotNames: ["和多都美神社", "海神神社", "木坂海神神社"],
    targetSpotIds: ["spot-tsushima-watatsumi", "spot-kaijin-jinja"],
    targetRegion: "対馬",
    spotNames: ["和多都美神社", "海神神社", "木坂海神神社"],
    title: "対馬・和多都美神社・海神神社 祭祀景観の層構造",
    summary:
      "朝鮮海峡の最前線・対馬のリアス式内海（浅茅湾）と木坂海岸に鎮座する海神祭祀拠点。『延喜式』名神大社（史料A・確度A）と亀卜（対馬卜部）、海宮（竜宮・豊玉姫・磯良）伝承、三ツ柱鳥居と磐座が重なる。",
    currentDeities:
      "和多都美神社：彦火火出見尊・豊玉姫命 ／ 海神神社（木坂・対馬国一宮）：豊玉姫命（配祀：彦火火出見尊・宗像神・道主貴等）",
    claimedOrigin: {
      statement:
        "海神・豊玉彦命が当地に宮殿（海宮・竜宮）を造り、彦火火出見尊（山幸彦）と豊玉姫命が結ばれた故地とする伝承。また神功皇后の新羅征討時に海神・安曇磯良を招請し奉斎したとする伝承。",
      sourceTitle: "『日本書紀』神代下（海宮遊幸段）接続社伝・『対馬州神社大帳』（近世）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世（貞享3年／1686年『対馬州神社大帳』等）",
        targetEra: "神代（海幸山幸神話期）〜神功皇后伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本三代実録』貞観12年（870年）条の対馬嶋「和多都美神」神階昇叙記事および『延喜式』神名帳（927年）の対馬嶋上県郡「和多都美神社 名神大」「和多都美御子神社 名神大」として確認される。ただし式内社の現比定地については仁位の和多都美神社・木坂の海神神社（旧八幡本宮）等の複数論がある。",
      sourceTitle: "『日本三代実録』『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "901年『日本三代実録』／927年『延喜式』",
        targetEra: "平安時代前期（9〜10世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "浅茅湾奥の入江に海から参拝する水中鳥居・三ツ柱鳥居と社殿背後の磐座（磯良恵比須）を持ち、木坂の海神神社は中世〜近世には「木坂八幡宮（対馬一宮）」として機能し、海岸に積石塚（ヤクマ塔）の習俗を残す。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生〜古墳時代（海峡航路と箱式石棺・青銅器祭祀）",
        description:
          "『魏志倭人伝』の対馬国（良田無く海物を食し南北に市糴す）。海峡を見下ろす岬や入江に箱式石棺墓・広形銅矛奉献遺跡が展開。",
        certaintyTier: "A",
      },
      {
        era: "奈良〜平安時代（対馬卜部と名神大社29座）",
        description:
          "神祇官の亀卜を担う「対馬卜部」が中央へ出仕し、国防・外交の境界島として『延喜式』に九州最多級の名神大社（和多都美神・高御魂神・住吉神等）が列格。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世（八幡化と対馬藩宗氏の式内社考証）",
        description:
          "中世には木坂社が「八幡本宮」となるなど八幡信仰と習合。江戸時代に対馬藩（宗氏）と国学者により『延喜式』式内社の比定・復古調査が進められた。",
        certaintyTier: "A",
      },
      {
        era: "明治4年（1871年）以降（木坂八幡宮から海神神社への改称）",
        description:
          "明治4年に木坂八幡宮が式内名神大社「和多都美神社」に比定されて「海神神社」と改称し国幣中社に列格。仁位の和多都美神社と並び海神信仰の中核として現在に至る。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "複雑に入り組む浅茅湾の溺れ谷地形、本殿背後の巨石磐座「磯良恵比須」、満潮時に海中に没する三ツ柱鳥居、および木坂海岸の積石塔「ヤクマ（八隈）塔」。",
      features: ["磯良恵比須（鱗状亀裂を持つ自然磐座）", "海中の鳥居・三ツ柱鳥居", "木坂海岸・ヤクマ塔（積石祭場）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["対馬直（津島県直）", "対馬卜部（卜部氏）", "阿曇氏・宗氏"],
      routeAndPoliticalContext:
        "九州本土・壱岐と朝鮮半島（金海・釜山）を結ぶ朝鮮海峡の最重要中継拠点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-iki-tsukiyomi",
    primarySpotIds: ["spot-iki-tsukiyomi"],
    primarySpotNames: ["月讀神社", "壱岐・月讀神社", "天手長男神社"],
    targetSpotIds: ["spot-iki-tsukiyomi", "spot-harano-tsuji"],
    targetRegion: "壱岐",
    spotNames: ["月讀神社", "壱岐・月讀神社", "天手長男神社", "原の辻遺跡"],
    title: "壱岐・月讀神社・原の辻 祭祀景観の層構造",
    summary:
      "『魏志倭人伝』の「一支国」王都・原の辻遺跡（弥生多重環濠・古代船着場：史料A・確度A）を基底とし、『日本書紀』顕宗紀の月神奉斎記事と壱岐卜部の亀卜、近世の式内社比定が重なる玄界灘の島嶼聖域。",
    currentDeities:
      "月讀神社：月讀命（月延命） ／ 天手長男神社（壱岐国一宮）：天忍穂耳尊・天手力男命・天細女命（旧称：箱崎八幡・田中大明神）",
    claimedOrigin: {
      statement:
        "伊弉諾尊から生じた月讀命を祀り、『日本書紀』顕宗天皇3年（487年）条に阿閉臣事代が任那への遣使途上に月神の神託を受け、壱岐県主の先祖・押見宿禰が山城国葛野の月読神社へ分祀・奉斎したことから「全国の月讀社の総本宮（元宮）」と伝える。",
      sourceTitle: "『日本書紀』顕宗天皇3年2月条・壱岐月讀神社社伝",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "養老4年（720年）『日本書紀』／近世社伝",
        targetEra: "古墳時代中期（5世紀後半・顕宗朝）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本書紀』顕宗天皇3年条の壱岐県主祖・押見宿禰による月神奉斎記事、および『延喜式』神名帳（927年）の壱岐嶋壱岐郡「月読神社 名神大」「天手長男神社 名神大」として記載。考古学的には島東南部の「原の辻遺跡」で弥生時代〜古墳時代初頭の三重環濠・祭儀空間・日本最古級の突堤式船着場遺構が確認されている。",
      sourceTitle: "『日本書紀』『延喜式』神名帳・原の辻遺跡発掘調査報告（特別史跡）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "720年『日本書紀』／927年『延喜式』",
        targetEra: "弥生時代〜平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "中世に壱岐国内の式内社の所在が一旦不明確化した後、延宝4年（1676年）に平戸藩主・松浦鎮信と国学者・橘三喜による『延喜式』式内二十四社の調査・比定事業が行われ、現在地の祠が月讀神社・天手長男神社として再興・固定された。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生〜古墳時代（一支国王都・原の辻と巨石古墳群）",
        description:
          "原の辻遺跡（一支国中枢）での対外交交易・卜骨祭祀、および6〜7世紀の双六古墳・笹塚古墳・鬼の窟古墳など巨石横穴式石室群の築造（壱岐直・海人首長層）。",
        certaintyTier: "A",
      },
      {
        era: "奈良〜平安時代（壱岐卜部と式内名神大社）",
        description:
          "月神（月齢・潮汐を司る航海神）と壱岐卜部の亀卜が朝廷の神祇祭祀に組み込まれ、『延喜式』に24座（うち名神大社7座）が記載。",
        certaintyTier: "A",
      },
      {
        era: "近世（延宝4年／1676年・橘三喜の式内社比定）",
        description:
          "平戸藩の命を受けた橘三喜が島内の古祠を調査して式内24社を比定し、石祠・鳥居を建立（近世国学による古代社名復元の代表例）。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "島内唯一の穀倉平野である深江田原に立地する「原の辻遺跡」（三重環濠・船着場）、男岳・女岳の火山丘陵と玄界灘を見渡す尾根上の祠・古墳群。",
      features: ["原の辻遺跡（特別史跡・一支国王都と船着場）", "双六古墳・鬼の窟古墳（巨石石室）", "男岳山石祠群"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["壱岐直（伊吉連・壱岐県主）", "壱岐卜部", "松浦氏"],
      routeAndPoliticalContext:
        "唐津（末盧国）・博多湾（奴国・伊都国）から対馬・朝鮮半島へ渡る玄界灘航路の必須中継島。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-miwa-oomiwa",
    primarySpotIds: ["spot-oomiwa-jinja"],
    primarySpotNames: [
      "大神神社",
      "大和・大神神社",
      "大和国一之宮 大神神社",
      "三輪山・大神神社",
      "大神神社（三輪山）",
    ],
    targetSpotIds: ["spot-oomiwa-jinja", "spot-miwayama"],
    targetRegion: "奈良",
    spotNames: [
      "大神神社",
      "大和・大神神社",
      "大和国一之宮 大神神社",
      "三輪山・大神神社",
      "大神神社（三輪山）",
      "三輪山",
      "檜原神社",
      "纏向遺跡",
    ],
    title: "大和・大神神社（三輪山）・纏向 祭祀景観の層構造",
    summary:
      "本殿を持たず三ツ鳥居から円錐形の神体山「三輪山」そのもの（三段の磐座群）を拝する原初形態を保ち、山麓に初期ヤマト王権の纏向遺跡・箸墓古墳（史料A・確度A）が展開する、初期王権祭祀の基準点。",
    currentDeities:
      "大物主大神（大国主神の和魂・幸魂奇魂、配祀：大己貴神・少彦名神）",
    claimedOrigin: {
      statement:
        "大国主神が国造りを成し遂げるにあたり、自らの和魂（幸魂・奇魂）である大物主大神を倭の青垣・東の山（三輪山）に鎮め祀ったことを創始とし、崇神天皇7年に疫病が流行した際、神託により大物主神の子孫・大田田根子（おおたたねこ）を捜し出して祭主としたと伝える。",
      sourceTitle: "『古事記』上巻・崇神記／『日本書紀』神代上・崇神天皇紀",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "712年『古事記』・720年『日本書紀』",
        targetEra: "神代〜崇神天皇朝（初期ヤマト王権成立期）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『古事記』『日本書紀』の三輪山伝説・大田田根子奉斎記事、『延喜式』神名帳（927年）の大和国城上郡「大神大物主神社 名神大 月次相嘗新嘗」として最高格で記載。考古学的には三輪山中の辺津・中津・奥津磐座周辺から古墳時代中期（5世紀）を中心とする子持勾玉・滑石製模造品・須恵器等の祭祀遺物が出土し、山麓北西には3世紀中葉〜後半の纏向遺跡・箸墓古墳が実在する。",
      sourceTitle: "『古事記』『日本書紀』『延喜式』神名帳・三輪山祭祀遺跡／纏向遺跡発掘報告",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "712年・720年・927年",
        targetEra: "古墳時代前期（3世紀後半）〜平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "古墳時代から三輪山西麓の巨岩・禁足地（現拝殿・三ツ鳥居奥）を祭場としており、本殿を造営せず拝殿（現存は寛文4年／1664年徳川家綱再建・重要文化財）と三ツ鳥居のみを設ける形態を維持している。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "3世紀後半〜5世紀（纏向王権と三輪山磐座祭祀）",
        description:
          "山麓に纏向遺跡・箸墓古墳が出現し、5世紀には三輪山中の巨岩群（磐座）で滑石製模造品・銅鏡・土器を用いた大規模な山中祭祀が執行される。",
        certaintyTier: "A",
      },
      {
        era: "奈良〜平安時代（大和国一宮・二十二社）",
        description:
          "大神氏（三輪君・大神朝臣）が氏上として奉斎し、大和国一宮・朝廷二十二社の上七社として国家祭祀の中枢を占める。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世（三輪流神道・大御輪寺との神仏習合）",
        description:
          "鎌倉期に叡尊（西大寺）や慶円らにより真言密教と結合した「三輪流神道（両部神道）」が形成され、大御輪寺・平等寺等の神宮寺が栄える。",
        certaintyTier: "A",
      },
      {
        era: "明治元年（1868年）以降（神仏分離と官幣大社化）",
        description:
          "神仏分離により大御輪寺（現・聖林寺へ十一面観音像が移動）等が廃寺・分離され、明治4年に官幣大社大神神社となる。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "標高467mの円錐形神体山「三輪山」と山中の三段磐座群（奥津磐座・中津磐座・辺津磐座）、摂社・檜原神社の三ツ鳥居、および山麓の纏向遺跡・箸墓古墳。",
      features: ["三輪山（禁足神体山・三段磐座群）", "三ツ鳥居（重要文化財・本殿非設置）", "纏向遺跡・箸墓古墳（山麓）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大神氏（三輪君・大田田根子後裔）", "初期ヤマト王権", "出雲・筑紫（朝倉大己貴社）との同族・勧請関係"],
      routeAndPoliticalContext:
        "奈良盆地東南端・山の辺の道の起点であり、大和川水系（難波津・瀬戸内海への出口）と初瀬谷（伊勢・東国への出口）が交差する古代交通の要衝。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-aso-jinja",
    primarySpotIds: ["spot-aso-jinja"],
    primarySpotNames: ["阿蘇神社", "肥後国一之宮 阿蘇神社"],
    targetSpotIds: ["spot-aso-jinja"],
    targetRegion: "阿蘇",
    spotNames: ["阿蘇神社", "阿蘇山", "国造神社", "上色見熊野座神社"],
    title: "阿蘇神社・阿蘇火山 祭祀景観の層構造",
    summary:
      "7世紀初頭の中国正史『隋書』倭国伝（史料A・確度A）に噴火と天への祭祀が記録された世界最大級のカルデラ火山「阿蘇山」を背景に、阿蘇国造・阿蘇大宮司家の一貫した奉斎と農耕・修験が重なる肥後国一宮。",
    currentDeities:
      "健磐龍命（たけいわたつのみこと：神武天皇の孫）ほか阿蘇十二神（阿蘇都媛命・国造速瓶玉命等）",
    claimedOrigin: {
      statement:
        "孝霊天皇9年（紀元前282年）、神武天皇の孫・健磐龍命が九州鎮護の命を受けて阿蘇へ下向し、外輪山の一部（立野火口瀬）を蹴破ってカルデラ湖の水を抜き広大な農耕地を拓いたとする開拓・創建神話。",
      sourceTitle: "『日本書紀』景行天皇18年条・『阿蘇家伝』・阿蘇神社社伝",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "養老4年（720年）『日本書紀』／中世『阿蘇家伝』",
        targetEra: "神代〜孝霊・景行天皇朝",
      },
    },
    oldestAttestedRecord: {
      statement:
        "中国正史『隋書』巻81列伝第46東夷・倭国伝（7世紀初頭の情報、636年成立）に「阿蘇山あり、その石、故無くして火起り天に接す、俗もって異となし、因りて祷祭を行う」と明記され、国内史料では『日本書紀』景行紀の阿蘇都彦・阿蘇都媛記事および『延喜式』神名帳（927年）の肥後国阿蘇郡「健磐龍命神社 名神大」「阿蘇比咩神社」「国造神社」として確認される。",
      sourceTitle: "『隋書』倭国伝・『日本書紀』・『延喜式』神名帳・中通古墳群",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "貞観10年（636年）『隋書』／720年『日本書紀』／927年『延喜式』",
        targetEra: "古墳時代〜飛鳥・平安時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "阿蘇谷北部の門前町・宮地（現在地）と北外輪山の本塚（国造神社・中通古墳群）に古代から祭祀空間が形成され、独特の横参道と日本三大楼門・三神殿（嘉永年間造営・国指定重要文化財）を持つ。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳〜飛鳥時代（火山祭祀・中通古墳群・『隋書』阿蘇山）",
        description:
          "阿蘇中岳火口の噴火活動に対する自然祈祷（『隋書』記録）と、阿蘇谷の中通古墳群（長目塚古墳等）を築いた阿蘇君（阿蘇国造）の勃興。",
        certaintyTier: "A",
      },
      {
        era: "平安〜中世（肥後国一宮・阿蘇大宮司家と山上西巌殿寺修験）",
        description:
          "肥後国一宮として阿蘇十二神の体系が整い、同時に阿蘇山上（火口神霊池）では天台宗・西巌殿寺を中心とする山岳修験（阿蘇山衆徒）が隆盛。",
        certaintyTier: "A",
      },
      {
        era: "近世〜近代（熊本藩細川氏の保護と神仏分離）",
        description:
          "江戸期に細川氏の寄進により社殿群が造営。明治の神仏分離で山上の西巌殿寺と阿蘇山上神社が分離され、官幣大社阿蘇神社となった（平成28年熊本地震からの復旧を完了）。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "阿蘇五岳（特に中岳火口・神霊池）と広大なカルデラ地形、外輪山唯一の切れ目である立野火口瀬（数鹿流ヶ滝）、および阿蘇谷の中通古墳群。",
      features: ["阿蘇中岳火口（『隋書』記録の火山祭祀対象）", "中通古墳群（長目塚古墳等）", "立野火口瀬（蹴破り神話地形）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["阿蘇氏（阿蘇君・阿蘇国造・阿蘇大宮司家）", "健緒組（肥後・日向連絡氏族）"],
      routeAndPoliticalContext:
        "有明海（肥後・筑後）と日向灘（高千穂・延岡）・豊後（竹田・大分）を十字に結ぶ九州中央高地の交通十字路。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-ino-yamada-saigu",
    primarySpotIds: ["spot-ino-tenshoko-daijingu"],
    primarySpotNames: ["伊野天照皇大神宮", "伊野大神宮"],
    targetSpotIds: [
      "spot-ino-tenshoko-daijingu",
      "spot-yamada-saigu",
      "spot-saniwa-jinja",
      "spot-rokushogu-ato",
    ],
    targetRegion: "福岡",
    spotNames: [
      "伊野天照皇大神宮",
      "伊野大神宮",
      "山田邑斎宮",
      "審神者神社",
      "六所宮跡",
    ],
    title: "久山・糟屋（伊野天照皇大神宮・山田邑斎宮・審神者社・六所宮跡）の層構造",
    summary:
      "猪野川渓谷の滝・古神殿跡や周辺4〜5世紀古墳群（部木・乙宮）の基底に、『日本書紀』小山田邑斎宮・審神者伝承の比定（貝原益軒『筑前国続風土記』）と、福岡藩黒田家による「伊野＝内宮・六所＝外宮」の近世伊勢信仰再編が重層する聖域群。",
    currentDeities:
      "伊野：天照大神・手力雄神・萬幡千々姫神（合祀：水取宮・五霊大明神・住吉三神・志賀三神）／山田邑斎宮：神功皇后／審神者神社：中臣烏賊津使主／六所宮：伊弉諾尊・伊弉冊尊・速玉男命・豊受大神・瓊々杵尊・軻遇槌命",
    claimedOrigin: {
      statement:
        "『日本書紀』神功皇后紀（仲哀天皇9年春3月条）に、神功皇后が小山田邑に斎宮を造り自ら神主となり、中臣烏賊津使主を審神者（さにわ）として神託を請うたと記される故事を創建起源とする伝承（なお由来記の年号・西暦・藩主代数の表記には一部ずれがあり原史料照合を要する）。",
      sourceTitle: "『日本書紀』巻第九・伊野天照皇大神宮由来記・現地説明板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "720年『日本書紀』／近世地誌・社伝",
        targetEra: "仲哀・神功皇后朝（伝承期）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "文献上は『日本書紀』（720年）に「小山田邑」の斎宮記事が見え、また『日本三代実録』元慶元年（877年）条に筑前国「天照神」への神階授位記事が見える。ただし古代史書の記述と現在の山田・猪野の社地が当時の所在地であること自体は別問題であり、上山田村「聖母屋敷」を小山田邑斎宮跡と推定した記録は江戸時代の貝原益軒『筑前国続風土記』（1709年）が初見となる。",
      sourceTitle: "『日本書紀』・『日本三代実録』（877年）・貝原益軒『筑前国続風土記』（1709年）",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "720年『日本書紀』・901年『日本三代実録』・1709年『筑前国続風土記』",
        targetEra: "平安時代初期（9世紀後半）〜江戸時代前期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "中世武将による社領寄進伝承のほか、山田では慶長3年（1598年）まで六所大明神が六所宮跡に鎮座して審神者神社と対面しており（移転後も両社間に建物を建てない不犯慣習と神田・地名「六所」が現存）、近世には伊野の古神殿跡・社殿および山田の聖母屋敷（斎宮）が現在地で確認される。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生〜古墳時代（部木古墳群・乙宮古墳群と猪野川水辺）",
        description:
          "前方後方墳を含む部木古墳群（9基）や4〜5世紀推定の乙宮古墳群（5基・竪穴式石室推定）、猪野川渓流の滝など神社以前の墓域・自然環境（ただし古墳と後世神社の直接的連続性は未確認）。",
        certaintyTier: "A",
      },
      {
        era: "平安〜戦国時代（筑前天照神授位・中世社領寄進・六所宮の兵火移転）",
        description:
          "877年の筑前天照神授位、中世の御霊信仰（大隈御霊神社）や社領寄進を経て、慶長3年（1598年）頃に六所宮が天正兵火または水害により移転し旧社地が神田化。",
        certaintyTier: "B",
      },
      {
        era: "江戸時代（黒田藩による「伊野＝内宮・六所＝外宮」整備と宝満修験）",
        description:
          "福岡藩黒田家が伊野天照皇大神宮を「内宮」、豊受大神を祀る六所宮を「外宮」として尊崇し、伊勢流造営・20年ごとの式年遷宮・御田扇奉納を実施。また周辺村社（乙宮神社等）では宝満派修験（成圓坊）が大祭を管掌。",
        certaintyTier: "A",
      },
      {
        era: "明治〜昭和初期（神社合祀と地域による旧社地復帰）",
        description:
          "伊野への水取宮・五霊大明神・住吉三神・志賀三神の合祀や、大正12年（1923年）の木寄神社の八幡宮合祀と昭和初期の旧社地復帰など、近代の神社整理と地域共同体による祭祀空間維持が交錯。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "伊野天照皇大神宮最奥の「古神殿跡」と滝・猪野川上流の山林水辺空間、部木古墳群（前方後方墳1号墳含む9基）、乙宮古墳群（本殿裏の4〜5世紀円墳5基）、および六所宮跡の神田・審神者社との対面空間。",
      features: [
        "伊野・最奥の古神殿跡と滝（水辺祭祀空間）",
        "部木古墳群（前方後方墳）・乙宮古墳群（4〜5世紀）",
        "六所宮跡（旧社地神田）と審神者社間の不犯空間",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["中臣烏賊津使主（審神者伝承）", "福岡藩黒田氏（光之・継高ら）", "宝満山修験（成圓坊）"],
      routeAndPoliticalContext:
        "博多湾奥・香椎宮（橿日宮）から多々良川・猪野川水系を遡り久山（山田・猪野）・篠栗へ至る糟屋北部の内陸水系回廊。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "reorganized",
  },
  {
    id: "stratigraphy-chikushi-jinja",
    primarySpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    primarySpotNames: ["筑紫神社", "筑紫宮", "筑紫神"],
    targetSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    targetRegion: "筑紫野",
    spotNames: ["筑紫神社"],
    title: "筑紫神社・原田峠 祭祀景観の層構造",
    summary:
      "基肄山・牛頸山に挟まれた筑前・肥前国境の峠（原田峠）に鎮座する古社。「通行人の命を尽くす峠の荒ぶる神」を鎮める境界祭祀が起源とされ、「筑紫」国号の発祥地伝承および粥占神事を伝える延喜式内名神大社。",
    currentDeities:
      "筑紫の神（白日別神）・五十猛命・素戔嗚尊",
    claimedOrigin: {
      statement:
        "筑前と肥前の境界の険しい坂（峠）に荒ぶる神がいて、往来する人々の多くが命を奪われた（人の命尽くすの神）。これを鎮めるために祀ったのが起源であり、「命尽（つくし）」が転じて「筑紫」の国号になったと伝える。また五十猛命が朝鮮半島から樹種を持ち帰り列島へ植樹した際にこの地に降り立ち祀られたとも伝える。",
      sourceTitle: "『筑前国続風土記』・『釈日本紀』引用風土記逸文・社伝由緒",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "奈良時代初頭（風土記）／江戸中期（1709年『筑前国続風土記』）",
        targetEra: "神代〜古墳時代初頭（境界交通開削期）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『筑後国風土記』逸文等に筑紫国号の起源説話として「筑前肥前境の坂の神が人の命を尽したため筑紫と号した」旨が見え、『続日本後紀』承和4年（837年）に従五位下奉授、『延喜式』神名帳（927年）に筑前国御笠郡「筑紫神社 名神大」として記載。",
      sourceTitle: "『筑後国風土記』逸文・『続日本後紀』・『延喜式』神名帳",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "837年（承和4年）・927年（延長5年）",
        extantManuscriptEra: "九条家本延喜式（平安末期写）",
        targetEra: "古代（9世紀〜10世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "原田の現社地は古代西海道・肥前官道の境界峠（原田峠・城山山麓）に位置し、古代延喜式段階よりこの南北回廊の峠越え要衝において名神大社として存続。中世戦乱を経て近世福岡藩主により社殿再興。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代（8〜10世紀）",
        description:
          "峠の荒ぶる土着神「筑紫の神」を鎮める境界祭祀から、律令国家の官社（延喜式名神大社・御笠郡）へ昇格。",
        certaintyTier: "A",
      },
      {
        era: "中世（鎌倉〜戦国）",
        description:
          "神仏習合が進み「筑紫大明神」と称される。戦国期の岩屋城・立花城攻防戦など大友氏・秋月氏の戦乱で社殿荒廃。",
        certaintyTier: "B",
      },
      {
        era: "近世〜近代（江戸〜明治）",
        description:
          "福岡藩主黒田氏（長政・光之等）により社殿再興・社領寄進。毎年3月15日の粥占神事（県指定無形民俗文化財）を継承。明治5年に県社へ列格。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "基肄山（古代山城・基肄城跡）と牛頸山系に挟まれた狭隘な鞍部・峠地形。古代西海道・肥前官道が通る天然の境界回廊。",
      features: [
        "原田峠（筑前・肥前国境の峠地形・地政学的要衝）",
        "基肄城（古代山城）直下の交通回廊",
        "粥占神事（気象・農耕豊凶を占う古代卜占習俗）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["筑紫君（筑紫氏）", "福岡藩黒田氏"],
      routeAndPoliticalContext:
        "古代大宰府防衛網（水城・大野城・基肄城）の南端回廊。筑紫平野（有明海側）と博多湾側（福岡平野）を直結する南北大交通軸の峠越えを監視・鎮護する政治・軍事・交通の結節点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-koseki-miya",
    primarySpotIds: ["spot-koseki-miya"],
    primarySpotNames: ["皇石宮・皇石神社", "皇石神社", "皇石宮"],
    targetSpotIds: [
      "spot-koseki-miya",
      "spot-koseki-oki-no-ido",
      "spot-oyamada-saigu",
      "spot-funabaru-kofun",
    ],
    targetRegion: "福岡",
    spotNames: [
      "皇石宮・皇石神社",
      "皇石神社",
      "皇石宮",
      "皇石神社 沖の井戸",
      "小山田斎宮",
      "国史跡 船原古墳",
    ],
    title: "皇石宮・小山田斎宮・船原古墳 祭祀景観の層構造",
    summary:
      "神功皇后が軍議を開き座したと伝える巨石「皇石」および「沖の井戸」「小山田斎宮」の伝承群（史料B）の背後に、国宝級の金銅製馬具・武具を誇る国史跡「船原古墳」（6世紀末〜7世紀初頭、史料A・確度A）や鹿部山弥生青銅器文化が広がる玄界灘・糟屋北部の重層聖域。",
    currentDeities: "息長足比売命（神功皇后）",
    claimedOrigin: {
      statement:
        "神功皇后が三韓出兵に際して小山田に斎宮を建て天神地祇を祭り、筵内の皇石に座して軍議を定めたと伝える。",
      sourceTitle: "『筑前国続風土記』・皇石神社社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世（1703年『筑前国続風土記』）〜近代の社伝",
        targetEra: "神功皇后伝承期（古墳時代初期相当）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『筑前国続風土記』（貝原益軒、1703年）に「皇石宮 筵内村にあり、神功皇后の霊石なり」と記録される。考古学上は近隣の「船原古墳」（国史跡、6世紀末〜7世紀初頭）から国内初となる金銅製歩揺付飾金具をはじめとする豪華絢爛な馬具・武具が未盗掘遺構から出土し、ヤマト王権および朝鮮半島と直結する強力な首長層の存在を実証している。",
      sourceTitle: "国史跡 船原古墳出土遺構・遺物群／『筑前国続風土記』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "古墳時代終末期（6世紀末〜7世紀初頭）／元禄16年（1703年）",
        targetEra: "6世紀末〜7世紀初頭（古墳時代後期〜終末期）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "筵内集落の丘陵裾に鎮座し、社殿背後の巨石「皇石」をご神体・御座石として尊崇。古賀平野の旧入海・大根川水系に面する沖の井戸や小山田斎宮と連動した祭祀構造を維持する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳時代終末期（6〜7世紀）",
        description:
          "谷山・薬王寺川流域を望む小山田の丘陵上に「船原古墳」が築造され、大陸・半島系技術を色濃く反映した最高級の金銅製馬具・武器が埋葬される。",
        certaintyTier: "A",
      },
      {
        era: "中世（武家崇敬と立花山城前哨）",
        description:
          "立花山城や薦野城（薦野増時）の防衛圏・水系回廊として機能し、筵内・小山田の地名とともに武士団・土豪の祈祷所として社殿が修復される。",
        certaintyTier: "B",
      },
      {
        era: "近世（江戸時代・福岡藩）",
        description:
          "福岡藩主黒田氏領下で筵内村の産土神として定着し、貝原益軒の『筑前国続風土記』に神功皇后伝説の霊石・沖の井戸の由緒が記録される。",
        certaintyTier: "A",
      },
      {
        era: "明治〜現代（近代社格と国史跡指定）",
        description:
          "明治期に村社へ列格。平成28年（2016年）に船原古墳が国史跡に指定され、神話伝承地と古代ハイテク首長墓の重層性が学術的に解明される。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "社殿背後の露天巨石「皇石」、大根川低地・旧入海津を示す「沖の井戸」、および国史跡「船原古墳」の巨石・金銅製遺物埋納坑。",
      features: [
        "皇石（社殿背後の御座石・巨石信仰）",
        "国史跡 船原古墳（国内唯一の歩揺付飾金具・金銅製馬具）",
        "沖の井戸（旧入海・沿岸湧水地）",
        "鹿部山甕棺墓群（弥生青銅器・銅戈）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["糟屋屯倉関係首長層", "薦野氏", "福岡藩黒田氏"],
      routeAndPoliticalContext:
        "博多湾東部（香椎・立花山麓）から宗像地域へ至る唐津街道・古代官道沿いの内陸回廊。大根川水系を通じて玄界灘への舟運と内陸交通が結節する地政学的要衝。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-taiso-jinja",
    primarySpotIds: ["spot-taiso-jinja-gegu"],
    primarySpotNames: ["太祖神社 下宮（太祖宮）", "太祖神社", "太祖宮", "太祖神社下宮"],
    targetSpotIds: ["spot-taiso-jinja-gegu"],
    targetRegion: "福岡",
    spotNames: ["太祖神社 下宮（太祖宮）", "太祖神社", "太祖宮", "太祖神社下宮"],
    title: "太祖神社下宮・若杉山麓 祭祀景観の層構造",
    summary:
      "神功皇后の香椎宮祈願と若杉山再興伝承、中古左右殿の重層祭神構成（八幡・聖母・宝満、天照・志賀・住吉）を伝え、江戸時代から継承される県指定無形民俗文化財「太祖神楽」や推定樹齢約600年の町指定天然記念物クスノキ群を擁する若杉山岳聖地の古層候補拠点（ラベルB）。",
    currentDeities:
      "伊弉諾尊（主祭神）、八幡大神・聖母大神・宝満大神（右殿）、天照皇大神・志賀大神・住吉大神（左殿）",
    claimedOrigin: {
      statement:
        "神功皇后が三韓親征に際し香椎宮で天神地祇に祈願し、帰還後に若杉山頂に神社を建立・再興したと伝える。",
      sourceTitle: "太祖神社社伝・由緒書き",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世〜近世社伝",
        targetEra: "神功皇后伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『筑前国続風土記』（1703年）等に若杉山太祖権現・太祖宮として記録され、慶長5年（1600年）以降に福岡藩主黒田長政が崇敬・社殿修復。江戸時代より伝承される「太祖神楽」が県無形民俗文化財に指定。",
      sourceTitle: "『筑前国続風土記』／福岡県指定無形民俗文化財「太祖神楽」記録",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "元禄16年（1703年）／江戸時代中期",
        targetEra: "中世〜近世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "若杉山北麓の現在地に下宮（里宮）を構え、山頂の上宮・古堂と連動する山岳登拝・遥拝空間を形成。境内には胸高直径235cm・推定樹齢約600年の大楠をはじめとする巨木群が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代〜中世（山岳修験・権現信仰期）",
        description:
          "若杉山（分杉山）山岳信仰の拠点として修験者や地域武士団の崇敬を集め、伊弉諾尊に加えて八幡・宝満・志賀等の諸神が左右殿に複合配祀される。",
        certaintyTier: "B",
      },
      {
        era: "近世（慶長5年／1600年以降）",
        description:
          "黒田長政をはじめとする福岡藩主の崇敬を受け、社殿造営や祭礼神楽（太祖神楽）が整備される。",
        certaintyTier: "A",
      },
      {
        era: "近代（明治期）",
        description:
          "明治5年（1872年）に郷社、明治29年（1896年）に県社へ列格。神仏分離を経て太祖宮・太祖神社として現在に至る。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "若杉山（標高681m）の山岳自然景観、境内奥の上宮遥拝鳥居、注連縄が巻かれた破損石、および町指定天然記念物の巨樹クスノキ群。",
      features: [
        "若杉山（神体山・山岳登拝回廊）",
        "上宮遥拝鳥居（山頂直結の空間軸）",
        "破損注連縄石（用途・年代未確定の境界石）",
        "推定樹齢600年の大楠群（町天然記念物）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["糟屋郡土豪層", "若杉山修験集団", "福岡藩黒田氏"],
      routeAndPoliticalContext:
        "博多湾東部から若杉山・三王山・宝満山へと連なる山岳修験ルートの北西麓登山口。篠栗・粕屋地域と山岳霊場を結ぶ地域共同体の要衝。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "若杉山岳信仰・水源祭祀と神功皇后伝承の結合",
      elementsIntroduction:
        "中世の神仏習合・修験期に諸神配祀、江戸期に太祖神楽成立、明治に近代社格列格",
      historicalRelation: "山頂上宮と山麓下宮の里宮・山宮関係が歴史的に継承",
      presentationMethod:
        "由緒書きにおいて伊弉諾尊と神功皇后伝承、中古祭神構成を明記",
      ritualPracticeOrigin:
        "江戸時代より継承される太祖神楽および春秋例祭・日籠祭",
      spatialExperience:
        "若杉山登山道入口、巨樹社叢、上宮遥拝鳥居、相撲場が一体となった地域聖域",
      formationVisibility:
        "由緒書き・文化財案内板にて伝承と藩政期以降の沿革が開示",
    },
  },
  {
    id: "stratigraphy-homan-shinguji",
    primarySpotIds: ["spot-homan-shinguji"],
    primarySpotNames: [
      "宝満神宮寺・根本山 宝満堂",
      "宝満神宮寺",
      "根本山 宝満堂",
      "分椙霊山 宝満神宮寺",
    ],
    targetSpotIds: ["spot-homan-shinguji"],
    targetRegion: "福岡",
    spotNames: [
      "宝満神宮寺・根本山 宝満堂",
      "宝満神宮寺",
      "根本山 宝満堂",
      "分椙霊山 宝満神宮寺",
    ],
    title: "宝満神宮寺・根本山宝満堂 平成期宗教景観の形成史",
    summary:
      "1989年（平成元年）に開教し、1994年以降に若杉山南麓で造営された単立宗教法人。境内には三ツ鳥居形式の鳥居、八大龍王神池、和の宮磐座、香椎宮綾杉ゆかりの杉の木（植樹）などが整備され、神道・仏教・龍神信仰など多様な信仰要素を一堂に奉斎する現代開創の神仏習合霊場。",
    currentDeities:
      "天之御中主大神、八大龍王神、和の宮言霊神、宝祖神、観世音菩薩、大日如来、不動明王、建御雷之男神",
    claimedOrigin: {
      statement:
        "1989年（平成元年）に教祖が神示を受け、1990年に篠栗町に御導き所を開いた後、神示により神仏を迎えるため上須恵の地に堂宇を造営したと公式沿革に記す。",
      sourceTitle: "宗教法人根本山宝満堂 公式沿革資料（『陽はのぼる』等）",
      sourceCategory: "D",
      certaintyTier: "B",
      chronology: {
        compilationEra: "平成期（1989年開教・1994年造営）",
        targetEra: "現代（平成以降）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "法人登記（法人番号：9290005006294）および土地利用履歴上、1990年代初頭までは森林原野であり、1994年（平成6年）の御堂建立および2000年（平成12年）の本堂造営によって現境内が新造されたことが公的に実証される。",
      sourceTitle: "法人登記情報（Gビズインフォ）／国土交通省空中写真・公図履歴",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "平成6年（1994年）〜平成12年（2000年）",
        targetEra: "平成時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "平成6年（1994年）以降に若杉山南麓の上須恵に造成。伝統的な本山からの法統継承や正式勧請関係ではなく、単立宗教法人として新設された境内空間である。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "1989年（平成元年）〜1990年",
        description:
          "教祖が神示を受け、糟屋郡篠栗町に開教拠点を設置。",
        certaintyTier: "A",
      },
      {
        era: "1994年（平成6年）",
        description:
          "須恵町上須恵の山麓森林を造成し、最初の御堂を建立。",
        certaintyTier: "A",
      },
      {
        era: "2000年（平成12年）〜現代",
        description:
          "木造本堂・回廊・三ツ鳥居形式の鳥居・八大龍王池・和の宮磐座・綾杉の植樹などを順次整備し、神仏や龍神を祀る霊場空間を完成。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "若杉山南麓の造成境内、八大龍王神池と龍柱、和の宮磐座、香椎宮綾杉ゆかりの杉の木（植樹）。",
      features: [
        "八大龍王神池（龍柱・聖水3回作法表示）",
        "和の宮磐座（三ツ鳥居形式の結界構造）",
        "香椎宮綾杉ゆかりの杉の木（植樹）",
        "宇宙の種石（現代造立の石群）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["宗教法人根本山宝満堂（単立宗教法人）"],
      routeAndPoliticalContext:
        "若杉山南麓・皿山公園に隣接するアクセス良好な山麓立地。車での参拝が容易な近代型霊場配置。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "conception_driven",
    formationAnalysis: {
      meaningOrigin: "教祖の神示に基づく開教および神仏習合の霊場建立",
      elementsIntroduction:
        "1994年以降に三ツ鳥居形式の鳥居、香椎宮綾杉ゆかりの杉の木、八大龍王神池などを順次建立・配置",
      historicalRelation:
        "神道・仏教・龍神信仰など異なる由来を持つ神仏・自然信仰要素が複合的に結合",
      presentationMethod:
        "神道・仏教・龍神信仰を複合した参拝空間として構成",
      ritualPracticeOrigin:
        "聖水を3回かける、言葉を10回唱える等、平成期に定められた具体的定型作法",
      spatialExperience:
        "清潔で巡りやすい短動線、明確な作法表示板、奥の院への容易なアクセス",
      formationVisibility:
        "法人沿革資料等で平成期の新設開創であることが公称されている",
    },
  },
  // 16. 戸上神社（門司）
  {
    id: "stratigraphy-tonogami-jinja",
    primarySpotIds: ["spot-tonogami-jinja"],
    primarySpotNames: ["戸上神社（本宮・上宮遥拝）", "戸上神社", "戸上権現", "戸上山上宮"],
    targetSpotIds: ["spot-tonogami-jinja"],
    targetRegion: "門司",
    spotNames: ["戸上神社（本宮・上宮遥拝）", "戸上神社", "戸上権現", "戸上山上宮"],
    title: "戸上神社・戸上山 祭祀景観の層構造（海中神像から山頂修験への遷移）",
    summary:
      "1696年『戸上山三大社権現治願覚書』に基づき、根二海上での網引き神像引揚から湧水地「神島井」、伊古野家「鳥井ノ宮」、前立山柳之口氏神を経て戸上山頂上宮・英彦山山伏六坊招来、満隆寺観音堂へ至る、地域生活圏から山岳霊峰聖域への重層的遷移モデルを伝える関門海峡南東麓の古層候補拠点（ラベルB）。",
    currentDeities: "天御中主神、伊邪那岐神、伊邪那美神、ほか十七柱",
    claimedOrigin: {
      statement:
        "宇多天皇寛平年間（889〜898年）神託により創建。御霊代を枝折戸に奉戴して戸上山頂に奉安したことから戸上神社と称したと伝える。",
      sourceTitle: "戸上神社境内石碑由緒",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近代石碑／社伝",
        targetEra: "平安時代前期・寛平年間（889〜898年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "元禄9年（1696年）『戸上山三大社権現治願覚書』に、大里漁師による海中神像引揚・神島井・鳥井ノ宮・前立山氏神・山頂奉安・英彦山山伏六坊配置・満隆寺観音堂建立の経緯が記録される。",
      sourceTitle: "『戸上山三大社権現治願覚書』（元禄9年／1696年）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "元禄9年（1696年）",
        targetEra: "中世〜近世修験伝承期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "戸上山（標高518m）山頂に上宮、山麓大里戸ノ上に本宮（下宮）を配し、江戸初期に細川忠利・小笠原忠真が社殿再建・祈祷所建立。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世〜近世初頭（天正〜慶長期）",
        description:
          "天正9年（1581年）戦乱で堂宇・僧坊焼失。元和3年（1617年）小倉藩主細川忠利が上宮を再建。",
        certaintyTier: "B",
      },
      {
        era: "近世（寛永〜寛文期）",
        description:
          "寛永21年（1644年）満隆寺を常学院と改称。寛文元年（1661年）小笠原忠真が祈祷道場建立。参勤交代大名の大里宿祈願所となる。",
        certaintyTier: "A",
      },
      {
        era: "近代（明治期）",
        description:
          "神仏分離により「戸上権現」から天御中主神・伊邪那岐・伊邪那美へ祭神改変。村社・郷社へ列格。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "戸上山（標高518m・企救半島の独立峰霊峰）、山頂上宮、山麓本宮社叢、湧水地（神島井伝承地）、大里宿場道。",
      features: [
        "戸上山（神体山・登拝行場）",
        "山頂上宮（元禄覚書奉安の地）",
        "山麓本宮（大里宿場祈願拠点）",
        "神島井湧水（原初神像奉斎地）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大里漁師集団", "伊古野氏", "英彦山修験山伏六坊", "小倉藩小笠原氏", "熊本藩細川氏"],
      routeAndPoliticalContext:
        "関門海峡南東の要衝・大里宿場（参勤交代九州諸大名祈願所）。山陽道渡海口と門司・豊前街道の結節点。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "海中漂着神像・湧水祭祀から戸上山霊峰信仰への遷移と結合",
      elementsIntroduction:
        "中世に英彦山修験山伏六坊と満隆寺観音が定着、近世に藩主祈祷道場、明治に記紀創世神への改変",
      historicalRelation: "海辺集落の神像が湧水・氏神を経て山頂上宮へ登攀した経緯が覚書に明記",
      presentationMethod: "石碑では寛平創建と戸上権現・満隆寺を明記し、覚書により重層遷移過程が判明",
      ritualPracticeOrigin: "山岳修験登拝、参勤交代海陸交通祈願、氏子祭礼",
      spatialExperience:
        "海沿い大里宿場から仰ぎ見る戸上山の独立峰景観と、山麓本宮・山頂上宮の二重構造",
      formationVisibility: "石碑および元禄覚書等により神仏習合・修験の歴史的展開が開示",
    },
  },
  // 17. 和布刈神社（門司）
  {
    id: "stratigraphy-mekari-jinja",
    primarySpotIds: ["spot-mekari-jinja"],
    primarySpotNames: ["和布刈神社", "和布刈神社（門司）", "早鞆明神"],
    targetSpotIds: ["spot-mekari-jinja"],
    targetRegion: "門司",
    spotNames: ["和布刈神社", "和布刈神社（門司）", "早鞆明神"],
    title: "和布刈神社・早鞆の瀬戸 祭祀景観の層構造（潮流原初祭祀から和布刈神事・祓戸神）",
    summary:
      "関門海峡最狭部（早鞆の瀬戸）の急潮に直面し、和銅3年（710年）記録伝承を持つ旧暦年越の「和布刈神事」や海中注連縄岩を保持。安曇磯良潮珠伝承・神功皇后帰還由緒と大祓詞祓戸神（瀬織津姫）が重層した海峡潮流祭祀の原初・古層拠点（ラベルA/B）。",
    currentDeities: "瀬織津姫",
    claimedOrigin: {
      statement:
        "神功皇后三韓親征からの帰還時に創建され、安曇磯良から潮の満干を司る干珠・満珠を授与されたと伝える。",
      sourceTitle: "和布刈神社社伝・由緒案内",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世〜近世社伝",
        targetEra: "神功皇后・海人族伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『和布刈神事記』等に和銅3年（710年）の記録が現れると伝えられ、旧暦元旦未明に海底の和布を刈り取る和布刈神事が古代より継続。",
      sourceTitle: "『和布刈神事記』／旧暦和布刈神事伝承記録",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "奈良時代（和銅3年/710年伝承）〜中世",
        targetEra: "奈良時代〜中世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "関門海峡最狭部・文字ヶ関（門司）の海岸岩礁上に社殿を構え、鳥居・灯籠が激流の海峡に対峙。海中に注連縄が巻かれた巨岩が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代〜中世（律令大祓詞受容期）",
        description:
          "律令大祓詞の普及に伴い、川から海へ罪穢れを流し去る祓戸四神の瀬織津姫が祭神として位置づけられる。",
        certaintyTier: "B",
      },
      {
        era: "近世（江戸期）",
        description:
          "小倉藩主小笠原氏・長州藩主毛利氏双方が関門海峡航行安全祈願所として社殿修復・寄進を行う。",
        certaintyTier: "A",
      },
      {
        era: "現代（平成〜令和期）",
        description:
          "海洋散骨参拝所や現代的授与所を整備し、海を供養の対象とする現代社会の宗教機能を包摂。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "関門海峡（早鞆の瀬戸の最大流速9ノット超急潮）、海中注連縄岩、海峡対岸（下関壇ノ浦・みもすそ川）直面鳥居・灯籠。",
      features: [
        "早鞆の瀬戸（関門海峡最狭部潮流）",
        "海中注連縄岩（和布刈神事の海底採取場）",
        "海峡直面鳥居・灯籠（対岸視線軸）",
        "海洋散骨参拝所（現代海神供養展開）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["古代海人族（阿曇氏伝承層）", "文字ヶ関関所警固層", "小倉藩小笠原氏", "長州藩毛利氏"],
      routeAndPoliticalContext:
        "瀬戸内海と日本海（玄界灘）を結ぶ海峡最狭部航路。航行に潮待ち・潮流知識を要する列島最重要の海上ボトルネック。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "関門海峡最狭部の激しい潮流・渦潮に対する畏怖と航海安全・和布収穫祭祀",
      elementsIntroduction:
        "古代に和布刈神事と安曇氏潮珠伝承、律令期に瀬織津姫祭祀、近世に関門航路祈願、現代に海洋散骨受容",
      historicalRelation: "海そのものが祭祀空間であり、建物・鳥居・灯籠の視線が海峡急潮へ直結",
      presentationMethod: "由緒案内で神功皇后伝承と和布刈神事、瀬織津姫祭祀を一体提示",
      ritualPracticeOrigin: "旧暦大晦日深夜〜元旦未明の和布刈神事（神職の海中採取と龍神伝承）",
      spatialExperience:
        "関門海峡の激流の轟音、頭上を通過する関門橋、海中岩礁と直面する社頭空間",
      formationVisibility: "神事伝承板・案内板により古代潮流祭祀と神事の歴史性が明示",
    },
  },
  // 18. 甲宗八幡宮（門司）
  {
    id: "stratigraphy-koso-hachimangu",
    primarySpotIds: ["spot-koso-hachimangu"],
    primarySpotNames: ["甲宗八幡宮", "甲宗八幡神社"],
    targetSpotIds: ["spot-koso-hachimangu"],
    targetRegion: "門司",
    spotNames: ["甲宗八幡宮", "甲宗八幡神社"],
    title: "甲宗八幡宮・門司関 祭祀景観の層構造（大宰府西門防備から中世武家文書・楠原踊）",
    summary:
      "貞観2年（860年）大宰府清原峯成の神功皇后甲冑神体創建伝承を持ち、1272年『門司関六ヶ郷総田数注文写』や1336年『足利尊氏寄進状』など北九州市指定文化財の中世古文書8点を現存。平知盛墓伝承石塔や雨乞い芸能「楠原踊」（市無形民俗文化財）を擁する関門武家土地支配の古層拠点（ラベルB）。",
    currentDeities:
      "応神天皇（第一殿）、神功皇后（第二殿）、市杵島姫命・田心姫命・湍津姫命（第三殿／宗像三女神）",
    claimedOrigin: {
      statement:
        "清和天皇の貞観2年（860年）、大宰府の清原真人峯成が勅命を受け、神功皇后着用の甲冑を神体として祀り「異国への西門を守る神」として創建したと伝える。",
      sourceTitle: "甲宗八幡宮奉納板（大正13年／1924年）／社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近代奉納板／社伝",
        targetEra: "平安前期・貞観2年（860年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "文永9年（1272年）『門司関六ヶ郷総田数注文写』および建武3年（1336年）『足利尊氏寄進状』をはじめとする中世神社文書8点（北九州市指定文化財）が現存。",
      sourceTitle: "北九州市指定有形文化財「甲宗八幡神社文書」8点",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "鎌倉時代文永9年（1272年）〜南北朝期建武3年（1336年）",
        targetEra: "中世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "門司城山（筆立山）南麓の旧門司に鎮座。境内には平知盛墓伝承石塔が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世（鎌倉〜南北朝期）",
        description:
          "門司氏（門司六ヶ郷地頭）の崇敬拠点。建武3年（1336年）足利尊氏が多々良浜合戦勝利後の東上時に社領寄進。",
        certaintyTier: "A",
      },
      {
        era: "近世（江戸期）",
        description:
          "小笠原小倉藩主による筆立山社殿改築・門司総鎮守化。雨乞い芸能「楠原踊」の継承。",
        certaintyTier: "A",
      },
      {
        era: "現代（昭和28年／1953年）",
        description:
          "門司水害により筆立山山腹から平知盛墓伝承石塔が流出し現在地へ移設・保存。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "門司城山（筆立山）山麓、中世神社古文書群、平知盛墓伝承石塔。",
      features: [
        "筆立山（門司城跡背山社叢）",
        "甲宗八幡神社文書8点（市指定文化財）",
        "平知盛墓伝承石塔（水害移設石造物）",
        "楠原踊伝承基盤（雨乞い民俗芸能）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大宰府清原氏", "中世門司氏", "足利氏", "平家落人伝承層", "小倉藩小笠原氏"],
      routeAndPoliticalContext:
        "関門海峡西口・門司関の防備要衝。大宰府・国家鎮護と武家土地支配の接点。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "大宰府による対外西門防備思想と神功皇后甲冑神体化",
      elementsIntroduction:
        "中世に門司六ヶ郷土地支配と足利尊氏寄進、宗像三女神合祀、楠原踊成立、平家伝承石塔の移設",
      historicalRelation: "中世古文書8点の実在により武家権力との直接の結合関係が同時代史料で確定",
      presentationMethod: "1924年奉納板・文化財説明板にて古文書・知盛墓・楠原踊の多重沿革を開示",
      ritualPracticeOrigin: "雨乞い祈願の楠原踊（謡・狂言の要素を持つ中世芸能の痕跡）および例祭",
      spatialExperience:
        "筆立山山麓の杜、三殿並立の拝殿、知盛墓石塔、神功皇后甲冑由緒の空間",
      formationVisibility: "市指定文化財指定書および現地解説板により中世文書と芸能の歴史性が明示",
    },
  },
  // 19. 淡島神社（門司）
  {
    id: "stratigraphy-awashima-jinja-moji",
    primarySpotIds: ["spot-awashima-jinja-moji"],
    primarySpotNames: ["淡島神社（門司）", "淡島神社", "門司淡島神社"],
    targetSpotIds: ["spot-awashima-jinja-moji"],
    targetRegion: "門司",
    spotNames: ["淡島神社（門司）", "淡島神社", "門司淡島神社"],
    title: "淡島神社・門司奥田 祭祀景観の層構造（加太淡島勧請と女性身体・針供養生活文化）",
    summary:
      "六條天皇御代（1165〜1168年頃）に紀伊国加太淡嶋神社より少名比古那神を勧請した由緒を伝え、針塚・水蛭子社・稲荷小祠を併祀。国家神話や武家支配と一線を画し、女性の病気平癒・安産・子授けや針供養など生活文化と身体に密着した民間信仰拠点（ラベルC）。",
    currentDeities: "少名比古那神",
    claimedOrigin: {
      statement:
        "六條天皇の御代、永万〜仁安年間（1165〜1168年頃）に紀伊国加太淡嶋神社より勧請されたと伝える。",
      sourceTitle: "淡島神社社伝・由緒案内",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代社伝",
        targetEra: "平安末期・1165〜1168年頃",
      },
    },
    oldestAttestedRecord: {
      statement:
        "近世以降、奥田村の集落信仰として少名比古那神の医薬・女性病気平癒・安産信仰および針供養が継承される。",
      sourceTitle: "門司区誌／地域民俗記録",
      sourceCategory: "C",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代",
        targetEra: "近世以降",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "門司区奥田の住宅地・丘陵麓に社殿を構え、境内に針塚、水蛭子社、稲荷社小祠が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世〜近世（加太淡島信仰受容期）",
        description:
          "紀伊加太淡島信仰が瀬戸内廻船・西国航路を通じて門司奥田に伝播・受容される。",
        certaintyTier: "B",
      },
      {
        era: "近代〜現代（小祠合祀・針供養継続期）",
        description:
          "水蛭子社・稲荷小祠を境内に併祀。日常生活道具への感謝を捧げる針供養行事が現代に至るまで継続。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "針塚（道具供養記念碑）、水蛭子社小祠、奥田の集落生活空間。",
      features: [
        "針塚（生活道具感謝・供養碑）",
        "水蛭子社・稲荷小祠（複合民間祭祀）",
        "奥田丘陵麓社頭（生活密着空間）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["地域農民・町民層", "女性講集団", "紀伊加太淡島信仰伝播層"],
      routeAndPoliticalContext:
        "武家権力や関門軍事とは独立した、奥田谷筋の地域民衆・生活共同体空間。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "少名比古那神の医薬・療病神格と加太淡島信仰の女性身体救済・道具供養",
      elementsIntroduction:
        "中世の加太勧請伝承、近世の針供養定着、近代の水蛭子社・稲荷併祀",
      historicalRelation: "医薬・安産・針供養という異なる生活領域が少名比古那神を中心に結合",
      presentationMethod: "由緒案内で少名比古那神の国土経営・医薬伝承と加太勧請、針供養を明記",
      ritualPracticeOrigin: "針供養祭（日常使役道具への感謝と裁縫上達祈願）および女性身体安産祈願",
      spatialExperience: "集落に近接した身近な境内、針塚、複数の親しみやすい小祠群",
      formationVisibility: "境内石碑・案内により加太勧請由緒と針供養文化の歴史性が開示",
    },
  },
  {
    id: "stratigraphy-umi-hachimangu",
    primarySpotIds: ["spot-umi-hachimangu", "spot-quick-85d68993513f4aa2"],
    primarySpotNames: ["宇美八幡宮"],
    targetSpotIds: [
      "spot-umi-hachimangu",
      "spot-quick-85d68993513f4aa2",
      "spot-umi-obiegaura-okumiya",
    ],
    targetRegion: "宇美",
    spotNames: [
      "宇美八幡宮",
      "宇美八幡宮 奥宮（御胞衣ヶ浦）",
      "御胞衣ヶ浦",
      "宇美八幡",
    ],
    title: "宇美八幡宮・御胞衣ヶ浦 産育聖域の重層構造",
    summary:
      "神功皇后の応神天皇出産伝承（宇美の地名起源）と1055年石清水文書による北部九州八幡五社としての公的記録を併せ持ち、境内の巨樹群（湯蓋の森・衣掛の森・子安の木）や産湯の水、そして胞衣（胎盤・卵膜）を祀る奥宮・御胞衣ヶ浦に至る、出産の具体的プロセスが空間化された日本屈指の産育聖域。",
    currentDeities:
      "応神天皇・神功皇后・玉依姫命・住吉三柱大神・伊弉諾尊（奥宮：応神天皇御胞衣）",
    claimedOrigin: {
      statement:
        "敏達天皇3年（574年）、神功皇后がこの地で応神天皇を出産した伝承（宇美の地名起源）に基づき創建されたとする由緒。",
      sourceTitle: "社伝・『日本書紀』神功皇后紀（宇美地名起源譚）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "敏達天皇3年（574年）伝承",
        extantManuscriptEra: "近世社伝",
        targetEra: "神話・古代",
      },
    },
    oldestAttestedRecord: {
      statement:
        "天喜3年（1055年）『石清水文書』において、宇美八幡宮を含む北部九州の八幡関係五社が石清水八幡宮の管轄下に入ったことが記され、平安中期には広域八幡ネットワークの重要拠点として公認されていた。",
      sourceTitle: "天喜3年（1055年）『石清水文書』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "天喜3年（1055年）",
        extantManuscriptEra: "石清水八幡宮文書古写本",
        targetEra: "平安中期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "鎌倉時代初頭の建久年間に宇美八幡宮の槐木を用いて薬師像を造り安産祈願を行った記録があり、中世初期からの安産信仰の持続が確認できる。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "平安中期（1055年）",
        description:
          "石清水八幡宮の管轄・別宮ネットワークに組み込まれ、中央八幡信仰と結合。",
        certaintyTier: "A",
      },
      {
        era: "鎌倉初期（建久年間）",
        description:
          "神木槐による薬師像造立・安産祈願に見る神仏習合の深化。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世",
        description:
          "「子安の石」信仰（祈願時に石を預かり出産後に子の名を記して納める習俗）の定着と庶民産育信仰の普及。",
        certaintyTier: "A",
      },
      {
        era: "近代〜現代",
        description:
          "湯蓋の森・衣掛の森の国指定天然記念物指定（昭和期）と、御胞衣ヶ浦（奥宮）を含む産育聖域の保全。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "宇美川河岸のクスノキ巨樹群（湯蓋の森・衣掛の森：国指定天然記念物）および宇美川畔の微高地（奥宮・御胞衣ヶ浦）。",
      features: [
        "湯蓋の森（国指定天然記念物）",
        "衣掛の森（国指定天然記念物）",
        "子安の木（槐）",
        "産湯の水",
        "御胞衣ヶ浦奥宮（胞衣筥納め伝承地）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["宇美郷在地氏族", "神功・応神王権祭祀集団", "石清水八幡社家"],
      routeAndPoliticalContext:
        "三王台・糟屋郡の内陸交通路。香椎宮・大宰府・博多を結ぶ古代官道・八幡信仰圏の結節点。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin:
        "出産の具体的各段階（産湯・衣掛・しがみつき・胞衣埋納・小石奉納）に連動した産育・安産民俗儀礼",
      elementsIntroduction:
        "敏達期伝承から1055年石清水文書八幡五社編入、中世槐薬師像造立、近世子安の石信仰の定着",
      historicalRelation:
        "国家神話（八幡誕生譚）と民衆の身体的産育民俗（胞衣埋納）が自然地形に分節・共存",
      presentationMethod:
        "境内各所に天然記念物巨樹・泉・石積み・奥宮碑が整備され出産の物語空間を提示",
      ritualPracticeOrigin:
        "妊婦が石を預かり出産後に子の名を記して納める「子安の石」習俗および奥宮胞衣祭祀",
      spatialExperience:
        "宇美川沿いの巨木が繁茂する森、子安の石が山積みされた祈願所、川を渡った丘陵上の清澄な奥宮",
      formationVisibility:
        "境内の各巨樹・泉・石積み・奥宮碑により、出産の物語空間が実地で可視化",
    },
  },
  {
    id: "stratigraphy-mizuki-fortification",
    primarySpotIds: ["spot-mizuki-fortification"],
    primarySpotNames: ["水城（水城跡・東門官道・水城館）", "水城"],
    targetSpotIds: [
      "spot-mizuki-fortification",
      "spot-sugatamii-kinukake-tenmangu",
    ],
    targetRegion: "太宰府",
    spotNames: [
      "水城（水城跡・東門官道・水城館）",
      "水城",
      "水城跡",
      "姿見井・衣掛天満宮",
      "姿見井",
      "衣掛天満宮",
    ],
    title: "水城・古代官道 防衛と交通管理関門の層構造",
    summary:
      "白村江の戦い（663年）翌年の天智3年（664年）に築造された長さ1.2km・高さ10mの版築土塁。外濠・内濠・敷粗朶（百済扶余羅城技術）を備えた防衛施設であると同時に、中央を貫通する幅10mの古代官道（側溝・759年勅令による街路樹植栽）を通じ、博多港と大宰府を結ぶ人・物・情報の往来を管理・統御した古代国家インフラ。近世には菅原道真左遷伝承（姿見井・衣掛天満宮）が重層した。",
    currentDeities: "（防衛施設・古代官道／衣掛天満宮：菅原道真公）",
    claimedOrigin: {
      statement:
        "『日本書紀』天智天皇3年（664年）条に「筑紫に大堤を築き水を貯へしむ。名づけて水城といふ」と記される白村江敗戦後の国防施設。",
      sourceTitle: "『日本書紀』天智天皇紀",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "養老4年（720年）",
        extantManuscriptEra: "平安・鎌倉期古写本",
        targetEra: "天智3年（664年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本書紀』天智3年条および発掘調査により、版築工法、敷粗朶（木組み・枝葉による地盤補強）、幅10mの直線古代官道、東西門跡、759年詔に基づく官道側溝の花粉分析（クルミ・ヤマモモ）が考古・文献両面で実証。",
      sourceTitle: "『日本書紀』・水城跡発掘調査報告書",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "7〜8世紀",
        extantManuscriptEra: "発掘遺構および古写本",
        targetEra: "飛鳥〜奈良時代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "土塁基底部の敷粗朶および版築層が原位置で確認され、東門・西門跡および官道側溝の遺構が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "7世紀後半（664年〜）",
        description:
          "白村江敗戦後の国防土塁として築造。博多〜大宰府間官道と東門・西門の整備。",
        certaintyTier: "A",
      },
      {
        era: "8世紀（奈良期）",
        description:
          "天平宝字3年（759年）勅令による官道沿い果樹植栽（花粉分析実証）。大宰府条坊との一体的運用。",
        certaintyTier: "A",
      },
      {
        era: "10世紀〜近世",
        description:
          "軍事機能喪失後、延喜元年（901年）菅原道真左遷路伝承が重層。宝永年間（1704〜1710年）衣掛天満宮建立、姿見井石積み整備。",
        certaintyTier: "A",
      },
      {
        era: "近代〜現代",
        description:
          "大正10年国史跡指定、昭和28年国特別史跡指定、水城館整備。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "福岡平野の最狭部に築かれた全長1.2km・高さ10mの版築土塁、博多と大宰府を直線で結ぶ幅10m官道遺構、側溝花粉遺存物。",
      features: [
        "版築土塁（全長1.2km）",
        "敷粗朶工法遺構",
        "古代官道東門・西門跡",
        "官道側溝・花粉層",
        "姿見井石積み",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大和王権（天智朝）", "大宰府防人・官人", "百済渡来技術者集団"],
      routeAndPoliticalContext:
        "博多港と大宰府政庁を直結する古代官道（幅10m）の直上。古代国家防衛線と交通管理関門の結節点。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "reorganized",
    formationAnalysis: {
      meaningOrigin:
        "白村江後の古代国家防衛施設・関門および博多〜大宰府間官道管理",
      elementsIntroduction:
        "664年版築土塁築造、759年官道沿い果樹植栽、901年道真左遷伝承、宝永年間衣掛天満宮建立",
      historicalRelation:
        "軍事遮断土塁から交通検問関門、そして近世村落祭祀・道真追慕空間への機能転換",
      presentationMethod:
        "国特別史跡水城跡、水城館模型・断面展示、東門礎石・官道側溝遺構の公開",
      ritualPracticeOrigin:
        "古代関門警備・出入管理および近世の天満宮宮座・年中行事",
      spatialExperience:
        "平野を遮断する長大な緑の土塁、直線に伸びる官道跡、水城館からの博多〜大宰府展望",
      formationVisibility:
        "土塁断面の版築・敷粗朶展示や東門礎石・官道側溝により古代土木と交通管理が立体的に可視化",
    },
  },
  {
    id: "stratigraphy-goryo-homan-jinja",
    primarySpotIds: ["spot-goryo-homan-jinja"],
    primarySpotNames: ["御陵寶満神社"],
    targetSpotIds: ["spot-goryo-homan-jinja"],
    targetRegion: "大野城",
    spotNames: ["御陵寶満神社", "御陵宝満神社", "御陵宝満宮"],
    title: "御陵寶満神社 玉依姫御陵伝承と近世五村共同祭祀の層構造",
    summary:
      "玉依姫命の御陵伝承地として景行・神功・斉明・天智の由緒を伝える一方、近世文書により周辺五村（乙金・中・山田・筒井・井相田）へ分社・勧請された地域共同祭祀の中心であることが確認される、宝満山信仰圏の在地村落ネットワーク拠点。",
    currentDeities: "神功皇后・玉依姫命・応神天皇",
    claimedOrigin: {
      statement:
        "神代の玉依姫命の御陵伝承地であり、景行天皇九州巡幸時や神功皇后新羅征討時に祈願され、斉明天皇・天智天皇により再建・勅号を賜ったとする社伝。",
      sourceTitle: "社伝・『筑前国続風土記』",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世社伝（古代由緒）",
        extantManuscriptEra: "江戸期地誌",
        targetEra: "古代伝承",
      },
    },
    oldestAttestedRecord: {
      statement:
        "地域村落文書により、文禄4年（1595年）に乙金宝満宮、延宝3年（1675年）に中宝満宮・筒井宝満神社が御陵から勧請されたことが記録され、近世初頭には周辺五村の親社として機能していたことが実証される。",
      sourceTitle: "乙金宝満宮文書・中宝満宮記録・『大野城市史』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "文禄4年（1595年）〜延宝3年（1675年）",
        extantManuscriptEra: "近世村落文書",
        targetEra: "安土桃山〜江戸前期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "明治19年（1886年）に周辺五村が連名で奉納した鳥居石造物が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代〜中世",
        description:
          "玉依姫御陵伝承と霊峰宝満山（竈門神社）信仰の受容。",
        certaintyTier: "A",
      },
      {
        era: "近世（1595年〜1675年）",
        description:
          "周辺五村（中村・乙金村・山田村・筒井村・井相田村）への分社・勧請と共同祭祀ネットワークの確立。",
        certaintyTier: "A",
      },
      {
        era: "近代（1886年）",
        description:
          "明治19年の鳥居建立に五村が連名奉納し、村落連合の紐帯を維持。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "福岡平野周縁の微高地・段丘端部。古代御陵伝承の塚状地形。",
      features: ["御陵伝承塚", "五村連名鳥居（明治19年）"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: [
        "御陵郷在地農民集団",
        "周辺五村（乙金・中・山田・筒井・井相田）惣村講",
        "宝満山山伏修験者",
      ],
      routeAndPoliticalContext:
        "福岡平野東縁の農耕水利地帯。宝満山（竈門神社）信仰圏の村落分社ネットワーク。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "reorganized",
    formationAnalysis: {
      meaningOrigin:
        "玉依姫御陵伝承および宝満山信仰に基づく村落農耕共同祈願",
      elementsIntroduction:
        "神代御陵伝承、1595年乙金宝満宮勧請、1675年中・筒井分社、1886年五村連名鳥居建立",
      historicalRelation:
        "古代御陵伝承塚が近世において周辺五村の親社・共同祭祀中枢として再編",
      presentationMethod:
        "境内社叢、五村連名鳥居石造物刻銘、地域案内板による開示",
      ritualPracticeOrigin:
        "宝満山神事と連動した近世五村の農耕共同祈願・雨乞い祭祀",
      spatialExperience:
        "住宅地の中に残る独立した社叢、五村の名が刻まれた鳥居石造物",
      formationVisibility:
        "鳥居刻銘や境内案内により五村分社と玉依姫御陵の歴史性が確認可能",
    },
  },
  {
    id: "stratigraphy-zenichida-kofun-cluster",
    primarySpotIds: ["spot-zenichida-kofun-cluster"],
    primarySpotNames: ["善一田古墳群"],
    targetSpotIds: ["spot-zenichida-kofun-cluster"],
    targetRegion: "大野城",
    spotNames: ["善一田古墳群", "善一田18号墳"],
    title: "善一田古墳群 鉄器生産職人集団と東アジア交易首長墓の層構造",
    summary:
      "6世紀後半から7世紀後半にかけて築造された古墳群。最大規模の18号墳（円墳26m×22m）から鉄鋏（かなはし）が出土し、鉄器生産・鍛冶職人集団を統率した首長墓と目されるとともに、新羅系土器、西アジア由来ガラス玉、20号墳三葉環頭大刀の出土から、内陸首長層の東アジア・シルクロード交流網直結を実証する考古拠点。",
    currentDeities: "（古墳群・首長墓群／被葬者：6〜7世紀の地域生産首長）",
    claimedOrigin: {
      statement:
        "6世紀後半〜7世紀後半に丘陵尾根上に営まれた地域首長および工人集団の古墳群。",
      sourceTitle: "善一田古墳群発掘調査報告書・現地案内板",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "6〜7世紀",
        extantManuscriptEra: "発掘調査報告",
        targetEra: "古墳時代後期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "18号墳の横穴式石室および副葬品（鉄鋏・馬具・装身具）、新羅系土器、西アジアガラス玉、20号墳三葉環頭大刀が発掘調査により確認。",
      sourceTitle: "善一田古墳群発掘調査報告書",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "6世紀後半〜7世紀後半",
        extantManuscriptEra: "出土遺物（実物）",
        targetEra: "古墳時代後期〜終末期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "6世紀後半〜7世紀後半の横穴式石室および円墳墳丘遺構が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "6世紀後半〜7世紀後半",
        description:
          "18号墳（鉄鋏出土の鍛冶首長墓）を初現とし、順次丘陵上に円墳群が形成。",
        certaintyTier: "A",
      },
      {
        era: "7世紀末〜中世",
        description:
          "古墳群の造営終了後、丘陵の山林・里山化。牛頸須恵器窯跡群との空間的近接。",
        certaintyTier: "A",
      },
      {
        era: "現代",
        description:
          "史跡整備・保存、大野城市による調査公開。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "福岡平野と脊振山地を一望する丘陵尾根上の円墳群（18号墳ほか）、横穴式石室遺構。",
      features: [
        "18号墳（鉄鋏出土円墳）",
        "横穴式石室",
        "平野展望丘陵尾根",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: [
        "筑紫地域首長層",
        "鍛冶・鉄器生産職人集団",
        "渡来系工人・交易商人",
      ],
      routeAndPoliticalContext:
        "福岡平野・牛頸川流域の生産基盤。朝鮮半島新羅・西アジアシルクロード交易網との連環。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin:
        "6〜7世紀の鉄器生産職人集団首長墓および東アジア交易の記念空間",
      elementsIntroduction:
        "6世紀後半18号墳（鉄鋏・新羅土器・ガラス玉）、20号墳三葉環頭大刀、現代史跡整備",
      historicalRelation:
        "牛頸窯跡群の一大窯業生産と善一田の鉄器生産首長が複合した古代筑紫の生産拠点",
      presentationMethod:
        "復元石室、出土遺物（鉄鋏・ガラス玉等）展示、丘陵上展望案内板",
      ritualPracticeOrigin:
        "古墳時代後期の追葬・副葬祭祀および鉄器鍛冶生産儀礼",
      spatialExperience:
        "平野と脊振山地を見晴らす高台の眺望、露出する石室石材",
      formationVisibility:
        "復元石室・案内板により鉄器生産と国際交流の実態が開示",
    },
  },
  {
    id: "stratigraphy-dazaifu-tenmangu",
    primarySpotIds: ["spot-dazaifu-tenmangu"],
    primarySpotNames: ["太宰府天満宮"],
    targetSpotIds: [
      "spot-dazaifu-tenmangu",
      "spot-tenkai-inari-okunoin",
      "spot-dazaifu-shiga-sha",
    ],
    targetRegion: "太宰府",
    spotNames: [
      "太宰府天満宮",
      "天開稲荷社 奥の院",
      "太宰府天満宮 志賀社",
    ],
    title: "太宰府天満宮・志賀社・天開稲荷 祭祀景観の層構造",
    summary:
      "延喜3年（903年）の菅原道真薨去・埋葬地（安楽寺天満宮）から始まる天神御霊信仰の中枢。境内には室町期最古社殿（1458年・国重文）を有する志賀社（綿津見三神＝海神）や巨石石室状の天開稲荷社奥の院、菓祖田道間守（中島神社）が同居し、古代海神信仰・農耕産育・御霊鎮魂・近世中世社領信仰が重層する。",
    currentDeities:
      "菅原道真公（本殿）、綿津見三神（志賀社）、宇迦之御魂大神（天開稲荷社）",
    claimedOrigin: {
      statement:
        "延喜3年（903年）に大宰府で薨去した菅原道真の遺骸を牛車で運ぶ途中、牛が伏して動かなくなった場所を墓所と定め、延喜5年（905年）に門弟味酒安行が祠廟を建立、延喜19年（919年）に醍醐天皇の勅命により社殿を造営したとされる天神信仰起源由緒。",
      sourceTitle: "『菅家御伝記』・太宰府天満宮社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "平安中期〜中世編纂",
        extantManuscriptEra: "鎌倉〜室町期写本",
        targetEra: "平安時代初期（10世紀初頭）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本紀略』延喜3年（903年）2月25日条に菅原道真薨去の記録。『日本紀略』延喜19年（919年）条に勅命による社殿造営記事。長徳元年（995年）一条天皇勅定による正一位左大臣追贈、天慶の乱前後の怨霊鎮魂と御霊信仰の成立を同時代〜平安中期の公私記録で確認。",
      sourceTitle: "『日本紀略』『扶桑略記』『類聚国史』後代記事",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "平安中期（10〜11世紀）",
        extantManuscriptEra: "古写本群",
        targetEra: "10世紀（平安初期・中期）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "志賀社本殿（1458年・長禄2年再建）が境内最古の現存建築（国指定重要文化財）。天満宮本殿は天正19年（1591年）小早川隆景再建の五間社流造（国指定重要文化財）。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "10世紀初頭（延喜年間）",
        description:
          "安楽寺天満宮として道真埋葬地に廟堂造営。御霊信仰中枢の形成。",
        certaintyTier: "A",
      },
      {
        era: "平安末期（康和3年・1101年）",
        description:
          "大宰権帥・大江匡房により神幸式大祭が創始され、榎社を行宮御旅所とする渡御動線が成立。",
        certaintyTier: "A",
      },
      {
        era: "室町時代（1458年）",
        description:
          "志賀社再建（現存最古・重文）。海神（綿津見三神）信仰の境内保持。",
        certaintyTier: "A",
      },
      {
        era: "戦国末期（1591年）",
        description:
          "兵火焼失後、小早川隆景の寄進により現在の本殿（国重文）が再建。",
        certaintyTier: "A",
      },
      {
        era: "近代〜現代",
        description:
          "神仏分離により安楽寺廃絶・官幣大社列格。中島神社（1954年菓祖勧請）や九州国立博物館（2005年開館）直結など学術文化空間として進化。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "天満宮本殿墓所地、境内最古の志賀社社殿（1458年国重文）、巨石石室状の天開稲荷社奥の院洞穴構造、御神木飛梅。",
      features: [
        "志賀社社殿（1458年・国重文）",
        "本殿（1591年小早川隆景再建・国重文）",
        "天開稲荷社奥の院（巨石洞穴祭祀空間）",
        "飛梅",
        "菅家祖先・地域小祠群",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: [
        "菅原氏（道真・味酒安行等）",
        "阿曇氏（綿津見海神系）",
        "大江氏（匡房）",
        "小早川氏",
      ],
      routeAndPoliticalContext:
        "古代大宰府条坊の北東聖域。博多湾海神（志賀海神社）との結びつき、古代官道・神幸式御旅所渡御動線。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
    formationAnalysis: {
      meaningOrigin:
        "道真墓所廟堂・御霊鎮魂聖地および古代海神・土着農耕神の包摂",
      elementsIntroduction:
        "延喜3年墓所、延喜19年勅願社殿、1101年神幸式、1458年志賀社再建、1591年本殿再建、1954年中島神社、2005年九博",
      historicalRelation:
        "古代官衙都市大宰府の崩壊と平安御霊信仰の勃興、近世領主復興、現代学術文化拠点が重層",
      presentationMethod:
        "本殿（国重文）、志賀社（国重文）、天開稲荷石室奥の院、神幸式行事、飛梅",
      ritualPracticeOrigin:
        "平安時代延喜期の道真墓前供養および1101年大江匡房による神幸式大祭渡御",
      spatialExperience:
        "楼門から本殿、境内小祠群、石段を登る天開稲荷巨石奥の院の立体景観",
      formationVisibility:
        "室町重文社殿、石室状奥の院、小祠群が天神信仰内部の多層的歴史を直接開示",
    },
  },
  {
    id: "stratigraphy-tonokoga-ojo-jinja",
    primarySpotIds: ["spot-ojo-jinja-tonokoga"],
    primarySpotNames: ["王城神社"],
    targetSpotIds: ["spot-ojo-jinja-tonokoga"],
    targetRegion: "太宰府",
    spotNames: ["王城神社", "通古賀 王城神社"],
    title: "通古賀・王城神社 祭祀景観の層構造",
    summary:
      "白村江防衛山城（大野城・四王寺山）の神を天智4年（665年）に移座したという社伝（船賀法印『王城神社縁起』）を基層とし、戦国末期の小早川隆景による社殿再建を経て、太宰府市民遺産第18号「宮座お籠り神事（春・夏・秋）」および神饌懸鯛に手を触れず調理する対面式古式包丁神事「真魚箸料理」を現在まで氏子集団が継承する地域共同体祭祀の重層聖域。",
    currentDeities: "事代主命",
    claimedOrigin: {
      statement:
        "天智4年（665年）に四王寺山（王城山）で武甕槌命と相殿で祀られていた事代主命を通古賀（筑前国衙庄・扇屋敷）に移座し、四王寺山の別称である王城山にちなんで王城大明神と称したとする由緒伝承。",
      sourceTitle: "船賀法印『王城神社縁起』・『王城神社由来記』",
      sourceCategory: "B",
      certaintyTier: "C",
      chronology: {
        compilationEra: "近世編纂縁起",
        extantManuscriptEra: "近世・近代文書",
        targetEra: "天智4年（665年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "天正6年（1578年）の秋月勢による兵火焼失記録、および領主・小早川隆景による社殿再建棟札・寄進伝承。明治5年（1872年）旧水城村村社指定記録。",
      sourceTitle: "『筑前国続風土記』・『王城神社由来記』・福岡県神社誌",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "戦国末期（1578年）〜近世・近代",
        extantManuscriptEra: "棟札写・村誌",
        targetEra: "戦国〜近世・近代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "小早川隆景寄進による社殿再建以降、近世〜近代に氏子集団によって修復・維持された社殿および宮座お籠り施設が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代（665年伝承）",
        description:
          "四王寺山（白村江後大野城防衛拠点）から事代主命を国衙庄（通古賀）へ移座した伝承期。",
        certaintyTier: "C",
      },
      {
        era: "戦国末期（1578年）",
        description:
          "秋月勢兵火で焼失後、領主・小早川隆景の寄進により社殿再建。",
        certaintyTier: "A",
      },
      {
        era: "江戸〜明治期",
        description:
          "水城村通古賀の氏子集団による宮座組織の確立と農事暦祭祀の定着。明治5年村社列格。",
        certaintyTier: "A",
      },
      {
        era: "現代",
        description:
          "「宮座お籠り神事」「真魚箸料理」が太宰府市民遺産第18号に認定され、無形民俗儀礼として保存・継承。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "古代官道・水城防衛線に近い通古賀集落内の社叢、社殿、宮座お籠り座敷、真魚箸料理奉納具。",
      features: [
        "社殿",
        "宮座お籠り座敷",
        "真魚箸・包丁神事用具",
        "旧通古賀村落社叢",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["筑前国衙庄通古賀氏子宮座集団", "小早川氏"],
      routeAndPoliticalContext:
        "水城東門官道と四王寺山（大野城）防衛圏の山麓。農事暦（播種・田植え・収穫）に直結した地域共同体の自律的祭祀空間。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
    formationAnalysis: {
      meaningOrigin:
        "四王寺山防衛聖域伝承と通古賀村落共同体の農耕五穀豊穣祈願",
      elementsIntroduction:
        "665年移座伝承、1578年秋月兵火・小早川隆景再建、宮座お籠り・真魚箸料理成立、太宰府市民遺産認定",
      historicalRelation:
        "国家防衛の軍事山城の記憶が平野部の村落農耕共同体祭祀へと定着・重層化",
      presentationMethod:
        "本殿、宮座座敷、太宰府市民遺産第18号認定銘板、真魚箸料理儀礼",
      ritualPracticeOrigin:
        "春籠り・夏籠り・秋の宮座お籠りという農事暦神事および対面式真魚箸包丁調理",
      spatialExperience:
        "住宅街の中に清閑と佇む社叢、宮座神事の息づく集落鎮守の空気感",
      formationVisibility:
        "市民遺産案内板と現役の宮座神事により、生きた民俗継承の地層が開示",
    },
  },
];


/**
 * 地域間比較の6観点（Cross-Regional Comparison 6 Viewpoints）データ定義
 * 1. 共通点 (commonality)
 * 2. 相違点 (difference)
 * 3. 成立時期の前後関係 (chronology)
 * 4. 交流経路・媒介氏族の可能性 (contactPossibility)
 * 5. 独立発生の可能性 (independence)
 * 6. 別説明・後世再編の可能性 (alternativeExplanation)
 */
export const REGIONAL_COMPARISON_ENTRIES: readonly RegionalComparisonEntry[] = [
  {
    id: "comp-marine-island-sanctuaries",
    title: "玄界灘・博多湾・瀬戸内海の「島・岬・海浜」海洋聖域比較",
    regions: ["宗像・沖ノ島", "博多湾・志賀島", "安芸・厳島（宮島）", "対馬・浅茅湾／壱岐"],
    commonality:
      "いずれも航路上のランドマークとなる島嶼・陸繋島（沖ノ島・志賀島・厳島・対馬・壱岐）を聖域の核とし、海浜または本土側の遥拝・奉斎拠点と山・岩礁の奥宮を組み合わせた多拠点構成をとる。",
    difference:
      "沖ノ島は4〜9世紀の約8万点にのぼる国家奉献遺物（考古物証：確度A）が突出する禁足孤島であるのに対し、志賀島・対馬は阿曇氏や対馬卜部の海産物貢進・亀卜と結びつき、厳島は平安末期の海上寝殿造社殿と弥山修験（三鬼大権現）による神仏習合空間として大きく展開した。",
    chronology:
      "考古・古代史料で確認できる祭祀の確立順は、壱岐原の辻・志賀島（弥生期〜）および宗像・沖ノ島（4世紀後半〜）・記紀（712/720年）が先行し、安芸・厳島は『日本後紀』弘仁2年（811年）が確実な文献初見となる。",
    contactPossibility:
      "対馬・壱岐・玄界灘から関門海峡を経て安芸灘・瀬戸内海へ至る古代主要航路上で直結しており、宗像氏・阿曇氏・卜部氏・佐伯氏（安芸佐伯郡）ら海上勢力を介した神名・祭祀様式の伝播経路が存在する。",
    independence:
      "航海の難所や海峡に面した島・巨岩を航路標識兼神体として畏怖・奉斎する基底心性自体は、各海域で自然発生（独立発生）しうる普遍的な海洋景観条件である。",
    alternativeExplanation:
      "厳島の祭神が宗像と同じ三女神とされている点や、対馬の八幡宮が明治期に海神神社へ復古された点は、古代から単一教義であったためとは限らず、平安後期〜中近世・明治期の神統譜整理・式内社比定過程での再編を含む。",
  },
  {
    id: "comp-summit-iwakura-shrine-duality",
    title: "山頂磐座（巨石群）と山麓・中腹社殿の二元構造比較",
    regions: ["宇佐神宮・御許山", "厳島神社・弥山", "宗像大社・高宮祭場", "大和・大神神社（三輪山）", "国東・六郷満山"],
    commonality:
      "山麓・海浜の拝殿・本殿群の背後または上方に、社殿を持たない露天の巨石・磐座・神体山（御許山山頂三巨石・弥山山頂巨岩群・宗像高宮祭場・三輪山三段磐座・両子山奇岩群）が「本源の聖地（奥宮）」として維持されている。",
    difference:
      "大神神社（三輪山）は山麓にも本殿を造らず三ツ鳥居から山体を直接拝む形態を保ち、御許山は山頂三巨石を禁足としつつ山麓に宇佐三殿を構え、弥山と国東六郷満山は奇岩群に密教・修験の堂宇や磨崖仏が直接密着して造営された。",
    chronology:
      "各地域とも「自然地形・巨岩・露天祭場（古墳〜飛鳥期以前）」が先行し、律令期（8世紀）〜平安期に山麓社殿および神宮寺・修験行場が整備され、明治の神仏分離で仏教要素が切り離された。",
    contactPossibility:
      "大和（三輪）— 瀬戸内（厳島）— 豊前・国東（宇佐・六郷満山）— 筑前（宗像）は瀬戸内海路と修験者・僧侶・大神氏系ネットワークの往来圏にあり、三柱観念や神体山登拝作法に相互影響が見られる。",
    independence:
      "山頂の露岩（磐座）を神の降臨座とし、日常の祭祀・参拝のために山麓へ里宮（拝殿・遥拝所）を設ける「山宮・里宮」二元構造は日本列島各地の自然崇拝で広く独立に成立している。",
    alternativeExplanation:
      "現在見られる「奥宮（自然祭祀）＝純粋な太古の原型」という図式の一部は、中近世の修験道による霊山整備や、近世国学・明治神道による「古神道・磐座顕彰」によって再解釈・純化された側面も含む。",
  },
  {
    id: "comp-sea-deity-to-state-cult",
    title: "海神・航海神から国家神・王権守護神への再編比較",
    regions: ["志賀海神社（阿曇・綿津見）", "住吉神社・住吉大社（津守・筒男）", "宗像大社（宗像・三女神）", "宇佐神宮（八幡・比売大神）"],
    commonality:
      "いずれも「三柱（綿津見三神・住吉三神・宗像三女神・宇佐三殿）」の三神構造をとり、海上交通・対外交渉の要衝からヤマト王権の外交・軍事守護神（名神大社・官幣大社）へと位置づけられた。",
    difference:
      "綿津見三神（阿曇氏）と宗像三女神（宗像氏）は在地豪族の氏神性が強く残ったのに対し、住吉三神は難波津・遣唐使の国家港湾神として展開し、宇佐は在地女神（比売大神）に応神天皇（八幡大菩薩）・神功皇后を結合して皇室宗廟に次ぐ国家神へ躍進した。",
    chronology:
      "記紀（712〜720年）段階で綿津見・住吉・宗像の三神体系が成文化され、直後の8世紀前半〜中葉（『続日本紀』天平年間）に宇佐八幡神が中央政界へ急速に浮上した。",
    contactPossibility:
      "いずれも神功皇后の「新羅征討（三韓出兵）伝承」や対朝鮮半島航路という同一の政治・軍事物語の枠組みの中で接続されており、大宰府・難波津を結ぶ外交官人・海人族のネットワーク上で再編された。",
    independence:
      "元来はそれぞれの海域（玄界灘沖合・博多湾口・那珂川河口〜大阪湾・周防灘宇佐）を拠点とする異なる海人集団・在地首長の個別祭祀であった可能性が高い。",
    alternativeExplanation:
      "「三柱一組」の整然とした体系は、最初から全地域で共通の教義だったというよりも、7〜8世紀の記紀神話編纂および律令祭祀整備の過程で、中国・朝鮮半島の儀礼や朝廷の三神観念に合わせて規格化された結果とも解釈できる。",
  },
  {
    id: "comp-royal-myth-and-local-bedrock",
    title: "記紀王権神話・征討伝承と在地考古遺構（古墳・神籠石・巨木柱・火山）の重層比較",
    regions: ["筑紫（香椎・宮地嶽・高良）", "出雲（杵築・出雲大社）", "日向・肥後（高千穂・阿蘇）", "大和（三輪山・纏向）"],
    commonality:
      "記紀が語る王権の重要画期（天孫降臨・国譲り・初期王権崇神朝・仲哀神功西征）の舞台とされる聖地であり、社伝の語る神代・古代起源と、現地の考古遺構（纏向箸墓・巨石古墳・神籠石・鎌倉期巨大柱根）や火山・渓谷地形が重なり合っている。",
    difference:
      "三輪山・出雲大社・阿蘇山は記紀・風土記・『隋書』と考古物証によって古代からの祭祀対象が一貫して裏付けられるのに対し、宮地嶽は終末期巨石古墳の上に神功皇后伝承が重なり、高良山は7世紀神籠石と正体未確定の「高良玉垂命」が結びつき、香椎は神社ではなく「霊廟（橿日廟）」として出発した。",
    chronology:
      "3〜7世紀の首長墓・祭祀遺跡（纏向・三輪山・宮地岳古墳・中通古墳群）や7世紀後半の国防城郭（高良山神籠石）が築かれた後、8世紀の記紀・風土記編纂と律令祭祀化、さらに平安〜中世の縁起・神仏習合によって現在の由緒体系が形成された。",
    contactPossibility:
      "ヤマト王権による地方支配（国造制・評制・大宰府統括）と、記紀神話への地方伝承の統合プロセスを通じて、中央の王権物語と地方の有力聖地が双方向に結びつけられた。",
    independence:
      "各地域の巨石古墳・山城・火山火口・渓谷磐座は、本来それぞれの地域社会の首長祭祀や軍事防衛・自然崇拝として独立に機能していた空間である。",
    alternativeExplanation:
      "現地に残る神功皇后伝承や神代降臨伝承の多くは、古代の出来事の直接記憶というだけでなく、中世〜近世の社寺が朝廷・武家からの保護や権威を獲得するために記紀の物語を自社の地形・古墳へ接続（付会・再解釈）した歴史的産物として読むことで、より立体的に理解できる。",
  },
  {
    id: "comp-ancient-production-administrative-corridors",
    title: "古代先端生産拠点（須恵器・製鉄・青銅器）と地方官衙・舟運回廊の地域間比較",
    regions: [
      "粕屋・須恵（阿恵官衙・須恵器窯跡群）",
      "春日（奴国・須玖岡本・青銅器鋳造）",
      "糸島（伊都国・三雲南小路・泊製品）",
      "朝倉（平塚川添・多重環濠・物流）",
    ],
    commonality:
      "いずれも古代北部九州における渡来系先端技術（青銅器鋳造・鉄器加工・朝鮮半島系工人による須恵器焼成）の生産・集積拠点であり、河川舟運（須恵川・多々良川・御笠川・筑後川）や港湾を通じて中央政権・大宰府前身機構・海外と結ばれ、後背地の首長墳墓や地方官衙（郡衙・評衙）の成立基盤となった。",
    difference:
      "春日（奴国）と糸島（伊都国）は弥生中期〜古墳前期の青銅器・鉄器受容および王墓（須玖岡本・三雲南小路）に特徴づけられる初期政治拠点であるのに対し、粕屋・須恵は古墳中期（5世紀）以降の朝鮮半島陶質土器直系の大型登窯群（須恵器一大生産地）として発展し、7世紀後半には「評造」刻銘鐘や阿恵官衙に代表される律令官衙機構へ直結した。朝倉は筑後川流域の平野部多重環濠集落から後代の朝倉橘広庭宮・秋月へと至る水陸交通の要衝として機能した。",
    chronology:
      "弥生中〜後期の青銅器鋳造（奴国・伊都国）が先行し、5世紀代に須恵町周辺で須恵器生産（窯跡群）が急成長、7世紀後半〜8世紀（白村江敗戦後）に大宰府政庁・水城の防衛網とともに阿恵官衙・評造（かすやのこおりのみやつこ）鐘の官衙ネットワークが確立した。中近世には須恵器生産は途絶し、江戸後期（18世紀末）に福岡藩磁器政策として「須恵焼」が再興された。",
    contactPossibility:
      "博多湾岸・多々良川水系・御笠川水系は近接しており、朝鮮半島からの渡来系工人集団（陶工・鍛冶・冶金技術者）の招聘・配置を大和王権および筑紫の在地首長（筑紫君・阿曇氏・粕屋屯倉系勢力）が主導・再編した直接的な交流・配置経路が存在する。",
    independence:
      "丘陵地の良質な粘土・豊富な燃料薪材・斜面地形（須恵器登窯の適地）や、扇状地の砂鉄・河川舟運の便など、特定産業に必要な自然地形条件に応じた自律的立地選択が各地で見られる。",
    alternativeExplanation:
      "須恵町の地名由来となる古代須恵器と、江戸後期の福岡藩窯「須恵焼」は同じ窯業であるが歴史的・技術的断絶があり、江戸須恵焼を古代須恵器の直接の連続と見なす言説は近世・近代の地域顕彰による意味づけである。また阿恵官衙が古代粕屋郡衙の正倉・庁舎群であることは考古学的に確定しているが、鐘銘の「評造」と阿恵官衙の直接の同一建物比定には文献・考古双方の慎重な史料批判を要する。",
  },
  {
    id: "comp-mountain-sanctuary-and-lowland-shrine",
    title: "山岳神体山（修験・神楽）と山麓社殿・現代宗教景観の重層比較",
    regions: [
      "粕屋・若杉山（太祖神社下宮・若杉奥之院・宝満神宮寺）",
      "太宰府・宝満山（竈門神社・宝満修験）",
      "国東・両子山（両子寺・六郷満山）",
      "安芸・弥山（厳島神社・御山神社）",
    ],
    commonality:
      "いずれも独立峰・霊峰（若杉山・宝満山・両子山・弥山）を山岳信仰・水源祭祀・神体山の本源とし、中腹から山頂にかけて巨岩磐座・行場・奥之院が展開し、山麓に里宮（太祖神社下宮・竈門神社下宮・厳島神社社殿）を配する重層的な景観構造を持つ。",
    difference:
      "宝満山や国東両子山・弥山が古代から中世にかけての律令国家祭祀や寺社修験組織を母体として継続してきたのに対し、若杉山周辺では古代の山岳・水源祭祀や奥之院の信仰を基盤としつつ、平成期（1994年開創）の宝満神宮寺のように現代になって新たに建立された神仏習合寺院も共存している点に重層的な特徴がある。",
    chronology:
      "古代の山岳・水源・磐座祭祀（古墳〜奈良期以前）が先行し、平安〜鎌倉期に修験道・神仏習合が浸透（中世〜近世に太祖神楽や宝満修験講が定着）。明治期の神仏分離で廃寺・社格整理を経た後、若杉山周辺では昭和〜平成期にかけて民間信仰や新たな神仏習合堂宇も建立された。",
    contactPossibility:
      "英彦山・宝満山・若杉山を結ぶ筑前・豊前の山伏修験道ネットワークが存在し、峯入りや行場巡礼を通じて儀礼・神楽・本尊観念が相互に交流・伝播した歴史的経路が確認できる。",
    independence:
      "平野部から仰ぎ見る秀麗な山容（若杉山・宝満山・弥山）や水源の森に対する畏怖と水神・農耕神祭祀は、修験道の教義流入以前から各地の在地農民・生活者によって独立に発生・維持されてきた基底層である。",
    alternativeExplanation:
      "現代の若杉山麓に見られる宝満神宮寺などの堂宇は、1994年以降に建立された現代の宗教活動であり、古代〜中世の修験道遺構とは時代区分・成立背景を明確に区分して景観分析を行う必要がある。",
  },
  {
    id: "comp-kanmon-strait-and-hakata-bay",
    title: "関門海峡（門司） vs 博多湾・玄界灘・瀬戸内海の海上祭祀・海峡景観比較",
    regions: [
      "門司・関門海峡（和布刈・甲宗八幡・戸上・淡島）",
      "博多湾・志賀島（志賀海神社）",
      "宗像・玄界灘（宗像大社三宮）",
      "安芸・厳島／備後・鞆の浦（沼名前神社）",
    ],
    commonality:
      "いずれも激しい潮流や航路上の要衝（早鞆の瀬戸・志賀島海峡・玄界灘響灘・鞆の浦潮待ち）を掌握するための海神祭祀・潮待ち津を中核とし、海人族（阿曇・宗像）の伝承や神功皇后帰還伝承が重層する。",
    difference:
      "博多湾（志賀島）や宗像が遣唐使・対外使節の航行安全祈願や沖ノ島祭祀遺跡など古代国家祭祀の直接遺構を中核とするのに対し、関門海峡（門司）は潮流が極めて狭小な水道に集中するため、海峡そのものに対峙する和布刈神事や、中世門司関の土地支配文書（甲宗八幡宮）、海中漂着神像から山頂修験へ登攀する戸上山など、狭隘な海峡地勢と中世武家・修験の多重構造が際立つ。",
    chronology:
      "古代の自然潮流祭祀・海人族活動が先行し、奈良期に律令祭祀（和布刈神事・大祓詞・甲宗八幡）、中世に門司関六ヶ郷土地支配と英彦山修験山伏、近世に細川・小笠原両藩主による祈祷所再編・大里宿場参勤交代祈願所が重層した。",
    contactPossibility:
      "瀬戸内海から関門海峡を経て玄界灘・響灘に至る古代内海・外海航路の結節点として、阿曇磯良の潮珠伝承や神功皇后伝承、足利尊氏の東上経路などが相互に連関している。",
    independence:
      "早鞆の瀬戸の激流（最大9ノット超）に対する畏怖や、戸上山の独立峰山容に対する山岳信仰は、中央神話の移入以前から関門海峡の在地生活者によって独立に維持されてきた基底層である。",
    alternativeExplanation:
      "甲宗八幡宮の宗像三女神合祀や戸上神社の明治期祭神改変（イザナギ・イザナミ・天御中主神）は、古層の海峡掌握・海中神像信仰の上に、後世の国家神道・記紀神話体系が上書きされた重層的結果として捉える必要がある。",
  },
];

/**
 * 史料種別横断の「異伝・史料層比較（史料A vs 史料B vs 史料C）」データ定義
 * 古代基礎史料・考古（史料A）と、中近世の社伝・縁起（史料B）、近世〜近代の古史古伝・要検証文献（史料C）が
 * 同じテーマをどのように異なる層で語っているかを混同せずに比較する。
 */
export const SOURCE_TRADITION_COMPARISON_ENTRIES: readonly SourceTraditionComparisonEntry[] = [
  {
    id: "trad-comp-azumi-isora-marine",
    title: "海神（綿津見）と「安曇磯良（あずみのいそら）」伝承の史料層比較",
    targetTheme: "志賀海神社・高良大社・対馬和多都美神社・八幡信仰をめぐる海人族伝承",
    categoryABedrock: {
      sources: "『古事記』『日本書紀』（712/720年）・『肥前国風土記』・『延喜式』神名帳（927年）・志賀島金印",
      statement:
        "伊弉諾尊の禊祓から生じた「綿津見三神（底津・仲津・表津綿津見神）」を阿曇連（安曇氏）が祖神として奉斎し、筑紫の志賀神（志賀海神社）が名神大社に列する。ただし記紀・風土記・延喜式の古代基礎史料には「安曇磯良（磯良丸）」という人物・神名や干珠満珠による新羅征討先導譚は一切登場しない。",
      certaintyTier: "A",
    },
    categoryBTradition: {
      sources: "『八幡愚童訓』（鎌倉後期）・『太平記』（南北朝期）・『高良玉垂宮神秘書』（室町末期）",
      statement:
        "神功皇后の三韓出兵に際し、海底に棲み顔に牡蠣や藻が付着した海神「安曇磯良（阿度部磯良）」を常陸鹿島または筑前志賀島で御神楽（細男舞）によって招き出し、龍宮から「干珠・満珠」を借り受けて勝利したとする物語が展開。さらに『高良玉垂宮神秘書』では高良大明神（藤大臣）＝安曇磯良＝住吉明神とする高度な習合神学が説かれる。",
      certaintyTier: "B",
    },
    categoryCContested: {
      sources: "近世〜近代の超古代海人王朝論・一部の古史古伝系解釈",
      statement:
        "安曇磯良を縄文・弥生期の「超古代海人王朝の实在君主」や「ユダヤ・大陸渡来秘史の隠語」とみなし、中世縁起の記述をそのまま紀元前〜古墳時代の政治史実として直結させる主張。",
      certaintyTier: "D",
    },
    handlingPrinciple:
      "【分離原則】古代（記紀・延喜式）における「阿曇氏と綿津見三神の奉斎（史料A・確度A）」と、鎌倉〜室町期の蒙古襲来・八幡信仰・芸能（細男舞）の中で形成された「安曇磯良・干珠満珠物語（史料B・確度B）」を明確に時代層で分け、中世の縁起をそのまま古代の事実へ遡及させない。",
  },
  {
    id: "trad-comp-three-goddesses-hime",
    title: "宗像三女神・宇佐比売大神・厳島神・瀬織津姫をめぐる史料層比較",
    targetTheme: "宗像・宇佐・厳島・六甲等の水神・女神の同定と秘神伝承",
    categoryABedrock: {
      sources: "『古事記』『日本書紀』・『続日本紀』・『日本後紀』（811年）・『延喜式』（927年）・沖ノ島祭祀遺跡",
      statement:
        "記紀では誓約により生じた三女神を胸形君（宗像氏）が奉斎すると明記し、沖ノ島で4〜9世紀の国家祭祀遺構が確認される。一方、宇佐は『続日本紀』『延喜式』で「比売神社（比売大神）」、厳島は『日本後紀』『延喜式』で「伊都岐嶋神」と記され、大祓詞（延喜式祝詞）には祓戸四神の一柱として「瀬織津比売」が記される（記紀本文には不記載）。",
      certaintyTier: "A",
    },
    categoryBTradition: {
      sources: "『八幡宇佐宮御託宣集』（鎌倉後期）・中近世の厳島社伝・『筑前国続風土記』",
      statement:
        "平安後期〜中世の神仏習合・記紀神話への統合過程で、宇佐の比売大神や安芸の伊都岐嶋神が「宗像三女神と同一（または市杵島姫命）」として体系化され、さらに本地垂迹説により市杵島姫命＝弁才天（厳島弁天）・宇佐若宮等として全国へ勧請された。",
      certaintyTier: "B",
    },
    categoryCContested: {
      sources: "『ホツマツタヱ』（江戸後期写本初出）および現代の秘神抹消説",
      statement:
        "『ホツマツタヱ』で天照大神（男神設定）の正后を「セオリツヒメホノコ」とし、宗像三女神や全国の比売神・弁才天はすべて「持統天皇・藤原不比等によって歴史から抹殺・封印された瀬織津姫（または卑弥呼）の偽装名である」と一元的に断定する言説。",
      certaintyTier: "D",
    },
    handlingPrinciple:
      "【分離原則】古代史料上の個別神名（宗像三女神・宇佐比売大神・安芸伊都岐嶋神・大祓詞の瀬織津比売：史料A）と、中世の三女神同定・弁才天習合（史料B）、近世以降の『ホツマツタヱ』や現代スピリチュアル言説による一括同一視（史料C）を混同せず、各時代の神学・受容史として層別に記録する。",
  },
  {
    id: "trad-comp-izumo-miwa-chikusbi",
    title: "出雲・大和三輪・筑紫（朝倉）の大己貴（大国主）系譜と超古代王朝論の史料層比較",
    targetTheme: "出雲大社・大神神社（三輪山）・朝倉大己貴神社を結ぶ国津神ネットワーク",
    categoryABedrock: {
      sources: "『古事記』『日本書紀』・『出雲国風土記』（733年）・『延喜式』神名帳・三輪山祭祀遺跡・出雲大社境内巨大柱遺構",
      statement:
        "『出雲国風土記』では「所造天下大神大穴持命（おおなもちのみこと）」と杵築大社が中心であり、記紀では大国主神（大己貴神）の国譲りと三輪山の大物主神奉斎（大田田根子）が語られる。また『延喜式』神名帳では筑前国夜須郡に「於保奈牟智神社（大己貴神社）」が記載され、古代に大己貴信仰が筑紫にも存在したことが確認できる。",
      certaintyTier: "A",
    },
    categoryBTradition: {
      sources: "大己貴神社（朝倉）社伝・『日本書紀』神功皇后紀接続伝承・中近世の出雲国造家伝",
      statement:
        "朝倉の大己貴神社社伝では、神功皇后が三韓征伐に際して大己貴命・事代主命（または大三輪神）を祀り軍勢が集まったことから「日本最古の大三輪社」と伝える。また中世には両部神道（三輪流神道）や鰐淵寺との習合により独自の縁起が編まれた。",
      certaintyTier: "B",
    },
    categoryCContested: {
      sources: "『上記（ウエツフミ）』（天保年間／1830年代出現）・『竹内文書』（近代公開）等の古史古伝",
      statement:
        "『上記』や『竹内文書』に基づき、ウガヤフキアエズ朝数十代や超古代の世界統治王朝が実在し、神代文字で記された原典が太古から伝わったとする主張。",
      certaintyTier: "D",
    },
    handlingPrinciple:
      "【分離原則】筑前朝倉・大和三輪・出雲杵築に『延喜式』段階で大己貴・大物主系の神社が分布する事実（史料A・確度A）や地名一致現象に基づく東遷・勧請仮説（確度C）と、江戸後期〜近代に作られた『上記』『竹内文書』（史料C）の超古代王朝記述は厳密に区別する。",
  },
  {
    id: "trad-comp-takachiho-aso-scripts",
    title: "日向高千穂・阿蘇の降臨開拓神話と「神代文字・古史古伝」の史料層比較",
    targetTheme: "高千穂・阿蘇・霧島をめぐる天孫降臨比定地と奉納文献の評価",
    categoryABedrock: {
      sources: "『古事記』『日本書紀』・『日向国風土記』逸文・『隋書』倭国伝（636年）・『続日本後紀』・『延喜式』",
      statement:
        "記紀・風土記逸文に「日向の高千穂の久士布流多気（二上峯）」への天孫降臨が記され、『隋書』倭国伝に阿蘇山の噴火と祷祭、『延喜式』に肥後国阿蘇郡「健磐龍命神社」が記載される。なお考古学・言語学上、8世紀以前の日本列島で漢字伝来前に固有の音素文字（神代文字）が実用されていた同時代物証は確認されていない。",
      certaintyTier: "A",
    },
    categoryBTradition: {
      sources: "『阿蘇家伝』・中世の高千穂十社大明神縁起・近世の国学者による高千穂比定論（本居宣長等）",
      statement:
        "中世に阿蘇大宮司家や高千穂の三田井氏のもとで健磐龍命の開拓神話・鬼八退治伝承・十社大明神信仰が体系化され、近世には臼杵郡高千穂町と霧島山高千穂峰のどちらが記紀の降臨地かをめぐる考証が深まった。",
      certaintyTier: "B",
    },
    categoryCContested: {
      sources: "『宮下文書（富士古文書）』・対馬や諸社に近世奉納された阿比留文字（神代文字）資料",
      statement:
        "神代文字（阿比留文字・豊国文字等）で書かれた奉納文や『宮下文書』等を根拠に、高千穂・阿蘇・富士山を結ぶ超古代王朝の文字記録が残存しているとする主張。",
      certaintyTier: "D",
    },
    handlingPrinciple:
      "【分離原則】高千穂と霧島の比定地論争は古典解釈・歴史地理学上の有力仮説の並置（確度C）として扱い、近世以降に奉納・創作された神代文字資料や『宮下文書』（史料C）は「近世・近代の復古神道・民間思想史の資料」としてのみ記録し、古代史実の根拠には用いない。",
  },
];

function normalizeNameForMatch(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s・（）()「」『』]/g, "")
    .replace(/嚴/g, "厳")
    .toLowerCase();
}

/**
 * スポット情報（ID・名称・地域）から該当する祭祀史7項目プロファイルを解決する
 * 【厳格なエンティティ解決規約】
 * 1. targetSpotIds による完全ID一致を最優先する。
 * 2. 名称照合は正規化後の完全一致（===）のみを許可する。部分一致（includes）は同名・同字の誤認汚染を防ぐため禁止。
 * 3. プロファイルに targetRegion が定義されており、スポットに region がある場合、地域スコープが合致することを確認する。
 */
export function resolveSpotStratigraphyProfile(spot: {
  id?: string;
  name: string;
  region?: string;
}): SacredSiteStratigraphyProfile | undefined {
  if (spot.id) {
    const matchedById = SACRED_SITE_STRATIGRAPHY_PROFILES.find((profile) =>
      profile.targetSpotIds?.includes(spot.id!),
    );
    if (matchedById) return matchedById;
  }

  const normalizedSpotName = normalizeNameForMatch(spot.name);
  if (!normalizedSpotName) return undefined;

  const normalizedSpotRegion = spot.region
    ? normalizeNameForMatch(spot.region)
    : undefined;

  return SACRED_SITE_STRATIGRAPHY_PROFILES.find((profile) => {
    // 地域スコープガード：プロファイルに地域が指定されている場合、スポット地域と不一致なら除外
    if (profile.targetRegion && normalizedSpotRegion) {
      const normalizedTargetRegion = normalizeNameForMatch(profile.targetRegion);
      const regionMatches =
        normalizedSpotRegion.includes(normalizedTargetRegion) ||
        normalizedTargetRegion.includes(normalizedSpotRegion);
      if (!regionMatches) {
        return false;
      }
    }

    return profile.spotNames.some((candidate) => {
      const normalizedCandidate = normalizeNameForMatch(candidate);
      return normalizedSpotName === normalizedCandidate;
    });
  });
}

/**
 * スポットがプロファイルの「主座（一次判定対象）」であるかを判定する。
 * - primarySpotIds が定義されている場合：spot.id が含まれるかを最優先。
 * - spot.id が無く spot.name がある場合：primarySpotNames との完全一致を検証。
 * - いずれも未定義の場合：targetSpotIds の先頭要素または単一要素を主座とみなす。
 *
 * 【二層分離アーキテクチャの役割】
 * - 地層判定（Stratum Matching）：主座以外の構成スポット（斎宮跡、審神者社、六所宮跡、奥宮磐座、山頂、寺院等）が
 *   主座の広域5層通史プロファイル（Section 2）を不当に継承（汚染）するのを防ぎ、
 *   スポット固有の物証（Claims, Kind, Tokens）に基づいた客観的層数を算出する。
 * - 背景解説（Context Profile）：UIでのスポット選択時には、構成スポットであっても
 *   所属する聖域群の祭祀史プロファイルカード（7項目）を引き続き参照・読解できる。
 */
export function isPrimarySiteForStratigraphy(
  spot: { id?: string; name: string },
  profile: SacredSiteStratigraphyProfile,
): boolean {
  if (profile.primarySpotIds && profile.primarySpotIds.length > 0) {
    if (spot.id && profile.primarySpotIds.includes(spot.id)) {
      return true;
    }
  }

  if (profile.primarySpotId) {
    if (spot.id && spot.id === profile.primarySpotId) {
      return true;
    }
  }

  // IDで判定できない場合（ID未指定のスポット等）、主座名称リストと正規化完全一致で検証
  if (profile.primarySpotNames && profile.primarySpotNames.length > 0) {
    const normalizedSpotName = normalizeNameForMatch(spot.name);
    if (normalizedSpotName) {
      const nameMatches = profile.primarySpotNames.some(
        (pn) => normalizeNameForMatch(pn) === normalizedSpotName,
      );
      if (nameMatches) return true;
    }
  }

  // primarySpotIds も primarySpotNames も指定されていない場合の安全なフォールバック
  if (
    !profile.primarySpotIds?.length &&
    !profile.primarySpotId &&
    !profile.primarySpotNames?.length
  ) {
    if (!profile.targetSpotIds || profile.targetSpotIds.length <= 1) {
      return true;
    }
    if (spot.id) {
      return spot.id === profile.targetSpotIds[0];
    }
    const normalizedSpotName = normalizeNameForMatch(spot.name);
    return normalizeNameForMatch(profile.spotNames[0] ?? "") === normalizedSpotName;
  }

  return false;
}



