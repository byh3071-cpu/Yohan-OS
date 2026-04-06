import { normalizeNotionId } from "./notion-id.js";

export type NotionSyncEnv = {
  token: string;
  databaseId: string;
  /** DB 의 제목 열 이름 (영문 UI 기본: Name) */
  titleProperty: string;
  /** 멱등 키용 텍스트 열 — 반드시 DB에 만들 것 */
  sotKeyProperty: string;
  /** 요약 본문 (선택, 없으면 푸시 시 생략) */
  summaryProperty: string | null;
  /** SoT 상대 경로 (선택) */
  sourcePathProperty: string | null;
};

export function loadNotionSyncEnv(): NotionSyncEnv {
  const token = process.env.NOTION_TOKEN?.trim();
  const dbRaw = process.env.NOTION_DATABASE_ID?.trim();
  if (!token) {
    throw new Error("NOTION_TOKEN 이 .env 에 없습니다.");
  }
  if (!dbRaw) {
    throw new Error("NOTION_DATABASE_ID 가 .env 에 없습니다.");
  }
  return {
    token,
    databaseId: normalizeNotionId(dbRaw),
    titleProperty: process.env.NOTION_TITLE_PROPERTY?.trim() || "Name",
    sotKeyProperty: process.env.NOTION_PROPERTY_SOT_KEY?.trim() || "SoT Key",
    summaryProperty: process.env.NOTION_PROPERTY_SUMMARY?.trim() || null,
    sourcePathProperty: process.env.NOTION_PROPERTY_SOURCE_PATH?.trim() || null,
  };
}
