import { describe, expect, it } from "vitest";
import {
  SANKAKUBUCHI_MIRRORS_OVERLAY,
  YAYOI_BRONZE_OVERLAY,
  JADE_AND_JASPER_OVERLAY,
  CINNABAR_RED_PIGMENTS_OVERLAY,
  KOFUN_TYPOLOGY_OVERLAY,
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

  describe("Jade and Jasper Overlay (翡翠・碧玉)", () => {
    it("contains raw material sources (Itoigawa, Kasensan) and recipient elite tombs", () => {
      const sites = JADE_AND_JASPER_OVERLAY.sites;

      // Itoigawa jade origin
      const itoigawa = sites.find((s) => s.id === "site-itoigawa-choujagahara");
      expect(itoigawa).toBeDefined();
      expect(itoigawa?.prefecture).toBe("新潟県");

      // Kasensan / Tamatsukuri jasper origin
      const kasensan = sites.find((s) => s.id === "site-kasensan-tamatsukuri");
      expect(kasensan).toBeDefined();
      expect(kasensan?.prefecture).toBe("島根県");

      // Shinyama: Jasper wrist ornaments (wheel-stones, hoe-shaped stones)
      const shinyama = sites.find((s) => s.id === "site-shinyama-jasper");
      expect(shinyama).toBeDefined();
      expect(shinyama?.countDetails.find((d) => d.category === "jasper-ornament")?.count).toBeGreaterThanOrEqual(60);

      // Yoshinogari Jade magatama
      const yoshinogariJade = sites.find((s) => s.id === "site-yoshinogari-jade");
      expect(yoshinogariJade).toBeDefined();
      expect(yoshinogariJade?.countDetails.find((d) => d.category === "jade-magatama")).toBeDefined();
    });
  });

  describe("Cinnabar and Red Pigments Overlay (赤の塗料)", () => {
    it("contains Wakasugiyama cinnabar quarry and vermilion tombs", () => {
      const sites = CINNABAR_RED_PIGMENTS_OVERLAY.sites;

      // Wakasugiyama: only Yayoi cinnabar mining site in Japan
      const wakasugi = sites.find((s) => s.id === "site-wakasugiyama");
      expect(wakasugi).toBeDefined();
      expect(wakasugi?.prefecture).toBe("徳島県");
      expect(wakasugi?.designation).toBe("国史跡");

      // Niutsuhime / Amano: sacred mercury shrine
      const niutsuhime = sites.find((s) => s.id === "site-niutsuhime");
      expect(niutsuhime).toBeDefined();
      expect(niutsuhime?.prefecture).toBe("和歌山県");

      // Hirabaru & Kurozuka vermilion
      const hirabaruRed = sites.find((s) => s.id === "site-hirabaru-vermilion");
      expect(hirabaruRed).toBeDefined();

      const kurozukaRed = sites.find((s) => s.id === "site-kurozuka-vermilion");
      expect(kurozukaRed).toBeDefined();

      // Fukiya Bengala
      const fukiya = sites.find((s) => s.id === "site-fukiya-bengala");
      expect(fukiya).toBeDefined();
      expect(fukiya?.prefecture).toBe("岡山県");
    });
  });

  describe("Kofun Typology Overlay (古墳の類型)", () => {
    it("contains key prototypes: Keyhole (Hashihaka), Four-cornered (Nishidani), Both-side (Tatetsuki)", () => {
      const sites = KOFUN_TYPOLOGY_OVERLAY.sites;

      // Hashihaka: Keyhole prototype
      const hashihaka = sites.find((s) => s.id === "site-hashihaka-kofun");
      expect(hashihaka).toBeDefined();
      expect(hashihaka?.totalCount).toBe(280);

      // Nishidani 3: Four-cornered prototye
      const nishidani = sites.find((s) => s.id === "site-nishidani-3");
      expect(nishidani).toBeDefined();
      expect(nishidani?.prefecture).toBe("島根県");

      // Tatetsuki: Both-side round tomb (Kibi)
      const tatetsuki = sites.find((s) => s.id === "site-tatetsuki");
      expect(tatetsuki).toBeDefined();
      expect(tatetsuki?.prefecture).toBe("岡山県");

      // Daisenryo: Largest Keyhole
      const daisen = sites.find((s) => s.id === "site-daisenryo");
      expect(daisen).toBeDefined();
      expect(daisen?.totalCount).toBe(486);

      // Iwatoyama: Iwai's tomb in Kyushu
      const iwatoyama = sites.find((s) => s.id === "site-iwatoyama");
      expect(iwatoyama).toBeDefined();
      expect(iwatoyama?.prefecture).toBe("福岡県");

      // Miyajidake: Gigantic horizontal stone chamber (23m) in Northern Kyushu
      const miyajidake = sites.find((s) => s.id === "site-miyajidake-kofun");
      expect(miyajidake).toBeDefined();
      expect(miyajidake?.burialStructure).toBe("horizontal-chamber");
      expect(miyajidake?.burialStructureLabel).toContain("横穴式石室");

      // Shimauchi: Southern Kyushu underground horizontal tomb (without mound)
      const shimauchi = sites.find((s) => s.id === "site-shimauchi-underground");
      expect(shimauchi).toBeDefined();
      expect(shimauchi?.burialStructure).toBe("underground-horizontal");
      expect(shimauchi?.prefecture).toBe("宮崎県");

      // Hashihaka: Early Yamato vertical pit structure
      expect(hashihaka?.burialStructure).toBe("vertical-pit");
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

  describe("Map Stacking Context & Translucent Bubble Invariants", () => {
    it("ensures artifact overlay renders in front of shrine spots with translucent bubbles", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const cssPath = path.resolve(__dirname, "../../app/review/atlas.module.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");

      // 1. Z-Index Token Hierarchy Invariant:
      // Artifact overlay (18) must be in front of normal spots (9) and active spots (16), but behind controls (25)
      const artifactZMatch = cssContent.match(/--map-z-artifact-overlay:\s*(\d+);/);
      const spotZMatch = cssContent.match(/--map-z-markers-spot:\s*(\d+);/);
      const spotActiveZMatch = cssContent.match(/--map-z-markers-spot-active:\s*(\d+);/);
      const controlsZMatch = cssContent.match(/--map-z-controls:\s*(\d+);/);

      expect(artifactZMatch).toBeTruthy();
      expect(spotZMatch).toBeTruthy();
      expect(spotActiveZMatch).toBeTruthy();
      expect(controlsZMatch).toBeTruthy();

      const artifactZ = Number.parseInt(artifactZMatch![1], 10);
      const spotZ = Number.parseInt(spotZMatch![1], 10);
      const spotActiveZ = Number.parseInt(spotActiveZMatch![1], 10);
      const controlsZ = Number.parseInt(controlsZMatch![1], 10);

      expect(artifactZ).toBeGreaterThan(spotZ);
      expect(artifactZ).toBeGreaterThan(spotActiveZ);
      expect(artifactZ).toBeLessThan(controlsZ);

      // 2. SVG overlay z-index uses the token
      expect(cssContent).toMatch(/\.mapArtifactOverlaySvg\s*\{[\s\S]*?z-index:\s*var\(--map-z-artifact-overlay,\s*18\);/);

      // 3. Artifact bubble translucency invariant:
      // Bubble must have fill-opacity between 0.5 and 0.8 to ensure underlying shrines remain visible
      const bubbleMatch = cssContent.match(/\.artifactBubble\s*\{[\s\S]*?fill-opacity:\s*([0-9.]+);/);
      expect(bubbleMatch).toBeTruthy();
      const fillOpacity = Number.parseFloat(bubbleMatch![1]);
      expect(fillOpacity).toBeGreaterThanOrEqual(0.5);
      expect(fillOpacity).toBeLessThanOrEqual(0.8);
    });
  });

  describe("Material Provenance & Supply Chain Invariants (産地・工房・流通経路不変条件)", () => {
    it("guarantees 100% of sites across all overlays declare valid material provenance (Zero-Stragglers)", () => {
      let siteCount = 0;
      for (const overlay of AVAILABLE_ARTIFACT_OVERLAYS) {
        expect(overlay.sites.length).toBeGreaterThan(0);
        for (const site of overlay.sites) {
          siteCount++;
          expect(site.provenance).toBeDefined();
          expect(site.provenance?.type).toBeDefined();
          expect(site.provenance?.typeLabel).toBeTruthy();
          expect(site.provenance?.sourceRegion).toBeTruthy();
        }
      }
      // Ensure all 56 sites have provenance defined
      expect(siteCount).toBe(56);
    });

    it("projects provenance metadata into marker projection for tooltips and cards", () => {
      // Jade source projection
      const jadeScene = projectArtifactOverlay("jade-and-jasper", "site-itoigawa-choujagahara");
      const itoigawaMarker = jadeScene.markers.find((m) => m.siteId === "site-itoigawa-choujagahara");
      expect(itoigawaMarker?.provenanceRegion).toContain("糸魚川");
      expect(itoigawaMarker?.provenanceTypeLabel).toContain("原産地");
      expect(itoigawaMarker?.shapeType).toBe("diamond");
      expect(itoigawaMarker?.originKindLabel).toBe("原産地・採掘坑");

      // Jade recipient projection (Hirabaru)
      const hirabaruMarker = jadeScene.markers.find((m) => m.siteId === "site-hirabaru-jade");
      expect(hirabaruMarker?.shapeType).toBe("circle");
      expect(hirabaruMarker?.originKindLabel).toBe("出土遺跡・古墳");

      // Cinnabar recipient projection
      const cinnabarScene = projectArtifactOverlay("cinnabar-red-pigments", "site-kurozuka-vermilion");
      const kurozukaMarker = cinnabarScene.markers.find((m) => m.siteId === "site-kurozuka-vermilion");
      expect(kurozukaMarker?.provenanceRegion).toContain("若杉山");
      expect(kurozukaMarker?.provenanceTypeLabel).toContain("超遠隔");
      expect(kurozukaMarker?.shapeType).toBe("circle");

      // Cinnabar source projection (Wakasugiyama)
      const wakasugiMarker = cinnabarScene.markers.find((m) => m.siteId === "site-wakasugiyama");
      expect(wakasugiMarker?.shapeType).toBe("diamond");
      expect(wakasugiMarker?.originKindLabel).toBe("原産地・採掘坑");

      // Sankakubuchi academic dispute projection
      const mirrorScene = projectArtifactOverlay("sankakubuchi-mirrors", "site-kurozuka");
      const mirrorMarker = mirrorScene.markers.find((m) => m.siteId === "site-kurozuka");
      expect(mirrorMarker?.provenanceRegion).toContain("曹魏");
      expect(mirrorMarker?.provenanceTypeLabel).toContain("製作地論争");

      // Yayoi bronze casting workshop projection
      const bronzeScene = projectArtifactOverlay("yayoi-bronze-weapons-bells", "site-sugu-bronze-workshop");
      const suguMarker = bronzeScene.markers.find((m) => m.siteId === "site-sugu-bronze-workshop");
      expect(suguMarker?.provenanceRegion).toContain("北部九州");
      expect(suguMarker?.provenanceTypeLabel).toContain("自前製作");
      expect(suguMarker?.shapeType).toBe("hexagon");
      expect(suguMarker?.originKindLabel).toBe("製作工房・鋳造地");

      // Kofun typology prototype projection
      const kofunScene = projectArtifactOverlay("kofun-typology", "site-hashihaka-kofun");
      const hashihakaMarker = kofunScene.markers.find((m) => m.siteId === "site-hashihaka-kofun");
      expect(hashihakaMarker?.provenanceRegion).toContain("大和盆地");
      expect(hashihakaMarker?.provenanceTypeLabel).toContain("前方後円墳体系");
    });

    it("projects focused origin marker and supply chain trajectory when a recipient site is selected", () => {
      // Hirabaru Jade recipient -> Itoigawa origin
      const jadeScene = projectArtifactOverlay("jade-and-jasper", "site-hirabaru-jade");
      expect(jadeScene.focusedSelectedMarker?.siteId).toBe("site-hirabaru-jade");
      expect(jadeScene.focusedOriginMarker?.siteId).toBe("site-itoigawa-choujagahara");
      expect(jadeScene.focusedOriginMarker?.isFocusedOrigin).toBe(true);

      const itoigawa = jadeScene.markers.find((m) => m.siteId === "site-itoigawa-choujagahara");
      expect(itoigawa?.isFocusedOrigin).toBe(true);
      expect(itoigawa?.isOriginSite).toBe(true);

      expect(jadeScene.originTrajectory).toBeDefined();
      expect(jadeScene.originTrajectory?.from.name).toContain("糸魚川");
      expect(jadeScene.originTrajectory?.to.name).toContain("平原");

      // Kurozuka Vermilion recipient -> Wakasugiyama origin
      const cinnabarScene = projectArtifactOverlay("cinnabar-red-pigments", "site-kurozuka-vermilion");
      expect(cinnabarScene.focusedSelectedMarker?.siteId).toBe("site-kurozuka-vermilion");
      expect(cinnabarScene.focusedOriginMarker?.siteId).toBe("site-wakasugiyama");
      expect(cinnabarScene.focusedOriginMarker?.isFocusedOrigin).toBe(true);
      expect(cinnabarScene.originTrajectory?.from.name).toContain("若杉山");
      expect(cinnabarScene.originTrajectory?.to.name).toContain("黒塚");
    });

    it("ensures CSS styles exist for provenance card UI", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const cssPath = path.resolve(__dirname, "../../app/review/atlas.module.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");

      expect(cssContent).toContain(".mapArtifactProvenanceCard");
      expect(cssContent).toContain(".mapArtifactProvenanceBadge");
      expect(cssContent).toContain(".mapArtifactProvenanceMaterial");
      expect(cssContent).toContain(".mapArtifactProvenanceRow");
      expect(cssContent).toContain(".mapArtifactProvenanceLabel");
      expect(cssContent).toContain(".mapArtifactProvenanceValue");
      expect(cssContent).toContain(".mapOriginBadge");
      expect(cssContent).toContain(".mapProvenanceOriginMarker");
      expect(cssContent).toContain(".mapFocusedOriginMarker");
      expect(cssContent).toContain(".artifactFocusedOriginPulseRing");
      expect(cssContent).toContain(".artifactSupplyChainTrajectoryLine");
    });
  });
});
