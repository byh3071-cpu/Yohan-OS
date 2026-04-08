import { routeTask, type RouteType } from "../src/router/route-task.js"

type Fixture = {
  id: string
  input: { raw_text?: string; message_type?: "screenshot" | "text"; source?: "telegram" | "manual" | "queue"; is_replay?: boolean }
  expect_route: RouteType
}

const fixtures: Fixture[] = [
  { id: "TC-01", input: { message_type: "screenshot", raw_text: "OCR body only" }, expect_route: "ocr" },
  { id: "TC-02", input: { message_type: "screenshot", raw_text: "https://github.com/foo/bar" }, expect_route: "ocr" },
  { id: "TC-03", input: { message_type: "text", raw_text: "check https://github.com/owner/repo" }, expect_route: "github-url" },
  { id: "TC-04", input: { message_type: "text", raw_text: "https://gist.github.com/a/b" }, expect_route: "github-url" },
  { id: "TC-05", input: { message_type: "text", raw_text: "오늘 회고 메모 남김" }, expect_route: "general-note" },
  { id: "TC-06", input: { message_type: "text", raw_text: "" }, expect_route: "review-task" },
  { id: "TC-07", input: { raw_text: "replay: message_id=47", is_replay: true }, expect_route: "review-task" },
  { id: "TC-08", input: { raw_text: "open memory/inbox/automation-dead-letter.md and retry" }, expect_route: "review-task" },
  { id: "TC-09", input: { raw_text: "type: screenshot\nreceived_at: ...\nbody..." }, expect_route: "ocr" },
  { id: "TC-10", input: { raw_text: "   " }, expect_route: "review-task" },
]

let passed = 0
for (const f of fixtures) {
  const got = routeTask(f.input).route_type
  const ok = got === f.expect_route
  if (ok) passed += 1
  console.log(`${ok ? "PASS" : "FAIL"} ${f.id}: expected=${f.expect_route} got=${got}`)
}

if (passed !== fixtures.length) {
  process.exit(1)
}

console.log(`All fixtures passed (${passed}/${fixtures.length}).`)
