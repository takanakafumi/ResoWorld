import { ancientMaterialCulturePack } from "../ancient-material-culture-pack";
import { setouchiMaritimeNetworkPack } from "../setouchi-maritime-network-pack";
import type { KnowledgePackTopicMapping } from "./types";

export const archipelagoNetworkPackTopicMappings: readonly KnowledgePackTopicMapping[] = [
  // 17. 古代物質文化・威信財同盟網
  {
    pack: ancientMaterialCulturePack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "sankakubuchi-alliance-preset",
        presetId: "sankakubuchi-alliance-preset",
        perspectiveId: "politics",
        label: "三角縁神獣鏡：同笵鏡が結ぶ首長同盟",
        description:
          "黒塚・椿井大塚山・備前車塚・石塚山など、同一鋳型から作られた同笵鏡を分有した初期ヤマト王権と有力地域首長の政治的同盟ネットワーク",
        focus: "chieftain-alliance",
        spatialScale: "national",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural"],
        designatedFactions: [
          {
            id: "yamato-hegemony",
            label: "ヤマト王権・畿内中枢",
            color: "#eab308",
            anchorId: "place-kurozuka",
            memberIds: [
              "polity-yamato-court",
              "place-kurozuka",
              "place-hashihaka",
              "artifact-sankakubuchi-mirrors",
            ],
          },
          {
            id: "yamashiro-kizugawa",
            label: "南山城・木津川同盟",
            color: "#38bdf8",
            anchorId: "place-tsubai-otsukayama",
            memberIds: [
              "polity-yamashiro-clan",
              "place-tsubai-otsukayama",
            ],
          },
          {
            id: "kibi-setouchi",
            label: "吉備・瀬戸内海運同盟",
            color: "#a855f7",
            anchorId: "place-bizen-kurumazuka",
            memberIds: [
              "polity-kibi-clan",
              "place-bizen-kurumazuka",
            ],
          },
          {
            id: "buzen-suonada",
            label: "豊前・周防灘同盟",
            color: "#34d399",
            anchorId: "place-ishizukayama",
            memberIds: [
              "polity-buzen-clan",
              "place-ishizukayama",
            ],
          },
          {
            id: "chikugo-basin",
            label: "筑後川・有明海同盟",
            color: "#f59e0b",
            anchorId: "place-gionyama-kofun",
            memberIds: [
              "place-gionyama-kofun",
            ],
          },
          {
            id: "northern-kyushu-tradition",
            label: "北部九州・玄界灘固有勢力",
            color: "#f87171",
            anchorId: "place-hirabaru",
            memberIds: [
              "place-hirabaru",
            ],
          },
        ],
        boundaryAxis: {
          label: "前期同笵鏡分有による王権同盟線",
          icon: "🪞",
        },
      },
      {
        id: "prehistoric-supply-chain-preset",
        presetId: "prehistoric-supply-chain-preset",
        perspectiveId: "route",
        label: "古代列島鉱物交易：ヒスイ・朱・鉄・碧玉サプライチェーン",
        description:
          "糸魚川のヒスイ、若杉山の水銀朱、出雲の碧玉、伽耶の鉄。鉱脈・原産地から海人族・中継港を経てヤマト王権・主要聖域へ集積・還流する列島物資循環トポロジー",
        focus: "highways",
        spatialScale: "national",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "maritime-iron-jasper-west",
            label: "西日本・玄界灘海人系（鉄・碧玉）",
            description: "朝鮮半島伽耶の鉄と出雲花仙山の碧玉が海人族ルートで大和へ集積する西日本系統",
            connectionIds: ["prehistoric-supply-chain-iron", "prehistoric-supply-chain-jasper"],
            default: true,
          },
          {
            id: "ritual-jade-cinnabar-east",
            label: "列島威信財系（ヒスイ・水銀朱）",
            description: "糸魚川ヒスイと阿波若杉山・紀伊丹生の水銀朱が王権祭祀工房へ還流する系統",
            connectionIds: ["prehistoric-supply-chain-jade", "prehistoric-supply-chain-cinnabar"],
          },
          {
            id: "all-mineral-supply-chains",
            label: "4大鉱物サプライチェーン全俯瞰",
            description: "ヒスイ・水銀朱・鉄・碧玉の列島物資循環トポロジー全体",
            connectionIds: [
              "prehistoric-supply-chain-jade",
              "prehistoric-supply-chain-cinnabar",
              "prehistoric-supply-chain-iron",
              "prehistoric-supply-chain-jasper",
            ],
          },
        ],
      },
    ],
  },
  {
    pack: setouchiMaritimeNetworkPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "setouchi-maritime-route-preset",
        perspectiveId: "route",
        presetId: "setouchi-maritime-route-preset",
        label: "瀬戸内海・周防灘の潮待ち海路と海陸結節網",
        description:
          "玄界灘〜関門海峡〜周防灘西岸（豊前京都平野）〜厳島・大三島・鞆の浦〜吉備〜難波・大和を結ぶ狭水道と潮待ち港の海陸交通ネットワーク",
        focus: "sea-corridor",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["structural"],
        spatialScale: "national",
        scopeClusters: [
          {
            id: "suonada-west-hub",
            label: "玄界灘〜関門・周防灘西岸（豊前結節帯）",
            connectionIds: ["setouchi-suonada-west-stage"],
          },
          {
            id: "setouchi-wide-sea-lane",
            label: "瀬戸内海・潮待ち広域海路（鞆の浦〜大和）",
            connectionIds: ["setouchi-wide-corridor"],
          },
        ],
      },
      {
        id: "setouchi-polity-integration-preset",
        perspectiveId: "politics",
        presetId: "setouchi-polity-integration-preset",
        label: "ヤマト王権と列島海上網：地域別統合・対立・時代差比較",
        description:
          "玄界灘海人祭祀提携・筑紫君磐井の対立・豊前4〜6世紀首長墓と7世紀国家施設の時代区分・吉備巨大勢力再編・難波大和中枢を対比する比較マトリクス",
        focus: "chieftain-alliance",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        spatialScale: "national",
        scopeClusters: [
          {
            id: "kyushu-suonada-integration",
            label: "九州・周防灘圏（祭祀提携 vs 軍事 vs 時代差）",
            connectionIds: [
              "matrix-genkai-ritual-alliance",
              "matrix-chikushi-autonomy",
              "matrix-buzen-kofun-chiefs",
              "matrix-buzen-7c-state",
            ],
          },
          {
            id: "setouchi-kibi-yamato-integration",
            label: "周防灘・吉備〜大和王権軸（潮待ち要衝と再編）",
            connectionIds: [
              "matrix-buzen-kofun-chiefs",
              "matrix-buzen-7c-state",
              "matrix-kibi-to-yamato",
            ],
          },
        ],
      },
    ],
  },
];
