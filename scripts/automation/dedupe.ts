const MAX_SIG_WORDS = 80
const SIMILARITY_THRESHOLD = 0.72

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []).slice(0, MAX_SIG_WORDS)
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) {
    if (b.has(x)) inter += 1
  }
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

export function makeTextSignature(text: string): string {
  const tokens = tokenize(text)
  const uniq = [...new Set(tokens)]
  return uniq.join(" ")
}

export function findNearDuplicate(
  cleanedBody: string,
  signatures: Record<string, string>,
): { duplicated: boolean; matchedId?: string; similarity?: number } {
  const currentSet = new Set(tokenize(cleanedBody))
  let best: { id?: string; score: number } = { score: 0 }
  for (const [id, sig] of Object.entries(signatures)) {
    const score = jaccard(currentSet, new Set(tokenize(sig)))
    if (score > best.score) {
      best = { id, score }
    }
  }
  if (best.id && best.score >= SIMILARITY_THRESHOLD) {
    return { duplicated: true, matchedId: best.id, similarity: best.score }
  }
  return { duplicated: false }
}
