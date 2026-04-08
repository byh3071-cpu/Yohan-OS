import { Client } from "@notionhq/client";
import * as z from "zod/v4";
import type { NotionOcrEnv } from "./notion-ocr-env.js";

const OcrPushInputSchema = z.object({
  date_ymd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  resource_title: z.string().min(1),
  ocr_raw_body: z.string(),
  summary_title: z.string().min(1).optional(),
  summary_body: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source_select: z.string().optional(),
  resource_status: z.string().optional(),
  summary_type: z.string().optional(),
  summary_status: z.string().optional(),
  /** true 이면 리소스 DB 페이지만 생성 (짧은 OCR 등) */
  resource_only: z.boolean().optional(),
});

export type OcrPushInput = z.infer<typeof OcrPushInputSchema>;
export { OcrPushInputSchema };

export type OcrPushResult = {
  ok: true;
  resource_page_id: string;
  summary_page_id: string | null;
};

function chunkRichText(s: string, max = 2000): Array<{ type: "text"; text: { content: string } }> {
  const out: Array<{ type: "text"; text: { content: string } }> = [];
  for (let i = 0; i < s.length; i += max) {
    out.push({ type: "text", text: { content: s.slice(i, i + max) } });
  }
  return out.length > 0 ? out : [{ type: "text", text: { content: "" } }];
}

function titleBlock(name: string, value: string): Record<string, unknown> {
  return {
    [name]: {
      title: [{ type: "text" as const, text: { content: value.slice(0, 2000) } }],
    },
  };
}

function richTextProp(name: string, value: string): Record<string, unknown> {
  return { [name]: { rich_text: chunkRichText(value) } };
}

function selectProp(name: string, option: string): Record<string, unknown> {
  return { [name]: { select: { name: option.slice(0, 2000) } } };
}

/** Notion 열 타입이 Status 일 때 */
function notionStatusProp(name: string, option: string): Record<string, unknown> {
  return { [name]: { status: { name: option.slice(0, 2000) } } };
}

function dateProp(name: string, startYmd: string): Record<string, unknown> {
  return { [name]: { date: { start: startYmd } } };
}

function multiSelectProp(name: string, tags: string[]): Record<string, unknown> {
  const names = [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 25);
  return { [name]: { multi_select: names.map((n) => ({ name: n.slice(0, 100) })) } };
}

function relationProp(name: string, resourcePageId: string): Record<string, unknown> {
  return { [name]: { relation: [{ id: resourcePageId }] } };
}

function parseInput(raw: unknown): OcrPushInput {
  return OcrPushInputSchema.parse(raw);
}

function statusOrSelect(
  name: string,
  value: string,
  kind: "notion_status" | "select",
): Record<string, unknown> {
  return kind === "notion_status" ? notionStatusProp(name, value) : selectProp(name, value);
}

async function appendPlainTextAsParagraphs(notion: Client, pageId: string, text: string): Promise<void> {
  if (!text) {
    return;
  }
  const chunks = chunkRichText(text, 2000);
  const blocks = chunks.map((c) => ({
    object: "block" as const,
    type: "paragraph" as const,
    paragraph: { rich_text: [c] },
  }));
  for (let i = 0; i < blocks.length; i += 100) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: blocks.slice(i, i + 100),
    });
  }
}

/**
 * 텔레그램 OCR 파이프라인: 리소스 DB(원문) + 서머리 DB(정제본, relation 필수).
 * DB 열 타입이 스키마와 다르면 Notion API 가 400 을 반환한다 — `notion-ocr-env`에서 이름을 맞출 것.
 */
export async function pushOcrResourceAndSummary(env: NotionOcrEnv, inputRaw: unknown): Promise<OcrPushResult> {
  const input = parseInput(inputRaw);
  const notion = new Client({ auth: env.token, notionVersion: "2022-06-28" });
  const tags = input.tags ?? [];
  const source = input.source_select ?? env.defaults.sourceValue;
  const resStatus = input.resource_status ?? env.defaults.resourceStatusValue;

  const resourceProperties: Record<string, unknown> = {
    ...titleBlock(env.resourceProps.title, input.resource_title),
    ...selectProp(env.resourceProps.source, source),
    ...statusOrSelect(env.resourceProps.status, resStatus, env.resourceStatusKind),
    ...dateProp(env.resourceProps.collectedDate, input.date_ymd),
    ...(tags.length > 0 ? multiSelectProp(env.resourceProps.tags, tags) : {}),
    ...(env.resourceProps.body
      ? richTextProp(env.resourceProps.body, input.ocr_raw_body)
      : {}),
  };

  const resource = await notion.pages.create({
    parent: { database_id: env.resourceDatabaseId },
    properties: resourceProperties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

  if (!env.resourceProps.body && input.ocr_raw_body) {
    await appendPlainTextAsParagraphs(notion, resource.id, input.ocr_raw_body);
  }

  const summaryTitle = input.summary_title?.trim() ?? "";
  const resourceOnly =
    input.resource_only === true ||
    !summaryTitle ||
    input.summary_body === undefined;
  if (resourceOnly) {
    return { ok: true, resource_page_id: resource.id, summary_page_id: null };
  }

  const sumType = input.summary_type ?? env.defaults.summaryTypeValue;
  const sumStatus = input.summary_status ?? env.defaults.summaryStatusValue;

  const summaryProperties: Record<string, unknown> = {
    ...titleBlock(env.summaryProps.title, summaryTitle),
    ...selectProp(env.summaryProps.kind, sumType),
    ...statusOrSelect(env.summaryProps.status, sumStatus, env.summaryStatusKind),
    ...dateProp(env.summaryProps.createdDate, input.date_ymd),
    ...(tags.length > 0 ? multiSelectProp(env.summaryProps.tags, tags) : {}),
    ...relationProp(env.summaryProps.resourceRelation, resource.id),
    ...(env.summaryProps.body ? richTextProp(env.summaryProps.body, input.summary_body ?? "") : {}),
  };

  const summary = await notion.pages.create({
    parent: { database_id: env.summaryDatabaseId },
    properties: summaryProperties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

  if (!env.summaryProps.body && input.summary_body) {
    await appendPlainTextAsParagraphs(notion, summary.id, input.summary_body);
  }

  return { ok: true, resource_page_id: resource.id, summary_page_id: summary.id };
}
