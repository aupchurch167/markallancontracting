/**
 * Drop unfilled `{{PLACEHOLDER: ...}}` tokens before anything is rendered.
 * The token is its own sentence in the source. Removing it hides that sentence.
 * If the answer was only a placeholder, the caller hides the whole FAQ item.
 * The original string stays in the page source so it can be filled in later.
 */
export function publicFaqAnswer(text: string): string | null {
  const visible = text
    .replace(/\{\{PLACEHOLDER:\s*[^}]+\}\}/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return visible ? visible : null;
}
