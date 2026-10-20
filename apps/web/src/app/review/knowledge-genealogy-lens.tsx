"use client";

import {
  ContextualPerspectiveLens,
  type ContextualPerspectiveLensProps,
} from "./contextual-perspective-lens";

export function KnowledgeGenealogyLens(
  props: Omit<ContextualPerspectiveLensProps, "perspectiveId">,
) {
  return <ContextualPerspectiveLens perspectiveId="mythology" {...props} />;
}
