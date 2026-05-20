/**
 * @remnic/core — Review Inbox
 *
 * Manages low-confidence memories and suggestions pending review.
 * Integrates with the existing review-queue system.
 */

import fs from "node:fs";
import path from "node:path";
import { getCategoryDir, ALL_CATEGORY_DIRS } from "../utils/category-dir.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReviewItem {
  /** Memory ID */
  id: string;
  /** Content text */
  content: string;
  /** Category */
  category: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Confidence tier */
  confidenceTier: string;
  /** Source */
  source: string;
  /** File path if available */
  filePath?: string;
  /** Created date */
  created: string;
  /** Reason it's in review */
  reviewReason: "low_confidence" | "suggestion" | "contradiction" | "duplicate";
  /** Additional context */
  context?: string;
}

export type ReviewAction = "approve" | "dismiss" | "flag";

export interface ReviewResult {
  /** Item acted upon */
  itemId: string;
  /** Action taken */
  action: ReviewAction;
  /** Updated file path (if modified) */
  updatedPath?: string;
  /** Status message */
  message: string;
}

export interface ReviewListResult {
  /** Items pending review */
  items: ReviewItem[];
  /** Total count */
  total: number;
  /** Duration in ms */
  durationMs: number;
}

export interface ReviewOptions {
  /** Memory root directory */
  memoryDir: string;
  /** Filter by reason */
  reason?: ReviewItem["reviewReason"];
  /** Max items to return (default: 50) */
  limit?: number;
  /** Include items with confidence below this threshold (default: 0.7) */
  confidenceThreshold?: number;
}

export interface ReviewActionOptions {
  /** Match the threshold used when listing review items (default: 0.7) */
  confidenceThreshold?: number;
}

interface ReviewFileMatch {
  filePath: string;
  location: "queue" | "category";
}

const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

// ── Main functions ───────────────────────────────────────────────────────────

/**
 * List items pending review.
 */
export function listReviewItems(options: ReviewOptions): ReviewListResult {
  const startTime = Date.now();
  const {
    memoryDir,
    reason: filterReason,
    limit = 50,
    confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  } = options;

  const items: ReviewItem[] = [];
  const addItem = (item: ReviewItem): void => {
    if (items.length >= limit) return;
    if (filterReason && item.reviewReason !== filterReason) return;
    items.push(item);
  };

  // Check suggestions directory
  const suggestionsDir = path.join(memoryDir, "suggestions");
  if (fs.existsSync(suggestionsDir)) {
    walkMd(suggestionsDir, (filePath, content) => {
      if (items.length >= limit) return;

      const fm = parseFrontmatter(content);
      const body = extractBody(content);
      if (!fm?.id) return;

      addItem({
        id: fm.id as string,
        content: body,
        category: (fm.category as string) ?? "suggestion",
        confidence: parseConfidence(fm.confidence, 0.5),
        confidenceTier: (fm.confidenceTier as string) ?? "low",
        source: (fm.source as string) ?? "unknown",
        filePath,
        created: (fm.created as string) ?? new Date().toISOString(),
        reviewReason: "suggestion",
      });
    });
  }

  // Check review directory
  const reviewDir = path.join(memoryDir, "review");
  if (fs.existsSync(reviewDir)) {
    walkMd(reviewDir, (filePath, content) => {
      if (items.length >= limit) return;

      const fm = parseFrontmatter(content);
      const body = extractBody(content);
      if (!fm?.id) return;

      addItem({
        id: fm.id as string,
        content: body,
        category: (fm.category as string) ?? "review",
        confidence: parseConfidence(fm.confidence, 0.5),
        confidenceTier: (fm.confidenceTier as string) ?? "low",
        source: (fm.source as string) ?? "unknown",
        filePath,
        created: (fm.created as string) ?? new Date().toISOString(),
        reviewReason: (fm.reviewReason as ReviewItem["reviewReason"]) ?? "low_confidence",
        context: fm.context as string | undefined,
      });
    });
  }

  // Scan all categories for low-confidence items
  const categories = ALL_CATEGORY_DIRS;
  for (const category of categories) {
    if (items.length >= limit) break;

    const dir = path.join(memoryDir, category);
    if (!fs.existsSync(dir)) continue;

    walkMd(dir, (filePath, content) => {
      if (items.length >= limit) return;

      const fm = parseFrontmatter(content);
      const body = extractBody(content);
      if (!fm?.id) return;

      const confidence = parseConfidence(fm.confidence, 1);
      if (confidence >= confidenceThreshold) return;
      if (parseBoolean(fm.reviewDismissed)) return;

      // Skip if already in items
      if (items.some((i) => i.id === fm.id)) return;

      addItem({
        id: fm.id as string,
        content: body,
        category: (fm.category as string) ?? category.slice(0, -1),
        confidence,
        confidenceTier: (fm.confidenceTier as string) ?? "low",
        source: (fm.source as string) ?? "unknown",
        filePath,
        created: (fm.created as string) ?? new Date().toISOString(),
        reviewReason: "low_confidence",
      });
    });
  }

  return {
    items,
    total: items.length,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Perform a review action on an item.
 */
export function performReview(
  memoryDir: string,
  itemId: string,
  action: ReviewAction,
  options: ReviewActionOptions = {},
): ReviewResult {
  switch (action) {
    case "approve":
      return approveItem(memoryDir, itemId, options);
    case "dismiss":
      return dismissItem(memoryDir, itemId, options);
    case "flag":
      return flagItem(memoryDir, itemId, options);
  }
}

// ── Actions ──────────────────────────────────────────────────────────────────

function approveItem(
  memoryDir: string,
  itemId: string,
  options: ReviewActionOptions,
): ReviewResult {
  const found = findReviewFileById(memoryDir, itemId, options);
  if (!found) {
    return { itemId, action: "approve", message: "Item not found" };
  }

  const content = fs.readFileSync(found.filePath, "utf8");
  const fm = parseFrontmatter(content);
  if (!fm) return { itemId, action: "approve", message: "Could not parse frontmatter" };

  const updatedContent = updateFrontmatterFields(content, {
    confidence: "0.9",
    confidenceTier: "high",
    reviewDismissed: null,
  });

  if (found.location === "category") {
    fs.writeFileSync(found.filePath, updatedContent, "utf8");
    return {
      itemId,
      action: "approve",
      updatedPath: found.filePath,
      message: "Approved low-confidence memory in place with confidence 0.9",
    };
  }

  // Promote queued suggestions/review items to their category directory.
  const category = (fm.category as string) ?? "fact";
  const targetDir = getCategoryDir(memoryDir, category);
  const dateDir = new Date().toISOString().split("T")[0];
  const outputPath = path.join(targetDir, dateDir, path.basename(found.filePath));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const promotedPath = writeFileWithoutClobber(outputPath, updatedContent, itemId);

  // Remove from review
  fs.unlinkSync(found.filePath);

  return {
    itemId,
    action: "approve",
    updatedPath: promotedPath,
    message: `Promoted to ${category} with confidence 0.9`,
  };
}

function dismissItem(
  memoryDir: string,
  itemId: string,
  options: ReviewActionOptions,
): ReviewResult {
  const found = findReviewFileById(memoryDir, itemId, options);
  if (!found) {
    return { itemId, action: "dismiss", message: "Item not found" };
  }

  if (found.location === "queue") {
    fs.unlinkSync(found.filePath);
    return { itemId, action: "dismiss", message: "Dismissed and removed" };
  }

  const content = fs.readFileSync(found.filePath, "utf8");
  fs.writeFileSync(
    found.filePath,
    updateFrontmatterFields(content, {
      reviewDismissed: "true",
      reviewDismissedAt: new Date().toISOString(),
    }),
    "utf8",
  );
  return {
    itemId,
    action: "dismiss",
    updatedPath: found.filePath,
    message: "Dismissed low-confidence memory in place",
  };
}

function flagItem(
  memoryDir: string,
  itemId: string,
  options: ReviewActionOptions,
): ReviewResult {
  const found = findReviewFileById(memoryDir, itemId, options);
  if (!found) {
    return { itemId, action: "flag", message: "Item not found" };
  }

  const content = fs.readFileSync(found.filePath, "utf8");
  const fixed = updateFrontmatterFields(content, {
    flagged: "true",
    flaggedAt: new Date().toISOString(),
  });
  fs.writeFileSync(found.filePath, fixed);
  return {
    itemId,
    action: "flag",
    updatedPath: found.filePath,
    message: "Flagged for further review",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function findReviewFileById(
  memoryDir: string,
  id: string,
  options: ReviewActionOptions = {},
): ReviewFileMatch | null {
  for (const loc of ["suggestions", "review"]) {
    const dir = path.join(memoryDir, loc);
    if (!fs.existsSync(dir)) continue;

    const found = findFileById(dir, id);
    if (found) return { filePath: found, location: "queue" };
  }

  for (const category of ALL_CATEGORY_DIRS) {
    const dir = path.join(memoryDir, category);
    if (!fs.existsSync(dir)) continue;

    const found = findFileById(dir, id, (fm) => isLowConfidenceReviewCandidate(fm, options));
    if (found) return { filePath: found, location: "category" };
  }

  return null;
}

function findFileById(
  dir: string,
  id: string,
  include?: (frontmatter: Record<string, unknown>) => boolean,
): string | null {
  const files = walkMdPaths(dir);
  for (const filePath of files) {
    const content = readFileSafe(filePath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (fm?.id === id && (!include || include(fm))) return filePath;
  }
  return null;
}

function isLowConfidenceReviewCandidate(
  fm: Record<string, unknown>,
  options: ReviewActionOptions,
): boolean {
  const threshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  return (
    parseConfidence(fm.confidence, 1) < threshold &&
    !parseBoolean(fm.reviewDismissed)
  );
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function parseConfidence(value: unknown, fallback: number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function updateFrontmatterFields(
  content: string,
  fields: Record<string, string | null>,
): string {
  const match = content.match(/^(---\n)([\s\S]*?)(\n---(?:\n|$))/);
  if (!match) return content;

  const seen = new Set<string>();
  const lines = match[2].split("\n");
  const nextLines: string[] = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      nextLines.push(line);
      continue;
    }
    const key = line.slice(0, colonIdx).trim();
    if (!Object.prototype.hasOwnProperty.call(fields, key)) {
      nextLines.push(line);
      continue;
    }
    seen.add(key);
    const value = fields[key];
    if (value !== null) {
      nextLines.push(`${key}: ${value}`);
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && !seen.has(key)) {
      nextLines.push(`${key}: ${value}`);
    }
  }

  return `${match[1]}${nextLines.join("\n")}${match[3]}${content.slice(match[0].length)}`;
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function writeFileWithoutClobber(basePath: string, content: string, discriminator: string): string {
  const parsed = path.parse(basePath);
  const safeDiscriminator = sanitizeFilePart(discriminator);

  for (let attempt = 0; attempt < 1000; attempt++) {
    const candidate = attempt === 0
      ? basePath
      : path.join(
        parsed.dir,
        `${parsed.name}-${safeDiscriminator}${attempt === 1 ? "" : `-${attempt}`}${parsed.ext || ".md"}`,
      );

    try {
      fs.writeFileSync(candidate, content, { encoding: "utf8", flag: "wx" });
      return candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") continue;
      throw error;
    }
  }

  throw new Error(`Could not find a free review promotion path for ${basePath}`);
}

function sanitizeFilePart(value: string): string {
  const chars: string[] = [];
  let previousWasDash = false;

  for (const char of value) {
    const next = isSafeFilePartChar(char) ? char : "-";
    if (next === "-" && previousWasDash) continue;
    chars.push(next);
    previousWasDash = next === "-";
    if (chars.length >= 64) break;
  }

  let start = 0;
  let end = chars.length;
  while (start < end && chars[start] === "-") start++;
  while (end > start && chars[end - 1] === "-") end--;

  const sanitized = chars.slice(start, end).join("");
  return sanitized || "review-item";
}

function isSafeFilePartChar(value: string): boolean {
  if (value.length !== 1) return false;
  const code = value.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    value === "." ||
    value === "_" ||
    value === "-"
  );
}

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    fm[key] = value;
  }
  return fm;
}

function extractBody(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/);
  return match ? match[1].trim() : content.trim();
}

function walkMd(dir: string, callback: (filePath: string, content: string) => void): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMd(fullPath, callback);
    } else if (entry.name.endsWith(".md")) {
      const content = readFileSafe(fullPath);
      if (content) callback(fullPath, content);
    }
  }
}

function walkMdPaths(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMdPaths(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}
