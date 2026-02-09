import { Hono } from "hono";
import { cors } from "hono/cors";
import { crawlPage } from "./crawl";
import { prisma } from "../lib/prisma";

const app = new Hono();
const SEARCH_PAGE_SIZE = 10;
const DEFAULT_CRAWL_LIMIT = 100;

// CORS middleware for port 5173
app.use("*", cors({ origin: "http://localhost:5173" }));

// Search endpoint
// TODO: add pagination for all queries
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const pageParam = c.req.query("p");
  const page = Number.parseInt(pageParam ?? "1", 10);

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }
  if (!Number.isFinite(page) || page < 1) {
    return c.json({ error: "Query parameter 'p' must be a positive integer" }, 400);
  }

  const results = await prisma.crawledPage.findMany({
    skip: (page - 1) * SEARCH_PAGE_SIZE,
    take: SEARCH_PAGE_SIZE,
    where: {
      title: {
        contains: query,
      },
    },
  });

  return c.json(results);
});

// Crawl endpoint
app.post("/crawl", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { url: crawlUrl, limit: crawlLimit = DEFAULT_CRAWL_LIMIT } = body as {
    url?: string;
    limit?: number;
  };

  if (!crawlUrl || !crawlUrl.startsWith("http")) {
    return c.json({ error: "A valid URL is required" }, 400);
  }
  if (!Number.isFinite(crawlLimit) || crawlLimit < 1) {
    return c.json({ error: "Limit must be a positive integer" }, 400);
  }

  try {
    const crawled = await prisma.crawledSite.findUnique({
      where: {
        url: crawlUrl,
      },
    });

    if (crawled) return c.json({ error: "URL already crawled" }, 400);

    console.log(`> Starting crawl of ${crawlUrl} with limit ${crawlLimit}`);
    await prisma.crawledSite.create({
      data: {
        url: crawlUrl,
      },
    });
    const startTime = performance.now();
    const pages = await crawlPage(crawlUrl, crawlUrl, {}, crawlLimit);
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000;

    // Save the crawled data
    await Bun.write("report.json", JSON.stringify(pages, null, 2));
    // remove it in future

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

app.get("/done", async (c) => {
  const done = await prisma.crawledSite.findMany();
  return c.json({ data: done });
});

export default app;
