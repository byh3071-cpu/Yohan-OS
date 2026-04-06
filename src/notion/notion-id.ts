/** Notion URL/복사본의 32자 hex 를 API용 UUID 하이픈 형식으로 맞춘다. */
export function normalizeNotionId(raw: string): string {
  const hex = raw.trim().replace(/-/g, "");
  if (hex.length !== 32 || !/^[a-f0-9]+$/i.test(hex)) {
    throw new Error(`Notion ID 가 올바르지 않습니다(32자 hex 필요): ${raw}`);
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
