import type { SacredSiteStratigraphyProfile } from "../source-evaluation";

/**
 * 宗像・門司関門・筑豊（飯塚・桂川）エリアの祭祀史7項目プロファイル
 */
export const MUNAKATA_KANMON_CHIKUHO_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
  {
    id: "stratigraphy-munakata-okinoshima",
    primarySpotIds: ["munakata-taisha", "spot-okinoshima"],
    primarySpotNames: [
      "宗像大社",
      "宗像大社（辺津宮）",
      "宗像大社 辺津宮",
      "沖ノ島",
      "宗像大社 沖津宮",
      "沖ノ島（沖津宮）",
      "高宮祭場",
    ],
    targetSpotIds: ["munakata-taisha", "spot-okinoshima"],
    targetRegion: "宗像",
    spotNames: [
      "宗像大社",
      "宗像大社（辺津宮）",
      "宗像大社 辺津宮",
      "沖ノ島",
      "宗像大社 沖津宮",
      "沖ノ島（沖津宮）",
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
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
  },
  {
    id: "stratigraphy-tonogami-jinja",
    primarySpotIds: ["spot-tonogami-jinja"],
    primarySpotNames: ["戸上神社（本宮・上宮遥拝）", "戸上神社", "戸上権現", "戸上山上宮"],
    targetSpotIds: ["spot-tonogami-jinja"],
    targetRegion: "門司",
    spotNames: ["戸上神社（本宮・上宮遥拝）", "戸上神社", "戸上権現", "戸上山上宮"],
    title: "戸上神社・戸上山 祭祀景観の層構造（海中神像から山頂修験への遷移）",
    summary:
      "1696年『戸上山三大社権現治願覚書』に基づき、根二海上での網引き神像引揚から湧水地「神島井」、伊古野家「鳥井ノ宮」、前立山柳之口氏神を経て戸上山頂上宮・英彦山山伏六坊招来、満隆寺観音堂へ至る、地域生活圏から山岳霊峰聖域への重層的遷移モデルを伝える関門海峡南東麓の古層伝承拠点（ラベルB）。平安末期には麓の大里が平家西走時の「柳の御所」伝承圏とも重なり、古代×中世の海峡拠点層を併せ持つ。",
    currentDeities: "天御中主神、伊邪那岐神、伊邪那美神、ほか十七柱",
    claimedOrigin: {
      statement:
        "宇多天皇寛平年間（889〜898年）神託により創建。御霊代を枝折戸に奉戴して戸上山頂に奉安したことから戸上神社と称したと伝える。",
      sourceTitle: "戸上神社境内石碑由緒",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近代石碑／社伝",
        targetEra: "平安時代前期・寛平年間（889〜898年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "元禄9年（1696年）『戸上山三大社権現治願覚書』に、大里漁師による海中神像引揚・神島井・鳥井ノ宮・前立山氏神・山頂奉安・英彦山山伏六坊配置・満隆寺観音堂建立の経緯が記録される。",
      sourceTitle: "『戸上山三大社権現治願覚書』（元禄9年／1696年）",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "元禄9年（1696年）",
        targetEra: "中世〜近世修験伝承期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "戸上山（標高518m）山頂に上宮、山麓大里戸ノ上に本宮（下宮）を配し、江戸初期に細川忠利・小笠原忠真が社殿再建・祈祷所建立。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "平安末期・寿永年間（1183〜1185年）",
        description:
          "九州へ落ち延びた平家一門が戸上山麓の大里に仮御所（「柳の御所」伝承）を営み、壇ノ浦決戦前夜までの海峡防衛後方圏を形成。",
        certaintyTier: "B",
      },
      {
        era: "中世〜近世初頭（天正〜慶長期）",
        description:
          "天正9年（1581年）戦乱で堂宇・僧坊焼失。元和3年（1617年）小倉藩主細川忠利が上宮を再建。",
        certaintyTier: "B",
      },
      {
        era: "近世（寛永〜寛文期）",
        description:
          "寛永21年（1644年）満隆寺を常学院と改称。寛文元年（1661年）小笠原忠真が祈祷道場建立。参勤交代大名の大里宿祈願所となる。",
        certaintyTier: "A",
      },
      {
        era: "近代（明治期）",
        description:
          "神仏分離により「戸上権現」から天御中主神・伊邪那岐・伊邪那美へ祭神改変。村社・郷社へ列格。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "戸上山（標高518m・企救半島の独立峰霊峰）、山頂上宮、山麓本宮社叢、湧水地（神島井伝承地）、大里宿場道。",
      features: [
        "戸上山（神体山・登拝行場）",
        "山頂上宮（元禄覚書奉安の地）",
        "山麓本宮（大里宿場祈願拠点）",
        "神島井湧水（原初神像奉斎地）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大里漁師集団", "伊古野氏", "平家一門（大里柳の御所伝承）", "英彦山修験山伏六坊", "小倉藩小笠原氏", "熊本藩細川氏"],
      routeAndPoliticalContext:
        "関門海峡南東の要衝・大里宿場（参勤交代九州諸大名祈願所）。山陽道渡海口と門司・豊前街道の結節点。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "海中漂着神像・湧水祭祀から戸上山霊峰信仰への遷移と結合",
      elementsIntroduction:
        "中世に英彦山修験山伏六坊と満隆寺観音が定着、近世に藩主祈祷道場、明治に記紀創世神への改変",
      historicalRelation: "海辺集落の神像が湧水・氏神を経て山頂上宮へ登攀した経緯が覚書に明記",
      presentationMethod: "石碑では寛平創建と戸上権現・満隆寺を明記し、覚書により重層遷移過程が判明",
      ritualPracticeOrigin: "山岳修験登拝、参勤交代海陸交通祈願、氏子祭礼",
      spatialExperience:
        "海沿い大里宿場から仰ぎ見る戸上山の独立峰景観と、山麓本宮・山頂上宮の二重構造",
      formationVisibility: "石碑および元禄覚書等により神仏習合・修験の歴史的展開が開示",
    },
  },
  // 17. 和布刈神社（門司）
  {
    id: "stratigraphy-mekari-jinja",
    primarySpotIds: ["spot-mekari-jinja"],
    primarySpotNames: ["和布刈神社", "和布刈神社（門司）", "早鞆明神"],
    targetSpotIds: ["spot-mekari-jinja"],
    targetRegion: "門司",
    spotNames: ["和布刈神社", "和布刈神社（門司）", "早鞆明神"],
    title: "和布刈神社・早鞆の瀬戸 祭祀景観の層構造（潮流原初祭祀から和布刈神事・祓戸神）",
    summary:
      "関門海峡最狭部（早鞆の瀬戸）の急潮に直面し、和銅3年（710年）記録伝承を持つ旧暦年越の「和布刈神事」や海中注連縄岩を保持。安曇磯良潮珠伝承・神功皇后帰還由緒と大祓詞祓戸神（瀬織津姫）が重層した海峡潮流祭祀の原初・古層拠点（ラベルA/B）。",
    currentDeities: "瀬織津姫",
    claimedOrigin: {
      statement:
        "神功皇后三韓親征からの帰還時に創建され、安曇磯良から潮の満干を司る干珠・満珠を授与されたと伝える。",
      sourceTitle: "和布刈神社社伝・由緒案内",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中世〜近世社伝",
        targetEra: "神功皇后・海人族伝承期",
      },
    },
    oldestAttestedRecord: {
      statement:
        "『和布刈神事記』等に和銅3年（710年）の記録が現れると伝えられ、旧暦元旦未明に海底の和布を刈り取る和布刈神事が古代より継続。",
      sourceTitle: "『和布刈神事記』／旧暦和布刈神事伝承記録",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "奈良時代（和銅3年/710年伝承）〜中世",
        targetEra: "奈良時代〜中世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "関門海峡最狭部・文字ヶ関（門司）の海岸岩礁上に社殿を構え、鳥居・灯籠が激流の海峡に対峙。海中に注連縄が巻かれた巨岩が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代〜中世（律令大祓詞受容期）",
        description:
          "律令大祓詞の普及に伴い、川から海へ罪穢れを流し去る祓戸四神の瀬織津姫が祭神として位置づけられる。",
        certaintyTier: "B",
      },
      {
        era: "平安末期（1185年・壇ノ浦合戦期）",
        description:
          "関門海峡最狭部・早鞆瀬戸の潮流と門司関防衛線の中核に位置し、壇ノ浦決戦に臨む平家一門（平知盛ら）が海戦勝利と潮流の加護を祈願した伝承を重層。",
        certaintyTier: "B",
      },
      {
        era: "近世（江戸期）",
        description:
          "小倉藩主小笠原氏・長州藩主毛利氏双方が関門海峡航行安全祈願所として社殿修復・寄進を行う。",
        certaintyTier: "A",
      },
      {
        era: "現代（平成〜令和期）",
        description:
          "海洋散骨参拝所や現代的授与所を整備し、海を供養の対象とする現代社会の宗教機能を包摂。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "関門海峡（早鞆の瀬戸の最大流速9ノット超急潮）、海中注連縄岩、海峡対岸（下関壇ノ浦・みもすそ川）直面鳥居・灯籠。",
      features: [
        "早鞆の瀬戸（関門海峡最狭部潮流）",
        "海中注連縄岩（和布刈神事の海底採取場）",
        "海峡直面鳥居・灯籠（対岸視線軸）",
        "海洋散骨参拝所（現代海神供養展開）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["古代海人族（阿曇氏伝承層）", "平家一門（壇ノ浦合戦祈願層）", "文字ヶ関関所警固層", "小倉藩小笠原氏", "長州藩毛利氏"],
      routeAndPoliticalContext:
        "瀬戸内海と日本海（玄界灘）を結ぶ海峡最狭部航路。航行に潮待ち・潮流知識を要する列島最重要の海上ボトルネック。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "関門海峡最狭部の激しい潮流・渦潮に対する畏怖と航海安全・和布収穫祭祀",
      elementsIntroduction:
        "古代に和布刈神事と安曇氏潮珠伝承、律令期に瀬織津姫祭祀、近世に関門航路祈願、現代に海洋散骨受容",
      historicalRelation: "海そのものが祭祀空間であり、建物・鳥居・灯籠の視線が海峡急潮へ直結",
      presentationMethod: "由緒案内で神功皇后伝承と和布刈神事、瀬織津姫祭祀を一体提示",
      ritualPracticeOrigin: "旧暦大晦日深夜〜元旦未明の和布刈神事（神職の海中採取と龍神伝承）",
      spatialExperience:
        "関門海峡の激流の轟音、頭上を通過する関門橋、海中岩礁と直面する社頭空間",
      formationVisibility: "神事伝承板・案内板により古代潮流祭祀と神事の歴史性が明示",
    },
  },
  // 18. 甲宗八幡宮（門司）
  {
    id: "stratigraphy-koso-hachimangu",
    primarySpotIds: ["spot-koso-hachimangu"],
    primarySpotNames: ["甲宗八幡宮", "甲宗八幡神社"],
    targetSpotIds: ["spot-koso-hachimangu"],
    targetRegion: "門司",
    spotNames: ["甲宗八幡宮", "甲宗八幡神社"],
    title: "甲宗八幡宮・門司関 祭祀景観の層構造（大宰府西門防備から中世武家文書・楠原踊）",
    summary:
      "貞観2年（860年）大宰府清原峯成の神功皇后甲冑神体創建伝承を持ち、1272年『門司関六ヶ郷総田数注文写』や1336年『足利尊氏寄進状』など北九州市指定文化財の中世古文書8点を現存。平知盛墓伝承石塔や雨乞い芸能「楠原踊」（市無形民俗文化財）を擁する関門武家土地支配の古層拠点（ラベルB）。",
    currentDeities:
      "応神天皇（第一殿）、神功皇后（第二殿）、市杵島姫命・田心姫命・湍津姫命（第三殿／宗像三女神）",
    claimedOrigin: {
      statement:
        "清和天皇の貞観2年（860年）、大宰府の清原真人峯成が勅命を受け、神功皇后着用の甲冑を神体として祀り「異国への西門を守る神」として創建したと伝える。",
      sourceTitle: "甲宗八幡宮奉納板（大正13年／1924年）／社伝",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近代奉納板／社伝",
        targetEra: "平安前期・貞観2年（860年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "文永9年（1272年）『門司関六ヶ郷総田数注文写』および建武3年（1336年）『足利尊氏寄進状』をはじめとする中世神社文書8点（北九州市指定文化財）が現存。",
      sourceTitle: "北九州市指定有形文化財「甲宗八幡神社文書」8点",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "鎌倉時代文永9年（1272年）〜南北朝期建武3年（1336年）",
        targetEra: "中世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "門司城山（筆立山）南麓の旧門司に鎮座。境内には平知盛墓伝承石塔が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世（鎌倉〜南北朝期）",
        description:
          "門司氏（門司六ヶ郷地頭）の崇敬拠点。建武3年（1336年）足利尊氏が多々良浜合戦勝利後の東上時に社領寄進。",
        certaintyTier: "A",
      },
      {
        era: "近世（江戸期）",
        description:
          "小笠原小倉藩主による筆立山社殿改築・門司総鎮守化。雨乞い芸能「楠原踊」の継承。",
        certaintyTier: "A",
      },
      {
        era: "現代（昭和28年／1953年）",
        description:
          "門司水害により筆立山山腹から平知盛墓伝承石塔が流出し現在地へ移設・保存。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "門司城山（筆立山）山麓、中世神社古文書群、平知盛墓伝承石塔。",
      features: [
        "筆立山（門司城跡背山社叢）",
        "甲宗八幡神社文書8点（市指定文化財）",
        "平知盛墓伝承石塔（水害移設石造物）",
        "楠原踊伝承基盤（雨乞い民俗芸能）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大宰府清原氏", "中世門司氏", "足利氏", "平家落人伝承層", "小倉藩小笠原氏"],
      routeAndPoliticalContext:
        "関門海峡西口・門司関の防備要衝。大宰府・国家鎮護と武家土地支配の接点。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "大宰府による対外西門防備思想と神功皇后甲冑神体化",
      elementsIntroduction:
        "中世に門司六ヶ郷土地支配と足利尊氏寄進、宗像三女神合祀、楠原踊成立、平家伝承石塔の移設",
      historicalRelation: "中世古文書8点の実在により武家権力との直接の結合関係が同時代史料で確定",
      presentationMethod: "1924年奉納板・文化財説明板にて古文書・知盛墓・楠原踊の多重沿革を開示",
      ritualPracticeOrigin: "雨乞い祈願の楠原踊（謡・狂言の要素を持つ中世芸能の痕跡）および例祭",
      spatialExperience:
        "筆立山山麓の杜、三殿並立の拝殿、知盛墓石塔、神功皇后甲冑由緒の空間",
      formationVisibility: "市指定文化財指定書および現地解説板により中世文書と芸能の歴史性が明示",
    },
  },
  // 19. 淡島神社（門司）
  {
    id: "stratigraphy-awashima-jinja-moji",
    primarySpotIds: ["spot-awashima-jinja-moji"],
    primarySpotNames: ["淡島神社（門司）", "淡島神社", "門司淡島神社"],
    targetSpotIds: ["spot-awashima-jinja-moji"],
    targetRegion: "門司",
    spotNames: ["淡島神社（門司）", "淡島神社", "門司淡島神社"],
    title: "淡島神社・門司奥田 祭祀景観の層構造（加太淡島勧請と女性身体・針供養生活文化）",
    summary:
      "六條天皇御代（1165〜1168年頃）に紀伊国加太淡嶋神社より少名比古那神を勧請した由緒を伝え、針塚・水蛭子社・稲荷小祠を併祀。国家神話や武家支配と一線を画し、女性の病気平癒・安産・子授けや針供養など生活文化と身体に密着した民間信仰拠点（ラベルC）。",
    currentDeities: "少名比古那神",
    claimedOrigin: {
      statement:
        "六條天皇の御代、永万〜仁安年間（1165〜1168年頃）に紀伊国加太淡嶋神社より勧請されたと伝える。",
      sourceTitle: "淡島神社社伝・由緒案内",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代社伝",
        targetEra: "平安末期・1165〜1168年頃",
      },
    },
    oldestAttestedRecord: {
      statement:
        "近世以降、奥田村の集落信仰として少名比古那神の医薬・女性病気平癒・安産信仰および針供養が継承される。",
      sourceTitle: "門司区誌／地域民俗記録",
      sourceCategory: "C",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代",
        targetEra: "近世以降",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "門司区奥田の住宅地・丘陵麓に社殿を構え、境内に針塚、水蛭子社、稲荷社小祠が現存。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "中世〜近世（加太淡島信仰受容期）",
        description:
          "紀伊加太淡島信仰が瀬戸内廻船・西国航路を通じて門司奥田に伝播・受容される。",
        certaintyTier: "B",
      },
      {
        era: "近代〜現代（小祠合祀・針供養継続期）",
        description:
          "水蛭子社・稲荷小祠を境内に併祀。日常生活道具への感謝を捧げる針供養行事が現代に至るまで継続。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "針塚（道具供養記念碑）、水蛭子社小祠、奥田の集落生活空間。",
      features: [
        "針塚（生活道具感謝・供養碑）",
        "水蛭子社・稲荷小祠（複合民間祭祀）",
        "奥田丘陵麓社頭（生活密着空間）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["地域農民・町民層", "女性講集団", "紀伊加太淡島信仰伝播層"],
      routeAndPoliticalContext:
        "武家権力や関門軍事とは独立した、奥田谷筋の地域民衆・生活共同体空間。",
      certaintyTier: "A",
    },
    historicalNature: "C_LATER_RECONSTITUTION",
    formationModel: "accumulated",
    formationAnalysis: {
      meaningOrigin: "少名比古那神の医薬・療病神格と加太淡島信仰の女性身体救済・道具供養",
      elementsIntroduction:
        "中世の加太勧請伝承、近世の針供養定着、近代の水蛭子社・稲荷併祀",
      historicalRelation: "医薬・安産・針供養という異なる生活領域が少名比古那神を中心に結合",
      presentationMethod: "由緒案内で少名比古那神の国土経営・医薬伝承と加太勧請、針供養を明記",
      ritualPracticeOrigin: "針供養祭（日常使役道具への感謝と裁縫上達祈願）および女性身体安産祈願",
      spatialExperience: "集落に近接した身近な境内、針塚、複数の親しみやすい小祠群",
      formationVisibility: "境内石碑・案内により加太勧請由緒と針供養文化の歴史性が開示",
    },
  },
  {
    id: "stratigraphy-daibu-hachimangu",
    primarySpotIds: ["spot-daibu-hachimangu"],
    primarySpotNames: ["大分八幡宮", "大分八幡宮（本殿・嶽宮・産湯井戸）", "大分宮"],
    targetSpotIds: ["spot-daibu-hachimangu"],
    targetRegion: "福岡",
    spotNames: ["大分八幡宮", "大分八幡宮（本殿・嶽宮・産湯井戸）", "大分宮", "筑前大分八幡宮"],
    title: "大分八幡宮（筥崎宮元宮・嶽宮） 山上元宮・湧水・律令古官道・神仏習合の重層構造",
    summary:
      "背後丘陵頂上の元宮「嶽宮（たけのみや）」と山麓の本殿・湧水「産湯井戸」・大楠群からなる二層構造を保持する筑前穂波の古社。神亀3年（726年）創建伝承および延長元年（923年）の筥崎宮遷座（元宮）由緒を伝え、大宰府〜米の山峠〜伏見駅の律令古官道要衝に立地する。戦国期の兵火後、天正5年（1577年）に秋月種実が現在地へ社殿を再建。江戸期には天台僧・良永や別当養源寺・庄屋層による復興、宝永4年（1707年）の惣門・仁王像、中世石造三重塔、放生池、享保年間の獅子舞・演舞殿が整い、明治5年（1872年）に郷社となった。",
    currentDeities: "応神天皇・神功皇后・玉依姫命（筥崎宮元宮としての八幡信仰層と、背後の嶽宮・湧水「産湯井戸」の古層景観を区分）",
    claimedOrigin: {
      statement:
        "神亀3年（726年）創建と伝え、延長元年（923年）に八幡神が博多湾岸の筥崎宮へ遷座した元宮とされる。また神功皇后が宇美（蚊田）から峠を越えて大分宮へ至った伝承を伝える（実史の行幸ではなく律令古官道と八幡信仰の上書きとして区分）。",
      sourceTitle: "大分八幡宮由緒・社伝および現地案内板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "中近世社伝・現地由緒",
        targetEra: "奈良時代前期（726年）〜平安時代前期（923年）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "延長元年（923年）の筥崎宮遷座伝承の元宮として『筥崎宮縁起』系統に位置づけられ、律令期の大宰府〜米の山峠〜伏見駅（大分宮付近）〜豊前国府を結ぶ古官道要衝および隣接する大分廃寺跡と地理的に重なる。中世石造三重塔・天正5年（1577年）秋月種実再建記録・宝永4年（1707年）惣門仁王像・享保獅子舞記録が確証される。",
      sourceTitle: "大分八幡宮社伝・飯塚市歴史資料館古官道復元図・境内文化財（石造三重塔・宝永4年惣門仁王像）",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "延長元年（923年）遷座伝承／天正5年（1577年）再建／宝永4年（1707年）惣門",
        targetEra: "古代律令期〜中世・近世",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "福岡県飯塚市大分の丘陵麓に鎮座。現在社殿は天正5年（1577年）に秋月種実が背後丘陵頂上の元宮「嶽宮」から山麓へ下ろして再建したもの。参道脇の湧水「産湯井戸」・大楠群・中世石造三重塔・宝永4年惣門仁王像・放生池が現存する。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古代律令期（726年創建伝承・923年筥崎宮遷座・古官道伏見駅）",
        description:
          "大宰府〜米の山峠〜伏見駅〜豊前国府の古官道結節点に大分宮が成立。延長元年（923年）に博多湾岸の筥崎へ遷座した元宮として位置づけられる（嶽宮・大分廃寺の考古年代は今後の発掘報告照合課題）。",
        certaintyTier: "A",
      },
      {
        era: "中世〜戦国期（石造三重塔・1577年秋月種実による現在地再建）",
        description:
          "戦国期の兵火による焼失後、天正5年（1577年）に秋月種実が丘上の嶽宮から山麓の現在地へ社殿を再建・遷座。境内には中世の石造三重塔が残る。",
        certaintyTier: "A",
      },
      {
        era: "近世〜近代（別当養源寺・1707年惣門仁王像・享保獅子舞・明治5年郷社）",
        description:
          "江戸期に天台僧・良永や別当養源寺・庄屋層が復興を主導し、宝永4年（1707年）に仁王像を安置する惣門を建立、放生池・市杵島神社・享保年間の獅子舞と演舞殿が整備された。明治5年（1872年）に郷社。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "背後丘陵頂上の元宮「嶽宮」、山麓の湧水「産湯井戸」、境内大楠群、中世石造三重塔、宝永4年惣門と仁王像、放生池。",
      features: [
        "背後丘陵頂上の元宮「嶽宮」（旧社地・仲哀天皇御陵推定伝承地 ※考古年代は要検証）",
        "山麓の湧水「産湯井戸」と境内大楠群",
        "中世の石造三重塔および天正5年（1577年）秋月種実再建の沿革",
        "宝永4年（1707年）建立の惣門・仁王像、別当養源寺の痕跡、放生池・享保獅子舞",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["八幡神官・別当養源寺", "秋月氏（秋月種実）", "近世庄屋層・地域共同体"],
      routeAndPoliticalContext:
        "大宰府から米の山峠を越えて遠賀川・穂波流域（伏見駅）および豊前国府へ抜ける律令古官道の要衝に立地し、宇美・大分宮・筥崎宮を結ぶ筑前八幡信仰展開の結節点を担った。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-gekko-jinja",
    primarySpotIds: ["spot-gekko-jinja"],
    primarySpotNames: ["撃鼓神社", "撃鼓神社（下宮・上宮）", "撃鼓神社下宮"],
    targetSpotIds: ["spot-gekko-jinja"],
    targetRegion: "福岡",
    spotNames: ["撃鼓神社", "撃鼓神社（下宮・上宮）", "撃鼓神社下宮", "鼓打三所大権現"],
    title: "撃鼓神社（下宮・上宮） 白旗山宮・湧水「乳の池」・中世棟札「鼓打三所大権現」の重層",
    summary:
      "白旗山中腹平坦地の簡素な石祠「上宮（鼓打権現）」と、山麓の拝殿・本殿・湧水「乳の池」を伴う「下宮（笛吹権現）」からなる上下二宮構造を保持する筑前穂波郡王谷郷の総社。文安3年（1446年）および享禄3年（1530年・檀那は陶尾張守多々良朝臣興房）の棟札に旧神号「鼓打三所大権現」が確証され、近代（明治5年郷社）以降に「撃鼓神社」へ漢語化・記紀三神（天太玉尊・天児屋根命・天鈿女命）へ再整理された変遷が明瞭に辿れる。",
    currentDeities: "天太玉尊・天児屋根命・天鈿女命（中世棟札の旧神号「鼓打三所大権現」からの近代漢語化・記紀三神整理を峻別）",
    claimedOrigin: {
      statement:
        "宇美（蚊田）で応神天皇を出産した神功皇后が大分宮を経て当地へ至ったという伝承経路および湧水「乳の池」の伝承を伝える（実史の行幸ではなく律令古官道・八幡信仰の記憶が古来の湧水信仰へ上書きされたものとして区分）。",
      sourceTitle: "撃鼓神社現地由緒板・案内板",
      sourceCategory: "B",
      certaintyTier: "B",
      chronology: {
        compilationEra: "近世〜近代社伝",
        targetEra: "中世以前（自然湧水・山宮祭祀の遡及年代は留保）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "文安3年（1446年）および享禄3年（1530年・檀那は大内氏重臣の陶尾張守多々良朝臣興房）の棟札に旧神号「鼓打三所大権現」が明記され、「筑前國穂波郡王谷郷總社」「元中村・津島村・庄司村・柳橋村・吉北村五ケ村産神」と伝わる。",
      sourceTitle: "文安3年（1446年）・享禄3年（1530年）棟札記録および撃鼓神社由緒板",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "文安3年（1446年）・享禄3年（1530年）棟札",
        targetEra: "室町中期〜戦国期",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "福岡県飯塚市中の白旗山中腹に石祠「上宮」、山麓に下宮社殿・境内小宮・湧水「乳の池」が並存する。境内に「白旗山窯」の所在記録があるが操業年代は未照合。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古層〜中世（白旗山中腹上宮・乳の池・1446年/1530年棟札「鼓打三所大権現」）",
        description:
          "山腹の自然地形（上宮）と山麓の湧水「乳の池」を核とする在地祭祀を基盤に、15〜16世紀には「鼓打三所大権現」として大内氏重臣・陶興房らの武家寄進を受けた。",
        certaintyTier: "A",
      },
      {
        era: "近世（五ケ村産神・笛と鼓の神楽・神功皇后伝承の接合）",
        description:
          "江戸期に中村・津島・庄司・柳橋・吉北の五ケ村氏子によって社殿と神楽芸能が維持され、宇美〜大分宮と結ぶ神功皇后伝承が湧水信仰へ接合された。",
        certaintyTier: "B",
      },
      {
        era: "近代（明治5年郷社・撃鼓神社への漢語化と記紀三神整理）",
        description:
          "明治5年（1872年）の近代社格制度で郷社へ位置づけられ、「鼓打三所大権現」から「撃鼓神社」への漢語化と記紀の祭祀・芸能三神への整理が定着した。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "白旗山中腹の上宮石祠、山麓の下宮社殿・湧水「乳の池」、境内の白旗山窯所在記録（年代未照合）。",
      features: [
        "白旗山中腹平坦地の石祠「上宮（鼓打権現）」と山麓「下宮（笛吹権現）」の上下二宮構造",
        "山麓の湧水「乳の池」",
        "文安3年（1446年）・享禄3年（1530年陶興房寄進）棟札の旧神号「鼓打三所大権現」",
        "境内所在記録のある「白旗山窯」（古墳期須恵器窯か近世陶器窯かは要資料照合）",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["大内氏・陶興房（中世寄進）", "筑前穂波郡王谷郷五ケ村氏子"],
      routeAndPoliticalContext:
        "遠賀川・穂波川支流域の白旗山麓に立地し、大分宮（伏見駅）を経由する古代官道および筑前内陸交通圏の周縁で、中世武家信仰から近世村落共同体祭祀へ継承された。",
      certaintyTier: "A",
    },
    historicalNature: "B_BEDROCK_CANDIDATE",
    formationModel: "composite",
  },
  {
    id: "stratigraphy-ozuka-kofun",
    primarySpotIds: ["spot-ozuka-kofun"],
    primarySpotNames: ["王塚古墳", "王塚古墳・王塚装飾古墳館", "王塚装飾古墳館"],
    targetSpotIds: ["spot-ozuka-kofun"],
    targetRegion: "福岡",
    spotNames: ["王塚古墳", "王塚古墳・王塚装飾古墳館", "王塚装飾古墳館", "特別史跡王塚古墳"],
    title: "王塚古墳（桂川町） 6世紀前半の全国唯一複室装飾石室・極彩色壁画・重装騎兵副葬の層位",
    summary:
      "穂波川右岸の台地上に築かれた復元墳長86mの前方後円墳（6世紀前半・国特別史跡）。複室構造の横穴式石室に「石棚」「石屋形」「玄門上部の小窓」を併せ持つ全国唯一の構成を有し、双脚輪状文・同心円文・連続三角文・騎馬人物像等の高密度な極彩色壁画（ベンガラ・水銀朱等）と、実物の札式甲（挂甲）・馬具が対応する。有明海沿岸（筑後・肥後）の装飾古墳文化が遠賀川流域（王塚・竹原古墳）へ展開する結節点であり、筑豊の自立的地域首長権力を体現する。",
    currentDeities: "古墳時代後期（6世紀前半）の遠賀川・穂波流域有力首長墓（宗教社殿ではなく葬送・権威空間）",
    claimedOrigin: {
      statement:
        "6世紀前半（筑紫君磐井の乱前後）に穂波・遠賀川流域を統括した有力首長層の墓。札式甲（挂甲）などの軍事装備を備えるが、武具形式のみでヤマト王権への直属関係は断定せず、地域の自立的軍事力と中央との政治的関係を区分して評価する。",
      sourceTitle: "桂川町教育委員会『特別史跡王塚古墳保存整備報告』・王塚装飾古墳館展示",
      sourceCategory: "A",
      certaintyTier: "B",
      chronology: {
        compilationEra: "昭和9年（1934年）発見・1952年特別史跡指定・王塚装飾古墳館展示",
        targetEra: "古墳時代後期（6世紀前半）",
      },
    },
    oldestAttestedRecord: {
      statement:
        "復元墳長86mの前方後円墳、石棚・石屋形・玄門上部小窓を併せ持つ複室横穴式石室、赤・黄・緑・黒・白の五色による極彩色壁画（双脚輪状文・同心円文・連続三角文・騎馬人物像）、および副葬の札式甲（挂甲）・武器・馬具が発掘・保存調査（確度A）で確認されている。",
      sourceTitle: "桂川町教育委員会・王塚装飾古墳館発掘保存資料",
      sourceCategory: "A",
      certaintyTier: "A",
      chronology: {
        compilationEra: "1934年以降の発掘・保存科学調査",
        targetEra: "古墳時代後期（6世紀前半）",
      },
    },
    oldestCurrentSiteRecord: {
      statement:
        "福岡県嘉穂郡桂川町寿命の台地上に墳丘と保存施設が現存し、隣接する王塚装飾古墳館に原寸大精巧石室レプリカ・札式甲復元・400〜700年装飾古墳編年展示が整備されている。",
      certaintyTier: "A",
    },
    reorganizationHistory: [
      {
        era: "古墳時代後期（6世紀前半・墳丘築造と極彩色壁画・札式甲副葬）",
        description:
          "有明海沿岸（筑後・肥後）の石屋形・装飾壁画文化と、重装騎兵装備（札式甲・馬具）を併せ持つ遠賀川流域屈指の首長墓として築造。直後の527年磐井の乱・535年穂波屯倉設置と連動する地域政治転換期を映す。",
        certaintyTier: "A",
      },
      {
        era: "近代〜現代（1934年発見・1952年特別史跡指定・装飾古墳館公開）",
        description:
          "昭和9年（1934年）の土取り工事で石室壁画が発見され、1952年に国特別史跡に指定。現在は春秋の特別公開と王塚装飾古墳館の常設レプリカ展示で保存・公開されている。",
        certaintyTier: "A",
      },
    ],
    archaeologyAndNaturalTarget: {
      statement:
        "復元墳長86mの前方後円墳墳丘、複室横穴式石室（石棚・石屋形・玄門上部小窓）、五色極彩色壁画、副葬の札式甲（挂甲）・馬具。",
      features: [
        "石棚・石屋形・玄門上部小窓を併せ持つ全国唯一の複室横穴式石室",
        "双脚輪状文・同心円文・連続三角文・騎馬人物像が共存する高密度極彩色壁画（水銀朱・ベンガラ等）",
        "壁画の騎馬人物像と実物が対応する札式甲（挂甲）・武器・馬具",
        "有明海沿岸（石人山・日岡・珍敷塚）から遠賀川流域（王塚・竹原）へ展開する装飾古墳編年結節点",
      ],
      certaintyTier: "A",
    },
    clanAndRouteContext: {
      clans: ["遠賀川・穂波川流域首長層（ホナミ地域首長）", "筑紫君磐井圏域との広域文化交流"],
      routeAndPoliticalContext:
        "遠賀川水系・穂波川右岸の要衝に位置し、有明海沿岸の葬送文化と玄界灘・ヤマト王権系武具の双方を吸収した自立的地域首長圏の象徴拠点。",
      certaintyTier: "A",
    },
    historicalNature: "A_BEDROCK_CONTINUITY",
    formationModel: "composite",
  },
];
