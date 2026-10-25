import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const traveloguePath = path.join(root, "旅行記", "2026年10月25日.txt");
const draftPath = path.join(root, "data/imports/tomono-review-draft.json");
const atlasPath = path.join(root, "data/imports/review/travel-atlas.yamatai.json");
const publishedPath = path.join(root, "apps/web/src/data/published-review-dataset.json");

const travelogueContent = fs.readFileSync(traveloguePath, "utf-8");
const travelogueSha256 = crypto
  .createHash("sha256")
  .update(travelogueContent, "utf-8")
  .digest("hex")
  .toUpperCase();

const documentId = "doc-kasuya-sue-wakasugi-2026-10-25";
const documentTitle = "2026年10月25日 探索記録（粕屋・須恵の古代史資料と、若杉山麓の宗教景観）";
const relativeTraveloguePath = "旅行記/2026年10月25日.txt";

const newDocument = {
  id: documentId,
  title: documentTitle,
  path: relativeTraveloguePath,
  sha256: travelogueSha256,
  authorType: "user-authored",
  privacy: "private",
  observedAt: "2026-10-25",
  documentedAt: "2026-10-25",
  dateStatus: "known",
};

const spots = [
  {
    id: "spot-kasuya-history-museum",
    name: "粕屋町立歴史資料館",
    region: "福岡県 · 粕屋町",
    kind: "博物館・歴史資料館・古代遺跡展示",
    latitude: 33.6137,
    longitude: 130.476,
    claimIds: [
      "claim-kasuya-sue-wakasugi-001",
      "claim-kasuya-sue-wakasugi-002",
      "claim-kasuya-sue-wakasugi-003",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-sue-history-museum",
    name: "須恵町立歴史民俗資料館",
    region: "福岡県 · 須恵町",
    kind: "博物館・民俗資料館・窯業生活文化",
    latitude: 33.5917,
    longitude: 130.5245,
    claimIds: [
      "claim-kasuya-sue-wakasugi-004",
      "claim-kasuya-sue-wakasugi-005",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-homan-shinguji",
    name: "宝満神宮寺・根本山 宝満堂",
    region: "福岡県 · 須恵町",
    kind: "寺院・宗教施設・現代宗教景観（構想先行型）",
    latitude: 33.59,
    longitude: 130.5247,
    claimIds: [
      "claim-kasuya-sue-wakasugi-006",
      "claim-kasuya-sue-wakasugi-007",
      "claim-kasuya-sue-wakasugi-008",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-taiso-jinja-gegu",
    name: "太祖神社 下宮（太祖宮）",
    region: "福岡県 · 篠栗町",
    kind: "神社・若杉山麓祭祀・太祖神楽・古層候補",
    latitude: 33.6115,
    longitude: 130.5209,
    claimIds: [
      "claim-kasuya-sue-wakasugi-009",
      "claim-kasuya-sue-wakasugi-010",
      "claim-kasuya-sue-wakasugi-011",
      "claim-kasuya-sue-wakasugi-012",
      "claim-kasuya-sue-wakasugi-013",
      "claim-kasuya-sue-wakasugi-014",
    ],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
];

const claims = [
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-001",
    statement:
      "多々良川西岸の戸原寺田遺跡では弥生前期の丸木舟と古墳後期の水路・船着き場が確認されるが、両者は時期が異なり一つの水運施設としてまとめず個別年代と役割の峻別が必要である。",
    subject: { name: "粕屋町立歴史資料館", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "戸原寺田遺跡の丸木舟・水路施設と水運年代の峻別",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "弥生前期（紀元前8〜5世紀）〜古墳後期",
      precision: "broad-range",
    },
    places: [{ name: "粕屋町立歴史資料館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 26,
          endLine: 40,
          quote:
            "多々良川西岸に位置する遺跡。弥生時代前期の丸木舟。展示解説では紀元前8～5世紀頃。古墳時代後期の水路・船着き場と考えられる施設。丸木舟と水路・船着き場は時期が異なる。両者をひとつの時代の水運施設としてまとめず、それぞれの年代と役割を分けて考える必要がある。",
        },
      },
    ],
    createdAt: "2026-10-25T10:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-002",
    statement:
      "井山古墳群は6世紀後半〜7世紀初頭の集団墓として横穴式石室・箱式石棺・須恵器・土師器・刀剣・馬具等を出土し、地域社会の武装首長層の葬送を示すが氏族特定は直接できない。",
    subject: { name: "粕屋町立歴史資料館", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "井山古墳群の集団墓制と古墳後期首長層副葬品",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "古墳時代後期（6世紀後半〜7世紀初頭）",
      precision: "period",
    },
    places: [{ name: "粕屋町立歴史資料館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 41,
          endLine: 55,
          quote:
            "38基の墓坑、11基の横穴式石室、6基の箱式石棺。展示では、古墳時代後期、概ね6世紀後半～7世紀初頭の集団墓として紹介されていた。複数形式の埋葬施設と副葬品は、地域社会の葬送や武器・馬具を保有した人々を考える手がかりになる。",
        },
      },
    ],
    createdAt: "2026-10-25T10:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-003",
    statement:
      "阿恵官衙遺跡は飛鳥〜奈良時代の糟屋郡衙跡と考えられ、698年の鐘銘に「糟屋評造」の表記があり、701年大宝律令を境とする「評」から「郡」への律令行政区画変遷を同時代銘文と遺構で実証する。",
    subject: { name: "粕屋町立歴史資料館", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "阿恵官衙遺跡と「糟屋評造」銘文による評・郡変遷実証",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "飛鳥〜奈良時代（698年鐘銘・701年大宝律令期）",
      precision: "period",
    },
    places: [{ name: "粕屋町立歴史資料館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 56,
          endLine: 68,
          quote:
            "飛鳥時代から奈良時代にかけての地方官衙遺跡。糟屋郡の郡衙に関係する施設と考えられている。698年の鐘銘に「糟屋評造」の表記がある。701年の大宝律令を境に、行政区画の表記が「評」から「郡」へ変化した。地方行政の変化を、後世の地名だけでなく、同時代の銘文や遺構から検討できる点が重要。",
        },
      },
    ],
    createdAt: "2026-10-25T11:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-004",
    statement:
      "須恵町立歴史民俗資料館の須恵焼は江戸時代以降の地域の焼き物であり、名称が類似していても古代の須恵器とは成立時期・生産背景・技術史が明確に区別される。",
    subject: { name: "須恵町立歴史民俗資料館", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "江戸須恵焼と古代須恵器の技術史的峻別",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "江戸時代以降〜現代",
      precision: "broad-range",
    },
    places: [{ name: "須恵町立歴史民俗資料館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 73,
          endLine: 78,
          quote:
            "展示されていた須恵焼は江戸時代以降の地域の焼き物であり、古代の須恵器とは別のもの。名称が似ていても、成立時期・生産背景・技術史は区別する必要がある。",
        },
      },
    ],
    createdAt: "2026-10-25T11:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-005",
    statement:
      "資料館に展示されたファミコン等のように、近現代の日用品や娯楽も時間の経過とともに生活文化資料へと変化し、何が歴史資料として扱われるか自体が時代とともに相対化される。",
    subject: { name: "須恵町立歴史民俗資料館", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "ファミコン等日用品展示と生活文化史の史料化",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "昭和後期〜現代",
      precision: "period",
    },
    places: [{ name: "須恵町立歴史民俗資料館", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 79,
          endLine: 86,
          quote:
            "資料館には、ファミコンも「昔のゲーム」として展示されていた。古代の土器や石器だけでなく、近現代の日用品や娯楽も、時間が経てば地域の生活史を考える資料になる。何が資料として扱われるか自体も、時代によって変化する。",
        },
      },
    ],
    createdAt: "2026-10-25T12:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-006",
    statement:
      "宝満神宮寺（根本山宝満堂）の境内では八大龍王神祈願池、龍柱、「聖水を3回」「心ざんす みません10回」唱える定型作法が表示され、参拝者の理解と行動が具体的に構成された空間となっている。",
    subject: { name: "宝満神宮寺・根本山 宝満堂", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "八大龍王池と定型的唱句・礼拝作法の空間構成",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "平成時代〜現代",
      precision: "period",
    },
    places: [{ name: "宝満神宮寺・根本山 宝満堂", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 95,
          endLine: 127,
          quote:
            "八大龍王神の祈願池と龍を表現した柱、聖水を3回かけるよう案内する表示、「心ざんす みません」と10回唱えるよう案内する表示。意味の説明と行動の手順がセットで提示されることで、参拝者がその空間をどう理解し、どう行動するかまで構成されているように感じられた。",
        },
      },
    ],
    createdAt: "2026-10-25T12:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-007",
    statement:
      "宝満神宮寺境内には和の宮磐座・三ツ鳥居模倣・香椎宮綾杉木片・観音真言・宇宙の種石など異なる由来を持つ神仏・シンボルが「全方位の霊威」として構想先行型に集約・配置されている。",
    subject: { name: "宝満神宮寺・根本山 宝満堂", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "三ツ鳥居模倣・綾杉古木片等の構想先行型集約配置",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "qualified" },
    historicalTime: {
      kind: "named",
      label: "平成時代以降（新造・配置）",
      precision: "broad-range",
    },
    places: [{ name: "宝満神宮寺・根本山 宝満堂", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 100,
          endLine: 135,
          quote:
            "「和の宮」と表示された磐座、三ツ鳥居に似た形式の鳥居、香椎宮の綾杉に関係すると説明される木。神仏、龍神、磐座、巨石、鳥居、樹木など、それぞれ異なる歴史的・宗教的背景を持つ要素が、境内全体ではひとつの構想のもとに配置されている。個々の要素の由来以上に、それらを現在の形にまとめた過程を調べる必要性を感じた。",
        },
      },
    ],
    createdAt: "2026-10-25T13:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-008",
    statement:
      "宝満神宮寺は1994年以降の造営・単立宗教法人であり、歴史上の太宰府宝満山大山寺の法統や大神神社三ツ鳥居の正式勧請関係はなく、平成期宗教構想による「後世再構成（ラベルC）」に該当する。",
    subject: { name: "宝満神宮寺・根本山 宝満堂", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "単立宗教法人沿革と歴史的性格ラベルC（後世再構成）判定",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "平成6年（1994年）造営〜現代",
      precision: "broad-range",
    },
    places: [{ name: "宝満神宮寺・根本山 宝満堂", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 144,
          endLine: 167,
          quote:
            "歴史上の宝満山に寺院が存在したことと、現在の宝満神宮寺がその法統を継承していることも別問題である。伝承や名称の存在は記録するが、個別の物の来歴や歴史的連続性は確認できるまで未確定として残す。現代に形成された宗教景観であることは現在の信仰の価値を否定するものではない。",
        },
      },
    ],
    createdAt: "2026-10-25T13:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-009",
    statement:
      "篠栗町若杉の太祖神社下宮は主祭神を伊弉諾尊とし、神功皇后の香椎祈願・若杉山神社再興伝承を伝え、中古以降左右殿に八幡・聖母・宝満および天照・志賀・住吉を祀る多層配祀をとる。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "enshrined_at",
    object: {
      kind: "entity",
      entity: {
        name: "伊弉諾尊主祭神・神功皇后若杉山再興伝承と左右殿多層祭神",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "神話伝承〜中古以降・慶長5年（1600年黒田長政崇敬）",
      precision: "broad-range",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 172,
          endLine: 187,
          quote:
            "主祭神を伊弉諾尊とし、神功皇后の朝鮮半島への遠征に関わる伝承が紹介されていた。神功皇后が香椎宮で神々に祈り、帰還後に若杉山の山頂に神社を建立・再興したとされる。中古以降の祭神構成として中央：伊弉諾尊、右殿：八幡・聖母・宝満、左殿：天照・志賀・住吉。黒田長政が慶長5年（1600年）以降に崇敬。",
        },
      },
    ],
    createdAt: "2026-10-25T14:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-010",
    statement:
      "太祖神社下宮では江戸時代から継承される県指定無形民俗文化財「太祖神楽」をはじめ春秋例祭・日籠祭等の祭礼が行われ、若杉山麓の地域社会と神社の継続的関係を示している。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "functioned_as",
    object: {
      kind: "entity",
      entity: {
        name: "県指定無形民俗文化財「太祖神楽」と地域共同体祭礼",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "江戸時代〜現代（県無形民俗文化財）",
      precision: "period",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 188,
          endLine: 201,
          quote:
            "祭礼として、春秋の例祭、初申祭、日籠祭、七夕祭・山笠、新嘗祭などが記載されていた。太祖神楽は江戸時代から続くと説明され、県指定無形民俗文化財となっている。祭礼や神楽は、地域社会と神社の関係を考える重要な資料である。",
        },
      },
    ],
    createdAt: "2026-10-25T14:30:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-011",
    statement:
      "太祖神社境内には推定樹齢約600年（胸高直径235cm、樹高33m）をはじめとする町天然記念物のクスノキ群が茂り、数百年単位の景観形成時間を実証している。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "推定樹齢600年の町指定天然記念物クスノキ群",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "中世（推定樹齢約600年）〜現代",
      precision: "period",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 202,
          endLine: 209,
          quote:
            "クスノキ4本とオガタマノキ1本が町の天然記念物に指定。2本目のクスノキは胸高直径235cm、樹高33m、推定樹齢約600年。樹齢は境内の景観が形成されてきた時間を考える手がかりになる。",
        },
      },
    ],
    createdAt: "2026-10-25T14:45:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-012",
    statement:
      "太祖神社下宮では注連縄の巻かれた破損石、上宮方向を向く拝殿裏鳥居、相撲場等が観察され、山岳景観・古木・神楽と併せて古層祭祀の手がかりを持つが開始時期未確定のため「古層候補（ラベルB）」と暫定評価される。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "破損注連縄石・上宮遥拝鳥居と古層候補（ラベルB）判定",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "qualified" },
    historicalTime: {
      kind: "named",
      label: "古代伝承〜現代",
      precision: "broad-range",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 210,
          endLine: 229,
          quote:
            "注連縄が巻かれているが説明表示のない破損した石。拝殿の背後にあり上宮方向を向いているように見えた鳥居。山岳景観、地域の祭礼、太祖神楽、古木、上宮・下宮・古堂という空間的な関係は地域の宗教景観を考える手がかりになる。暫定ラベル：B「古層候補」。",
        },
      },
    ],
    createdAt: "2026-10-25T15:00:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-013",
    statement:
      "若杉山中の和多都美神社は山中にありながら海神「ワタツミ」名を冠しており、山中水源・降雨信仰と海神信仰の関係や祭神・社名の変遷について継続調査を要する。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "若杉山中・和多都美神社の山中海神信仰と水源祭祀の調査課題",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "hypothetical" },
    historicalTime: {
      kind: "named",
      label: "歴史地理的調査仮説",
      precision: "broad-range",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 232,
          endLine: 249,
          quote:
            "「和多都美」という名称は、海神・綿津見（ワタツミ）との関係を連想させる。しかし、山中に位置することと名称との関係は、名前だけでは説明できない。山の水源・雨・川と海神信仰との関係、社名や祭神の変更の有無を確認する必要がある。",
        },
      },
    ],
    createdAt: "2026-10-25T15:15:00Z",
  },
  {
    schemaVersion: "0.2.0",
    id: "claim-kasuya-sue-wakasugi-014",
    statement:
      "宗教景観の分析において、歴史的連続性の評価（古層継承A・候補B・再構成C・保留U）と、意味の形成過程（歴史的累積型 vs 構想先行型）を独立した直交軸として扱い、確認事実・解釈仮説・観察印象を厳格に分離する。",
    subject: { name: "太祖神社 下宮（太祖宮）", type: "Place" },
    predicate: "associated_with",
    object: {
      kind: "entity",
      entity: {
        name: "歴史的性格と景観形成動態の二層分析フレームワーク",
        type: "Concept",
      },
    },
    qualifiers: {},
    claimKind: "observation",
    originType: "imported",
    reviewStatus: "confirmed",
    epistemic: { verification: "personal-evidence", modality: "asserted" },
    historicalTime: {
      kind: "named",
      label: "認識論・方法論",
      precision: "broad-range",
    },
    places: [{ name: "太祖神社 下宮（太祖宮）", role: "subject_place" }],
    evidence: [
      {
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId,
          documentSha256: travelogueSha256,
          startLine: 252,
          endLine: 303,
          quote:
            "歴史的連続性の評価とは別に、意味の形成過程と宗教景観の再構成を分析する軸を設ける。軸A：歴史的連続性（A/B/C/U）、軸B：宗教景観の形成過程（累積型/構想先行型/再編型/複合型）。確認事実、解釈仮説、観察者の印象を分けて記録する。",
        },
      },
    ],
    createdAt: "2026-10-25T15:30:00Z",
  },
];

const connections = [
  {
    id: "connection-kasuya-sue-wakasugi-ancient-admin-transport",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "GUNGA / SAILING / BURIAL MOUND",
    title: "古代糟屋評・郡衙（阿恵官衙遺跡）と多々良川水系水運ネットワーク",
    summary:
      "多々良川西岸の戸原寺田遺跡（弥生前期丸木舟・古墳後期船着場水路）から井山古墳群集団墓、そして698年鐘銘「糟屋評造」と701年大宝律令「評→郡」変遷を実証する阿恵官衙遺跡まで、古代糟屋の交通水運と律令国家支配の浸透プロセスを辿る。",
    spotIds: [
      "spot-kasuya-history-museum",
      "spot-sue-history-museum",
    ],
    claimIds: [
      "claim-kasuya-sue-wakasugi-001",
      "claim-kasuya-sue-wakasugi-002",
      "claim-kasuya-sue-wakasugi-003",
    ],
    concepts: [
      "阿恵官衙遺跡",
      "糟屋評造",
      "評から郡への変遷",
      "戸原寺田遺跡丸木舟",
      "井山古墳群",
      "多々良川水運",
    ],
    facets: [
      { id: "politics", label: "古代官衙・律令支配", weight: 5 },
      { id: "exchange", label: "多々良川水運・丸木舟", weight: 5 },
      { id: "ritual", label: "集団墓制・馬具武器", weight: 4 },
    ],
    lensId: "route",
    topicId: "yayoi-archaeology-network",
    eras: [
      {
        id: "era-kasuya-gunga-transport",
        label: "弥生水運から飛鳥・奈良期糟屋評衙・郡衙への展開",
        range: "弥生時代前期〜奈良時代（701年大宝律令）",
        mapLabel: "阿恵官衙遺跡（糟屋評造）と戸原寺田水運層",
        mapLayer: "domain",
        spotIds: [
          "spot-kasuya-history-museum",
          "spot-sue-history-museum",
        ],
        claimIds: [
          "claim-kasuya-sue-wakasugi-001",
          "claim-kasuya-sue-wakasugi-002",
          "claim-kasuya-sue-wakasugi-003",
        ],
      },
    ],
  },
  {
    id: "connection-kasuya-sue-wakasugi-wakasugi-shrine-lineage",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "WAKASUGI / TAISO KAGURA / SACRED TREES",
    title: "若杉山岳祭祀と太祖神楽・巨樹景観の重層（太祖神社下宮・古層候補B）",
    summary:
      "主祭神・伊弉諾尊と神功皇后若杉山再興伝承、中古左右殿重層配祀から、江戸時代より継承される県指定無形民俗文化財「太祖神楽」、推定樹齢600年のクスノキ群、破損注連縄石、上宮遥拝鳥居まで、若杉山麓の共同体祭祀と山岳聖地の重層性を捉える。",
    spotIds: [
      "spot-taiso-jinja-gegu",
      "spot-homan-shinguji",
    ],
    claimIds: [
      "claim-kasuya-sue-wakasugi-009",
      "claim-kasuya-sue-wakasugi-010",
      "claim-kasuya-sue-wakasugi-011",
      "claim-kasuya-sue-wakasugi-012",
      "claim-kasuya-sue-wakasugi-013",
      "claim-kasuya-sue-wakasugi-014",
    ],
    concepts: [
      "太祖神社下宮",
      "伊弉諾尊",
      "神功皇后若杉山再興伝承",
      "太祖神楽（県無形民俗文化財）",
      "推定樹齢600年クスノキ",
      "上宮遥拝鳥居",
      "古層候補（ラベルB）",
    ],
    facets: [
      { id: "ritual", label: "太祖神楽・例祭", weight: 5 },
      { id: "myth", label: "神功皇后・若杉山伝承", weight: 4 },
      { id: "spatial", label: "巨樹・山岳遥拝景観", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-concepts",
    eras: [
      {
        id: "era-wakasugi-taiso-lineage",
        label: "若杉山岳伝承と江戸太祖神楽・巨樹祭祀",
        range: "古代伝承〜江戸時代〜現代",
        mapLabel: "太祖神社下宮太祖神楽とクスノキ巨樹群",
        mapLayer: "religious",
        spotIds: [
          "spot-taiso-jinja-gegu",
          "spot-homan-shinguji",
        ],
        claimIds: [
          "claim-kasuya-sue-wakasugi-009",
          "claim-kasuya-sue-wakasugi-010",
          "claim-kasuya-sue-wakasugi-011",
          "claim-kasuya-sue-wakasugi-012",
        ],
      },
    ],
  },
  {
    id: "connection-kasuya-sue-wakasugi-modern-religious-conception",
    connectionKind: "comparative",
    initialStatus: "confirmed",
    eyebrow: "CONCEPTION-DRIVEN / SYNCRETISM / LABEL C",
    title: "近現代における宗教景観の再構成と諸宗教合一（宝満神宮寺・構想先行型）",
    summary:
      "1994年以降に造営された宝満神宮寺（根本山宝満堂）において、奈良大神神社の三ツ鳥居模倣、香椎宮綾杉の古木木片安置、太宰府宝満山寺院名の借用、八大龍王神池、定型的唱句・聖水作法など「全方位の霊威」を集約した構想先行型宗教空間を客観的に検証する。",
    spotIds: [
      "spot-homan-shinguji",
      "spot-taiso-jinja-gegu",
    ],
    claimIds: [
      "claim-kasuya-sue-wakasugi-006",
      "claim-kasuya-sue-wakasugi-007",
      "claim-kasuya-sue-wakasugi-008",
      "claim-kasuya-sue-wakasugi-014",
    ],
    concepts: [
      "宝満神宮寺",
      "根本山宝満堂",
      "構想先行型景観",
      "後世再構成（ラベルC）",
      "三ツ鳥居模倣",
      "香椎綾杉木片",
      "八大龍王",
      "全方位シンクレティズム",
    ],
    facets: [
      { id: "ritual", label: "定型作法・聖水祈願", weight: 5 },
      { id: "politics", label: "単立宗教法人・平成造営", weight: 4 },
      { id: "myth", label: "諸地域シンボル集約", weight: 4 },
    ],
    lensId: "religion",
    topicId: "religion-syncretism",
    eras: [
      {
        id: "era-homan-shinguji-modern-conception",
        label: "平成期における構想先行型宗教景観の造営と演出",
        range: "平成元年（1989年開教）〜平成6年（1994年造営）〜現代",
        mapLabel: "宝満神宮寺平成造営と諸宗教合一景観",
        mapLayer: "modern",
        spotIds: [
          "spot-homan-shinguji",
          "spot-taiso-jinja-gegu",
        ],
        claimIds: [
          "claim-kasuya-sue-wakasugi-006",
          "claim-kasuya-sue-wakasugi-007",
          "claim-kasuya-sue-wakasugi-008",
        ],
      },
    ],
  },
  {
    id: "connection-kasuya-sue-wakasugi-craft-technology-material-history",
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "POTTERY / EVERYDAY CULTURE / RETRO GAMING",
    title: "古代須恵器から江戸須恵焼、生活文化の日用品史料化（技術史・生活史）",
    summary:
      "須恵町立歴史民俗資料館の展示から、古代須恵器と江戸須恵焼の技術史的峻別を明確にし、さらにファミコン等近代日用品の展示を通じて「何が歴史資料として扱われるか」という生活文化史の相対化と時代感覚の変遷を捉える。",
    spotIds: [
      "spot-sue-history-museum",
      "spot-kasuya-history-museum",
    ],
    claimIds: [
      "claim-kasuya-sue-wakasugi-004",
      "claim-kasuya-sue-wakasugi-005",
    ],
    concepts: [
      "須恵焼（江戸時代以降）",
      "古代須恵器との峻別",
      "技術史",
      "ファミコン展示",
      "日用品の史料化",
      "生活文化史",
    ],
    facets: [
      { id: "exchange", label: "窯業技術・須恵焼", weight: 5 },
      { id: "spatial", label: "生活日用品・展示史料化", weight: 4 },
    ],
    lensId: "route",
    topicId: "route-logistics",
    eras: [
      {
        id: "era-sue-craft-and-folklife",
        label: "江戸須恵焼の窯業と近現代日用品の資料化",
        range: "江戸時代〜昭和・平成期",
        mapLabel: "須恵町歴史民俗資料館と窯業・生活史",
        mapLayer: "domain",
        spotIds: [
          "spot-sue-history-museum",
          "spot-kasuya-history-museum",
        ],
        claimIds: [
          "claim-kasuya-sue-wakasugi-004",
          "claim-kasuya-sue-wakasugi-005",
        ],
      },
    ],
  },
];

const newJourney = {
  id: "journey-kasuya-sue-wakasugi",
  label: "粕屋・須恵・若杉山麓",
  documentIds: [documentId],
  spotIds: spots.map((s) => s.id),
  connectionIds: connections.map((c) => c.id),
};

function upsertDataset(targetAtlas, targetDocs, targetClaims) {
  if (targetDocs) {
    const dIdx = targetDocs.findIndex((d) => d.id === documentId);
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
    const jIdx = targetAtlas.journeys.findIndex((j) => j.id === newJourney.id);
    if (jIdx >= 0) {
      targetAtlas.journeys[jIdx] = newJourney;
    } else {
      targetAtlas.journeys.push(newJourney);
    }
    for (const s of spots) {
      const sIdx = targetAtlas.spots.findIndex((existing) => existing.id === s.id);
      if (sIdx >= 0) {
        targetAtlas.spots[sIdx] = s;
      } else {
        targetAtlas.spots.push(s);
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
  }
}

// 1. tomono-review-draft.json
if (fs.existsSync(draftPath)) {
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  upsertDataset(null, draft.documents, draft.claims);
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");
  console.log("Updated tomono-review-draft.json");
}

// 2. travel-atlas.yamatai.json
if (fs.existsSync(atlasPath)) {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  upsertDataset(atlas, null, null);
  fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), "utf8");
  console.log("Updated travel-atlas.yamatai.json");
}

// 3. published-review-dataset.json
if (fs.existsSync(publishedPath)) {
  const pub = JSON.parse(fs.readFileSync(publishedPath, "utf8"));
  upsertDataset(pub.atlas, pub.documents, pub.claims);
  fs.writeFileSync(publishedPath, JSON.stringify(pub, null, 2), "utf8");
  console.log(
    `Updated published-review-dataset.json (spots: ${pub.atlas.spots.length}, claims: ${pub.claims.length}, journeys: ${pub.atlas.journeys.length})`,
  );
}
