// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}

// Parse a section from markdown by heading
export function extractSection(markdown = '', heading) {
  // Guard against non-string inputs (e.g., translations object or other shapes)
  if (typeof markdown !== 'string') {
    if (markdown == null) return '';
    // Common shapes: { en: '...' } or { content: '...' } or { translations: { en: '...' } }
    if (typeof markdown === 'object') {
      if (typeof markdown.en === 'string') markdown = markdown.en;
      else if (typeof markdown.content === 'string') markdown = markdown.content;
      else if (markdown.translations && typeof markdown.translations.en === 'string') markdown = markdown.translations.en;
      else return '';
    } else {
      // fallback to coercion for other primitive types
      markdown = String(markdown);
    }
  }

  const re = new RegExp(`##\\s*${heading}([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  const m = markdown.match(re);
  if (!m) return '';
  return m[1].trim();
}

export function parseEntriesFromSection(sectionText) {
  if (!sectionText) return [];
  // Split by '### ' which denotes each entry
  const parts = sectionText.split(/###\s+/).filter(Boolean);
  return parts.map((part) => {
    const lines = part.split('\n').map(l => l.trim()).filter(Boolean);
    // line0: Title @ Org
    // line1: Date range (e.g., Jan 2020 - Present)
    // rest: description lines
    const titleOrg = lines[0] || '';
    const [title, org] = titleOrg.split(' @ ').map(s => s?.trim() || '');
    const dateLine = lines[1] || '';
    let startDate = '';
    let endDate = '';
    if (dateLine.includes(' - ')) {
      const [s, e] = dateLine.split(' - ').map(s => s.trim());
      startDate = s;
      endDate = e === 'Present' ? '' : e;
    }
    const description = lines.slice(2).join('\n\n') || '';
    return {
      title,
      organization: org,
      startDate,
      endDate,
      current: dateLine.includes('Present'),
      description,
    };
  });
}

export function parseMarkdownToFields(markdown = '') {
  // Normalize different possible input shapes (string, { en: '...' }, { translations: { en: '...' } }, etc.)
  let mdText = '';
  if (typeof markdown === 'string') mdText = markdown;
  else if (markdown && typeof markdown === 'object') {
    mdText = markdown.en ?? markdown.content ?? markdown.translations?.en ?? '';
    if (typeof mdText !== 'string') mdText = '';
  } else {
    mdText = String(markdown || '');
  }

  return {
    summary: extractSection(mdText, 'Professional Summary') || '',
    skills: extractSection(mdText, 'Skills') || '',
    experience: parseEntriesFromSection(extractSection(mdText, 'Work Experience')),
    education: parseEntriesFromSection(extractSection(mdText, 'Education')),
    projects: parseEntriesFromSection(extractSection(mdText, 'Projects')),
  };
}
