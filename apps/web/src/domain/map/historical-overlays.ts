import type { FeatureCollection, Geometry } from "geojson";

export type HistoricalOverlayCategory =
  | "barrier"
  | "route-primary"
  | "route-secondary"
  | "zone-defense"
  | "zone-polity"
  | "sightline";

export type HistoricalOverlayFeatureProperties = {
  id: string;
  label: string;
  sublabel?: string;
  category: HistoricalOverlayCategory;
  color: string;
  dashed?: boolean;
};

export type HistoricalOverlayLabelPoint = {
  id: string;
  label: string;
  sublabel?: string;
  longitude: number;
  latitude: number;
  color: string;
  category: HistoricalOverlayCategory;
};

export type HistoricalOverlayLegendItem = {
  label: string;
  color: string;
  dashed?: boolean;
  isPolygon?: boolean;
};

export type HistoricalOverlayPreset = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  bounds: [[number, number], [number, number]];
  legend: HistoricalOverlayLegendItem[];
  geojson: FeatureCollection<Geometry, HistoricalOverlayFeatureProperties>;
  labels: HistoricalOverlayLabelPoint[];
};

/**
 * Helper to create a smooth geographic circle/ellipse polygon around a center coordinate.
 */
function createEllipsePolygon(
  centerLng: number,
  centerLat: number,
  radiusLng: number,
  radiusLat: number,
  steps = 28,
): number[][][] {
  const ring: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ring.push([
      Number((centerLng + Math.cos(angle) * radiusLng).toFixed(5)),
      Number((centerLat + Math.sin(angle) * radiusLat).toFixed(5)),
    ]);
  }
  return [ring];
}

export const HISTORICAL_OVERLAY_PRESETS: readonly HistoricalOverlayPreset[] = [
  {
    id: "dazaifu-kando-defense",
    label: "大宰府・東西官道と水城防衛網",
    shortLabel: "大宰府・官道と水城",
    description:
      "鴻臚館・博多から水城（西門・東門）を経て大宰府政庁・宇美へ至る2本の古代官道と、平野狭窄部を封鎖する水城大土塁・小水城・背後山城（大野城・基肄城）の空間防衛構造。",
    bounds: [
      [130.375, 33.435],
      [130.56, 33.605],
    ],
    legend: [
      { label: "水城・小水城（遮断土塁）", color: "#ef4444" },
      { label: "西門官道（鴻臚館〜水城西門〜政庁）", color: "#38bdf8" },
      { label: "東門官道（博多・板付〜水城東門〜政庁・宇美）", color: "#fbbf24" },
      { label: "山城防衛圏・政庁中枢領域", color: "#f87171", isPolygon: true },
    ],
    geojson: {
      type: "FeatureCollection",
      features: [
        // 1. Zones (Polygons)
        {
          type: "Feature",
          properties: {
            id: "zone-ono-castle",
            label: "大野城（四王寺山）防衛圏",
            sublabel: "665年築城・朝鮮式山城",
            category: "zone-defense",
            color: "#ef4444",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.516, 33.538, 0.016, 0.013),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-kii-castle",
            label: "基肄城（基山）防衛圏",
            sublabel: "665年築城・大宰府南関防衛",
            category: "zone-defense",
            color: "#ef4444",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.514, 33.445, 0.015, 0.011),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-dazaifu-seicho",
            label: "大宰府政庁・条坊中枢",
            sublabel: "都府楼・朱雀大路",
            category: "zone-polity",
            color: "#c084fc",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.5153, 33.511, 0.012, 0.009),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-korokan",
            label: "鴻臚館（筑紫館）迎賓圏",
            sublabel: "対外使節迎賓・外交拠点",
            category: "zone-polity",
            color: "#38bdf8",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.3853, 33.5855, 0.009, 0.007),
          },
        },

        // 2. Barriers (Mizuki & Shomizuki)
        {
          type: "Feature",
          properties: {
            id: "barrier-mizuki-main",
            label: "水城大土塁（664年・全長1.2km）",
            sublabel: "西門と東門の2関門のみ通過可能な大防壁",
            category: "barrier",
            color: "#ef4444",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.4902, 33.5125],
              [130.4925, 33.5142], // 水城西門
              [130.4985, 33.5152],
              [130.5050, 33.5162], // 水城東門
              [130.5078, 33.5178],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            id: "barrier-shomizuki-west",
            label: "小水城群（大土居・天神山・上大利）",
            sublabel: "春日丘陵の谷間を塞ぐ西側遮断線",
            category: "barrier",
            color: "#ef4444",
            dashed: true,
          },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [130.455, 33.5185],
                [130.462, 33.5172],
              ],
              [
                [130.467, 33.5145],
                [130.474, 33.5132],
              ],
              [
                [130.478, 33.5115],
                [130.485, 33.5112],
              ],
            ],
          },
        },

        // 3. West Kando (鴻臚館〜水城西門〜大宰府朱雀大路)
        {
          type: "Feature",
          properties: {
            id: "route-west-kando",
            label: "西門官道（鴻臚館〜春日〜水城西門〜政庁）",
            sublabel: "外国使節・公式迎賓の直線計画大道",
            category: "route-primary",
            color: "#38bdf8",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.3853, 33.5855], // 鴻臚館
              [130.416, 33.575],   // 比恵・那珂
              [130.451, 33.538],   // 春日（須玖岡本東縁）
              [130.478, 33.522],
              [130.4925, 33.5142], // 水城西門
              [130.508, 33.505],   // 条坊南端・朱雀門へ
              [130.5153, 33.5147], // 大宰府政庁
            ],
          },
        },

        // 4. East Kando (博多・板付〜水城東門〜姿見井〜大宰府)
        {
          type: "Feature",
          properties: {
            id: "route-east-kando",
            label: "東門官道（博多・板付〜水城東門〜姿見井〜政庁）",
            sublabel: "板付・大野城展示室・水城東門・衣掛天満宮を結ぶ実務官道",
            category: "route-primary",
            color: "#fbbf24",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.415, 33.593],   // 博多・那津
              [130.438, 33.578],   // 比恵東
              [130.4578, 33.5638], // 板付遺跡弥生館
              [130.4815, 33.5358], // 大野城歴史資料展示室付近
              [130.4908, 33.5185], // 善一田古墳群西縁
              [130.5050, 33.5162], // 水城東門
              [130.5060, 33.5150], // 姿見井・衣掛天満宮
              [130.5153, 33.5147], // 大宰府政庁
            ],
          },
        },

        // 5. Branch to Goryo Homan, Umi Hachimangu & Kamado Shrine
        {
          type: "Feature",
          properties: {
            id: "route-umi-kamado-branch",
            label: "宇美・宝満山連絡道（御陵寶満〜宇美八幡宮／竈門神社）",
            sublabel: "東門官道から宇美（産育聖地）と宝満山（鬼門霊峰）への枝道",
            category: "route-secondary",
            color: "#fbbf24",
            dashed: true,
          },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [130.498, 33.522],
                [130.5015, 33.5295], // 御陵寶満神社
                [130.5108, 33.5684], // 宇美八幡宮
                [130.5186, 33.5645], // 奥宮・御胞衣ヶ浦
              ],
              [
                [130.5153, 33.5147], // 大宰府政庁
                [130.5478, 33.5284], // 竈門神社（宝満山）
              ],
            ],
          },
        },

        // 6. South Saikaido Route (大宰府〜二日市狭窄部〜基肄城・筑紫神社)
        {
          type: "Feature",
          properties: {
            id: "route-south-saikaido",
            label: "西海道南路（大宰府〜筑紫神社〜基肄関）",
            sublabel: "基肄城と筑紫神社が睨む南側の関門回廊",
            category: "route-secondary",
            color: "#38bdf8",
            dashed: true,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.508, 33.505],
              [130.525, 33.488],
              [130.5401, 33.4735], // 筑紫神社
              [130.532, 33.445],   // 基肄城麓・関門
            ],
          },
        },
      ],
    },
    labels: [
      {
        id: "lbl-mizuki",
        label: "水城大土塁 (664年)",
        sublabel: "東門・西門関門",
        longitude: 130.4985,
        latitude: 33.5155,
        color: "#ef4444",
        category: "barrier",
      },
      {
        id: "lbl-shomizuki",
        label: "小水城群",
        sublabel: "大土居・天神山・上大利",
        longitude: 130.468,
        latitude: 33.512,
        color: "#ef4444",
        category: "barrier",
      },
      {
        id: "lbl-west-kando",
        label: "西門官道 (迎賓大道)",
        sublabel: "鴻臚館〜春日〜水城西門",
        longitude: 130.442,
        latitude: 33.548,
        color: "#38bdf8",
        category: "route-primary",
      },
      {
        id: "lbl-east-kando",
        label: "東門官道 (実務・板付路)",
        sublabel: "博多〜板付〜水城東門〜姿見井",
        longitude: 130.478,
        latitude: 33.548,
        color: "#fbbf24",
        category: "route-primary",
      },
      {
        id: "lbl-ono-castle",
        label: "大野城防衛圏",
        sublabel: "四王寺山 (665年)",
        longitude: 130.516,
        latitude: 33.539,
        color: "#ef4444",
        category: "zone-defense",
      },
      {
        id: "lbl-kii-castle",
        label: "基肄城防衛圏",
        sublabel: "基山 (665年)",
        longitude: 130.514,
        latitude: 33.445,
        color: "#ef4444",
        category: "zone-defense",
      },
      {
        id: "lbl-korokan",
        label: "鴻臚館 (筑紫館)",
        sublabel: "外交迎賓館",
        longitude: 130.3853,
        latitude: 33.588,
        color: "#38bdf8",
        category: "zone-polity",
      },
      {
        id: "lbl-dazaifu-seicho",
        label: "大宰府政庁",
        sublabel: "都府楼中枢",
        longitude: 130.518,
        latitude: 33.508,
        color: "#c084fc",
        category: "zone-polity",
      },
    ],
  },

  {
    id: "fukuoka-yayoi-polities",
    label: "奴国〜不弥国・弥生勢力圏と古水系回廊",
    shortLabel: "奴国〜不弥国・弥生圏",
    description:
      "須玖岡本（奴国中枢）、比恵・板付（初期環濠水田）、宇美・光正寺（不弥国候補）、久山・古賀（船原古墳）の勢力領域と河川・交易回廊。古地形（+3m/+5m海面）と重ねると入海との関係が浮かび上がります。",
    bounds: [
      [130.38, 33.51],
      [130.55, 33.68],
    ],
    legend: [
      { label: "弥生〜古墳初期の中枢勢力圏", color: "#2dd4bf", isPolygon: true },
      { label: "不弥国・糟屋東遷候補圏", color: "#fbbf24", isPolygon: true },
      { label: "水系・内陸交易回廊", color: "#38bdf8" },
    ],
    geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "zone-nakoku-core",
            label: "奴国中枢圏（須玖岡本・春日丘陵）",
            sublabel: "王墓・青銅器ガラス生産工房群",
            category: "zone-polity",
            color: "#2dd4bf",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.449, 33.538, 0.022, 0.016),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-itatuke-hie",
            label: "板付・比恵那珂 環濠農耕圏",
            sublabel: "最古級水田稲作・那津沿岸拠点",
            category: "zone-polity",
            color: "#2dd4bf",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.445, 33.568, 0.02, 0.014),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-fumi-umi",
            label: "不弥国候補圏（宇美・光正寺・粕屋南）",
            sublabel: "光正寺古墳・宇美川上流盆地",
            category: "zone-polity",
            color: "#fbbf24",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.506, 33.572, 0.018, 0.014),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-kasuya-koga",
            label: "久山・古賀（小山田・船原古墳）首長圏",
            sublabel: "新羅系金銅馬具・古糟屋入海奥部",
            category: "zone-polity",
            color: "#c084fc",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.492, 33.652, 0.022, 0.018),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "route-yayoi-corridor",
            label: "奴国〜板付〜不弥国（宇美）〜糟屋水系回廊",
            sublabel: "那珂川・御笠川・宇美川・多々良川を結ぶ弥生〜古墳回廊",
            category: "route-primary",
            color: "#38bdf8",
          },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [130.405, 33.595],   // 博多湾口
                [130.435, 33.575],   // 比恵・那珂
                [130.4578, 33.5638], // 板付遺跡
                [130.4494, 33.5377], // 須玖岡本遺跡
              ],
              [
                [130.4578, 33.5638], // 板付遺跡
                [130.4999, 33.5778], // 光正寺古墳
                [130.5108, 33.5684], // 宇美八幡宮
              ],
              [
                [130.4999, 33.5778], // 光正寺古墳
                [130.495, 33.628],   // 久山・山田
                [130.488, 33.668],   // 古賀・小山田
              ],
            ],
          },
        },
      ],
    },
    labels: [
      {
        id: "lbl-nakoku",
        label: "奴国中枢圏 (須玖岡本)",
        sublabel: "王墓・青銅器工房",
        longitude: 130.449,
        latitude: 33.535,
        color: "#2dd4bf",
        category: "zone-polity",
      },
      {
        id: "lbl-itatuke",
        label: "板付・比恵 環濠水田圏",
        sublabel: "初期稲作・古博多湾岸",
        longitude: 130.448,
        latitude: 33.568,
        color: "#2dd4bf",
        category: "zone-polity",
      },
      {
        id: "lbl-fumi",
        label: "不弥国候補圏 (宇美・光正寺)",
        sublabel: "前方後円墳・産育聖地",
        longitude: 130.508,
        latitude: 33.575,
        color: "#fbbf24",
        category: "zone-polity",
      },
      {
        id: "lbl-koga-hisayama",
        label: "久山・古賀首長圏",
        sublabel: "斎宮伝承・船原古墳",
        longitude: 130.492,
        latitude: 33.652,
        color: "#c084fc",
        category: "zone-polity",
      },
    ],
  },

  {
    id: "kanmon-strait-geopolitics",
    label: "関門海峡（穴門）・潮流と海峡要塞網",
    shortLabel: "関門海峡・潮流と要塞",
    description:
      "早鞆瀬戸（和布刈〜壇ノ浦）の海峡最狭部潮流と、甲宗八幡（門司城・筆立山）・戸上山城・火の山・長府（豊浦宮）が睨み合う海峡防衛・古代山陽道渡海ルート。",
    bounds: [
      [130.91, 33.885],
      [131.02, 34.01],
    ],
    legend: [
      { label: "早鞆瀬戸・関門海峡潮流軸", color: "#38bdf8" },
      { label: "古代山陽道〜門司関〜豊前道", color: "#fbbf24" },
      { label: "海峡監視・山城要塞圏", color: "#ef4444", isPolygon: true },
    ],
    geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "zone-moji-fortress",
            label: "門司関・門司城（和布刈・甲宗八幡）要塞圏",
            sublabel: "海峡最狭部南岸・筆立山要害",
            category: "zone-defense",
            color: "#ef4444",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.966, 33.956, 0.012, 0.01),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-tonogami-fortress",
            label: "戸上山城・大里監視圏",
            sublabel: "周防灘〜関門西口を見下ろす霊峰山城",
            category: "zone-defense",
            color: "#ef4444",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.944, 33.902, 0.014, 0.011),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-dannoura-hinoyama",
            label: "壇ノ浦・火の山海峡監視圏",
            sublabel: "海峡最狭部北岸・源平合戦決戦地",
            category: "zone-defense",
            color: "#f97316",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.958, 33.969, 0.012, 0.009),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-chofu-toyoura",
            label: "長府・忌宮（穴門豊浦宮）中枢圏",
            sublabel: "仲哀天皇・神功皇后の海峡行宮拠点",
            category: "zone-polity",
            color: "#c084fc",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.988, 33.996, 0.014, 0.011),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "route-kanmon-current",
            label: "関門海峡・早鞆瀬戸潮流軸（玄界灘⇄周防灘）",
            sublabel: "最大流速約10ノットの難所・潮待ちと潮流逆転の舞台",
            category: "route-primary",
            color: "#38bdf8",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.905, 33.915],
              [130.935, 33.938],
              [130.961, 33.962], // 早鞆瀬戸（和布刈〜壇ノ浦最狭部）
              [130.985, 33.975],
              [131.025, 33.965], // 部埼・周防灘へ
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            id: "route-sanyodo-buzen",
            label: "古代山陽道〜門司関渡海〜大里〜豊前道",
            sublabel: "長府（豊浦宮）から赤間関・門司関を渡り大宰府・宇佐へ分岐する幹線",
            category: "route-primary",
            color: "#fbbf24",
            dashed: true,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.988, 33.996], // 忌宮神社（長府）
              [130.948, 33.958], // 赤間神宮
              [130.963, 33.960], // 和布刈神社・門司関
              [130.969, 33.950], // 甲宗八幡宮
              [130.938, 33.905], // 大里・戸上神社麓
              [130.915, 33.885], // 小倉・大宰府／豊前道へ
            ],
          },
        },
      ],
    },
    labels: [
      {
        id: "lbl-hayatomo",
        label: "早鞆瀬戸 (最狭部潮流)",
        sublabel: "和布刈 ⇄ 壇ノ浦",
        longitude: 130.961,
        latitude: 33.963,
        color: "#38bdf8",
        category: "route-primary",
      },
      {
        id: "lbl-moji-fortress",
        label: "門司関・筆立山要塞圏",
        sublabel: "和布刈・甲宗八幡宮",
        longitude: 130.972,
        latitude: 33.953,
        color: "#ef4444",
        category: "zone-defense",
      },
      {
        id: "lbl-tonogami",
        label: "戸上山城・大里監視圏",
        sublabel: "戸上神社・柳御所",
        longitude: 130.944,
        latitude: 33.902,
        color: "#ef4444",
        category: "zone-defense",
      },
      {
        id: "lbl-toyoura",
        label: "穴門豊浦宮 (長府)",
        sublabel: "忌宮神社・山陽道終端",
        longitude: 130.988,
        latitude: 33.997,
        color: "#c084fc",
        category: "zone-polity",
      },
    ],
  },

  {
    id: "genkai-maritime-corridors",
    label: "玄界灘・海人族の航路と宗像遥拝視軸",
    shortLabel: "玄界灘・海人航路と視軸",
    description:
      "宗像三宮（辺津宮〜大島・中津宮〜沖ノ島・沖津宮）を一直線に貫く約60kmの海上遥拝視軸と、志賀島（阿曇氏）・博多湾（住吉・筥崎・香椎）を結ぶ玄界灘の海上交通網。",
    bounds: [
      [130.1, 33.55],
      [130.65, 34.28],
    ],
    legend: [
      { label: "宗像三宮〜沖ノ島 遥拝視軸", color: "#f43f5e" },
      { label: "玄界灘・博多湾 海人族航路", color: "#38bdf8" },
      { label: "海人族中枢聖域圏", color: "#fbbf24", isPolygon: true },
    ],
    geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "zone-munakata-core",
            label: "宗像・神湊〜大島海域圏",
            sublabel: "宗像氏の海上祭祀拠点",
            category: "zone-polity",
            color: "#fbbf24",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.48, 33.86, 0.06, 0.045),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "zone-shikanoshima-hakata",
            label: "志賀島・博多湾（那津）海域圏",
            sublabel: "阿曇氏・住吉三神・神功皇后伝承海域",
            category: "zone-polity",
            color: "#38bdf8",
          },
          geometry: {
            type: "Polygon",
            coordinates: createEllipsePolygon(130.37, 33.64, 0.075, 0.045),
          },
        },
        {
          type: "Feature",
          properties: {
            id: "sightline-munakata-okinoshima",
            label: "宗像三宮〜沖ノ島 一直線遥拝視軸（約60km）",
            sublabel: "辺津宮〜大島（中津宮・遥拝所）〜絶海の沖ノ島を結ぶ神聖視軸",
            category: "sightline",
            color: "#f43f5e",
            dashed: true,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.5144, 33.8311], // 宗像大社 辺津宮
              [130.4364, 33.8965], // 大島 中津宮
              [130.4226, 33.9088], // 大島 沖津宮遥拝所
              [130.1042, 34.2415], // 沖ノ島 沖津宮
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            id: "route-genkai-coastal",
            label: "博多湾〜志賀島〜福津（宮地嶽）〜宗像 海上回廊",
            sublabel: "那津（住吉・筥崎・香椎）から志賀島を経て玄界灘へ出る古代航路",
            category: "route-primary",
            color: "#38bdf8",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.4135, 33.5858], // 筑前国一宮 住吉神社
              [130.4225, 33.6150], // 筥崎宮
              [130.4578, 33.6601], // 香椎宮
              [130.3129, 33.6664], // 志賀海神社（志賀島）
              [130.4853, 33.7808], // 宮地嶽神社（福津）
              [130.4820, 33.8520], // 神湊（宗像）
              [130.4364, 33.8965], // 大島
            ],
          },
        },
      ],
    },
    labels: [
      {
        id: "lbl-munakata-sightline",
        label: "宗像三宮〜沖ノ島 遥拝視軸",
        sublabel: "辺津宮〜大島〜沖ノ島 (約60km)",
        longitude: 130.32,
        latitude: 34.04,
        color: "#f43f5e",
        category: "sightline",
      },
      {
        id: "lbl-hakata-bay",
        label: "博多湾・那津海域圏",
        sublabel: "志賀海・住吉・筥崎・香椎",
        longitude: 130.37,
        latitude: 33.64,
        color: "#38bdf8",
        category: "zone-polity",
      },
    ],
  },
];

const OVERLAY_BY_ID = new Map<string, HistoricalOverlayPreset>(
  HISTORICAL_OVERLAY_PRESETS.map((preset) => [preset.id, preset]),
);

export function getHistoricalOverlayPreset(id: string): HistoricalOverlayPreset | undefined {
  return OVERLAY_BY_ID.get(id);
}
