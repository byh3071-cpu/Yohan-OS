/**
 * 텔레그램 봇 점검: Bot API getMe + 로컬 단일 인스턴스 락(.telegram-bot.lock).
 * 대시보드 빠른 실행 `bot:status`에서 사용 — 토큰 값은 출력하지 않음.
 */
import { config } from "dotenv"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { getMemoryDir, resolveRepoRoot } from "../src/paths.js"

config({ path: join(resolveRepoRoot(), ".env") })

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function main(): Promise<void> {
  const lines: string[] = []
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN: missing (.env)")
    process.exit(1)
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const j = (await r.json()) as {
      ok?: boolean
      description?: string
      result?: { id?: number; username?: string; first_name?: string }
    }
    if (!j.ok) {
      console.error("getMe failed:", j.description ?? JSON.stringify(j))
      process.exit(1)
    }
    const u = j.result?.username ? `@${j.result.username}` : j.result?.first_name ?? "?"
    lines.push(`Telegram API: ok ${u} (bot id ${j.result?.id ?? "?"})`)
  } catch (e) {
    console.error("getMe network error:", e instanceof Error ? e.message : e)
    process.exit(1)
  }

  if (chatId) {
    lines.push("TELEGRAM_CHAT_ID: set (non-matching chats ignored)")
  } else {
    lines.push("TELEGRAM_CHAT_ID: not set — all chats processed (set for safety)")
  }

  const lockPath = join(getMemoryDir(), ".telegram-bot.lock")
  if (!existsSync(lockPath)) {
    lines.push("Local lock: none — npm run bot not holding lock here (or not running)")
  } else {
    try {
      const data = JSON.parse(readFileSync(lockPath, "utf8")) as { pid?: number; startedAt?: number }
      const pid = data.pid
      if (typeof pid === "number" && isPidAlive(pid)) {
        lines.push(`Local lock: PID ${pid} alive (polling likely on this PC)`)
      } else {
        lines.push("Local lock: stale — delete memory/.telegram-bot.lock if no bot is running")
      }
    } catch {
      lines.push("Local lock: unreadable JSON — inspect memory/.telegram-bot.lock")
    }
  }

  lines.push("MCP: run npm run mcp:check separately if needed")
  console.log(lines.join("\n"))
}

void main()
