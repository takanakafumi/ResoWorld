import type { SacredSiteStratigraphyProfile } from "../source-evaluation";

/**
 * 豊前国東・中南九州・玄界離島・瀬戸内・出雲・奈良エリアの祭祀史7項目プロファイル
 */
export const KYUSHU_WIDE_WESTERN_JAPAN_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
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
];
