"use client";

import {
  ContextualPerspectiveLens,
  type ContextualPerspectiveLensProps,
} from "./contextual-perspective-lens";

export function PoliticsSocialLens(
  props: Omit<ContextualPerspectiveLensProps, "perspectiveId">,
) {
  return <ContextualPerspectiveLens perspectiveId="politics" {...props} />;
}
