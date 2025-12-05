import { crawlPage, getTitleMapping, searchPages } from "./src/crawl";
import type { SearchIndex } from "./src/crawl";

function displaySearchResults(pages: SearchIndex, searchQuery: string) {
  const results = searchPages(pages, searchQuery);

  if (results.length === 0) {
    console.log(`No results found for "${searchQuery}"`);
    return;
  }

  // Show top 10 most relevant results
  const topResults = results.slice(0, 10);
  const totalResults = results.length;

  console.log(`\n🔍 Search results for "${searchQuery}":\n`);
  console.log("─".repeat(60));

  topResults.forEach((page, index) => {
    console.log(`\n${index + 1}. ${page.title}`);
    console.log(`   📎 ${page.url}`);
    console.log(`   (Found ${page.count} time${page.count > 1 ? "s" : ""})`);
  });

  console.log("\n" + "─".repeat(60));
  if (totalResults > 10) {
    console.log(`Showing top 10 of ${totalResults} results`);
  } else {
    console.log(`Total: ${totalResults} result${totalResults > 1 ? "s" : ""}`);
  }
}

async function main() {
  const args = Bun.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage:");
    console.error("  Crawl:         bun index.ts <url> [--limit=N]");
    console.error(
      "  Crawl+Search:  bun index.ts <url> <search query> [--limit=N]"
    );
    console.error("\nDefault limit: 100 pages");
    return;
  }

  // Parse --limit argument
  let limit = 100;
  const limitArg = args.find((arg) => arg.startsWith("--limit="));
  if (limitArg) {
    limit = parseInt(limitArg.split("=")[1] ?? "100", 10) || 100;
  }

  const filteredArgs = args.filter((arg) => !arg.startsWith("--limit="));
  const baseURL = filteredArgs[0] as string;
  const searchQuery = filteredArgs.slice(1).join(" ");

  // Always crawl first
  console.log(`Starting crawl of ${baseURL} (limit: ${limit} pages)`);

  const startTime = performance.now();
  const pages = await crawlPage(baseURL, baseURL, {}, limit);
  const endTime = performance.now();
  const timeTaken = (endTime - startTime) / 1000;

  // Generate title-to-URL mapping for search
  const titleMapping = getTitleMapping(pages);

  console.log("\n################################");
  console.log(
    `Time taken ${timeTaken.toFixed(2)}s. Pages found: ${
      Object.keys(pages).length
    }`
  );
  console.log("Pages/sec:", (Object.keys(pages).length / timeTaken).toFixed(2));
  console.log("################################");

  // Save full report with titles
  await Bun.write("report.json", JSON.stringify(pages, null, 2));

  // Save title-to-URL mapping for Google-like search
  await Bun.write("titles.json", JSON.stringify(titleMapping, null, 2));

  // If search query provided, search immediately after crawling
  if (searchQuery) {
    displaySearchResults(pages, searchQuery);
  }
}

main();
