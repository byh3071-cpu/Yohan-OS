/**
 * 6개 RSS 피드를 순차 실행. 한 피드가 실패해도 나머지 계속, 종료 코드 0.
 */
import {
  type RssFeedDefinition,
  RSS_FEED_AITIMES,
  RSS_FEED_KARPATHY,
  RSS_FEED_PAULGRAHAM,
  RSS_FEED_SAMALTMAN,
  RSS_FEED_THEMILK,
  RSS_FEED_YOZM,
} from "./ingest/rss-feed-config.js";
import { ingestRssFeed } from "./ingest/rss-feed.js";

const FEEDS: RssFeedDefinition[] = [
  RSS_FEED_YOZM,
  RSS_FEED_AITIMES,
  RSS_FEED_THEMILK,
  RSS_FEED_PAULGRAHAM,
  RSS_FEED_SAMALTMAN,
  RSS_FEED_KARPATHY,
];

const arg = process.argv[2];
const limit = arg !== undefined ? Number.parseInt(arg, 10) : 20;

if (arg !== undefined && (Number.isNaN(limit) || limit < 1)) {
  console.error("Usage: npx tsx src/ingest-all-rss-cli.ts [limit]");
  process.exit(1);
}

async function main(): Promise<void> {
  const summary: Array<{ feed_key: string; ok: boolean; error?: string }> = [];

  for (const def of FEEDS) {
    try {
      const r = await ingestRssFeed(def, { limit });
      console.log(JSON.stringify({ feed_key: def.feedKey, ok: true, result: r }, null, 2));
      summary.push({ feed_key: def.feedKey, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(JSON.stringify({ feed_key: def.feedKey, ok: false, error: msg }, null, 2));
      summary.push({ feed_key: def.feedKey, ok: false, error: msg });
    }
  }

  console.log(JSON.stringify({ ingest_all_summary: summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
