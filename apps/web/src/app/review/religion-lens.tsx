"use client";

import {
  ContextualPerspectiveLens,
  type ContextualPerspectiveLensProps,
} from "./contextual-perspective-lens";

export function ReligionLens(
  props: Omit<ContextualPerspectiveLensProps, "perspectiveId">,
) {
  return <ContextualPerspectiveLens perspectiveId="religion" {...props} />;
}
