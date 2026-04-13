/**
 * Auto-enhance plain text into markdown for better rendering.
 * Detects common patterns in AI responses (and plain text) and
 * converts them to proper markdown so ReactMarkdown renders them
 * with full styling — headers, bold, lists, code, etc.
 *
 * Only enhances if the text looks like plain text (no existing markdown).
 */

const HAS_MARKDOWN = /(?:^#{1,4}\s|^\s*[-*]\s|\*\*|```)|\|.*\|.*\|/m;

/** Detect if text already contains meaningful markdown */
function alreadyHasMarkdown(text: string): boolean {
  return HAS_MARKDOWN.test(text);
}

export function enhanceToMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return text || '';

  // If already has markdown syntax, leave it alone
  if (alreadyHasMarkdown(text)) return text;

  const lines = text.split('\n');
  const enhanced: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Pattern: "Label: value" at start of line (key-value pairs)
    // e.g. "Name: John" → "**Name:** John"
    const kvMatch = line.match(/^([A-Z][A-Za-z0-9 /&-]{1,30}):\s+(.+)/);
    if (kvMatch && !line.startsWith('http')) {
      line = `**${kvMatch[1]}:** ${kvMatch[2]}`;
    }

    // Pattern: "1. " or "2. " numbered items (already valid markdown, but ensure spacing)
    // These are already markdown — leave them

    // Pattern: Lines that look like section titles (short, no punctuation at end, followed by content)
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    if (
      line.length > 3 &&
      line.length < 80 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      !line.endsWith(':') &&
      !line.startsWith(' ') &&
      !line.startsWith('-') &&
      !line.startsWith('*') &&
      nextLine.trim() !== '' &&
      nextLine.trim().length > line.length &&
      /^[A-Z]/.test(line)
    ) {
      // Check if this looks like a standalone title line
      const words = line.split(/\s+/);
      if (words.length <= 8 && !line.includes('. ')) {
        line = `### ${line}`;
      }
    }

    // Pattern: "word (id: xxx)" → bold the word, code the id
    line = line.replace(
      /\b([a-z][\w-]+)\s+\(id:\s*([a-f0-9-]+)\)/gi,
      '**$1** (`id: $2`)'
    );

    // Pattern: UUIDs → inline code
    line = line.replace(
      /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/gi,
      '`$1`'
    );

    // Pattern: file paths → inline code
    line = line.replace(
      /(?<!\`)(\/?(?:[\w.-]+\/){2,}[\w.-]+)(?!\`)/g,
      '`$1`'
    );

    // Pattern: function/method names like func_name() → inline code
    line = line.replace(
      /(?<!\`)(\b[a-z_]\w+\(\))(?!\`)/gi,
      '`$1`'
    );

    enhanced.push(line);
  }

  return enhanced.join('\n');
}
