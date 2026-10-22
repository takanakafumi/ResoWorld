import { describe, expect, it } from "vitest";
import { registeredLensTopics } from "../../lens-packs/knowledge-registry";
import { projectLensPreset } from "../../lens-packs/projection";
import { calculateSequenceCorridorLayout } from "./sequence-corridor-layout";

describe("Sequence Corridor Layout Engine Invariants", () => {
  it("audits all 8 Sequence topics for ordered milestone progression and non-colliding layout", () => {
    const sequenceTopics = registeredLensTopics.filter((t) => t.archetype === "sequence");
    expect(sequenceTopics.length).toBe(8);

    for (const topic of sequenceTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      const conn = preset?.mapConnections?.[0];

      let waypoints = (conn?.placeEntityIds ?? []).map((id) => {
        const node = projection.nodes.find((n) => n.id === id);
        return {
          id,
          label: node?.label ?? id,
          kind: node?.kind ?? "place",
        };
      });

      if (waypoints.length === 0) {
        waypoints = projection.nodes.filter((n) => n.kind === "place").map((n) => ({
          id: n.id,
          label: n.label,
          kind: n.kind,
        }));
      }

      const waypointIdSet = new Set(waypoints.map((w) => w.id));
      const contextNodes = projection.nodes
        .filter((n) => !waypointIdSet.has(n.id))
        .map((n) => ({
          id: n.id,
          label: n.label,
          kind: n.kind,
        }));

      const layout = calculateSequenceCorridorLayout(waypoints, contextNodes, projection.edges);

      expect(layout.canvasWidth, `${topic.id} canvasWidth`).toBeGreaterThanOrEqual(800);
      expect(layout.canvasHeight, `${topic.id} canvasHeight`).toBeGreaterThanOrEqual(350);

      // Verify all waypoints positioned
      expect(waypoints.length, `${topic.id} waypoints`).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i]!;
        const pos = layout.nodePositions.get(wp.id);
        expect(pos, `Waypoint ${wp.id} in ${topic.id} must be positioned`).toBeDefined();
        expect(pos!.stepIndex).toBe(i + 1);
        if (i === 0) expect(pos!.isOrigin).toBe(true);
        if (i === waypoints.length - 1) expect(pos!.isDestination).toBe(true);
      }

      // Verify step edges count = waypoints.length - 1
      expect(layout.stepEdges.length).toBe(waypoints.length - 1);

      // Verify every positioned node is within canvas bounds
      for (const [id, pos] of layout.nodePositions.entries()) {
        expect(pos.x, `x for ${id} in ${topic.id}`).toBeGreaterThan(0);
        expect(pos.x, `x for ${id} in ${topic.id}`).toBeLessThan(layout.canvasWidth);
        expect(pos.y, `y for ${id} in ${topic.id}`).toBeGreaterThan(0);
        expect(pos.y, `y for ${id} in ${topic.id}`).toBeLessThan(layout.canvasHeight);
      }
    }
  });

  it("verifies Jingu Kogo progression has origin at Kashii and destination at Onamuchi", () => {
    const topic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset")!;
    const projection = projectLensPreset(topic.pack, topic.presetId);
    const preset = topic.pack.presets.find((p) => p.id === topic.presetId)!;
    const conn = preset.mapConnections[0]!;

    const waypoints = conn.placeEntityIds.map((id) => {
      const node = projection.nodes.find((n) => n.id === id);
      return { id, label: node?.label ?? id, kind: node?.kind ?? "place" };
    });

    const layout = calculateSequenceCorridorLayout(waypoints, [], projection.edges);

    const kashii = layout.nodePositions.get("kashii-gu");
    const lastId = conn.placeEntityIds[conn.placeEntityIds.length - 1]!;
    const destination = layout.nodePositions.get(lastId);

    expect(kashii?.isOrigin).toBe(true);
    expect(kashii?.stepIndex).toBe(1);
    expect(destination?.isDestination).toBe(true);
    expect(destination?.stepIndex).toBe(conn.placeEntityIds.length);
  });
});
