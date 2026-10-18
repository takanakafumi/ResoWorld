import type { SacredSiteStratigraphyProfile } from "./source-evaluation";
import { resolveSpotStratigraphyProfile } from "./stratigraphy-profiles";


/**
 * 神社スポットにおける祭神・古層神格コンテキスト
 * ADR-0019 に基づき、「現在の公称祭神」と「古層の神格・由緒伝承」を明確に分離して保持する。
 */
export interface SpotDeityContext {
  /** 現在の公称祭神（主祭神・配祀神など） */
  currentDeities: string;
  /** 古層の神格・由緒伝承（土着神、峠・境界の荒神、地名起源、神事等） */
  ancientBedrockOrLegend?: string;
  /** 典拠・情報源の要約（例: 社伝、風土記逸文、探索記、7項目プロファイル） */
  sourceNote?: string;
  /** 祭祀史7項目プロファイルが存在するか */
  hasStratigraphyProfile?: boolean;
  /** 紐付く7項目プロファイルのID */
  stratigraphyProfileId?: string;
}

export interface ShrineDeityEntry {
  /** マッチ用の正規化社名トークン */
  matchNames: readonly string[];
  /** 現在の公称祭神 */
  currentDeities: string;
  /** 古層の神格・由緒伝承 */
  ancientBedrockOrLegend: string;
  /** 典拠 */
  sourceNote: string;
}

/**
 * 全神社対応の基礎台帳辞書（Base Shrine Deity Registry）
 * 7項目プロファイルを持たない神社も含め、全社の主祭神と古層神格を標準網羅する。
 */
export const SHRINE_DEITY_REGISTRY: readonly ShrineDeityEntry[] = [
  {
    matchNames: ["宗像大社", "辺津宮", "宗像大社 辺津宮"],
    currentDeities: "宗像三女神 — 市杵島姫神（辺津宮）・田心姫神（沖津宮）・湍津姫神（中津宮）",
    ancientBedrockOrLegend:
      "4〜9世紀の沖ノ島巨石・露天祭祀（考古物証：確度A）に遡る海北道中の航海守護神。古代宗像氏（胸形君）が奉斎し大和王権の国家祭祀へ直結。",
    sourceNote: "『古事記』『日本書紀』・『延喜式』名神大社・沖ノ島祭祀遺跡",
  },
  {
    matchNames: ["宇佐神宮"],
    currentDeities: "八幡大神（応神天皇）・比売大神・神功皇后",
    ancientBedrockOrLegend:
      "御許山山頂の巨石磐座（三ツ石）を原生信仰の神体山とする地主神・比売大神を基層とし、辛島氏・大神氏の祭祀を経て八幡神（託宣・仏教守護）と習合。",
    sourceNote: "『続日本紀』『八幡宇佐宮御託宣集』・御許山磐座祭祀",
  },
  {
    matchNames: ["御許山", "大元神社", "御許山・大元神社"],
    currentDeities: "比売大神（奥宮・三柱の巨石磐座）",
    ancientBedrockOrLegend:
      "宇佐神宮発祥の奥宮。山頂禁足地の巨石磐座群を原生信仰の神体とし、社殿を持たない原初的な山岳磐座祭祀を保持。",
    sourceNote: "宇佐神宮奥宮社伝・御許山祭祀遺跡",
  },
  {
    matchNames: ["高祖神社"],
    currentDeities: "彦火火出見命・玉依姫命・息長足姫命（神功皇后）",
    ancientBedrockOrLegend:
      "高祖山山頂の古代怡土城（古代山城）山麓に位置する伊都国の古社。山岳祭祀・高祖宮に起源を持ち、国指定無形民俗文化財の高祖神楽を継承。",
    sourceNote: "社伝・『筑前国続風土記』",
  },
  {
    matchNames: ["熊野神社", "春日 熊野神社"],
    currentDeities: "伊邪那美命・速玉男命・事解男命",
    ancientBedrockOrLegend:
      "奴国中枢の須玖岡本遺跡（王墓）至近に鎮座。春日の丘陵地帯の水利と集落を護る熊野三所権現の古層祭祀地。",
    sourceNote: "社伝・春日市史",
  },
  {
    matchNames: ["細石神社"],
    currentDeities: "磐長姫命・木花開耶姫命",
    ancientBedrockOrLegend:
      "伊都国王墓（三雲南小路遺跡）至近に鎮座。「さざれ石（細石）」伝承の起源とされ、記紀の姉妹女神を並置して祀る伊都国の巨石・長寿信仰。",
    sourceNote: "社伝・『筑前国続風土記』",
  },
  {
    matchNames: ["筑紫神社"],
    currentDeities: "筑紫の神（白日別神）・五十猛命・素戔嗚尊",
    ancientBedrockOrLegend:
      "基肄山・牛頸山に挟まれた原田峠（境界）の荒ぶる神。通行人の命を奪う「人の命尽（つく）す神」を鎮める境界祭祀が起源で「筑紫」国号の発祥地。粥占神事を継承。",
    sourceNote: "『延喜式』名神大社・『筑後国風土記』逸文・『邪馬台国探索2』",
  },
  {
    matchNames: ["松陰神社"],
    currentDeities: "吉田矩方命（吉田松陰）",
    ancientBedrockOrLegend:
      "明治23年創建の近代神社。松下村塾旧社地を境内とし、幕末維新の精神的先覚者を祀る。",
    sourceNote: "社伝",
  },
  {
    matchNames: ["大己貴神社", "於保奈牟智神社"],
    currentDeities: "大己貴命（大国主命）・天照皇大神・春日大明神",
    ancientBedrockOrLegend:
      "神功皇后が三韓征伐に際し大三輪神を祀って軍勢を集めたとする「日本最古の大三輪社」伝承。大和三輪山や出雲大社と並ぶ式内社・出雲系国津神ネットワークの九州拠点。",
    sourceNote: "『日本書紀』神功皇后紀・社伝・『延喜式』神名帳（於保奈牟智神社）",
  },
  {
    matchNames: ["美奈宜神社"],
    currentDeities: "素戔嗚尊・大己貴命・事代主命",
    ancientBedrockOrLegend:
      "蜷城山麓に鎮座する延喜式内名神大社。筑後川中流域の平野水利・秋月街道の交通要衝を扼し、古代の暴れ川の水神・治水神として奉斎。",
    sourceNote: "『延喜式』名神大社・社伝・『筑前国続風土記』",
  },
  {
    matchNames: ["厳島神社"],
    currentDeities: "宗像三女神 — 市杵島姫命・田心姫神・湍津姫神",
    ancientBedrockOrLegend:
      "神体島（宮島・弥山）そのものを崇拝し、潮間帯の海上に社殿を設けた列島屈指の海上祭祀拠点。平清盛による造営と瀬戸内海交通掌握の結節点。",
    sourceNote: "『日本後紀』・『延喜式』名神大社・厳島社伝",
  },
  {
    matchNames: ["荒胡子神社"],
    currentDeities: "素戔嗚尊",
    ancientBedrockOrLegend:
      "厳島海中大鳥居を正面に望む丘陵に鎮座。中世〜近世に宮島の町衆や海商が勧請した市場守護・えびす信仰の拠点。",
    sourceNote: "厳島神社境外摂社記",
  },
  {
    matchNames: ["大元神社", "宮島 大元神社"],
    currentDeities: "国常立尊・大山祇神・保食神",
    ancientBedrockOrLegend:
      "厳島神社創建以前の島内最古の地主神祭祀地伝承を持つ。大元浦の海浜に位置し、古代の海中祭祀・御供祭（船上祭礼）の原点。",
    sourceNote: "社伝・厳島古図",
  },
  {
    matchNames: ["御山神社", "弥山 御山神社"],
    currentDeities: "宗像三女神",
    ancientBedrockOrLegend:
      "弥山山頂直下の巨石群（磐座）に囲まれた天空の神域。神体島信仰の古層を現在に伝える山頂祭場。",
    sourceNote: "厳島奥宮社伝・弥山磐座祭祀",
  },
  {
    matchNames: ["滝宮神社"],
    currentDeities: "湍津姫神",
    ancientBedrockOrLegend:
      "弥山水系・白糸の滝の水源瀑布に鎮座。島内の生命線である清洌な湧水・水源を司る滝磐座水神祭祀。",
    sourceNote: "厳島摂社記",
  },
  {
    matchNames: ["粟島神社"],
    currentDeities: "少彦名命",
    ancientBedrockOrLegend:
      "医薬・温泉・穀物をつかさどる少彦名命を祀り、島民の無病息災・安産を守護する小祠。",
    sourceNote: "厳島摂社記",
  },
  {
    matchNames: ["三翁神社"],
    currentDeities: "安徳天皇・佐伯鞍職・大己貴命等",
    ancientBedrockOrLegend:
      "厳島神主家（佐伯氏）の開基祖神・地主神、および壇ノ浦に没した平家一門を合祀した歴史的祭祀。",
    sourceNote: "厳島神社境内摂社縁起",
  },
  {
    matchNames: ["備後護国神社"],
    currentDeities: "備後出身の戦没英霊・阿部正弘（備後福山藩第7代藩主）",
    ancientBedrockOrLegend:
      "福山城本丸北隣に明治元年に創建。旧阿部家下屋敷跡・城下町の歴史的結節点。",
    sourceNote: "神社由緒記",
  },
  {
    matchNames: ["沼名前神社"],
    currentDeities: "大綿津見命（渡守神社）・須佐之男命（鞆祇園宮）",
    ancientBedrockOrLegend:
      "延喜式内社。瀬戸内海の潮の変わり目「鞆の浦」の潮待ち港を扼し、航海守護の船玉神（渡守社）と渡御神事・オテビ神事で知られる祇園社が合祀された古社。",
    sourceNote: "『延喜式』神名帳・社伝・『備後国風土記』逸文",
  },
  {
    matchNames: ["小烏神社"],
    currentDeities: "大山積命・厳島三女神",
    ancientBedrockOrLegend:
      "鞆の浦の古い町並みに鎮座。海運と山林の守護を兼ね、港町の商人・船乗りたちの航海安全を祈願。",
    sourceNote: "鞆町誌",
  },
  {
    matchNames: ["白神社"],
    currentDeities: "菊理媛神・伊弉諾尊・伊弉冉尊",
    ancientBedrockOrLegend:
      "広島城下町建設前、広島湾に露出していた白い暗礁（白石）上の航路標識・海中神祠が起源。広島原爆被災を経て復興。",
    sourceNote: "社伝・広島市史",
  },
  {
    matchNames: ["宇美八幡宮"],
    currentDeities: "応神天皇・神功皇后・玉依姫命・住吉大神",
    ancientBedrockOrLegend:
      "記紀に語られる神功皇后の応神天皇御出産（「産み」が宇美の地名由来）の伝承地。境内に「湯蓋の森」「衣掛の森」などの巨樹クスノキ群（国指定天然記念物）を抱く母子神信仰の総本宮。",
    sourceNote: "『古事記』『日本書紀』・社伝・『筑前国続風土記』",
  },
  {
    matchNames: ["和白・大神神社", "大神神社"],
    currentDeities: "大物主神",
    ancientBedrockOrLegend:
      "博多湾北部の和白干潟を見下ろす丘陵に鎮座。三輪山の大物主神を勧請した古代祭祀。周辺の和白古墳群・海浜集落の鎮守。",
    sourceNote: "社伝・和白郷土誌",
  },
  {
    matchNames: ["和白四社神社", "和白四社神社・塩浜"],
    currentDeities: "天照大神・八幡大神・春日大神・住吉大神",
    ancientBedrockOrLegend:
      "博多湾沿岸の古代〜中世の製塩地（塩浜）に鎮座。塩焚き労働と潮の満ち引き・海神への祈りを捧げた製塩集落の守護社。",
    sourceNote: "塩浜郷土誌",
  },
  {
    matchNames: ["三苫・綿津見神社", "三苫 綿津見神社"],
    currentDeities: "綿津見三神",
    ancientBedrockOrLegend:
      "玄界灘に面した海浜集落。古代阿曇族の流れを汲む海民集落の海神祭祀。境内には観音堂が同居し神仏習合の名残を留める。",
    sourceNote: "三苫郷土誌",
  },
  {
    matchNames: ["奈多・志式神社", "志式神社"],
    currentDeities: "火明命・火遠理命・豊玉姫命・鵜茅葺不合命",
    ancientBedrockOrLegend:
      "海の中道砂嘴の付け根に位置する砂丘古社。延喜式内社論社。海難除けの寄り神信仰や、古代海人族の海浜祭祀の痕跡を色濃く残す。",
    sourceNote: "『延喜式』神名帳論社・社伝・『筑前国続風土記』",
  },
  {
    matchNames: ["大嶽神社"],
    currentDeities: "志賀明神（志賀海三神）・大嶽大神",
    ancientBedrockOrLegend:
      "志賀島最高峰の大嶽山頂（海抜214m）近くに鎮座。玄界灘・博多湾を一望する古代の狼煙台・航路監視拠点であり、磐座祭祀の古層を宿す。",
    sourceNote: "志賀海神社古縁起",
  },
  {
    matchNames: ["志賀海神社"],
    currentDeities: "綿津見三神 — 底津綿津見神・仲津綿津見神・表津綿津見神",
    ancientBedrockOrLegend:
      "博多湾口を扼する海人族阿曇氏（安曇氏）の総本宮。『古事記』『日本書紀』『万葉集』『延喜式』に記載される名神大社。勝馬からの遷座伝承、鹿角奉納、山誉め祭を継承。",
    sourceNote: "『古事記』『延喜式』名神大社・社伝",
  },
  {
    matchNames: ["中津宮古墳", "勝馬 中津宮"],
    currentDeities: "海人首長祖霊（阿曇氏首長）",
    ancientBedrockOrLegend:
      "志賀島北端の勝馬に位置する5世紀末の円墳。志賀海神社発祥地とされる勝馬の首長墓であり、玄界灘の海人集団を率いた首長の眠る聖域。",
    sourceNote: "勝馬遺跡調査報告",
  },
  {
    matchNames: ["沖津宮", "志賀島 沖津宮"],
    currentDeities: "表津綿津見神",
    ancientBedrockOrLegend:
      "志賀島勝馬の沖合に浮かぶ小島（潮が引くと陸続きになるタイダル・アイランド）。古代阿曇氏の沖津宮祭祀遺跡であり、海中境界祭祀の原型。",
    sourceNote: "志賀海神社旧社地伝承",
  },
  {
    matchNames: ["八田天満貴船神社"],
    currentDeities: "菅原道真・高龗神（貴船水神）",
    ancientBedrockOrLegend:
      "多々良川水系の八田川流域に鎮座。古代から水争い・干魃が頻発した地域で、雨乞いと水利分配を司る貴船水神信仰に近世の天満宮が習合。",
    sourceNote: "八田村郷土誌",
  },
  {
    matchNames: ["部木八幡神社", "部木八幡神社・部木古墳群"],
    currentDeities: "応神天皇・神功皇后",
    ancientBedrockOrLegend:
      "境内に4基の円墳（部木古墳群）を内包する神社。首長墓（古墳）そのものが御神体または聖地と一体化した古代首長祭祀の典型。",
    sourceNote: "久山町史・部木古墳調査報告",
  },
  {
    matchNames: ["大隈御霊神社"],
    currentDeities: "崇道天皇（早良親王）・伊予親王等",
    ancientBedrockOrLegend:
      "延暦年間、政争に巻き込まれ憤死した早良親王（崇道天皇）の怨霊を鎮撫するために創建された御霊社。多々良川下流域の水害と疫病を防ぐ鎮魂の聖地。",
    sourceNote: "粕屋町誌・社伝",
  },
  {
    matchNames: ["黒殿神社", "黒殿神社・丸山城跡"],
    currentDeities: "黒殿霊神（江辻城主等の戦国武将怨霊）",
    ancientBedrockOrLegend:
      "丸山城（中世平山城）跡に鎮座。戦乱による戦没武将の怨念を神として祀り上げ、地域の守護神へと転化した怨霊鎮魂・在地領主祭祀。",
    sourceNote: "粕屋町文化財資料",
  },
  {
    matchNames: ["和田八幡宮", "和田八幡宮（刻線の石）"],
    currentDeities: "応神天皇",
    ancientBedrockOrLegend:
      "境内に古代の刻線（ペトログラフ状の幾何学線刻）を持つ巨石が保存される古社。篠栗山塊の山麓に位置し、古代の巨石信仰・磐座祭祀の古層を窺わせる。",
    sourceNote: "篠栗町誌・境内案内板",
  },
  {
    matchNames: ["津波黒御霊神社"],
    currentDeities: "崇道天皇（早良親王）",
    ancientBedrockOrLegend:
      "多々良川上流の渓谷口に位置し、早良親王の御霊を祀る。大雨による土砂崩れや山津波の恐怖を怨霊の祟りと重ね、鎮め祈願した境界祭祀。",
    sourceNote: "篠栗町誌",
  },
  {
    matchNames: ["木寄神社"],
    currentDeities: "天手力雄命・大己貴命",
    ancientBedrockOrLegend:
      "猪野川・久原川上流の山林地帯。木材を伐り出し集積する「木寄（きよせ）」の土場に起源を持ち、山林労働・杣人の安全と山の恵みを祈願した産業祭祀。",
    sourceNote: "久山町史",
  },
  {
    matchNames: ["乙宮神社", "乙宮神社・乙宮古墳群"],
    currentDeities: "豊玉姫命",
    ancientBedrockOrLegend:
      "境内に6世紀後半の首長墓（乙宮古墳・装飾古墳）が存在。海神の娘・豊玉姫を祀る水神信仰と、在地豪族の古墳祭祀が合一した重層聖域。",
    sourceNote: "久山町史・乙宮古墳発掘調査報告",
  },
  {
    matchNames: ["伊野天照皇大神宮"],
    currentDeities: "天照皇大神・豊受大神",
    ancientBedrockOrLegend:
      "伊勢神宮の古社地（九州の伊勢）と称される神社。猪野川の清流と深い神体山を背負い、神功皇后の神託斎場・山田邑斎宮伝承地と隣接する山麓清冷聖地。",
    sourceNote: "社伝・『日本書紀』神功皇后紀・『筑前国続風土記』",
  },
  {
    matchNames: ["山田邑斎宮", "山田斎宮"],
    currentDeities: "神功皇后・仲哀天皇神託祭場",
    ancientBedrockOrLegend:
      "『日本書紀』仲哀紀に記載される「山田邑に斎宮を興して親ら神主と為りたまふ」の比定地。神がかりによる託宣を下した古代王権の国家的神事の原点。",
    sourceNote: "『日本書紀』仲哀天皇紀・久山町史",
  },
  {
    matchNames: ["審神者神社"],
    currentDeities: "武内宿禰（審神者）",
    ancientBedrockOrLegend:
      "神功皇后が神託を受ける際、武内宿禰が神の真偽や意図を判別する「審神者（さにわ）」を務めた伝承地。古代神託祭祀における役割分担を今に伝える極めて稀有な古社。",
    sourceNote: "久山町史・社伝",
  },
  {
    matchNames: ["六所宮跡", "六所宮"],
    currentDeities: "六所権現（伊邪那岐・伊邪那美等六柱）",
    ancientBedrockOrLegend:
      "六所山（修験霊山）山頂の祭場に対する里宮跡。天台系中世修験と在地山林信仰が結合し、山伏たちの拠点であった修験道遺構。",
    sourceNote: "久山町誌・六所山修験記録",
  },
];

function normalizeSpotName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s・（）()「」『』]/g, "")
    .replace(/嚴/g, "厳")
    .toLowerCase();
}

/**
 * スポットが神社・神宮・祭祀拠点であるかを判定する
 */
export function isShrineSpot(spot: {
  name: string;
  kind?: string;
}): boolean {
  const kind = spot.kind ?? "";
  if (
    kind.includes("神社") ||
    kind.includes("神宮") ||
    kind.includes("大社") ||
    kind.includes("八幡信仰") ||
    kind.includes("海浜祭祀") ||
    kind.includes("山岳祭祀")
  ) {
    return true;
  }
  const normalized = normalizeSpotName(spot.name);
  return (
    normalized.endsWith("神社") ||
    normalized.endsWith("神宮") ||
    normalized.endsWith("大社") ||
    normalized.endsWith("八幡宮") ||
    normalized.endsWith("宮") ||
    normalized.endsWith("社")
  );
}

/**
 * スポット情報および登録プロファイル・辞書から祭神・古層神格コンテキストを解決する
 *
 * 解決優先度:
 * 1. 祭祀史7項目プロファイル（SACRED_SITE_STRATIGRAPHY_PROFILES）
 * 2. 全社対応軽量辞書（SHRINE_DEITY_REGISTRY）
 */
export function resolveSpotDeityContext(spot: {
  id?: string;
  name: string;
  kind?: string;
}): SpotDeityContext | undefined {
  // 1. 7項目プロファイルの確認（最優先）
  const profile = resolveSpotStratigraphyProfile(spot);
  if (profile) {
    return {
      currentDeities: profile.currentDeities,
      ancientBedrockOrLegend: profile.claimedOrigin.statement,
      sourceNote: profile.claimedOrigin.sourceTitle,
      hasStratigraphyProfile: true,
      stratigraphyProfileId: profile.id,
    };
  }

  // 2. 神社辞書（Base Registry）からのマッチング
  const normalizedTarget = normalizeSpotName(spot.name);
  const matchedEntry = SHRINE_DEITY_REGISTRY.find((entry) =>
    entry.matchNames.some((alias) => {
      const normalizedAlias = normalizeSpotName(alias);
      return (
        normalizedTarget === normalizedAlias ||
        normalizedTarget.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedTarget)
      );
    }),
  );

  if (matchedEntry) {
    return {
      currentDeities: matchedEntry.currentDeities,
      ancientBedrockOrLegend: matchedEntry.ancientBedrockOrLegend,
      sourceNote: matchedEntry.sourceNote,
      hasStratigraphyProfile: false,
    };
  }

  // 3. 神社種別だが辞書未登録の場合は undefined（非神社には何も返さない）
  return undefined;
}
