import type { SacredSiteStratigraphyProfile } from "../source-evaluation";

/**
 * 福岡・博多湾・筑紫野・宇美・大野城・太宰府エリアの祭祀史7項目プロファイル
 */
export const FUKUOKA_CHIKUSHI_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
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
    primarySpotIds: ["spot-sumiyoshi-jinja-fukuoka"],
    primarySpotNames: [
      "筑前國一宮 住吉神社",
      "筑前一之宮 住吉神社",
      "博多住吉神社",
    ],
    targetSpotIds: ["spot-sumiyoshi-jinja-fukuoka", "spot-sumiyoshi-hakata", "spot-sumiyoshi-taisha", "spot-arahito-jinja"],
    targetRegion: "福岡",
    spotNames: [
      "住吉神社",
      "筑前国一宮 住吉神社",
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
        "基肄山（古代山城・基肄城跡）と牛頸山系に挟まれた狭隘な鞍部・峠地形。筑前肥前国境の険しい坂において人の命を尽くす峠の荒ぶる神を鎮める原初境界祭祀の天然回廊。",
      features: [
        "原田峠（筑前・肥前国境の峠地形・地政学的要衝）",
        "基肄城（古代山城）直下の交通回廊",
        "境の坂の荒ぶる神（社殿以前の原初境界祭祀）",
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
  {
    id: "stratigraphy-enoki-sha",
    primarySpotIds: ["spot-enoki-sha"],
    primarySpotNames: ["榎社（府の南館・神幸式御旅所）"],
    targetSpotIds: ["spot-enoki-sha"],
    targetRegion: "太宰府",
    spotNames: ["榎社", "榎社（府の南館・神幸式御旅所）", "府の南館", "榎社御旅所"],
    title: "榎社（府の南館・神幸式御旅所） 祭祀景観の層構造",
    summary:
      "古代大宰府の高級官人官舎「府の南館」跡を基層とし、延喜元年（901年）の菅原道真謫居（配流地）を経て聖地化され、康和3年（1101年）大江匡房創始の神幸式大祭において御神輿が渡御する行宮（御旅所）へと発展した空間変遷の典型。境内には道真を支えた浄妙尼の小祠（梅ヶ枝餅伝承）や神輿休石（二つの加工石台）が現存し、官衙官舎から御霊信仰・地域祭礼への用途転換と重層性を物語る。",
    currentDeities: "菅原道真公（配流時謫居）・浄妙尼（配祀）",
    claimedOrigin: {
      statement:
        "延喜元年（901年）に大宰権帥として左遷された菅原道真が、大宰府政庁近隣の官舎「府の南館」に謫居させられ、延喜3年（903年）に薨去するまでの2年間を過ごした地とされる伝承。道真に餅を差し出し給仕した浄妙尼の故事（梅ヶ枝餅の起源譚）を伝える。",
      sourceTitle: "『菅家御伝記』・榎社由緒碑・福岡県無形民俗文化財調書",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "平安中期〜中世",
        extantManuscriptEra: "近世・近代文書",
        targetEra: "延喜元年（901年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『日本紀略』延喜元年（901年）正月25日条に道真大宰員外帥左遷の記述。康和3年（1101年）大宰権帥大江匡房による神幸式大祭創始記録、および榎社を行宮（御旅所）として神輿が渡御し一泊する祭礼動線の成立が中世公私記録・天満宮古文書で確認される。",
      sourceTitle: "『日本紀略』・『太宰府天満宮神幸記』・『安楽寺年中行事記』",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "平安末期（1101年）〜鎌倉期",
        extantManuscriptEra: "古文書群",
        targetEra: "10〜12世紀",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "近世に整備された榎社社殿、浄妙尼小祠、神幸祭における神輿安置用とされるしめ縄付きの二つの加工石台が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代律令期（8〜9世紀）",
        description:
          "大宰府条坊の西南部官衙地域に位置する高級官人官舎「府の南館」として機能。",
        certaintyTier: "A",
      },
      {
        era: "延喜元年〜3年（901〜903年）",
        description:
          "菅原道真が大宰権帥として左遷され、府の南館を謫居（幽閉に近い住居）として2年間生活し薨去。",
        certaintyTier: "A",
      },
      {
        era: "平安末期（康和3年・1101年）",
        description:
          "大宰権帥・大江匡房により神幸式大祭が創始。道真生前の謫居地である府の南館跡（榎社）を御旅所（行宮）と定め、天満宮本殿から神輿が下向して一泊する御霊慰撫の渡御儀礼が成立。",
        certaintyTier: "A",
      },
      {
        era: "中世〜近世",
        description:
          "安楽寺天満宮神幸式の定着に伴い榎社として社殿が維持され、道真を支えた浄妙尼小祠や梅ヶ枝餅信仰が民俗化。",
        certaintyTier: "A",
      },
      {
        era: "現代",
        description:
          "太宰府天満宮秋季神幸式大祭（福岡県指定無形民俗文化財）の行宮として、毎年9月に神輿行列を迎える祭礼動線が900年以上にわたり現役で継承。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "府の南館跡とされる境内社叢、榎社社殿、浄妙尼社小祠、神幸祭の神輿休石（二つの加工石台）、周囲の古代条坊・政庁西端遺構。",
      features: [
        "榎社社殿",
        "浄妙尼小祠（梅ヶ枝餅伝承）",
        "神輿休石（二つの加工石台）",
        "府の南館跡社叢",
        "大宰府条坊近接遺構",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: [
        "菅原氏（道真）",
        "大江氏（匡房）",
        "大宰府官人層",
        "太宰府天満宮神人・氏子集団",
      ],
      routeAndPoliticalContext:
        "大宰府政庁・客館から南西に位置する古代官衙宿舎地帯。1101年以降は天満宮本殿と榎社を結ぶ神幸式渡御ルート（御旅所・行宮）として御霊信仰の空間的動線を形成。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
    formationAnalysis: {
      meaningOrigin:
        "古代国家官舎「府の南館」が道真謫居地を経て御霊慰撫の行宮（御旅所）へ転換",
      elementsIntroduction:
        "8〜9世紀官舎、901年道真謫居、浄妙尼給仕、1101年大江匡房神幸式創始、近世社殿・浄妙尼祠、現代県無形民俗文化財",
      historicalRelation:
        "国家統治・外交官衙の空間が、平安御霊信仰の勃興と900年超の祭礼実践によって神聖な御旅所へと用途転換・重層化",
      presentationMethod:
        "榎社社殿、浄妙尼小祠、加工石台（神輿休石）、神幸式案内板",
      ritualPracticeOrigin:
        "1101年創始の神幸式大祭（9月）における神輿渡御・行宮一夜滞在および浄妙尼への感謝神事",
      spatialExperience:
        "大宰府政庁跡南西の静かな集落内に残る社叢、神輿休石としめ縄が醸し出す神聖な行宮空間",
      formationVisibility:
        "社殿・浄妙尼祠・加工石台と秋の神幸祭継承により、官衙から御霊信仰への劇的な地層転換が開示",
    },
  },
];
