import type { Claim } from "@/domain/knowledge/schema";

import type { ReviewStatus } from "./types";

export type EvidenceGraphNode = {
  id: string;
  label: string;
  type: string;
};

export type EvidenceGraphEdge = {
  id: string;
  claimId: string;
  sourceId: string;
  targetId: string;
  label: string;
  status: ReviewStatus;
};

export type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
};

function entityKey(type: string, name: string) {
  return `${type}:${name}`;
}

export function claimEntityKeys(claim: Claim) {
  const subject = entityKey(claim.subject.type, claim.subject.name);
  const object =
    claim.object.kind === "entity"
      ? entityKey(claim.object.entity.type, claim.object.entity.name)
      : entityKey("Literal", String(claim.object.value));
  return [subject, object] as const;
}

export function buildEvidenceGraph(input: {
  claims: Claim[];
  statuses: Record<string, ReviewStatus>;
  selectedClaimId: string | null;
  includeRejected: boolean;
  maximumEdges?: number;
}): EvidenceGraph {
  const maximumEdges = input.maximumEdges ?? 14;
  const eligible = input.claims.filter((claim) => {
    const status = input.statuses[claim.id] ?? claim.reviewStatus;
    return (
      claim.evidence.length > 0 &&
      (input.includeRejected || status !== "rejected")
    );
  });
  const selected = eligible.find(
    (claim) => claim.id === input.selectedClaimId,
  );
  const selectedKeys = selected ? new Set(claimEntityKeys(selected)) : null;
  const ordered = selectedKeys
    ? [
        selected,
        ...eligible.filter(
          (claim) =>
            claim.id !== selected?.id &&
            claimEntityKeys(claim).some((key) => selectedKeys.has(key)),
        ),
        ...eligible.filter(
          (claim) =>
            claim.id !== selected?.id &&
            !claimEntityKeys(claim).some((key) => selectedKeys.has(key)),
        ),
      ]
    : eligible;
  const visibleClaims = ordered.filter(Boolean).slice(0, maximumEdges) as Claim[];
  const nodeById = new Map<string, EvidenceGraphNode>();
  const edges = visibleClaims.map((claim) => {
    const [sourceId, targetId] = claimEntityKeys(claim);
    nodeById.set(sourceId, {
      id: sourceId,
      label: claim.subject.name,
      type: claim.subject.type,
    });
    nodeById.set(
      targetId,
      claim.object.kind === "entity"
        ? {
            id: targetId,
            label: claim.object.entity.name,
            type: claim.object.entity.type,
          }
        : {
            id: targetId,
            label: String(claim.object.value),
            type: "Literal",
          },
    );
    return {
      id: `relation-${claim.id}`,
      claimId: claim.id,
      sourceId,
      targetId,
      label: claim.predicate,
      status: input.statuses[claim.id] ?? claim.reviewStatus,
    };
  });

  return { nodes: [...nodeById.values()], edges };
}
