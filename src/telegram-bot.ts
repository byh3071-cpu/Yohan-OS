/**
 * 텔레그램 봇 — 폴링으로 메시지 수신 (로컬, 별도 HTTP 서버 없음).
 * URL 포함 → `ingestUrl` / 텍스트만 → `memory/inbox/telegram-inbox.md` append
 */
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import type { Message } from "node-telegram-bot-api";
import { ingestUrl } from "./ingest/url.js";
import { getInboxDir, getMemoryDir, resolveRepoRoot } from "./paths.js";

config({ path: join(resolveRepoRoot(), ".env") });

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const allowedChatId = process.env.TELEGRAM_CHAT_ID?.trim();

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN 이 .env 에 없습니다.");
  process.exit(1);
}

/** 동일 PC에서 `npm run bot` 이 두 번 뜨면 Telegram 이 409 를 낸다. PID 락으로 한 인스턴스만 허용. */
const LOCK_FILE = join(getMemoryDir(), ".telegram-bot.lock");
const LOCK_MAX_AGE_MS = 86_400_000;

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * `exists` 후 `write` 방식은 두 프로세스가 동시에 통과할 수 있다.
 * `openSync(…, 'wx')` 로 파일 생성이 원자적일 때만 락을 잡는다.
 */
function acquireSingletonLock(): void {
  mkdirSync(getMemoryDir(), { recursive: true });
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const fd = openSync(LOCK_FILE, "wx");
      try {
        writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now() }), 0, "utf8");
      } finally {
        closeSync(fd);
      }
      return;
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "EEXIST") {
        throw e;
      }
      try {
        const data = JSON.parse(readFileSync(LOCK_FILE, "utf8")) as { pid: number; startedAt: number };
        const stale = Date.now() - data.startedAt > LOCK_MAX_AGE_MS;
        if (stale) {
          unlinkSync(LOCK_FILE);
          continue;
        }
        if (isPidAlive(data.pid)) {
          console.error(
            `텔레그램 봇이 이미 실행 중입니다 (PID ${data.pid}). 다른 터미널·Cursor 터미널의 npm run bot·node 를 모두 종료한 뒤 하나만 실행하세요.`,
          );
          process.exit(1);
        }
        unlinkSync(LOCK_FILE);
      } catch {
        try {
          unlinkSync(LOCK_FILE);
        } catch {
          /* ignore */
        }
      }
    }
  }
  console.error("봇 단일 인스턴스 락을 확보하지 못했습니다. `.telegram-bot.lock` 을 확인하세요.");
  process.exit(1);
}

function releaseSingletonLock(): void {
  try {
    if (!existsSync(LOCK_FILE)) return;
    const data = JSON.parse(readFileSync(LOCK_FILE, "utf8")) as { pid: number };
    if (data.pid === process.pid) unlinkSync(LOCK_FILE);
  } catch {
    /* ignore */
  }
}

acquireSingletonLock();

process.on("exit", () => {
  releaseSingletonLock();
});

/**
 * 동일 업데이트가 두 번 들어오는 경우 방지 (동기적으로만 클레임 — 첫 await 전에 끝낼 것).
 * 프로세스가 두 개면 메모리가 분리되어 중복 답장이 나가므로 `acquireSingletonLock` 이 필수.
 */
const claimedMessageKeys = new Map<string, number>();
const DEDUPE_TTL_MS = 120_000;

function tryClaimMessage(msg: Message): boolean {
  const key = `${msg.chat.id}:${msg.message_id}`;
  const now = Date.now();
  for (const [k, t] of claimedMessageKeys) {
    if (now - t > DEDUPE_TTL_MS) claimedMessageKeys.delete(k);
  }
  if (claimedMessageKeys.has(key)) {
    console.warn(`[dedupe] 이미 처리한 메시지 스킵: ${key}`);
    return false;
  }
  claimedMessageKeys.set(key, now);
  return true;
}

function extractHttpUrls(text: string): string[] {
  const re = /\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const found = text.match(re) ?? [];
  return [...new Set(found.map((u) => u.replace(/[),.]+$/g, "")))];
}

function hasHttpUrl(text: string): boolean {
  return extractHttpUrls(text).length > 0;
}

const telegramInboxPath = () => join(getInboxDir(), "telegram-inbox.md");

async function appendTextOnlyInbox(text: string, meta: { chatId: number; messageId: number; date?: number }): Promise<void> {
  await mkdir(getInboxDir(), { recursive: true });
  const tsSec = meta.date ?? Math.floor(Date.now() / 1000);
  const iso = new Date(tsSec * 1000).toISOString();
  const block = [
    "",
    "---",
    `received_at: ${iso}`,
    `from_chat_id: ${meta.chatId}`,
    `message_id: ${meta.messageId}`,
    "---",
    "",
    text.trim(),
    "",
  ].join("\n");
  await appendFile(telegramInboxPath(), block, "utf8");
}

/**
 * polling: true 만 쓰면 생성자 안에서 즉시 startPolling() → 리스너 등록 전에 업데이트가 처리될 수 있음.
 * autoStart: false 로 두고, on('message') 등록 후에만 startPolling() 한다.
 */
const bot = new TelegramBot(token, {
  polling: {
    autoStart: false,
    /** 기본 300ms 마다 재시도 → 409 시 로그·부하 완화 */
    interval: 3000,
  },
});

async function onMessage(msg: Message): Promise<void> {
  if (!tryClaimMessage(msg)) {
    return;
  }

  const chatId = msg.chat.id;
  if (allowedChatId && String(chatId) !== allowedChatId) {
    console.warn(`[skip] chat ${chatId} (allowed: ${allowedChatId})`);
    return;
  }

  const text = msg.text ?? msg.caption ?? "";
  if (!text.trim()) {
    return;
  }

  try {
    if (hasHttpUrl(text)) {
      const urls = extractHttpUrls(text);
      const lines: string[] = [];
      for (const url of urls) {
        const r = await ingestUrl(url);
        if (r.error) {
          lines.push(`• ${url}\n  오류: ${r.error}`);
        } else if (r.skipped) {
          lines.push(`• ${url}\n  이미 있음: ${r.out_path}`);
        } else {
          lines.push(`• ${url}\n  저장: ${r.out_path}`);
        }
      }
      await bot.sendMessage(chatId, ["ingest_url 완료:", ...lines].join("\n"), { disable_web_page_preview: true });
    } else {
      await appendTextOnlyInbox(text, {
        chatId,
        messageId: msg.message_id,
        date: msg.date,
      });
      await bot.sendMessage(chatId, "memory/inbox/telegram-inbox.md 에 기록했습니다.");
    }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(err);
    await bot.sendMessage(chatId, `처리 실패: ${err}`);
  }
}

if (bot.listenerCount("message") !== 0) {
  console.error("내부 오류: message 리스너가 이미 등록되어 있습니다.");
  process.exit(1);
}

bot.on("message", (msg) => {
  void onMessage(msg);
});

/**
 * 409 는 폴링 루프가 짧은 간격(기본 ~300ms)으로 재시도하며 매번 `polling_error` 를 쏜다.
 * 프로세스당 안내는 한 번만 출력한다.
 */
let printed409Guide = false;

function isConflictPollingError(err: Error): boolean {
  const m = err.message ?? String(err);
  const status = (err as { response?: { statusCode?: number } }).response?.statusCode;
  return (
    status === 409 ||
    m.includes("409") ||
    m.includes("Conflict") ||
    /terminated by other getUpdates/i.test(m)
  );
}

bot.on("polling_error", (err: Error) => {
  if (isConflictPollingError(err)) {
    if (!printed409Guide) {
      printed409Guide = true;
      console.error(
        "[polling_error] 409 Conflict — 동일 봇 토큰으로 다른 getUpdates 가 이미 돌고 있습니다.",
      );
      console.error(
        "  → 다른 터미널·백그라운드의 `npm run bot` / node 를 모두 종료한 뒤 하나만 실행하세요.",
      );
      console.error("  → 다른 PC·호스팅에서 같은 봇을 쓰는 경우도 동일합니다.");
      console.error(
        "  (이후 동일 오류는 반복 출력하지 않습니다. 근본 해결 전까지 라이브러리가 재시도합니다.)",
      );
    }
    return;
  }
  console.error("[polling_error]", err.message ?? String(err));
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap(): Promise<void> {
  /** 웹훅이 남아 있으면 getUpdates(폴링)과 충돌할 수 있음 */
  await bot.deleteWebHook();
  /** 이전 프로세스의 연결이 서버에서 끊기기까지 짧게 대기 (409 완화) */
  await sleep(1500);
  await bot.startPolling();
  console.log("Telegram bot polling… (Ctrl+C 로 종료)");
  if (allowedChatId) {
    console.log(`허용 chat_id: ${allowedChatId}`);
  } else {
    console.warn("TELEGRAM_CHAT_ID 가 비어 있습니다. 모든 채팅의 메시지를 처리합니다.");
  }
}

void bootstrap().catch((e) => {
  console.error("봇 시작 실패:", e);
  process.exit(1);
});
