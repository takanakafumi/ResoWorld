import { describe, expect, it } from "vitest";
import { ishinFiguresPack } from "../lens-packs/ishin-figures-pack";
import { ancientDefenseNetworkPack } from "../lens-packs/pack-loader";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import {
  calculateScopeClusterCenter,
  calculateScopeClusterFraming,
  resolveScopeClusterNodeIds,
  type Point2D,
} from "./scope-clustering";

describe("scope-clustering", () => {
  it("resolves node IDs for ishin-figures-network local core vs national macro", () => {
    const ishinTopic = registeredLensTopics.find((t) => t.id === "ishin-figures-network")!;
    expect(ishinTopic.scopeClusters).toBeDefined();

    const coreCluster = ishinTopic.scopeClusters!.find((c) => c.id === "choshu-core")!;
    const macroCluster = ishinTopic.scopeClusters!.find((c) => c.id === "satcho-alliance-macro")!;

    const coreNodes = resolveScopeClusterNodeIds(ishinFiguresPack, ishinTopic.presetId, coreCluster);
    const macroNodes = resolveScopeClusterNodeIds(ishinFiguresPack, ishinTopic.presetId, macroCluster);

    expect(coreNodes).toBeDefined();
    expect(macroNodes).toBeDefined();

    // Core cluster strictly includes Choshu figures
    expect(coreNodes!.has("yoshida-shoin")).toBe(true);
    expect(coreNodes!.has("takasugi-shinsaku")).toBe(true);
    expect(coreNodes!.has("kido-takayoshi")).toBe(true);
    expect(coreNodes!.has("choshu-domain")).toBe(true);

    // Core cluster strictly excludes Tosa and Satsuma
    expect(coreNodes!.has("sakamoto-ryoma")).toBe(false);
    expect(coreNodes!.has("saigo-takamori")).toBe(false);
    expect(coreNodes!.has("tosa-domain")).toBe(false);
    expect(coreNodes!.has("satsuma-domain")).toBe(false);

    // Macro cluster includes all alliance figures
    expect(macroNodes!.has("yoshida-shoin")).toBe(true);
    expect(macroNodes!.has("takasugi-shinsaku")).toBe(true);
    expect(macroNodes!.has("sakamoto-ryoma")).toBe(true);
    expect(macroNodes!.has("saigo-takamori")).toBe(true);
    expect(macroNodes!.has("satcho-alliance")).toBe(true);
  });

  it("resolves node IDs for dazaifu-defense-preset local core vs national defense line", () => {
    const dazaifuTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset")!;
    const coreCluster = dazaifuTopic.scopeClusters!.find((c) => c.id === "dazaifu-core")!;
    const macroCluster = dazaifuTopic.scopeClusters!.find((c) => c.id === "national-defense-line")!;

    const coreNodes = resolveScopeClusterNodeIds(ancientDefenseNetworkPack, dazaifuTopic.presetId, coreCluster);
    const macroNodes = resolveScopeClusterNodeIds(ancientDefenseNetworkPack, dazaifuTopic.presetId, macroCluster);

    expect(coreNodes).toBeDefined();
    expect(macroNodes).toBeDefined();

    // Dazaifu core includes local fortifications & urban administrative/diplomatic nodes
    expect(coreNodes!.has("polity-dazaifu")).toBe(true);
    expect(coreNodes!.has("place-mizuki")).toBe(true);
    expect(coreNodes!.has("place-ono-jo")).toBe(true);
    expect(coreNodes!.has("place-kii-jo")).toBe(true);
    expect(coreNodes!.has("place-dazaifu-kyakukan")).toBe(true);
    expect(coreNodes!.has("place-enoki-sha-minamikan")).toBe(true);

    // Dazaifu core strictly excludes remote castles
    expect(coreNodes!.has("place-kaneda-jo")).toBe(false);
    expect(coreNodes!.has("place-yashima-ji-castle")).toBe(false);

    // National defense line includes remote castles
    expect(macroNodes!.has("place-kaneda-jo")).toBe(true);
    expect(macroNodes!.has("place-yashima-ji-castle")).toBe(true);
    expect(macroNodes!.has("place-takayasu-jo")).toBe(true);
  });

  it("calculates geometric centroid center for scoped nodes", () => {
    const positions = new Map<string, Point2D>([
      ["node-a", { x: 100, y: 100 }],
      ["node-b", { x: 200, y: 100 }],
      ["node-c", { x: 900, y: 900 }], // distant node
    ]);

    const scoped = new Set(["node-a", "node-b"]);
    const center = calculateScopeClusterCenter(positions, scoped);

    expect(center).toEqual({ x: 150, y: 100 });
  });

  it("returns null when cluster is undefined or empty", () => {
    const positions = new Map<string, Point2D>([["node-a", { x: 100, y: 100 }]]);
    expect(calculateScopeClusterCenter(positions, null)).toBeNull();
    expect(calculateScopeClusterCenter(positions, new Set())).toBeNull();
  });

  it("calculates framing with dynamic zoom-in for compact core cluster and zoom-out for wide macro cluster", () => {
    const positions = new Map<string, { x: number; y: number; width: number }>([
      // Compact local cluster (width: 150, height: 100)
      ["choshu-1", { x: 150, y: 150, width: 80 }],
      ["choshu-2", { x: 220, y: 200, width: 80 }],
      // Distant nodes
      ["satsuma-1", { x: 650, y: 400, width: 80 }],
      ["tosa-1", { x: 500, y: 350, width: 80 }],
    ]);

    const coreScoped = new Set(["choshu-1", "choshu-2"]);
    const macroScoped = new Set(["choshu-1", "choshu-2", "satsuma-1", "tosa-1"]);

    const coreFraming = calculateScopeClusterFraming(positions, coreScoped, { width: 640, height: 400 });
    const macroFraming = calculateScopeClusterFraming(positions, macroScoped, { width: 640, height: 400 });

    expect(coreFraming).toBeDefined();
    expect(macroFraming).toBeDefined();

    // Core cluster zooms in (> 1.3x) and centers around Choshu
    expect(coreFraming!.targetZoom).toBeGreaterThan(1.3);
    expect(coreFraming!.centerX).toBeLessThan(300);
    expect(coreFraming!.centerY).toBeLessThan(250);

    // Macro cluster zooms out to overview (1.0x) and centers across all factions
    expect(macroFraming!.targetZoom).toBe(1.0);
    expect(macroFraming!.centerX).toBeGreaterThan(350);
  });

  it("resolves scope clusters for all horizontally deployed faction topics", () => {
    const topicIds = [
      "dazaifu-defense-preset",
      "ancient-chieftains-network",
      "genpei-dannoura-network",
      "yamatai-politics",
      "ishin-figures-network",
    ];

    for (const topicId of topicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId)!;
      expect(topic.scopeClusters).toBeDefined();
      expect(topic.scopeClusters!.length).toBeGreaterThanOrEqual(2);

      const defaultCluster = topic.scopeClusters!.find((c) => c.default);
      expect(defaultCluster).toBeDefined();

      const defaultNodes = resolveScopeClusterNodeIds(topic.pack, topic.presetId, defaultCluster!);
      expect(defaultNodes).toBeDefined();
      expect(defaultNodes!.size).toBeGreaterThan(0);

      const otherCluster = topic.scopeClusters!.find((c) => !c.default);
      expect(otherCluster).toBeDefined();

      const otherNodes = resolveScopeClusterNodeIds(topic.pack, topic.presetId, otherCluster!);
      expect(otherNodes).toBeDefined();
      expect(otherNodes!.size).toBeGreaterThanOrEqual(defaultNodes!.size);
    }
  });

  it("resolves scope clusters for sequence and matrix archetype macro topics", () => {
    const macroTopicIds = [
      "jinmu-yamato-conquest-preset",
      "marine-deities-preset",
      "jingu-kogo-legend-preset",
    ];

    for (const topicId of macroTopicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId)!;
      expect(topic, `Topic ${topicId} must exist`).toBeDefined();
      expect(topic.scopeClusters, `Topic ${topicId} must have scope clusters`).toBeDefined();
      expect(topic.scopeClusters!.length).toBeGreaterThanOrEqual(2);

      const defaultCluster = topic.scopeClusters!.find((c) => c.default);
      expect(defaultCluster).toBeDefined();

      const defaultNodes = resolveScopeClusterNodeIds(topic.pack, topic.presetId, defaultCluster!);
      expect(defaultNodes).toBeDefined();
      expect(defaultNodes!.size).toBeGreaterThan(0);

      const wideCluster = topic.scopeClusters!.find((c) => !c.default);
      expect(wideCluster).toBeDefined();

      const wideNodes = resolveScopeClusterNodeIds(topic.pack, topic.presetId, wideCluster!);
      expect(wideNodes).toBeDefined();
      expect(wideNodes!.size).toBeGreaterThanOrEqual(defaultNodes!.size);

      // Verify connectionIds accurately map to preset.mapConnections
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      expect(preset?.mapConnections).toBeDefined();
      const presetConnIds = new Set(preset!.mapConnections.map((c) => c.id));

      for (const connId of defaultCluster!.connectionIds) {
        expect(presetConnIds.has(connId), `Connection ${connId} must exist in preset`).toBe(true);
      }
      for (const connId of wideCluster!.connectionIds) {
        expect(presetConnIds.has(connId), `Connection ${connId} must exist in preset`).toBe(true);
      }
    }
  });
});
