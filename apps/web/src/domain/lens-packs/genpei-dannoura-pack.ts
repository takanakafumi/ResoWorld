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
    {
      id: "mekari-shrine-official",
      kind: "modern-reference",
      title: "和布刈神社 由緒",
      publisher: "和布刈神社",
      url: "https://www.mekarijinja.com/",
      retrievedAt: "2026-11-01",
      locator: "「由緒」早鞆瀬戸の潮汐祭祀と源平壇ノ浦合戦前夜の祈願伝承",
      reviewStatus: "reviewed",
    },
    {
      id: "koso-hachimangu-official",
      kind: "modern-reference",
      title: "甲宗八幡宮 由緒",
      publisher: "甲宗八幡宮",
      url: "https://kousohachimangu.jp/",
      retrievedAt: "2026-11-01",
      locator: "「由緒」門司総鎮守、源平合戦期における平家・源氏双方の海峡祈願と門司関伝承",
      reviewStatus: "reviewed",
    },
    {
      id: "iminomiya-shrine-official",
      kind: "modern-reference",
      title: "忌宮神社 公式由緒記",
      publisher: "忌宮神社",
      locator: "長門豊浦宮故地、飛び地境内（満珠島・干珠島）と源平壇ノ浦合戦における水軍伝承",
      reviewStatus: "reviewed",
    },
    {
      id: "tonogami-shrine-field-note",
      kind: "user-input",
      title: "門司・大里探索記録（戸上神社・大里柳御所伝承）",
      note: "平家西走時の大里・柳の御所伝承および戸上山山麓・和布刈・甲宗八幡宮をめぐる海峡拠点記録",
      reviewStatus: "reviewed",
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
    {
      id: "itsukushima-shrine",
      kind: "place",
      label: "厳島神社",
      aliases: ["宮島厳島神社", "安芸宮島"],
      description: "平清盛が平家一門の氏神として篤く崇敬し、海上に寝殿造りの社殿と『平家納経』を奉納した海上聖域。",
      coordinates: { latitude: 34.2959, longitude: 132.3197 },
      primarySpotId: "spot-import-3048de44",
    },
    {
      id: "akama-shrine",
      kind: "place",
      label: "赤間神宮",
      aliases: ["阿弥陀寺", "安徳天皇阿弥陀寺陵", "赤間宮"],
      description: "壇ノ浦に入水した安徳天皇を祀り、境内に平家七盛塚と阿弥陀寺陵を擁する関門海峡北岸の鎮魂聖地。",
      coordinates: { latitude: 33.9575, longitude: 130.9482 },
    },
    {
      id: "dannoura-battlefield",
      kind: "place",
      label: "壇ノ浦古戦場",
      aliases: ["壇ノ浦", "みもすそ川公園", "早鞆瀬戸"],
      description: "寿永4年（1185年）3月24日、源平最後の海戦が繰り広げられた関門海峡最狭部・早鞆の瀬戸。",
      coordinates: { latitude: 33.9678, longitude: 130.9614 },
    },
    {
      id: "tomonoura",
      kind: "place",
      label: "鞆の浦",
      aliases: ["鞆", "鞆の浦（福山）"],
      description: "備後灘の潮待ちの要港。平家西走時の瀬戸内停泊地であり、沼名前神社（祇園社）を擁する海駅。",
      coordinates: { latitude: 34.3828, longitude: 133.3831 },
      primarySpotId: "spot-import-dcb38264",
    },
    {
      id: "mekari-shrine",
      kind: "place",
      label: "和布刈神社",
      aliases: ["和布刈神社", "早鞆明神", "和布刈明神"],
      description: "関門海峡最狭部・早鞆の瀬戸南岸。神功皇后の潮珠伝承の古層に重なり、壇ノ浦前夜に平家一門が海戦勝利と門司関守備を祈願したと伝わる。",
      coordinates: { latitude: 33.9609, longitude: 130.9623 },
      primarySpotId: "spot-mekari-jinja",
    },
    {
      id: "koso-hachimangu",
      kind: "place",
      label: "甲宗八幡宮",
      aliases: ["甲宗八幡宮", "甲宗八幡神社", "門司総鎮守 甲宗八幡宮"],
      description: "門司総鎮守。神功皇后の甲冑埋納伝承と宗像三女神祭祀を古層とし、源平合戦期には平知盛が門司関を固め、源氏軍（義経）側も軍神八幡へ戦勝を祈願した海峡軍事の要衝。",
      coordinates: { latitude: 33.9528, longitude: 130.9678 },
      primarySpotId: "spot-koso-hachimangu",
    },
    {
      id: "togami-shrine",
      kind: "place",
      label: "戸上神社",
      aliases: ["戸上神社", "戸上神社（本宮・上宮遥拝）", "戸上権現", "大里柳御所伝承地"],
      description: "門司・大里背後の戸上山祭祀拠点。平安末期、九州落ちした平家一門が大里に「柳の御所」を営んで壇ノ浦決戦前まで拠点を置いた伝承圏と重層する。",
      coordinates: { latitude: 33.9015, longitude: 130.944 },
      primarySpotId: "spot-tonogami-jinja",
    },
    {
      id: "iminomiya-shrine",
      kind: "place",
      label: "忌宮神社",
      aliases: ["忌宮神社", "長府 忌宮神社", "豊浦宮"],
      description: "長門豊浦宮の故地。古代の神功皇后西征拠点であると同時に、中世には源氏・串崎船ら水軍勢力の長府側後方拠点・戦勝祈願所として海峡を渡る軍勢を支えた。",
      coordinates: { latitude: 33.9961, longitude: 130.9856 },
    },
    {
      id: "manju-kanju-islands",
      kind: "place",
      label: "満珠島・干珠島",
      aliases: ["満珠島・干珠島", "満珠島", "干珠島", "満珠干珠"],
      description: "忌宮神社飛び地境内。神功皇后の干珠・満珠伝承を伝える島嶼であり、壇ノ浦合戦では義経軍・水軍連合が戦況と潮流を窺い集結・待機した海上基地伝承地。",
      coordinates: { latitude: 33.9822, longitude: 130.9972 },
    },
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
    {
      id: "genpei-019",
      subjectId: "heike-clan",
      predicate: "used_base_at",
      objectId: "togami-shrine",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["heike-monogatari", "tonogami-shrine-field-note"],
      confidence: "medium",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-020",
      subjectId: "heike-clan",
      predicate: "dedicated_to",
      objectId: "mekari-shrine",
      relationFamily: "ritual",
      nature: "reviewed-reference",
      viewpointIds: ["maritime-stratum-analysis"],
      sourceIds: ["mekari-shrine-official", "heike-monogatari"],
      confidence: "medium",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-021",
      subjectId: "genji-clan",
      predicate: "dedicated_to",
      objectId: "koso-hachimangu",
      relationFamily: "ritual",
      nature: "reviewed-reference",
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      sourceIds: ["koso-hachimangu-official", "azumakagami"],
      confidence: "medium",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-022",
      subjectId: "minamoto-no-yoshitsune",
      predicate: "used_base_at",
      objectId: "manju-kanju-islands",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["maritime-stratum-analysis"],
      sourceIds: ["iminomiya-shrine-official", "shimonoseki-dannoura-history"],
      confidence: "medium",
      reviewStatus: "reviewed",
    },
    {
      id: "genpei-023",
      subjectId: "suigun-allies",
      predicate: "used_base_at",
      objectId: "iminomiya-shrine",
      relationFamily: "route",
      nature: "reviewed-reference",
      viewpointIds: ["maritime-stratum-analysis"],
      sourceIds: ["iminomiya-shrine-official", "azumakagami"],
      confidence: "medium",
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
      relationFamilies: ["association", "genealogy", "historical-context", "enshrinement", "ritual", "route"],
      viewpointIds: ["documented-genpei", "maritime-stratum-analysis"],
      expansionDepth: 6,
      visibleEntityKinds: ["person", "polity", "event", "group", "place"],
      mapConnections: [
        {
          id: "genpei-maritime-geography",
          label: "源平決戦と瀬戸内・関門海峡の古代×中世海上網",
          description: "平家崇敬の厳島神社、潮待ち拠点鞆の浦に加え、古代海人族の聖地である和布刈神社・甲宗八幡宮・戸上神社（大里）・忌宮神社・満珠干珠島が、源平壇ノ浦決戦の水軍拠点・祈願網として重層する地理空間を接続する。",
          anchorEntityId: "taira-no-kiyomori",
          contextEntityIds: [
            "heike-clan",
            "genji-clan",
            "minamoto-no-yoshitsune",
            "battle-of-dannoura",
            "emperor-antoku",
            "suigun-allies",
          ],
          placeEntityIds: [
            "itsukushima-shrine",
            "akama-shrine",
            "dannoura-battlefield",
            "tomonoura",
            "mekari-shrine",
            "koso-hachimangu",
            "togami-shrine",
            "iminomiya-shrine",
            "manju-kanju-islands",
          ],
          assertionIds: [
            "genpei-002",
            "genpei-006",
            "genpei-016",
            "genpei-017",
            "genpei-019",
            "genpei-020",
            "genpei-021",
            "genpei-022",
            "genpei-023",
          ],
          explorationQuestions: {
            "akama-shrine": {
              question: "赤間神宮（安徳天皇阿弥陀寺陵・平家七盛塚）の空間配置から、壇ノ浦入水後の平家鎮魂と中世海上信仰の重なりをどのように観察できるか？",
              reason: "厳島神社や鞆の浦と対比し、平家一門の栄華から壇ノ浦決戦・滅亡に至る終焉の聖地を確かめるため。",
            },
            "dannoura-battlefield": {
              question: "関門海峡・壇ノ浦（みもすそ川）の潮の流れと地形から、義経軍の急襲と平家水軍敗因の地理的条件をどのように追体験できるか？",
              reason: "瀬戸内海の潮待ち港（鞆の浦）や厳島での制海権獲得から、関門海峡最狭部での決戦の帰結を読み解くため。",
            },
            "iminomiya-shrine": {
              question: "長府・忌宮神社（豊浦宮故地）は、古代の神功皇后滞在伝承と中世・源平期の水軍後方拠点という二つの時代層をどのように空間的に接続しているか？",
              reason: "すでに歩いた門司側（和布刈・甲宗・戸上）の対岸拠点として、長府側の古代×中世クロスオーバーを確かめるため。",
            },
            "manju-kanju-islands": {
              question: "周防灘口に浮かぶ満珠島・干珠島は、古代の潮珠神話と壇ノ浦合戦時の義経軍集結・潮流戦略の舞台としてどのような位置関係にあるか？",
              reason: "関門海峡東口からの水軍アプローチと早鞆瀬戸の潮汐変化を現地で立体視するため。",
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
                                "label": "門司関・門司城（和布刈・甲宗八幡）要塞圏",
                                "sublabel": "海峡最狭部南岸・筆立山要害",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.978,
                                                        33.956
                                                ],
                                                [
                                                        130.9777,
                                                        33.95823
                                                ],
                                                [
                                                        130.97681,
                                                        33.96034
                                                ],
                                                [
                                                        130.97538,
                                                        33.96223
                                                ],
                                                [
                                                        130.97348,
                                                        33.96382
                                                ],
                                                [
                                                        130.97121,
                                                        33.96501
                                                ],
                                                [
                                                        130.96867,
                                                        33.96575
                                                ],
                                                [
                                                        130.966,
                                                        33.966
                                                ],
                                                [
                                                        130.96333,
                                                        33.96575
                                                ],
                                                [
                                                        130.96079,
                                                        33.96501
                                                ],
                                                [
                                                        130.95852,
                                                        33.96382
                                                ],
                                                [
                                                        130.95662,
                                                        33.96223
                                                ],
                                                [
                                                        130.95519,
                                                        33.96034
                                                ],
                                                [
                                                        130.9543,
                                                        33.95823
                                                ],
                                                [
                                                        130.954,
                                                        33.956
                                                ],
                                                [
                                                        130.9543,
                                                        33.95377
                                                ],
                                                [
                                                        130.95519,
                                                        33.95166
                                                ],
                                                [
                                                        130.95662,
                                                        33.94977
                                                ],
                                                [
                                                        130.95852,
                                                        33.94818
                                                ],
                                                [
                                                        130.96079,
                                                        33.94699
                                                ],
                                                [
                                                        130.96333,
                                                        33.94625
                                                ],
                                                [
                                                        130.966,
                                                        33.946
                                                ],
                                                [
                                                        130.96867,
                                                        33.94625
                                                ],
                                                [
                                                        130.97121,
                                                        33.94699
                                                ],
                                                [
                                                        130.97348,
                                                        33.94818
                                                ],
                                                [
                                                        130.97538,
                                                        33.94977
                                                ],
                                                [
                                                        130.97681,
                                                        33.95166
                                                ],
                                                [
                                                        130.9777,
                                                        33.95377
                                                ],
                                                [
                                                        130.978,
                                                        33.956
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-tonogami-fortress",
                                "label": "戸上山城・大里監視圏",
                                "sublabel": "周防灘〜関門西口を見下ろす霊峰山城",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.958,
                                                        33.902
                                                ],
                                                [
                                                        130.95765,
                                                        33.90445
                                                ],
                                                [
                                                        130.95661,
                                                        33.90677
                                                ],
                                                [
                                                        130.95495,
                                                        33.90886
                                                ],
                                                [
                                                        130.95273,
                                                        33.9106
                                                ],
                                                [
                                                        130.95007,
                                                        33.91191
                                                ],
                                                [
                                                        130.94712,
                                                        33.91272
                                                ],
                                                [
                                                        130.944,
                                                        33.913
                                                ],
                                                [
                                                        130.94088,
                                                        33.91272
                                                ],
                                                [
                                                        130.93793,
                                                        33.91191
                                                ],
                                                [
                                                        130.93527,
                                                        33.9106
                                                ],
                                                [
                                                        130.93305,
                                                        33.90886
                                                ],
                                                [
                                                        130.93139,
                                                        33.90677
                                                ],
                                                [
                                                        130.93035,
                                                        33.90445
                                                ],
                                                [
                                                        130.93,
                                                        33.902
                                                ],
                                                [
                                                        130.93035,
                                                        33.89955
                                                ],
                                                [
                                                        130.93139,
                                                        33.89723
                                                ],
                                                [
                                                        130.93305,
                                                        33.89514
                                                ],
                                                [
                                                        130.93527,
                                                        33.8934
                                                ],
                                                [
                                                        130.93793,
                                                        33.89209
                                                ],
                                                [
                                                        130.94088,
                                                        33.89128
                                                ],
                                                [
                                                        130.944,
                                                        33.891
                                                ],
                                                [
                                                        130.94712,
                                                        33.89128
                                                ],
                                                [
                                                        130.95007,
                                                        33.89209
                                                ],
                                                [
                                                        130.95273,
                                                        33.8934
                                                ],
                                                [
                                                        130.95495,
                                                        33.89514
                                                ],
                                                [
                                                        130.95661,
                                                        33.89723
                                                ],
                                                [
                                                        130.95765,
                                                        33.89955
                                                ],
                                                [
                                                        130.958,
                                                        33.902
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-dannoura-hinoyama",
                                "label": "壇ノ浦・火の山海峡監視圏",
                                "sublabel": "海峡最狭部北岸・源平合戦決戦地",
                                "category": "zone-defense",
                                "color": "#f97316"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        130.97,
                                                        33.969
                                                ],
                                                [
                                                        130.9697,
                                                        33.971
                                                ],
                                                [
                                                        130.96881,
                                                        33.9729
                                                ],
                                                [
                                                        130.96738,
                                                        33.97461
                                                ],
                                                [
                                                        130.96548,
                                                        33.97604
                                                ],
                                                [
                                                        130.96321,
                                                        33.97711
                                                ],
                                                [
                                                        130.96067,
                                                        33.97777
                                                ],
                                                [
                                                        130.958,
                                                        33.978
                                                ],
                                                [
                                                        130.95533,
                                                        33.97777
                                                ],
                                                [
                                                        130.95279,
                                                        33.97711
                                                ],
                                                [
                                                        130.95052,
                                                        33.97604
                                                ],
                                                [
                                                        130.94862,
                                                        33.97461
                                                ],
                                                [
                                                        130.94719,
                                                        33.9729
                                                ],
                                                [
                                                        130.9463,
                                                        33.971
                                                ],
                                                [
                                                        130.946,
                                                        33.969
                                                ],
                                                [
                                                        130.9463,
                                                        33.967
                                                ],
                                                [
                                                        130.94719,
                                                        33.9651
                                                ],
                                                [
                                                        130.94862,
                                                        33.96339
                                                ],
                                                [
                                                        130.95052,
                                                        33.96196
                                                ],
                                                [
                                                        130.95279,
                                                        33.96089
                                                ],
                                                [
                                                        130.95533,
                                                        33.96023
                                                ],
                                                [
                                                        130.958,
                                                        33.96
                                                ],
                                                [
                                                        130.96067,
                                                        33.96023
                                                ],
                                                [
                                                        130.96321,
                                                        33.96089
                                                ],
                                                [
                                                        130.96548,
                                                        33.96196
                                                ],
                                                [
                                                        130.96738,
                                                        33.96339
                                                ],
                                                [
                                                        130.96881,
                                                        33.9651
                                                ],
                                                [
                                                        130.9697,
                                                        33.967
                                                ],
                                                [
                                                        130.97,
                                                        33.969
                                                ]
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "zone-chofu-toyoura",
                                "label": "長府・忌宮（穴門豊浦宮）中枢圏",
                                "sublabel": "仲哀天皇・神功皇后の海峡行宮拠点",
                                "category": "zone-polity",
                                "color": "#c084fc"
                        },
                        "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                        [
                                                [
                                                        131.002,
                                                        33.996
                                                ],
                                                [
                                                        131.00165,
                                                        33.99845
                                                ],
                                                [
                                                        131.00061,
                                                        34.00077
                                                ],
                                                [
                                                        130.99895,
                                                        34.00286
                                                ],
                                                [
                                                        130.99673,
                                                        34.0046
                                                ],
                                                [
                                                        130.99407,
                                                        34.00591
                                                ],
                                                [
                                                        130.99112,
                                                        34.00672
                                                ],
                                                [
                                                        130.988,
                                                        34.007
                                                ],
                                                [
                                                        130.98488,
                                                        34.00672
                                                ],
                                                [
                                                        130.98193,
                                                        34.00591
                                                ],
                                                [
                                                        130.97927,
                                                        34.0046
                                                ],
                                                [
                                                        130.97705,
                                                        34.00286
                                                ],
                                                [
                                                        130.97539,
                                                        34.00077
                                                ],
                                                [
                                                        130.97435,
                                                        33.99845
                                                ],
                                                [
                                                        130.974,
                                                        33.996
                                                ],
                                                [
                                                        130.97435,
                                                        33.99355
                                                ],
                                                [
                                                        130.97539,
                                                        33.99123
                                                ],
                                                [
                                                        130.97705,
                                                        33.98914
                                                ],
                                                [
                                                        130.97927,
                                                        33.9874
                                                ],
                                                [
                                                        130.98193,
                                                        33.98609
                                                ],
                                                [
                                                        130.98488,
                                                        33.98528
                                                ],
                                                [
                                                        130.988,
                                                        33.985
                                                ],
                                                [
                                                        130.99112,
                                                        33.98528
                                                ],
                                                [
                                                        130.99407,
                                                        33.98609
                                                ],
                                                [
                                                        130.99673,
                                                        33.9874
                                                ],
                                                [
                                                        130.99895,
                                                        33.98914
                                                ],
                                                [
                                                        131.00061,
                                                        33.99123
                                                ],
                                                [
                                                        131.00165,
                                                        33.99355
                                                ],
                                                [
                                                        131.002,
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
                                "label": "関門海峡・早鞆瀬戸潮流軸（玄界灘⇄周防灘）",
                                "sublabel": "最大流速約10ノットの難所・潮待ちと潮流逆転の舞台",
                                "category": "route-primary",
                                "color": "#38bdf8"
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                130.905,
                                                33.915
                                        ],
                                        [
                                                130.935,
                                                33.938
                                        ],
                                        [
                                                130.961,
                                                33.962
                                        ],
                                        [
                                                130.985,
                                                33.975
                                        ],
                                        [
                                                131.025,
                                                33.965
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "route-sanyodo-buzen",
                                "label": "古代山陽道〜門司関渡海〜大里〜豊前道",
                                "sublabel": "長府（豊浦宮）から赤間関・門司関を渡り大宰府・宇佐へ分岐する幹線",
                                "category": "route-primary",
                                "color": "#fbbf24",
                                "dashed": true
                        },
                        "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                        [
                                                130.988,
                                                33.996
                                        ],
                                        [
                                                130.948,
                                                33.958
                                        ],
                                        [
                                                130.963,
                                                33.96
                                        ],
                                        [
                                                130.969,
                                                33.95
                                        ],
                                        [
                                                130.938,
                                                33.905
                                        ],
                                        [
                                                130.915,
                                                33.885
                                        ]
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "gate-moji-seki",
                                "label": "門司関",
                                "category": "gate",
                                "color": "#fbbf24"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.963,
                                        33.96
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "gate-akama-seki",
                                "label": "赤間関",
                                "category": "gate",
                                "color": "#38bdf8"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.948,
                                        33.958
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "lbl-hayatomo",
                                "label": "早鞆瀬戸 (最狭部潮流)",
                                "sublabel": "和布刈 ⇄ 壇ノ浦",
                                "category": "route-primary",
                                "color": "#38bdf8"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.961,
                                        33.963
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "lbl-moji-fortress",
                                "label": "門司関・筆立山要塞圏",
                                "sublabel": "和布刈・甲宗八幡宮",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.972,
                                        33.953
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "lbl-tonogami",
                                "label": "戸上山城・大里監視圏",
                                "sublabel": "戸上神社・柳御所",
                                "category": "zone-defense",
                                "color": "#ef4444"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.944,
                                        33.902
                                ]
                        }
                },
                {
                        "type": "Feature",
                        "properties": {
                                "id": "lbl-toyoura",
                                "label": "穴門豊浦宮 (長府)",
                                "sublabel": "忌宮神社・山陽道終端",
                                "category": "zone-polity",
                                "color": "#c084fc"
                        },
                        "geometry": {
                                "type": "Point",
                                "coordinates": [
                                        130.988,
                                        33.997
                                ]
                        }
                }
        ],
        "legend": [
                {
                        "label": "早鞆瀬戸・関門海峡潮流軸",
                        "color": "#38bdf8"
                },
                {
                        "label": "古代山陽道〜門司関〜豊前道",
                        "color": "#fbbf24"
                },
                {
                        "label": "海峡監視・山城要塞圏",
                        "color": "#ef4444",
                        "isPolygon": true
                }
        ]
},
    },
  ],
});
