export * from "./artifact-overlay-types";
export * from "./overlays/provenance";
export { SANKAKUBUCHI_MIRRORS_OVERLAY } from "./overlays/sankakubuchi-mirrors";
export { YAYOI_BRONZE_OVERLAY } from "./overlays/yayoi-bronze";
export { JADE_AND_JASPER_OVERLAY } from "./overlays/jade-and-jasper";
export { CINNABAR_RED_PIGMENTS_OVERLAY } from "./overlays/cinnabar-red-pigments";
export { KOFUN_TYPOLOGY_OVERLAY } from "./overlays/kofun-typology";

import type { ArtifactOverlayDefinition, ArtifactOverlayId } from "./artifact-overlay-types";
import { CINNABAR_RED_PIGMENTS_OVERLAY } from "./overlays/cinnabar-red-pigments";
import { JADE_AND_JASPER_OVERLAY } from "./overlays/jade-and-jasper";
import { KOFUN_TYPOLOGY_OVERLAY } from "./overlays/kofun-typology";
import { SANKAKUBUCHI_MIRRORS_OVERLAY } from "./overlays/sankakubuchi-mirrors";
import { YAYOI_BRONZE_OVERLAY } from "./overlays/yayoi-bronze";

/**
 * 登録されている全出土遺物オーバーレイの静的レジストリ
 */
export const ARCHAEOLOGICAL_OVERLAYS: Record<ArtifactOverlayId, ArtifactOverlayDefinition | null> = {
  none: null,
  "sankakubuchi-mirrors": SANKAKUBUCHI_MIRRORS_OVERLAY,
  "yayoi-bronze-weapons-bells": YAYOI_BRONZE_OVERLAY,
  "jade-and-jasper": JADE_AND_JASPER_OVERLAY,
  "cinnabar-red-pigments": CINNABAR_RED_PIGMENTS_OVERLAY,
  "kofun-typology": KOFUN_TYPOLOGY_OVERLAY,
};

export const AVAILABLE_ARTIFACT_OVERLAYS: ArtifactOverlayDefinition[] = [
  SANKAKUBUCHI_MIRRORS_OVERLAY,
  YAYOI_BRONZE_OVERLAY,
  JADE_AND_JASPER_OVERLAY,
  CINNABAR_RED_PIGMENTS_OVERLAY,
  KOFUN_TYPOLOGY_OVERLAY,
];
