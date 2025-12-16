import { searchPages, crawlPage } from "./src/crawl";
import type { SearchIndex } from "./src/crawl";

async function loadReportData(): Promise<SearchIndex | null> {
  const reportFile = Bun.file("report.json");
  if (!(await reportFile.exists())) {
    return null;
  }
  return await reportFile.json();
}

async function startServer() {
  const port = 3000;

  // Load report data once at startup
  let cachedReport: SearchIndex | null = null;

  Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // API search endpoint
      if (url.pathname === "/api/search" && req.method === "GET") {
        const query = url.searchParams.get("q");

        if (!query) {
          return new Response(
            JSON.stringify({ error: "Query parameter 'q' is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Load report data if not cached
        if (!cachedReport) {
          cachedReport = await loadReportData();
        }

        if (!cachedReport) {
          return new Response(
            JSON.stringify({
              error: "No report data found. Please run the crawler first.",
            }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        const results = searchPages(cachedReport, query);
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // API crawl endpoint
      if (url.pathname === "/api/crawl" && req.method === "POST") {
        try {
          const body = await req.json();
          const { url: crawlUrl, limit = 100 } = body as {
            url?: string;
            limit?: number;
          };

          if (!crawlUrl) {
            return new Response(JSON.stringify({ error: "URL is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          console.log(`Starting crawl of ${crawlUrl} with limit ${limit}`);
          const startTime = performance.now();
          const pages = await crawlPage(crawlUrl, crawlUrl, {}, limit);
          const endTime = performance.now();
          const timeTaken = (endTime - startTime) / 1000;

          // Save the crawled data
          await Bun.write("report.json", JSON.stringify(pages, null, 2));

          // Update the cached report
          cachedReport = pages;

          console.log(
            `Crawl complete: ${
              Object.keys(pages).length
            } pages in ${timeTaken.toFixed(2)}s`
          );

          return new Response(
            JSON.stringify({
              success: true,
              pagesCount: Object.keys(pages).length,
              timeTaken: timeTaken.toFixed(2),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("Crawl error:", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`🚀 Server running at http://localhost:${port}`);
}

startServer();
