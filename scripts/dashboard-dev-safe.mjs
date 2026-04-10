import { spawnSync, spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import path from "node:path"

const port = process.env.DASHBOARD_PORT || "4000"
const diag = process.argv.includes("--diag") || process.env.DASHBOARD_DIAG === "1"

function run(cmd, args) {
  if (process.platform === "win32") {
    const commandLine = [cmd, ...args].join(" ")
    return spawnSync("cmd.exe", ["/d", "/s", "/c", commandLine], {
      encoding: "utf8",
      shell: false,
    })
  }
  return spawnSync(cmd, args, { encoding: "utf8", shell: false })
}

function spawnDashboardDev(envVars, p) {
  if (process.platform === "win32") {
    return spawn(
      "cmd.exe",
      ["/d", "/s", "/c", `npm --prefix dashboard run dev -- --webpack --port ${p}`],
      { stdio: "inherit", shell: false, env: envVars }
    )
  }
  return spawn(
    "npm",
    ["--prefix", "dashboard", "run", "dev", "--", "--webpack", "--port", p],
    { stdio: "inherit", shell: false, env: envVars }
  )
}

function findPidsOnPort(p) {
  const r = run("netstat", ["-ano", "-p", "tcp"])
  const text = `${r.stdout || ""}\n${r.stderr || ""}`
  const lines = text.split(/\r?\n/)
  const pids = new Set()
  for (const line of lines) {
    if (!line.includes(`:${p}`)) continue
    const cols = line.trim().split(/\s+/)
    const pid = cols[cols.length - 1]
    if (/^\d+$/.test(pid)) pids.add(pid)
  }
  return [...pids]
}

function killPid(pid) {
  run("taskkill", ["/PID", String(pid), "/F"])
}

const pids = findPidsOnPort(port)
if (pids.length > 0) {
  for (const pid of pids) killPid(pid)
}

const env = { ...process.env }
if (!env.NODE_OPTIONS || !env.NODE_OPTIONS.includes("max-old-space-size")) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--max-old-space-size=3072"]
    .filter(Boolean)
    .join(" ")
}
let diagHeapDir = ""
if (diag) {
  const heapDir = path.resolve("dashboard", ".debug", "heap")
  mkdirSync(heapDir, { recursive: true })
  diagHeapDir = heapDir
  const diagNodeOptions = [
    "--heapsnapshot-near-heap-limit=2",
    `--diagnostic-dir=${heapDir}`,
  ].join(" ")
  env.NODE_OPTIONS = [env.NODE_OPTIONS, diagNodeOptions].filter(Boolean).join(" ")
  console.log(`[dashboard:dev:diag] NODE_OPTIONS=${env.NODE_OPTIONS}`)
  console.log(`[dashboard:dev:diag] heap snapshots dir=${heapDir}`)
}

const dev = spawnDashboardDev(env, port)

dev.on("exit", (code) => process.exit(code ?? 0))

