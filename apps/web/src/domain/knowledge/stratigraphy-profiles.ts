import type { SacredSiteStratigraphyProfile } from "./source-evaluation";

/**
 * 代表的な重層聖域スポットの「祭祀史7項目（Sacred Site Stratigraphy Profile）」定義
 * - 「現在の祭神・社伝の主張（史料B/C・確度B）」と「考古・古代基礎史料で確認できる基底層（史料A・確度A）」を明確に分離して保持する。
 */
export const SACRED_SITE_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
  {
    id: "stratigraphy-munakata-okinoshima",
    spotNames: [
      "宗像大社",
      "宗像大社（辺津宮）",
      "宗像大社 辺津宮",
      "沖ノ島",
      "宗像大社 沖津宮",
      "沖津宮",
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
  },
  {
    id: "stratigraphy-shikaumi-jinja",
    spotNames: ["志賀海神社", "志賀島", "勝馬・沖津宮（志賀海神社摂社）"],
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
  },
  {
    id: "stratigraphy-itsukushima-misen",
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
  },
  {
    id: "stratigraphy-usa-omoto",
    spotNames: ["宇佐神宮", "御許山", "大元神社"],
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
 * スポット情報（IDまたは名称）から該当する祭祀史7項目プロファイルを解決する
 */
export function resolveSpotStratigraphyProfile(spot: {
  id?: string;
  name: string;
}): SacredSiteStratigraphyProfile | undefined {
  const normalizedSpotName = normalizeNameForMatch(spot.name);
  if (!normalizedSpotName) return undefined;

  return SACRED_SITE_STRATIGRAPHY_PROFILES.find((profile) =>
    profile.spotNames.some((candidate) => {
      const normalizedCandidate = normalizeNameForMatch(candidate);
      return (
        normalizedSpotName === normalizedCandidate ||
        normalizedSpotName.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedSpotName)
      );
    }),
  );
}
