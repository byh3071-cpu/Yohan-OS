import { ingestRssFeed } from "./ingest/rss-feed.js";
import { RSS_FEED_THEMILK } from "./ingest/rss-feed-config.js";

const arg = process.argv[2];
const limit = arg !== undefined ? Number.parseInt(arg, 10) : 20;

if (arg !== undefined && (Number.isNaN(limit) || limit < 1)) {
  console.error("Usage: npx tsx src/ingest-themilk-cli.ts [limit]");
  process.exit(1);
}

ingestRssFeed(RSS_FEED_THEMILK, { limit })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
