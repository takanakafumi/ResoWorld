"use client";

import {
  ContextualPerspectiveLens,
  type ContextualPerspectiveLensProps,
} from "./contextual-perspective-lens";

export function PeopleNetworkLens(
  props: Omit<ContextualPerspectiveLensProps, "perspectiveId">,
) {
  return <ContextualPerspectiveLens perspectiveId="people" {...props} />;
}
