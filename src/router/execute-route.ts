import { spawn } from "node:child_process"
import type { RouteDecision } from "./route-task.js"

export type ExecuteResult = {
  ok: boolean
  command: string
  exitCode: number
}

function runCommand(command: string, args: string[]): Promise<ExecuteResult> {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32"
    const executable = isWin && command === "npm" ? "npm.cmd" : command
    const quoteWinArg = (v: string): string => {
      if (v.length === 0) return "\"\""
      if (!/[ \t"]/g.test(v)) return v
      return `"${v.replace(/"/g, "\\\"")}"`
    }
    try {
      const child = isWin
        ? spawn(
            "cmd.exe",
            ["/d", "/s", "/c", [executable, ...args].map(quoteWinArg).join(" ")],
            { stdio: "inherit", shell: false },
          )
        : spawn(executable, args, { stdio: "inherit", shell: false })
      child.on("close", (code) => {
        resolve({
          ok: code === 0,
          command: isWin
            ? ["cmd.exe", "/d", "/s", "/c", [executable, ...args].map(quoteWinArg).join(" ")].join(" ")
            : [executable, ...args].join(" "),
          exitCode: code ?? 1,
        })
      })
      child.on("error", () => {
        resolve({
          ok: false,
          command: [executable, ...args].join(" "),
          exitCode: 1,
        })
      })
    } catch {
      resolve({
        ok: false,
        command: [executable, ...args].join(" "),
        exitCode: 1,
      })
    }
  })
}

export async function executeRoute(decision: RouteDecision): Promise<ExecuteResult[]> {
  const results: ExecuteResult[] = []

  if (decision.route_type === "ocr") {
    results.push(await runCommand("npm", ["run", "automation:batch"]))
    if (decision.secondary_actions?.some((a) => a.includes("ingest_url"))) {
      // github URL 후속 처리는 automation:batch 내부에서 수행되므로 별도 실행 없음
    }
    return results
  }

  if (decision.route_type === "github-url") {
    // github-url 단일 실행 경로는 automation:batch가 내부에서 처리하도록 통일
    results.push(await runCommand("npm", ["run", "automation:batch"]))
    return results
  }

  if (decision.route_type === "general-note") {
    // 일반 텍스트는 기존 텔레그램 봇 append 흐름이 primary
    return [
      {
        ok: true,
        command: "noop (general-note handled by telegram bot append flow)",
        exitCode: 0,
      },
    ]
  }

  if (decision.route_type === "review-task") {
    results.push(await runCommand("npm", ["run", "automation:batch:force"]))
    return results
  }

  return [
    {
      ok: false,
      command: "unsupported route",
      exitCode: 1,
    },
  ]
}
