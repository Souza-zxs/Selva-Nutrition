export type DescriptionSection = {
  title: string | null;
  paragraphs: string[];
};

// Covers the emoji ranges admins tend to paste into product copy (fire,
// herb, package, warning sign, etc.) so they can be stripped from headings.
const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

/**
 * Admins write product descriptions as a wall of text with ad-hoc
 * "headings" — a short, fully-uppercase line (often emoji-flagged) that
 * introduces the paragraphs below it, e.g. "🌿 PADRÃO SELVA NUTRITION DE
 * QUALIDADE:". This heuristic treats any short line with no lowercase
 * letters as one of those headings and groups everything else under the
 * nearest heading above it, so the same free-text field can render as
 * organized sections instead of one long paragraph.
 */
function isHeaderLine(line: string): boolean {
  const stripped = line.replace(EMOJI_REGEX, "").trim();
  if (!stripped || stripped.length > 100) return false;
  const letters = stripped.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function toSentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function cleanTitle(line: string): string {
  const noEmoji = line.replace(EMOJI_REGEX, "").trim();
  const noColon = noEmoji.replace(/:\s*$/, "");
  return toSentenceCase(noColon);
}

export function parseDescription(
  text: string | null | undefined,
): DescriptionSection[] {
  if (!text) return [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: DescriptionSection[] = [];
  let current: DescriptionSection | null = null;

  for (const line of lines) {
    if (isHeaderLine(line)) {
      current = { title: cleanTitle(line), paragraphs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: null, paragraphs: [] };
      sections.push(current);
    }
    current.paragraphs.push(line);
  }

  return sections;
}

/** Short lines ending in "?" read as a FAQ-style question and get emphasized. */
export function isQuestionParagraph(text: string): boolean {
  return text.length <= 140 && /\?\s*$/.test(text);
}

/**
 * A one-line teaser for compact contexts (catalog cards): the opening
 * paragraph of the description, trimmed to a word boundary. Full text
 * lives behind "Mostrar descrição completa" on the product page — cards
 * only need the hook.
 */
export function getExcerpt(
  text: string | null | undefined,
  maxLength = 140,
): string {
  const [firstSection] = parseDescription(text);
  const opening = firstSection?.paragraphs[0] ?? "";
  if (opening.length <= maxLength) return opening;
  const truncated = opening.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}
