import { describe, expect, it } from "vitest";
import { matchLensNodeForCandidate } from "./candidate-matching";

describe("matchLensNodeForCandidate", () => {
  const wajindenNodes = [
    { id: "northern-kyushu", label: "北部九州の候補地域", aliases: ["邪馬台国九州説候補地"] },
    { id: "nara-basin", label: "奈良盆地周辺" },
    { id: "toma-chikugo", label: "筑後・八女周辺" },
    { id: "toma-hyuga", label: "日向・都萬神社周辺" },
    { id: "ito-state", label: "伊都国", aliases: ["伊都"] },
    { id: "na-state", label: "奴国" },
    { id: "fumi-state", label: "不弥国" },
    { id: "koshoji-kofun", label: "光正寺古墳" },
  ];

  it("matches Yoshinogari suggestion to northern-kyushu hypothesis in Wajinden nodes", () => {
    const suggestion = {
      id: "next-yamatai-yoshinogari",
      title: "北部九州のクニの構造",
      targetName: "吉野ヶ里遺跡・吉野ヶ里歴史公園",
      actionType: "field_visit" as const,
      latitude: 33.32,
      longitude: 130.38,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };

    const matched = matchLensNodeForCandidate(wajindenNodes, suggestion);
    expect(matched?.id).toBe("northern-kyushu");
  });

  it("matches Toma Hyuga suggestion by targetName substring", () => {
    const suggestion = {
      id: "suggestion-toma-hyuga",
      title: "日向の投馬国候補",
      targetName: "日向・都萬神社周辺",
      actionType: "field_visit" as const,
      latitude: 32.11,
      longitude: 131.4,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };

    const matched = matchLensNodeForCandidate(wajindenNodes, suggestion);
    expect(matched?.id).toBe("toma-hyuga");
  });

  it("matches Koshoji kofun to koshoji-kofun", () => {
    const suggestion = {
      id: "suggestion-koshoji",
      title: "光正寺古墳",
      targetName: "光正寺古墳",
      actionType: "field_visit" as const,
      latitude: 33.57,
      longitude: 130.49,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };

    const matched = matchLensNodeForCandidate(wajindenNodes, suggestion);
    expect(matched?.id).toBe("koshoji-kofun");
  });

  it("matches Kashii-gu suggestion to kashii-gu node in Jingu/Hachiman nodes", () => {
    const nodes = [
      { id: "kashii-gu", label: "香椎宮" },
      { id: "umi-hachimangu", label: "宇美八幡宮" },
      { id: "hakozakigu", label: "筥崎宮" },
    ];
    const suggestion = {
      id: "suggestion-kashii",
      title: "香椎宮の伝承地",
      targetName: "香椎宮",
      actionType: "field_visit" as const,
      latitude: 33.66,
      longitude: 130.45,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matched = matchLensNodeForCandidate(nodes, suggestion);
    expect(matched?.id).toBe("kashii-gu");
  });

  it("matches mineral supply chain suggestions to material culture nodes", () => {
    const supplyChainNodes = [
      { id: "place-itoigawa-jade", label: "糸魚川ヒスイ原産地", aliases: ["長者ヶ原遺跡", "小滝川硬玉産地"] },
      { id: "place-wakasugiyama", label: "若杉山辰砂採掘遺跡", aliases: ["阿南若杉山"] },
      { id: "place-kasenyama-jasper", label: "出雲花仙山・玉作跡", aliases: ["花仙山"] },
      { id: "place-gaya-iron", label: "朝鮮半島・伽耶鉄産地", aliases: ["伽耶諸国"] },
      { id: "place-kurozuka", label: "黒塚古墳" },
    ];

    const itoigawaSuggestion = {
      id: "frontier:prehistoric-resource-corridor:place-itoigawa-jade",
      title: "古代列島4大鉱物資源サプライチェーン回廊",
      targetName: "糸魚川ヒスイ原産地",
      targetPlaceId: "place-itoigawa-jade",
      actionType: "field_visit" as const,
      latitude: 36.9856,
      longitude: 137.8592,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    expect(matchLensNodeForCandidate(supplyChainNodes, itoigawaSuggestion)?.id).toBe("place-itoigawa-jade");

    const wakasugiSuggestion = {
      id: "frontier:prehistoric-resource-corridor:place-wakasugiyama",
      title: "古代列島4大鉱物資源サプライチェーン回廊",
      targetName: "若杉山辰砂採掘遺跡",
      targetPlaceId: "place-wakasugiyama",
      actionType: "field_visit" as const,
      latitude: 33.8864,
      longitude: 134.5386,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    expect(matchLensNodeForCandidate(supplyChainNodes, wakasugiSuggestion)?.id).toBe("place-wakasugiyama");
  });

  it("matches Usa Jingu suggestion in Religion nodes", () => {
    const nodes = [
      { id: "usa-jingu", label: "宇佐神宮" },
      { id: "munakata-taisha", label: "宗像大社" },
    ];
    const suggestion = {
      id: "suggestion-usa",
      title: "宇佐神宮の八幡信仰",
      targetName: "宇佐神宮",
      actionType: "field_visit" as const,
      latitude: 33.52,
      longitude: 131.37,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matched = matchLensNodeForCandidate(nodes, suggestion);
    expect(matched?.id).toBe("usa-jingu");
  });

  it("matches Shoin / Shokasonjuku suggestion in Bakumatsu nodes", () => {
    const nodes = [
      { id: "yoshida-shoin", label: "吉田松陰" },
      { id: "takasugi-shinsaku", label: "高杉晋作" },
      { id: "shokasonjuku", label: "松下村塾" },
    ];
    const suggestion = {
      id: "suggestion-shoin",
      title: "松陰の講義室",
      targetName: "松下村塾",
      actionType: "field_visit" as const,
      latitude: 34.41,
      longitude: 131.41,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matched = matchLensNodeForCandidate(nodes, suggestion);
    expect(matched?.id).toBe("shokasonjuku");
  });
});
