import { Hono } from "hono";
import { cors } from "hono/cors";
import { searchPages, crawlPage } from "./src/crawl";
import type { SearchIndex } from "./src/crawl";

async function loadReportData(): Promise<SearchIndex | null> {
  const reportFile = Bun.file("report.json");
  if (!(await reportFile.exists())) {
    return null;
  }
  return await reportFile.json();
}

const app = new Hono();

// Load report data once at startup
let cachedReport: SearchIndex | null = null;

// CORS middleware for port 5173
app.use("*", cors({ origin: "http://localhost:5173" }));

// Search endpoint
app.get("/search", async (c) => {
  const query = c.req.query("q");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  // Load report data if not cached
  if (!cachedReport) {
    cachedReport = await loadReportData();
  }

  if (!cachedReport) {
    return c.json(
      { error: "No report data found. Please run the crawler first." },
      404
    );
  }

  const results = searchPages(cachedReport, query);
  console.log(results);
  return c.json(results);
});

// Crawl endpoint
app.post("/crawl", async (c) => {
  try {
    const body = await c.req.json();
    const { url: crawlUrl, limit = 100 } = body as {
      url?: string;
      limit?: number;
    };

    if (!crawlUrl || !crawlUrl.startsWith("http")) {
      return c.json({ error: "URL is required" }, 400);
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

    return c.json({
      success: true,
      pagesCount: Object.keys(pages).length,
      timeTaken: timeTaken.toFixed(2),
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default app;
