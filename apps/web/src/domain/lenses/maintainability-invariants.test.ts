import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

/**
 * Maintainability Ratchet Guards (Issue #56)
 *
 * 機械的・構造的にコードベースの保守性を担保するラチェット（引き下げ専用）不変条件群。
 * - ファイル肥大化（モノリス再発）の防止
 * - Clean Architecture レイヤー境界（domain -> app / React / MapLibre 逆流）の防止
 * - 新規コンポーネントの巨大 CSS (atlas.module.css) 相乗り防止
 * - コロケーション CSS と atlas.module.css の同名クラス二重残存（ゾンビCSS）防止
 *
 * ルール：
 * リファクタリングでファイルサイズや依存が減ったら、必ず下のラチェット上限を引き下げること。
 * 上限を安易に引き上げるのではなく、責務分割・コロケーション抽出で解決する。
 */

const SRC_ROOT = path.resolve(__dirname, "../..");
const DOMAIN_ROOT = path.join(SRC_ROOT, "domain");
const REVIEW_ROOT = path.join(SRC_ROOT, "app/review");

const DEFAULT_TS_MAX_LINES = 650;
const DATA_MODULE_MAX_LINES = 1650;
const DEFAULT_CSS_MAX_LINES = 550;

const DATA_MODULE_PATTERNS: readonly RegExp[] = [
  /^domain\/lens-packs\/.*-pack\.ts$/,
  /^domain\/lens-packs\/seed-packs\.ts$/,
  /^domain\/knowledge\/stratigraphy\/.*-profiles\.ts$/,
  /^domain\/archaeology\/overlays\/.*\.ts$/,
];

/**
 * 既存の大規模 TS/TSX ファイルに対するラチェット上限（現在値ベースで固定）。
 * 分割完了ごとに上限を引き下げ、DEFAULT_TS_MAX_LINES 以下になったらテーブルから削除すること。
 */
const LEGACY_TS_LINE_RATCHETS: Readonly<Record<string, number>> = {
  "domain/review/stratum-types.ts": 1200,
  "app/review/sequence-route-lens.tsx": 910,
  "app/review/atlas-workspace.tsx": 865,
  "app/review/comparison-matrix-lens.tsx": 825,
  "app/review/faction-network-lens.tsx": 735,
  "app/review/stratigraphy-profile-card.tsx": 715,
  "app/review/use-atlas-workspace.ts": 715,
  "app/review/use-lens-zoom-pan.tsx": 675,
  "app/review/genealogy-tree-lens.tsx": 675,
};

/**
 * 既存の大規模 CSS ファイルに対するラチェット上限。
 */
const LEGACY_CSS_LINE_RATCHETS: Readonly<Record<string, number>> = {
  "app/review/atlas.module.css": 7060,
  "app/review/review.module.css": 765,
};

/**
 * 既存の atlas.module.css 参照ファイル（TS/TSX）ホワイトリスト。
 * 新規コンポーネントは必ず専用のコロケーション `*.module.css` を作成し、ここに追加しないこと。
 * 移行が完了したファイルはホワイトリストから必ず削除すること（引き下げ専用ラチェット）。
 */
const ATLAS_CSS_LEGACY_CONSUMERS: readonly string[] = [
  "atlas-connection-drawer.tsx",
  "atlas-connection-layer-control.tsx",
  "atlas-lens-column.tsx",
  "atlas-lenses.tsx",
  "atlas-map-inspector.tsx",
  "atlas-map-suggestion-inspector.tsx",
  "atlas-map.tsx",
  "atlas-spot-inspector.tsx",
  "atlas-topbar.tsx",
  "atlas-workspace.tsx",
  "comparison-matrix-lens.tsx",
  "contextual-perspective-lens.tsx",
  "exploration-suggestions.tsx",
  "faction-network-lens.tsx",
  "genealogy-tree-lens.tsx",
  "hub-spoke-topology-lens.tsx",
  "lens-source-details.tsx",
  "map-artifact-overlay-layer.tsx",
  "map-connection-overlay-layer.tsx",
  "pack-relationship-lens.tsx",
  "scope-cluster-tabs.tsx",
  "sequence-route-lens.tsx",
  "stratigraphic-column-card.tsx",
  "stratigraphy-profile-card.tsx",
  "stratum-landscape-lens.tsx",
  "stratum-map-inspector.tsx",
  "stratum-pattern-panel.tsx",
  "structural-guide-context-panel.tsx",
  "surface-horizon-panel.tsx",
  "use-lens-zoom-pan.tsx",
];

function walkFiles(dir: string, predicate: (fileName: string) => boolean): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, predicate));
    } else if (entry.isFile() && predicate(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.length === 0) return 0;
  return content.split("\n").length;
}

function toRelPosix(filePath: string): string {
  return path.relative(SRC_ROOT, filePath).split(path.sep).join("/");
}

function extractCssClassNames(cssContent: string): Set<string> {
  const withoutComments = cssContent.replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = new Set<string>();
  for (const match of withoutComments.matchAll(/(?:^|[,}\s>~+])\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    classes.add(match[1]);
  }
  return classes;
}

describe("Maintainability Ratchet Guards (Structural CI Enforcement)", () => {
  it("Invariant M1a: Non-test TS/TSX files obey file-size budgets and downward ratchets", () => {
    const tsFiles = walkFiles(
      SRC_ROOT,
      (name) => (name.endsWith(".ts") || name.endsWith(".tsx")) && !name.includes(".test."),
    );

    const violations: string[] = [];
    const seenRatchetKeys = new Set<string>();

    for (const filePath of tsFiles) {
      const rel = toRelPosix(filePath);
      const lines = countLines(filePath);
      const isDataModule = DATA_MODULE_PATTERNS.some((p) => p.test(rel));

      if (rel in LEGACY_TS_LINE_RATCHETS) {
        seenRatchetKeys.add(rel);
        const cap = LEGACY_TS_LINE_RATCHETS[rel];
        if (lines > cap) {
          violations.push(`${rel}: ${lines} lines exceeds ratchet cap ${cap} (do not grow legacy monoliths)`);
        }
        if (lines <= DEFAULT_TS_MAX_LINES) {
          violations.push(
            `${rel}: ${lines} lines is now <= ${DEFAULT_TS_MAX_LINES}; remove it from LEGACY_TS_LINE_RATCHETS to lock in the win!`,
          );
        }
        continue;
      }

      const maxAllowed = isDataModule ? DATA_MODULE_MAX_LINES : DEFAULT_TS_MAX_LINES;
      if (lines > maxAllowed) {
        violations.push(
          `${rel}: ${lines} lines exceeds ${isDataModule ? "data-module" : "default TS/TSX"} budget (${maxAllowed}). Split responsibilities before merging.`,
        );
      }
    }

    for (const key of Object.keys(LEGACY_TS_LINE_RATCHETS)) {
      if (!seenRatchetKeys.has(key)) {
        violations.push(`Stale LEGACY_TS_LINE_RATCHETS entry "${key}" does not exist anymore; remove it.`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("Invariant M1b: CSS modules obey file-size budgets and downward ratchets", () => {
    const cssFiles = walkFiles(SRC_ROOT, (name) => name.endsWith(".css"));

    const violations: string[] = [];
    const seenRatchetKeys = new Set<string>();

    for (const filePath of cssFiles) {
      const rel = toRelPosix(filePath);
      const lines = countLines(filePath);

      if (rel in LEGACY_CSS_LINE_RATCHETS) {
        seenRatchetKeys.add(rel);
        const cap = LEGACY_CSS_LINE_RATCHETS[rel];
        if (lines > cap) {
          violations.push(`${rel}: ${lines} lines exceeds CSS ratchet cap ${cap}`);
        }
        if (lines <= DEFAULT_CSS_MAX_LINES) {
          violations.push(
            `${rel}: ${lines} lines is now <= ${DEFAULT_CSS_MAX_LINES}; remove it from LEGACY_CSS_LINE_RATCHETS!`,
          );
        }
        continue;
      }

      if (lines > DEFAULT_CSS_MAX_LINES) {
        violations.push(
          `${rel}: ${lines} lines exceeds colocated CSS budget (${DEFAULT_CSS_MAX_LINES}). Keep CSS modules focused.`,
        );
      }
    }

    for (const key of Object.keys(LEGACY_CSS_LINE_RATCHETS)) {
      if (!seenRatchetKeys.has(key)) {
        violations.push(`Stale LEGACY_CSS_LINE_RATCHETS entry "${key}" does not exist anymore; remove it.`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("Invariant M2: Domain layer never depends on UI frameworks, Next.js app layer, or MapLibre", () => {
    const domainFiles = walkFiles(
      DOMAIN_ROOT,
      (name) => (name.endsWith(".ts") || name.endsWith(".tsx")) && !name.includes(".test."),
    );

    const forbiddenImports: ReadonlyArray<{ label: string; regex: RegExp }> = [
      { label: "app layer (@/app/...)", regex: /\bfrom\s+["']@\/app\// },
      { label: "relative app layer (../app/...)", regex: /\bfrom\s+["'](?:\.\.\/)+app\// },
      { label: "react / react-dom", regex: /\bfrom\s+["']react(?:-dom)?(?:\/[^"']*)?["']/ },
      { label: "next/*", regex: /\bfrom\s+["']next(?:\/[^"']*)?["']/ },
      { label: "maplibre-gl", regex: /\bfrom\s+["']maplibre-gl(?:\/[^"']*)?["']/ },
      { label: '"use client" directive', regex: /^\s*["']use client["'];?/m },
    ];

    const violations: string[] = [];
    for (const filePath of domainFiles) {
      const rel = toRelPosix(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      for (const rule of forbiddenImports) {
        if (rule.regex.test(content)) {
          violations.push(`${rel} violates Clean Architecture boundary: imports/uses ${rule.label}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("Invariant M3: New review components must not import monolithic atlas.module.css (downward consumer ratchet)", () => {
    const reviewTsFiles = fs
      .readdirSync(REVIEW_ROOT)
      .filter((name) => (name.endsWith(".ts") || name.endsWith(".tsx")) && !name.includes(".test."));

    const importRegex = /from\s+["']\.\/atlas\.module\.css["']/;
    const actualConsumers = new Set<string>();
    for (const name of reviewTsFiles) {
      const content = fs.readFileSync(path.join(REVIEW_ROOT, name), "utf8");
      if (importRegex.test(content)) {
        actualConsumers.add(name);
      }
    }

    const allowlist = new Set(ATLAS_CSS_LEGACY_CONSUMERS);
    const unauthorized = [...actualConsumers].filter((name) => !allowlist.has(name)).sort();
    const staleAllowlist = ATLAS_CSS_LEGACY_CONSUMERS.filter((name) => !actualConsumers.has(name)).sort();

    expect(
      unauthorized,
      "New components must use colocated *.module.css instead of importing atlas.module.css",
    ).toEqual([]);
    expect(
      staleAllowlist,
      "Migrated components no longer importing atlas.module.css must be removed from ATLAS_CSS_LEGACY_CONSUMERS",
    ).toEqual([]);
  });

  it("Invariant M4: Colocated CSS modules have zero duplicate class names with atlas.module.css (Zero Zombie CSS)", () => {
    const atlasCss = fs.readFileSync(path.join(REVIEW_ROOT, "atlas.module.css"), "utf8");
    const atlasClasses = extractCssClassNames(atlasCss);

    const colocatedCssFiles = fs
      .readdirSync(REVIEW_ROOT)
      .filter((name) => name.endsWith(".module.css") && name !== "atlas.module.css" && name !== "review.module.css")
      .sort();

    expect(colocatedCssFiles.length).toBeGreaterThanOrEqual(12);

    const overlaps: string[] = [];
    for (const fileName of colocatedCssFiles) {
      const content = fs.readFileSync(path.join(REVIEW_ROOT, fileName), "utf8");
      const moduleClasses = extractCssClassNames(content);
      const duplicates = [...moduleClasses].filter((cls) => atlasClasses.has(cls)).sort();
      if (duplicates.length > 0) {
        overlaps.push(`${fileName} duplicates classes still present in atlas.module.css: ${duplicates.join(", ")}`);
      }
    }

    expect(overlaps).toEqual([]);
  });
});
