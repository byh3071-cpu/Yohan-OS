export async function notifyTelegram(lines: string[], noNotify: boolean): Promise<void> {
  if (noNotify) return
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) return
  try {
    const text = lines.join("\n")
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[notify] telegram 실패 ${res.status}: ${body}`)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    // 알림 실패는 배치 실패로 간주하지 않는다.
    console.error(`[notify] telegram 예외(무시): ${msg}`)
  }
}
