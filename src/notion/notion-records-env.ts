import { normalizeNotionId } from "./notion-id.js";

export type StatusKind = "notion_status" | "select";
export type CategoryKind = "select" | "multi_select";

export type NotionRecordsEnv = {
  token: string;
  knowledgeHubDbId: string;
  executionLogDbId: string;
  knowledgeHub: {
    titleProp: string;
    sotKeyProp: string;
    statusProp: string;
    statusKind: StatusKind;
    statusValue: string;
    categoryProp: string;
    categoryKind: CategoryKind;
    categoryValue: string;
    sourcePathProp: string | null;
  };
  executionLog: {
    titleProp: string;
    sotKeyProp: string;
    sourcePathProp: string | null;
  };
};

function envStr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

function envOpt(key: string): string | null {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : null;
}

function parseStatusKind(key: string): StatusKind {
  const v = process.env[key]?.trim().toLowerCase();
  return v === "select" ? "select" : "notion_status";
}

function parseCategoryKind(key: string): CategoryKind {
  const v = process.env[key]?.trim().toLowerCase();
  return v === "multi_select" ? "multi_select" : "select";
}

/**
 * `NOTION_TOKEN` + 지식 허브 DB ID + EXECUTION LOG DB ID 필수.
 * 컬럼 이름·옵션 값은 한국어 UI 기본값. .env 로 덮어쓰기.
 */
export function loadNotionRecordsEnv(): NotionRecordsEnv {
  const token = process.env.NOTION_TOKEN?.trim();
  const hubDb = process.env.NOTION_KNOWLEDGE_HUB_DB_ID?.trim();
  const logDb = process.env.NOTION_EXECUTION_LOG_DB_ID?.trim();
  if (!token) {
    throw new Error("NOTION_TOKEN 이 .env 에 없습니다.");
  }
  if (!hubDb) {
    throw new Error(
      "NOTION_KNOWLEDGE_HUB_DB_ID 가 .env 에 없습니다. `.env.example` 참고.",
    );
  }
  if (!logDb) {
    throw new Error(
      "NOTION_EXECUTION_LOG_DB_ID 가 .env 에 없습니다. `.env.example` 참고.",
    );
  }
  return {
    token,
    knowledgeHubDbId: normalizeNotionId(hubDb),
    executionLogDbId: normalizeNotionId(logDb),
    knowledgeHub: {
      titleProp: envStr("NOTION_KNOWLEDGE_HUB_PROP_TITLE", "이름"),
      sotKeyProp: envStr("NOTION_KNOWLEDGE_HUB_PROP_SOT_KEY", "SoT Key"),
      statusProp: envStr("NOTION_KNOWLEDGE_HUB_PROP_STATUS", "상태"),
      statusKind: parseStatusKind("NOTION_KNOWLEDGE_HUB_STATUS_KIND"),
      statusValue: envStr("NOTION_KNOWLEDGE_HUB_STATUS_VALUE", "초안"),
      categoryProp: envStr("NOTION_KNOWLEDGE_HUB_PROP_CATEGORY", "카테고리"),
      categoryKind: parseCategoryKind("NOTION_KNOWLEDGE_HUB_CATEGORY_KIND"),
      categoryValue: envStr(
        "NOTION_KNOWLEDGE_HUB_CATEGORY_VALUE",
        "🔧 시스템·아키텍처",
      ),
      sourcePathProp: envOpt("NOTION_KNOWLEDGE_HUB_PROP_SOURCE_PATH"),
    },
    executionLog: {
      titleProp: envStr("NOTION_EXECUTION_LOG_PROP_TITLE", "이름"),
      sotKeyProp: envStr("NOTION_EXECUTION_LOG_PROP_SOT_KEY", "SoT Key"),
      sourcePathProp: envOpt("NOTION_EXECUTION_LOG_PROP_SOURCE_PATH"),
    },
  };
}
