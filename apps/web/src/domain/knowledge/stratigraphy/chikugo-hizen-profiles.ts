import type { SacredSiteStratigraphyProfile } from "../source-evaluation";

/**
 * 筑後（久留米・八女）・肥前（佐賀・長崎）エリアの祭祀史7項目プロファイル
 */
export const CHIKUGO_HIZEN_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
  {
    id: "stratigraphy-kora-taisha",
    primarySpotIds: ["spot-kora-taisha"],
    primarySpotNames: ["高良大社", "筑後国一の宮 高良大社", "高良山", "高良玉垂宮"],
    targetSpotIds: ["spot-kora-taisha"],
    targetRegion: "久留米",
    spotNames: ["高良大社", "高良山", "高良山神籠石", "高良玉垂宮"],
    title: "高良大社・高良山神籠石 祭祀景観の層構造",
    summary:
      "筑後川中流域を見下ろす高良山に鎮座する筑後国一宮・式内名神大社。山麓の前期首長墓（祇園山古墳）、山腹を取り巻く7世紀後半の古代山城「高良山神籠石」（考古物証：確度A）、878年史料初見の地主神・高樹神、中近世の天台宗二十六ヶ寺・三百六十坊、1660年有馬頼利寄進の権現造社殿と1869年神仏分離による破壊・転用痕跡（八葉石記手水舎水盤）が重層する。",
    currentDeities:
      "正殿：高良玉垂命、左殿：八幡大神、右殿：住吉大神（相殿合祀：豊比咩命）",
    claimedOrigin: {
      statement:
        "社伝では履中天皇元年（400年）創建と伝え、高良玉垂命が神功皇后の三韓出兵時に干珠・満珠を奉じて先鋒を務め、高良山に鎮座したとする。また中世末期古縁起では、高良山（旧名・高牟礼山）の元の地主神・高樹神が一夜の宿を貸したところ、高良神が神籠石（八葉の石畳）で結界を張り鎮座したという借宿伝承を伝える。",
      sourceTitle: "『高良玉垂宮神秘書』『高良記』（中世末期成立）・高良大社社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "室町〜戦国期（『高良玉垂宮神秘書』『高良記』）",
        targetEra: "神功皇后伝承期〜履中天皇元年（400年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『続日本後紀』承和7年（840年）条の神階授与記事が確実な文献初見で、斉衡3年（856年）筑後国符写に大祝系・物部大継の名が見え、元慶2年（878年）『日本三代実録』に高樹神従五位上、『延喜式』神名帳（927年）で筑後国三井郡「高良玉垂命神社 名神大」として記載される。山腹の「高良山神籠石」（確認延長約1.6km・巨石1,300余、推定全長約4km）は678年筑紫国地震以前の7世紀後半古代山城説が有力である。",
      sourceTitle: "『続日本後紀』『日本三代実録』『延喜式』神名帳・856年筑後国符写・高良山神籠石調査",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "869年『続日本後紀』／901年『日本三代実録』／927年『延喜式』",
        extantManuscriptEra: "平安〜近世写本・現地列石遺構現存",
        targetEra: "飛鳥時代（7世紀後半）〜平安時代（9〜10世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "7世紀後半に神籠石（古代山城）が築かれ、遅くとも9世紀前半には山上の高良玉垂命神社が確立。現存する石造大鳥居は明暦元年（1655年・2代藩主有馬忠頼寄進）、国重要文化財の本殿・幣殿・拝殿は万治3年〜寛文元年（1660〜1661年・3代藩主有馬頼利寄進の権現造）であり、貞享2年（1685年）刻石の『高良山八葉石記』は明治2年（1869年）神仏分離で破壊され手水舎水盤へ転用された。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳〜飛鳥時代（山麓首長墓・7世紀後半神籠石）",
        description:
          "山麓に古墳前期方墳の祇園山古墳（箱式石棺・周囲62基）や礫山古墳（舟形石棺4基）が築かれ（高良大社創建・6世紀磐井より古く直結不可）、7世紀後半には延長推定約4kmの古代山城「高良山神籠石」が築造された。",
        certaintyTier: "A",
      },
      {
        era: "平安〜中世（筑後国一宮・天台宗二十六ヶ寺三百六十坊）",
        description:
          "9世紀以降の神階昇叙・式内名神大社・筑後国一宮としての確立と並行し、延暦寺末寺の蓮台院御井寺（高良山本坊）を中枢とする天台宗二十六ヶ寺・三百六十坊および奥の院（御廟所・毘沙門堂）の山岳修験空間へと発展した。",
        certaintyTier: "A",
      },
      {
        era: "江戸時代（有馬氏造営・八葉石記・久留米つつじ景観）",
        description:
          "久留米藩主有馬氏による1655年石造大鳥居・1660年権現造社殿・1676年本坊再建援助、1685年『高良山八葉石記』刻石、1792〜1836年頃の坂本元蔵らによる久留米つつじ2,000株以上の植栽、1802年『筑紫紀行』所載の勢比石など、現境内の主要景観が形成された。",
        certaintyTier: "A",
      },
      {
        era: "明治2年（1869年）神仏分離と祭神論争",
        description:
          "1869年神仏分離により二十六ヶ寺・徳川家光位牌安置の御霊社が廃絶され、八葉石記は手水舎水盤へ転用、奥の院毘沙門堂は水分神社へ改称された。主祭神・高良玉垂命の正体については武内宿禰・安曇磯良・物部氏・在地首長神の諸説が並立し単一比定は未確定。",
        certaintyTier: "B",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "耳納山地西端・標高312mの高良山体、山腹の「高良山神籠石」（確認延長約1.6km・巨石1,300余）、馬蹄石・勢比石・三井（大井・北井・西井）と三湧水（朝妻・岩井・徳間）、樹齢約400年の大樟・モウソウキンメイチク林・久留米つつじ群生地。",
      features: [
        "高良山神籠石（国指定史跡・7世紀後半古代山城）",
        "権現造本殿・幣殿・拝殿（1660年・国重文）と石造大鳥居（1655年）",
        "高良山八葉石記転用手水舎水盤（1685年刻石→1869年転用）",
        "祇園山古墳・礫山古墳（山麓古墳群）と奥の院・湧水",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["物部大継・鏡山家（856年高良大祝系、6世紀物部麁鹿火とは直結不可）", "高良三家・丹波氏", "草野氏・久留米藩有馬氏"],
      routeAndPoliticalContext:
        "有明海から筑後川を遡上する内陸水運と、大宰府から筑後国府・肥後方面へ南下する西海道官道が交差する戦略要衝。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-takagi-jinja-kurume",
    primarySpotIds: ["spot-takagi-jinja-kurume"],
    primarySpotNames: ["高樹神社", "高木神社", "久留米高樹神社", "高牟礼権現"],
    targetSpotIds: ["spot-takagi-jinja-kurume"],
    targetRegion: "久留米",
    spotNames: ["高樹神社", "高木神社", "高牟礼権現"],
    title: "高樹神社（高牟礼権現） 地主神伝承と古代神階の地層構造",
    summary:
      "高良大社一の鳥居〜二の鳥居間に鎮座する古社。元慶2年（878年）『日本三代実録』に筑後国「高樹神」従五位上と見える確実な古代史料層（確度A）と、高良山の旧名「高牟礼山」の地主神が一夜の宿を高良神に貸したという中世末期古縁起伝承（確度B）が重層する。ただし878年時点で現在の祭神・高皇産霊神と同一視されていたかは未確定として峻別する。",
    currentDeities: "高皇産霊神（旧称・高牟礼権現）",
    claimedOrigin: {
      statement:
        "高良山（旧名・高牟礼山）の本来の地主神であった高樹神が、高良の神に一夜の宿を貸したところ、高良の神が神籠石で結界を張り山上に鎮座したため元の地に戻れなくなり、山麓の現在地に鎮座したとする中世末期古縁起の借宿伝承。",
      sourceTitle: "高良山中世古縁起・現地由緒解説板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世末期（室町〜戦国期）",
        targetEra: "高良山鎮座以前の地主神伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "元慶2年（878年）10月13日条の『日本三代実録』に筑後国「高樹神」へ従五位上が授与された記事が確実な文献初見であり、天慶7年（944年）『筑後国内神名帳』では正五位下と記される。なお878年時点の「高樹神」が現在の祭神・高皇産霊神と同一であったかは史料上未確定である。",
      sourceTitle: "『日本三代実録』（878年）・『筑後国内神名帳』（944年）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "901年『日本三代実録』／944年『筑後国内神名帳』",
        extantManuscriptEra: "平安〜近世写本",
        targetEra: "平安時代前期（9〜10世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "9世紀後半には筑後国の国史現在社「高樹神」として朝廷から神階を授与されており、中世以降は高良山参道麓（一の鳥居〜二の鳥居間）にて旧名「高牟礼権現」として崇敬され、明治6年（1873年）に郷社となった。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "平安時代前期（878年〜944年）",
        description:
          "『日本三代実録』（878年）従五位上、『筑後国内神名帳』（944年）正五位下として記録される国史現在社段階。",
        certaintyTier: "A",
      },
      {
        era: "中世末期（地主神借宿伝承と高牟礼権現）",
        description:
          "高良山縁起の整備に伴い、高良神に先立つ地主神・高牟礼権現として物語化され、高良山神籠石の起源説話とも結び付けられた。",
        certaintyTier: "B",
      },
      {
        era: "明治期（神仏分離と祭神整理）",
        description:
          "「高牟礼権現」から高樹神社へ整理され、祭神を高皇産霊神（高木神）とする近代社格秩序へ移行した。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "高良山（旧称・高牟礼山）の西麓参道沿い・一の鳥居と二の鳥居の間に位置する山麓神域。",
      features: ["高良山麓参道立地（久留米市御井町121-1）", "地名「高牟礼」の残存", "高良大社・神籠石との対置関係"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["筑後国三井郡の在地祭祀層", "高良山社家・社僧"],
      routeAndPoliticalContext:
        "高良山への表参道入口を扼する位置にあり、山上の高良大社・神籠石と対になって「先住地主神と外来・後発神の交替」という聖域記憶を空間化している。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-ise-amaterasu-kurume",
    primarySpotIds: ["spot-ise-amaterasu-kurume"],
    primarySpotNames: ["伊勢天照御祖神社", "伊勢御祖神社", "御井町伊勢天照御祖神社"],
    targetSpotIds: ["spot-ise-amaterasu-kurume"],
    targetRegion: "久留米",
    spotNames: ["伊勢天照御祖神社", "伊勢御祖神社", "伊勢社"],
    title: "伊勢天照御祖神社 延喜式内社と1767年山中移転の地層構造",
    summary:
      "高良大社参道中腹に鎮座する筑後国三井郡の延喜式内小社（論社）。927年『延喜式』神名帳・944年『筑後国内神名帳』・1201年文書「伊勢社」という確実な古代・中世史料層（確度A）と、明和4年（1767年）の府中大火を契機とする山麓から現在地への移転・灯明祭の近世再編層（確度A）を併せ持つ。",
    currentDeities: "天照大神",
    claimedOrigin: {
      statement:
        "社伝では桓武天皇の延暦3年（784年）、筑後国司・藤原易興の奏請により伊勢国から勧請された筑後最古級の皇大神宮分祀と伝える。",
      sourceTitle: "伊勢天照御祖神社由緒・現地解説板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代由緒整理",
        targetEra: "奈良時代末期（延暦3年・784年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『延喜式』神名帳（927年）に筑後国三井郡の小社「伊勢天照御祖神社」として登載され、天慶7年（944年）『筑後国内神名帳』に正五位伊勢天照御祖明神、建仁元年（1201年）文書に「伊勢社」と確認される（なお久留米市大石町にも論社が存在する）。",
      sourceTitle: "『延喜式』神名帳（927年）・『筑後国内神名帳』（944年）・1201年文書",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "927年『延喜式』／944年『筑後国内神名帳』／1201年文書",
        extantManuscriptEra: "平安〜中世写本・文書",
        targetEra: "平安時代〜鎌倉時代初期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "室町末期絵図では山麓大鳥居北側（旧御井小学校「伊勢の井」付近）に描かれていたが、明和4年（1767年）の府中大火を機に高良山中腹の現在地へ移転し、灯明祭が成立した。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "平安〜鎌倉初期（延喜式内社・伊勢社）",
        description:
          "927年『延喜式』神名帳登載・944年『筑後国内神名帳』正五位・1201年文書「伊勢社」として筑後国府（府中）近傍に鎮座。",
        certaintyTier: "A",
      },
      {
        era: "江戸時代中期（1767年府中大火と高良山中腹移転）",
        description:
          "明和4年（1767年）の府中大火を契機に山麓「伊勢の井」付近から高良山参道中腹の現在地へ移転し、灯明祭および境内末社（八幡宮・天満宮）の現在配置が形成された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "高良大社表参道の二の鳥居〜三の鳥居間に位置する中腹社地（旧鎮座地は山麓「伊勢の井」付近）。",
      features: ["高良山参道中腹立地（久留米市御井町171-1）", "旧鎮座地伝承「伊勢の井」", "1767年府中大火後の移転社地"],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["筑後国司・府中町人層", "高良大社社家（境外末社管理）"],
      routeAndPoliticalContext:
        "筑後国府（府中）の都市災害（1767年大火）を契機に、国府・山麓の式内社が高良山参道空間へ組み込まれた近世空間再編の好例。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "reorganized",
  },
  {
    id: "stratigraphy-daizenji-tamataregu",
    primarySpotIds: ["spot-daizenji-tamataregu"],
    primarySpotNames: ["大善寺玉垂宮（旧大善寺）", "大善寺玉垂宮", "玉垂宮"],
    targetSpotIds: ["spot-daizenji-tamataregu"],
    targetRegion: "久留米",
    spotNames: ["大善寺玉垂宮（旧大善寺）", "大善寺玉垂宮", "玉垂宮", "旧大善寺"],
    title: "大善寺玉垂宮（旧大善寺） 神仏習合・神仏分離・民俗祭祀の重層構造",
    summary:
      "高良玉垂命を祀り、かつて神宮寺・高峰山大善寺（最盛期45僧坊・寺領3,000町）と一体化した神仏習合拠点。1868年神仏判然令による廃寺、1912年一本松集落の道祖神（幸神・陰陽石）合祀、1982年旧庫裏移築復元、1994年国重要無形民俗文化財指定の追儺火祭り「鬼夜」など、中世神仏習合と近現代の再編・地域民俗信仰が重なり合う。",
    currentDeities: "玉垂命（高良玉垂命）・八幡大神・住吉大神（境内合祀：幸神／道祖神）",
    claimedOrigin: {
      statement:
        "368年（仁徳天皇56年）、藤大臣が賊を討つために火を用いたことに追儺の火祭り「鬼夜」が由来すると伝える。",
      sourceTitle: "大善寺玉垂宮 現地解説板・社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中近世社伝・現地解説板",
        targetEra: "4世紀後半伝承期（伝承上の起源年と現行祭礼の成立は峻別）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "中世〜近世にかけて高峰山大善寺（最盛期45僧坊・3,000町）と一体化した神仏習合社寺として発展。1868年神仏判然令による廃寺と旧庫裏の学校転用・1982年移築復元、1912年幸神合祀、1954年県無形文化財・1994年国重要無形民俗文化財「鬼夜」指定が公的記録で確認される。",
      sourceTitle: "大善寺玉垂宮現地解説板・文化庁国重要無形民俗文化財記録",
      sourceCategory: "B",
      certaintyTier: "A",
      chronology: {
        compilationEra: "中世〜現代（1868年廃寺・1912年合祀・1982年移築復元・1994年国指定）",
        targetEra: "中世〜現代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "久留米市大善寺町宮本の筑後川下流側平野部に鎮座。近傍に5世紀後半〜6世紀前半の御塚古墳・権現塚古墳が立地するが、古墳築造と社寺成立の年代は切り分けて評価する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世〜近世（高峰山大善寺・神仏習合期）",
        description:
          "玉垂宮と神宮寺・大善寺（最盛期45僧坊・3,000町）が一体となり、1月7日夜の追儺火祭り「鬼夜」を含む神仏習合空間を形成。",
        certaintyTier: "B",
      },
      {
        era: "明治〜現代（1868年神仏判然令・1912年合祀・1982年旧庫裏復元）",
        description:
          "1868年の神仏判然令により大善寺は廃止。1912年に一本松集落の道祖神（幸神・陰陽石）が宮本集落氏神とともに合祀され、学校施設だった旧庫裏は1982年に移築復元された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "玉垂宮境内、1982年移築復元の旧大善寺庫裏、および1912年合祀の幸神（自然石の陰陽石）。",
      features: [
        "旧大善寺庫裏（1868年廃寺後に学校転用・1982年移築復元）",
        "大善寺玉垂宮の鬼夜（1994年国重要無形民俗文化財）",
        "幸神・陰陽石（1912年一本松集落より合祀された生殖・豊穣信仰の道祖神）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["高峰山大善寺社僧団", "久留米藩・大善寺地域共同体"],
      routeAndPoliticalContext:
        "筑後川下流平野と有明海交通圏に開かれた玉垂命信仰・神仏習合の重要拠点。高良大社と並ぶ玉垂命信仰の二大拠点として比較対象となる。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-yoshida-daijingu",
    primarySpotIds: ["spot-yoshida-daijingu"],
    primarySpotNames: ["吉田大神宮（松尾宮・大神宮跡）", "吉田大神宮", "松尾宮"],
    targetSpotIds: ["spot-yoshida-daijingu"],
    targetRegion: "八女",
    spotNames: ["吉田大神宮（松尾宮・大神宮跡）", "吉田大神宮", "松尾宮", "大神宮跡"],
    title: "吉田大神宮・松尾宮 古墳墳丘上に重層した中近世〜近代の祭祀再編",
    summary:
      "6世紀前半の筑紫君磐井墓・岩戸山古墳に隣接・重層して形成された後世の祭祀空間。1252年創建伝承の大松天満宮由来・鎌倉時代木造阿弥陀如来坐像（1925年合併移設）、1670年『寛文十年久留米藩社方開基』の「岩戸山 松尾大明神」、1700年銘の猿田彦大神石塔（庚申信仰）、1809年『岩戸山辞』・1813年野田成亮日記の天照大神勧請記録を保持する。",
    currentDeities: "天照大神・菅原道真（吉田大神宮）、大山咋命（前方部・松尾宮）",
    claimedOrigin: {
      statement:
        "1809年『岩戸山辞』では岩戸山を天照大神が日向へ降臨する際に滞在した場所とする伝承が記され、1813年修験者・野田成亮日記に山上への天照大神勧請が記録される。",
      sourceTitle: "『岩戸山辞』（1809年）・野田成亮日記（1813年）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "江戸時代後期（1809年・1813年）",
        targetEra: "近世に成立した神話的再解釈（6世紀古墳築造時の祭祀ではない）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "境内祇園社に1252年創建伝承の大松天満宮阿弥陀堂由来とされる鎌倉時代木造阿弥陀如来坐像が伝存。現地社地については1670年『寛文十年久留米藩社方開基』の「岩戸山 松尾大明神」と元禄13年（1700年）銘の猿田彦大神石塔（八女市指定有形民俗文化財）が確実な一次基準となる。",
      sourceTitle: "『寛文十年久留米藩社方開基』（1670年）・元禄13年猿田彦石塔（1700年）・鎌倉期阿弥陀如来坐像",
      sourceCategory: "B",
      certaintyTier: "A",
      chronology: {
        compilationEra: "鎌倉期（1252年伝承）〜江戸前期（1670年・1700年）",
        targetEra: "中世〜近世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "岩戸山古墳の前方部に松尾宮（大山咋命）、後円部に大神宮跡表示、南側境内に吉田大神宮社殿・猿田彦石塔・祇園社が配置され、古墳墳形と後世の祭祀空間が重層している。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "鎌倉時代（1252年創建伝承・木造阿弥陀如来坐像）",
        description:
          "近隣の大松天満宮阿弥陀堂に安置された鎌倉期木造阿弥陀如来坐像が後世に吉田大神宮境内へ引き継がれる。",
        certaintyTier: "B",
      },
      {
        era: "江戸時代（1670年松尾大明神・1700年猿田彦石塔・1809/1813年天照大神伝承）",
        description:
          "1670年久留米藩記録に「岩戸山 松尾大明神」、1700年に庚申信仰の猿田彦石塔が造立され、19世紀初頭までに岩戸山と天照大神・天の岩戸を結びつける伝承が定着した。",
        certaintyTier: "A",
      },
      {
        era: "大正〜現代（1925年大松天満宮合併）",
        description:
          "1925年に大松天満宮が吉田大神宮へ合併され、木造阿弥陀如来坐像が現在の祇園社へ移設された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "岩戸山古墳の墳丘（前方部・後円部）に重層する社地配置と、1700年銘猿田彦石塔・鎌倉期木造阿弥陀如来坐像。",
      features: [
        "前方部・松尾宮と後円部・大神宮跡（古墳墳形上の後世祭祀配置）",
        "元禄13年（1700年）銘猿田彦大神石塔（八女市指定有形民俗文化財）",
        "鎌倉期木造阿弥陀如来坐像（1925年大松天満宮合併により移設）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["久留米藩社家・修験者層", "八女吉田地域共同体"],
      routeAndPoliticalContext:
        "6世紀前半の筑紫君磐井の巨大前方後円墳が、江戸期以降に松尾大明神や天照大神・天の岩戸伝承の場として再解釈された、古墳と後世祭祀景観の典型事例。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-yasutake-hachimangu",
    primarySpotIds: ["spot-yasutake-hachimangu"],
    primarySpotNames: ["安武八幡神社（安武町本村八幡宮）", "安武八幡神社", "安武町本村八幡宮"],
    targetSpotIds: ["spot-yasutake-hachimangu"],
    targetRegion: "久留米",
    spotNames: ["安武八幡神社（安武町本村八幡宮）", "安武八幡神社", "安武町本村八幡宮"],
    title: "安武八幡神社 中世勧請・1870年高良山明静院本堂移築・大正合祀の重層構造",
    summary:
      "1460年天満宮創建・1466年住吉春日配祀・1547年安武淡路守による宇佐八幡宮勧請の由緒を持ち、明治3年（1870年）に神仏分離で廃寺となった高良山・明静院（妙常院）本堂を社殿として移築。龍・麒麟彫刻や有馬藩御用絵師・三谷主後の天井画154枚を伝え、大正初期の地域神社合祀（天満宮・祇園社・田中社）と境内社（諏訪神社・龍宮神社）を重ねる。",
    currentDeities: "八幡大神（応神天皇等）・天満宮・住吉・春日・祇園社・田中社（境内社：諏訪神社・龍宮神社）",
    claimedOrigin: {
      statement:
        "1460年に天満宮が創建され、1466年に住吉・春日が加わり、1547年に安武淡路守が宇佐八幡宮を勧請して八幡宮としたと現地案内板に説明される。",
      sourceTitle: "安武八幡神社 現地解説板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世末期由緒・現代解説板",
        targetEra: "室町〜戦国時代（1460〜1547年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "1460〜1547年の由緒記録に加え、1870年（明治3年）に高良山の明静院（妙常院）本堂を移築した現社殿（有馬藩御用絵師・三谷主後の天井画154枚、龍・麒麟彫刻、鯱）および大正初期の地域神社合祀が現物建築として確認される。",
      sourceTitle: "安武八幡神社移築社殿・現地文化財解説板",
      sourceCategory: "B",
      certaintyTier: "A",
      chronology: {
        compilationEra: "室町〜戦国（1460〜1547年）・明治3年（1870年）移築・大正初期合祀",
        targetEra: "中世〜近代",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "久留米市安武町安武本に鎮座。神仏分離の制度的断絶下でも寺院建築が八幡神社社殿として再利用された物質的証拠を留める。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "室町〜戦国時代（1460〜1547年）",
        description:
          "1460年天満宮創建、1466年住吉・春日加祀、1547年安武淡路守による宇佐八幡宮勧請と伝える。",
        certaintyTier: "B",
      },
      {
        era: "明治3年（1870年）高良山明静院本堂移築",
        description:
          "神仏分離で廃寺となった高良山・明静院（妙常院）本堂を現在地へ移築し、江戸期高良山寺院の彫刻・三谷主後天井画154枚を継承。",
        certaintyTier: "A",
      },
      {
        era: "大正初期（地域神社合祀）",
        description:
          "天満宮・祇園社・田中社が合祀され、境内の諏訪神社・龍宮神社とともに現在の複合境内構成が形成された。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "1870年移築の旧高良山明静院本堂（龍・麒麟彫刻、鯱、三谷主後天井画154枚）と境内社（諏訪神社・龍宮神社）。",
      features: [
        "旧高良山明静院本堂移築社殿（1870年移築）",
        "有馬藩御用絵師・三谷主後の天井画154枚",
        "境内社（龍宮神社の水神信仰・諏訪神社の集落信仰）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["安武氏（安武淡路守）", "高良山社僧（明静院／妙常院）", "久留米藩有馬氏"],
      routeAndPoliticalContext:
        "高良山二十六ヶ寺の廃絶後、山外へ移築転用された建築遺構を通じて神仏分離の物質的帰結を追跡できる筑後平野の重要拠点。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "reorganized",
  },
  {
    id: "stratigraphy-yodohime-jinja",
    primarySpotIds: ["spot-yodohime-jinja"],
    primarySpotNames: ["與止日女神社", "与止日女神社", "河上神社"],
    targetSpotIds: ["spot-yodohime-jinja"],
    targetRegion: "佐賀",
    spotNames: ["與止日女神社", "与止日女神社", "河上神社", "肥前国一宮 與止日女神社"],
    title: "與止日女神社（肥前国一宮・河上神社） 水神祭祀・中世文書・鍋島氏寄進の重層構造",
    summary:
      "嘉瀬川（佐嘉川）沿いの川上峡に鎮座する延喜式内社・肥前国一宮。社伝の欽明天皇25年（564年）創祀や神功皇后の妹・豊玉姫命同定を後世の整理層として切り分けつつ、『肥前国風土記』佐嘉郡条の川上石神「世田姫」との比較、国重要文化財『河上神社文書』247通、室町後期西門（1570年今山の戦い焼失・1573年修復）、1608年鍋島勝茂寄進の肥前鳥居、大楠・自然石「金精さん」、近代の県社格・現代の式年大祭までを多層に保持する。",
    currentDeities: "與止日女命（社伝別伝：神功皇后の妹・豊玉姫命 ※後世の神格整理として区分）",
    claimedOrigin: {
      statement:
        "欽明天皇25年（564年）創祀と伝え、與止日女命を海・川・水の神とし、別伝では神功皇后の妹または豊玉姫命に同定する。",
      sourceTitle: "與止日女神社由緒・社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中近世社伝・現地由緒",
        targetEra: "6世紀後半伝承期（現行祭神名からの遡及推定は留保）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『延喜式』神名帳（927年）に肥前国佐嘉郡の式内社として登載され、のちに肥前国一宮・正一位（1261年）。平安〜中世の247通の古文書群が国指定重要文化財『河上神社文書』として伝存する。なお『肥前国風土記』佐嘉郡条の佐嘉川上流の石神「世田姫」は比較検討対象であり、同一神とは断定しない。",
      sourceTitle: "『延喜式』神名帳（927年）・『河上神社文書』247通・『肥前国風土記』佐嘉郡条（比較資料）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "8世紀前半（風土記）／延長5年（927年・延喜式）／中世古文書群",
        targetEra: "古代律令期〜中世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "佐賀市大和町川上の嘉瀬川（佐嘉川）渓谷出口・河岸段丘に鎮座。川・水・自然石（金精さん）・大楠という自然景観を軸に、室町後期の西門（1573年修復）と1608年鍋島勝茂寄進の三の鳥居（肥前鳥居）が現存する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代律令期（8世紀『肥前国風土記』比較〜927年『延喜式』・肥前国一宮）",
        description:
          "佐嘉川上流の水神・石神信仰圏を背景に式内社・肥前国一宮として制度化。1261年に正一位。",
        certaintyTier: "A",
      },
      {
        era: "中世（『河上神社文書』・1570年今山の戦い・1573年西門修復）",
        description:
          "肥前地域の政治勢力・武家社会と密接に関わり247通の文書を伝存。室町後期の西門は1570年今山の戦いで一部焼失後、1573年に修復再建。",
        certaintyTier: "A",
      },
      {
        era: "近世〜現代（1608年鍋島勝茂寄進・明治4年県社・2014年式年大祭）",
        description:
          "1608年に鍋島勝茂が肥前鳥居（三の鳥居）を寄進し大楠を保護。天満宮に後陽成天皇宸筆勅額を伝え、明治4年に県社、2014年に創祀1450年式年大祭で天井絵馬250枚を奉納。なお裏手の小石仏群は尊格・年代未確認のため留保。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "嘉瀬川沿いの川上峡河岸立地、御神木の大楠、男根形自然石「金精さん」、室町後期西門、1608年銘肥前鳥居。",
      features: [
        "嘉瀬川沿いの水神立地と大楠（日本武尊「栄の国」伝承・鍋島勝茂保護）",
        "自然石「金精さん」（生産・子宝・縁結びの民俗信仰）",
        "国指定重要文化財『河上神社文書』247通（佐賀県立図書館保管）",
        "室町後期西門（1570年今山の戦い焼失・1573年修復）および1608年肥前鳥居",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["肥前国一宮社家・地域勢力", "龍造寺氏・佐賀藩鍋島氏"],
      routeAndPoliticalContext:
        "脊振山地から佐賀平野・有明海へ流れ下る嘉瀬川の要衝（川上峡）に位置し、肥前国一宮として水神祭祀と地域政治の結節点を担った。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-yoshinogari-site",
    primarySpotIds: ["spot-yoshinogari-site"],
    primarySpotNames: ["吉野ヶ里遺跡", "吉野ヶ里遺跡・吉野ヶ里歴史公園"],
    targetSpotIds: ["spot-yoshinogari-site"],
    targetRegion: "佐賀",
    spotNames: ["吉野ヶ里遺跡", "吉野ヶ里遺跡・吉野ヶ里歴史公園", "吉野ヶ里歴史公園"],
    title: "吉野ヶ里遺跡 弥生環濠集落・首長墳丘墓から中世山城・江戸日吉神社へ重なる多層空間",
    summary:
      "弥生時代前期（約2ha）→中期（20ha超）→後期（40ha超）へ段階的に発展した国特別史跡。弥生中期の北墳丘墓（14基の甕棺・有柄細形銅剣・コバルトブルーガラス管玉79個・墓道）、後期の北内郭主祭殿と外壕防御区画（土塁・柵→V字空堀→逆茂木→集落内部）、日吉神社跡「謎のエリア」の弥生終末期連続方形周溝墓群・線刻石棺墓（2023・2025年度調査）に、古代官衙の権、中世戦国期の山城防衛溝、江戸時代の日吉神社と鍋島焼までが重層する。",
    currentDeities: "弥生祖霊・首長祭祀空間（北墳丘墓・北内郭）／後世江戸期の日吉神社跡（時代断絶を峻別）",
    claimedOrigin: {
      statement:
        "邪馬台国論争の有力比較対象として言及されることが多いが、邪馬台国の所在地そのものと確定する証拠はなく、北部九州に実在した大規模な政治・祭祀拠点「クニ」の中枢モデルとして位置づける。",
      sourceTitle: "吉野ヶ里歴史公園展示・佐賀県教育委員会発掘調査報告",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "平成元年（1989年）〜2025年度発掘調査",
        targetEra: "弥生時代前期〜終末期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "弥生前期環濠・中期前半の北墳丘墓（有柄細形銅剣・ガラス管玉79個・墓道）・青銅器鋳型・縫い目ある絹布・SJ-329号戦闘犠牲人骨・後期外環濠および北内郭主祭殿・2023年線刻石棺墓および2025年度連続方形周溝墓群が発掘物証（確度A）で確認される。",
      sourceTitle: "佐賀県教育委員会『吉野ヶ里遺跡発掘調査報告書』・2023/2025年度発掘成果",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "1989年〜2025年度発掘調査（1991年特別史跡指定）",
        targetEra: "弥生時代前期〜終末期（紀元前〜3世紀頃）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "脊振山地裾野から佐賀平野へ張り出す南北約1km・東西約600mの丘陵上に立地。弥生遺構の上に古代官衙遺物（権）、中世戦国期の山城（墳丘墓周囲の防衛溝・櫓）、江戸期日吉神社が順次重層する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "弥生前期〜中期（約2ha→20ha超・北墳丘墓築造・青銅器鋳造）",
        description:
          "丘陵上に環濠集落が形成され、中期前半に北墳丘墓（14基の甕棺・有柄細形銅剣・ガラス管玉79個）を築造。細形銅剣鋳型等の青銅器製作も行われた。",
        certaintyTier: "A",
      },
      {
        era: "弥生後期〜終末期（40ha超・北内郭主祭殿・外壕防御区画・日吉神社跡方形周溝墓群）",
        description:
          "外環濠・土塁・逆茂木と北内郭大型主祭殿（約12.3m×12.7m）が整備され、中期墳丘墓は立柱・祀堂を伴う祖霊祭祀空間へ展開。日吉神社跡では終末期頃の連続方形周溝墓群と線刻石棺墓を確認。",
        certaintyTier: "A",
      },
      {
        era: "古代〜中世戦国期〜江戸時代（官衙遺物・山城転用・日吉神社）",
        description:
          "古代役所の権（おもり）、中世戦国期の山城防衛溝・櫓による地形再利用を経て、江戸時代に日吉神社が創建（鍋島焼出土）。弥生祭祀と江戸日吉神社の直接継承は根拠なく峻別。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "北墳丘墓保存展示施設、北内郭復元主祭殿、外壕（外側土塁・V字空堀・内側逆茂木柱穴）および居住区堀、日吉神社跡発掘調査区。",
      features: [
        "北墳丘墓（甕棺14基・有柄細形銅剣国内4例目・ガラス管玉79個・外環濠外へ延びる墓道）",
        "北内郭主祭殿（推定12.3m×12.7m）および太陽運行線・雲仙岳軸線の検討対象配置",
        "外壕の複合空間構造（土塁・柵→V字空堀→内側逆茂木→集落内部／居住区堀の貝殻・動物骨）",
        "日吉神社跡「謎のエリア」（2023年線刻石棺墓・2025年度連続方形周溝墓群・古代の権・鍋島焼）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["佐賀平野・有明海北岸の弥生首長層（クニ共同体）", "中世戦国期城郭勢力"],
      routeAndPoliticalContext:
        "有明海・筑後川水系と脊振山地越えルートを扼する佐賀平野中枢。伊都国・奴国・平塚川添遺跡、さらには近畿の唐古・鍵、池上曽根、纒向遺跡との構造比較の基準点となる。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-suwa-shrine-nagasaki",
    primarySpotIds: ["spot-suwa-shrine-nagasaki"],
    primarySpotNames: ["諏訪神社", "長崎諏訪神社", "鎮西大社 諏訪神社"],
    targetSpotIds: ["spot-suwa-shrine-nagasaki"],
    targetRegion: "長崎",
    spotNames: ["諏訪神社", "長崎諏訪神社", "鎮西大社 諏訪神社"],
    title: "長崎・諏訪神社 都市記憶・近世再興の層構造",
    summary:
      "1625年（寛永2年）に青木賢清により諏訪・森崎・住吉三社が合祀再興され、1648年に現在地へ移転した近世港湾都市・長崎の総鎮守。境内には奉行所奉納品（1679年随身像）、フェートン号事件由来の祖霊社、貿易積立金の五釐金之碑（1891年本河内水源地へ投入）、明治12年のまよひ子志らせ石、少彦名命を祀る小祀群や大楠・蛙岩等が集積し、古代以来の単線的継続ではなく近世〜近代都市社会の記憶を重層的に保存する（性格C：後世再構成）。",
    currentDeities: "諏訪大神・森崎大神・住吉大神（三社合祀）および境内各末社の諸神（少彦名命・市杵島姫命・稲荷神等）",
    claimedOrigin: {
      statement:
        "戦国期に破壊された諏訪・森崎・住吉の三社を、寛永2年（1625年）に青木賢清が松森天満宮境内にて再興・合祀し、慶安元年（1648年）に現在地（玉園山麓）へ遷座したとする近世再興由緒。",
      sourceTitle: "長崎諏訪神社由緒・現地案内板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "江戸時代初期以降（17世紀〜現代）",
        extantManuscriptEra: "近世以降の神社記録・現地案内板",
        targetEra: "近世初期（1625年再興・1648年現在地移転）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "寛文〜延宝期（1679年長崎奉行牛込忠左衛門奉納の随身像）以降、1808年フェートン号事件後の長崎奉行松平康平慰霊（祖霊社）、明治12年（1879年）のまよひ子志らせ石、1891年本河内水源地に連結する五釐金之碑など、近世〜近代長崎の奉行所・貿易商人・都市公共事業の物証と金石文が境内に現存する。なお大楠・蛙岩や少彦名命複数祭祀の古代遡及については確定史料を欠くため、後世の合祀・集積として扱う。",
      sourceTitle: "境内現存奉納物・記念碑群（1679年随身像・五釐金之碑・まよひ子志らせ石等）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "江戸時代（1679年）〜明治期（1891年）",
        extantManuscriptEra: "現地金石文・奉納物現存",
        targetEra: "近世〜近代（17〜19世紀）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "現在地への移転は1648年（慶安元年）とされ、1679年奉納の随身像、1808年以後の祖霊社系譜、明治期の記念碑群、昭和57年長崎大水害後の蛙岩信仰など、近世〜現代の各時代の痕跡が境内に並存する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "近世初期（1625年〜1648年）",
        description:
          "青木賢清による諏訪・森崎・住吉三社の合祀再興と現在地への移転により、幕府直轄貿易都市・長崎の鎮守空間が形成。",
        certaintyTier: "B",
      },
      {
        era: "江戸時代中〜後期（1679年〜1808年）",
        description:
          "長崎奉行牛込忠左衛門の随身像奉納（1679年）、フェートン号事件で自害した長崎奉行松平康平の慰霊から始まる祖霊社形成、貿易額千分の五積立（五釐金）の運用。",
        certaintyTier: "A",
      },
      {
        era: "明治〜現代（1879年〜1990年）",
        description:
          "まよひ子志らせ石（1879年）など地域公共空間としての機能、五釐金の近代水道（1891年本河内水源地）への転用、昭和57年長崎大水害後の蛙岩厄難除け信仰、平成2年の諏訪荘移築。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "玉園山麓の境内空間、病魔退散大楠・玉園稲荷の大楠・蛙岩等の自然物と、奉行所奉納品・貿易公共事業碑・災害伝承碑が一体となった近世〜近代都市宗教景観。",
      features: [
        "1679年奉納随身像",
        "五釐金之碑・祖霊社・まよひ子志らせ石",
        "病魔退散大楠・玉園稲荷大楠・蛙岩",
        "少彦名命を記す複数小祀（大楠日吉社・厳島社相殿・蛭子社）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["長崎奉行所（幕府直轄行政）", "長崎町人・貿易商人・氏子共同体"],
      routeAndPoliticalContext:
        "鎖国下の国際貿易港・長崎における幕府行政・海外貿易富・地域共同体生活が交差する都市鎮守ネットワーク。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-matsumori-tenmangu",
    primarySpotIds: ["spot-matsumori-tenmangu"],
    primarySpotNames: ["松森天満宮", "松森神社"],
    targetSpotIds: ["spot-matsumori-tenmangu"],
    targetRegion: "長崎",
    spotNames: ["松森天満宮", "松森神社"],
    title: "松森天満宮 近世職人文化・町人信仰の層構造",
    summary:
      "1625年（寛永2年）に今博多町へ創建され、1656年（明暦2年）に現在地へ遷宮した近世長崎の天満宮。諏訪神社三社合祀の場という接点を持つほか、奉行所御用指物師と唐絵目利・石崎融思が関わった「職人尽」（1713年奉納・1832年彩色）や町の生活・職業に紐づく多数の小宮、クスノキ群（マウント・オブ・キャンファ）、明治40年日露戦争「戦利兵器奉納ノ記」が並存する近世〜近代都市文化の集積空間（性格C：後世再構成）。",
    currentDeities: "菅原道真公・天穂日命・菅原是善命および町の生活・職業に関わる境内小宮群",
    claimedOrigin: {
      statement:
        "1625年今博多町創建、諏訪・森崎・住吉三社合祀再興の舞台を経て、1656年に現在地へ遷宮したとする近世創建・遷宮由緒。",
      sourceTitle: "松森天満宮現地案内図・由緒記",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "江戸時代以降",
        extantManuscriptEra: "現地案内図・社伝記録",
        targetEra: "近世初期（1625年創建・1656年遷宮）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "正徳3年（1713年）奉納・天保3年（1832年）唐絵目利石崎融思彩色の県指定有形文化財「職人尽」（30枚板薄肉浮彫・御用指物師喜兵衛・藤右衛門作）、市指定天然記念物クスノキ群、明治40年（1907年）陸軍大臣寺内正毅による「戦利兵器奉納ノ記」が現存し、近世長崎の専門職技術・貿易文化と近代国家記憶の受容を実証する。なお各小宮の創建・合祀年代は案内図のみからは未確定として保持する。",
      sourceTitle: "長崎県指定有形文化財「職人尽」（1713年／1832年）・「戦利兵器奉納ノ記」（1907年）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "江戸時代中期〜明治期（1713〜1907年）",
        extantManuscriptEra: "文化財・石碑現存",
        targetEra: "近世〜近代（18〜20世紀初頭）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "1656年の現在地遷宮以後、1713年奉納・1832年彩色の「職人尽」、居留地時代からのクスノキ群景観、1907年の戦利兵器奉納記念碑が現境内に重層している。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "近世初期（1625年〜1656年）",
        description:
          "今博多町創建と諏訪神社三社合祀との接点を経て、現在地へ遷宮し長崎町民の学問・生活信仰拠点として定着。",
        certaintyTier: "B",
      },
      {
        era: "江戸時代中期〜後期（1713年〜1832年）",
        description:
          "奉行所御用指物師らによる「職人尽」30枚の奉納（1713年）と唐絵目利石崎融思による彩色（1832年）、および町の生活・職能に関わる小宮群の集積。",
        certaintyTier: "A",
      },
      {
        era: "明治〜現代（1907年〜1974年）",
        description:
          "日露戦争「戦利兵器奉納ノ記」（明治40年・寺内正毅）による近代国家軍事記憶の刻印と、文化財・天然記念物指定による都市遺産化。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "玉園山のクスノキ群（7本・最大幹囲7.8m、居留地外国人の称「マウント・オブ・キャンファ」）と、職人尽彫刻・多様な稲荷/猿田彦/水神/竈三柱神社の小宮群が共生する都市境内空間。",
      features: [
        "県指定有形文化財「職人尽」（30面）",
        "市指定天然記念物クスノキ群（7本）",
        "町民生活に根差す小宮群（稲荷・猿田彦・水神社・竈三柱神社等）",
        "戦利兵器奉納ノ記（明治40年）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["長崎奉行所御用職人・唐絵目利（石崎融思ら）", "長崎各町の職人・町人層"],
      routeAndPoliticalContext:
        "近世国際貿易港・長崎の技術職能・輸入美術鑑定（唐絵目利）文化が、神社の奉納物・小宮構成へ直接結晶化した都市宗教ネットワーク。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
  },
];
