import { searchMemory } from "./search/memory-search.js";

const query = process.argv[2];
const max = process.argv[3] ? Number.parseInt(process.argv[3], 10) : 40;

if (!query?.trim()) {
  console.error("Usage: npx tsx src/search-memory-cli.ts <query> [max_results]");
  process.exit(1);
}

searchMemory(query, { maxResults: Number.isNaN(max) ? 40 : max })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
