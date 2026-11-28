import { korasanSacredLandscapePack } from "../korasan-sacred-landscape-pack";
import { kunisakiSyncretismPack } from "../kunisaki-syncretism-pack";
import { miyajimaMisenSacredLandscapePack } from "../miyajima-misen-pack";
import { munakataOkinoshimaSacredLandscapePack } from "../munakata-okinoshima-pack";
import { ichinomiyaWesternNetworkPack, shikinaishaChikuzenBuzenPack } from "../pack-loader";
import { religionRelationsPack } from "../seed-packs";
import type { KnowledgePackTopicMapping } from "./types";

export const religionPackTopicMappings: readonly KnowledgePackTopicMapping[] = [
  // 8. 宗教諸関係（通史・時代地層基盤）
  {
    pack: religionRelationsPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "religion-history",
        presetId: "religion-history",
        perspectiveId: "religion",
        label: "古代祭祀の変遷と神道・仏教の接触",
        description: "日本列島の古代神祭りから神仏習合への展開と歴史的接触を見る",
        focus: "buddhist-contact",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        isStratum: true,
      },
      {
        id: "religion-syncretism",
        presetId: "religion-syncretism",
        perspectiveId: "religion",
        label: "神仏習合と八幡大菩薩・修験山岳信仰",
        description: "宇佐・国東・宮島・朝倉に見られる神宮寺・八幡信仰と密教・修験山岳信仰の重層を見る",
        focus: "syncretism",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        isStratum: true,
      },
      {
        id: "religion-concepts",
        presetId: "religion-concepts",
        perspectiveId: "religion",
        label: "自然崇拝・アニミズムと原初祭祀景観",
        description: "巨石・岩礁・海浜などの自然物への信仰と、後世の制度化された宗教を比較する",
        focus: "animism",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["structural"],
        isStratum: true,
      },
      {
        id: "archaic-local-shrines",
        presetId: "archaic-local-shrines",
        perspectiveId: "religion",
        label: "弥生遺跡・共同体に重層する地祇と古層地域祭礼",
        description: "記紀神話の主筋外で、弥生墳丘墓や古代集落に鎮座し、神輿渡御や粥占いを今に伝える地域共同体の古層神社を見る",
        focus: "archaic-rite",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 8b. 宇佐八幡・国東六郷満山神仏習合
  {
    pack: kunisakiSyncretismPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "usa-rokugo-syncretism-preset",
        presetId: "usa-rokugo-syncretism-preset",
        perspectiveId: "religion",
        label: "宇佐八幡と六郷満山の神仏習合・山岳修行網",
        description:
          "八幡総本宮・宇佐神宮を中核に、両子寺・熊野磨崖仏・富貴寺の六郷満山寺院群や筑紫の神仏併祀空間（浄心院）へ広がる神仏習合の求心構造",
        focus: "syncretism",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        spatialScale: "regional",
      },
    ],
  },
  // 8. 宮島・弥山
  {
    pack: miyajimaMisenSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "miyajima-sacred-relations",
        presetId: "miyajima-sacred-relations",
        perspectiveId: "religion",
        label: "厳島・弥山の神域景観と瀬戸内海上壇",
        description: "弥山の自然神域景観と社殿構成を、古代からの連続性を仮定せずに見る",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "miyajima-coastal-shrines",
            label: "海上の本社と島内摂末社網",
            description: "厳島神社本社と島内巡拝・摂末社の海浜祭祀空間",
            connectionIds: ["itsukushima-main-shrine", "miyajima-auxiliary-shrines"],
            default: true,
          },
          {
            id: "miyajima-misen-whole",
            label: "弥山山頂霊場を含む全神域",
            description: "海上社殿・摂末社と背後の弥山巨石修験霊場の立体構造",
            connectionIds: ["itsukushima-main-shrine", "miyajima-auxiliary-shrines", "misen-summit-sanctuary"],
          },
        ],
      },
      {
        id: "miyajima-current-paths",
        presetId: "miyajima-current-paths",
        perspectiveId: "route",
        label: "厳島・弥山信仰と山岳登拝路",
        description: "現在の登拝ルートを、実歩行・歴史的参詣路・山岳修験の祭祀的経路と分けて見る",
        focus: "mountain-pilgrimage",
        spatialScale: "regional",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "miyajima-patronage-and-space",
        presetId: "miyajima-patronage-and-space",
        perspectiveId: "politics",
        label: "平氏政権と瀬戸内海壇・厳島社殿",
        description: "12世紀平清盛の政治的庇護と社殿構成を、祭神や古層祭祀とは分けて見る",
        focus: "warrior-patronage",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 10. 宗像・沖ノ島
  {
    pack: munakataOkinoshimaSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "munakata-three-shrines",
        presetId: "munakata-three-shrines",
        perspectiveId: "religion",
        label: "沖ノ島古代国家祭祀と玄界灘神域景観",
        description: "沖津宮・中津宮・辺津宮の三宮構造と、玄界灘の孤島・沖ノ島から本土を結ぶ古代国家祭祀の景観",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 11. 式内名神大社（律令官撰制度）
  {
    pack: shikinaishaChikuzenBuzenPack,
    packCategory: "source-pack",
    topics: [
      {
        id: "shikinaisha-network-preset",
        presetId: "shikinaisha-network-preset",
        perspectiveId: "religion",
        label: "延喜式神名帳と式内名神大社制度",
        description: "延喜式神名帳に記された名神大社と祭神の関係および古代交通回廊の配置",
        focus: "state-system",
        spatialScale: "regional",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 12. 西国諸国一宮（令制国制度）
  {
    pack: ichinomiyaWesternNetworkPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "ichinomiya-western-preset",
        presetId: "ichinomiya-western-preset",
        perspectiveId: "religion",
        label: "令制国体制と諸国一宮の祭祀網",
        description: "令制国の一宮（筆頭大社）の空間配置と国司・律令祭祀体系",
        focus: "regional-order",
        spatialScale: "national",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "kyushu-genkai-ichinomiya",
            label: "九州・玄界灘諸島の一宮網",
            description: "筑前・豊前・筑後および壱岐・対馬など九州・国境諸島の筆頭大社群",
            connectionIds: ["kyushu-ichinomiya-circuit", "genkai-islands-ichinomiya-network"],
            default: true,
          },
          {
            id: "western-japan-ichinomiya",
            label: "九州〜山陽・瀬戸内広域一宮網",
            description: "九州圏から山陽道・瀬戸内海（厳島・吉備・長門）へ連なる西国一宮全体網",
            connectionIds: [
              "kyushu-ichinomiya-circuit",
              "sanyo-ichinomiya-corridor",
              "genkai-islands-ichinomiya-network",
            ],
          },
        ],
      },
    ],
  },
  // 12b. 高良山の重層聖域と神仏習合・神仏分離
  {
    pack: korasanSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "korasan-sacred-landscape-preset",
        presetId: "korasan-sacred-landscape-preset",
        perspectiveId: "religion",
        label: "高良山の重層聖域と神仏習合・神仏分離",
        description:
          "古墳墓域（祇園山・礫山）・7世紀古代山城「神籠石」・地主神高樹神・筑後国一宮高良大社・天台宗二十六ヶ寺と1869年神仏分離が折り重なる高良山の祭祀空間を読み解く",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        scopeClusters: [
          {
            id: "korasan-ancient-horizon",
            label: "古墳墓域・地主神・7世紀神籠石",
            description:
              "祇園山古墳・礫山古墳・御塚権現塚の古墳時代墓域と、高良大社・高樹神社・高良山神籠石・伊勢天照御祖神社の古代聖域層",
            connectionIds: [
              "conn-korasan-kofun-horizon",
              "conn-korasan-ancient-sanctuary",
            ],
            default: true,
          },
          {
            id: "korasan-full-syncretism",
            label: "神仏習合・近世整備・明治分離を含む全山重層",
            description:
              "古代層に加え、蓮台院御井寺本坊跡・奥の院・有馬氏整備・1869年神仏分離と安武町本村八幡宮移築部材までを含む全4地層",
            connectionIds: [
              "conn-korasan-kofun-horizon",
              "conn-korasan-ancient-sanctuary",
              "conn-korasan-medieval-syncretism",
              "conn-korasan-early-modern-reorg",
            ],
          },
        ],
      },
    ],
  },
];
