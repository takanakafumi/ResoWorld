import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const candidatePaths = [
  path.join(root, "旅行記", "2026-11-14_福岡市博物館訪問記録.txt"),
  path.join(root, "旅行記", "2026年11月14日.txt"),
  "/home/antigravity/2026年11月14日.txt",
];

const sourcePath = candidatePaths.find((p) => fs.existsSync(p));

if (!sourcePath) {
  console.log(
    "[import-fukuoka-city-museum] Source travelogue file not present in this environment. Skipping re-generation.",
  );
  process.exit(0);
}

const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const content = fs.readFileSync(sourcePath, "utf-8");
const docSha256 = crypto
  .createHash("sha256")
  .update(content, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-fukuoka-city-museum-2026-11-14";

const newDocument = {
  id: documentId,
  title: "2026年11月14日 福岡市博物館訪問記録（博多湾岸の古代拠点・北部九州の墓制・海人の祭祀）",
  path: "旅行記/2026-11-14_福岡市博物館訪問記録.txt",
  sha256: docSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-11-14",
  documentedAt: "2026-11-14",
  dateStatus: "known",
};

const lines = content.split("\n");

function findLineRange(quote) {
  const cleanSnippet = quote.trim().split("\n")[0].trim().slice(0, 22);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(cleanSnippet)) {
      return { startLine: i + 1, endLine: Math.min(lines.length, i + 14) };
    }
  }
  return { startLine: 1, endLine: 15 };
}

function makeClaim({
  id,
  statement,
  subjectName = "福岡市博物館",
  predicate = "witnesses",
  objectEntityName,
  objectEntityType = "Concept",
  claimKind = "observation",
  verification = "personal-evidence",
  modality = "asserted",
  sourceNature = "Observation",
  historicalLabel,
  observedPlaceNames = ["福岡市博物館"],
  quote,
}) {
  const { startLine, endLine } = findLineRange(quote);
  return {
    schemaVersion: "0.2.0",
    id,
    statement,
    subject: { name: subjectName, type: "Place" },
    predicate,
    object: {
      kind: "entity",
      entity: { name: objectEntityName, type: objectEntityType },
    },
    qualifiers: {},
    claimKind,
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification, modality },
    historicalTime: {
      kind: "named",
      label: historicalLabel,
      precision: "broad-range",
    },
    places: observedPlaceNames.map((name) => ({
      name,
      role: "observed_place",
    })),
    evidence: [
      {
        role: "supports",
        sourceNature,
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: docSha256,
          startLine,
          endLine,
          quote,
        },
      },
    ],
    createdAt: "2026-11-14T10:00:00Z",
  };
}

const claims = [
  // 2-1. 那津官家 (2 Claims)
  makeClaim({
    id: "claim-fcm-2026-001",
    statement:
      "『日本書紀』宣化元年（536年）条に記される那津官家は、磐井の乱以後のヤマト政権が博多湾岸の海上交通・物流と稲穀蓄積・政治軍事支配を結びつけて設置した直轄拠点であり、律令制下の大宰府の起源としても位置づけられる。",
    objectEntityName: "宣化元年（536年）那津官家設置記述と海上交通・軍事物流拠点機能",
    historicalLabel: "古墳時代後期（536年・宣化元年）",
    quote:
      "『日本書紀』宣化元年（536年）条には、那津のほとりに官家を造るという記述がある。「ミヤケ」とは、ヤマト政権による直轄領であり、稲を納める倉だけでなく、田地や耕作民を伴う経済的基盤であるとともに、政治的・軍事的な支配拠点でもあったとされる。",
  }),
  makeClaim({
    id: "claim-fcm-2026-002",
    statement:
      "那津官家の候補地として比恵遺跡（博多区）と有田遺跡（早良区）で6〜7世紀の大型建物跡や柵列が確認されているが、536年に遡る遺構は未確認であり、官衙的遺構の存在と那津官家そのものの所在地確定は厳密に区別する必要がある。",
    objectEntityName: "那津官家候補地（比恵遺跡・有田遺跡）の6〜7世紀大型建物跡と所在地未確定の史料批判",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "6世紀〜7世紀",
    quote:
      "展示では、候補地として次の2か所が挙げられていた。比恵遺跡（博多区）、有田遺跡（早良区）。いずれも6〜7世紀の大型建物跡や柵列が見つかっている。ただし、536年にさかのぼる遺構は確認されておらず、那津官家の所在は確定していない。比恵遺跡群で官衙的な施設が見つかっていることと、それが那津官家そのものだということは別問題。",
  }),

  // 2-2. 比恵・那珂遺跡群の変化と早良平野・梅林古墳 (3 Claims)
  makeClaim({
    id: "claim-fcm-2026-003",
    statement:
      "5世紀になると比恵・那珂遺跡や西新町遺跡が一旦衰退する一方、早良平野の吉武遺跡群などが台頭し、朝鮮半島製の軟質・陶質土器、金銅装大刀、初期須恵器、鍛冶工具が出土しており、渡来系集団と鉄器・須恵器技術伝達の拠点となっていた。",
    objectEntityName: "5世紀早良平野（吉武遺跡群等）の台頭と渡来系鍛冶・初期須恵器技術伝達",
    historicalLabel: "古墳時代中期（5世紀）",
    quote:
      "前世紀に栄えた比恵・那珂遺跡や西新町遺跡は5世紀になると衰退し、代わって吉武遺跡をはじめとする早良平野の遺跡が登場する。早良平野では、朝鮮半島製の軟質・陶質土器、金銅装大刀、初期須恵器、鍛冶工具などが出土している。これらは、渡来系集団の存在や、鉄器・須恵器生産などの技術伝達を考える材料となる。",
  }),
  makeClaim({
    id: "claim-fcm-2026-004",
    statement:
      "福岡市城南区の梅林古墳（5世紀末〜6世紀前半）から韓国南西部・栄山江流域の鳥足文土器が出土しており、5世紀代の北部九州には朝鮮半島と直接的な対外交渉を行う地域集団が複数存在していたことが考古学的に裏付けられる。",
    objectEntityName: "梅林古墳出土の栄山江流域系鳥足文土器と北部九州複数集団の半島直接交渉",
    historicalLabel: "古墳時代中期〜後期（5世紀末〜6世紀前半）",
    quote:
      "5世紀末〜6世紀前半の梅林古墳（城南区）から出土した鳥足文土器は、韓国南西部の栄山江流域の土器とされる。被葬者がその地域と密接に交流していた可能性が指摘されている。展示の説明では、5世紀代の九州には、朝鮮半島との直接の対外交渉を行った集団が複数存在していたことが考古学的にうかがえるとしていた。",
  }),
  makeClaim({
    id: "claim-fcm-2026-005",
    statement:
      "7世紀の博多湾岸は遣隋使・遣唐使の玄関口および百済復興支援の兵站基地（661年斉明天皇の娜大津到着・長津宮改称、所在地は未確定）となり、那珂遺跡群の百済系瓦・南北官衙建物群や博多遺跡群の新羅・高句麗・近畿系土器がその国際性を実証する。",
    objectEntityName: "7世紀博多湾岸の兵站基地機能（長津宮記録）と那珂・博多遺跡群の国際的遺物群",
    historicalLabel: "飛鳥時代（7世紀・660〜661年）",
    quote:
      "7世紀の博多湾岸は、遣隋使・遣唐使の玄関口であるとともに、兵站基地としての役割も持っていた。660年に百済が滅亡すると、斉明天皇は百済復興支援のため筑紫へ赴く。661年には娜大津に到着し、磐瀬行宮を長津宮と改称した。長津宮の場所は不明だが、博多湾岸の遺跡も候補地とされている。那珂遺跡群：百済系の瓦を葺いた建物、南北方向の官衙的建物群。博多遺跡群：遺構の増加、新羅・高句麗・近畿地方などの土器。",
  }),

  // 3. 白村江の戦いと大宰府の形成 (1 Claim)
  makeClaim({
    id: "claim-fcm-2026-006",
    statement:
      "536年那津官家から663年白村江の戦いを経た水城・大野城・大宰府の形成は、拠点が単純に内陸へ移転したのではなく、博多湾岸の外交・交易・物流の玄関口機能を維持したまま、水城・大野城の防衛線と内陸の大宰府行政・軍事中枢を連動発展させた地域構造である。",
    objectEntityName: "博多湾岸（外交物流玄関口）と水城・大野城・大宰府（内陸防衛行政中枢）の海陸機能連動",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "6世紀〜7世紀後半（527年磐井の乱〜663年白村江〜大宰府形成）",
    observedPlaceNames: ["福岡市博物館", "水城（水城跡・東門官道・水城館）"],
    quote:
      "博多湾岸：外交・交易・物流の玄関口、水城：博多湾岸から内陸への進入を防ぐ防衛施設、大野城：背後の山地を利用した防衛拠点、大宰府：内陸の行政・外交・軍事拠点。ただし、これは単純に那津官家が大宰府へ移転したという話ではない。海側の物流・外交機能を維持しつつ、内陸に防衛・行政機能を発展させたと見る方が適切である。",
  }),

  // 4. 古墳時代の墓制――老司古墳と鋤崎古墳 (4 Claims)
  makeClaim({
    id: "claim-fcm-2026-007",
    statement:
      "福岡市南区の那珂川西岸丘陵上に位置する老司古墳（4世紀末〜5世紀初頭・全長76m前方後円墳）は、竪穴式石室に横口を設けた「竪穴系横口式石室」4基（後円部3・前方部1）を有し、日本列島における横穴式石室の成立過程を示す福岡平野首長墓である。",
    objectEntityName: "老司古墳（4世紀末〜5世紀初頭・全長76m）の竪穴系横口式石室と横穴式石室成立過程",
    historicalLabel: "古墳時代前期末〜中期初頭（4世紀末〜5世紀初頭）",
    quote:
      "老司古墳。所在地：福岡市南区老司、那珂川西岸の丘陵上、全長76mの前方後円墳、4世紀末〜5世紀初頭頃、福岡平野の首長墓。後円部に3基、前方部に1基の埋葬施設がある。これらは「竪穴系横口式石室」と呼ばれる形式。竪穴式石室に入口を設けた構造で、日本における横穴式石室の成立を考えるうえで重要とされる。",
  }),
  makeClaim({
    id: "claim-fcm-2026-008",
    statement:
      "老司古墳で最大の3号石室からは三角縁神獣鏡片を含む鏡、勾玉・管玉等の玉類、鉄刀・鉄鏃、短甲、馬具、工具類が出土しており、人骨と遺物の配置から複数の成人男女が追葬・合葬されていたと推定される。",
    objectEntityName: "老司古墳3号石室出土の三角縁神獣鏡片・短甲・馬具と複数成人男女の埋葬",
    historicalLabel: "古墳時代前期末〜中期初頭（4世紀末〜5世紀初頭）",
    quote:
      "最大の3号石室からは、三角縁神獣鏡片を含む鏡、勾玉・管玉などの玉類、鉄刀・鉄鏃、短甲、馬具、工具類などが出土した。人骨と遺物の配置から、複数の成人男女が葬られていたと推定されている。",
  }),
  makeClaim({
    id: "claim-fcm-2026-009",
    statement:
      "糸島平野北東端の福岡市西区今宿青木に位置する鋤崎古墳（全長62m前方後円墳）は、板石積みによる羨道を備えた日本最古級の整った横穴式石室を有し、奥壁に石棺（主埋葬者）・右壁に土製棺・左壁に木棺の3棺を配置して玉類や鉄器を副葬する。",
    objectEntityName: "鋤崎古墳（今宿青木・全長62m）の日本最古級横穴式石室と石棺・土製棺・木棺の3棺配置",
    historicalLabel: "古墳時代前期末〜中期初頭（4世紀末〜5世紀初頭）",
    quote:
      "鋤崎古墳。所在地：福岡市西区今宿青木、糸島平野の北東端、全長62mの前方後円墳、北部九州の首長墓の一つ。板石積みによる羨道（横からの出入口）が形成されている。整った横穴式石室としては、日本で最も古いものと解説されていた。石室には3つの棺が納められていた。石棺（奥壁）、土製棺（入口から見て右壁）、木棺（入口から見て左壁）。",
  }),
  makeClaim({
    id: "claim-fcm-2026-010",
    statement:
      "上から埋葬し閉じる「竪穴式石室」、横口を設けた「竪穴系横口式石室（老司古墳）」、石積み玄室に羨道を設ける「横穴式石室（鋤崎古墳等・北部九州で初期展開）」と、地面に竪坑を掘り横方向に玄室を掘り込む南九州特有の「地下式横穴墓」は明確に異なる墓制であり、北部九州が朝鮮半島との交流を通じて新埋葬技術をいち早く受容した玄関口であったことを示す。",
    objectEntityName: "竪穴系横口式石室・初期横穴式石室（北部九州）と地下式横穴墓（南九州）の墓制類型峻別",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "古墳時代前期〜中期",
    quote:
      "竪穴式石室：上から埋葬し、基本的に閉じる。竪穴系横口式石室：竪穴式石室に横口を設ける（老司古墳の例）。横穴式石室：石を積んだ部屋に羨道を設け、横から出入りする（北部九州が初期展開で重要）。地下式横穴墓：地面に竪坑を掘り、横方向に玄室を掘り込む（南九州に特徴的）。横穴式石室と地下式横穴墓は、名前は似ているが別の墓制である。",
  }),

  // 5. 志賀海神社の歩射祭 (3 Claims)
  makeClaim({
    id: "claim-fcm-2026-011",
    statement:
      "志賀海神社の小正月行事「歩射祭」には、かつて人々に危害を加えていた土蜘蛛を阿曇百足と8人の射手が弓矢で退治したことに始まるという起源伝承が伝わるが、土蜘蛛を実在特定集団と断定したり阿曇百足を歴史上の実在人物・実際の古代戦闘と確定することはせず、海人伝承が青年の祭礼に組み込まれた構造として捉える必要がある。",
    subjectName: "志賀海神社",
    objectEntityName: "志賀海神社「歩射祭」の阿曇百足・土蜘蛛退治起源伝承と史料批判的区分",
    historicalLabel: "古代伝承〜近世・現代祭礼",
    observedPlaceNames: ["福岡市博物館", "志賀海神社"],
    quote:
      "歩射祭は、志賀島で行われる小正月の的射行事。青年8人が射手となり、大きな的に向けて弓矢を射る。「かつて人々に危害を加えていた土蜘蛛を、阿曇百足と8人の射手が弓矢で退治したのに始まると伝えられている。」土蜘蛛を実在した特定集団と断定したり、阿曇百足を歴史上の人物と確定したりすることはできない。一方で、海人に関係する地域の伝承が、青年の祭礼に組み込まれている点は重要である。",
  }),
  makeClaim({
    id: "claim-fcm-2026-012",
    statement:
      "歩射祭の射手は胴結舞・勝馬詣り（勝馬の浜から沖津宮へ海を渡り、新参の射手が海に潜ってガラモと呼ばれる海藻を採り神前に供える）・お潮井かぶり（海に浸かり冷水をかぶる禊）・大的行事の一連の儀礼を経るため、祭祀空間が社殿にとどまらず浜・海・沖津宮へと一体的に広がっている。",
    subjectName: "志賀海神社",
    objectEntityName: "歩射祭における勝馬詣り（潜水ガラモ採取）・お潮井かぶりと浜・海・沖津宮の祭祀空間",
    historicalLabel: "中世〜近世〜現代（小正月歩射祭）",
    observedPlaceNames: ["福岡市博物館", "志賀海神社"],
    quote:
      "射手は弓を射るだけではなく、複数の儀礼を経る。胴結舞、勝馬詣り（勝馬の浜から沖津宮へ海を渡る）、お潮井かぶり（海に浸かり、冷水をかぶって禊をする）、大的行事。特に勝馬詣りが興味深い。新参の射手は海に潜り、ガラモと呼ばれる海藻を採って神前に供える。つまり、祭祀空間は神社の社殿だけではなく、浜・海・沖津宮へと広がっている。",
  }),
  makeClaim({
    id: "claim-fcm-2026-013",
    statement:
      "歩射祭の射手は本来、宮座に属する社人から弓を預かり社人に代わって的を射る役割であり、青年たちが弓の練習と厳格な海浜儀礼を経て地域社会の構成員として認められていく次世代育成・共同体成員化の機能を持つ。",
    subjectName: "志賀海神社",
    objectEntityName: "宮座・社人からの弓預託と歩射祭を通じた青年の地域共同体成員化",
    historicalLabel: "中世〜近世〜現代",
    observedPlaceNames: ["福岡市博物館", "志賀海神社"],
    quote:
      "射手は本来、宮座に属する社人から弓を預かり、社人に代わって的を射る役割だった。青年たちは弓の練習と各種儀礼を経て、地域社会の構成員として認められていく。歩射祭には、祭祀を担う次世代の育成と、地域共同体への加入という側面がある。",
  }),

  // 6. 志式神社の奈多の早魚行事 (3 Claims)
  makeClaim({
    id: "claim-fcm-2026-014",
    statement:
      "奈多・志式神社の秋祭り（毎年11月19日）で奉納される神楽「早魚舞」は「天神尋ね（乙太夫）」「献魚庖刀式」「ひれ舞」の3部から構成され、献魚庖刀式では深夜に海で禊を済ませ新調の早魚着物を着た24歳・25歳の青年が地区を代表し、料理人（早魚切）・ひれさし・すり鉢かかかえの3人連携で塩鯛をさばく速さを競う。",
    subjectName: "奈多・志式神社",
    objectEntityName: "志式神社秋祭り「早魚舞（天神尋ね・献魚庖刀式・ひれ舞）」と青年3人連携の塩鯛調理競技",
    historicalLabel: "近世〜現代（毎年11月19日秋祭り）",
    observedPlaceNames: ["福岡市博物館", "奈多・志式神社"],
    quote:
      "毎年11月19日の秋祭りで奉納される神楽「早魚舞」は、次の3つから構成される。天神尋ね（乙太夫）、献魚庖刀式、ひれ舞。24歳・25歳の青年が地区を代表し、塩鯛をさばく速さを競う。3人が連携して行う。料理人（早魚切）、ひれさし、すり鉢かかえ。深夜に海で禊を済ませ、新調の早魚着物に着替えて登場する。",
  }),
  makeClaim({
    id: "claim-fcm-2026-015",
    statement:
      "志式神社の奈多の早魚行事（献魚庖刀式）は「かつては、その勝敗に漁場の権利がかかっていた」と記録され、判定を巡って争いが起こるほど真剣な行事であり、地区ごとの漁場利用権や漁業秩序を神事の勝敗によって儀礼化・調整する地域社会構造を反映している。",
    subjectName: "奈多・志式神社",
    objectEntityName: "奈多早魚行事の勝敗に賭けられた漁場利用権と地域漁業秩序の神事儀礼化",
    historicalLabel: "近世〜近代（奈多浦漁場秩序）",
    observedPlaceNames: ["福岡市博物館", "奈多・志式神社"],
    quote:
      "「かつては、その勝敗に漁場の権利がかかっていた」つまり、この行事は単なる料理競争ではなかった。勝敗が漁場の権利に関係し、判定を巡って争いが起こるほど真剣なものだったという。ここからは、地区ごとの漁業活動、漁場の利用権、青年組織による地区代表、技能の継承、神事による勝敗の儀礼化という地域社会の構造が見えてくる。",
  }),
  makeClaim({
    id: "claim-fcm-2026-016",
    statement:
      "献魚庖刀式で切り取られた鯛のひれは続く「ひれ舞」の採り物となった後、翌日の神事後に海へ放流され、またかつて25歳を最年長とした奈多の若者組において当日夕方から古老・先輩が稽古をつける短時間集中伝授によって漁村の身体技能と年齢集団秩序が継承されてきた。",
    subjectName: "奈多・志式神社",
    objectEntityName: "鯛のひれの海への還流儀礼と奈多若者組（25歳最年長）・古老による技能継承",
    historicalLabel: "近世〜現代",
    observedPlaceNames: ["福岡市博物館", "奈多・志式神社"],
    quote:
      "切り取られた鯛のひれは、続くひれ舞の採り物になる。さらに翌日の神事の後、海へ流される。魚をさばく技能、神楽の舞、海への放流が一連の行事としてつながっている。かつて奈多の若者組は25歳を最年長としていた。作法を覚える機会は当日夕方からの短時間で、古老や先輩が集まって稽古をつけるという。",
  }),

  // 7 & 8. 比較と総合構図 (2 Claims)
  makeClaim({
    id: "claim-fcm-2026-017",
    statement:
      "志賀海神社の歩射祭（弓射・青年8人・潜水ガラモ採取・阿曇百足伝承・宮座成員化）と志式神社の早魚行事（包丁技術・24〜25歳青年・鯛ひれ放流・漁場権競争）は、直接の同一起源と断定することはできないが、海での禊と青年組織の身体技能を介して海人共同体の役割と秩序を次世代へ継承する共通構造を備えている。",
    subjectName: "福岡市博物館",
    objectEntityName: "志賀海神社（歩射祭）と志式神社（早魚行事）の海人青年祭礼・海中禊・共同体秩序比較",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "古代〜中世〜近現代（海の中道・玄界灘海人祭祀圏）",
    observedPlaceNames: ["福岡市博物館", "志賀海神社", "奈多・志式神社"],
    quote:
      "両者に共通するのは、青年が祭礼の中心的な担い手となり、身体的な技能を通して地域社会の役割を引き継いでいくこと。また、海での禊が両方に見られる点も興味深い。ただし、両社の祭礼が同じ起源を持つとは確認できない。",
  }),
  makeClaim({
    id: "claim-fcm-2026-018",
    statement:
      "北部九州の歴史空間は、①大陸・半島との技術・葬送文化の接点（早良平野・梅林・老司・鋤崎古墳）、②海側物流外交拠点と内陸行政防衛拠点の連動（那津官家・水城・大宰府）、③宮座・青年組織・漁場権・海の聖地が支える海人祭祀共同体（志賀海・志式神社）の3軸が重層しており、考古資料・文献・伝承・現行祭礼を安易に単一の物語へ統合せず別々の地層として検証する必要がある。",
    subjectName: "福岡市博物館",
    objectEntityName: "北部九州の3軸構造（対外墓制接点・海陸拠点連動・海人祭祀共同体）と多層史料批判",
    claimKind: "hypothesis",
    verification: "source-checked",
    modality: "interpretive",
    sourceNature: "UserHypothesis",
    historicalLabel: "弥生・古墳・飛鳥奈良〜現代",
    observedPlaceNames: [
      "福岡市博物館",
      "志賀海神社",
      "奈多・志式神社",
      "水城（水城跡・東門官道・水城館）",
      "金印公園",
    ],
    quote:
      "今回の探索で特に大切なのは、古代の政治史と現在まで残る祭礼を、安易に一本の歴史物語にまとめないこと。考古資料、文献、伝承、現行祭礼をそれぞれ別の層として扱いながら、その重なりや変化を追っていく。北部九州の歴史を、海上交通・政治拠点・墓制・海人の祭祀という複数の軸から捉え直す一日となった。",
  }),
];

const newSpots = [
  {
    id: "spot-fukuoka-city-museum",
    name: "福岡市博物館",
    region: "福岡県 · 福岡市早良区百道浜",
    kind: "博物館・歴史資料館",
    latitude: 33.5897,
    longitude: 130.3531,
    claimIds: claims.map((c) => c.id),
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const spotClaimEnrichments = [
  {
    spotId: "spot-shikaumi-jinja",
    claimIds: [
      "claim-fcm-2026-011",
      "claim-fcm-2026-012",
      "claim-fcm-2026-013",
      "claim-fcm-2026-017",
      "claim-fcm-2026-018",
    ],
  },
  {
    spotId: "spot-nata-shikishiki",
    claimIds: [
      "claim-fcm-2026-014",
      "claim-fcm-2026-015",
      "claim-fcm-2026-016",
      "claim-fcm-2026-017",
      "claim-fcm-2026-018",
    ],
  },
  {
    spotId: "spot-mizuki-fortification",
    claimIds: ["claim-fcm-2026-006", "claim-fcm-2026-018"],
  },
  {
    spotId: "spot-kin-in-park",
    claimIds: ["claim-fcm-2026-018"],
  },
];

const connections = [
  {
    id: "conn-hakata-bay-dazaifu-functional-axis",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "海側外交物流・内陸防衛行政",
    title: "博多湾岸（那津官家・長津宮）と水城・大宰府の海陸機能連動軸",
    summary:
      "536年の那津官家や7世紀の博多湾岸兵站基地（長津宮・比恵那珂・博多遺跡群）から、663年白村江敗戦後の水城・大野城・大宰府への展開。単純な移転ではなく、海側の物流・外交玄関口を維持しつつ内陸に行政・防衛中枢を発展させた連動構造。",
    spotIds: [
      "spot-fukuoka-city-museum",
      "spot-itatuke-ruins",
      "spot-mizuki-fortification",
      "spot-dazaifu-kyakukan",
    ],
    claimIds: [
      "claim-fcm-2026-001",
      "claim-fcm-2026-002",
      "claim-fcm-2026-005",
      "claim-fcm-2026-006",
      "claim-fcm-2026-018",
    ],
    concepts: ["那津官家", "比恵・那珂遺跡群", "長津宮", "白村江の戦い", "水城", "大宰府", "海陸機能分担"],
    facets: [
      { id: "politics", label: "海側物流外交と内陸防衛行政の連動", weight: 5 },
      { id: "route", label: "博多湾岸から水城・大宰府への回廊", weight: 4 },
    ],
    lensId: "politics",
    topicId: "dazaifu-defense-preset",
    eras: [
      {
        id: "era-notsu-to-dazaifu-axis",
        label: "古墳時代後期〜飛鳥・奈良時代",
        range: "536年（宣化元年）〜7世紀後半",
        mapLabel: "那津官家・水城・大宰府連動軸",
        mapLayer: "domain",
        spotIds: [
          "spot-fukuoka-city-museum",
          "spot-itatuke-ruins",
          "spot-mizuki-fortification",
          "spot-dazaifu-kyakukan",
        ],
        claimIds: [
          "claim-fcm-2026-001",
          "claim-fcm-2026-002",
          "claim-fcm-2026-005",
          "claim-fcm-2026-006",
        ],
      },
    ],
  },
  {
    id: "conn-fukuoka-kofun-chamber-evolution",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "初期横穴式石室・渡来交流",
    title: "北部九州における横穴式石室の成立と半島交流（老司・鋤崎・梅林古墳）",
    summary:
      "福岡平野の老司古墳（竪穴系横口式石室・三角縁神獣鏡片）、糸島東端の鋤崎古墳（日本最古級の横穴式石室・3棺配置）、早良平野・梅林古墳（栄山江流域系鳥足文土器）を結び、南九州の地下式横穴墓と峻別しつつ北部九州が新葬送文化の玄関口であったことを示す。",
    spotIds: [
      "spot-fukuoka-city-museum",
      "spot-entity-79dbfb4c50ff70f5fe8e",
      "spot-zenichida-kofun-cluster",
    ],
    claimIds: [
      "claim-fcm-2026-003",
      "claim-fcm-2026-004",
      "claim-fcm-2026-007",
      "claim-fcm-2026-008",
      "claim-fcm-2026-009",
      "claim-fcm-2026-010",
    ],
    concepts: [
      "老司古墳",
      "鋤崎古墳",
      "梅林古墳",
      "竪穴系横口式石室",
      "初期横穴式石室",
      "鳥足文土器",
      "地下式横穴墓との峻別",
    ],
    facets: [
      { id: "people", label: "北部九州首長墓制の革新と渡来交流", weight: 5 },
      { id: "route", label: "朝鮮半島（栄山江流域等）と北部九州の葬送技術伝達", weight: 4 },
    ],
    lensId: "people",
    topicId: "ancient-chieftains-network",
    eras: [
      {
        id: "era-early-yokoana-chambers",
        label: "古墳時代前期末〜後期前半",
        range: "4世紀末〜6世紀前半",
        mapLabel: "北部九州初期横穴式石室・渡来交流圏",
        mapLayer: "domain",
        spotIds: [
          "spot-fukuoka-city-museum",
          "spot-entity-79dbfb4c50ff70f5fe8e",
          "spot-zenichida-kofun-cluster",
        ],
        claimIds: [
          "claim-fcm-2026-003",
          "claim-fcm-2026-004",
          "claim-fcm-2026-007",
          "claim-fcm-2026-008",
          "claim-fcm-2026-009",
          "claim-fcm-2026-010",
        ],
      },
    ],
  },
  {
    id: "conn-genkai-amabe-youth-rituals",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "海人祭礼・若者組・漁場秩序",
    title: "志賀海神社（歩射祭）と奈多・志式神社（早魚行事）の海人祭礼・青年共同体比較軸",
    summary:
      "志賀海神社の歩射祭（青年8人の弓射・勝馬詣り潜水ガラモ採取・お潮井かぶり・宮座成員化・阿曇百足伝承）と、奈多・志式神社の早魚行事（24〜25歳青年3人連携の献魚庖刀式・漁場権競争・鯛ひれ放流）を比較し、海での禊と青年組織が支える海人共同体秩序を浮き彫りにする。",
    spotIds: [
      "spot-fukuoka-city-museum",
      "spot-shikaumi-jinja",
      "spot-nata-shikishiki",
    ],
    claimIds: [
      "claim-fcm-2026-011",
      "claim-fcm-2026-012",
      "claim-fcm-2026-013",
      "claim-fcm-2026-014",
      "claim-fcm-2026-015",
      "claim-fcm-2026-016",
      "claim-fcm-2026-017",
      "claim-fcm-2026-018",
    ],
    concepts: [
      "歩射祭",
      "奈多の早魚行事",
      "阿曇百足",
      "勝馬詣り",
      "漁場利用権",
      "宮座・若者組",
      "海での禊",
    ],
    facets: [
      { id: "mythology", label: "海人族伝承と海浜祭祀空間", weight: 5 },
      { id: "religion", label: "青年組織・技能継承と共同体秩序", weight: 5 },
    ],
    lensId: "mythology",
    topicId: "marine-deities-preset",
    eras: [
      {
        id: "era-amabe-youth-rituals",
        label: "古代海人伝承〜中世・近世・現代祭礼",
        range: "古代〜現代",
        mapLabel: "志賀島・奈多 海人青年祭礼比較軸",
        mapLayer: "maritime",
        spotIds: [
          "spot-fukuoka-city-museum",
          "spot-shikaumi-jinja",
          "spot-nata-shikishiki",
        ],
        claimIds: [
          "claim-fcm-2026-011",
          "claim-fcm-2026-012",
          "claim-fcm-2026-013",
          "claim-fcm-2026-014",
          "claim-fcm-2026-015",
          "claim-fcm-2026-016",
          "claim-fcm-2026-017",
        ],
      },
    ],
  },
];

const newJourney = {
  id: "journey-fukuoka-city-museum-2026-11-14",
  label: "福岡市博物館と北部九州の重層探索（那津官家・初期横穴式石室・志賀海歩射祭と志式早魚行事）",
  documentIds: [documentId],
  spotIds: [
    "spot-fukuoka-city-museum",
    "spot-shikaumi-jinja",
    "spot-nata-shikishiki",
    "spot-mizuki-fortification",
    "spot-kin-in-park",
  ],
  connectionIds: connections.map((c) => c.id),
};

const newSuggestions = [
  {
    id: "sugg-roji-kofun-fukuoka",
    title: "老司古墳（福岡市南区）における竪穴系横口式石室と福岡平野首長墓の現地調査",
    targetName: "老司古墳",
    targetPlaceId: "roji-kofun-fukuoka",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.5308,
    longitude: 130.4225,
    question: "那珂川西岸の丘陵上に築かれた老司古墳の「竪穴系横口式石室」は、竪穴式から横穴式への墓制転換と福岡平野の首長権力をどう物語るか？",
    missingInformation: "後円部3基・前方部1基の石室配置と、那珂川流域を見渡す墳丘立地・周辺古墳群との空間関係の現地確認。",
    reason: "4世紀末〜5世紀初頭に三角縁神獣鏡片・短甲・馬具を副葬しつつ、日本における横穴式石室成立過程の鍵を握る重要首長墓であるため。",
    expectedObservation: "全長76mの前方後円墳の墳丘地形、那珂川流域の眺望、現地解説板。",
    uncertainty: "竪穴系横口式石室の技術系譜における朝鮮半島南部地域との具体的ルート。",
    claimIds: ["claim-fcm-2026-007", "claim-fcm-2026-008", "claim-fcm-2026-010"],
    anchorSpotIds: ["spot-fukuoka-city-museum", "spot-zenichida-kofun-cluster"],
    connectionIds: ["conn-fukuoka-kofun-chamber-evolution"],
    lensId: "people",
    topicId: "ancient-chieftains-network",
    initialStatus: "suggested",
  },
  {
    id: "sugg-sukizaki-kofun-imajuku",
    title: "鋤崎古墳（福岡市西区今宿青木）における日本最古級横穴式石室と今宿古墳群の現地調査",
    targetName: "鋤崎古墳",
    targetPlaceId: "sukizaki-kofun-imajuku",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.5756,
    longitude: 130.2589,
    question: "糸島平野北東端の鋤崎古墳になぜ日本最古級の整った横穴式石室と3種（石棺・土製棺・木棺）の棺配置が採用されたのか？",
    missingInformation: "高祖山北麓・今宿平野の地形と、丸隈山古墳・大塚古墳など今宿古墳群全体の首長墓系譜の現地確認。",
    reason: "北部九州が朝鮮半島との交流を通じて新しい埋葬技術・葬送文化を列島へ最初に導入した玄関口であったことを実証する首長墓であるため。",
    expectedObservation: "全長62mの前方後円墳の墳丘、今宿湾（博多湾西部）と高祖山系の地形関係。",
    uncertainty: "奥壁の石棺・右壁の土製棺・左壁の木棺に葬られた3者の親族・階層関係。",
    claimIds: ["claim-fcm-2026-009", "claim-fcm-2026-010"],
    anchorSpotIds: ["spot-fukuoka-city-museum", "spot-entity-79dbfb4c50ff70f5fe8e"],
    connectionIds: ["conn-fukuoka-kofun-chamber-evolution"],
    lensId: "people",
    topicId: "ancient-chieftains-network",
    initialStatus: "suggested",
  },
  {
    id: "sugg-yoshitake-bairin-sawara",
    title: "吉武高木遺跡・梅林古墳（早良・城南）における5世紀渡来交流と栄山江系土器の現地調査",
    targetName: "吉武高木遺跡・やよいの風公園",
    targetPlaceId: "yoshitake-takagi-site",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.5419,
    longitude: 130.3239,
    question: "5世紀に比恵・那珂が一旦衰退する中で、なぜ早良平野（吉武遺跡群）や梅林古墳の集団が朝鮮半島（栄山江流域等）と直接交渉し存在感を高めたのか？",
    missingInformation: "室見川流域・飯盛山東麓の地形と、弥生王墓から5世紀渡来系拠点へと続く早良平野の通時的立地の現地確認。",
    reason: "軟質・陶質土器、金銅装大刀、初期須恵器、鍛冶工具、栄山江流域の鳥足文土器など、5世紀九州の多元的な対外交渉主体を解明するため。",
    expectedObservation: "やよいの風公園（吉武高木遺跡）の復元遺構、室見川と飯盛山を望む早良平野の扇状地地形。",
    uncertainty: "5世紀早良平野の首長層と6世紀有田遺跡（那津官家候補地の一つ）への政治的連続性。",
    claimIds: ["claim-fcm-2026-002", "claim-fcm-2026-003", "claim-fcm-2026-004"],
    anchorSpotIds: ["spot-fukuoka-city-museum"],
    connectionIds: ["conn-fukuoka-kofun-chamber-evolution", "conn-hakata-bay-dazaifu-functional-axis"],
    lensId: "people",
    topicId: "ancient-chieftains-network",
    initialStatus: "suggested",
  },
];

function upsertDataset(targetAtlas, targetDocs, targetClaims) {
  if (targetDocs) {
    const dIdx = targetDocs.findIndex((d) => d.id === newDocument.id);
    if (dIdx >= 0) {
      targetDocs[dIdx] = newDocument;
    } else {
      targetDocs.push(newDocument);
    }
  }

  if (targetClaims) {
    for (const c of claims) {
      const idx = targetClaims.findIndex((existing) => existing.id === c.id);
      if (idx >= 0) {
        targetClaims[idx] = c;
      } else {
        targetClaims.push(c);
      }
    }
  }

  if (targetAtlas) {
    if (!targetAtlas.journeys) {
      targetAtlas.journeys = [];
    }
    const jIdx = targetAtlas.journeys.findIndex((j) => j.id === newJourney.id);
    if (jIdx >= 0) {
      targetAtlas.journeys[jIdx] = newJourney;
    } else {
      targetAtlas.journeys.push(newJourney);
    }

    for (const s of newSpots) {
      const sIdx = targetAtlas.spots.findIndex((existing) => existing.id === s.id);
      if (sIdx >= 0) {
        targetAtlas.spots[sIdx] = s;
      } else {
        targetAtlas.spots.push(s);
      }
    }

    for (const enrichment of spotClaimEnrichments) {
      const targetSpot = targetAtlas.spots.find((s) => s.id === enrichment.spotId);
      if (targetSpot) {
        for (const cid of enrichment.claimIds) {
          if (!targetSpot.claimIds.includes(cid)) {
            targetSpot.claimIds.push(cid);
          }
        }
      }
    }

    for (const c of connections) {
      const cIdx = targetAtlas.connections.findIndex((existing) => existing.id === c.id);
      if (cIdx >= 0) {
        targetAtlas.connections[cIdx] = c;
      } else {
        targetAtlas.connections.push(c);
      }
    }

    if (!targetAtlas.suggestions) {
      targetAtlas.suggestions = [];
    }
    for (const sugg of newSuggestions) {
      const sIdx = targetAtlas.suggestions.findIndex((existing) => existing.id === sugg.id);
      if (sIdx >= 0) {
        targetAtlas.suggestions[sIdx] = sugg;
      } else {
        targetAtlas.suggestions.push(sugg);
      }
    }

    // Enrich existing sugg-notsu-miyake-site with the new museum claims & anchor spot
    const notsuSugg = targetAtlas.suggestions.find((s) => s.id === "sugg-notsu-miyake-site");
    if (notsuSugg) {
      for (const cid of ["claim-fcm-2026-001", "claim-fcm-2026-002", "claim-fcm-2026-005"]) {
        if (!notsuSugg.claimIds.includes(cid)) {
          notsuSugg.claimIds.push(cid);
        }
      }
      if (!notsuSugg.anchorSpotIds.includes("spot-fukuoka-city-museum")) {
        notsuSugg.anchorSpotIds.push("spot-fukuoka-city-museum");
      }
      if (!notsuSugg.connectionIds.includes("conn-hakata-bay-dazaifu-functional-axis")) {
        notsuSugg.connectionIds.push("conn-hakata-bay-dazaifu-functional-axis");
      }
    }
  }
}

// 1. tomono-review-draft.json
if (fs.existsSync(draftPath)) {
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  upsertDataset(null, draft.documents, draft.claims);
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
  console.log("Updated tomono-review-draft.json successfully.");
}

// 2. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertDataset(atlas, null, null);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2) + "\n", "utf8");
  console.log("Updated travel-atlas.yamatai.json successfully.");
}

// 3. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertDataset(pub.atlas, pub.documents, pub.claims);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2) + "\n", "utf8");
  console.log(
    `Updated published-review-dataset.json successfully (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length})`,
  );
}

console.log("Import Fukuoka City Museum journey (2026-11-14) completed successfully!");
