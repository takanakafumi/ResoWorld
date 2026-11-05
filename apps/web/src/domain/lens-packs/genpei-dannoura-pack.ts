import { LensKnowledgePackSchema } from "./schema";

export const genpeiDannouraPack = LensKnowledgePackSchema.parse({
  schemaVersion: "0.1.0",
  id: "genpei-dannoura-network",
  version: "0.1.0",
  label: "源平合戦・瀬戸内海壇と壇ノ浦決戦",
  description: "平清盛の厳島造営と瀬戸内掌握から、安徳天皇・平知盛・平教経ら平家一門と源義経・緒方惟義ら追討軍の激突、赤間関壇ノ浦の終焉に至る相関網を保持する。",
  status: "draft",
  releasedAt: "2026-10-21",
  sources: [
    {
      id: "heike-monogatari",
      kind: "classical-text",
      title: "平家物語",
      publisher: "岩波文庫",
      reviewStatus: "reviewed",
      note: "厳島崇敬、壇ノ浦合戦条における知盛・教経の奮戦、二位尼と安徳天皇の入水、建礼門院の救出を確認。",
    },
    {
      id: "azumakagami",
      kind: "classical-text",
      title: "吾妻鏡",
      publisher: "吉川弘文館",
      reviewStatus: "reviewed",
      note: "元暦2年（1185年）3月24日条の壇ノ浦合戦記録、義経軍の勝報および捕虜連行の記録を確認。",
    },
    {
      id: "itsukushima-history",
      kind: "modern-reference",
      title: "厳島神社社記・文化財解説",
      publisher: "厳島神社",
      reviewStatus: "reviewed",
      note: "平清盛が安芸守任官以来崇敬し、海上に寝殿造社殿群を造営して平家一門の繁栄と海上交通安全を祈願した由緒を確認。",
    },
    {
      id: "akama-jingu-official",
      kind: "modern-reference",
      title: "赤間神宮公式由緒・阿弥陀寺",
      publisher: "赤間神宮",
      url: "https://www.tiki.ne.jp/~akama-jingu/",
      reviewStatus: "reviewed",
      note: "壇ノ浦に入水した安徳天皇を祀る阿弥陀寺御陵および平家一門の七盛塚（平知盛・教経ら）の由緒を確認。",
    },
    {
      id: "shimonoseki-dannoura-history",
      kind: "modern-reference",
      title: "壇ノ浦古戦場・みもすそ川公園｜下関市公式観光サイト",
      publisher: "下関市",
      url: "https://shimonoseki.travel/spot/detail.php?id=141",
      reviewStatus: "reviewed",
      note: "源義経の八艘飛び像と平知盛の碇知盛像が立つ壇ノ浦海戦の地。潮の流れが勝敗を分けた地理的特質を確認。",
    },
    {
      id: "tomonoura-heritage",
      kind: "modern-reference",
      title: "鞆の浦の歴史と瀬戸内航路",
      publisher: "福山市",
      reviewStatus: "reviewed",
      note: "平家一門が福原から西へ落ち延びる際に滞在した潮待ちの重要港湾拠点。",
    },
  ],
  viewpoints: [
    {
      id: "documented-genpei",
      kind: "source",
      label: "古典軍記・史料で確認できる源平動向",
      description: "『平家物語』『吾妻鏡』および社寺由緒に記録された武将・皇族の動向と決戦地。",
    },
    {
      id: "maritime-stratum-analysis",
      kind: "analytical",
      label: "瀬戸内海交通掌握と水軍同盟の崩壊",
      description: "平家の厳島・鞆の浦・壇ノ浦に連なる海上補給線と、義経急襲・水軍離反による制海権喪失の構造モデル。",
    },
  ],
  entities: [
    // 人物 (Person)
    { id: "taira-no-kiyomori", kind: "person", label: "平清盛", aliases: ["清盛", "入道相国"] },
    { id: "emperor-antoku", kind: "person", label: "安徳天皇", aliases: ["言仁親王"] },
    { id: "kenreimon-in", kind: "person", label: "建礼門院", aliases: ["平徳子", "徳子"] },
    { id: "taira-no-tomomori", kind: "person", label: "平知盛", aliases: ["知盛", "新中納言"] },
    { id: "taira-no-noritsune", kind: "person", label: "平教経", aliases: ["教経", "能登守"] },
    { id: "minamoto-no-yoshitsune", kind: "person", label: "源義経", aliases: ["義経", "九郎判官"] },
    { id: "ogata-koreyoshi", kind: "person", label: "緒方惟義", aliases: ["惟義", "大神惟義"] },

    // 勢力・陣営 (Polity / Group)
    { id: "heike-clan", kind: "polity", label: "平家一門", aliases: ["平氏", "伊勢平氏"] },
    { id: "genji-clan", kind: "polity", label: "源氏軍", aliases: ["鎌倉幕府軍", "河内源氏"] },
    { id: "suigun-allies", kind: "group", label: "瀬戸内水軍諸氏", aliases: ["熊野水軍", "松浦党", "河野水軍"] },

    // 出来事 (Event)
    { id: "battle-of-dannoura", kind: "event", label: "壇ノ浦の戦い", aliases: ["壇ノ浦決戦"] },
    { id: "battle-of-yashima", kind: "event", label: "屋島の戦い", aliases: [] },

    // 地点 (Place)
    { id: "itsukushima-shrine", kind: "place", label: "厳島神社", aliases: ["宮島厳島神社"], coordinates: { latitude: 34.2959, longitude: 132.3197 } },
    { id: "akama-shrine", kind: "place", label: "赤間神宮", aliases: ["阿弥陀寺", "安徳天皇阿弥陀寺陵"], coordinates: { latitude: 33.9575, longitude: 130.9482 } },
    { id: "dannoura-battlefield", kind: "place", label: "壇ノ浦古戦場", aliases: ["壇ノ浦", "みもすそ川公園"], coordinates: { latitude: 33.9678, longitude: 130.9614 } },
    { id: "tomonoura", kind: "place", label: "鞆の浦", aliases: ["鞆"], coordinates: { latitude: 34.3828, longitude: 133.3831 } },
  ],
  assertions: [
    {
      id: "genpei-001",
      subjectId: "taira-no-kiyomori",
      predicate: "led",
      objectId: "heike-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-002",
      subjectId: "taira-no-kiyomori",
      predicate: "associated_with",
      objectId: "itsukushima-shrine",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari", "itsukushima-history"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-003",
      subjectId: "taira-no-kiyomori",
      predicate: "parent_of",
      objectId: "kenreimon-in",
      relationFamily: "genealogy",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-004",
      subjectId: "kenreimon-in",
      predicate: "mother_of",
      objectId: "emperor-antoku",
      relationFamily: "genealogy",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-005",
      subjectId: "emperor-antoku",
      predicate: "represented",
      objectId: "heike-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-006",
      subjectId: "heike-clan",
      predicate: "used_base_at",
      objectId: "tomonoura",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["tomonoura-heritage"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-007",
      subjectId: "taira-no-tomomori",
      predicate: "commanded",
      objectId: "heike-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-008",
      subjectId: "taira-no-noritsune",
      predicate: "represented",
      objectId: "heike-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-009",
      subjectId: "minamoto-no-yoshitsune",
      predicate: "commanded",
      objectId: "genji-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-010",
      subjectId: "minamoto-no-yoshitsune",
      predicate: "participated_in",
      objectId: "battle-of-yashima",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari", "azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-011",
      subjectId: "heike-clan",
      predicate: "opposed",
      objectId: "genji-clan",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari", "azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-012",
      subjectId: "ogata-koreyoshi",
      predicate: "allied_with",
      objectId: "genji-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-013",
      subjectId: "suigun-allies",
      predicate: "allied_with",
      objectId: "genji-clan",
      relationFamily: "association",
      nature: "reviewed-reference",
      viewpointIds: ["maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari", "azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-014",
      subjectId: "heike-clan",
      predicate: "participated_in",
      objectId: "battle-of-dannoura",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari", "azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-015",
      subjectId: "genji-clan",
      predicate: "participated_in",
      objectId: "battle-of-dannoura",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["heike-monogatari", "azumakagami"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-016",
      subjectId: "battle-of-dannoura",
      predicate: "occurred_at",
      objectId: "dannoura-battlefield",
      relationFamily: "historical-context",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["shimonoseki-dannoura-history"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-017",
      subjectId: "emperor-antoku",
      predicate: "enshrined_at",
      objectId: "akama-shrine",
      relationFamily: "enshrinement",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["akama-jingu-official"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-018",
      subjectId: "taira-no-tomomori",
      predicate: "enshrined_at",
      objectId: "akama-shrine",
      relationFamily: "enshrinement",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei"],
      sourceIds: ["akama-jingu-official"],
      confidence: "high",
      reviewStatus: "reviewed",
    },
  ],
  presets: [
    {
      id: "genpei-dannoura-preset",
      label: "源平合戦・瀬戸内海壇と壇ノ浦決戦",
      lensType: "relationship",
      description: "平清盛の厳島造営と瀬戸内掌握から、安徳天皇・平知盛・平教経ら平家一門と源義経・緒方惟義ら追討軍の激突、赤間関壇ノ浦の終焉に至る相関網",
      rootEntityIds: ["taira-no-kiyomori", "emperor-antoku", "minamoto-no-yoshitsune", "taira-no-tomomori"],
      relationFamilies: ["association", "genealogy", "historical-context", "enshrinement"],
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      expansionDepth: 6,
      visibleEntityKinds: ["person", "polity", "event", "group", "place"],
      mapConnections: [
        {
          id: "genpei-maritime-geography",
          label: "源平決戦と瀬戸内・赤間関の海上軍事網",
          description: "平家崇敬の厳島神社、潮待ち拠点鞆の浦、安徳天皇と平家武将を祀る赤間神宮、そして決戦の地壇ノ浦を、瀬戸内海軍事・祈祷の地理として接続する。",
          anchorEntityId: "taira-no-kiyomori",
          contextEntityIds: ["heike-clan", "battle-of-dannoura", "emperor-antoku"],
          placeEntityIds: ["itsukushima-shrine", "akama-shrine", "dannoura-battlefield", "tomonoura"],
          assertionIds: ["genpei-002", "genpei-006", "genpei-016", "genpei-017"],
          explorationQuestions: {
            "akama-shrine": {
              question: "赤間神宮（安徳天皇阿弥陀寺陵・平家七盛塚）の空間配置から、壇ノ浦入水後の平家鎮魂と中世海上信仰の重なりをどのように観察できるか？",
              reason: "厳島神社や鞆の浦と対比し、平家一門の栄華から壇ノ浦決戦・滅亡に至る終焉の聖地を確かめるため。",
            },
            "dannoura-battlefield": {
              question: "関門海峡・壇ノ浦（みもすそ川）の潮の流れと地形から、義経軍の急襲と平家水軍敗因の地理的条件をどのように追体験できるか？",
              reason: "瀬戸内海の潮待ち港（鞆の浦）や厳島での制海権獲得から、関門海峡最狭部での決戦の帰結を読み解くため。",
            },
          },
        },
      ],
      spatialOverlay: {
        "type": "FeatureCollection",
        "features": [
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-moji-fortress",
                                "label": "門司城・古城山要塞",
                                "sublabel": "源平・南北朝・戦国の海峡監視拠点",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.977,
                                                        33.957
                                                ],
                                                [
                                                        130.9767,
                                                        33.959
                                                ],
                                                [
                                                        130.97581,
                                                        33.9609
                                                ],
                                                [
                                                        130.97438,
                                                        33.96261
                                                ],
                                                [
                                                        130.97248,
                                                        33.96404
                                                ],
                                                [
                                                        130.97021,
                                                        33.96511
                                                ],
                                                [
                                                        130.96767,
                                                        33.96577
                                                ],
                                                [
                                                        130.965,
                                                        33.966
                                                ],
                                                [
                                                        130.96233,
                                                        33.96577
                                                ],
                                                [
                                                        130.95979,
                                                        33.96511
                                                ],
                                                [
                                                        130.95752,
                                                        33.96404
                                                ],
                                                [
                                                        130.95562,
                                                        33.96261
                                                ],
                                                [
                                                        130.95419,
                                                        33.9609
                                                ],
                                                [
                                                        130.9533,
                                                        33.959
                                                ],
                                                [
                                                        130.953,
                                                        33.957
                                                ],
                                                [
                                                        130.9533,
                                                        33.955
                                                ],
                                                [
                                                        130.95419,
                                                        33.9531
                                                ],
                                                [
                                                        130.95562,
                                                        33.95139
                                                ],
                                                [
                                                        130.95752,
                                                        33.94996
                                                ],
                                                [
                                                        130.95979,
                                                        33.94889
                                                ],
                                                [
                                                        130.96233,
                                                        33.94823
                                                ],
                                                [
                                                        130.965,
                                                        33.948
                                                ],
                                                [
                                                        130.96767,
                                                        33.94823
                                                ],
                                                [
                                                        130.97021,
                                                        33.94889
                                                ],
                                                [
                                                        130.97248,
                                                        33.94996
                                                ],
                                                [
                                                        130.97438,
                                                        33.95139
                                                ],
                                                [
                                                        130.97581,
                                                        33.9531
                                                ],
                                                [
                                                        130.9767,
                                                        33.955
                                                ],
                                                [
                                                        130.977,
                                                        33.957
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-tonogami-fortress",
                                "label": "戸ノ上城（戸ノ上山）",
                                "sublabel": "門司背後の要衝山城",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.982,
                                                        33.926
                                                ],
                                                [
                                                        130.98165,
                                                        33.92845
                                                ],
                                                [
                                                        130.98061,
                                                        33.93077
                                                ],
                                                [
                                                        130.97895,
                                                        33.93286
                                                ],
                                                [
                                                        130.97673,
                                                        33.9346
                                                ],
                                                [
                                                        130.97407,
                                                        33.93591
                                                ],
                                                [
                                                        130.97112,
                                                        33.93672
                                                ],
                                                [
                                                        130.968,
                                                        33.937
                                                ],
                                                [
                                                        130.96488,
                                                        33.93672
                                                ],
                                                [
                                                        130.96193,
                                                        33.93591
                                                ],
                                                [
                                                        130.95927,
                                                        33.9346
                                                ],
                                                [
                                                        130.95705,
                                                        33.93286
                                                ],
                                                [
                                                        130.95539,
                                                        33.93077
                                                ],
                                                [
                                                        130.95435,
                                                        33.92845
                                                ],
                                                [
                                                        130.954,
                                                        33.926
                                                ],
                                                [
                                                        130.95435,
                                                        33.92355
                                                ],
                                                [
                                                        130.95539,
                                                        33.92123
                                                ],
                                                [
                                                        130.95705,
                                                        33.91914
                                                ],
                                                [
                                                        130.95927,
                                                        33.9174
                                                ],
                                                [
                                                        130.96193,
                                                        33.91609
                                                ],
                                                [
                                                        130.96488,
                                                        33.91528
                                                ],
                                                [
                                                        130.968,
                                                        33.915
                                                ],
                                                [
                                                        130.97112,
                                                        33.91528
                                                ],
                                                [
                                                        130.97407,
                                                        33.91609
                                                ],
                                                [
                                                        130.97673,
                                                        33.9174
                                                ],
                                                [
                                                        130.97895,
                                                        33.91914
                                                ],
                                                [
                                                        130.98061,
                                                        33.92123
                                                ],
                                                [
                                                        130.98165,
                                                        33.92355
                                                ],
                                                [
                                                        130.982,
                                                        33.926
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-dannoura-hinoyama",
                                "label": "壇ノ浦・火の山要害（長門側）",
                                "sublabel": "平家本陣・長門防衛拠点",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.979,
                                                        33.968
                                                ],
                                                [
                                                        130.97867,
                                                        33.97023
                                                ],
                                                [
                                                        130.97771,
                                                        33.97234
                                                ],
                                                [
                                                        130.97616,
                                                        33.97423
                                                ],
                                                [
                                                        130.97411,
                                                        33.97582
                                                ],
                                                [
                                                        130.97164,
                                                        33.97701
                                                ],
                                                [
                                                        130.96889,
                                                        33.97775
                                                ],
                                                [
                                                        130.966,
                                                        33.978
                                                ],
                                                [
                                                        130.96311,
                                                        33.97775
                                                ],
                                                [
                                                        130.96036,
                                                        33.97701
                                                ],
                                                [
                                                        130.95789,
                                                        33.97582
                                                ],
                                                [
                                                        130.95584,
                                                        33.97423
                                                ],
                                                [
                                                        130.95429,
                                                        33.97234
                                                ],
                                                [
                                                        130.95333,
                                                        33.97023
                                                ],
                                                [
                                                        130.953,
                                                        33.968
                                                ],
                                                [
                                                        130.95333,
                                                        33.96577
                                                ],
                                                [
                                                        130.95429,
                                                        33.96366
                                                ],
                                                [
                                                        130.95584,
                                                        33.96177
                                                ],
                                                [
                                                        130.95789,
                                                        33.96018
                                                ],
                                                [
                                                        130.96036,
                                                        33.95899
                                                ],
                                                [
                                                        130.96311,
                                                        33.95825
                                                ],
                                                [
                                                        130.966,
                                                        33.958
                                                ],
                                                [
                                                        130.96889,
                                                        33.95825
                                                ],
                                                [
                                                        130.97164,
                                                        33.95899
                                                ],
                                                [
                                                        130.97411,
                                                        33.96018
                                                ],
                                                [
                                                        130.97616,
                                                        33.96177
                                                ],
                                                [
                                                        130.97771,
                                                        33.96366
                                                ],
                                                [
                                                        130.97867,
                                                        33.96577
                                                ],
                                                [
                                                        130.979,
                                                        33.968
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-chofu-toyoura",
                                "label": "長府・古代豊浦宮・忌宮領域",
                                "sublabel": "仲哀・神功伝承地・長門国府",
                                "category": "zone-polity",
                                "color": "#c084fc"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        131.006,
                                                        33.996
                                                ],
                                                [
                                                        131.00555,
                                                        33.99912
                                                ],
                                                [
                                                        131.00422,
                                                        34.00207
                                                ],
                                                [
                                                        131.00207,
                                                        34.00473
                                                ],
                                                [
                                                        130.99922,
                                                        34.00695
                                                ],
                                                [
                                                        130.99581,
                                                        34.00861
                                                ],
                                                [
                                                        130.99201,
                                                        34.00965
                                                ],
                                                [
                                                        130.988,
                                                        34.01
                                                ],
                                                [
                                                        130.98399,
                                                        34.00965
                                                ],
                                                [
                                                        130.98019,
                                                        34.00861
                                                ],
                                                [
                                                        130.97678,
                                                        34.00695
                                                ],
                                                [
                                                        130.97393,
                                                        34.00473
                                                ],
                                                [
                                                        130.97178,
                                                        34.00207
                                                ],
                                                [
                                                        130.97045,
                                                        33.99912
                                                ],
                                                [
                                                        130.97,
                                                        33.996
                                                ],
                                                [
                                                        130.97045,
                                                        33.99288
                                                ],
                                                [
                                                        130.97178,
                                                        33.98993
                                                ],
                                                [
                                                        130.97393,
                                                        33.98727
                                                ],
                                                [
                                                        130.97678,
                                                        33.98505
                                                ],
                                                [
                                                        130.98019,
                                                        33.98339
                                                ],
                                                [
                                                        130.98399,
                                                        33.98235
                                                ],
                                                [
                                                        130.988,
                                                        33.982
                                                ],
                                                [
                                                        130.99201,
                                                        33.98235
                                                ],
                                                [
                                                        130.99581,
                                                        33.98339
                                                ],
                                                [
                                                        130.99922,
                                                        33.98505
                                                ],
                                                [
                                                        131.00207,
                                                        33.98727
                                                ],
                                                [
                                                        131.00422,
                                                        33.98993
                                                ],
                                                [
                                                        131.00555,
                                                        33.99288
                                                ],
                                                [
                                                        131.006,
                                                        33.996
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "route-kanmon-current",
                                "label": "早鞆の瀬戸（潮流約9ノットの激流航路）",
                                "sublabel": "壇ノ浦合戦の勝敗を決した急潮回廊",
                                "category": "route-primary",
                                "color": "#38bdf8"
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                130.935,
                                                33.94
                                        ],
                                        [
                                                130.952,
                                                33.958
                                        ],
                                        [
                                                130.963,
                                                33.961
                                        ],
                                        [
                                                130.982,
                                                33.966
                                        ],
                                        [
                                                131.02,
                                                33.98
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "route-sanyodo-buzen",
                                "label": "山陽道・赤間関〜豊前路（渡海連絡）",
                                "sublabel": "本州と九州を結ぶ東西大動脈",
                                "category": "route-primary",
                                "color": "#fbbf24"
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                131,
                                                34.005
                                        ],
                                        [
                                                130.96,
                                                33.96
                                        ],
                                        [
                                                130.962,
                                                33.95
                                        ],
                                        [
                                                130.94,
                                                33.9
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "gate-moji-seki",
                                "label": "門司関（豊前関門）",
                                "category": "gate",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.962,
                                        33.952
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "gate-akama-seki",
                                "label": "赤間関（長門関門）",
                                "category": "gate",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.958,
                                        33.96
                                ]
                        }
                }
        ],
        "legend": [
                {
                        "label": "関門海峡要衝・山城拠点",
                        "color": "#ef4444",
                        "isPolygon": true
                },
                {
                        "label": "長府・古代豊浦宮圏",
                        "color": "#c084fc",
                        "isPolygon": true
                },
                {
                        "label": "早鞆の瀬戸潮流（平家壊滅の激流）",
                        "color": "#38bdf8"
                },
                {
                        "label": "西国街道・九州路",
                        "color": "#fbbf24"
                }
        ]
},
    },
  ],
});
