import { describe, expect, it } from "vitest";
import {
  SANKAKUBUCHI_MIRRORS_OVERLAY,
  YAYOI_BRONZE_OVERLAY,
  AVAILABLE_ARTIFACT_OVERLAYS,
} from "./artifact-data";
import {
  calculateBubbleRadius,
  projectArtifactOverlay,
} from "./artifact-projection";

describe("Archaeological Material Overlays (出土遺物・物質文化オーバーレイ)", () => {
  it("verifies integrity and unique IDs across all archaeological sites", () => {
    const allSiteIds = new Set<string>();

    for (const overlay of AVAILABLE_ARTIFACT_OVERLAYS) {
      expect(overlay.sites.length).toBeGreaterThan(0);

      for (const site of overlay.sites) {
        expect(allSiteIds.has(site.id)).toBe(false);
        allSiteIds.add(site.id);

        // Coordinates must be valid geographic coordinates in Japan
        expect(site.coordinates.latitude).toBeGreaterThan(31.0);
        expect(site.coordinates.latitude).toBeLessThan(38.0);
        expect(site.coordinates.longitude).toBeGreaterThan(129.0);
        expect(site.coordinates.longitude).toBeLessThan(140.0);

        // Counts and presentation properties
        expect(site.totalCount).toBeGreaterThan(0);
        expect(site.bubbleRadiusScale).toBeGreaterThanOrEqual(1);
        expect(site.bubbleRadiusScale).toBeLessThanOrEqual(5);
        expect(site.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(site.sources.length).toBeGreaterThan(0);
      }
    }
  });

  describe("Sankakubuchi Shinjukyo Mirrors Overlay", () => {
    it("contains major kofun sites with accurate mirror counts", () => {
      const sites = SANKAKUBUCHI_MIRRORS_OVERLAY.sites;

      // Kurozuka: 33 Sankakubuchi + 1 Gamon-tai = 34
      const kurozuka = sites.find((s) => s.id === "site-kurozuka");
      expect(kurozuka).toBeDefined();
      expect(kurozuka?.totalCount).toBe(34);
      expect(kurozuka?.countDetails.find((d) => d.category === "mirror-sankakubuchi")?.count).toBe(33);

      // Tsubai Otsukayama: 33+ Sankakubuchi, 36 total
      const tsubai = sites.find((s) => s.id === "site-tsubai-otsukayama");
      expect(tsubai).toBeDefined();
      expect(tsubai?.totalCount).toBe(36);
      expect(tsubai?.sameMoldGroupCount).toBe(30);

      // Bizen Kurumazuka: 11 Sankakubuchi (Kibi)
      const bizen = sites.find((s) => s.id === "site-bizen-kurumazuka");
      expect(bizen).toBeDefined();
      expect(bizen?.prefecture).toBe("岡山県");
      expect(bizen?.countDetails.find((d) => d.category === "mirror-sankakubuchi")?.count).toBe(11);

      // Ishizukayama: Kyushu representative (Kanda, Fukuoka)
      const ishizukayama = sites.find((s) => s.id === "site-ishizukayama");
      expect(ishizukayama).toBeDefined();
      expect(ishizukayama?.prefecture).toBe("福岡県");
      expect(ishizukayama?.totalCount).toBe(7);

      // Hirabaru comparison: Yayoi final queen tomb (40 mirrors, Itoshima)
      const hirabaru = sites.find((s) => s.id === "site-hirabaru");
      expect(hirabaru).toBeDefined();
      expect(hirabaru?.totalCount).toBe(40);
      expect(hirabaru?.designation).toContain("国宝");
    });
  });

  describe("Yayoi Bronze Weapons and Bells Overlay", () => {
    it("contains Kojindani, Kamo-Iwakura, Oiwayama, and Sakuragaoka", () => {
      const sites = YAYOI_BRONZE_OVERLAY.sites;

      // Kojindani: 358 swords, 16 spears, 6 bells
      const kojindani = sites.find((s) => s.id === "site-kojindani");
      expect(kojindani).toBeDefined();
      expect(kojindani?.countDetails.find((d) => d.category === "bronze-sword")?.count).toBe(358);
      expect(kojindani?.countDetails.find((d) => d.category === "bronze-spear")?.count).toBe(16);
      expect(kojindani?.countDetails.find((d) => d.category === "bronze-bell")?.count).toBe(6);

      // Kamo-Iwakura: 39 bells (National maximum)
      const iwakura = sites.find((s) => s.id === "site-kamoiwakura");
      expect(iwakura).toBeDefined();
      expect(iwakura?.countDetails.find((d) => d.category === "bronze-bell")?.count).toBe(39);

      // Oiwayama: 24 bells including 134cm giant bell (Shiga)
      const oiwayama = sites.find((s) => s.id === "site-oiwayama");
      expect(oiwayama).toBeDefined();
      expect(oiwayama?.totalCount).toBe(24);

      // Sakuragaoka: 14 bells + 7 halberds (Kobe)
      const sakuragaoka = sites.find((s) => s.id === "site-sakuragaoka");
      expect(sakuragaoka).toBeDefined();
      expect(sakuragaoka?.countDetails.find((d) => d.category === "bronze-bell")?.count).toBe(14);
      expect(sakuragaoka?.countDetails.find((d) => d.category === "bronze-halberd")?.count).toBe(7);

      // Yoshinogari: Northern Kyushu weapon center
      const yoshinogari = sites.find((s) => s.id === "site-yoshinogari");
      expect(yoshinogari).toBeDefined();
      expect(yoshinogari?.prefecture).toBe("佐賀県");
    });
  });

  describe("Artifact Projection & Bubble Calculation", () => {
    it("calculates proportional bubble radii correctly", () => {
      expect(calculateBubbleRadius(5, 380)).toBe(38); // Kojindani
      expect(calculateBubbleRadius(5, 34)).toBe(32); // Kurozuka
      expect(calculateBubbleRadius(4, 13)).toBe(26); // Bizen Kurumazuka
      expect(calculateBubbleRadius(3, 7)).toBe(21); // Ishizukayama
      expect(calculateBubbleRadius(1, 1)).toBe(13); // Haraguchi
    });

    it("projects active overlay into scene with selection state", () => {
      const scene = projectArtifactOverlay("sankakubuchi-mirrors", "site-kurozuka");
      expect(scene.definition).toBeDefined();
      expect(scene.markers.length).toBe(14);

      const kurozukaMarker = scene.markers.find((m) => m.siteId === "site-kurozuka");
      expect(kurozukaMarker).toBeDefined();
      expect(kurozukaMarker?.isSelected).toBe(true);
      expect(kurozukaMarker?.badgeText).toBe("34面");
      expect(kurozukaMarker?.pixelRadius).toBe(32);

      expect(scene.selectedSite?.name).toBe("黒塚古墳");
      expect(scene.legend.length).toBe(3);
    });

    it("returns empty scene when overlayId is none", () => {
      const scene = projectArtifactOverlay("none");
      expect(scene.definition).toBeNull();
      expect(scene.markers).toEqual([]);
      expect(scene.selectedSite).toBeNull();
    });
  });
});
