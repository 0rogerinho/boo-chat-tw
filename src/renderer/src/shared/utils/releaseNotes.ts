export type ReleaseNotesSectionKey = 'new' | 'improvements' | 'fixes' | 'other'

export type ParsedReleaseNotes = Record<ReleaseNotesSectionKey, string[]>

export type ReleaseNotesInput =
  | string
  | Array<{ version?: string; note?: string | null }>
  | null
  | undefined

const SECTION_ALIASES: Record<Exclude<ReleaseNotesSectionKey, 'other'>, string[]> = {
  new: ['novidades', 'novo', "what's new", 'whats new', 'new features', 'features', 'added', 'new'],
  improvements: ['melhorias', 'melhoria', 'improvements', 'improvement', 'enhancements', 'enhanced'],
  fixes: ['correções', 'correcoes', 'correção', 'correcao', 'bug fixes', 'fixes', 'fix', 'bugs']
}

function decodeHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<h[1-6][^>]*>/gi, '## ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function normalizeHeading(value: string): string {
  return value
    .replace(/^#+\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/[:：]\s*$/, '')
    .trim()
    .toLowerCase()
}

function matchSection(heading: string): Exclude<ReleaseNotesSectionKey, 'other'> | null {
  const normalized = normalizeHeading(heading)
  if (!normalized) return null

  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as Array<
    [Exclude<ReleaseNotesSectionKey, 'other'>, string[]]
  >) {
    if (aliases.includes(normalized)) return key
  }

  return null
}

function extractRawText(raw: ReleaseNotesInput): string {
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  return raw
    .map((entry) => entry.note)
    .filter((note): note is string => Boolean(note && note.trim()))
    .join('\n\n')
}

function pushItem(target: string[], value: string): void {
  const item = value.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '').trim()
  if (item) target.push(item)
}

export function parseReleaseNotes(raw: ReleaseNotesInput): ParsedReleaseNotes {
  const text = decodeHtml(extractRawText(raw))
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
  if (!text) return { new: [], improvements: [], fixes: [], other: [] }

  const parsed: ParsedReleaseNotes = { new: [], improvements: [], fixes: [], other: [] }
  let current: ReleaseNotesSectionKey = 'other'

  for (const originalLine of text.split('\n')) {
    const line = originalLine.trim()
    if (!line) continue

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/) || line.match(/^\*\*(.+?)\*\*:?\s*$/)

    if (headingMatch) {
      current = matchSection(headingMatch[1]) ?? 'other'
      continue
    }

    if (/^[-*•]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      pushItem(parsed[current], line)
      continue
    }

    if (current === 'other' && parsed.other.length === 0 && parsed.new.length + parsed.improvements.length + parsed.fixes.length === 0) {
      pushItem(parsed.other, line)
      continue
    }

    if (current !== 'other') {
      pushItem(parsed[current], line)
    }
  }

  return parsed
}

export function hasReleaseNotes(notes: ParsedReleaseNotes): boolean {
  return notes.new.length + notes.improvements.length + notes.fixes.length + notes.other.length > 0
}
