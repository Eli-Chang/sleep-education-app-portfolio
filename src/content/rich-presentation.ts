import type { ContentLesson, RichContentBlock, RichTextSegment } from '../types/content';

// Renders a screen's paragraphs, turning consecutive "•" paragraphs into a bulleted list.
// A screen can supply its own `presentation` blocks to override this.
export function richPresentation(screen: ContentLesson): RichContentBlock[] {
  if (screen.presentation) return screen.presentation;
  const blocks: RichContentBlock[] = [];
  for (let index = 0; index < screen.paragraphs.length;) {
    const paragraph = screen.paragraphs[index];
    if (paragraph.trimStart().startsWith('•')) {
      const items: RichTextSegment[][] = [];
      while (index < screen.paragraphs.length && screen.paragraphs[index].trimStart().startsWith('•')) {
        items.push(...screen.paragraphs[index].split(/\n(?=•)/).map((item) => [{ text: item.trimStart().replace(/^•\s*/, '') }]));
        index += 1;
      }
      blocks.push({ type: 'unorderedList', items });
      continue;
    }
    blocks.push({ type: 'paragraph', segments: [{ text: paragraph }] });
    index += 1;
  }
  return blocks;
}
