import { routeTask } from "./router/route-task.js"

const raw = process.argv.slice(2).join(" ").trim()

if (!raw) {
  console.error("Usage: npm run route:task -- \"<input text>\"")
  process.exit(1)
}

const decision = routeTask({ raw_text: raw, source: "manual" })
console.log(JSON.stringify(decision, null, 2))
