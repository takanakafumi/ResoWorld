import type { ArtifactProvenance } from "../artifact-overlay-types";

// ============================================================================
// 共通産地・工房・流通プロファイル（Shared Material Provenance Profiles）
// ============================================================================

export const PROVENANCE_SANKAKUBUCHI: ArtifactProvenance = {
  type: "disputed-academic",
  typeLabel: "製作地論争（舶載鏡論 vs 国産鏡論）",
  sourceRegion: "中国・曹魏官営工房（洛陽） または 畿内・大和中枢工房",
  materialName: "青銅（中国華北系鉛同位体比）",
  distributionRoute: "大和王権中枢から各地の地方首長墓へ『同笵鏡（兄弟鏡）』として分与・配布",
  scientificEvidence: "鉛同位体比分析（華北系原料）、文様銘文の共通性、全国30群以上の同笵鏡クロス分布",
  originSiteId: "site-kurozuka",
  originSiteName: "大和王権中枢工房（天理黒塚・三輪山麓）",
  originCoordinates: { latitude: 34.5619, longitude: 135.8344 },
};

export const PROVENANCE_ITOIGAWA_JADE_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "ヒスイ唯一の原産地・採取加工拠点",
  sourceRegion: "新潟県糸魚川市（姫川・青海川・小滝川流域）",
  materialName: "硬玉（ジェダイト / 本翡翠）",
  distributionRoute: "日本海沿岸海上航路（能登・越前・丹後・出雲・北部九州）および信濃川・内陸水運",
  scientificEvidence: "日本列島および朝鮮半島出土のヒスイは、屈折率・蛍光X線分析により全量が糸魚川産と同定",
  originSiteId: "site-itoigawa-choujagahara",
  originSiteName: "糸魚川ヒスイ原産地（長者ヶ原・小滝川）",
  originCoordinates: { latitude: 36.9856, longitude: 137.8592 },
};

export const PROVENANCE_ITOIGAWA_JADE_RECIPIENT: ArtifactProvenance = {
  type: "long-distance-trade",
  typeLabel: "糸魚川産・超遠隔交易受領",
  sourceRegion: "新潟県糸魚川（姫川・青海川流域）",
  materialName: "硬玉（糸魚川産ヒスイ勾玉）",
  distributionRoute: "日本海沿岸航路を経て各地の最高首長へ到達（約800kmにおよぶ超遠隔海上交易）",
  scientificEvidence: "蛍光X線分析・EPMAにより糸魚川産ヒスイと理化学的に確定",
  originSiteId: "site-itoigawa-choujagahara",
  originSiteName: "糸魚川ヒスイ原産地（長者ヶ原・小滝川）",
  originCoordinates: { latitude: 36.9856, longitude: 137.8592 },
};

export const PROVENANCE_IZUMO_JASPER_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "碧玉・瑪瑙採掘加工の一大センター",
  sourceRegion: "島根県松江市玉湯町 花仙山（出雲石・青碧玉・赤瑪瑙）",
  materialName: "良質青碧玉（出雲石）・赤瑪瑙",
  distributionRoute: "宍道湖・日本海水運、および山陰・山陽連絡道を通じてヤマト王権や全国首長層へ供給",
  scientificEvidence: "花仙山採掘坑および出雲玉作跡（国史跡）の工房遺構・原石・砥石出土",
  originSiteId: "site-kasensan-tamatsukuri",
  originSiteName: "出雲花仙山・玉作跡（玉造温泉）",
  originCoordinates: { latitude: 35.4092, longitude: 133.0089 },
};

export const PROVENANCE_IZUMO_JASPER_RECIPIENT: ArtifactProvenance = {
  type: "central-distribution",
  typeLabel: "出雲・日本海産碧玉加工品の王権集積",
  sourceRegion: "出雲（花仙山）または北陸・丹後玉作工房",
  materialName: "碧玉（車輪石・鍬形石・石釧）",
  distributionRoute: "出雲・北陸の玉作工房からヤマト王権中枢へ奉献・集積され、初期首長墓へ副葬",
  scientificEvidence: "石材の岩石学的同定（花仙山産青碧玉）および定型化された腕飾類形態",
  originSiteId: "site-kasensan-tamatsukuri",
  originSiteName: "出雲花仙山・玉作跡（玉造温泉）",
  originCoordinates: { latitude: 35.4092, longitude: 133.0089 },
};

export const PROVENANCE_WAKASUGIYAMA_CINNABAR_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "辰砂（水銀朱）採掘坑・原産地",
  sourceRegion: "徳島県阿南市 若杉山（日本唯一の弥生・古墳期辰砂鉱山採掘坑）",
  materialName: "天然辰砂（HgS / 硫化水銀・水銀朱）",
  distributionRoute: "那賀川水運から紀伊水道・瀬戸内海航路を経て近畿ヤマト王権や北部九州王墓へ供給",
  scientificEvidence: "国史跡指定。石器・敲石・磨石・辰砂原石が出土し採掘・精製工程が判明",
  originSiteId: "site-wakasugiyama",
  originSiteName: "阿南若杉山辰砂採掘遺跡",
  originCoordinates: { latitude: 33.8864, longitude: 134.5386 },
};

export const PROVENANCE_CINNABAR_RECIPIENT: ArtifactProvenance = {
  type: "long-distance-trade",
  typeLabel: "阿波・若杉山等からの超遠隔朱交易受領",
  sourceRegion: "四国・徳島若杉山 または 紀伊・伊勢丹生鉱山",
  materialName: "天然水銀朱（辰砂顔料数十kg）",
  distributionRoute: "紀伊水道・瀬戸内海航路を通じた長距離朱流通ネットワーク",
  scientificEvidence: "出土朱の微量元素分析・硫黄同位体比により阿波・若杉山産や中央構造線鉱脈との関連性が指摘",
  originSiteId: "site-wakasugiyama",
  originSiteName: "阿南若杉山辰砂採掘遺跡",
  originCoordinates: { latitude: 33.8864, longitude: 134.5386 },
};

export const PROVENANCE_YAYOI_HAN_MIRRORS: ArtifactProvenance = {
  type: "overseas-import",
  typeLabel: "大陸直輸入（中国前漢・後漢官営工房）",
  sourceRegion: "中国中原（長安・洛陽）官営工房（一部北部九州での仿製）",
  materialName: "青銅（中国産高錫青銅）",
  distributionRoute: "楽浪郡・朝鮮半島南部を経由した直接対外交易により伊都国・奴国王墓へ副葬",
  scientificEvidence: "漢代銘文、精緻な連弧文・方格規矩四神文、鉛同位体比分析",
  originSiteId: "site-hirabaru",
  originSiteName: "伊都国王墓（平原遺跡）",
  originCoordinates: { latitude: 33.5414, longitude: 130.2447 },
};

export const PROVENANCE_YAYOI_BRONZE_KYUSHU: ArtifactProvenance = {
  type: "production-workshop",
  typeLabel: "北部九州青銅器鋳造工房（自前製作）",
  sourceRegion: "北部九州工房（須玖岡本・吉野ヶ里・比恵遺跡群）",
  materialName: "青銅（原料銅・鉛: 朝鮮半島南部系）",
  distributionRoute: "玄界灘・有明海沿岸の拠点集落から北部九州・山陰・瀬戸内西南部へ流通",
  scientificEvidence: "須玖岡本・吉野ヶ里等からの青銅器鋳型（石製鞴羽口・坩堝・鋳型）多数出土",
  originSiteId: "site-sugu-bronze-workshop",
  originSiteName: "須玖岡本遺跡（北部九州青銅器鋳造工房）",
  originCoordinates: { latitude: 33.5358, longitude: 130.4447 },
};

export const PROVENANCE_YAYOI_BRONZE_KINKI: ArtifactProvenance = {
  type: "production-workshop",
  typeLabel: "近畿中枢青銅器工房（銅鐸製作拠点）",
  sourceRegion: "近畿工房（東奈良遺跡・唐古鍵遺跡等）",
  materialName: "青銅（古期中国鉛・半島系鉛）",
  distributionRoute: "淀川・大和川水系および瀬戸内海水運を通じて東海・近畿・四国・山陰へ流通",
  scientificEvidence: "東奈良遺跡（茨木市）からの銅鐸鋳型出土、同笵銅鐸（桜ヶ丘と加茂岩倉等）の広域分布",
  originSiteId: "site-sakuragaoka",
  originSiteName: "近畿銅鐸製作中枢（東奈良・桜ヶ丘）",
  originCoordinates: { latitude: 34.7214, longitude: 135.2389 },
};

export const PROVENANCE_IZUMO_BRONZE_HOARD: ArtifactProvenance = {
  type: "long-distance-trade",
  typeLabel: "東西青銅器の受領と出雲独自祭祀埋納",
  sourceRegion: "北部九州工房（銅矛） / 近畿工房（銅鐸） / 出雲独自製作（中細形c類銅剣）",
  materialName: "青銅（多種鉛同位体比）",
  distributionRoute: "日本海航路および瀬戸内水運を経て出雲の聖地へ集積・山中一括埋納",
  scientificEvidence: "加茂岩倉（39個銅鐸中、兵庫桜ヶ丘と同一鋳型同笵銅鐸が確認）",
  originSiteId: "site-kojindani",
  originSiteName: "出雲荒神谷・加茂岩倉祭祀聖域",
  originCoordinates: { latitude: 35.3789, longitude: 132.8689 },
};

export const PROVENANCE_HIRABARU_JADE_JASPER: ArtifactProvenance = {
  type: "long-distance-trade",
  typeLabel: "糸魚川ヒスイ・山陰出雲メノウ複合受領",
  sourceRegion: "新潟県糸魚川（ヒスイ）および 島根県花仙山（メノウ・碧玉）",
  materialName: "糸魚川産硬玉ヒスイ勾玉・出雲産瑪瑙管玉・瑠璃玉群（千数百点）",
  distributionRoute: "日本海沿岸航路（越〜出雲〜伊都国）を通じた長距離海上交易",
  scientificEvidence: "出土品国宝指定。蛍光X線分析による糸魚川産ヒスイ同定および石材鉱物鑑定",
  originSiteId: "site-itoigawa-choujagahara",
  originSiteName: "糸魚川ヒスイ原産地（小滝川・姫川）",
  originCoordinates: { latitude: 36.9856, longitude: 137.8592 },
};

export const PROVENANCE_NIUTSUHIME_CINNABAR_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "紀伊中央構造線水銀鉱床・丹生信仰総本社",
  sourceRegion: "和歌山県伊都郡かつらぎ町天野（紀伊山地中央構造線水銀鉱脈）",
  materialName: "天然水銀朱（紀伊丹生鉱脈産辰砂）",
  distributionRoute: "紀の川水運および紀伊水道を経て畿内大和・高野山地域へ供給",
  scientificEvidence: "丹生都比売神社社伝、周辺水銀鉱脈・辰砂露頭、古代丹生氏の鉱山掌握記録",
  originSiteId: "site-niutsuhime",
  originSiteName: "丹生都比売神社・紀伊丹生鉱脈",
  originCoordinates: { latitude: 34.2625, longitude: 135.5253 },
};

export const PROVENANCE_ISE_SEWATAKI_CINNABAR_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "伊勢中央構造線水銀鉱床（丹生水銀）",
  sourceRegion: "三重県多気郡多気町丹生（中央構造線沿い伊勢水銀鉱床）",
  materialName: "天然辰砂・精製水銀（丹生水銀）",
  distributionRoute: "櫛田川水運・伊勢湾から大和川・淀川へ搬入され、大和王権の王墓や東大寺大仏鍍金へ供給",
  scientificEvidence: "多気町丹生鉱山跡遺構、続日本紀記載（多気郡からの水銀献上）、鉱滓出土",
  originSiteId: "site-sewa-taki",
  originSiteName: "伊勢丹生水銀鉱山跡（勢和多気）",
  originCoordinates: { latitude: 34.4842, longitude: 136.5414 },
};

export const PROVENANCE_FUKIYA_BENGALA_SOURCE: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "酸化鉄赤色顔料（ベンガラ）一大鉱床",
  sourceRegion: "岡山県高梁市成羽町吹屋（吉備高原銅・磁硫鉄鉱鉱床）",
  materialName: "赤色酸化鉄顔料（ローハ・ベンガラ / Fe2O3）",
  distributionRoute: "高梁川水運を通じて瀬戸内海・山陰・近畿へ流通、装飾古墳や土器・建築彩色に利用",
  scientificEvidence: "吹屋銅山・ベンガラ製造遺構群、吉備の古墳・土器彩色顔料分析（酸化鉄同定）",
  originSiteId: "site-fukiya-bengala",
  originSiteName: "吉備吹屋ベンガラ鉱山",
  originCoordinates: { latitude: 34.8633, longitude: 133.4686 },
};

export const PROVENANCE_DECORATED_KOFUN_PIGMENTS: ArtifactProvenance = {
  type: "production-workshop",
  typeLabel: "極彩色鉱物顔料調合・玄室装飾",
  sourceRegion: "阿波・伊勢（水銀朱）および吉備（ベンガラ）等の鉱物顔料複合",
  materialName: "水銀朱（辰砂）・ベンガラ（酸化鉄赤）・黄土・緑泥石・石灰",
  distributionRoute: "瀬戸内・有明海・玄界灘の海上ネットワークで集められた鉱物顔料を絵師が調合",
  scientificEvidence: "王塚古墳壁画の蛍光X線分析によるHg（水銀朱）およびFe（ベンガラ）の塗り分け確認",
  originSiteId: "site-wakasugiyama",
  originSiteName: "阿南若杉山辰砂採掘遺跡（水銀朱供給元）",
  originCoordinates: { latitude: 33.8864, longitude: 134.5386 },
};

export const PROVENANCE_KOFUN_YAMATO_KEYHOLE: ArtifactProvenance = {
  type: "central-distribution",
  typeLabel: "ヤマト王権中枢発祥・前方後円墳体系",
  sourceRegion: "畿内・大和盆地（纒向・箸墓発祥）",
  materialName: "前方後円墳規格・竪穴式埋葬構造・特殊器台形埴輪",
  distributionRoute: "大和王権の政治同盟拡大に伴い、地方首長へ墳丘規格・設計図が伝播・全国共有化",
  scientificEvidence: "相似形墳丘の設計比率（1/2, 1/3相似形）、段築・葺石・埴輪配列の全国共通性",
  originSiteId: "site-hashihaka-kofun",
  originSiteName: "大和・箸墓古墳（前方後円墳発祥地）",
  originCoordinates: { latitude: 34.5392, longitude: 135.8422 },
};

export const PROVENANCE_KOFUN_YOKOANA_KYUSHU: ArtifactProvenance = {
  type: "overseas-import",
  typeLabel: "朝鮮半島系技術導入・巨石横穴式石室先駆",
  sourceRegion: "朝鮮半島（百済・伽耶系技術）〜 北部九州（玄界灘・有明海沿岸）",
  materialName: "巨石横穴式石室（羨道・玄室構造）・金銅装具・馬具",
  distributionRoute: "玄界灘対外ルートで北部九州へ早期定着後、追葬可能な新技術として畿内ヤマトへ波及",
  scientificEvidence: "半島南部の石室構造との直接的系統性、国宝金銅製馬具・透彫冠帽の出土",
  originSiteId: "site-miyajidake-kofun",
  originSiteName: "宮地嶽古墳（巨石横穴式石室）",
  originCoordinates: { latitude: 33.7814, longitude: 130.4856 },
};

export const PROVENANCE_KOFUN_UNDERGROUND_HAYATO: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "南九州シラス台地孤高墓制（地下式横穴墓）",
  sourceRegion: "南九州（宮崎・鹿児島シラス台地地帯）",
  materialName: "地下式横穴墓（竪坑＋地下玄室）・大量鉄製武器武具",
  distributionRoute: "南九州内陸の地域共同体に定着、前方後円墳体制と共存・併行した独自軍事集団の墓",
  scientificEvidence: "南九州特有の分布限界、シラス層掘削技術、重要文化財指定鉄器群",
  originSiteId: "site-shimauchi-underground",
  originSiteName: "島内地下式横穴墓群（南九州独自墓制）",
  originCoordinates: { latitude: 32.0622, longitude: 130.8244 },
};

export const PROVENANCE_KOFUN_YONDAN_IZUMO: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "山陰出雲独自王墓体系（四隅突出型墳丘墓）",
  sourceRegion: "出雲・宍道湖・斐伊川流域（西谷墳墓群発祥）",
  materialName: "四隅突出型墳丘墓（ヒトデ状墳丘・全面貼石構造・特殊壺）",
  distributionRoute: "山陰日本海沿岸（出雲・伯耆・因幡・丹後）および北陸（越）へ広域波及",
  scientificEvidence: "突出部貼石遺構、吉備系特殊壺・北陸系土器の共伴による日本海交易圏の実証",
  originSiteId: "site-nishidani-3",
  originSiteName: "出雲西谷墳墓群（四隅突出型墳丘墓発祥地）",
  originCoordinates: { latitude: 35.3589, longitude: 132.7614 },
};

export const PROVENANCE_KOFUN_TATETSUKI_KIBI: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "吉備独自首長墓体系（双方中円墓・特殊器台発祥）",
  sourceRegion: "吉備（岡山平野・高梁川流域）",
  materialName: "双方中円形墳丘墓・旋帯文石・特殊器台・特殊壺",
  distributionRoute: "吉備の葬送儀礼器（特殊器台）が大和王権の箸墓古墳に導入され『埴輪』の起源となる",
  scientificEvidence: "楯築遺跡出土の特殊器台と箸墓古墳出土の特殊器台形埴輪の文様・胎土の直接的系譜",
  originSiteId: "site-tatetsuki",
  originSiteName: "吉備楯築遺跡（双方中円墓発祥地）",
  originCoordinates: { latitude: 34.6547, longitude: 133.8219 },
};

export const PROVENANCE_KOFUN_YAYOI_KYUSHU: ArtifactProvenance = {
  type: "primary-source",
  typeLabel: "北部九州弥生伝統墓制（方形周溝墓・甕棺墓列）",
  sourceRegion: "北部九州（伊都国・奴国・筑紫平野）",
  materialName: "方形周溝墓・巨大墳丘甕棺墓・銅鏡玉類副葬",
  distributionRoute: "朝鮮半島系支石墓から甕棺墓・周溝墓へと発展し、鏡と玉による独自威信財墓制を形成",
  scientificEvidence: "平原遺跡の割竹形木棺・赤色顔料層、吉野ヶ里北墳丘墓の歴代甕棺配列",
  originSiteId: "site-yoshinogari-north-tomb",
  originSiteName: "吉野ヶ里北墳丘墓（九州弥生王墓）",
  originCoordinates: { latitude: 33.3253, longitude: 130.3861 },
};
