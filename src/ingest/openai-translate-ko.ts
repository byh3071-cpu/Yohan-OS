/**
 * OPENAI_API_KEY 가 없거나 호출 실패 시 null — 호출부에서 조용히 스킵.
 */
export async function translateTitleAndSummaryToKo(
  title: string,
  excerpt: string,
  apiKey: string,
): Promise<{ title_ko: string; summary_ko: string } | null> {
  const key = apiKey.trim();
  if (!key) return null;

  const excerptTrim = excerpt.replace(/\s+/g, " ").trim().slice(0, 6000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You translate and summarize into Korean. Reply with JSON only: {\"title_ko\":\"...\",\"summary_ko\":\"...\"}. title_ko: natural Korean title. summary_ko: 2–5 sentence Korean summary of the excerpt.",
          },
          {
            role: "user",
            content: `Title:\n${title}\n\nExcerpt:\n${excerptTrim || "(empty)"}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { title_ko?: string; summary_ko?: string };
    const title_ko = typeof parsed.title_ko === "string" ? parsed.title_ko.trim() : "";
    const summary_ko = typeof parsed.summary_ko === "string" ? parsed.summary_ko.trim() : "";
    if (!title_ko && !summary_ko) return null;

    return {
      title_ko: title_ko || title,
      summary_ko: summary_ko || excerptTrim.slice(0, 500),
    };
  } catch {
    return null;
  }
}
