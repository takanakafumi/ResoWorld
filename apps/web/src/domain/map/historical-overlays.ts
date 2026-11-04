import type { FeatureCollection, Geometry } from "geojson";

export type HistoricalOverlayCategory =
  | "barrier"
  | "moat"
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

export type HistoricalOverlayGatePoint = {
  id: string;
  label: string;
  longitude: number;
  latitude: number;
  color: string;
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
  gates?: HistoricalOverlayGatePoint[];
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
      "鴻臚館・博多から水城（西門・東門）を経て大宰府政庁・宇美へ至る2本の古代官道と、平野狭窄部を封鎖する水城大土塁（外濠＋二重土塁）・小水城群・背後山城（大野城・基肄城）の空間防衛構造。",
    bounds: [
      [130.375, 33.44],
      [130.555, 33.605],
    ],
    legend: [
      { label: "水城大土塁・小水城（遮断防壁＋北側水濠）", color: "#ef4444" },
      { label: "西門官道（鴻臚館〜春日〜水城西門〜政庁）", color: "#38bdf8" },
      { label: "東門官道（博多〜板付〜水城東門〜姿見井〜政庁）", color: "#fbbf24" },
      { label: "山城防衛圏・政庁条坊領域", color: "#f87171", isPolygon: true },
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
            coordinates: createEllipsePolygon(130.522, 33.538, 0.016, 0.013),
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
            coordinates: [
              [
                [130.505, 33.5175],
                [130.526, 33.5175],
                [130.526, 33.501],
                [130.505, 33.501],
                [130.505, 33.5175],
              ],
            ],
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

        // 2. Mizuki Outer Water Moat (水城北側の幅60m外濠)
        {
          type: "Feature",
          properties: {
            id: "moat-mizuki-north",
            label: "水城・北側外濠（幅約60mの水濠）",
            sublabel: "博多側に水を湛えた防御水濠",
            category: "moat",
            color: "#00e5ff",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.4932, 33.5122],
              [130.4962, 33.5140],
              [130.5012, 33.5168],
              [130.5062, 33.5193],
              [130.5089, 33.5208],
            ],
          },
        },

        // 3. Barriers (Mizuki Main Embankment & Shomizuki)
        {
          type: "Feature",
          properties: {
            id: "barrier-mizuki-main",
            label: "水城大土塁（664年・全長1.2km・高さ約10m）",
            sublabel: "西門と東門の2関門のみ通過可能な大防壁",
            category: "barrier",
            color: "#ef4444",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.4926, 33.5116], // 下大利側西端
              [130.4956, 33.5133], // 水城西門（西門官道通過点）
              [130.5006, 33.5161], // 御笠川中央部
              [130.5056, 33.5186], // 水城東門・水城館（東門官道通過点）
              [130.5083, 33.5201], // 四王寺山麓東端
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            id: "barrier-shomizuki-west",
            label: "小水城群（大土居・天神山・上大利）",
            sublabel: "春日丘陵の谷間を塞ぐ西側遮断防壁群",
            category: "barrier",
            color: "#ef4444",
            dashed: true,
          },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [130.454, 33.5185], // 大土居水城跡
                [130.461, 33.5172],
              ],
              [
                [130.466, 33.5145], // 天神山水城跡
                [130.473, 33.5132],
              ],
              [
                [130.478, 33.5115], // 上大利水城跡
                [130.486, 33.5112],
              ],
            ],
          },
        },

        // 4. West Kando (鴻臚館〜春日・須玖岡本〜善一田西〜水城西門〜大宰府朱雀大路〜政庁)
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
              [130.3853, 33.5855], // 鴻臚館跡
              [130.4160, 33.5720], // 那珂・高宮付近
              [130.4511, 33.5380], // 須玖岡本・奴国の丘歴史公園
              [130.4832, 33.5135], // 善一田古墳群付近
              [130.4956, 33.5133], // 水城西門
              [130.5153, 33.5045], // 大宰府条坊・朱雀門南端
              [130.5153, 33.5147], // 大宰府政庁跡
            ],
          },
        },

        // 5. East Kando (博多・板付〜大野城展示室〜水城東門〜姿見井・衣掛天満宮〜政庁)
        {
          type: "Feature",
          properties: {
            id: "route-east-kando",
            label: "東門官道（博多・板付〜水城東門〜姿見井〜政庁）",
            sublabel: "板付・大野城展示室・水城東門・姿見井を結ぶ実務官道",
            category: "route-primary",
            color: "#fbbf24",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [130.4018, 33.5899], // 博多・那津沿岸
              [130.4320, 33.5775], // 比恵・那珂
              [130.4578, 33.5638], // 板付遺跡弥生館
              [130.4815, 33.5358], // 大野城市歴史資料展示室
              [130.4891, 33.5292], // 御陵寶満神社西縁
              [130.5056, 33.5186], // 水城東門・水城館
              [130.5095, 33.5198], // 姿見井・衣掛天満宮
              [130.5153, 33.5147], // 大宰府政庁跡
            ],
          },
        },

        // 6. Branch to Goryo Homan, Umi Hachimangu & Kamado Shrine
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
                [130.4891, 33.5292], // 御陵寶満神社
                [130.5064, 33.5697], // 宇美町立歴史民俗資料館
                [130.5123, 33.5678], // 宇美八幡宮
                [130.5158, 33.5652], // 奥宮・御胞衣ヶ浦
              ],
              [
                [130.5153, 33.5147], // 大宰府政庁
                [130.5478, 33.5284], // 竈門神社（宝満山）
              ],
            ],
          },
        },

        // 7. South Saikaido Route (大宰府〜二日市狭窄部〜筑紫神社〜基肄城)
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
              [130.5153, 33.5045], // 朱雀大路南端
              [130.5193, 33.4907], // 二日市・筑紫野市歴史博物館
              [130.5429, 33.4571], // 筑紫神社
              [130.5280, 33.4420], // 基肄関・基山麓
            ],
          },
        },
      ],
    },
    gates: [
      {
        id: "gate-mizuki-west",
        label: "水城西門",
        longitude: 130.4956,
        latitude: 33.5133,
        color: "#38bdf8",
      },
      {
        id: "gate-mizuki-east",
        label: "水城東門",
        longitude: 130.5056,
        latitude: 33.5186,
        color: "#fbbf24",
      },
      {
        id: "gate-suzaku",
        label: "朱雀門",
        longitude: 130.5153,
        latitude: 33.5045,
        color: "#c084fc",
      },
      {
        id: "gate-kii",
        label: "基肄関",
        longitude: 130.5280,
        latitude: 33.4420,
        color: "#ef4444",
      },
    ],
    labels: [
      {
        id: "lbl-mizuki",
        label: "水城大土塁 (664年・全長1.2km)",
        sublabel: "北側外濠＋二重土塁・西門と東門",
        longitude: 130.5006,
        latitude: 33.5161,
        color: "#ef4444",
        category: "barrier",
      },
      {
        id: "lbl-shomizuki",
        label: "小水城群 (西側遮断線)",
        sublabel: "大土居・天神山・上大利",
        longitude: 130.468,
        latitude: 33.512,
        color: "#ef4444",
        category: "barrier",
      },
      {
        id: "lbl-west-kando",
        label: "西門官道 (迎賓大道)",
        sublabel: "鴻臚館〜春日〜水城西門〜政庁",
        longitude: 130.435,
        latitude: 33.554,
        color: "#38bdf8",
        category: "route-primary",
      },
      {
        id: "lbl-east-kando",
        label: "東門官道 (実務・板付路)",
        sublabel: "博多〜板付〜水城東門〜姿見井",
        longitude: 130.472,
        latitude: 33.550,
        color: "#fbbf24",
        category: "route-primary",
      },
      {
        id: "lbl-ono-castle",
        label: "大野城防衛圏",
        sublabel: "四王寺山 (665年)",
        longitude: 130.522,
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
        label: "大宰府政庁・条坊",
        sublabel: "都府楼・朱雀大路",
        longitude: 130.518,
        latitude: 33.511,
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
            coordinates: createEllipsePolygon(130.4494, 33.5377, 0.022, 0.016),
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
                [130.4018, 33.5899], // 博多湾口
                [130.4350, 33.5750], // 比恵・那珂
                [130.4578, 33.5638], // 板付遺跡
                [130.4494, 33.5377], // 須玖岡本遺跡
              ],
              [
                [130.4578, 33.5638], // 板付遺跡
                [130.4999, 33.5778], // 光正寺古墳
                [130.5123, 33.5678], // 宇美八幡宮
              ],
              [
                [130.4999, 33.5778], // 光正寺古墳
                [130.4950, 33.6280], // 久山・山田
                [130.4880, 33.6680], // 古賀・小山田
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
    gates: [
      {
        id: "gate-moji-seki",
        label: "門司関",
        longitude: 130.963,
        latitude: 33.960,
        color: "#fbbf24",
      },
      {
        id: "gate-akama-seki",
        label: "赤間関",
        longitude: 130.948,
        latitude: 33.958,
        color: "#38bdf8",
      },
    ],
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

export type ProjectedOverlayPolygon = {
  id: string;
  label: string;
  category: HistoricalOverlayCategory;
  color: string;
  points: string;
};

export type ProjectedOverlayLine = {
  id: string;
  label: string;
  category: HistoricalOverlayCategory;
  color: string;
  dashed: boolean;
  segments: string[];
};

export type ProjectedOverlayGate = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

export type ProjectedHistoricalOverlay = {
  polygons: ProjectedOverlayPolygon[];
  lines: ProjectedOverlayLine[];
  gates: ProjectedOverlayGate[];
};

export const EMPTY_HISTORICAL_OVERLAY_PROJECTION: ProjectedHistoricalOverlay = {
  polygons: [],
  lines: [],
  gates: [],
};

export function projectHistoricalOverlay(
  preset: HistoricalOverlayPreset | undefined,
  projector: { project: (coord: [number, number]) => { x: number; y: number } },
): ProjectedHistoricalOverlay {
  if (!preset) return EMPTY_HISTORICAL_OVERLAY_PROJECTION;

  const polygons: ProjectedOverlayPolygon[] = [];
  const lines: ProjectedOverlayLine[] = [];

  for (const feature of preset.geojson.features) {
    const { id, label, category, color, dashed } = feature.properties;
    const geom = feature.geometry;

    if (geom.type === "Polygon") {
      const outerRing = geom.coordinates[0];
      if (!outerRing || outerRing.length < 3) continue;
      const pts = outerRing
        .map(([lng, lat]) => {
          const p = projector.project([lng, lat]);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      polygons.push({
        id,
        label,
        category,
        color,
        points: pts,
      });
    } else if (geom.type === "LineString") {
      if (geom.coordinates.length < 2) continue;
      const pts = geom.coordinates
        .map(([lng, lat]) => {
          const p = projector.project([lng, lat]);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      lines.push({
        id,
        label,
        category,
        color,
        dashed: Boolean(dashed),
        segments: [pts],
      });
    } else if (geom.type === "MultiLineString") {
      const segments: string[] = [];
      for (const lineCoords of geom.coordinates) {
        if (lineCoords.length < 2) continue;
        const pts = lineCoords
          .map(([lng, lat]) => {
            const p = projector.project([lng, lat]);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(" ");
        segments.push(pts);
      }
      if (segments.length > 0) {
        lines.push({
          id,
          label,
          category,
          color,
          dashed: Boolean(dashed),
          segments,
        });
      }
    }
  }

  const gates: ProjectedOverlayGate[] = (preset.gates ?? []).map((gate) => {
    const p = projector.project([gate.longitude, gate.latitude]);
    return {
      id: gate.id,
      label: gate.label,
      color: gate.color,
      x: Number(p.x.toFixed(1)),
      y: Number(p.y.toFixed(1)),
    };
  });

  return { polygons, lines, gates };
}
