import { parse as parseYaml } from "yaml";

/** `---` … `---` 앞부분만 YAML로 파싱 */
export function parseMdFrontmatter(raw: string): Record<string, unknown> | null {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return null;
  try {
    return parseYaml(raw.slice(4, end)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
