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
