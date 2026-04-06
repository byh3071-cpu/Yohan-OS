import { ingestUrl } from "./ingest/url.js";

const url = process.argv[2];
if (!url) {
  console.error("Usage: npx tsx src/ingest-url-cli.ts <url>");
  process.exit(1);
}

ingestUrl(url)
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
    if (r.error) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
