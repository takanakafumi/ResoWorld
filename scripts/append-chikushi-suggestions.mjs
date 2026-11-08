import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const chikushiSuggestions = [
  {
    id: "next-chikushi-iwatoyama-kofun",
    title: "『筑後国風土記』逸文が語る磐井の墓・衙頭（裁判所）と石人石馬の痕跡を確かめる",
    targetName: "八女岩戸山古墳（国史跡・磐井の墓・衙頭跡）",
    targetPlaceId: "iwatoyama-kofun",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.2323,
    longitude: 130.5639,
    question: "風土記に記された「衙頭（裁判所・別区）」の遺構と石人・石馬の群像から、ヤマト王権と対峙した筑紫君の統治機構をどう読み解くか？",
    missingInformation: "現地保存されている別区（衙頭）の空間規模、石人・石馬の出土位置と、風土記記述の整合性に関する現地観察記録。",
    reason: "『筑後国風土記』逸文に記された筑紫君磐井の墓であり、古代日本における地方政権の司法・行政空間（裁判所）が考古学的に実証された最重要未訪問フロンティア。",
    expectedObservation: "前方後円墳の墳丘規模、北東隅の別区（衙頭跡）方形区画、隣接交流館展示の石人・石馬（原告・被告・立証の像）。",
    uncertainty: "石人石馬の多くは破砕され博物館・交流館に移管されているため、現地遺構と展示の照合が必要。",
    claimIds: ["claim-chikushi-iwai-001", "claim-chikushi-iwai-004"],
    anchorSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    connectionIds: ["conn-chikushi-order-boundary"],
    lensId: "people",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "next-chikushi-sekijinsan-kofun",
    title: "武装石人と初期横穴式石室から磐井前代の八女首長権力を検証する",
    targetName: "石人山古墳（国史跡・武装石人）",
    targetPlaceId: "place-sekijinsan-kofun",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.2490,
    longitude: 130.5690,
    question: "武装石人の写実的造形と初期横穴式石室から、磐井の父祖世代における八女首長層の軍事力と半島交流の独自性をどう確認できるか？",
    missingInformation: "墳丘保存状況、石室開口部の構造、覆屋に保護された武装石人（国重文）の細部意匠。",
    reason: "岩戸山古墳に先立つ5世紀末の前方後円墳であり、八女首長層がヤマト王権に対抗しうる武力・半島交易基盤を築いていった歴史的プロセスを示すため。",
    expectedObservation: "国重文の武装石人、玄室構造、八女古墳群北西端の立地地形。",
    uncertainty: "石室内部の見学可否は時期・保存状況によるため外観と解説版の確認が中心となる可能性。",
    claimIds: ["claim-chikushi-iwai-001"],
    anchorSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    connectionIds: ["conn-chikushi-order-boundary"],
    lensId: "people",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "next-chikushi-yametsuhime-shrine",
    title: "八女の地名起源女神・八女津媛の神の窟と土着祭祀の精神基盤を訪ねる",
    targetName: "八女津媛神社（八女の起源女神・神の窟）",
    targetPlaceId: "yametsuhime-shrine",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.2081,
    longitude: 130.7042,
    question: "景行紀・風土記逸文に語られる土着女性首長・地主神の岩屋祭祀は、八女古墳群を築いた筑紫君の精神的ルーツとどう連動しているか？",
    missingInformation: "日向・肥後山間部へ連なる矢部川上流の岩窟祭祀景観と、八女平野部の首長墓群との距離感・信仰的連続性。",
    reason: "『筑後国風土記』逸文および『日本書紀』景行紀において八女の地名起源となった女神の奉斎地であり、平野部首長国家の背後にある山地土着信仰を捉える重要拠点。",
    expectedObservation: "「神の窟」と呼ばれる巨大な岩陰遺構、湧水環境、山間部信仰空間の原初的形態。",
    uncertainty: "山間部立地のため交通アクセスと天候・落石状況の確認が必要。",
    claimIds: ["claim-chikushi-order-002", "claim-chikushi-iwai-004"],
    anchorSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    connectionIds: ["conn-chikushi-order-boundary"],
    lensId: "mythology",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "next-chikushi-kora-taisha",
    title: "筑後国一之宮・高良山（伊福部岳）の宗教的・軍事的高地性を読み解く",
    targetName: "高良大社（伊福部岳・筑後国一之宮）",
    targetPlaceId: "kora-taisha",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.2988,
    longitude: 130.5670,
    question: "筑後川平野を見下ろす高良山（伊福部岳）の宗教的・軍事的高地性は、古代筑紫君の防衛ラインおよび水沼氏・玉垂命祭祀とどう連動していたか？",
    missingInformation: "高良大社境内から望む筑後川中流域・有明海方面のパノラマ視覚と、伊福部岳防戦伝承の空間位置関係。",
    reason: "『筑後国風土記』逸文御井郡条の舞台であり、高良山麓の祇園山古墳（前期首長墓）から続く内陸水運掌握の最重要拠点。",
    expectedObservation: "本殿・社殿規模、神護景雲碑・古代祭祀遺構、筑後平野を一望する軍事・防衛地形の観察。",
    uncertainty: "現在の社殿・信仰形態は中世以降の高良玉垂宮神仏習合・修験道秩序が色濃いため、古代地層の慎重な読解が必要。",
    claimIds: ["claim-chikushi-iwai-001", "claim-chikushi-iwai-004"],
    anchorSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    connectionIds: ["conn-chikushi-order-boundary"],
    lensId: "route",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
  {
    id: "next-chikushi-tsurugi-kurate",
    title: "『筑前国風土記』逸文の筑紫君鞍運伝承と遠賀川鉄器ネットワークを追う",
    targetName: "剣神社（鞍手郡・筑紫君鞍運伝承地）",
    targetPlaceId: "tsurugi-shrine-kurate",
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: 33.7915,
    longitude: 130.6812,
    question: "『筑前国風土記』逸文に見られる筑紫君鞍運の伝承と遠賀川流域の鉄器生産拠点は、筑紫君の勢力が有明海から遠賀川・玄界灘へどう及んでいたかをどう示すか？",
    missingInformation: "遠賀川中流域・鞍手地方における筑紫君関係伝承の遺存度と、古代製鉄・鍛冶遺跡群との空間関係。",
    reason: "筑紫君の活動範囲が筑後・有明海側にとどまらず、遠賀川流域の鉄器生産ネットワークにも関与していたことを示す貴重な風土記伝承地。",
    expectedObservation: "古社境内の由緒碑・祭神（素戔嗚尊・日本武尊等）、遠賀川支流沿いの丘陵地形。",
    uncertainty: "中世以降の武家信仰（剣大明神）による上書きが存在するため、古代伝承との重層性を意識した観察が必要。",
    claimIds: ["claim-chikushi-iwai-001"],
    anchorSpotIds: ["spot-entity-20c6c6a47c1356d70583"],
    connectionIds: ["conn-chikushi-order-boundary"],
    lensId: "people",
    topicId: "ancient-chieftains-preset",
    initialStatus: "suggested",
  },
];

function upsertSuggestions(targetAtlas) {
  if (!targetAtlas.suggestions) {
    targetAtlas.suggestions = [];
  }
  for (const sug of chikushiSuggestions) {
    const idx = targetAtlas.suggestions.findIndex((s) => s.id === sug.id);
    if (idx >= 0) {
      targetAtlas.suggestions[idx] = sug;
    } else {
      targetAtlas.suggestions.push(sug);
    }
  }
}

if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertSuggestions(atlas);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
  console.log("Updated travel-atlas.yamatai.json suggestions.");
}

if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertSuggestions(pub.atlas);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log(`Updated published-review-dataset.json suggestions (total: ${pub.atlas.suggestions.length}).`);
}

console.log("Chikushi suggestions updated successfully!");
