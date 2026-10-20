"use client";

import {
  ContextualPerspectiveLens,
  type ContextualPerspectiveLensProps,
} from "./contextual-perspective-lens";

export function RouteLens(
  props: Omit<ContextualPerspectiveLensProps, "perspectiveId">,
) {
  return <ContextualPerspectiveLens perspectiveId="route" {...props} />;
}
