import { describe, expect, it } from "vitest";
import { ishinFiguresPack } from "../lens-packs/ishin-figures-pack";
import { ancientDefenseNetworkPack } from "../lens-packs/pack-loader";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import {
  calculateScopeClusterCenter,
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

    // Dazaifu core includes local fortifications
    expect(coreNodes!.has("polity-dazaifu")).toBe(true);
    expect(coreNodes!.has("place-mizuki")).toBe(true);
    expect(coreNodes!.has("place-ono-jo")).toBe(true);
    expect(coreNodes!.has("place-kii-jo")).toBe(true);

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
});
