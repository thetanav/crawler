import { searchPages } from "./src/crawl";
import type { SearchIndex } from "./src/crawl";

async function main() {
  const args = Bun.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: bun search.ts <search query>");
    console.error("Example: bun search.ts 'hello world'");
    return;
  }

  const query = args.join(" ");

  // Load the crawled data
  const reportFile = Bun.file("report.json");
  if (!(await reportFile.exists())) {
    console.error("No report.json found. Please run the crawler first.");
    return;
  }

  const pages: SearchIndex = await reportFile.json();
  const results = searchPages(pages, query);

  if (results.length === 0) {
    console.log(`No results found for "${query}"`);
    return;
  }

  // Show top 10 most relevant results
  const topResults = results.slice(0, 10);
  const totalResults = results.length;

  console.log(`\n🔍 Search results for "${query}":\n`);
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

main();
