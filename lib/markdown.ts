/**
 * Preprocesses Markdown content containing LaTeX math and chemistry equations
 * so that remark-math and KaTeX (with mhchem) can parse and render them reliably.
 *
 * It safely preserves code blocks (fenced ``` and inline `) and handles:
 * 1. \[ ... \] -> $$ ... $$
 * 2. \( ... \) -> $ ... $
 * 3. Standalone \ce{...} -> $\ce{...}$
 * 4. \begin{equation} / \begin{align} -> $$\begin{aligned} ... \end{aligned}$$
 */
export function preprocessMarkdownMath(content: string): string {
  if (!content) return "";

  // Split by code blocks (fenced code blocks and inline code)
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]*?`)/g);

  return parts
    .map((part, index) => {
      // Odd indices are code blocks; keep them completely untouched
      if (index % 2 === 1) return part;

      let text = part;

      // Convert \[ ... \] to display math $$ ... $$
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n\n$$\n${eq.trim()}\n$$\n\n`);

      // Convert \( ... \) to inline math $ ... $
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq.trim()}$`);

      // Convert \begin{equation} / \begin{align} / \begin{gather}
      text = text.replace(
        /\\begin\{(equation\*?|align\*?|gather\*?)\}([\s\S]*?)\\end\{\1\}/g,
        (_, env, body) => `\n\n$$\n\\begin{aligned}\n${body.trim()}\n\\end{aligned}\n$$\n\n`
      );

      // Convert standalone \ce{...} when not already wrapped in $ to $\ce{...}$
      text = text.replace(/(?<!\$)\\ce\{([^}]+)\}(?!\$)/g, (_, formula) => `$\\ce{${formula}}$`);

      return text;
    })
    .join("");
}
