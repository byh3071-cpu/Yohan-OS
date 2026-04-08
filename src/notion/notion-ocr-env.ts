import { normalizeNotionId } from "./notion-id.js";

/** 리소스·서머리 DB 열 이름은 워크스페이스 스키마에 맞게 .env 로 덮어쓴다. */
export type NotionOcrEnv = {
  token: string;
  resourceDatabaseId: string;
  summaryDatabaseId: string;
  resourceProps: {
    title: string;
    source: string;
    status: string;
    collectedDate: string;
    tags: string;
    body: string;
  };
  summaryProps: {
    title: string;
    kind: string;
    status: string;
    createdDate: string;
    tags: string;
    resourceRelation: string;
    body: string;
  };
  defaults: {
    sourceValue: string;
    resourceStatusValue: string;
    summaryTypeValue: string;
    summaryStatusValue: string;
  };
  /** `상태` 열이 Notion Status 타입이면 API `status`, Select 타입이면 `select` */
  resourceStatusKind: "notion_status" | "select";
  summaryStatusKind: "notion_status" | "select";
};

function envStr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

/** 빈 문자열 허용 — `본문` 열 없을 때 prop 이름 미설정 */
function envStrOrEmpty(key: string): string {
  const v = process.env[key]?.trim();
  return v === undefined || v === null ? "" : v;
}

function parseStatusKind(key: string, defaultKind: "notion_status" | "select"): "notion_status" | "select" {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "select") {
    return "select";
  }
  return defaultKind;
}

/**
 * `NOTION_TOKEN` + OCR 전용 DB ID 필수.
 * 열 이름 기본값은 한글 UI 가정; 영문 DB면 .env 로 전부 교체.
 */
export function loadNotionOcrEnv(): NotionOcrEnv {
  const token = process.env.NOTION_TOKEN?.trim();
  const resDb = process.env.NOTION_OCR_RESOURCE_DATABASE_ID?.trim();
  const sumDb = process.env.NOTION_OCR_SUMMARY_DATABASE_ID?.trim();
  if (!token) {
    throw new Error("NOTION_TOKEN 이 .env 에 없습니다.");
  }
  if (!resDb) {
    throw new Error(
      "NOTION_OCR_RESOURCE_DATABASE_ID 가 .env 에 없습니다. 레포 루트 `.env`에 DB ID(32자 hex)를 넣거나 `.env.example`을 참고하세요.",
    );
  }
  if (!sumDb) {
    throw new Error(
      "NOTION_OCR_SUMMARY_DATABASE_ID 가 .env 에 없습니다. 레포 루트 `.env`에 DB ID(32자 hex)를 넣거나 `.env.example`을 참고하세요.",
    );
  }
  return {
    token,
    resourceDatabaseId: normalizeNotionId(resDb),
    summaryDatabaseId: normalizeNotionId(sumDb),
    resourceProps: {
      title: envStr("NOTION_OCR_RESOURCE_PROP_TITLE", "이름"),
      source: envStr("NOTION_OCR_RESOURCE_PROP_SOURCE", "소스"),
      status: envStr("NOTION_OCR_RESOURCE_PROP_STATUS", "상태"),
      collectedDate: envStr("NOTION_OCR_RESOURCE_PROP_DATE", "수집일"),
      tags: envStr("NOTION_OCR_RESOURCE_PROP_TAGS", "태그"),
      body: envStrOrEmpty("NOTION_OCR_RESOURCE_PROP_BODY"),
    },
    summaryProps: {
      title: envStr("NOTION_OCR_SUMMARY_PROP_TITLE", "이름"),
      kind: envStr("NOTION_OCR_SUMMARY_PROP_TYPE", "유형"),
      status: envStr("NOTION_OCR_SUMMARY_PROP_STATUS", "상태"),
      createdDate: envStr("NOTION_OCR_SUMMARY_PROP_DATE", "생성일"),
      tags: envStr("NOTION_OCR_SUMMARY_PROP_TAGS", "태그"),
      resourceRelation: envStr(
        "NOTION_OCR_SUMMARY_PROP_RELATION",
        "리소스 DB (단기 기억)",
      ),
      body: envStrOrEmpty("NOTION_OCR_SUMMARY_PROP_BODY"),
    },
    defaults: {
      sourceValue: envStr("NOTION_OCR_DEFAULT_SOURCE", "텔레그램 스크린샷"),
      resourceStatusValue: envStr("NOTION_OCR_DEFAULT_RESOURCE_STATUS", "수집됨"),
      summaryTypeValue: envStr("NOTION_OCR_DEFAULT_SUMMARY_TYPE", "인사이트"),
      summaryStatusValue: envStr("NOTION_OCR_DEFAULT_SUMMARY_STATUS", "초안"),
    },
    resourceStatusKind: parseStatusKind("NOTION_OCR_RESOURCE_STATUS_KIND", "notion_status"),
    summaryStatusKind: parseStatusKind("NOTION_OCR_SUMMARY_STATUS_KIND", "notion_status"),
  };
}
